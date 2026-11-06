import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as orderEmail, c as shopifyFulfillment, i as orderCustomer, l as shopifyPayment, n as day, o as paymentLabel, r as money, s as shopifyDelivery } from "./format-DhyAHcG6.mjs";
import { A as listOrders, F as listProducts, l as getPayments, t as createOrder, u as getPeople } from "./api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, f as Select, g as ViewSwitch, l as Modal, m as Textarea, o as Field, r as Button, s as Input, t as Badge, u as PageHeader, v as useViewMode } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-g4E_NAAV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function matchesView(order, view) {
	const payment = shopifyPayment(order);
	const fulfillment = shopifyFulfillment(order);
	if (view === "open") return order.status !== "cancelled";
	if (view === "unfulfilled") return fulfillment.label === "Unfulfilled";
	if (view === "unpaid") return payment.label === "Unpaid" || payment.label === "Payment pending" || payment.label === "Authorized";
	if (view === "fulfilled") return fulfillment.label === "Fulfilled";
	if (view === "canceled") return order.status === "cancelled";
	return true;
}
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
	const [view, setView] = (0, import_react.useState)("all");
	const [layout, setLayout] = useViewMode("mts-orders-view", "grid");
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
			client.invalidateQueries({ queryKey: ["shell"] });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					eyebrow: "Catalog",
					title: "Orders",
					description: "Payment, fulfillment, and delivery follow the current state of each order.",
					actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setOpen(true),
						children: "New order"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-center gap-2 md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap justify-center gap-2 md:justify-start",
					children: [
						["all", "All"],
						["open", "Open"],
						["unfulfilled", "Unfulfilled"],
						["unpaid", "Unpaid"],
						["fulfilled", "Fulfilled"],
						["canceled", "Canceled"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setView(id),
						className: view === id ? "h-11 shrink-0 rounded-full bg-ink px-4 text-[13px] font-semibold text-white" : "h-11 shrink-0 rounded-full border border-line bg-surface px-4 text-[13px] text-muted",
						children: label
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewSwitch, {
					mode: layout,
					onChange: setLayout
				})]
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {}) : null,
			query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message }) : null,
			query.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: layout === "grid" ? "grid w-full justify-items-center gap-3 sm:grid-cols-2 sm:justify-items-stretch xl:grid-cols-3" : "grid w-full gap-2 md:hidden",
				children: query.data.filter((order) => matchesView(order, view)).map((order) => {
					const payment = shopifyPayment(order);
					const fulfillment = shopifyFulfillment(order);
					const delivery = shopifyDelivery(order);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/orders/$orderId",
						params: { orderId: String(order.id) },
						className: layout === "grid" ? "grid w-full max-w-md justify-items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:max-w-none sm:text-left sm:justify-items-stretch" : "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left",
						children: layout === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid justify-items-center gap-0.5 sm:justify-items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-semibold",
									children: order.number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: order.organizationName
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular-nums",
								children: money(order.totalCents + order.shippingCents)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-center gap-2 sm:justify-start",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: payment.tone,
										children: payment.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: fulfillment.tone,
										children: fulfillment.label
									}),
									delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: delivery.tone,
										children: delivery.label
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid w-full grid-cols-2 gap-2 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-xl bg-bg px-2 py-2 text-center",
									children: day(order.createdAt)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate rounded-xl bg-bg px-2 py-2 text-center",
									children: orderCustomer(order)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									order.itemCount,
									" ",
									order.itemCount === 1 ? "item" : "items",
									order.trackingNumber ? ` · ${order.trackingNumber}` : ""
								]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-semibold",
							children: order.number
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-0.5 block text-xs text-muted",
							children: [
								orderCustomer(order),
								" · ",
								day(order.createdAt)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-semibold tabular-nums",
								children: money(order.totalCents + order.shippingCents)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: payment.label
							})]
						})] })
					}, order.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: layout === "list" ? "hidden w-full overflow-x-auto rounded-2xl border border-line bg-surface md:block" : "hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[64rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Customer"
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
								children: "Fulfillment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Delivery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Items"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.data.filter((order) => matchesView(order, view)).map((order) => {
						const payment = shopifyPayment(order);
						const fulfillment = shopifyFulfillment(order);
						const delivery = shopifyDelivery(order);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
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
										children: order.organizationName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted",
									"data-label": "Date",
									children: day(order.createdAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3",
									"data-label": "Customer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: orderCustomer(order) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: orderEmail(order) || "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono tabular-nums",
									"data-label": "Total",
									children: money(order.totalCents + order.shippingCents)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3",
									"data-label": "Payment",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: payment.tone,
										children: payment.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: order.paymentMethod ? paymentLabel(order.paymentMethod) : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									"data-label": "Fulfillment",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: fulfillment.tone,
										children: fulfillment.label
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3",
									"data-label": "Delivery",
									children: [delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: delivery.tone,
										children: delivery.label
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "—"
									}), order.trackingNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-xs text-muted",
										children: order.trackingNumber
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 tabular-nums",
									"data-label": "Items",
									children: order.itemCount
								})
							]
						}, order.id);
					}) })]
				})
			})] }) : null,
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
							className: "grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_auto]",
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
								className: "flex items-center justify-between gap-3 border-t border-line py-2",
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
		]
	});
}
//#endregion
export { OrdersPage as component };
