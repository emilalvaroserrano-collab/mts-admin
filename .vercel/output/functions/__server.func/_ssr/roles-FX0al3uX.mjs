import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { M as savePolicy, y as listPolicies } from "./api-DpH0j9Yg.mjs";
import { a as ErrorNote, c as Loading, d as Panel, g as errorText, h as Toggle, r as Button, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roles-FX0al3uX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RolesPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["policies"],
		queryFn: () => listPolicies()
	});
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (query.data) setDrafts(query.data);
	}, [query.data]);
	const save = useMutation({
		mutationFn: (policy) => savePolicy({ data: {
			id: policy.id,
			canOrder: policy.canOrder,
			canRequestUsers: policy.canRequestUsers,
			canApproveOrders: policy.canApproveOrders,
			canManagePortal: policy.canManagePortal
		} }),
		onSuccess: () => {
			toast.success("Role saved");
			client.invalidateQueries({ queryKey: ["policies"] });
			client.invalidateQueries({ queryKey: ["people"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	function patch(id, next) {
		setDrafts((current) => current.map((policy) => policy.id === id ? {
			...policy,
			...next
		} : policy));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Access",
		title: "Roles",
		description: "What regular customers, authorized customers, agents, and admins are allowed to do. Company boundaries are enforced on the server."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3",
		children: drafts.map((policy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: policy.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted",
						children: policy.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: ["Scope: ", policy.scope]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: policy.canOrder,
						onCheckedChange: (canOrder) => patch(policy.id, { canOrder }),
						label: "Can order products"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: policy.canRequestUsers,
						onCheckedChange: (canRequestUsers) => patch(policy.id, { canRequestUsers }),
						label: "Can request new users"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: policy.canApproveOrders,
						onCheckedChange: (canApproveOrders) => patch(policy.id, { canApproveOrders }),
						label: "Can approve orders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: policy.canManagePortal,
						onCheckedChange: (canManagePortal) => patch(policy.id, { canManagePortal }),
						label: "Can change portal settings"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				type: "button",
				disabled: save.isPending,
				onClick: () => save.mutate(policy),
				children: ["Save ", policy.label.toLowerCase()]
			})
		] }, policy.id))
	})] });
}
//#endregion
export { RolesPage as component };
