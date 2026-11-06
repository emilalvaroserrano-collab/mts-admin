import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./_ssr/format-DhyAHcG6.mjs";
import { v as getShopAccount } from "./_ssr/api-CEXWu3z6.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as Route$11 } from "./_ssr/router-DN3-t_kz.mjs";
import { n as useShopToken } from "./_ssr/shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-BZy5-MCA.js
var import_jsx_runtime = require_jsx_runtime();
function OrderDetail() {
	const { orderId } = Route$11.useParams();
	const token = useShopToken();
	const account = useQuery({
		queryKey: ["shop-account", token],
		queryFn: () => getShopAccount({ data: token }),
		enabled: Boolean(token)
	});
	const order = account.data?.orders.find((item) => item.id === Number(orderId));
	if (account.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Opening the order…"
	});
	if (!order) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "That order is not on this account."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/portal/orders",
				className: "text-sm text-muted",
				children: "All orders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: order.number
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					order.status,
					" · Shipment ",
					order.shipmentStatus,
					" · Payment ",
					order.paymentMethod || "unpaid"
				]
			}),
			order.trackingNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm",
				children: [
					"Tracking ",
					order.trackingCarrier || "carrier",
					" ",
					order.trackingNumber
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No tracking number yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						item.quantity,
						" × ",
						item.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: money(item.unitPriceCents * item.quantity)
					})]
				}, item.sku))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-semibold",
				children: ["Total ", money(order.totalCents)]
			}),
			order.paymentMethod === "pay_later" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "This order is invoiced. It is not marked paid."
			}) : null
		]
	});
}
//#endregion
export { OrderDetail as component };
