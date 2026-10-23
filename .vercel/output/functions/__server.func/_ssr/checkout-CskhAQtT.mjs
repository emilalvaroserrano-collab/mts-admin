import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as paymentLabel, r as money } from "./format-50WTgpEd.mjs";
import { S as placeStorefrontOrder, d as getShopCheckout, u as getShopAccount } from "./api-DpH0j9Yg.mjs";
import { m as Textarea, o as Field, r as Button, s as Input } from "./ui-scpx6tUJ.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useStore, i as useCart, r as clearCart, t as StoreFrame } from "./storefront-fm0PyOEZ.mjs";
import { n as useShopToken, t as setShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-CskhAQtT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"information",
	"shipping",
	"payment"
];
function CheckoutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkout, {}) });
}
function Checkout() {
	const { slug, query } = useStore();
	const store = query.data;
	const lines = useCart();
	const token = useShopToken();
	const account = useQuery({
		queryKey: ["shop-account", token],
		queryFn: () => getShopAccount({ data: token }),
		enabled: Boolean(token)
	});
	const checkout = useQuery({
		queryKey: ["shop-checkout"],
		queryFn: () => getShopCheckout()
	});
	const [step, setStep] = (0, import_react.useState)("information");
	const [email, setEmail] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [saveAccount, setSaveAccount] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [region, setRegion] = (0, import_react.useState)("");
	const [postal, setPostal] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("United States");
	const [shippingMethod, setShippingMethod] = (0, import_react.useState)("standard");
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const customer = account.data?.customer;
		if (!customer) return;
		setEmail(customer.email);
		setName(customer.name);
		setPhone(customer.phone);
		setAddress(customer.address);
		setCity(customer.city);
		setRegion(customer.region);
		setPostal(customer.postal);
		setCountry(customer.country || "United States");
	}, [account.data]);
	(0, import_react.useEffect)(() => {
		const methods = checkout.data?.methods ?? [];
		if (!paymentMethod && methods[0]) setPaymentMethod(methods[0]);
	}, [checkout.data, paymentMethod]);
	const detailed = lines.map((line) => ({
		...line,
		product: store?.products.find((product) => product.sku === line.sku)
	})).filter((line) => line.product);
	const subtotal = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
	const shippingCents = shippingMethod === "express" ? 2500 : subtotal >= 5e4 ? 0 : 1500;
	const total = subtotal + shippingCents;
	const place = useMutation({
		mutationFn: () => placeStorefrontOrder({ data: {
			name,
			email,
			phone,
			company,
			address,
			city,
			region,
			postal,
			country,
			shippingMethod,
			paymentMethod,
			notes,
			password: saveAccount ? password : "",
			token,
			items: detailed.map((line) => ({
				sku: line.sku,
				quantity: line.quantity
			}))
		} }),
		onSuccess: (result) => {
			if (result.token) setShopToken(result.token);
			clearCart();
		},
		onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not place the order.")
	});
	if (!store) return null;
	if (detailed.length === 0 && !place.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-lg px-4 py-16 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your cart is empty." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/store/$slug",
			params: { slug: store.slug },
			className: "mt-4 inline-block underline",
			children: "Return to the shop"
		})]
	});
	if (place.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-lg px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-muted",
				children: "Thank you"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: place.data.number
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6 text-muted",
				children: "The order is confirmed. Shipment starts as not yet shipped. You can follow it from your account."
			}),
			place.data.paymentUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: place.data.paymentUrl,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white",
				children: "Pay now"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/store/$slug/account",
					params: { slug: store.slug },
					className: "inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-semibold",
					children: "View order"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/store/$slug",
					params: { slug: store.slug },
					className: "inline-flex h-11 items-center text-sm text-muted",
					children: "Keep shopping"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "mb-6 flex flex-wrap items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/store/$slug",
					params: { slug },
					children: "Cart"
				}), STEPS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "/"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: step === item ? "font-semibold text-ink" : "",
						onClick: () => setStep(item),
						children: item === "information" ? "Information" : item === "shipping" ? "Shipping" : "Payment"
					})]
				}, item))]
			}),
			step === "information" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					setStep("shipping");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-semibold",
						children: "Contact"
					}),
					account.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["Signed in as ", account.data.customer.email]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							required: true,
							autoComplete: "email"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (event) => setName(event.target.value),
							required: true,
							autoComplete: "name"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (event) => setPhone(event.target.value),
							autoComplete: "tel"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Company",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: company,
							onChange: (event) => setCompany(event.target.value),
							autoComplete: "organization"
						})
					}),
					account.data ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: saveAccount,
							onChange: (event) => setSaveAccount(event.target.checked)
						}), "Create an account to track this order"]
					}),
					saveAccount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						hint: "At least 8 characters.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							required: true,
							minLength: 8,
							autoComplete: "new-password"
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Continue to shipping"
					})
				]
			}) : null,
			step === "shipping" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					setStep("payment");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-semibold",
						children: "Shipping address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: address,
							onChange: (event) => setAddress(event.target.value),
							required: true,
							autoComplete: "address-line1"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: city,
								onChange: (event) => setCity(event.target.value),
								required: true,
								autoComplete: "address-level2"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "State",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: region,
								onChange: (event) => setRegion(event.target.value),
								autoComplete: "address-level1"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Postal code",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: postal,
								onChange: (event) => setPostal(event.target.value),
								required: true,
								autoComplete: "postal-code"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Country",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: country,
								onChange: (event) => setCountry(event.target.value),
								required: true,
								autoComplete: "country-name"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm font-medium",
								children: "Shipping method"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "ship",
										checked: shippingMethod === "standard",
										onChange: () => setShippingMethod("standard")
									}), "Standard · 5–7 business days"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: subtotal >= 5e4 ? "Free" : money(1500)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "ship",
										checked: shippingMethod === "express",
										onChange: () => setShippingMethod("express")
									}), "Express · 2 business days"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: money(2500)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setStep("information"),
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Continue to payment"
						})]
					})
				]
			}) : null,
			step === "payment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					place.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-semibold",
						children: "Payment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
						className: "grid gap-2",
						children: (checkout.data?.methods ?? ["invoice"]).map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "pay",
									checked: paymentMethod === method,
									onChange: () => setPaymentMethod(method)
								}), paymentLabel(method)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: method === "invoice" ? checkout.data?.invoiceTerms : method === "alternative" ? checkout.data?.alternativeEnvironment === "sandbox" ? "Sandbox" : "Hosted checkout" : ""
							})]
						}, method))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Order notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: notes,
							onChange: (event) => setNotes(event.target.value)
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setStep("shipping"),
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: place.isPending,
							children: place.isPending ? "Placing order" : `Pay ${money(total)}`
						})]
					})
				]
			}) : null
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-2xl bg-[#f6f6f6] p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Order summary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line text-sm",
					children: detailed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							line.quantity,
							" × ",
							line.product?.name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: money(line.quantity * (line.product?.priceCents ?? 0))
						})]
					}, line.sku))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-1 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-ink",
							children: money(subtotal)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shipping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-ink",
							children: shippingCents === 0 ? "Free" : money(shippingCents)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex justify-between text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: money(total)
					})]
				})
			]
		})]
	});
}
//#endregion
export { CheckoutPage as component };
