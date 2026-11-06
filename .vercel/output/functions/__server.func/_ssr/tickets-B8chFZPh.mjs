import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { K as refreshPortalTicket, Tt as submitPortalTicket, d as getPortalSession, f as getPortalTicket } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { r as StoreFrame } from "./storefront-Pr4Z_0Vf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-B8chFZPh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PATHS = [
	"IT Support / Microsoft 365 / Outlook",
	"IT Support / Microsoft 365 / Teams",
	"IT Support / Microsoft 365 / SharePoint",
	"IT Support / Printer",
	"IT Support / Network",
	"IT Support / Phone",
	"Other"
];
function StoreTickets() {
	const token = useShopToken();
	const client = useQueryClient();
	const session = useQuery({
		queryKey: ["portal-session", token],
		queryFn: () => getPortalSession({ data: token }),
		enabled: Boolean(token)
	});
	const [openId, setOpenId] = (0, import_react.useState)(0);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(PATHS[0]);
	const [severity, setSeverity] = (0, import_react.useState)("normal");
	const [device, setDevice] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const detail = useQuery({
		queryKey: [
			"portal-ticket",
			token,
			openId
		],
		queryFn: () => getPortalTicket({ data: {
			token,
			id: openId
		} }),
		enabled: Boolean(token && openId)
	});
	const send = useMutation({
		mutationFn: () => submitPortalTicket({ data: {
			token,
			subject,
			category,
			body,
			severity,
			device
		} }),
		onSuccess: (result) => {
			setNotice(result.zendeskId ? `Ticket ${result.ticketId} is in Zendesk as #${result.zendeskId}.` : result.warning || `Ticket ${result.ticketId} is open.`);
			setSubject("");
			setBody("");
			setOpenId(result.ticketId);
			client.invalidateQueries({ queryKey: ["portal-session", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not open the ticket.")
	});
	const refresh = useMutation({
		mutationFn: () => refreshPortalTicket({ data: {
			token,
			id: openId
		} }),
		onSuccess: (result) => {
			setNotice(result.synced ? "Status pulled from Zendesk." : result.warning);
			client.invalidateQueries({ queryKey: [
				"portal-ticket",
				token,
				openId
			] });
			client.invalidateQueries({ queryKey: ["portal-session", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not refresh.")
	});
	const tickets = session.data?.tickets ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4 px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Tickets"
			}),
			!token ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "flex h-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white",
				children: "Sign in to open a ticket"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-2xl border border-line bg-white p-4",
				onSubmit: (event) => {
					event.preventDefault();
					setNotice("");
					send.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "New ticket"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: subject,
						onChange: (event) => setSubject(event.target.value),
						required: true,
						placeholder: "Subject",
						className: "h-12 rounded-xl border border-line px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: category,
						onChange: (event) => setCategory(event.target.value),
						className: "h-12 rounded-xl border border-line px-3",
						children: PATHS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: severity,
							onChange: (event) => setSeverity(event.target.value),
							className: "h-12 rounded-xl border border-line px-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "low",
									children: "Low"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "normal",
									children: "Normal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "high",
									children: "High"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: device,
							onChange: (event) => setDevice(event.target.value),
							placeholder: "Affected device",
							className: "h-12 rounded-xl border border-line px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: body,
						onChange: (event) => setBody(event.target.value),
						required: true,
						placeholder: "What is happening?",
						className: "min-h-24 rounded-xl border border-line px-3 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: send.isPending,
						className: "h-12 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
						children: send.isPending ? "Sending" : "Submit ticket"
					})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-accent-soft px-4 py-3 text-sm",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-2",
				children: [tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setOpenId(ticket.id),
					className: "grid w-full gap-1 rounded-2xl border border-line bg-white px-4 py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-sm font-semibold",
							children: ticket.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs font-semibold uppercase text-accent",
							children: ticket.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [ticket.category, ticket.zendeskId ? ` · Zendesk #${ticket.zendeskId}` : ""]
					})]
				}) }, ticket.id)), token && tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "No tickets on this account yet."
				}) : null]
			}),
			openId && detail.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 rounded-2xl border border-line bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: detail.data.subject
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Status ",
							detail.data.status,
							detail.data.zendeskId ? ` · Zendesk #${detail.data.zendeskId}` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-10 rounded-full border border-line px-3 text-xs font-semibold",
						onClick: () => refresh.mutate(),
						disabled: refresh.isPending,
						children: refresh.isPending ? "Syncing" : "Sync Zendesk"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: detail.data.comments.map((comment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl bg-[#f3f6f7] px-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-muted",
							children: comment.author || "Desk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 whitespace-pre-wrap",
							children: comment.body
						})]
					}, `${comment.at}-${index}`))
				})]
			}) : null
		]
	}) });
}
//#endregion
export { StoreTickets as component };
