import { format, formatDistanceToNow } from "date-fns";

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ago(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function day(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "MMM d, yyyy");
}

export function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "MMM d, yyyy · h:mm a");
}

export function paymentLabel(method: string) {
  if (method === "card") return "Card";
  if (method === "invoice") return "Invoice";
  if (method === "purchase_order") return "Purchase order";
  if (method === "alternative") return "Alternative Payments";
  return method || "—";
}

export function storeSlug(brand: string) {
  const slug = brand
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "store";
}
