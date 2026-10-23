import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useParams, b as Link, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-50WTgpEd.mjs";
import { f as getStorefront } from "./api-DpH0j9Yg.mjs";
import { o as ShoppingBag, r as UserRound, t as X } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storefront-fm0PyOEZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "mts-store-cart";
var EMPTY = [];
var lines = EMPTY;
var listeners = /* @__PURE__ */ new Set();
function read() {
	if (typeof window === "undefined") return EMPTY;
	try {
		const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
		if (!Array.isArray(parsed)) return EMPTY;
		return parsed.filter((line) => line && typeof line.sku === "string" && line.quantity > 0);
	} catch {
		return EMPTY;
	}
}
function write(next) {
	lines = next;
	if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
	listeners.forEach((listener) => listener());
}
function ensure() {
	if (typeof window === "undefined" || lines !== EMPTY) return;
	lines = read();
}
function addToCart(sku, quantity = 1) {
	ensure();
	const current = lines === EMPTY ? [] : lines;
	write(current.find((line) => line.sku === sku) ? current.map((line) => line.sku === sku ? {
		...line,
		quantity: Math.min(99, line.quantity + quantity)
	} : line) : [...current, {
		sku,
		quantity
	}]);
}
function setCartQuantity(sku, quantity) {
	ensure();
	const current = lines === EMPTY ? [] : lines;
	write(quantity <= 0 ? current.filter((line) => line.sku !== sku) : current.map((line) => line.sku === sku ? {
		...line,
		quantity
	} : line));
}
function clearCart() {
	write([]);
}
function subscribe(listener) {
	listeners.add(listener);
	ensure();
	return () => listeners.delete(listener);
}
function useCart() {
	return (0, import_react.useSyncExternalStore)(subscribe, () => lines, () => EMPTY);
}
function useStore() {
	const { slug } = useParams({ strict: false });
	return {
		slug,
		query: useQuery({
			queryKey: ["storefront"],
			queryFn: () => getStorefront()
		})
	};
}
function StoreFrame({ children }) {
	const { slug, query } = useStore();
	const [cartOpen, setCartOpen] = (0, import_react.useState)(false);
	const count = useCart().reduce((sum, line) => sum + line.quantity, 0);
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-white text-sm text-muted",
		children: "Opening the shop…"
	});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-white px-6 text-sm text-bad",
		children: query.error.message
	});
	const store = query.data;
	if (store.slug !== slug) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/store/$slug",
		params: { slug: store.slug }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-white text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-ink px-4 py-2 text-center text-[12px] text-white/80",
				children: store.tagline || "Laptops, PCs, and accessories for the teams you support."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center gap-4 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/store/$slug",
							params: { slug: store.slug },
							className: "flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-8 w-8 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white",
								children: "MT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm font-semibold",
								children: store.brandName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "ml-auto hidden items-center gap-5 text-[13px] text-muted sm:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/store/$slug",
								params: { slug: store.slug },
								children: "Shop"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/store/$slug/account",
								params: { slug: store.slug },
								children: "Account"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/store/$slug/account",
							params: { slug: store.slug },
							className: "ml-auto grid size-10 place-items-center rounded-full border border-line sm:ml-0",
							"aria-label": "Account",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "grid h-10 grid-flow-col items-center gap-2 rounded-full border border-line px-3 text-[13px] font-medium",
							onClick: () => setCartOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: count
							})]
						})
					]
				})
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-line px-4 py-10 text-center text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-ink",
					children: store.brandName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1",
					children: store.supportEmail || "Questions go to your account team."
				})]
			}),
			cartOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartDrawer, {
				products: store.products,
				slug: store.slug,
				onClose: () => setCartOpen(false)
			}) : null
		]
	});
}
function CartDrawer({ products, slug, onClose }) {
	const detailed = useCart().map((line) => ({
		...line,
		product: products.find((product) => product.sku === line.sku)
	})).filter((line) => line.product);
	const total = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "absolute inset-0 bg-ink/40",
			"aria-label": "Close cart",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-16 items-center justify-between border-b border-line px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Cart"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-lg border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-4",
					children: [detailed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-sm text-muted",
						children: "Your cart is empty."
					}) : null, detailed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 border-b border-line py-4",
						children: [line.product?.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: line.product.imageUrl,
							alt: "",
							className: "size-16 rounded-lg bg-[#f6f6f6] object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-16 rounded-lg bg-[#f6f6f6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: line.product?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: money(line.product?.priceCents ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-2 flex items-center gap-2 text-xs text-muted",
									children: ["Qty", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										max: 99,
										value: line.quantity,
										onChange: (event) => setCartQuantity(line.sku, Number(event.target.value)),
										className: "h-8 w-16 rounded-lg border border-line px-2 text-sm text-ink"
									})]
								})
							]
						})]
					}, line.sku))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-line p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Subtotal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold tabular-nums",
							children: money(total)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/store/$slug/checkout",
						params: { slug },
						onClick: onClose,
						className: `flex h-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white ${detailed.length === 0 ? "pointer-events-none opacity-40" : ""}`,
						children: "Checkout"
					})]
				})
			]
		})]
	});
}
//#endregion
export { useStore as a, useCart as i, addToCart as n, clearCart as r, StoreFrame as t };
