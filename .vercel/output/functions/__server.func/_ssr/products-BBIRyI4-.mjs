import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-DhyAHcG6.mjs";
import { F as listProducts, S as importProducts, q as removeProduct, ut as saveProduct } from "./api-CEXWu3z6.mjs";
import { F as ImagePlus, J as ArrowLeft, L as Headphones, N as Laptop, P as Keyboard, c as Star, j as LayoutGrid, k as List, t as X, x as Monitor } from "../_libs/lucide-react.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, f as Select, m as Textarea, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-BBIRyI4-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Laptops",
	"PCs",
	"Displays",
	"Accessories"
];
var ICONS = {
	Laptops: Laptop,
	PCs: Monitor,
	Displays: Monitor,
	Accessories: Keyboard,
	Audio: Headphones
};
var blank = () => ({
	id: 0,
	sku: "",
	name: "",
	category: "Laptops",
	description: "",
	specs: "",
	priceCents: 0,
	stock: 0,
	imageUrl: "",
	images: [],
	available: true,
	visibility: "all"
});
function headerKey(value) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function cell(row, names) {
	for (const [key, value] of Object.entries(row)) if (names.includes(headerKey(key))) return value;
	return "";
}
function categoryName(value) {
	const key = String(value ?? "").trim().toLowerCase();
	if ([
		"laptop",
		"laptops",
		"notebook",
		"notebooks"
	].includes(key)) return "Laptops";
	if ([
		"pc",
		"pcs",
		"desktop",
		"desktops",
		"computer",
		"computers"
	].includes(key)) return "PCs";
	if ([
		"display",
		"displays",
		"monitor",
		"monitors",
		"screen",
		"screens"
	].includes(key)) return "Displays";
	if (!key || [
		"accessory",
		"accessories",
		"audio"
	].includes(key)) return "Accessories";
	return String(value).trim().slice(0, 80);
}
function priceCents(value) {
	const text = String(value ?? "").replace(/[$,\s]/g, "");
	if (!text) return -1;
	const amount = Number(text);
	if (!Number.isFinite(amount) || amount < 0) return -1;
	return Math.round(amount * 100);
}
function yes(value, fallback) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text) return fallback;
	if ([
		"yes",
		"y",
		"true",
		"1",
		"available"
	].includes(text)) return true;
	if ([
		"no",
		"n",
		"false",
		"0",
		"unavailable"
	].includes(text)) return false;
	return fallback;
}
function rowsFromSheet(records) {
	return records.map((record) => {
		const image = String(cell(record, [
			"image",
			"imageurl",
			"photo",
			"photourl"
		]) ?? "").trim();
		const visibility = String(cell(record, ["visibility", "who"]) ?? "").toLowerCase();
		return {
			sku: String(cell(record, [
				"sku",
				"skunumber",
				"productsku"
			]) ?? "").trim(),
			name: String(cell(record, [
				"name",
				"product",
				"productname"
			]) ?? "").trim(),
			category: categoryName(cell(record, ["category", "type"])),
			description: String(cell(record, ["description", "details"]) ?? "").trim(),
			specs: String(cell(record, [
				"specs",
				"specifications",
				"spec"
			]) ?? "").trim(),
			priceCents: priceCents(cell(record, [
				"price",
				"priceusd",
				"usd"
			])),
			imageUrl: image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/") ? image : "",
			available: yes(cell(record, ["available", "instock"]), true),
			visibility: visibility.includes("auth") ? "authorized" : "all"
		};
	});
}
async function spreadsheet() {
	return import("../_libs/xlsx.mjs").then((n) => n.t);
}
function downloadTemplate() {
	spreadsheet().then((XLSX) => {
		const sheet = XLSX.utils.json_to_sheet([{
			SKU: "MT-L16",
			Name: "Studio laptop 16",
			Category: "Laptops",
			Description: "A larger notebook for design desks.",
			Specs: "16-inch display, 32 GB memory, 1 TB storage",
			Price: 1899,
			Available: "yes",
			Visibility: "all",
			Image: ""
		}]);
		sheet["!cols"] = [
			12,
			24,
			16,
			42,
			42,
			12,
			14,
			16,
			28
		].map((wch) => ({ wch }));
		const book = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(book, sheet, "Catalog");
		XLSX.writeFile(book, "catalog-template.xlsx");
	});
}
function readProductPhoto(file) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.width * scale));
			canvas.height = Math.max(1, Math.round(image.height * scale));
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				URL.revokeObjectURL(url);
				reject(/* @__PURE__ */ new Error("Could not read that photo."));
				return;
			}
			ctx.fillStyle = "#f5f5f7";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			let quality = .86;
			let data = canvas.toDataURL("image/jpeg", quality);
			while (data.length > 85e4 && quality > .45) {
				quality -= .12;
				data = canvas.toDataURL("image/jpeg", quality);
			}
			resolve(data);
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not read that photo."));
		};
		image.src = url;
	});
}
function ProductsPage() {
	const client = useQueryClient();
	const fileRef = (0, import_react.useRef)(null);
	const query = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [dollars, setDollars] = (0, import_react.useState)("");
	const [stock, setStock] = (0, import_react.useState)("0");
	const [category, setCategory] = (0, import_react.useState)("All");
	const [search, setSearch] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)("grid");
	const save = useMutation({
		mutationFn: (product) => saveProduct({ data: {
			...product,
			id: product.id || void 0
		} }),
		onSuccess: () => {
			toast.success(draft?.id ? "Product updated" : "Product added to the catalog");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["products"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const remove = useMutation({
		mutationFn: (id) => removeProduct({ data: id }),
		onSuccess: (result) => {
			toast.success(result.archived ? "Marked unavailable. It stays on past orders." : "Removed from the catalog");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["products"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const bringIn = useMutation({
		mutationFn: (rows) => importProducts({ data: { rows } }),
		onSuccess: (result) => {
			const skipped = result.skipped ? `, ${result.skipped} skipped` : "";
			toast.success(`Added ${result.created}, updated ${result.updated}${skipped}`);
			client.invalidateQueries({ queryKey: ["products"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	function open(product) {
		setDraft(product);
		setDollars(product.id ? (product.priceCents / 100).toFixed(2) : "");
		setStock(String(product.stock ?? 0));
	}
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem("mts-catalog-view");
		if (stored === "list" || stored === "grid") setView(stored);
	}, []);
	function chooseView(next) {
		setView(next);
		window.localStorage.setItem("mts-catalog-view", next);
	}
	async function onSpreadsheet(file) {
		try {
			const XLSX = await spreadsheet();
			const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
			const sheet = book.Sheets[book.SheetNames[0] ?? ""];
			if (!sheet) {
				toast.error("That workbook is empty.");
				return;
			}
			const rows = rowsFromSheet(XLSX.utils.sheet_to_json(sheet, { defval: "" })).filter((row) => row.sku || row.name);
			if (!rows.length) {
				toast.error("No product rows found. Use the Excel template.");
				return;
			}
			bringIn.mutate(rows);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not read that spreadsheet.");
		}
	}
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const needle = search.trim().toLowerCase();
	const shown = query.data.filter((product) => {
		if (category !== "All" && product.category !== category) return false;
		if (!needle) return true;
		return `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle);
	});
	if (draft) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductEditor, {
		draft,
		dollars,
		stock,
		saving: save.isPending,
		removing: remove.isPending,
		onChange: setDraft,
		onDollars: setDollars,
		onStock: setStock,
		onClose: () => setDraft(null),
		onRemove: () => remove.mutate(draft.id),
		onSave: () => {
			const priceCents = Math.round(Number(dollars) * 100);
			const quantity = Number(stock);
			if (!draft.name.trim() || !draft.sku.trim()) {
				toast.error("Title and SKU are required.");
				return;
			}
			if (!Number.isFinite(priceCents) || priceCents < 0) {
				toast.error("Enter a price.");
				return;
			}
			if (!Number.isInteger(quantity) || quantity < 0) {
				toast.error("Enter a whole quantity.");
				return;
			}
			save.mutate({
				...draft,
				priceCents,
				stock: quantity
			});
		},
		onPhotos: (files) => {
			const list = [...files].slice(0, 8 - draft.images.length);
			if ([...files].length > list.length) toast.message("A product can hold 8 photos.");
			Promise.all(list.map((file) => {
				if (file.size > 8e6) throw new Error("Use a photo under 8 MB.");
				return readProductPhoto(file);
			})).then((added) => {
				const images = [...draft.images, ...added].slice(0, 8);
				setDraft({
					...draft,
					images,
					imageUrl: draft.imageUrl || images[0] || ""
				});
			}).catch((error) => toast.error(error instanceof Error ? error.message : "Could not read that photo."));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Store",
				title: "Catalog",
				description: "Add a product with a full photo, or upload an Excel file to create many at once.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: downloadTemplate,
						children: "Excel template"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						disabled: bringIn.isPending,
						onClick: () => fileRef.current?.click(),
						children: bringIn.isPending ? "Importing" : "Upload Excel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => open(blank()),
						children: "New product"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				className: "sr-only",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) onSpreadsheet(file);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 overflow-x-auto pb-1",
					children: ["All", ...CATEGORIES].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCategory(item),
						className: category === item ? "h-9 shrink-0 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white" : "h-9 shrink-0 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink",
						children: item
					}, item))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (event) => setSearch(event.target.value),
						placeholder: "Search products",
						"aria-label": "Search products",
						className: "h-9 sm:w-56"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 rounded-lg border border-line bg-surface p-0.5",
						role: "group",
						"aria-label": "Catalog view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === "grid",
							"aria-label": "Grid view",
							onClick: () => chooseView("grid"),
							className: view === "grid" ? "grid size-8 place-items-center rounded-md bg-ink text-white" : "grid size-8 place-items-center rounded-md text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === "list",
							"aria-label": "List view",
							onClick: () => chooseView("list"),
							className: view === "list" ? "grid size-8 place-items-center rounded-md bg-ink text-white" : "grid size-8 place-items-center rounded-md text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
						})]
					})]
				})]
			}),
			shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No products match this view."
			}) : null,
			view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: shown.map((product) => {
					const Icon = ICONS[product.category] ?? Monitor;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => open(product),
						className: "overflow-hidden rounded-xl border border-line bg-surface text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-line-strong",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid aspect-[4/3] place-items-center bg-[#f5f5f7] p-6",
							children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: product.imageUrl,
								alt: "",
								className: "h-full w-full object-contain"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-16 text-ink/80",
								strokeWidth: 1.25
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-muted",
										children: product.category
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: product.available ? "good" : "neutral",
										children: product.available ? "Active" : "Draft"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xl font-medium tracking-tight",
									children: product.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-sm text-muted",
									children: product.description || product.specs
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-lg font-medium tracking-tight",
										children: money(product.priceCents)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-subtle",
										children: [product.stock, " in stock"]
									})]
								})
							]
						})]
					}, product.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "stack-wrap overflow-x-auto rounded-xl border border-line bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "stack-table w-full min-w-[40rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Product"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Inventory"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right font-medium",
								children: "Price"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => open(product),
									className: "flex items-center gap-3 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, { product }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-medium",
										children: product.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: product.sku
									})] })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								"data-label": "Status",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: product.available ? "good" : "neutral",
									children: product.available ? "Active" : "Draft"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 tabular-nums",
								"data-label": "Inventory",
								children: [product.stock, " in stock"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								"data-label": "Category",
								children: product.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right font-medium tabular-nums",
								"data-label": "Price",
								children: money(product.priceCents)
							})
						]
					}, product.id)) })]
				})
			})
		]
	});
}
function ProductThumb({ product }) {
	const Icon = ICONS[product.category] ?? Monitor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f5f7]",
		children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: product.imageUrl,
			alt: "",
			className: "size-full object-contain"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-ink" })
	});
}
function ProductEditor({ draft, dollars, stock, saving, removing, onChange, onDollars, onStock, onClose, onRemove, onSave, onPhotos }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mx-auto grid max-w-5xl gap-4",
		onSubmit: (event) => {
			event.preventDefault();
			onSave();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex items-center gap-2 text-sm font-medium text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Products"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "danger",
							disabled: removing,
							onClick: onRemove,
							children: removing ? "Removing" : "Delete"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: onClose,
							children: "Discard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: saving,
							children: saving ? "Saving" : "Save"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: draft.id ? draft.name || "Edit product" : "Add product"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							className: "grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Title",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.name,
									onChange: (event) => onChange({
										...draft,
										name: event.target.value
									}),
									placeholder: "Short sleeve t-shirt",
									required: true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: draft.description,
									onChange: (event) => onChange({
										...draft,
										description: event.target.value
									}),
									placeholder: "What the customer should know before they order."
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Media"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Add up to 8 photos. The one marked Main is what the shop shows first."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3",
								children: [draft.images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: draft.imageUrl === image ? "grid gap-2 overflow-hidden rounded-xl border-2 border-ink bg-[#f6f6f7] p-2" : "grid gap-2 overflow-hidden rounded-xl border border-line bg-[#f6f6f7] p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: image,
										alt: "",
										className: "aspect-square w-full object-contain"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "inline-flex h-8 items-center gap-1 text-xs font-semibold",
											onClick: () => onChange({
												...draft,
												imageUrl: image
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: draft.imageUrl === image ? "size-3.5 fill-ink" : "size-3.5" }), draft.imageUrl === image ? "Main" : "Set main"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "Remove photo",
											className: "grid size-8 place-items-center rounded-lg text-muted",
											onClick: () => {
												const images = draft.images.filter((item) => item !== image);
												onChange({
													...draft,
													images,
													imageUrl: draft.imageUrl === image ? images[0] ?? "" : draft.imageUrl
												});
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})]
									})]
								}, `${index}-${image.length}`)), draft.images.length < 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid min-h-36 cursor-pointer place-items-center rounded-xl border border-dashed border-line-strong bg-[#f6f6f7] px-3 py-6 text-center text-sm text-muted",
									onDragOver: (event) => event.preventDefault(),
									onDrop: (event) => {
										event.preventDefault();
										onPhotos([...event.dataTransfer.files ?? []]);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "grid justify-items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-6" }), "Add photos"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										multiple: true,
										className: "sr-only",
										onChange: (event) => {
											onPhotos([...event.target.files ?? []]);
											event.target.value = "";
										}
									})]
								}) : null]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Pricing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 max-w-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Price",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: dollars,
									onChange: (event) => onDollars(event.target.value),
									inputMode: "decimal",
									placeholder: "0.00",
									required: true
								})
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Inventory"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "SKU",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.sku,
									onChange: (event) => onChange({
										...draft,
										sku: event.target.value
									}),
									required: true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Quantity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: stock,
									onChange: (event) => onStock(event.target.value),
									inputMode: "numeric",
									required: true
								})
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Specifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: draft.specs,
								onChange: (event) => onChange({
									...draft,
									specs: event.target.value
								}),
								placeholder: "Display, memory, ports, warranty."
							})
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.available ? "active" : "draft",
							onChange: (event) => onChange({
								...draft,
								available: event.target.value === "active"
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "active",
								children: "Active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "draft",
								children: "Draft"
							})]
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Product organization"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: draft.category,
									onChange: (event) => onChange({
										...draft,
										category: event.target.value
									}),
									children: CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item,
										children: item
									}, item))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Sales channel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.visibility,
									onChange: (event) => onChange({
										...draft,
										visibility: event.target.value
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "Online store"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "authorized",
										children: "Authorized customers only"
									})]
								})
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { ProductsPage as component };
