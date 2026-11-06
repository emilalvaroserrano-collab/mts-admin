import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { P as listPortalServices, b as getStorefront, v as getShopAccount } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-YC0RHCg3.js
var import_jsx_runtime = require_jsx_runtime();
function PortalHome() {
	const token = useShopToken();
	const session = usePortalSession();
	const account = useQuery({
		queryKey: ["shop-account", token],
		queryFn: () => getShopAccount({ data: token }),
		enabled: Boolean(token)
	});
	const requests = useQuery({
		queryKey: ["portal-services", token],
		queryFn: () => listPortalServices({ data: token }),
		enabled: Boolean(token)
	});
	const shop = useQuery({
		queryKey: ["storefront"],
		queryFn: () => getStorefront()
	});
	if (!session.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Opening your portal…"
	});
	const { customer, tickets } = session.data;
	const open = tickets.filter((ticket) => ticket.status !== "solved" && ticket.status !== "closed").length;
	const orders = account.data?.orders ?? [];
	const pendingOrders = orders.filter((order) => order.status !== "fulfilled" && order.status !== "cancelled").length;
	const pendingRequests = (requests.data ?? []).filter((item) => item.status === "requested" || item.status === "quoted").length;
	const activeServices = (requests.data ?? []).filter((item) => item.status === "approved" || item.status === "provisioned").length;
	const unpaid = orders.filter((order) => order.paymentMethod === "pay_later" || order.paymentMethod === "unpaid").length;
	const hour = (/* @__PURE__ */ new Date()).getHours();
	const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const first = customer.name.split(" ")[0] || "there";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-5xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: [
						hello,
						", ",
						first,
						"."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Welcome to the MTS User Portal",
						session.data.organization || session.data.business ? ` · ${session.data.organization || session.data.business}` : "",
						"."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Open tickets",
						value: open
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Active services",
						value: activeServices
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pending orders",
						value: pendingOrders
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Open requests",
						value: pendingRequests
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Unpaid",
						value: unpaid
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/portal/tickets",
						className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold",
						children: "Create support ticket"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/portal/shop",
						className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold",
						children: "Order equipment or a service"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/portal/orders",
						className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold",
						children: "View orders"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Equipment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/portal/shop",
						className: "text-sm font-semibold text-accent",
						children: "Open orders"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: (shop.data?.products ?? []).slice(0, 4).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `/store/${shop.data?.slug || "manage-tech-service"}/${product.sku}`,
						className: "overflow-hidden rounded-xl border border-line bg-surface",
						children: [product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: product.imageUrl,
							alt: "",
							className: "aspect-square w-full bg-surface-2 object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square bg-surface-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: product.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: money(product.priceCents)
							})]
						})]
					}, product.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Recent tickets"
						}),
						tickets.slice(0, 4).map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/portal/tickets/$ticketId",
							params: { ticketId: String(ticket.id) },
							className: "grid gap-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-semibold",
								children: ticket.subject
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									ticket.status,
									" · ",
									ticket.category
								]
							})]
						}, ticket.id)),
						tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No tickets yet."
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Orders"
						}),
						orders.slice(0, 4).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/portal/orders/$orderId",
							params: { orderId: String(order.id) },
							className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-semibold",
								children: order.number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									order.status,
									" · ",
									order.paymentMethod || "unpaid"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: money(order.totalCents)
							})]
						}, order.id)),
						orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No orders yet."
						}) : null
					]
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-line bg-surface px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { PortalHome as component };
