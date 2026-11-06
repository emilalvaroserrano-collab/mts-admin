import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { I as listServiceCatalog, P as listPortalServices, X as requestPortalService } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { a as useStore, r as StoreFrame } from "./storefront-Pr4Z_0Vf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-Bb7g6ZQM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StoreServices() {
	const { slug } = useStore();
	const token = useShopToken();
	const client = useQueryClient();
	const catalog = useQuery({
		queryKey: ["service-catalog"],
		queryFn: () => listServiceCatalog()
	});
	const mine = useQuery({
		queryKey: ["portal-services", token],
		queryFn: () => listPortalServices({ data: token }),
		enabled: Boolean(token)
	});
	const [picked, setPicked] = (0, import_react.useState)(0);
	const [details, setDetails] = (0, import_react.useState)("");
	const [severity, setSeverity] = (0, import_react.useState)("normal");
	const [notice, setNotice] = (0, import_react.useState)("");
	const order = useMutation({
		mutationFn: () => requestPortalService({ data: {
			token,
			serviceId: picked,
			details,
			severity
		} }),
		onSuccess: () => {
			setNotice("Request sent. A ticket was opened for this account.");
			setDetails("");
			client.invalidateQueries({ queryKey: ["portal-services", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not send the request.")
	});
	const groups = /* @__PURE__ */ new Map();
	for (const item of catalog.data ?? []) {
		const list = groups.get(item.category) ?? [];
		list.push(item);
		groups.set(item.category, list);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4 px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "MTS Services"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Managed IT, cloud, projects, phone, and internet. Requesting one opens a ticket."
			}),
			!token ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "flex h-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white",
				children: "Sign in to request a service"
			}) : null,
			[...groups.entries()].map(([category, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: category
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPicked(item.id),
						className: picked === item.id ? "rounded-2xl border border-ink bg-white px-4 py-3 text-left" : "rounded-2xl border border-line bg-white px-4 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: item.summary
						})]
					}, item.id))
				})]
			}, category)),
			token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-2xl border border-line bg-white p-4",
				onSubmit: (event) => {
					event.preventDefault();
					setNotice("");
					order.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: details,
						onChange: (event) => setDetails(event.target.value),
						required: true,
						placeholder: "Sites, users, and what you need.",
						className: "min-h-24 rounded-xl border border-line px-3 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: order.isPending || !picked,
						className: "h-12 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-40",
						children: "Request this service"
					})
				]
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-accent-soft px-4 py-3 text-sm",
				children: notice
			}) : null,
			token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Your requests"
					}),
					(mine.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-white px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: item.serviceName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [item.status, item.quoteNote ? ` · ${item.quoteNote}` : ""]
						})]
					}, item.id)),
					(mine.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No service requests yet."
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: ["Store ", slug]
			})
		]
	}) });
}
//#endregion
export { StoreServices as component };
