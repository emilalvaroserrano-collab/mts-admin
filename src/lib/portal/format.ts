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

type OrderState = {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shipmentStatus: string;
  trackingNumber: string;
};

export type ShopTone = "neutral" | "good" | "warn" | "bad" | "info" | "pine";

const PAID = new Set(["paid", "succeeded", "completed", "success", "captured"]);

/** Shopify-style payment badge from the order's current payment state. */
export function shopifyPayment(order: OrderState): { label: string; tone: ShopTone } {
  const pay = order.paymentStatus.toLowerCase();
  if (PAID.has(pay)) return { label: "Paid", tone: "good" };
  if (pay === "refunded") return { label: "Refunded", tone: "neutral" };
  if (pay === "partially_paid" || pay === "partial") return { label: "Partially paid", tone: "warn" };
  if (pay === "authorized") return { label: "Authorized", tone: "info" };
  if (order.status === "cancelled") return { label: "Voided", tone: "neutral" };
  if (pay === "pending" || pay === "upcoming" || pay === "processing") return { label: "Payment pending", tone: "warn" };
  if (order.paymentMethod === "invoice" || order.paymentMethod === "purchase_order") return { label: "Payment pending", tone: "warn" };
  return { label: "Unpaid", tone: "warn" };
}

/** Shopify-style fulfillment badge. Shipped or delivered counts as fulfilled. */
export function shopifyFulfillment(order: OrderState): { label: string; tone: ShopTone } {
  if (order.status === "cancelled") return { label: "Canceled", tone: "neutral" };
  const ship = order.shipmentStatus || "unfulfilled";
  if (ship === "delivered" || ship === "shipped" || ship === "out_for_delivery" || order.status === "fulfilled") {
    return { label: "Fulfilled", tone: "good" };
  }
  if (order.status === "processing") return { label: "Unfulfilled", tone: "warn" };
  return { label: "Unfulfilled", tone: "warn" };
}

/** Shopify delivery status. Hidden until the parcel has a tracking event. */
export function shopifyDelivery(order: OrderState): { label: string; tone: ShopTone } | null {
  if (order.status === "cancelled") return null;
  if (order.shipmentStatus === "delivered") return { label: "Delivered", tone: "good" };
  if (order.shipmentStatus === "out_for_delivery") return { label: "Out for delivery", tone: "info" };
  if (order.shipmentStatus === "shipped") return { label: "In transit", tone: "info" };
  if (order.trackingNumber) return { label: "Tracking added", tone: "info" };
  return null;
}

export function orderCustomer(order: { customerName: string; shipName: string }) {
  return order.shipName || order.customerName || "No customer";
}

export function orderEmail(order: { customerEmail: string; shipEmail: string }) {
  return order.shipEmail || order.customerEmail;
}
