import { isUpsAwb, normalizeAwb, upsCheckDigitOk, upsTrackUrl } from "./awb";

export type AwbLookup = {
  awb: string;
  carrier: string;
  valid: boolean;
  configured: boolean;
  shipmentStatus: string;
  detail: string;
  url: string;
};

type UpsToken = { token: string; expiresAt: number };
const cache = globalThis as typeof globalThis & { __upsToken?: UpsToken };

function upsHost() {
  return process.env.UPS_ENV === "sandbox" ? "https://wwwcie.ups.com" : "https://onlinetools.ups.com";
}

function shipmentFromUps(type: string, description: string) {
  const text = `${type} ${description}`.toLowerCase();
  if (text.includes("delivered") || type === "D") return "delivered";
  if (text.includes("out for delivery")) return "out_for_delivery";
  if (type === "I" || type === "P" || type === "M" || text.includes("transit") || text.includes("pickup")) return "shipped";
  return "";
}

async function upsToken() {
  const id = (process.env.UPS_CLIENT_ID || "").trim();
  const secret = (process.env.UPS_CLIENT_SECRET || "").trim();
  if (!id || !secret) return "";
  const cached = cache.__upsToken;
  if (cached && cached.expiresAt > Date.now() + 15_000) return cached.token;
  const response = await fetch(`${upsHost()}/security/v1/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`, "utf8").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`UPS auth returned ${response.status}. ${text.slice(0, 160)}`);
  const body = JSON.parse(text) as { access_token?: string; expires_in?: string };
  if (!body.access_token) throw new Error("UPS did not return an access token.");
  const ttl = Number(body.expires_in);
  cache.__upsToken = {
    token: body.access_token,
    expiresAt: Date.now() + (Number.isFinite(ttl) && ttl > 60 ? ttl * 1000 : 50 * 60 * 1000),
  };
  return body.access_token;
}

export async function lookupAwb(raw: string): Promise<AwbLookup> {
  const awb = normalizeAwb(raw);
  const ups = isUpsAwb(awb);
  const valid = ups ? upsCheckDigitOk(awb) : awb.length >= 8;
  const base: AwbLookup = {
    awb,
    carrier: ups ? "UPS" : "",
    valid,
    configured: Boolean((process.env.UPS_CLIENT_ID || "").trim() && (process.env.UPS_CLIENT_SECRET || "").trim()),
    shipmentStatus: "",
    detail: ups
      ? valid
        ? "UPS air waybill."
        : "That 1Z number failed the UPS check digit. Confirm the label before shipping."
      : awb
        ? "Saved as a tracking number. It is not a UPS 1Z air waybill."
        : "Scan or type an air waybill.",
    url: ups ? upsTrackUrl(awb) : "",
  };
  if (!ups || !valid || !base.configured) return base;
  const token = await upsToken();
  const response = await fetch(`${upsHost()}/api/track/v1/details/${encodeURIComponent(awb)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      transId: `mts-${Date.now()}`,
      transactionSrc: "manage-tech-service",
      Accept: "application/json",
    },
  });
  const text = await response.text();
  if (!response.ok) {
    return { ...base, detail: `UPS tracking returned ${response.status}. The number is still saved.` };
  }
  const body = JSON.parse(text) as {
    trackResponse?: {
      shipment?: {
        package?: {
          currentStatus?: { description?: string; code?: string };
          activity?: { status?: { description?: string; type?: string } }[];
        }[];
      }[];
    };
  };
  const parcel = body.trackResponse?.shipment?.[0]?.package?.[0];
  const activity = parcel?.activity?.[0]?.status;
  const description = parcel?.currentStatus?.description || activity?.description || "UPS accepted the air waybill.";
  const type = activity?.type || "";
  return {
    ...base,
    detail: description,
    shipmentStatus: shipmentFromUps(type, description),
  };
}
