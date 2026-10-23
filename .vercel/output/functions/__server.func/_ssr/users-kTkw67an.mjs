import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-50WTgpEd.mjs";
import { D as saveCustomer, E as reviewRequest, s as getPeople } from "./api-DpH0j9Yg.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, h as Toggle, l as Modal, o as Field, p as StatusBadge, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-kTkw67an.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blank = () => ({
	id: 0,
	organizationId: null,
	organizationName: "",
	name: "",
	email: "",
	title: "",
	permissionLevel: "regular",
	canOrder: false,
	canRequestUsers: false,
	canApproveOrders: false,
	active: true,
	zendeskUserId: "",
	createdAt: ""
});
function PeoplePage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["people"],
		queryFn: () => getPeople()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const save = useMutation({
		mutationFn: (person) => saveCustomer({ data: {
			id: person.id || void 0,
			organizationId: person.organizationId,
			name: person.name,
			email: person.email,
			title: person.title,
			permissionLevel: person.permissionLevel,
			canOrder: person.canOrder,
			canRequestUsers: person.canRequestUsers,
			canApproveOrders: person.canApproveOrders,
			active: person.active,
			zendeskUserId: person.zendeskUserId
		} }),
		onSuccess: () => {
			toast.success("Person saved");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["people"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const review = useMutation({
		mutationFn: (input) => reviewRequest({ data: input }),
		onSuccess: () => {
			toast.success("Request reviewed");
			client.invalidateQueries({ queryKey: ["people"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const pending = query.data.requests.filter((request) => request.status === "pending");
	function applyPolicy(level) {
		const policy = query.data?.policies.find((item) => item.id === level);
		setDraft((current) => current ? {
			...current,
			permissionLevel: level,
			canOrder: policy?.canOrder ?? current.canOrder,
			canRequestUsers: policy?.canRequestUsers ?? current.canRequestUsers,
			canApproveOrders: policy?.canApproveOrders ?? current.canApproveOrders
		} : current);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Directory",
			title: "People",
			description: "Customer users, Zendesk requesters, and requests for new accounts.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setDraft({
					...blank(),
					organizationId: query.data.orgs[0]?.id ?? null
				}),
				children: "Add person"
			})
		}),
		pending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Requests waiting"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line",
				children: pending.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: request.requestedName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							request.requestedEmail,
							" · ",
							request.organizationName,
							" · asked by ",
							request.requestedBy || "unknown",
							" · ",
							ago(request.createdAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => review.mutate({
								id: request.id,
								decision: "approved"
							}),
							children: "Approve"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => review.mutate({
								id: request.id,
								decision: "denied"
							}),
							children: "Deny"
						})]
					})]
				}, request.id))
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-2xl border border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[48rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Person"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Company"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Access"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Zendesk"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-medium" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.data.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: person.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: person.title || person.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: person.organizationName || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: person.permissionLevel === "authorized" ? "pine" : "neutral",
									children: person.permissionLevel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: person.active ? "active" : "inactive" })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono text-xs",
							children: person.zendeskUserId || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setDraft(person),
								children: "Edit"
							})
						})
					]
				}, person.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: Boolean(draft),
			onOpenChange: (open) => {
				if (!open) setDraft(null);
			},
			title: draft?.id ? "Edit person" : "Add person",
			description: "Permissions are enforced when an order is placed.",
			children: draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					save.mutate(draft);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.name,
							onChange: (event) => setDraft({
								...draft,
								name: event.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: draft.email,
							onChange: (event) => setDraft({
								...draft,
								email: event.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Title",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.title,
							onChange: (event) => setDraft({
								...draft,
								title: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Company",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.organizationId ?? "",
							onChange: (event) => setDraft({
								...draft,
								organizationId: event.target.value ? Number(event.target.value) : null
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "No company"
							}), query.data.orgs.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: org.id,
								children: org.name
							}, org.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Permission level",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.permissionLevel,
							onChange: (event) => applyPolicy(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "regular",
								children: "Regular customer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "authorized",
								children: "Authorized customer"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zendesk user id",
						hint: "Requester id from Zendesk, when you have one.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.zendeskUserId,
							onChange: (event) => setDraft({
								...draft,
								zendeskUserId: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.canOrder,
						onCheckedChange: (canOrder) => setDraft({
							...draft,
							canOrder
						}),
						label: "Can order products"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.canRequestUsers,
						onCheckedChange: (canRequestUsers) => setDraft({
							...draft,
							canRequestUsers
						}),
						label: "Can request users"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.canApproveOrders,
						onCheckedChange: (canApproveOrders) => setDraft({
							...draft,
							canApproveOrders
						}),
						label: "Can approve orders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.active,
						onCheckedChange: (active) => setDraft({
							...draft,
							active
						}),
						label: "Account active"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyHint, { policies: query.data.policies }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: save.isPending ? "Saving" : "Save person"
					})
				]
			}) : null
		})
	] });
}
function PolicyHint({ policies }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-xs text-muted",
		children: [
			"Templates: ",
			policies.filter((policy) => policy.id === "regular" || policy.id === "authorized").map((policy) => policy.label).join(" and ") || "set on the Roles page",
			"."
		]
	});
}
//#endregion
export { PeoplePage as component };
