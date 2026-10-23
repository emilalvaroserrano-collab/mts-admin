import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-50WTgpEd.mjs";
import { I as saveStaff, P as saveSettings, c as getSettings } from "./api-DpH0j9Yg.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, h as Toggle, o as Field, r as Button, s as Input, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DUtyfvyz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"owner",
	"admin",
	"agent",
	"viewer"
];
function SettingsPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings()
	});
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [staff, setStaff] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setSettings(query.data.settings);
		setStaff(query.data.staff);
	}, [query.data]);
	const save = useMutation({
		mutationFn: (next) => saveSettings({ data: next }),
		onSuccess: () => {
			toast.success("Portal settings saved");
			client.invalidateQueries({ queryKey: ["settings"] });
			client.invalidateQueries({ queryKey: ["shell"] });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Desk",
			title: "Settings",
			description: "Branding, who on staff can see which companies, and the record of changes."
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Staff"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "A company limit hides every other organization. Leave it open for the whole desk."
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
										children: ROLES.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: role,
											children: role
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
			]
		})
	] });
}
//#endregion
export { SettingsPage as component };
