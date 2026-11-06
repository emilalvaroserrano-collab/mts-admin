import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-DhyAHcG6.mjs";
import { $ as runDeskJobs, At as testIntegration, Dt as syncZendesk, a as getIntegration, at as saveIntegration, p as getSarahMetrics } from "./api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, h as Toggle, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations-D10j1op_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IntegrationPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["integration"],
		queryFn: () => getIntegration()
	});
	const sarah = useQuery({
		queryKey: ["sarah-metrics"],
		queryFn: () => getSarahMetrics()
	});
	const [subdomain, setSubdomain] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [apiToken, setApiToken] = (0, import_react.useState)("");
	const [clearToken, setClearToken] = (0, import_react.useState)(false);
	const [oauthClientId, setOauthClientId] = (0, import_react.useState)("");
	const [oauthClientSecret, setOauthClientSecret] = (0, import_react.useState)("");
	const [oauthScopes, setOauthScopes] = (0, import_react.useState)("read write");
	const [clearOauth, setClearOauth] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setSubdomain(query.data.subdomain);
		setEmail(query.data.email);
		setApiToken("");
		setClearToken(false);
		setOauthClientId(query.data.oauthClientId);
		setOauthClientSecret("");
		setOauthScopes("read write");
		setClearOauth(false);
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
			clearToken,
			oauthClientId,
			oauthClientSecret,
			oauthScopes,
			clearOauth
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
	const jobs = useMutation({
		mutationFn: () => runDeskJobs(),
		onSuccess: () => toast.success("Queued jobs ran"),
		onError: (error) => toast.error(errorText(error))
	});
	const sync = useMutation({
		mutationFn: () => syncZendesk(),
		onSuccess: (result) => {
			toast.success(result.users ? `Imported ${result.imported} tickets and synced ${result.users} users` : `Imported ${result.imported} tickets`);
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
	const tone = data.lastStatus === "connected" || data.lastStatus === "ready" ? "good" : data.lastStatus === "error" ? "bad" : "neutral";
	const locked = data.fromEnv;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Connection",
				title: "Zendesk",
				description: "shop.zendesk.com is connected with the Conversations API. Ticket import uses OAuth client credentials when that client id and secret are set."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Sarah actions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Open confirmations, checks, and desk reviews. Counts come from the action log, not from what Sarah says."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: (sarah.data?.counts.length ? sarah.data.counts : [{
							status: "none yet",
							n: 0
						}]).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: item.status === "manual_review" || item.status === "failed" ? "bad" : item.status === "succeeded" ? "good" : "neutral",
							children: [
								item.status,
								" · ",
								item.n
							]
						}, item.status))
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							hint: locked ? "Taken from ZENDESK_SUBDOMAIN." : "The part before .zendesk.com",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: subdomain,
								onChange: (event) => setSubdomain(event.target.value),
								placeholder: "shop",
								autoComplete: "off",
								readOnly: locked
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Agent email",
							hint: locked ? "Taken from ZENDESK_EMAIL." : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								autoComplete: "off",
								readOnly: locked
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "API token",
							hint: locked ? "Taken from ZENDESK_API_TOKEN. It stays on the server." : data.tokenSet && !clearToken ? "A token is already stored. Leave this blank to keep it." : "Stored on the server. It is not shown again.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: apiToken,
								onChange: (event) => setApiToken(event.target.value),
								autoComplete: "new-password",
								placeholder: data.tokenSet ? "••••••••" : "",
								readOnly: locked
							})
						}),
						locked ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: clearToken,
							onCheckedChange: setClearToken,
							label: "Remove the stored token"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "OAuth client id",
							hint: data.oauthFromEnv ? "Taken from ZENDESK_OAUTH_CLIENT_ID." : "The identifier of the shop client-credentials client.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: oauthClientId,
								onChange: (event) => setOauthClientId(event.target.value),
								autoComplete: "off",
								readOnly: data.oauthFromEnv,
								placeholder: "shop"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "OAuth client secret",
							hint: data.oauthSecretSet ? "A secret is stored. Leave this blank to keep it." : "Shown once in Zendesk. It stays on the server.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: oauthClientSecret,
								onChange: (event) => setOauthClientSecret(event.target.value),
								autoComplete: "new-password",
								readOnly: data.oauthFromEnv,
								placeholder: data.oauthSecretSet ? "••••••••" : ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "OAuth scopes",
							hint: "Use read write, or the granular scopes set on the client.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: oauthScopes,
								onChange: (event) => setOauthScopes(event.target.value),
								readOnly: data.oauthFromEnv
							})
						}),
						data.oauthFromEnv ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: clearOauth,
							onCheckedChange: setClearOauth,
							label: "Remove the stored OAuth secret"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								locked && data.oauthFromEnv ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
									children: sync.isPending ? "Syncing" : "Sync tickets and users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									disabled: jobs.isPending,
									onClick: () => jobs.mutate(),
									children: jobs.isPending ? "Running" : "Run queued jobs"
								})
							]
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid content-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
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
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t border-line pt-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "OAuth client"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: data.oauthReady ? `Client credentials · ${data.oauthClientId} · https://${data.subdomain || "shop"}.zendesk.com/oauth/tokens` : "Not set"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-medium",
									children: "Conversations API"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: data.conversationsReady ? `Key set for app ${data.conversationsAppId}` : "Not set"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-medium",
									children: "Webhook"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: data.webhookReady ? `Signing secret set${data.webhookId ? ` · ${data.webhookId}` : ""}` : "Not set"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 break-all text-xs text-muted",
									children: "POST /api/zendesk/webhook"
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
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
			})
		]
	});
}
//#endregion
export { IntegrationPage as component };
