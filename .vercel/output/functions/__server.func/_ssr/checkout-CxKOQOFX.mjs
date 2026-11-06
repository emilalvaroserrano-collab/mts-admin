import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { U as placeStorefrontOrder, v as getShopAccount, y as getShopCheckout } from "./api-CEXWu3z6.mjs";
import { O as Lock, U as Check } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken, t as setShopToken } from "./shop-session-BlA38aat.mjs";
import { i as useCart, n as clearCart } from "./store-cart-C_9hSDdQ.mjs";
import { a as useStore, i as SummaryToggle, r as StoreFrame } from "./storefront-Pr4Z_0Vf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-CxKOQOFX.js
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
		queryKey: ["shop-checkout", token],
		queryFn: () => getShopCheckout({ data: token })
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
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("card");
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
	const detailed = lines.map((line) => ({
		...line,
		product: store?.products.find((product) => product.sku === line.sku)
	})).filter((line) => line.product);
	const subtotal = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
	const shippingCents = shippingMethod === "express" ? 2500 : subtotal >= 5e4 ? 0 : 1500;
	const total = subtotal + shippingCents;
	const stepIndex = STEPS.indexOf(step);
	const place = useMutation({
		mutationFn: (method) => placeStorefrontOrder({ data: {
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
			paymentMethod: method,
			cardBrand: "",
			cardLast4: "",
			cardExp: "",
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
		className: "mx-auto grid max-w-lg justify-items-center gap-4 px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold",
			children: "Your cart is empty"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/store/$slug",
			params: { slug: store.slug },
			className: "shop-press mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white",
			children: "Return to the shop"
		})]
	});
	if (place.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "shop-rise mx-auto grid max-w-lg gap-3 px-4 py-12 sm:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "inline-flex items-center gap-2 text-sm font-semibold text-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), " Order received"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-semibold tracking-tight",
				children: place.data.number
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-7 text-muted",
				children: place.data.paymentUrl ? "This order is not paid yet. Finish payment on the secure page. It is marked paid only after the provider confirms it." : "The order is in your account. An invoice stays unpaid until it is collected."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm",
				children: ["Total ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold tabular-nums",
					children: money(place.data.totalCents)
				})]
			}),
			place.data.paymentUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: place.data.paymentUrl,
				target: "_blank",
				rel: "noreferrer",
				className: "shop-press mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white",
				children: "Continue to payment"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/store/$slug/account",
					params: { slug: store.slug },
					className: "shop-press inline-flex h-12 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold",
					children: "Track this order"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/store/$slug",
					params: { slug: store.slug },
					className: "inline-flex h-12 items-center justify-center text-sm text-muted",
					children: "Keep shopping"
				})]
			})
		]
	});
	const summary = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3",
			children: detailed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative",
						children: [line.product?.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: line.product.imageUrl,
							alt: "",
							className: "size-16 rounded-xl border border-line bg-white object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block size-16 rounded-xl bg-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-5 text-white",
							children: line.quantity
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 text-sm font-medium",
						children: line.product?.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm tabular-nums",
						children: money(line.quantity * (line.product?.priceCents ?? 0))
					})
				]
			}, line.sku))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-2 border-t border-line pt-4 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: "Subtotal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: money(subtotal)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: "Shipping"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: shippingCents === 0 ? "Free" : money(shippingCents)
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 flex items-end justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-muted",
				children: "Total"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xl font-semibold tabular-nums",
				children: money(total)
			})]
		})
	] });
	function go(next) {
		setError("");
		setStep(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "bg-[#f3f6f7] lg:order-2 lg:border-l lg:border-line lg:px-8 lg:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryToggle, {
				total: money(total),
				children: summary
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:block",
				children: summary
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-white px-4 py-6 sm:px-10 lg:order-1 lg:py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-xl gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex flex-wrap items-center gap-2 text-xs text-muted",
						"aria-label": "Checkout",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/store/$slug",
							params: { slug },
							children: "Cart"
						}), STEPS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "/"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: index > stepIndex,
								className: step === item ? "font-semibold text-ink" : index < stepIndex ? "text-accent" : "cursor-default",
								onClick: () => {
									if (index < stepIndex) go(item);
								},
								children: item === "information" ? "Information" : item === "shipping" ? "Shipping" : "Payment"
							})]
						}, item))]
					}),
					step !== "information" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryRow, {
								label: "Contact",
								value: email,
								onChange: () => go("information")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryRow, {
								label: "Ship to",
								value: [
									address,
									city,
									region,
									postal,
									country
								].filter(Boolean).join(", "),
								onChange: () => go("information")
							}),
							step === "payment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryRow, {
								label: "Method",
								value: shippingMethod === "express" ? `Express · ${money(2500)}` : `Standard · ${shippingCents === 0 ? "Free" : money(shippingCents)}`,
								onChange: () => go("shipping")
							}) : null
						]
					}) : null,
					step === "information" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "shop-rise grid gap-4",
						onSubmit: (event) => {
							event.preventDefault();
							go("shipping");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-lg font-semibold",
								children: "Contact"
							}),
							account.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: ["Signed in as ", account.data.customer.email]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: ["Already have an account? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/account",
									params: { slug },
									className: "font-semibold text-accent",
									children: "Sign in"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "email",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									required: true,
									autoComplete: "email",
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "pt-2 text-lg font-semibold",
								children: "Delivery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Country",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: country,
									onChange: (event) => setCountry(event.target.value),
									required: true,
									autoComplete: "country-name",
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
									label: "Full name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: name,
										onChange: (event) => setName(event.target.value),
										required: true,
										autoComplete: "name",
										className: fieldClass
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
									label: "Company (optional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: company,
										onChange: (event) => setCompany(event.target.value),
										autoComplete: "organization",
										className: fieldClass
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: address,
									onChange: (event) => setAddress(event.target.value),
									required: true,
									autoComplete: "address-line1",
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
										label: "City",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: city,
											onChange: (event) => setCity(event.target.value),
											required: true,
											autoComplete: "address-level2",
											className: fieldClass
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
										label: "State",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: region,
											onChange: (event) => setRegion(event.target.value),
											autoComplete: "address-level1",
											className: fieldClass
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
										label: "Postal code",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: postal,
											onChange: (event) => setPostal(event.target.value),
											required: true,
											autoComplete: "postal-code",
											className: fieldClass
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: phone,
									onChange: (event) => setPhone(event.target.value),
									autoComplete: "tel",
									className: fieldClass
								})
							}),
							account.data ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "size-5",
									checked: saveAccount,
									onChange: (event) => setSaveAccount(event.target.checked)
								}), "Save this information and create an account"]
							}),
							saveAccount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Password",
								hint: "At least 8 characters.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "password",
									value: password,
									onChange: (event) => setPassword(event.target.value),
									required: true,
									minLength: 8,
									autoComplete: "new-password",
									className: fieldClass
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "shop-press h-12 rounded-xl bg-ink text-sm font-semibold text-white",
								children: "Continue to shipping"
							})
						]
					}) : null,
					step === "shipping" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "shop-rise grid gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							go("payment");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-lg font-semibold",
								children: "Shipping method"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: choiceClass(shippingMethod === "standard"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "ship",
										className: "size-5",
										checked: shippingMethod === "standard",
										onChange: () => setShippingMethod("standard")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-semibold",
										children: "Standard"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "5–7 business days"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: subtotal >= 5e4 ? "Free" : money(1500)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: choiceClass(shippingMethod === "express"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "ship",
										className: "size-5",
										checked: shippingMethod === "express",
										onChange: () => setShippingMethod("express")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-semibold",
										children: "Express"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "2 business days"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: money(2500)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-12 text-sm text-accent",
									onClick: () => go("information"),
									children: "Return to information"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "shop-press h-12 rounded-xl bg-ink px-6 text-sm font-semibold text-white sm:min-w-52",
									children: "Continue to payment"
								})]
							})
						]
					}) : null,
					step === "payment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "shop-rise grid gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							setPaymentMethod("card");
							setError("");
							place.mutate("card");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "flex items-center gap-2 text-lg font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Payment"]
							}),
							checkout.data && !checkout.data.signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/login",
								className: "flex h-12 items-center justify-center rounded-xl bg-ink text-sm font-semibold text-white",
								children: "Sign in to the customer portal"
							}) : null,
							checkout.data?.signedIn && !checkout.data.canPurchase ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn",
								children: "This account cannot purchase products."
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Pay now opens the configured payment page. The order stays unpaid until that provider confirms the charge. Card numbers are not stored here."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopField, {
								label: "Order notes (optional)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: notes,
									onChange: (event) => setNotes(event.target.value),
									className: `${fieldClass} h-24 py-3`
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-bad",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 grid gap-3",
								children: [
									checkout.data?.canPayNow ?? false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: place.isPending || !checkout.data?.canPurchase,
										className: "shop-press h-12 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
										children: place.isPending && paymentMethod === "card" ? "Placing order" : `Pay now · ${money(total)}`
									}) : checkout.data?.signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted",
										children: "Immediate payment is turned off for this account."
									}) : null,
									checkout.data?.payLater ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: place.isPending,
										onClick: () => {
											setPaymentMethod("pay_later");
											setError("");
											place.mutate("pay_later");
										},
										className: "shop-press h-12 rounded-xl border border-ink text-sm font-semibold disabled:opacity-50",
										children: "Order now, pay later"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted",
										children: "This account pays before the order is placed."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-12 text-sm text-accent",
										onClick: () => go("shipping"),
										children: "Return to shipping"
									})
								]
							})
						]
					}) : null
				]
			})
		})]
	});
}
var fieldClass = "h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-ink outline-none focus:border-accent";
function choiceClass(selected) {
	return `flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${selected ? "border-ink bg-accent-soft" : "border-line bg-white"}`;
}
function ShopField({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function SummaryRow({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-start gap-2 bg-[#f7fafb] px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: value || "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-accent",
				onClick: onChange,
				children: "Change"
			})
		]
	});
}
//#endregion
export { CheckoutPage as component };
