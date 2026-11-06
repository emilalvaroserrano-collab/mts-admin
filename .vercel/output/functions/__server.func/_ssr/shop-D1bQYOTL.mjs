import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { H as orderPortalOffering, b as getStorefront } from "./api-CEXWu3z6.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as addToCart } from "./store-cart-C_9hSDdQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-D1bQYOTL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICES = [
	{
		id: "network",
		label: "Connect an office",
		detail: "Bring the network or internet into a new office."
	},
	{
		id: "voip",
		label: "Phone and VoIP",
		detail: "A line, or an extension on the Telxent bill."
	},
	{
		id: "fax",
		label: "Fax",
		detail: "A physical fax line, or eFax to an email address."
	},
	{
		id: "internet",
		label: "Internet",
		detail: "Spectrum, AT&T Fiber, Frontier Fiber, or fixed wireless."
	},
	{
		id: "wiring",
		label: "Wiring",
		detail: "$175 per drop."
	}
];
function OrderPage() {
	const token = useShopToken();
	const shop = useQuery({
		queryKey: ["storefront"],
		queryFn: () => getStorefront()
	});
	const [tab, setTab] = (0, import_react.useState)("equipment");
	const [q, setQ] = (0, import_react.useState)("");
	const [service, setService] = (0, import_react.useState)("network");
	const [site, setSite] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [voipKind, setVoipKind] = (0, import_react.useState)("ext");
	const [shipPhone, setShipPhone] = (0, import_react.useState)(false);
	const [confirmMonthly, setConfirmMonthly] = (0, import_react.useState)(false);
	const [faxKind, setFaxKind] = (0, import_react.useState)("efax");
	const [recipientEmail, setRecipientEmail] = (0, import_react.useState)("");
	const [provider, setProvider] = (0, import_react.useState)("spectrum");
	const [drops, setDrops] = (0, import_react.useState)(1);
	const [done, setDone] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const products = (shop.data?.products ?? []).filter((item) => `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(q.toLowerCase()));
	const slug = shop.data?.slug || "manage-tech-service";
	const phones = (shop.data?.products ?? []).filter((item) => /phone/i.test(`${item.name} ${item.category} ${item.sku}`));
	const place = useMutation({
		mutationFn: () => {
			const offering = service === "voip" ? voipKind === "ext" ? "voip-ext" : "voip-line" : service === "fax" ? faxKind === "efax" ? "fax-efax" : "fax-physical" : service === "internet" ? `internet-${provider}` : service;
			return orderPortalOffering({ data: {
				token,
				offering,
				site,
				notes,
				recipientEmail,
				drops,
				shipPhone: service === "voip" && voipKind === "ext" && shipPhone,
				confirmMonthly
			} });
		},
		onSuccess: (result) => {
			if (service === "voip" && voipKind === "ext" && shipPhone) {
				const sku = phones[0]?.sku || "desk-phone";
				addToCart(sku, 1);
				setDone(`Request ${result.id} is in. The desk phone is in your cart. Telxent still has to confirm the $18 monthly extension before it is billed.`);
			} else if (service === "voip" && voipKind === "ext") setDone(`Request ${result.id} is in. You confirmed $18 per month. Telxent still has to confirm the extension before it is added to the bill.`);
			else if (service === "wiring") setDone(`Request ${result.id} is in. Wiring is ${money(drops * 17500)} for ${drops} drop${drops === 1 ? "" : "s"}. It is not billed until the desk confirms the work.`);
			else setDone(`Request ${result.id} is in. A ticket was opened for the desk.`);
			setError("");
		},
		onError: (cause) => {
			setDone("");
			setError(cause instanceof Error ? cause.message : "Could not send the order.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-5xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Order"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Equipment from the catalog, or a service for the office."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: ["equipment", "services"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item),
					className: tab === item ? "h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white" : "h-10 rounded-full border border-line px-4 text-sm font-semibold",
					children: item === "equipment" ? "Equipment" : "Order services"
				}, item))
			}),
			tab === "equipment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (event) => setQ(event.target.value),
				placeholder: "Search equipment",
				"aria-label": "Search equipment",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-3",
				children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: `/store/${slug}/${product.sku}`,
					className: "overflow-hidden rounded-xl border border-line bg-surface",
					children: [product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: product.imageUrl,
						alt: "",
						className: "aspect-square w-full bg-surface-2 object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square bg-surface-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold",
							children: product.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: money(product.priceCents)
						})]
					})]
				}, product.id))
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					place.mutate();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid content-start gap-2",
					children: SERVICES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setService(item.id),
						className: service === item.id ? "rounded-xl border border-ink bg-surface px-3 py-3 text-left" : "rounded-xl border border-line bg-surface px-3 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: item.detail
						})]
					}, item.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid content-start gap-3 rounded-2xl border border-line bg-surface p-4",
					children: [
						service === "network" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Use this to connect an office to the network, or to bring internet into a new location."
						}) : null,
						service === "voip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										checked: voipKind === "line",
										onChange: () => setVoipKind("line")
									}), " New VoIP phone line"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										checked: voipKind === "ext",
										onChange: () => setVoipKind("ext")
									}), " Add an extension"]
								}),
								voipKind === "ext" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2 rounded-xl bg-surface-2 p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm",
											children: [
												"An extension adds ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: "$18 per month"
												}),
												" to the Telxent VoIP bill. Telxent sends the confirmation. Nothing is billed until that confirmation comes back."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "mt-1",
												checked: confirmMonthly,
												onChange: (event) => setConfirmMonthly(event.target.checked)
											}), "I agree to the $18 monthly extension on the Telxent bill."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "mt-1",
												checked: shipPhone,
												onChange: (event) => setShipPhone(event.target.checked)
											}), "I need a phone shipped. Add a desk phone to the cart."]
										})
									]
								}) : null
							]
						}) : null,
						service === "fax" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										checked: faxKind === "physical",
										onChange: () => setFaxKind("physical")
									}), " Physical fax"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										checked: faxKind === "efax",
										onChange: () => setFaxKind("efax")
									}), " eFax"]
								}),
								faxKind === "efax" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									children: ["Email that should receive incoming faxes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: recipientEmail,
										onChange: (event) => setRecipientEmail(event.target.value),
										type: "email",
										required: true,
										className: "h-11 rounded-xl border border-line px-3"
									})]
								}) : null
							]
						}) : null,
						service === "internet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: [
								["spectrum", "Spectrum cable"],
								["att", "AT&T Fiber"],
								["frontier", "Frontier Fiber"],
								["fixed", "Fixed wireless"]
							].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										checked: provider === id,
										onChange: () => setProvider(id)
									}),
									" ",
									label
								]
							}, id))
						}) : null,
						service === "wiring" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [
								"Number of drops · $175 each",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: drops,
									onChange: (event) => setDrops(Math.max(1, Number(event.target.value) || 1)),
									type: "number",
									min: 1,
									max: 50,
									className: "h-11 w-28 rounded-xl border border-line px-3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [money(drops * 17500), " before the desk confirms the work."]
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Office address", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: site,
								onChange: (event) => setSite(event.target.value),
								className: "h-11 rounded-xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Notes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: notes,
								onChange: (event) => setNotes(event.target.value),
								className: "min-h-24 rounded-xl border border-line px-3 py-2"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-bad",
							children: error
						}) : null,
						done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								done,
								" ",
								shipPhone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "font-semibold text-accent",
									href: `/store/${slug}/checkout`,
									children: "Checkout the phone"
								}) : null
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: place.isPending || !token,
							className: "h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50",
							children: place.isPending ? "Sending" : "Submit order"
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { OrderPage as component };
