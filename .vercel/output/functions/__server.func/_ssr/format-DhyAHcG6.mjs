import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-DhyAHcG6.js
function money(cents) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(cents / 100);
}
function ago(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return formatDistanceToNow(d, { addSuffix: true });
}
function day(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return format(d, "MMM d, yyyy");
}
function stamp(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return format(d, "MMM d, yyyy · h:mm a");
}
function paymentLabel(method) {
	if (method === "card") return "Debit or credit card";
	if (method === "pay_later") return "Order now, pay later";
	if (method === "invoice") return "Invoice";
	if (method === "purchase_order") return "Purchase order";
	if (method === "alternative") return "Alternative Payments";
	return method || "—";
}
function storeSlug(brand) {
	return brand.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "store";
}
var PAID = /* @__PURE__ */ new Set([
	"paid",
	"succeeded",
	"completed",
	"success",
	"captured"
]);
/** Shopify-style payment badge from the order's current payment state. */
function shopifyPayment(order) {
	const pay = order.paymentStatus.toLowerCase();
	if (PAID.has(pay)) return {
		label: "Paid",
		tone: "good"
	};
	if (pay === "refunded") return {
		label: "Refunded",
		tone: "neutral"
	};
	if (pay === "partially_paid" || pay === "partial") return {
		label: "Partially paid",
		tone: "warn"
	};
	if (pay === "authorized") return {
		label: "Authorized",
		tone: "info"
	};
	if (order.status === "cancelled") return {
		label: "Voided",
		tone: "neutral"
	};
	if (pay === "pending" || pay === "upcoming" || pay === "processing") return {
		label: "Payment pending",
		tone: "warn"
	};
	if (order.paymentMethod === "invoice" || order.paymentMethod === "purchase_order") return {
		label: "Payment pending",
		tone: "warn"
	};
	return {
		label: "Unpaid",
		tone: "warn"
	};
}
/** Shopify-style fulfillment badge. Shipped or delivered counts as fulfilled. */
function shopifyFulfillment(order) {
	if (order.status === "cancelled") return {
		label: "Canceled",
		tone: "neutral"
	};
	const ship = order.shipmentStatus || "unfulfilled";
	if (ship === "delivered" || ship === "shipped" || ship === "out_for_delivery" || order.status === "fulfilled") return {
		label: "Fulfilled",
		tone: "good"
	};
	if (order.status === "processing") return {
		label: "Unfulfilled",
		tone: "warn"
	};
	return {
		label: "Unfulfilled",
		tone: "warn"
	};
}
/** Shopify delivery status. Hidden until the parcel has a tracking event. */
function shopifyDelivery(order) {
	if (order.status === "cancelled") return null;
	if (order.shipmentStatus === "delivered") return {
		label: "Delivered",
		tone: "good"
	};
	if (order.shipmentStatus === "out_for_delivery") return {
		label: "Out for delivery",
		tone: "info"
	};
	if (order.shipmentStatus === "shipped") return {
		label: "In transit",
		tone: "info"
	};
	if (order.trackingNumber) return {
		label: "Tracking added",
		tone: "info"
	};
	return null;
}
function orderCustomer(order) {
	return order.shipName || order.customerName || "No customer";
}
function orderEmail(order) {
	return order.shipEmail || order.customerEmail;
}
//#endregion
export { orderEmail as a, shopifyFulfillment as c, storeSlug as d, orderCustomer as i, shopifyPayment as l, day as n, paymentLabel as o, money as r, shopifyDelivery as s, ago as t, stamp as u };
