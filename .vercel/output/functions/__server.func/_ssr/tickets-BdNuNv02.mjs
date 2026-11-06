import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-BdNuNv02.js
var import_jsx_runtime = require_jsx_runtime();
function TicketList() {
	const session = usePortalSession();
	const tickets = session.data?.tickets ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Support tickets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/portal/tickets/new",
				className: "inline-flex h-11 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-white",
				children: "New ticket"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid gap-2",
			children: [tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/portal/tickets/$ticketId",
				params: { ticketId: String(ticket.id) },
				className: "grid gap-1 rounded-xl border border-line bg-surface px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-sm font-semibold",
						children: ticket.subject
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase text-accent",
						children: ticket.status
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [ticket.category || "Support", ticket.zendeskId ? ` · Zendesk #${ticket.zendeskId}` : " · Waiting on Zendesk"]
				})]
			}) }, ticket.id)), session.data && tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "No tickets on this account yet."
			}) : null]
		})]
	});
}
//#endregion
export { TicketList as component };
