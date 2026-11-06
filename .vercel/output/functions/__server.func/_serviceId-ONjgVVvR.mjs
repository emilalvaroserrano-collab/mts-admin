import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { X as requestPortalService, m as getService } from "./_ssr/api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { i as Route$9 } from "./_ssr/router-DN3-t_kz.mjs";
import { n as useShopToken } from "./_ssr/shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./_ssr/use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_serviceId-ONjgVVvR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ServiceDetail() {
	const { serviceId } = Route$9.useParams();
	const id = Number(serviceId);
	const token = useShopToken();
	const client = useQueryClient();
	const session = usePortalSession();
	const service = useQuery({
		queryKey: ["service", id],
		queryFn: () => getService({ data: id }),
		enabled: Number.isFinite(id)
	});
	const [details, setDetails] = (0, import_react.useState)("");
	const [severity, setSeverity] = (0, import_react.useState)("normal");
	const [extra, setExtra] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const send = useMutation({
		mutationFn: () => requestPortalService({ data: {
			token,
			serviceId: id,
			details: [details, extra].filter(Boolean).join("\n"),
			severity
		} }),
		onSuccess: () => {
			setNotice("Request sent. A ticket is open and nothing is billed until the desk quotes it.");
			setDetails("");
			client.invalidateQueries({ queryKey: ["portal-services", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not send the request.")
	});
	const item = service.data;
	if (service.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Opening the service…"
	});
	if (!item) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "That service is not in the catalog."
	});
	const access = session.data?.access;
	const allowed = item.kind === "phone" ? access?.canOrderPhone : access?.canOrderIt;
	const phone = item.kind === "phone";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/portal/services",
				className: "text-sm text-muted",
				children: "All services"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
					children: item.category
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-semibold tracking-tight",
					children: item.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: item.summary
				})
			] }),
			item.benefits ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "Why it helps. "
				}), item.benefits]
			}) : null,
			item.scope ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "In scope. "
				}), item.scope]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Price is quoted. This page does not promise a rate or a start date."
			}),
			allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-xl border border-line bg-surface p-4",
				onSubmit: (event) => {
					event.preventDefault();
					setNotice("");
					send.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Request this service"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: severity,
						onChange: (event) => setSeverity(event.target.value),
						"aria-label": "Priority",
						className: "h-11 rounded-xl border border-line px-3",
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
					phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: extra,
						onChange: (event) => setExtra(event.target.value),
						placeholder: "Users or extensions, site address, current provider, and the speed or handsets you need.",
						className: "min-h-24 rounded-xl border border-line px-3 py-3"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: extra,
						onChange: (event) => setExtra(event.target.value),
						placeholder: "Sites, users, and what should be in the quote.",
						className: "min-h-24 rounded-xl border border-line px-3 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: details,
						onChange: (event) => setDetails(event.target.value),
						required: true,
						placeholder: "What do you need done?",
						className: "min-h-24 rounded-xl border border-line px-3 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: send.isPending,
						className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
						children: send.isPending ? "Sending" : "Request a quote"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl bg-accent-soft px-4 py-3 text-sm",
				children: [
					"An admin has to approve service ordering before this account can request ",
					item.name,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/portal/tickets",
				className: "text-sm font-semibold text-accent",
				children: "Contact support instead"
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null
		]
	});
}
//#endregion
export { ServiceDetail as component };
