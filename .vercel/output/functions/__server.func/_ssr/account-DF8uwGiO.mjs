import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as paymentLabel, n as day, r as money } from "./format-50WTgpEd.mjs";
import { F as saveShopProfile, L as shopLogin, R as shopLogout, u as getShopAccount, z as shopRegister } from "./api-DpH0j9Yg.mjs";
import { o as Field, r as Button, s as Input } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useStore, t as StoreFrame } from "./storefront-fm0PyOEZ.mjs";
import { n as useShopToken, t as setShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-DF8uwGiO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SHIPMENT = [
	"unfulfilled",
	"shipped",
	"out_for_delivery",
	"delivered"
];
function shipmentLabel(value) {
	if (value === "out_for_delivery") return "Out for delivery";
	if (value === "unfulfilled") return "Not shipped";
	if (value === "shipped") return "Shipped";
	if (value === "delivered") return "Delivered";
	return value || "Not shipped";
}
function AccountPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Account, {}) });
}
function Account() {
	const { slug } = useStore();
	const token = useShopToken();
	const client = useQueryClient();
	const account = useQuery({
		queryKey: ["shop-account", token],
		queryFn: () => getShopAccount({ data: token }),
		enabled: Boolean(token)
	});
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const auth = useMutation({
		mutationFn: () => mode === "up" ? shopRegister({ data: {
			name,
			email,
			password
		} }) : shopLogin({ data: {
			email,
			password
		} }),
		onSuccess: (result) => {
			setShopToken(result.token);
			setPassword("");
			setError("");
		},
		onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not sign in.")
	});
	const signOut = useMutation({
		mutationFn: () => shopLogout({ data: { token } }),
		onSuccess: () => {
			setShopToken("");
			client.removeQueries({ queryKey: ["shop-account"] });
		}
	});
	if (!token || account.data === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-md gap-4 px-4 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: mode === "up" ? "Create account" : "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "See your orders and where each shipment is."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					auth.mutate();
				},
				children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (event) => setName(event.target.value),
							required: true,
							autoComplete: "name"
						})
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
						label: "Password",
						hint: "At least 8 characters.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							required: true,
							minLength: 8,
							autoComplete: mode === "up" ? "new-password" : "current-password"
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: auth.isPending,
						children: auth.isPending ? "Working" : mode === "up" ? "Create account" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-left text-sm text-muted underline-offset-2 hover:underline",
				onClick: () => setMode(mode === "in" ? "up" : "in"),
				children: mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"
			})
		]
	});
	if (account.isPending || !account.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-16 text-center text-sm text-muted",
		children: "Loading your account…"
	});
	const customer = account.data.customer;
	const selected = account.data.orders.find((order) => order.id === openId) ?? account.data.orders[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[16rem_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-muted",
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-2xl font-semibold tracking-tight",
				children: customer.name || "Your profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: customer.email
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-4 text-sm text-muted underline-offset-2 hover:underline",
				onClick: () => signOut.mutate(),
				children: "Sign out"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileForm, {
				token,
				customer
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Orders"
				}),
				account.data.orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "No orders yet."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line rounded-2xl border border-line",
					children: account.data.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm",
						onClick: () => setOpenId(order.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: order.number
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs text-muted",
							children: day(order.createdAt)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block tabular-nums",
								children: money(order.totalCents)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: shipmentLabel(order.shipmentStatus)
							})]
						})]
					}) }, order.id))
				}),
				selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderDetail, {
					order: selected,
					slug
				}) : null
			] })]
		})]
	});
}
function ProfileForm({ token, customer }) {
	const client = useQueryClient();
	const [name, setName] = (0, import_react.useState)(customer.name);
	const [phone, setPhone] = (0, import_react.useState)(customer.phone);
	const [address, setAddress] = (0, import_react.useState)(customer.address);
	const [city, setCity] = (0, import_react.useState)(customer.city);
	const [region, setRegion] = (0, import_react.useState)(customer.region);
	const [postal, setPostal] = (0, import_react.useState)(customer.postal);
	const [country, setCountry] = (0, import_react.useState)(customer.country);
	(0, import_react.useEffect)(() => {
		setName(customer.name);
		setPhone(customer.phone);
		setAddress(customer.address);
		setCity(customer.city);
		setRegion(customer.region);
		setPostal(customer.postal);
		setCountry(customer.country);
	}, [customer]);
	const save = useMutation({
		mutationFn: () => saveShopProfile({ data: {
			token,
			name,
			phone,
			address,
			city,
			region,
			postal,
			country
		} }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["shop-account", token] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3 rounded-2xl border border-line p-4",
		onSubmit: (event) => {
			event.preventDefault();
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (event) => setName(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Phone",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: phone,
					onChange: (event) => setPhone(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: address,
					onChange: (event) => setAddress(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: city,
						onChange: (event) => setCity(event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "State",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: region,
						onChange: (event) => setRegion(event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Postal code",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: postal,
						onChange: (event) => setPostal(event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Country",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: country,
						onChange: (event) => setCountry(event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: save.isPending,
				children: save.isPending ? "Saving" : save.isSuccess ? "Saved" : "Save profile"
			})
		]
	});
}
function OrderDetail({ order, slug }) {
	const reached = Math.max(0, SHIPMENT.indexOf(order.shipmentStatus));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-4 rounded-2xl border border-line p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: order.number
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						paymentLabel(order.paymentMethod),
						" · ",
						order.shippingMethod === "express" ? "Express" : "Standard"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tabular-nums",
					children: money(order.totalCents)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 grid gap-2 sm:grid-cols-4",
				children: SHIPMENT.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: index <= reached ? "rounded-lg bg-ink px-2 py-2 text-xs text-white" : "rounded-lg bg-[#f6f6f6] px-2 py-2 text-xs text-muted",
					children: shipmentLabel(step)
				}, step))
			}),
			order.trackingNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm",
				children: [
					order.trackingCarrier || "Tracking",
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: order.trackingNumber
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No tracking number yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					order.shipAddress,
					order.shipCity,
					order.shipRegion,
					order.shipPostal,
					order.shipCountry
				].filter(Boolean).join(", ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line text-sm",
				children: order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						item.quantity,
						" × ",
						item.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: money(item.quantity * item.unitPriceCents)
					})]
				}, item.sku))
			}),
			order.paymentUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: order.paymentUrl,
				className: "mt-3 inline-block text-sm underline",
				target: "_blank",
				rel: "noreferrer",
				children: "Payment link"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/store/$slug",
				params: { slug },
				className: "mt-4 block text-sm text-muted",
				children: "Back to the shop"
			})
		]
	});
}
//#endregion
export { AccountPage as component };
