import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as money } from "./format-50WTgpEd.mjs";
import { N as saveProduct, b as listProducts, m as importProducts, w as removeProduct } from "./api-DpH0j9Yg.mjs";
import { g as Headphones, h as Keyboard, l as Plus, m as Laptop, u as Monitor } from "../_libs/lucide-react.mjs";
import { a as ErrorNote, c as Loading, f as Select, g as errorText, h as Toggle, l as Modal, m as Textarea, o as Field, r as Button, s as Input, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as utils, r as writeFileSync, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-DbhNC0qs.js
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
	imageUrl: "",
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
function downloadTemplate() {
	const sheet = utils.json_to_sheet([{
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
	const book = utils.book_new();
	utils.book_append_sheet(book, sheet, "Catalog");
	writeFileSync(book, "catalog-template.xlsx");
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
	const [category, setCategory] = (0, import_react.useState)("All");
	const save = useMutation({
		mutationFn: (product) => saveProduct({ data: {
			...product,
			id: product.id || void 0
		} }),
		onSuccess: () => {
			toast.success(draft?.id ? "Product updated" : "Product added to the catalog");
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
	const bringIn = useMutation({
		mutationFn: (rows) => importProducts({ data: { rows } }),
		onSuccess: (result) => {
			const skipped = result.skipped ? `, ${result.skipped} skipped` : "";
			toast.success(`Added ${result.created}, updated ${result.updated}${skipped}`);
			client.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	function open(product) {
		setDraft(product);
		setDollars(product.id ? (product.priceCents / 100).toFixed(2) : "");
	}
	async function onSpreadsheet(file) {
		try {
			const book = readSync(await file.arrayBuffer(), { type: "array" });
			const sheet = book.Sheets[book.SheetNames[0] ?? ""];
			if (!sheet) {
				toast.error("That workbook is empty.");
				return;
			}
			const rows = rowsFromSheet(utils.sheet_to_json(sheet, { defval: "" })).filter((row) => row.sku || row.name);
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
	const shown = query.data.filter((product) => category === "All" || product.category === category);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 flex gap-2 overflow-x-auto pb-1",
			children: ["All", ...CATEGORIES].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setCategory(item),
				className: category === item ? "h-8 shrink-0 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white" : "h-8 shrink-0 rounded-lg bg-surface px-3 text-[13px] font-medium text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]",
				children: item
			}, item))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => open(blank()),
				className: "grid min-h-72 place-items-center rounded-xl border border-dashed border-line-strong bg-surface text-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "grid justify-items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-6",
						strokeWidth: 1.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: "New product"
					})]
				})
			}), shown.map((product) => {
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted",
								children: product.category
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
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: product.available ? "Available" : "Unavailable"
								})]
							})
						]
					})]
				}, product.id);
			})]
		}),
		shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-sm text-muted",
			children: [
				"Nothing in ",
				category,
				" yet."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: Boolean(draft),
			onOpenChange: (openState) => {
				if (!openState) setDraft(null);
			},
			title: draft?.id ? "Edit product" : "New product",
			description: draft?.id ? "Update the photo, price, and who can order it." : "Add one product to the catalog.",
			children: draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					const priceCents = Math.round(Number(dollars) * 100);
					if (!draft.name.trim() || !draft.sku.trim()) {
						toast.error("Name and SKU are required.");
						return;
					}
					if (!Number.isFinite(priceCents) || priceCents < 0) {
						toast.error("Enter a price.");
						return;
					}
					save.mutate({
						...draft,
						priceCents
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-2xl bg-[#f5f5f7]",
						children: draft.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: draft.imageUrl,
							alt: "",
							className: "aspect-[4/3] w-full object-contain p-4"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid aspect-[4/3] place-items-center text-sm text-muted",
							children: "No photo yet"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Photo",
						hint: "Full product photo. Large files are resized before they are saved.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "file",
							accept: "image/*",
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (!file) return;
								if (file.size > 8e6) {
									toast.error("Use a photo under 8 MB.");
									return;
								}
								readProductPhoto(file).then((imageUrl) => setDraft({
									...draft,
									imageUrl
								})).catch((error) => toast.error(error instanceof Error ? error.message : "Could not read that photo."));
							}
						})
					}),
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
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: draft.category,
							onChange: (event) => setDraft({
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
							children: save.isPending ? "Saving" : draft.id ? "Save product" : "Create product"
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
