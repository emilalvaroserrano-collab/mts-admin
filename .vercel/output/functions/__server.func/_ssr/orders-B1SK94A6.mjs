import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as paymentLabel, r as money } from "./format-50WTgpEd.mjs";
import { _ as listOrders, b as listProducts, o as getPayments, s as getPeople, t as createOrder } from "./api-DpH0j9Yg.mjs";
import { a as ErrorNote, c as Loading, f as Select, g as errorText, l as Modal, m as Textarea, o as Field, p as StatusBadge, r as Button, s as Input, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-B1SK94A6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const query = useQuery({
		queryKey: ["orders"],
		queryFn: () => listOrders()
	});
	const people = useQuery({
		queryKey: ["people"],
		queryFn: () => getPeople()
	});
	const products = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts()
	});
	const payments = useQuery({
		queryKey: ["payments"],
		queryFn: () => getPayments()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [organizationId, setOrganizationId] = (0, import_react.useState)("");
	const [customerUserId, setCustomerUserId] = (0, import_react.useState)("");
	const [productId, setProductId] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [notes, setNotes] = (0, import_react.useState)("");
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([]);
	const navigate = useNavigate();
	const client = useQueryClient();
	const save = useMutation({
		mutationFn: () => createOrder({ data: {
			organizationId: Number(organizationId),
			customerUserId: customerUserId === "" ? null : Number(customerUserId),
			notes,
			paymentMethod: paymentMethod || payments.data?.methods[0] || "",
			returnUrl: `${window.location.origin}/orders`,
			items: lines.map((line) => ({
				productId: line.productId,
				quantity: line.quantity
			}))
		} }),
		onSuccess: (result) => {
			toast.success("Order created");
			setOpen(false);
			setLines([]);
			setNotes("");
			client.invalidateQueries({ queryKey: ["orders"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
			if (result.paymentUrl && (paymentMethod || payments.data?.methods[0]) === "alternative") window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
			navigate({
				to: "/orders/$orderId",
				params: { orderId: String(result.id) }
			});
		},
		onError: (error) => toast.error(errorText(error))
	});
	const companyPeople = people.data?.people.filter((person) => person.organizationId === organizationId && person.active) ?? [];
	const catalog = products.data?.filter((product) => product.available) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Catalog",
			title: "Orders",
			description: "What was requested, who approved it, and the Zendesk ticket that tracks it.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setOpen(true),
				children: "New order"
			})
		}),
		query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {}) : null,
		query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message }) : null,
		query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-2xl border border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[44rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Company"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Ticket"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Status"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.data.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/orders/$orderId",
								params: { orderId: String(order.id) },
								className: "font-medium hover:underline",
								children: order.number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: order.customerName || "Desk order"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: order.organizationName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: money(order.totalCents)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: order.paymentMethod ? paymentLabel(order.paymentMethod) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: order.zendeskTicketId ? `#${order.zendeskTicketId}` : order.ticketId ? `P-${order.ticketId}` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: order.status })
						})
					]
				}, order.id)) })]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open,
			onOpenChange: setOpen,
			title: "New order",
			description: "Ordering follows the company rules and the person's permissions.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					save.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Company",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: organizationId,
							onChange: (event) => {
								setOrganizationId(event.target.value ? Number(event.target.value) : "");
								setCustomerUserId("");
							},
							required: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose"
							}), people.data?.orgs.map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: org.id,
								children: org.name
							}, org.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Requester",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: customerUserId,
							onChange: (event) => setCustomerUserId(event.target.value ? Number(event.target.value) : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Desk, no customer"
							}), companyPeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: person.id,
								children: person.name
							}, person.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: productId,
								onChange: (event) => setProductId(event.target.value ? Number(event.target.value) : ""),
								"aria-label": "Product",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Product"
								}), catalog.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: product.id,
									children: product.name
								}, product.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								value: quantity,
								onChange: (event) => setQuantity(Number(event.target.value)),
								"aria-label": "Quantity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => {
									const product = catalog.find((item) => item.id === productId);
									if (!product) return;
									setLines((current) => [...current, {
										productId: product.id,
										name: product.name,
										quantity
									}]);
									setProductId("");
									setQuantity(1);
								},
								children: "Add"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "text-sm",
						children: lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between border-t border-line py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								line.quantity,
								" × ",
								line.name
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-muted",
								onClick: () => setLines(lines.filter((_, item) => item !== index)),
								children: "Remove"
							})]
						}, `${line.productId}-${index}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Payment",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: paymentMethod || payments.data?.methods[0] || "",
							onChange: (event) => setPaymentMethod(event.target.value),
							children: (payments.data?.methods ?? []).map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: method,
								children: [paymentLabel(method), method === "invoice" && payments.data ? ` · ${payments.data.invoiceTerms}` : ""]
							}, method))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: notes,
							onChange: (event) => setNotes(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending || lines.length === 0,
						children: save.isPending ? "Saving" : "Place order"
					})
				]
			})
		})
	] });
}
//#endregion
export { OrdersPage as component };
