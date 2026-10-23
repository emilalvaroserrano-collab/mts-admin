import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as listTickets } from "./api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, f as Select, p as StatusBadge, u as PageHeader } from "./ui-V14V10_q.mjs";
import { t as ago } from "./format-BF_Jz8jj.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as Route$2 } from "./router-29RYm-xQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-Bq9DWbp-.js
var import_jsx_runtime = require_jsx_runtime();
var VIEWS = [
	"",
	"Pending Projects",
	"Pending Orders",
	"Need Invoice"
];
function TicketsPage() {
	const search = Route$2.useSearch();
	const navigate = Route$2.useNavigate();
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
	function setSearch(partial) {
		navigate({ search: (prev) => ({
			...prev,
			...partial
		}) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Zendesk",
			title: "Tickets",
			description: "Unresolved work, saved views, and the conversation stay tied to Zendesk when the account is connected."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: VIEWS.map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setSearch({ view }),
				className: search.view === view ? "h-9 rounded-md bg-accent px-3 text-sm text-accent-fg" : "h-9 rounded-md border border-line bg-surface px-3 text-sm",
				children: view || "All views"
			}, view || "all-views"))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
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
		query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-2xl border border-line bg-surface",
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
					className: "px-4 py-8 text-muted",
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
							children: ticket.organizationName || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: ticket.assignee || "Unassigned"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: ago(ticket.updatedAt)
						})
					]
				}, ticket.id))] })]
			})
		}) : null
	] });
}
//#endregion
export { TicketsPage as component };
