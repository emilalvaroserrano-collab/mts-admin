import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./_ssr/format-50WTgpEd.mjs";
import { a as useStore, n as addToCart, t as StoreFrame } from "./_ssr/storefront-fm0PyOEZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CUdLbpK5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {}) });
}
function Shop() {
	const { query } = useStore();
	const store = query.data;
	const [category, setCategory] = (0, import_react.useState)("All");
	const categories = (0, import_react.useMemo)(() => ["All", ...new Set(store?.products.map((product) => product.category).filter(Boolean) ?? [])], [store]);
	if (!store) return null;
	const products = store.products.filter((product) => category === "All" || product.category === category);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-line bg-[#f6f6f6]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-muted",
					children: "Online shop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl",
					children: store.brandName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-sm leading-6 text-muted",
					children: store.tagline || "Order laptops, desk PCs, and the accessories that go with them."
				})
			] }), (() => {
				const hero = store.products.find((product) => product.category === "Laptops") ?? store.products[0];
				return hero?.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: hero.imageUrl,
					alt: "",
					className: "aspect-[4/3] w-full rounded-2xl bg-white object-cover"
				}) : null;
			})()]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "catalog",
		className: "mx-auto max-w-6xl px-4 py-10",
		children: [
			store.closed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "The catalog is hidden right now. Ask your account team to turn it back on."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-4",
				children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCategory(item),
					className: item === category ? "h-8 shrink-0 rounded-full bg-ink px-3 text-[13px] font-medium text-white" : "h-8 shrink-0 rounded-full border border-line px-3 text-[13px] text-muted",
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "group",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/store/$slug/$sku",
							params: {
								slug: store.slug,
								sku: product.sku
							},
							className: "block overflow-hidden rounded-2xl bg-[#f6f6f6]",
							children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: product.imageUrl,
								alt: "",
								className: "aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 px-1 pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wide text-muted",
								children: product.category
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/store/$slug/$sku",
								params: {
									slug: store.slug,
									sku: product.sku
								},
								className: "text-sm font-medium",
								children: product.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm tabular-nums",
								children: money(product.priceCents)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => addToCart(product.sku),
							className: "mt-3 h-9 w-full rounded-full border border-line text-[13px] font-medium hover:bg-[#f6f6f6]",
							children: "Add to cart"
						})
					]
				}, product.id))
			})
		]
	})] });
}
//#endregion
export { ShopPage as component };
