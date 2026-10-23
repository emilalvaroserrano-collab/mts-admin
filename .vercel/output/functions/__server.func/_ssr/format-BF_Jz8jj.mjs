import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-BF_Jz8jj.js
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
//#endregion
export { stamp as i, day as n, money as r, ago as t };
