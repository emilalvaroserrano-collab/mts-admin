import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { E as listDeskAccounts, N as listPortalCustomers, _t as setPortalGrants, gt as setDeskRole } from "./api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-B2I6JBxD.js
var import_jsx_runtime = require_jsx_runtime();
function AccessPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["portal-customers"],
		queryFn: () => listPortalCustomers()
	});
	const accounts = useQuery({
		queryKey: ["desk-accounts"],
		queryFn: () => listDeskAccounts()
	});
	const save = useMutation({
		mutationFn: setPortalGrants,
		onSuccess: () => {
			toast.success("Access saved");
			client.invalidateQueries({ queryKey: ["portal-customers"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const desk = useMutation({
		mutationFn: (input) => setDeskRole({ data: input }),
		onSuccess: () => {
			toast.success("Desk role saved");
			client.invalidateQueries({ queryKey: ["desk-accounts"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Customers",
				title: "Customer access",
				description: "New sign-ins are customers. Grant the shop or an invoice here, and only then give someone a desk role."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Desk access"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Customer is the default. Admin, agent, and owner are set from here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [(accounts.data ?? []).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 rounded-xl border border-line px-3 py-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-semibold",
									children: account.name || account.email
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-xs text-muted",
									children: account.email
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": `Desk role for ${account.email}`,
								className: "h-10 rounded-xl border border-line px-2 text-sm",
								value: account.role,
								onChange: (event) => desk.mutate({
									userId: account.id,
									role: event.target.value
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "customer",
										children: "Customer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "viewer",
										children: "Viewer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "agent",
										children: "Agent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "admin",
										children: "Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "owner",
										children: "Owner"
									})
								]
							})]
						}, account.id)), accounts.data && accounts.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No one has registered yet."
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: query.data.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "truncate text-sm font-semibold",
									children: person.name || person.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted",
									children: [
										person.email,
										" · ",
										person.organization || person.business || "No company"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [person.verified ? "Email verified" : "Email not verified", person.interests ? ` · ${person.interests}` : ""]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase text-accent",
							children: person.roleId
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap items-center gap-3 text-sm",
						onSubmit: (event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							save.mutate({ data: {
								id: person.id,
								shop: data.get("shop") === "on",
								services: data.get("services") === "on",
								invoice: data.get("invoice") === "on"
							} });
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: "shop",
									defaultChecked: person.shop
								}), " Shop"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: "services",
									defaultChecked: person.services
								}), " Services"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: "invoice",
									defaultChecked: person.invoice
								}), " Invoice"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "h-9 rounded-full bg-ink px-4 text-xs font-semibold text-white",
								children: "Save"
							})
						]
					})]
				}, person.id))
			})
		]
	});
}
//#endregion
export { AccessPage as component };
