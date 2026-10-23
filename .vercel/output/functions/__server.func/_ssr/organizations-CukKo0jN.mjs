import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as saveOrg, p as listOrgs } from "./api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, g as errorText, i as Empty, l as Modal, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-V14V10_q.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/organizations-CukKo0jN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CompaniesPage() {
	const query = useQuery({
		queryKey: ["orgs"],
		queryFn: () => listOrgs()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [domain, setDomain] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("");
	const navigate = useNavigate();
	const client = useQueryClient();
	const save = useMutation({
		mutationFn: () => saveOrg({ data: {
			name,
			domain,
			industry,
			phone: "",
			address: "",
			zendeskOrgId: "",
			notes: "",
			portalAccess: true,
			orderingEnabled: true,
			userRequestsEnabled: true,
			approvalRequired: true
		} }),
		onSuccess: (result) => {
			toast.success("Company added");
			client.invalidateQueries({ queryKey: ["orgs"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
			setOpen(false);
			navigate({
				to: "/organizations/$orgId",
				params: { orgId: String(result.id) }
			});
		},
		onError: (error) => toast.error(errorText(error))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Customers",
			title: "Companies",
			description: "Profiles, Zendesk organizations, and who is allowed to order.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setOpen(true),
				children: "Add company"
			})
		}),
		query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {}) : null,
		query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message }) : null,
		query.data && query.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "No companies",
			body: "Add the first customer organization."
		}) : null,
		query.data && query.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-2xl border border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[40rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Company"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "People"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Open tickets"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Access"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.data.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/organizations/$orgId",
								params: { orgId: String(org.id) },
								className: "font-medium hover:underline",
								children: org.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [org.industry || "No industry", org.zendeskOrgId ? ` · Zendesk ${org.zendeskOrgId}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: org.userCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: org.openTickets
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: org.portalAccess ? "good" : "neutral",
								children: org.portalAccess ? "Portal on" : "Portal off"
							})
						})
					]
				}, org.id)) })]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open,
			onOpenChange: setOpen,
			title: "Add company",
			description: "You can link the Zendesk organization after it is saved.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					save.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (event) => setName(event.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Domain",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: domain,
							onChange: (event) => setDomain(event.target.value),
							placeholder: "company.example"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Industry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: industry,
							onChange: (event) => setIndustry(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: save.isPending ? "Saving" : "Create company"
					})
				]
			})
		})
	] });
}
//#endregion
export { CompaniesPage as component };
