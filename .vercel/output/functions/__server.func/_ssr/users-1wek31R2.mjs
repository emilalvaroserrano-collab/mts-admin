import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as day, t as ago } from "./format-DhyAHcG6.mjs";
import { Et as syncPortalUsers, Q as reviewRequest, bt as setShopRole, nt as saveCustomer, u as getPeople, yt as setShopPayLater } from "./api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, f as Select, g as ViewSwitch, h as Toggle, l as Modal, o as Field, p as StatusBadge, r as Button, s as Input, t as Badge, u as PageHeader, v as useViewMode } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-1wek31R2.js
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
	createdAt: "",
	source: "company",
	staffUserId: "",
	phone: "",
	orderCount: 0,
	lastOrderId: null,
	lastOrderStatus: "",
	ticketId: null,
	zendeskTicketId: "",
	payLater: false
});
function PeoplePage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["people"],
		queryFn: () => getPeople()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("all");
	const [layout, setLayout] = useViewMode("mts-people-view");
	const [search, setSearch] = (0, import_react.useState)("");
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
		onSuccess: (result) => {
			toast.success(result.zendeskId ? `Person saved. Zendesk ticket ${result.zendeskId}` : "Person saved");
			if (result.warning) toast.message(result.warning);
			setDraft(null);
			client.invalidateQueries({ queryKey: ["people"] });
			client.invalidateQueries({ queryKey: ["shell"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const role = useMutation({
		mutationFn: (input) => setShopRole({ data: input }),
		onSuccess: () => {
			toast.success("Customer role updated");
			client.invalidateQueries({ queryKey: ["people"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const payLater = useMutation({
		mutationFn: (input) => setShopPayLater({ data: input }),
		onSuccess: () => {
			toast.success("Checkout rule updated");
			client.invalidateQueries({ queryKey: ["people"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const review = useMutation({
		mutationFn: (input) => reviewRequest({ data: input }),
		onSuccess: (result) => {
			toast.success(result.zendeskId ? `Request reviewed. Zendesk ticket ${result.zendeskId}` : "Request reviewed");
			if (result.warning) toast.message(result.warning);
			client.invalidateQueries({ queryKey: ["people"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const syncUsers = useMutation({
		mutationFn: () => syncPortalUsers(),
		onSuccess: (result) => {
			toast.success(result.failed ? `Synced ${result.synced}. ${result.failed} failed.` : `Synced ${result.synced} users to Zendesk`);
			client.invalidateQueries({ queryKey: ["people"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const pending = query.data.requests.filter((request) => request.status === "pending");
	const needle = search.trim().toLowerCase();
	const people = query.data.people.filter((person) => {
		if (view === "active" && !person.active) return false;
		if (view === "inactive" && person.active) return false;
		if (view === "order" && !person.canOrder) return false;
		if (view === "approve" && !person.canApproveOrders) return false;
		if (view === "shop" && person.source !== "shop") return false;
		if (view === "portal" && person.source !== "portal") return false;
		if (view === "company" && person.source !== "company") return false;
		if (!needle) return true;
		return [
			person.name,
			person.email,
			person.organizationName,
			person.title,
			person.phone
		].join(" ").toLowerCase().includes(needle);
	});
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
	function addShopPerson(person) {
		setDraft({
			...blank(),
			name: person.name,
			email: person.email,
			title: "Online shop",
			phone: person.phone,
			organizationId: query.data?.orgs[0]?.id ?? null
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Directory",
				title: "People",
				description: "Company users and online shop customers, with their orders and Zendesk ticket.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: syncUsers.isPending,
					onClick: () => syncUsers.mutate(),
					children: syncUsers.isPending ? "Syncing" : "Sync to Zendesk"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setDraft({
						...blank(),
						organizationId: query.data.orgs[0]?.id ?? null
					}),
					children: "Add person"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid justify-items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:justify-items-stretch",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (event) => setSearch(event.target.value),
						placeholder: "Search name, email, or company",
						"aria-label": "Search people",
						className: "sm:max-w-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto",
						children: [
							["all", "All"],
							["company", "Company"],
							["shop", "Shop"],
							["portal", "Portal"],
							["active", "Active"],
							["inactive", "Inactive"],
							["order", "Can order"],
							["approve", "Approvers"],
							["requests", "Requests"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setView(id),
							className: view === id ? "h-8 shrink-0 rounded-full bg-ink px-3 text-[13px] font-semibold text-white" : "h-8 shrink-0 rounded-full border border-line px-3 text-[13px] text-muted",
							children: [label, id === "requests" && pending.length > 0 ? ` ${pending.length}` : ""]
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewSwitch, {
						mode: layout,
						onChange: setLayout
					})
				]
			}),
			view === "requests" || pending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: view === "requests" ? "Account requests" : "Requests waiting"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 divide-y divide-line",
				children: [(view === "requests" ? query.data.requests : pending).map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: request.requestedName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							request.requestedEmail,
							" · ",
							request.organizationName || "No company",
							" · asked by ",
							request.requestedBy || "unknown",
							" · ",
							ago(request.createdAt)
						]
					})] }), request.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: request.status })]
				}, request.id)), (view === "requests" ? query.data.requests : pending).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3 text-sm text-muted",
					children: "No requests."
				}) : null]
			})] }) : null,
			view !== "requests" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [layout === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid justify-items-center gap-3 sm:grid-cols-2 sm:justify-items-stretch xl:grid-cols-3",
				children: [people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "grid w-full max-w-md justify-items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center sm:max-w-none sm:justify-items-start sm:text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: person.name || person.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: person.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								person.source === "shop" ? "Online shop" : person.organizationName || "No company",
								" · ",
								person.orderCount,
								" orders"
							]
						}),
						person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium",
							children: person.payLater ? "Order now, pay later" : "Pays at checkout"
						}) : null,
						person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => addShopPerson(person),
							children: "Add to company"
						}) : person.source === "portal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: "Staff account"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setDraft(person),
							children: "Edit"
						}),
						person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => payLater.mutate({
								id: person.id,
								payLater: !person.payLater
							}),
							children: person.payLater ? "Require payment" : "Allow pay later"
						}) : null
					]
				}, `${person.source}-${person.staffUserId || person.id}`)), people.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No one matches that view."
				}) : null]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 md:hidden",
				children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-semibold",
						children: person.name || person.email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-xs text-muted",
						children: person.email
					})] }), person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addShopPerson(person),
						children: "Add"
					}) : person.source === "portal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Staff"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setDraft(person),
						children: "Edit"
					})]
				}, `${person.source}-${person.staffUserId || person.id}`))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: layout === "list" ? "hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block" : "hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[56rem] text-left text-sm",
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
								children: "Orders"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Ticket"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Joined"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-medium" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: person.name || person.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: person.email
									}),
									person.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: person.phone
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								"data-label": "Company",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: person.source === "shop" ? "Online shop" : person.source === "portal" ? person.organizationName || "Portal" : person.organizationName || "No company" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: person.source === "company" ? person.title || "—" : person.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Access",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap justify-end gap-1 sm:justify-start",
									children: [
										person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": `Role for ${person.email}`,
											className: "h-8 rounded-lg border border-line bg-white px-2 text-xs",
											value: [
												"regular",
												"buyer",
												"authorized"
											].includes(person.permissionLevel) ? person.permissionLevel : "regular",
											onChange: (event) => role.mutate({
												id: person.id,
												roleId: event.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "regular",
													children: "Customer"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "buyer",
													children: "Shop"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "authorized",
													children: "Account"
												})
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: person.permissionLevel === "authorized" ? "pine" : "neutral",
											children: person.permissionLevel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: person.active ? "active" : "inactive" }),
										person.canOrder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "good",
											children: "Orders"
										}) : null,
										person.canApproveOrders ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "warn",
											children: "Approves"
										}) : null
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								"data-label": "Orders",
								children: [person.lastOrderId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/orders/$orderId",
									params: { orderId: String(person.lastOrderId) },
									className: "font-medium hover:underline",
									children: ["MT-", 1e3 + person.lastOrderId]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										person.orderCount,
										" ",
										person.orderCount === 1 ? "order" : "orders",
										person.lastOrderStatus ? ` · ${person.lastOrderStatus}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Ticket",
								children: person.ticketId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/tickets/$ticketId",
									params: { ticketId: String(person.ticketId) },
									className: "text-accent hover:underline",
									children: person.zendeskTicketId ? `#${person.zendeskTicketId}` : `P-${person.ticketId}`
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: person.zendeskUserId ? `User ${person.zendeskUserId}` : "Not synced"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								"data-label": "Joined",
								children: person.createdAt ? day(person.createdAt) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right",
								"data-label": "Action",
								children: person.source === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => addShopPerson(person),
									children: "Add to company"
								}) : person.source === "portal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Staff account"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setDraft(person),
									children: "Edit"
								})
							})
						]
					}, `${person.source}-${person.staffUserId || person.id}`)) })]
				}), people.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-6 text-sm text-muted",
					children: "No one matches that view."
				}) : null]
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(draft),
				onOpenChange: (open) => {
					if (!open) setDraft(null);
				},
				title: draft?.id ? "Edit person" : "Add person",
				description: "Saving a new person opens their Zendesk ticket. Permissions are checked when they order.",
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
		]
	});
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
