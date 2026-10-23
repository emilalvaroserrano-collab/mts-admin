import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { T as saveProduct, _ as removeProduct, h as listProducts } from "./api-PAGCofpy.mjs";
import { c as Router, g as Headphones, h as Keyboard, l as Printer, m as Laptop, n as Video, u as Monitor } from "../_libs/lucide-react.mjs";
import { a as ErrorNote, c as Loading, f as Select, g as errorText, h as Toggle, l as Modal, m as Textarea, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-V14V10_q.mjs";
import { r as money } from "./format-BF_Jz8jj.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-sXrhwnYN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	Laptops: Laptop,
	Docks: Router,
	Displays: Monitor,
	Audio: Headphones,
	Printers: Printer,
	Accessories: Keyboard,
	Video,
	Network: Router
};
var blank = () => ({
	id: 0,
	sku: "",
	name: "",
	category: "Laptops",
	description: "",
	specs: "",
	priceCents: 0,
	imageUrl: "",
	available: true,
	visibility: "all"
});
function ProductsPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [dollars, setDollars] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: (product) => saveProduct({ data: {
			...product,
			id: product.id || void 0
		} }),
		onSuccess: () => {
			toast.success("Equipment saved");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const remove = useMutation({
		mutationFn: (id) => removeProduct({ data: id }),
		onSuccess: (result) => {
			toast.success(result.archived ? "Marked unavailable. It stays on past orders." : "Removed from the catalog");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	function open(product) {
		setDraft(product);
		setDollars((product.priceCents / 100).toFixed(2));
	}
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Catalog",
			title: "Equipment",
			description: "Prices, availability, and who is allowed to order each item.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => open(blank()),
				children: "Add equipment"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: query.data.map((product) => {
				const Icon = ICONS[product.category] ?? Monitor;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => open(product),
					className: "rounded-2xl border border-line bg-surface p-4 text-left hover:bg-surface-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: product.imageUrl,
								alt: "",
								className: "h-14 w-14 rounded-lg object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-14 w-14 place-items-center rounded-lg bg-accent-soft text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: product.available ? "good" : "neutral",
								children: product.available ? "Available" : "Hidden"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-medium",
							children: product.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								product.sku,
								" · ",
								product.category
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-mono text-lg tabular-nums",
							children: money(product.priceCents)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: product.visibility === "authorized" ? "Authorized customers" : "All customers"
						})
					]
				}, product.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: Boolean(draft),
			onOpenChange: (openState) => {
				if (!openState) setDraft(null);
			},
			title: draft?.id ? "Edit equipment" : "Add equipment",
			children: draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					const priceCents = Math.round(Number(dollars) * 100);
					if (!Number.isFinite(priceCents)) {
						toast.error("Enter a price.");
						return;
					}
					save.mutate({
						...draft,
						priceCents
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.name,
							onChange: (event) => setDraft({
								...draft,
								name: event.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "SKU",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.sku,
								onChange: (event) => setDraft({
									...draft,
									sku: event.target.value
								}),
								required: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Price (USD)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: dollars,
								onChange: (event) => setDollars(event.target.value),
								inputMode: "decimal",
								required: true
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Category",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.category,
							onChange: (event) => setDraft({
								...draft,
								category: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Description",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: draft.description,
							onChange: (event) => setDraft({
								...draft,
								description: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Specifications",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: draft.specs,
							onChange: (event) => setDraft({
								...draft,
								specs: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Photo",
						hint: "Optional. Keep it under 120 KB.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "file",
							accept: "image/*",
							onChange: (event) => {
								const file = event.target.files?.[0];
								if (!file) return;
								if (file.size > 12e4) {
									toast.error("Use an image under 120 KB.");
									return;
								}
								const reader = new FileReader();
								reader.onload = () => setDraft({
									...draft,
									imageUrl: String(reader.result ?? "")
								});
								reader.readAsDataURL(file);
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Who can order it",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.visibility,
							onChange: (event) => setDraft({
								...draft,
								visibility: event.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Everyone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "authorized",
								children: "Authorized customers only"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.available,
						onCheckedChange: (available) => setDraft({
							...draft,
							available
						}),
						label: "Available to order"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: save.isPending ? "Saving" : "Save equipment"
						}), draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "danger",
							onClick: () => remove.mutate(draft.id),
							children: "Remove"
						}) : null]
					})
				]
			}) : null
		})
	] });
}
//#endregion
export { ProductsPage as component };
