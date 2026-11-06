import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./_ssr/format-DhyAHcG6.mjs";
import { n as Route$4 } from "./_ssr/router-DN3-t_kz.mjs";
import { t as addToCart } from "./_ssr/store-cart-C_9hSDdQ.mjs";
import { a as useStore, n as QtyStepper, r as StoreFrame, t as PhotoLightbox } from "./_ssr/storefront-Pr4Z_0Vf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_sku-BWvtWSEo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Product, {}) });
}
function Product() {
	const { sku } = Route$4.useParams();
	const navigate = useNavigate();
	const { query } = useStore();
	const store = query.data;
	const product = store?.products.find((item) => item.sku === sku);
	const [qty, setQty] = (0, import_react.useState)(1);
	const [photo, setPhoto] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!store) return null;
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-3xl gap-3 px-4 py-16 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "That product is not in the shop." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/store/$slug",
			params: { slug: store.slug },
			className: "inline-flex text-sm underline",
			children: "Back to the shop"
		})]
	});
	const related = store.products.filter((item) => item.category === product.category && item.sku !== product.sku).slice(0, 3);
	const gallery = product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
	const shown = photo && gallery.includes(photo) ? photo : product.imageUrl;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:py-12 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shop-rise grid content-start gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shop-press overflow-hidden rounded-[28px] bg-[#eef4f5]",
							onClick: () => shown && setOpen(true),
							"aria-label": `View ${product.name}`,
							children: shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: shown,
								alt: "",
								className: "aspect-square w-full object-contain transition duration-300 hover:scale-[1.02]"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square" })
						}),
						gallery.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-2",
							children: gallery.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPhoto(image),
								className: shown === image ? "overflow-hidden rounded-xl border-2 border-ink bg-[#eef4f5]" : "overflow-hidden rounded-xl border border-line bg-[#eef4f5]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: image,
									alt: "",
									className: "aspect-square w-full object-contain"
								})
							}, `${index}-${image.length}`))
						}) : null,
						open && shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoLightbox, {
							images: gallery,
							start: shown,
							alt: product.name,
							onClose: () => setOpen(false)
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shop-rise grid content-start gap-4 lg:py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/store/$slug",
							params: { slug: store.slug },
							className: "text-sm text-muted",
							children: store.brandName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-accent",
							children: product.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-semibold tracking-tight sm:text-5xl",
							children: product.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold tabular-nums",
							children: money(product.priceCents)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-base leading-7 text-muted",
							children: product.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								[product.available && product.stock > 0 ? `${product.stock} in stock` : "Confirm stock", "Ready to ship"],
								["Tracked", "In your account"],
								[product.sku, "SKU"]
							].map(([title, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 overflow-hidden rounded-2xl bg-[#f3f6f7] px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-[11px] text-muted",
									children: note
								})]
							}, note))
						}),
						product.specs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2",
							children: product.specs.split(/\n|•/).map((line) => line.trim()).filter(Boolean).slice(0, 6).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-2xl border border-line px-4 py-3 text-sm leading-6",
								children: line
							}, line))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyStepper, {
									value: qty,
									label: product.name,
									onChange: (next) => setQty(Math.max(1, next))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => addToCart(product.sku, qty),
									className: "shop-press h-12 flex-1 rounded-full bg-ink text-sm font-semibold text-white",
									children: "Add to cart"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									addToCart(product.sku, qty);
									navigate({
										to: "/store/$slug/checkout",
										params: { slug: store.slug }
									});
								},
								className: "shop-press h-12 w-full rounded-full border border-line text-sm font-semibold",
								children: "Buy it now"
							})]
						})
					]
				})]
			}),
			related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid max-w-6xl gap-4 px-4 pb-28 lg:pb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Goes with this"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/store/$slug/$sku",
						params: {
							slug: store.slug,
							sku: item.sku
						},
						className: "shop-card grid min-w-0 gap-3 overflow-hidden rounded-3xl border border-line bg-white p-3",
						children: [item.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.imageUrl,
							alt: "",
							className: "aspect-[4/3] w-full rounded-2xl bg-[#f3f6f7] object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/3] rounded-2xl bg-[#f3f6f7]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-start justify-between gap-3 px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] font-semibold uppercase tracking-wide text-accent",
									children: item.category
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-semibold",
									children: item.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold tabular-nums",
								children: money(item.priceCents)
							})]
						})]
					}, item.sku))
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pb-24 md:pb-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden",
				style: { bottom: "calc(4.6rem + env(safe-area-inset-bottom))" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold",
							children: product.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm tabular-nums text-muted",
							children: money(product.priceCents)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => addToCart(product.sku, qty),
						className: "shop-press h-12 shrink-0 rounded-full bg-ink px-5 text-sm font-semibold text-white",
						children: "Add"
					})]
				})
			})
		]
	});
}
//#endregion
export { ProductPage as component };
