import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useParams, b as Link, p as useRouterState, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { b as getStorefront } from "./api-CEXWu3z6.mjs";
import { H as ChevronDown, I as House, L as Headphones, S as Minus, g as Plus, i as UserRound, l as ShoppingBag, n as Wrench, t as X } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useCartNotice, i as useCart, r as setCartQuantity } from "./store-cart-C_9hSDdQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storefront-Pr4Z_0Vf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FREE_SHIPPING = 5e4;
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
	const path = useRouterState({ select: (state) => state.location.pathname });
	const [cartOpen, setCartOpen] = (0, import_react.useState)(false);
	const lines = useCart();
	const notice = useCartNotice();
	const count = lines.reduce((sum, line) => sum + line.quantity, 0);
	const checkout = path.includes("/checkout");
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
	if (checkout) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen max-w-full overflow-x-auto bg-white text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line bg-white",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/store/$slug",
					params: { slug: store.slug },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white",
						children: "MT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold",
						children: store.brandName
					})]
				})
			})
		}), children]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-dvh max-w-full grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-x-auto bg-[#f7fafb] text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-ink px-4 py-2.5 text-center text-[12px] text-white/85",
				children: store.tagline || "Free standard shipping on orders over $500."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line/80 bg-white/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center gap-3 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/store/$slug",
							params: { slug: store.slug },
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-2xl bg-ink text-[11px] font-semibold text-white",
								children: "MT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm font-semibold",
								children: store.brandName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "ml-4 hidden min-w-0 items-center gap-5 text-[13px] md:flex",
							"aria-label": "Store",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug",
									params: { slug: store.slug },
									className: path === `/store/${store.slug}` || path === `/store/${store.slug}/` ? "font-semibold text-ink" : "text-muted hover:text-ink",
									children: "Shop"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/services",
									params: { slug: store.slug },
									className: path.includes("/services") ? "font-semibold text-ink" : "text-muted hover:text-ink",
									children: "MTS Services"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/tickets",
									params: { slug: store.slug },
									className: path.includes("/tickets") ? "font-semibold text-ink" : "text-muted hover:text-ink",
									children: "Tickets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/account",
									params: { slug: store.slug },
									className: path.includes("/account") ? "font-semibold text-ink" : "text-muted hover:text-ink",
									children: "Account"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/store/$slug/account",
								params: { slug: store.slug },
								className: "shop-press grid size-11 place-items-center rounded-full text-ink hover:bg-accent-soft",
								"aria-label": "Account",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "shop-press relative grid size-11 place-items-center rounded-full bg-ink text-white",
								onClick: () => setCartOpen(true),
								"aria-label": `Open cart, ${count} items`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-5" }), count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-5 text-white",
									children: count
								}) : null]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pb-24 md:pb-0",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line bg-white px-4 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-6xl gap-8 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: store.brandName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xs text-sm leading-6 text-muted",
							children: store.tagline || "Laptops, PCs, and the accessories that go with them."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid content-start gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold uppercase tracking-wide text-subtle",
									children: "Shop"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug",
									params: { slug: store.slug },
									className: "text-muted",
									children: "Shop"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/services",
									params: { slug: store.slug },
									className: "text-muted",
									children: "MTS Services"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/tickets",
									params: { slug: store.slug },
									className: "text-muted",
									children: "Tickets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/store/$slug/account",
									params: { slug: store.slug },
									className: "text-muted",
									children: "Account"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid content-start gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold uppercase tracking-wide text-subtle",
									children: "Support"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-words text-muted",
									children: store.supportEmail || "Ask your account team."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: "Free standard shipping over $500."
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-white/95 px-1 pt-1 backdrop-blur md:hidden",
				style: { paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" },
				"aria-label": "Shop",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopTab, {
						to: "/store/$slug",
						params: { slug: store.slug },
						active: path === `/store/${store.slug}` || path === `/store/${store.slug}/`,
						icon: House,
						label: "Shop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopTab, {
						to: "/store/$slug/services",
						params: { slug: store.slug },
						active: path.includes("/services"),
						icon: Wrench,
						label: "Services"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopTab, {
						to: "/store/$slug/tickets",
						params: { slug: store.slug },
						active: path.includes("/tickets"),
						icon: Headphones,
						label: "Tickets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopTab, {
						to: "/store/$slug/account",
						params: { slug: store.slug },
						active: path.includes("/account"),
						icon: UserRound,
						label: "Account"
					})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddedToast, {
				products: store.products,
				notice,
				onOpen: () => setCartOpen(true)
			}) : null,
			cartOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartDrawer, {
				products: store.products,
				slug: store.slug,
				onClose: () => setCartOpen(false)
			}) : null
		]
	});
}
function ShopTab({ to, params, hash, active, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		params,
		hash,
		className: active ? "shop-press flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-ink" : "shop-press flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
	});
}
function AddedToast({ products, notice, onOpen }) {
	const [visible, setVisible] = (0, import_react.useState)(true);
	const product = products.find((item) => item.sku === notice.sku);
	(0, import_react.useEffect)(() => {
		setVisible(true);
		const timer = window.setTimeout(() => setVisible(false), 2400);
		return () => window.clearTimeout(timer);
	}, [notice.at, notice.sku]);
	if (!visible || !product) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "shop-rise fixed inset-x-4 bottom-24 z-30 flex items-center gap-3 rounded-2xl bg-ink px-3 py-3 text-left text-white shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-80",
		children: [product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: product.imageUrl,
			alt: "",
			className: "size-12 rounded-xl object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-12 rounded-xl bg-white/10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-semibold",
			children: "Added to cart"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs text-white/70",
			children: product.name
		})] })]
	});
}
function QtyStepper({ value, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "inline-flex h-11 items-center rounded-full border border-line bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "shop-press grid size-11 place-items-center",
				"aria-label": `Decrease ${label}`,
				onClick: () => onChange(value - 1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-6 text-center text-sm font-semibold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "shop-press grid size-11 place-items-center",
				"aria-label": `Increase ${label}`,
				onClick: () => onChange(Math.min(99, value + 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
			})
		]
	});
}
function CartDrawer({ products, slug, onClose }) {
	const detailed = useCart().map((line) => ({
		...line,
		product: products.find((product) => product.sku === line.sku)
	})).filter((line) => line.product);
	const total = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
	const remaining = Math.max(0, FREE_SHIPPING - total);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "shop-fade absolute inset-0 bg-ink/40",
			"aria-label": "Close cart",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "shop-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-16 items-center justify-between px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-semibold",
						children: "Your cart"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "shop-press grid size-11 place-items-center rounded-full hover:bg-accent-soft",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-4 rounded-2xl bg-accent-soft px-4 py-3 text-xs text-ink",
					children: [remaining === 0 ? "Standard shipping is free on this order." : `Add ${money(remaining)} more for free standard shipping.`, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-1.5 overflow-hidden rounded-full bg-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-accent transition-all",
							style: { width: `${Math.min(100, total / FREE_SHIPPING * 100)}%` }
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-h-0 flex-1 content-start overflow-y-auto px-4",
					children: [detailed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-16 text-center text-sm text-muted",
						children: "Your cart is empty."
					}) : null, detailed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 border-b border-line py-4",
						children: [line.product?.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: line.product.imageUrl,
							alt: "",
							className: "size-20 rounded-2xl bg-[#f3f6f7] object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-20 rounded-2xl bg-[#f3f6f7]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: line.product?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: money(line.product?.priceCents ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyStepper, {
										value: line.quantity,
										label: line.product?.name ?? "item",
										onChange: (next) => setCartQuantity(line.sku, next)
									})
								})
							]
						})]
					}, line.sku))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-line p-4 pb-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "Subtotal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg font-semibold tabular-nums",
								children: money(total)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs text-muted",
							children: "Shipping and taxes are calculated at checkout."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/store/$slug/checkout",
							params: { slug },
							onClick: onClose,
							className: `shop-press flex h-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white ${detailed.length === 0 ? "pointer-events-none opacity-40" : ""}`,
							children: "Checkout"
						})
					]
				})
			]
		})]
	});
}
function SummaryToggle({ total, children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-[#f3f6f7] lg:bg-transparent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex h-14 w-full items-center justify-between px-4 text-sm font-semibold text-accent lg:hidden",
			onClick: () => setOpen((value) => !value),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [
					open ? "Hide order summary" : "Show order summary",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 transition ${open ? "rotate-180" : ""}` })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ink tabular-nums",
				children: total
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: open ? "shop-rise px-4 pb-4 lg:hidden" : "hidden",
			children
		})]
	});
}
function PhotoLightbox({ images, start, alt, onClose }) {
	const list = images.length ? images : start ? [start] : [];
	const [index, setIndex] = (0, import_react.useState)(Math.max(0, list.indexOf(start)));
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
			if (event.key === "ArrowRight") setIndex((current) => (current + 1) % list.length);
			if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + list.length) % list.length);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [list.length, onClose]);
	const src = list[index] ?? start;
	if (!src) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-center px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "shop-fade absolute inset-0 bg-ink/80",
			"aria-label": "Close photo",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
			className: "shop-lightbox relative z-10 grid w-full max-w-3xl justify-items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt,
					className: "max-h-[74vh] w-full rounded-3xl bg-[#eef4f5] object-contain"
				}, src),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
					className: "text-sm text-white",
					children: alt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						list.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shop-press h-11 rounded-full bg-white px-4 text-sm font-semibold",
							onClick: () => setIndex((current) => (current - 1 + list.length) % list.length),
							children: "Previous"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shop-press h-11 rounded-full bg-white px-4 text-sm font-semibold",
							onClick: onClose,
							children: "Close"
						}),
						list.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shop-press h-11 rounded-full bg-white px-4 text-sm font-semibold",
							onClick: () => setIndex((current) => (current + 1) % list.length),
							children: "Next"
						}) : null
					]
				})
			]
		})]
	});
}
//#endregion
export { useStore as a, SummaryToggle as i, QtyStepper as n, StoreFrame as r, PhotoLightbox as t };
