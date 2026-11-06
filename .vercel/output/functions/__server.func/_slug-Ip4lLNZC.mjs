import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./_ssr/format-DhyAHcG6.mjs";
import { L as Headphones, a as Truck, d as ShieldCheck, j as LayoutGrid, k as List, m as Search } from "./_libs/lucide-react.mjs";
import { t as addToCart } from "./_ssr/store-cart-C_9hSDdQ.mjs";
import { a as useStore, r as StoreFrame, t as PhotoLightbox } from "./_ssr/storefront-Pr4Z_0Vf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-Ip4lLNZC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {}) });
}
function Shop() {
	const { query } = useStore();
	const store = query.data;
	const [category, setCategory] = (0, import_react.useState)("All");
	const [q, setQ] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("featured");
	const [added, setAdded] = (0, import_react.useState)("");
	const [layout, setLayout] = (0, import_react.useState)("grid");
	const [zoom, setZoom] = (0, import_react.useState)(null);
	const categories = (0, import_react.useMemo)(() => ["All", ...new Set(store?.products.map((product) => product.category).filter(Boolean) ?? [])], [store]);
	if (!store) return null;
	const needle = q.trim().toLowerCase();
	const products = store.products.filter((product) => (category === "All" || product.category === category) && (!needle || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle))).sort((a, b) => {
		if (sort === "price-asc") return a.priceCents - b.priceCents;
		if (sort === "price-desc") return b.priceCents - a.priceCents;
		if (sort === "name") return a.name.localeCompare(b.name);
		return 0;
	});
	const heroSlides = pickHero(store.products);
	const spotlight = store.products.find((product) => product.imageUrl && product.available) ?? store.products[0];
	const groups = categoryGroups(store.products);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "overflow-hidden bg-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:gap-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shop-rise grid content-start justify-items-center gap-4 text-center lg:justify-items-start lg:text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent",
								children: "The desk shop"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl",
								children: store.brandName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-md text-base leading-7 text-muted",
								children: store.tagline || "Laptops, desk PCs, and the accessories that ship with them."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-center gap-2 lg:justify-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#catalog",
									className: "shop-press inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white",
									children: "Shop the catalog"
								}), spotlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/$sku",
									params: {
										slug: store.slug,
										sku: spotlight.sku
									},
									className: "shop-press inline-flex h-12 items-center rounded-full border border-line bg-white px-6 text-sm font-semibold",
									children: "Featured"
								}) : null]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroReel, {
						slides: heroSlides,
						slug: store.slug
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4",
				children: [
					[
						Truck,
						"Free over $500",
						"Standard shipping"
					],
					[
						ShieldCheck,
						"Tracked orders",
						"Status in your account"
					],
					[
						Headphones,
						"Desk support",
						store.supportEmail || "Account team"
					],
					[
						LayoutGrid,
						`${store.products.length} products`,
						"Laptops, PCs, accessories"
					]
				].map(([Icon, title, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "grid min-w-0 content-start gap-2 overflow-hidden rounded-2xl border border-line bg-white p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: String(title)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "line-clamp-2 text-xs text-muted",
							children: String(note)
						})
					]
				}, String(title)))
			}),
			groups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid w-full max-w-6xl gap-3 px-4 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Shop by category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#catalog",
						className: "text-sm text-accent",
						children: "All products"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setCategory(group.name);
							document.getElementById("catalog")?.scrollIntoView({
								behavior: "smooth",
								block: "start"
							});
						},
						className: "shop-card grid overflow-hidden rounded-3xl bg-white text-left",
						children: [group.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: group.image,
							alt: "",
							className: "aspect-[4/3] w-full bg-[#eef4f5] object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/3] bg-[#eef4f5]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "grid gap-0.5 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm font-semibold",
								children: group.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									group.count,
									" ",
									group.count === 1 ? "item" : "items"
								]
							})]
						})]
					}, group.name))
				})]
			}) : null,
			spotlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid w-full max-w-6xl px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/store/$slug/$sku",
					params: {
						slug: store.slug,
						sku: spotlight.sku
					},
					className: "grid overflow-hidden rounded-[28px] bg-ink text-white lg:grid-cols-[minmax(0,1fr)_18rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "grid content-center gap-3 p-6 sm:p-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60",
								children: "Featured"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-md text-3xl font-semibold tracking-tight",
								children: spotlight.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-md text-sm leading-6 text-white/70",
								children: spotlight.description || spotlight.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg font-semibold tabular-nums",
								children: money(spotlight.priceCents)
							})
						]
					}), spotlight.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: spotlight.imageUrl,
						alt: "",
						className: "h-56 w-full bg-white/10 object-contain lg:h-full"
					}) : null]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "catalog",
				className: "mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 sm:py-12",
				children: [
					store.closed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl bg-warn-soft px-4 py-3 text-sm text-warn",
						children: "The catalog is hidden right now. Ask your account team to turn it back on."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "relative min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (event) => setQ(event.target.value),
								placeholder: "Search laptops, docks, accessories",
								id: "shop-search",
								"aria-label": "Search products",
								className: "h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base outline-none"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: sort,
								onChange: (event) => setSort(event.target.value),
								"aria-label": "Sort products",
								className: "h-12 w-full rounded-full border border-line bg-white px-4 text-sm sm:w-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "featured",
										children: "Featured"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "price-asc",
										children: "Price, low to high"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "price-desc",
										children: "Price, high to low"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "name",
										children: "Name"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 rounded-full border border-line bg-white p-0.5",
								role: "group",
								"aria-label": "Shop layout",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": layout === "grid",
									"aria-label": "Grid view",
									onClick: () => setLayout("grid"),
									className: layout === "grid" ? "grid size-11 place-items-center rounded-full bg-ink text-white" : "grid size-11 place-items-center rounded-full text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": layout === "list",
									"aria-label": "List view",
									onClick: () => setLayout("list"),
									className: layout === "list" ? "grid size-11 place-items-center rounded-full bg-ink text-white" : "grid size-11 place-items-center rounded-full text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto pb-1",
						children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategory(item),
							className: item === category ? "shop-press h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-white" : "shop-press h-11 shrink-0 rounded-full bg-white px-4 text-sm text-muted",
							children: item
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							products.length,
							" ",
							products.length === 1 ? "product" : "products"
						]
					}),
					products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-3xl bg-white py-16 text-center text-sm text-muted",
						children: "Nothing matches that search."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: layout === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" : "grid w-full gap-3",
						children: products.map((product, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: layout === "grid" ? "shop-card shop-rise grid min-w-0 grid-rows-[auto_1fr_auto] overflow-hidden rounded-[24px] border border-line bg-white p-3" : "shop-card grid w-full grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white p-3",
							style: { animationDelay: `${Math.min(index, 8) * 40}ms` },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => product.imageUrl && setZoom(product),
								className: layout === "grid" ? "relative block overflow-hidden rounded-[18px] bg-[#eef4f5]" : "overflow-hidden rounded-xl bg-[#eef4f5]",
								"aria-label": `View ${product.name}`,
								children: [product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: product.imageUrl,
									alt: "",
									className: "aspect-square w-full object-contain transition duration-300 hover:scale-[1.03]"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: product.available && product.stock > 0 ? "absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink" : "absolute left-3 top-3 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white",
									children: product.available && product.stock > 0 ? `${product.stock} ready` : "Ask the desk"
								})]
							}), layout === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid min-w-0 gap-1 px-1 pt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
										children: product.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/store/$slug/$sku",
											params: {
												slug: store.slug,
												sku: product.sku
											},
											className: "min-w-0 text-base font-semibold",
											children: product.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "shrink-0 text-sm font-semibold tabular-nums",
											children: money(product.priceCents)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "line-clamp-2 text-sm text-muted",
										children: product.description || product.specs || product.sku
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => markAdded(product.sku, setAdded),
								className: "shop-press mt-3 h-12 w-full self-end rounded-full bg-ink text-sm font-semibold text-white",
								children: added === product.sku ? "Added" : "Add to cart"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid min-w-0 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/store/$slug/$sku",
										params: {
											slug: store.slug,
											sku: product.sku
										},
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
											children: product.category
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-semibold",
											children: product.name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold tabular-nums",
										children: money(product.priceCents)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => markAdded(product.sku, setAdded),
									className: "shop-press h-10 rounded-full bg-ink text-sm font-semibold text-white",
									children: added === product.sku ? "Added" : "Add"
								})]
							})]
						}, product.id))
					}),
					zoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoLightbox, {
						images: zoom.images.length ? zoom.images : zoom.imageUrl ? [zoom.imageUrl] : [],
						start: zoom.imageUrl,
						alt: zoom.name,
						onClose: () => setZoom(null)
					}) : null
				]
			})
		]
	});
}
function markAdded(sku, setAdded) {
	addToCart(sku);
	setAdded(sku);
	window.setTimeout(() => setAdded(""), 1200);
}
function categoryGroups(products) {
	const map = /* @__PURE__ */ new Map();
	for (const product of products) {
		const name = product.category || "Other";
		const current = map.get(name) ?? {
			name,
			count: 0,
			image: ""
		};
		current.count += 1;
		if (!current.image && product.imageUrl) current.image = product.imageUrl;
		map.set(name, current);
	}
	return [...map.values()].slice(0, 4);
}
function pickHero(products) {
	const withImage = products.filter((product) => product.imageUrl);
	const picked = [];
	const seen = /* @__PURE__ */ new Set();
	for (const product of withImage) {
		if (seen.has(product.category)) continue;
		seen.add(product.category);
		picked.push(product);
	}
	for (const product of withImage) {
		if (picked.length >= 6) break;
		if (!picked.some((item) => item.sku === product.sku)) picked.push(product);
	}
	return picked.slice(0, 6);
}
function HeroReel({ slides, slug }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (slides.length < 2) return;
		const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4200);
		return () => window.clearInterval(timer);
	}, [slides.length]);
	if (slides.length === 0) return null;
	const active = index % slides.length;
	const slide = slides[active];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid justify-items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-72 w-full overflow-hidden rounded-[32px] bg-[#e7f1f3] sm:h-80 lg:h-[28rem]",
			children: [slides.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/store/$slug/$sku",
				params: {
					slug,
					sku: item.sku
				},
				"aria-hidden": itemIndex !== active,
				className: itemIndex === active ? "hero-slide absolute inset-0 grid place-items-center p-6" : "pointer-events-none absolute inset-0 grid place-items-center p-6 opacity-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.imageUrl,
					alt: "",
					className: "h-full w-auto max-w-full object-contain"
				})
			}, item.sku)), slide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-4 bottom-4 grid gap-0.5 rounded-2xl bg-white/90 px-4 py-3 text-left backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
					children: slide.category
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold",
					children: slide.name
				})]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-center justify-center gap-2",
			children: slides.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": item.name,
				onClick: () => setIndex(itemIndex),
				className: itemIndex === active ? "h-2 w-6 rounded-full bg-ink" : "size-2 rounded-full bg-ink/25"
			}, item.sku))
		})]
	});
}
//#endregion
export { ShopPage as component };
