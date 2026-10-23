import { getRequest } from "@tanstack/react-start/server";
import { placeFromTimezone, type VisitorPlace } from "./visitor-geo";

const cache = new Map<string, VisitorPlace>();

function clientIp() {
  let request: Request | undefined;
  try {
    request = getRequest();
  } catch {
    return "";
  }
  if (!request) return "";
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  const ip = forwarded.split(",")[0]?.trim() || "";
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) {
    return "";
  }
  return ip;
}

async function placeFromIp(ip: string): Promise<VisitorPlace | null> {
  const cached = cache.get(ip);
  if (cached) return cached;
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
    if (!body.success || typeof body.latitude !== "number" || typeof body.longitude !== "number") return null;
    const place: VisitorPlace = {
      city: body.city || "",
      region: body.region || "",
      country: body.country || "",
      latitude: body.latitude,
      longitude: body.longitude,
    };
    cache.set(ip, place);
    return place;
  } catch {
    return null;
  }
}

export async function locateVisitor(timeZone: string): Promise<VisitorPlace> {
  const ip = clientIp();
  if (ip) {
    const place = await placeFromIp(ip);
    if (place) return place;
  }
  return placeFromTimezone(timeZone);
}
