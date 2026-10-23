import { o as __toESM } from "./_runtime.mjs";
import { t as ticketSearch } from "./_ssr/ticket-search-CEf18BGL.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { C as saveOrg, a as getOrg } from "./_ssr/api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, g as errorText, h as Toggle, m as Textarea, o as Field, p as StatusBadge, r as Button, s as Input, u as PageHeader } from "./_ssr/ui-V14V10_q.mjs";
import { r as money, t as ago } from "./_ssr/format-BF_Jz8jj.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as Route$3 } from "./_ssr/router-29RYm-xQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orgId-CgFzEs-L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CompanyPage() {
	const { orgId } = Route$3.useParams();
	const id = Number(orgId);
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["org", id],
		queryFn: () => getOrg({ data: id })
	});
	const [form, setForm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (query.data) setForm(query.data.org);
	}, [query.data]);
	const save = useMutation({
		mutationFn: () => {
			if (!form) throw new Error("Missing company.");
			return saveOrg({ data: form });
		},
		onSuccess: () => {
			toast.success("Company saved");
			client.invalidateQueries({ queryKey: ["org", id] });
			client.invalidateQueries({ queryKey: ["orgs"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending || !form) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const detail = query.data;
	function patch(partial) {
		setForm((current) => current ? {
			...current,
			...partial
		} : current);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: form.industry || "Company",
			title: form.name,
			description: form.domain || "No domain on file",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => save.mutate(),
				disabled: save.isPending,
				children: save.isPending ? "Saving" : "Save company"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.name,
							onChange: (event) => patch({ name: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Domain",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.domain,
							onChange: (event) => patch({ domain: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Industry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.industry,
							onChange: (event) => patch({ industry: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.phone,
							onChange: (event) => patch({ phone: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zendesk organization id",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.zendeskOrgId,
							onChange: (event) => patch({ zendeskOrgId: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.address,
							onChange: (event) => patch({ address: event.target.value })
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: form.notes,
						onChange: (event) => patch({ notes: event.target.value })
					})
				})
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 content-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: form.portalAccess,
						onCheckedChange: (portalAccess) => patch({ portalAccess }),
						label: "Portal access"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: form.orderingEnabled,
						onCheckedChange: (orderingEnabled) => patch({ orderingEnabled }),
						label: "Equipment ordering"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: form.userRequestsEnabled,
						onCheckedChange: (userRequestsEnabled) => patch({ userRequestsEnabled }),
						label: "User requests"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: form.approvalRequired,
						onCheckedChange: (approvalRequired) => patch({ approvalRequired }),
						label: "Order approval required"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "People"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 divide-y divide-line text-sm",
						children: [detail.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: person.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									person.permissionLevel,
									" · ",
									person.email
								]
							})]
						}, person.id)), detail.people.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-2 text-muted",
							children: "No people yet."
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/users",
						className: "mt-3 inline-block text-sm text-accent",
						children: "Manage people"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Tickets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-line text-sm",
						children: detail.tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tickets/$ticketId",
								params: { ticketId: String(ticket.id) },
								className: "font-medium hover:underline",
								children: ticket.subject
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									ticket.status,
									" · ",
									ago(ticket.updatedAt)
								]
							})]
						}, ticket.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tickets",
						search: ticketSearch({
							org: String(form.id),
							status: "all"
						}),
						className: "mt-3 inline-block text-sm text-accent",
						children: "Company tickets"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Orders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 divide-y divide-line text-sm",
						children: [detail.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/orders/$orderId",
								params: { orderId: String(order.id) },
								className: "font-medium hover:underline",
								children: order.number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: money(order.totalCents)
							})]
						}, order.id)), detail.orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-2 text-muted",
							children: "No orders yet."
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: form.orderingEnabled ? "ordering on" : "ordering off" })
				] })
			]
		})
	] });
}
//#endregion
export { CompanyPage as component };
