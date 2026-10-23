import type { Sql } from "@/lib/db";

export const ALTERNATIVE_PORTAL = "https://go.alternativepayments.io";
const LIVE_API = "https://public-api.alternativepayments.io";
const SANDBOX_API = "https://public-api.demo.alternativepayments.io";

export type AlternativeMode = "sandbox" | "live";

export type AlternativeCreds = {
  clientId: string;
  clientSecret: string;
  fromEnv: boolean;
  mode: AlternativeMode;
};

type TokenCache = { token: string; expiresAt: number; key: string };
let tokenCache: TokenCache | null = null;

export function alternativeMode(value: string | undefined): AlternativeMode {
  const raw = (value || "").trim().toLowerCase();
  return raw === "live" || raw === "production" ? "live" : "sandbox";
}

export function alternativeBase(mode: AlternativeMode) {
  const override = (process.env.ALTERNATIVE_API_BASE || "").trim().replace(/\/+$/, "");
  if (override) return override;
  return mode === "sandbox" ? SANDBOX_API : LIVE_API;
}

export function envAlternative(): AlternativeCreds {
  const clientId = (process.env.ALTERNATIVE_CLIENT_ID || process.env.ALTERNATIVE_PAYMENTS_CLIENT_ID || "").trim();
  const clientSecret = (process.env.ALTERNATIVE_CLIENT_SECRET || process.env.ALTERNATIVE_PAYMENTS_CLIENT_SECRET || "").trim();
  return {
    clientId,
    clientSecret,
    fromEnv: Boolean(clientId && clientSecret),
    mode: alternativeMode(process.env.ALTERNATIVE_ENV || process.env.ALTERNATIVE_ENVIRONMENT || "sandbox"),
  };
}

function apiError(text: string, fallback: string) {
  try {
    const parsed = JSON.parse(text) as { message?: string; error_description?: string; error?: string };
    return (parsed.error_description || parsed.message || parsed.error || fallback).slice(0, 180);
  } catch {
    return text ? text.slice(0, 180) : fallback;
  }
}

export async function alternativeToken(creds: AlternativeCreds) {
  const key = `${creds.mode}:${creds.clientId}`;
  if (tokenCache && tokenCache.key === key && tokenCache.expiresAt > Date.now() + 15_000) return tokenCache.token;
  const response = await fetch(`${alternativeBase(creds.mode)}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`, "utf8").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(apiError(text, "Alternative Payments rejected the API key."));
  const body = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Alternative Payments did not return a token.");
  tokenCache = {
    token: body.access_token,
    key,
    expiresAt: Date.now() + Math.max(60, body.expires_in || 3600) * 1000,
  };
  return body.access_token;
}

async function ap<T>(creds: AlternativeCreds, path: string, init?: RequestInit): Promise<T> {
  const token = await alternativeToken(creds);
  const response = await fetch(`${alternativeBase(creds.mode)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(apiError(text, `Alternative Payments ${path} failed.`));
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function probeAlternative(creds: AlternativeCreds) {
  await ap(creds, "/customers?limit=1");
  return { mode: creds.mode, base: alternativeBase(creds.mode) };
}

type Customer = { id?: string; email?: string; external_id?: string };
type Invoice = { id?: string; status?: string; invoice_number?: string };
type Link = { url?: string };
type Requested = { id?: string; url?: string; status?: string };

async function ensureCustomer(
  creds: AlternativeCreds,
  input: { externalId: string; name: string; email: string; existingId: string },
) {
  if (input.existingId) {
    try {
      const found = await ap<Customer>(creds, `/customers/${encodeURIComponent(input.existingId)}`);
      if (found.id) return found.id;
    } catch {
      /* create a new customer if the stored id is from another environment */
    }
  }
  const created = await ap<Customer>(creds, "/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      external_id: input.externalId,
    }),
  });
  if (!created.id) throw new Error("Alternative Payments did not return a customer.");
  return created.id;
}

export async function createAlternativeCheckout(
  creds: AlternativeCreds,
  input: {
    reference: string;
    returnUrl: string;
    externalId: string;
    name: string;
    email: string;
    existingCustomerId: string;
    dueDate: string;
    lines: { description: string; amount: number; quantity: number }[];
  },
) {
  const redirect = /^https:\/\/[^\s]+$/i.test(input.returnUrl) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(input.returnUrl)
    ? input.returnUrl
    : ALTERNATIVE_PORTAL;
  if (input.email) {
    try {
      const customerId = await ensureCustomer(creds, {
        externalId: input.externalId,
        name: input.name || "Customer",
        email: input.email,
        existingId: input.existingCustomerId,
      });
      const invoice = await ap<Invoice>(creds, "/invoices", {
        method: "POST",
        body: JSON.stringify({
          customer_id: customerId,
          currency: "USD",
          due_date: input.dueDate,
          line_items: input.lines.map((line) => ({
            description: line.description,
            amount: line.amount,
            quantity: line.quantity,
          })),
        }),
      });
      if (!invoice.id) throw new Error("Alternative Payments did not return an invoice.");
      const link = await ap<Link>(creds, `/invoices/${encodeURIComponent(invoice.id)}/payment-link`);
      return {
        url: link.url || ALTERNATIVE_PORTAL,
        customerId,
        invoiceId: invoice.id,
        requestId: "",
        paymentStatus: (invoice.status || "UPCOMING").toLowerCase(),
      };
    } catch {
      /* fall through to a one-off payment request */
    }
  }
  const amount = input.lines.reduce((sum, line) => sum + line.amount * line.quantity, 0).toFixed(2);
  const requested = await ap<Requested>(creds, "/payments/request", {
    method: "POST",
    body: JSON.stringify({
      amount,
      currency: "USD",
      redirect_url: redirect,
      reference_id: input.reference,
    }),
  });
  return {
    url: requested.url || ALTERNATIVE_PORTAL,
    customerId: input.existingCustomerId,
    invoiceId: "",
    requestId: requested.id || "",
    paymentStatus: (requested.status || "pending").toLowerCase(),
  };
}

export async function refreshAlternativePayment(
  creds: AlternativeCreds,
  input: { invoiceId: string; requestId: string },
) {
  if (input.invoiceId) {
    const invoice = await ap<Invoice>(creds, `/invoices/${encodeURIComponent(input.invoiceId)}`);
    const link = await ap<Link>(creds, `/invoices/${encodeURIComponent(input.invoiceId)}/payment-link`).catch(() => ({ url: "" }));
    return { status: (invoice.status || "").toLowerCase(), url: link.url || "" };
  }
  if (input.requestId) {
    const requested = await ap<Requested>(creds, `/payments/request/${encodeURIComponent(input.requestId)}`);
    return { status: (requested.status || "").toLowerCase(), url: requested.url || "" };
  }
  return { status: "", url: "" };
}

export async function loadAlternativeCreds(sql: Sql): Promise<AlternativeCreds | null> {
  const env = envAlternative();
  if (env.fromEnv) return env;
  const rows = await sql<{ alternative_client_id: string; alternative_client_secret: string; alternative_environment: string }>`
    select alternative_client_id, alternative_client_secret, alternative_environment from payment_settings where id = 1
  `;
  const row = rows[0];
  const clientId = row?.alternative_client_id?.trim() || "";
  const clientSecret = row?.alternative_client_secret?.trim() || "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, fromEnv: false, mode: alternativeMode(row?.alternative_environment) };
}
