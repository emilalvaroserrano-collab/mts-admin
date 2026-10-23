import { t as ticketSearch } from "./_ssr/ticket-search-CEf18BGL.mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { n as getDashboard } from "./_ssr/api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, p as StatusBadge, u as PageHeader } from "./_ssr/ui-V14V10_q.mjs";
import { r as money, t as ago } from "./_ssr/format-BF_Jz8jj.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-_xwfoyFR.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const query = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const data = query.data;
	const openWork = data.tickets.incoming + data.tickets.open;
	const stats = [
		{
			label: "Companies",
			value: data.orgCount,
			to: "/organizations"
		},
		{
			label: "People",
			value: data.userCount,
			to: "/users"
		},
		{
			label: "Open tickets",
			value: openWork,
			hint: `${data.tickets.incoming} new`
		},
		{
			label: "Pending",
			value: data.tickets.pending,
			hint: `${data.invoiceCount} need invoice`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Today",
			title: "Desk overview",
			description: "Companies, the Zendesk queue, and equipment orders in one place.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tickets",
				search: ticketSearch(),
				className: "inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg",
				children: "Open tickets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/orders",
				className: "inline-flex h-11 items-center rounded-md border border-line bg-surface px-4 text-sm font-medium",
				children: "Review orders"
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: stat.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-3xl tabular-nums",
						children: stat.value
					}),
					stat.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: stat.hint
					}) : null,
					"to" in stat && stat.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: stat.to,
						className: "mt-3 inline-block text-sm text-accent",
						children: "View"
					}) : null
				]
			}, stat.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-2 sm:grid-cols-4",
			children: [
				["New", data.tickets.incoming],
				["Open", data.tickets.open],
				["Pending", data.tickets.pending],
				["Solved", data.tickets.solved]
			].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/tickets",
				search: ticketSearch({ status: label === "New" ? "new" : label === "Solved" ? "solved" : label.toLowerCase() }),
				className: "rounded-xl border border-line bg-surface px-3 py-3 text-sm hover:bg-surface-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block font-mono text-xl tabular-nums",
					children: value
				})]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Recent tickets"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tickets",
					search: ticketSearch({ status: "all" }),
					className: "text-sm text-accent",
					children: "All tickets"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-line",
				children: data.recentTickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tickets/$ticketId",
							params: { ticketId: String(ticket.id) },
							className: "font-medium hover:underline",
							children: ticket.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								ticket.zendeskId ? `#${ticket.zendeskId}` : `P-${ticket.id}`,
								" · ",
								ticket.organizationName || "No company",
								" · ",
								ago(ticket.updatedAt)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status })]
				}, ticket.id))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Orders in motion"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					className: "text-sm text-accent",
					children: "All orders"
				})]
			}), data.pendingOrders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No orders waiting."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-line",
				children: data.pendingOrders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/orders/$orderId",
							params: { orderId: String(order.id) },
							className: "font-medium hover:underline",
							children: order.number
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: order.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							order.organizationName,
							" · ",
							money(order.totalCents)
						]
					})]
				}, order.id))
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Recent activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 divide-y divide-line",
				children: [data.activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3 text-sm text-muted",
					children: "No changes yet."
				}) : null, data.activity.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: ago(entry.createdAt)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: entry.actorName || "Desk"
							}),
							" ",
							entry.action.toLowerCase(),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: entry.target
							}),
							entry.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [" — ", entry.detail]
							}) : null
						]
					})]
				}, entry.id))]
			})]
		})
	] });
}
//#endregion
export { DashboardPage as component };
