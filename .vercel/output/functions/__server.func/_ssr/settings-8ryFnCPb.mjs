import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-DhyAHcG6.mjs";
import { Mt as testResend, dt as saveResend, ft as saveSettings, g as getSettings, ht as sendTestEmail, mt as saveStaff } from "./api-CEXWu3z6.mjs";
import { n as useCurrentUserState } from "./use-current-user-D9YQRpMJ.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, f as Select, h as Toggle, o as Field, r as Button, s as Input, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-8ryFnCPb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_LABEL = {
	owner: "Super Admin",
	admin: "Admin",
	agent: "Agent",
	viewer: "Viewer"
};
function SettingsPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings()
	});
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [staff, setStaff] = (0, import_react.useState)([]);
	const [fromEmail, setFromEmail] = (0, import_react.useState)("noreply@managetechservice.com");
	const [apiKey, setApiKey] = (0, import_react.useState)("");
	const [testTo, setTestTo] = (0, import_react.useState)("");
	const { user } = useCurrentUserState();
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setSettings(query.data.settings);
		setStaff(query.data.staff);
		setFromEmail(query.data.mail.fromEmail || "noreply@managetechservice.com");
		setApiKey("");
	}, [query.data]);
	(0, import_react.useEffect)(() => {
		const email = user?.primaryEmail;
		if (email) setTestTo((current) => current || email);
	}, [user]);
	const save = useMutation({
		mutationFn: (next) => saveSettings({ data: next }),
		onSuccess: () => {
			toast.success("Portal settings saved");
			client.invalidateQueries({ queryKey: ["settings"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const mailSave = useMutation({
		mutationFn: () => saveResend({ data: {
			fromEmail,
			apiKey
		} }),
		onSuccess: () => {
			toast.success("Resend saved");
			setApiKey("");
			client.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const mailTest = useMutation({
		mutationFn: () => testResend(),
		onSuccess: (result) => {
			toast.success(result.message);
			client.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const mailSend = useMutation({
		mutationFn: () => sendTestEmail({ data: { to: testTo } }),
		onSuccess: () => {
			toast.success(`Test email sent to ${testTo}`);
			client.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const staffSave = useMutation({
		mutationFn: (member) => saveStaff({ data: {
			userId: member.userId,
			role: member.role,
			active: member.active,
			organizationId: member.organizationId
		} }),
		onSuccess: () => {
			toast.success("Staff access updated");
			client.invalidateQueries({ queryKey: ["settings"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending || !settings) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	function patchStaff(userId, next) {
		setStaff((current) => current.map((member) => member.userId === userId ? {
			...member,
			...next
		} : member));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Desk",
				title: "Settings",
				description: "Branding, Resend email, who on staff can see which companies, and the record of changes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Branding"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						save.mutate(settings);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: settings.brandName,
								onChange: (event) => setSettings({
									...settings,
									brandName: event.target.value
								}),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Support email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: settings.supportEmail,
								onChange: (event) => setSettings({
									...settings,
									supportEmail: event.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tagline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: settings.tagline,
								onChange: (event) => setSettings({
									...settings,
									tagline: event.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.notifyNewTicket,
							onCheckedChange: (notifyNewTicket) => setSettings({
								...settings,
								notifyNewTicket
							}),
							label: "Note new tickets in the activity log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.notifyNewOrder,
							onCheckedChange: (notifyNewOrder) => setSettings({
								...settings,
								notifyNewOrder
							}),
							label: "Note new orders in the activity log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.customerCatalogVisible,
							onCheckedChange: (customerCatalogVisible) => setSettings({
								...settings,
								customerCatalogVisible
							}),
							label: "Show the catalog to customers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: save.isPending ? "Saving" : "Save settings"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 divide-y divide-line",
					children: [query.data.audit.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-3 text-sm text-muted",
						children: "No changes yet."
					}) : null, query.data.audit.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: entry.actorName || "Desk"
									}),
									" ",
									entry.action.toLowerCase(),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: entry.target
									})
								]
							}),
							entry.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: entry.detail
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: ago(entry.createdAt)
							})
						]
					}, entry.id))]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Resend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-medium text-muted",
						children: [
							query.data.mail.keySet ? "API key saved" : "No API key yet",
							query.data.mail.status === "connected" ? " · Connected" : "",
							query.data.mail.status === "error" ? " · Needs attention" : ""
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Order and account mail is sent from the noreply address. Leave the key blank to keep the one already saved."
				}),
				query.data.mail.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: query.data.mail.error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					onSubmit: (event) => {
						event.preventDefault();
						mailSave.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "From address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: fromEmail,
								onChange: (event) => setFromEmail(event.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Resend API key",
							hint: query.data.mail.keySet ? "A key is already saved." : "Paste the key from Resend.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								value: apiKey,
								onChange: (event) => setApiKey(event.target.value),
								autoComplete: "off",
								placeholder: query.data.mail.keySet ? "••••••••" : "re_..."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Send a test to",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: testTo,
								onChange: (event) => setTestTo(event.target.value),
								placeholder: "you@company.com"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2 sm:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: mailSave.isPending,
									children: mailSave.isPending ? "Saving" : "Save Resend"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									disabled: mailTest.isPending,
									onClick: () => mailTest.mutate(),
									children: mailTest.isPending ? "Testing" : "Test connection"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									disabled: mailSend.isPending || !testTo.includes("@"),
									onClick: () => mailSend.mutate(),
									children: mailSend.isPending ? "Sending" : "Send test email"
								})
							]
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Staff"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "A company limit hides every other organization. Leave it open for the whole desk. Super Admin is the only role that can delete an order."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-4",
					children: staff.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: member.name || member.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: member.email
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Role",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: member.role,
										onChange: (event) => patchStaff(member.userId, { role: event.target.value }),
										children: Object.keys(ROLE_LABEL).map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: role,
											children: ROLE_LABEL[role]
										}, role))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Company limit",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: member.organizationId ?? "",
										onChange: (event) => patchStaff(member.userId, { organizationId: event.target.value ? Number(event.target.value) : null }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "All companies"
										}), query.data.orgs.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: org.id,
											children: org.name
										}, org.id))]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: member.active,
								onCheckedChange: (active) => patchStaff(member.userId, { active }),
								label: "Account active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "secondary",
								disabled: staffSave.isPending,
								onClick: () => staffSave.mutate(member),
								children: "Save access"
							}) })
						]
					}, member.userId))
				})
			] })
		]
	});
}
//#endregion
export { SettingsPage as component };
