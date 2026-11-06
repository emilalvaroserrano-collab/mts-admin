import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { J as replyPortalTicket, K as refreshPortalTicket, f as getPortalTicket } from "./_ssr/api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { r as Route$7 } from "./_ssr/router-DN3-t_kz.mjs";
import { n as useShopToken } from "./_ssr/shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_ticketId-BRtQ-j4A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TicketDetail() {
	const { ticketId } = Route$7.useParams();
	const id = Number(ticketId);
	const token = useShopToken();
	const client = useQueryClient();
	const [body, setBody] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const detail = useQuery({
		queryKey: [
			"portal-ticket",
			token,
			id
		],
		queryFn: () => getPortalTicket({ data: {
			token,
			id
		} }),
		enabled: Boolean(token && id)
	});
	const refresh = useMutation({
		mutationFn: () => refreshPortalTicket({ data: {
			token,
			id
		} }),
		onSuccess: (result) => {
			setNotice(result.synced ? "Status pulled from Zendesk." : result.warning || "Zendesk did not return an update.");
			client.invalidateQueries({ queryKey: [
				"portal-ticket",
				token,
				id
			] });
			client.invalidateQueries({ queryKey: ["portal-session", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not refresh.")
	});
	const reply = useMutation({
		mutationFn: () => replyPortalTicket({ data: {
			token,
			id,
			body
		} }),
		onSuccess: () => {
			setBody("");
			setNotice("Reply added.");
			client.invalidateQueries({ queryKey: [
				"portal-ticket",
				token,
				id
			] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not reply.")
	});
	const ticket = detail.data;
	if (detail.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Opening the ticket…"
	});
	if (detail.isError || !ticket) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: detail.error instanceof Error ? detail.error.message : "Ticket not found."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/portal/tickets",
				className: "text-sm text-muted",
				children: "All tickets"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: ticket.subject
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						ticket.status,
						" · ",
						ticket.category,
						ticket.zendeskId ? ` · Zendesk #${ticket.zendeskId}` : " · Not in Zendesk yet"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-10 shrink-0 rounded-full border border-line px-3 text-xs font-semibold",
					onClick: () => refresh.mutate(),
					disabled: refresh.isPending,
					children: refresh.isPending ? "Syncing" : "Refresh"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: ticket.comments.map((comment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-muted",
						children: comment.author || "Desk"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 whitespace-pre-wrap",
						children: comment.body
					})]
				}, `${comment.at}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					reply.mutate();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: body,
					onChange: (event) => setBody(event.target.value),
					required: true,
					placeholder: "Add a reply",
					"aria-label": "Reply",
					className: "min-h-24 rounded-xl border border-line bg-surface px-3 py-3"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: reply.isPending,
					className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
					children: "Send reply"
				})]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null
		]
	});
}
//#endregion
export { TicketDetail as component };
