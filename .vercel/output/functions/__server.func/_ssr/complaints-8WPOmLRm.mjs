import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { O as listMyComplaints, wt as submitComplaint } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/complaints-8WPOmLRm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"Service complaint",
	"Billing complaint",
	"Technical support complaint",
	"Delivery or order complaint",
	"General feedback"
];
function ComplaintsPage() {
	const token = useShopToken();
	const client = useQueryClient();
	const mine = useQuery({
		queryKey: ["complaints", token],
		queryFn: () => listMyComplaints({ data: token }),
		enabled: Boolean(token)
	});
	const [kind, setKind] = (0, import_react.useState)(KINDS[0]);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const send = useMutation({
		mutationFn: () => submitComplaint({ data: {
			token,
			kind,
			subject,
			body
		} }),
		onSuccess: (result) => {
			setSubject("");
			setBody("");
			setNotice(result.zendeskId ? `Ticket ${result.ticketId} is in Zendesk as #${result.zendeskId}.` : `Ticket ${result.ticketId} is open. Zendesk sync is pending if no number is shown.`);
			client.invalidateQueries({ queryKey: ["complaints", token] });
			client.invalidateQueries({ queryKey: ["portal-session", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not send that.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Complaints and feedback"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-xl border border-line bg-surface p-4",
				onSubmit: (event) => {
					event.preventDefault();
					send.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: kind,
						onChange: (event) => setKind(event.target.value),
						"aria-label": "Type",
						className: "h-11 rounded-xl border border-line px-3",
						children: KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: subject,
						onChange: (event) => setSubject(event.target.value),
						required: true,
						placeholder: "Subject",
						"aria-label": "Subject",
						className: "h-11 rounded-xl border border-line px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: body,
						onChange: (event) => setBody(event.target.value),
						required: true,
						placeholder: "What happened?",
						"aria-label": "Details",
						className: "min-h-28 rounded-xl border border-line px-3 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: send.isPending,
						className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
						children: "Submit"
					})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null,
			(mine.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: item.subject
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						item.kind,
						" · ",
						item.status,
						item.ticketId ? ` · Ticket ${item.ticketId}` : ""
					]
				})]
			}, item.id))
		]
	});
}
//#endregion
export { ComplaintsPage as component };
