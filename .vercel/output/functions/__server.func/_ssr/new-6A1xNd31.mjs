import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Tt as submitPortalTicket } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-6A1xNd31.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Outlook Not Working",
	"Computer or Laptop Issue",
	"Phone Issue",
	"Printer Not Working",
	"Internet Connection Issue",
	"Network / Wi-Fi Problem",
	"Microsoft 365 Support",
	"Password / Account Access",
	"Software Installation",
	"Security Concern",
	"Other IT Issue"
];
function NewTicket() {
	const token = useShopToken();
	const navigate = useNavigate();
	const client = useQueryClient();
	const [category, setCategory] = (0, import_react.useState)(CATEGORIES[0]);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [severity, setSeverity] = (0, import_react.useState)("normal");
	const [device, setDevice] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
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
			client.invalidateQueries({ queryKey: ["portal-session", token] });
			if (result.warning && !result.zendeskId) setNotice(result.warning);
			navigate({
				to: "/portal/tickets/$ticketId",
				params: { ticketId: String(result.ticketId) }
			});
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not open the ticket.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			setNotice("");
			send.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "New ticket"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: category,
				onChange: (event) => setCategory(event.target.value),
				"aria-label": "Category",
				className: "h-11 rounded-xl border border-line bg-surface px-3",
				children: CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: subject,
				onChange: (event) => setSubject(event.target.value),
				required: true,
				placeholder: "Subject",
				"aria-label": "Subject",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: severity,
					onChange: (event) => setSeverity(event.target.value),
					"aria-label": "Priority",
					className: "h-11 rounded-xl border border-line bg-surface px-3",
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
					"aria-label": "Affected device",
					className: "h-11 rounded-xl border border-line bg-surface px-3"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: body,
				onChange: (event) => setBody(event.target.value),
				required: true,
				placeholder: "What is happening?",
				"aria-label": "Description",
				className: "min-h-32 rounded-xl border border-line bg-surface px-3 py-3"
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: send.isPending,
				className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
				children: send.isPending ? "Sending" : "Submit ticket"
			})
		]
	});
}
//#endregion
export { NewTicket as component };
