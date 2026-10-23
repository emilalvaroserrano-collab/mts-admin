import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as testIntegration, O as syncZendesk, S as saveIntegration, r as getIntegration } from "./api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, g as errorText, h as Toggle, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-V14V10_q.mjs";
import { t as ago } from "./format-BF_Jz8jj.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations-_PqPf3rX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IntegrationPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["integration"],
		queryFn: () => getIntegration()
	});
	const [subdomain, setSubdomain] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [apiToken, setApiToken] = (0, import_react.useState)("");
	const [clearToken, setClearToken] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setSubdomain(query.data.subdomain);
		setEmail(query.data.email);
		setApiToken("");
		setClearToken(false);
	}, [query.data]);
	function refresh() {
		client.invalidateQueries({ queryKey: ["integration"] });
		client.invalidateQueries({ queryKey: ["shell"] });
	}
	const save = useMutation({
		mutationFn: () => saveIntegration({ data: {
			subdomain,
			email,
			apiToken,
			clearToken
		} }),
		onSuccess: () => {
			toast.success("Zendesk settings saved");
			setApiToken("");
			refresh();
		},
		onError: (error) => toast.error(errorText(error))
	});
	const test = useMutation({
		mutationFn: () => testIntegration(),
		onSuccess: (result) => {
			toast.success(`Connected as ${result.name}`);
			refresh();
		},
		onError: (error) => {
			toast.error(errorText(error));
			refresh();
		}
	});
	const sync = useMutation({
		mutationFn: () => syncZendesk(),
		onSuccess: (result) => {
			toast.success(`Imported ${result.imported} tickets`);
			refresh();
			client.invalidateQueries({ queryKey: ["tickets"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => {
			toast.error(errorText(error));
			refresh();
		}
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const data = query.data;
	const tone = data.lastStatus === "connected" ? "good" : data.lastStatus === "error" ? "bad" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Connection",
		title: "Zendesk",
		description: "Tickets stay in Zendesk. This desk reads them, replies, and files order tickets back."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3",
			onSubmit: (event) => {
				event.preventDefault();
				save.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Subdomain",
					hint: "The part before .zendesk.com",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: subdomain,
						onChange: (event) => setSubdomain(event.target.value),
						placeholder: "managetech",
						autoComplete: "off"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Agent email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: email,
						onChange: (event) => setEmail(event.target.value),
						autoComplete: "off"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "API token",
					hint: data.tokenSet && !clearToken ? "A token is already stored. Leave this blank to keep it." : "Stored on the server. It is not shown again.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: apiToken,
						onChange: (event) => setApiToken(event.target.value),
						autoComplete: "new-password",
						placeholder: data.tokenSet ? "••••••••" : ""
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: clearToken,
					onCheckedChange: setClearToken,
					label: "Remove the stored token"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: save.isPending ? "Saving" : "Save connection"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							disabled: test.isPending,
							onClick: () => test.mutate(),
							children: test.isPending ? "Checking" : "Test access"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							disabled: sync.isPending,
							onClick: () => sync.mutate(),
							children: sync.isPending ? "Syncing" : "Sync tickets"
						})
					]
				})
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone,
						children: data.lastStatus || "not connected"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: data.lastSyncAt ? `Last sync ${ago(data.lastSyncAt)}` : "No ticket sync yet."
				}),
				data.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-bad",
					children: data.lastError
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Company map"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line",
				children: data.orgs.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/organizations/$orgId",
						params: { orgId: String(org.id) },
						className: "font-medium hover:underline",
						children: org.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted",
						children: org.zendeskOrgId || "unlinked"
					})]
				}, org.id))
			})] })]
		})]
	})] });
}
//#endregion
export { IntegrationPage as component };
