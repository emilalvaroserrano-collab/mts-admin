import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-50WTgpEd.js
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
	if (method === "card") return "Card";
	if (method === "invoice") return "Invoice";
	if (method === "purchase_order") return "Purchase order";
	if (method === "alternative") return "Alternative Payments";
	return method || "—";
}
function storeSlug(brand) {
	return brand.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "store";
}
//#endregion
export { stamp as a, paymentLabel as i, day as n, storeSlug as o, money as r, ago as t };
