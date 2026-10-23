import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./_ssr/format-50WTgpEd.mjs";
import { n as Route$2 } from "./_ssr/router-BdeEeSvI.mjs";
import { a as useStore, n as addToCart, t as StoreFrame } from "./_ssr/storefront-fm0PyOEZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_sku-CTc-JFDx.js
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Product, {}) });
}
function Product() {
	const { sku } = Route$2.useParams();
	const { query } = useStore();
	const store = query.data;
	const product = store?.products.find((item) => item.sku === sku);
	if (!store) return null;
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-16 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "That product is not in the shop." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/store/$slug",
			params: { slug: store.slug },
			className: "mt-4 inline-block underline",
			children: "Back to the shop"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2 lg:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-2xl bg-[#f6f6f6]",
			children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: product.imageUrl,
				alt: "",
				className: "aspect-square w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/store/$slug",
				params: { slug: store.slug },
				className: "text-xs text-muted",
				children: store.brandName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11px] uppercase tracking-wide text-muted",
				children: product.category
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-3xl font-semibold tracking-tight",
				children: product.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-lg tabular-nums",
				children: money(product.priceCents)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-sm leading-6 text-muted",
				children: product.description
			}),
			product.specs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-ink",
				children: product.specs
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: product.sku
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => addToCart(product.sku),
				className: "mt-6 h-11 w-full rounded-full bg-ink text-sm font-semibold text-white sm:w-64",
				children: "Add to cart"
			})
		] })]
	});
}
//#endregion
export { ProductPage as component };
