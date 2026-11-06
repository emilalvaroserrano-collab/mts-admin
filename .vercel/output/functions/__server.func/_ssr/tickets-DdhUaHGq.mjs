import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-DhyAHcG6.mjs";
import { R as listTickets } from "./api-CEXWu3z6.mjs";
import { a as ErrorNote, c as Loading, f as Select, g as ViewSwitch, p as StatusBadge, u as PageHeader, v as useViewMode } from "./ui-kHtDn7EO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as Route$18 } from "./router-DN3-t_kz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-DdhUaHGq.js
var import_jsx_runtime = require_jsx_runtime();
var VIEWS = [
	"",
	"Pending Projects",
	"Pending Orders",
	"Need Invoice"
];
function TicketsPage() {
	const search = Route$18.useSearch();
	const navigate = Route$18.useNavigate();
	const query = useQuery({
		queryKey: ["tickets", search],
		queryFn: () => listTickets({ data: {
			q: search.q,
			status: search.status,
			orgId: search.org ? Number(search.org) : null,
			category: search.category,
			assignee: search.assignee,
			view: search.view
		} })
	});
	const [layout, setLayout] = useViewMode("mts-tickets-view");
	function setSearch(partial) {
		navigate({ search: (prev) => ({
			...prev,
			...partial
		}) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Zendesk",
				title: "Tickets",
				description: "Unresolved work, saved views, and the conversation stay tied to Zendesk when the account is connected."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-center gap-2 md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap justify-center gap-2 md:justify-start",
					children: VIEWS.map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSearch({ view }),
						className: search.view === view ? "h-9 rounded-md bg-accent px-3 text-sm text-accent-fg" : "h-9 rounded-md border border-line bg-surface px-3 text-sm",
						children: view || "All views"
					}, view || "all-views"))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewSwitch, {
					mode: layout,
					onChange: setLayout
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: search.status,
						onChange: (event) => setSearch({ status: event.target.value }),
						"aria-label": "Status",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "unresolved",
								children: "Unresolved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "new",
								children: "New"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "open",
								children: "Open"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "pending",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "solved",
								children: "Solved and closed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Every status"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: search.org,
						onChange: (event) => setSearch({ org: event.target.value }),
						"aria-label": "Company",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All companies"
						}), query.data?.orgs.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: org.id,
							children: org.name
						}, org.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: search.category,
						onChange: (event) => setSearch({ category: event.target.value }),
						"aria-label": "Category",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All categories"
						}), query.data?.categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: category }, category))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: search.assignee,
						onChange: (event) => setSearch({ assignee: event.target.value }),
						"aria-label": "Assignee",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Anyone"
						}), query.data?.assignees.map((assignee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: assignee }, assignee))]
					})
				]
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {}) : null,
			query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message }) : null,
			query.data ? layout === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid justify-items-center gap-3 sm:grid-cols-2 sm:justify-items-stretch xl:grid-cols-3",
				children: [query.data.tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted sm:col-span-2 xl:col-span-3",
					children: "No tickets match this view."
				}) : null, query.data.tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tickets/$ticketId",
					params: { ticketId: String(ticket.id) },
					className: "grid w-full max-w-md justify-items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center sm:max-w-none sm:justify-items-start sm:text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: ticket.subject
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								ticket.organizationName || "No company",
								" · ",
								ticket.assignee || "Unassigned"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								ticket.zendeskId ? `#${ticket.zendeskId}` : `P-${ticket.id}`,
								" · ",
								ago(ticket.updatedAt)
							]
						})
					]
				}, ticket.id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-2 md:hidden",
				children: [query.data.tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tickets/$ticketId",
					params: { ticketId: String(ticket.id) },
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-semibold",
						children: ticket.subject
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 block text-xs text-muted",
						children: [
							ticket.organizationName || "No company",
							" · ",
							ago(ticket.updatedAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status })]
				}) }, ticket.id)), query.data.tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-6 text-center text-sm text-muted",
					children: "No tickets match this view."
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[44rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Ticket"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Company"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Assignee"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Updated"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [query.data.tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "stack-empty px-4 py-8 text-muted",
						colSpan: 5,
						children: "No tickets match this view."
					}) }) : null, query.data.tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/tickets/$ticketId",
									params: { ticketId: String(ticket.id) },
									className: "font-medium hover:underline",
									children: ticket.subject
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [
										ticket.zendeskId ? `#${ticket.zendeskId}` : `P-${ticket.id}`,
										ticket.viewLabel ? ` · ${ticket.viewLabel}` : "",
										ticket.category ? ` · ${ticket.category}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Company",
								children: ticket.organizationName || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Status",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Assignee",
								children: ticket.assignee || "Unassigned"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								"data-label": "Updated",
								children: ago(ticket.updatedAt)
							})
						]
					}, ticket.id))] })]
				})
			})] }) : null
		]
	});
}
//#endregion
export { TicketsPage as component };
