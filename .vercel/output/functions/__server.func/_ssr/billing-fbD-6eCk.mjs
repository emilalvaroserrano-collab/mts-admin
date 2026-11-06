import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { v as getShopAccount } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
import { t as Locked } from "./customer-portal-DM12X9hv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-fbD-6eCk.js
var import_jsx_runtime = require_jsx_runtime();
function BillingPage() {
	const token = useShopToken();
	const session = usePortalSession();
	const account = useQuery({
		queryKey: ["shop-account", token],
		queryFn: () => getShopAccount({ data: token }),
		enabled: Boolean(token)
	});
	if (session.data && !session.data.access.canShop && !session.data.access.canDefer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locked, {
		title: "No billing on this account",
		body: "Invoices and shop payments are turned on by an admin."
	});
	const orders = account.data?.orders ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Billing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: session.data?.access.canDefer ? "This account may be invoiced. An unpaid invoice is not treated as paid." : "This account pays at checkout. Invoice purchasing is not approved."
			}),
			orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-semibold",
					children: order.number
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [
						order.paymentMethod || "unpaid",
						" · ",
						order.status
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: money(order.totalCents)
				})]
			}, order.id)),
			account.data && orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No charges yet."
			}) : null
		]
	});
}
//#endregion
export { BillingPage as component };
