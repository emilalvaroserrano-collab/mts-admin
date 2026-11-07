export type CsrAccess = {
  canTicket: boolean;
  canShop: boolean;
  canPurchase: boolean;
  canPayNow: boolean;
  canOrderIt: boolean;
  canOrderPhone: boolean;
  canDefer: boolean;
};

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

export function needsConfirmation(method: string, resource: string) {
  if (method === "GET" || method === "OPTIONS") return false;
  return (
    !/^(confirmations|conversations|push|notices|verify)(\/|$)/.test(resource) &&
    !/^tickets\/\d+\/refresh$/.test(resource)
  );
}

export function permitted(
  access: CsrAccess,
  method: string,
  resource: string,
  body: Record<string, unknown>,
) {
  if (/^(tickets|complaints)(\/|$)/.test(resource)) return access.canTicket;
  if (/^(orders|shop|billing|ledger)(\/|$)/.test(resource)) {
    if (!access.canShop && !access.canDefer) return false;
    if (method === "POST" && resource === "orders")
      return (
        access.canPurchase &&
        (body.payLater === true || body.paymentMethod === "pay_later"
          ? access.canDefer
          : access.canPayNow)
      );
    if (resource.endsWith("/pay")) return access.canPayNow;
  }
  if (resource === "services" && method === "POST") {
    const phone = /^(voip|fax)/.test(String(body.offering || ""));
    return phone ? access.canOrderPhone : access.canOrderIt;
  }
  if (/^(services\/quote|quotes)(\/|$)/.test(resource) && method !== "GET")
    return access.canOrderIt || access.canOrderPhone;
  if (resource === "orders" && method === "POST" && body.payLater === true) return access.canDefer;
  return true;
}

export const SERVICE_TRANSITIONS: Record<string, string[]> = {
  requested: ["approved", "rejected", "cancelled"],
  approved: ["provider_pending", "scheduled", "cancelled"],
  provider_pending: ["scheduled", "active", "failed", "cancelled"],
  scheduled: ["active", "failed", "cancelled"],
  active: ["suspended", "cancelled"],
  suspended: ["active", "cancelled"],
  failed: ["provider_pending", "cancelled"],
  quoted: ["accepted", "rejected"],
  accepted: ["approved", "cancelled"],
  rejected: [],
  cancelled: [],
};
export function canTransition(from: string, to: string) {
  return SERVICE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function inQuietHours(date: Date, timezone: string, start: number, end: number) {
  if (start === end) return false;
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}
