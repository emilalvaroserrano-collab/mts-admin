import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Headphones, ImagePlus, Keyboard, Laptop, LayoutGrid, List, Monitor, Star, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { importProducts, listProducts, removeProduct, saveProduct } from "@/lib/portal/api";
import type { Product } from "@/lib/portal/types";
import { money } from "@/lib/portal/format";
import { Badge, Button, ErrorNote, Field, Input, Loading, PageHeader, Panel, Select, Textarea, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
});

const CATEGORIES = ["Laptops", "PCs", "Displays", "Accessories"] as const;

const ICONS: Record<string, LucideIcon> = {
  Laptops: Laptop,
  PCs: Monitor,
  Displays: Monitor,
  Accessories: Keyboard,
  Audio: Headphones,
};

const blank = (): Product => ({
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
  visibility: "all",
});

type ImportRow = {
  sku: string;
  name: string;
  category: string;
  description: string;
  specs: string;
  priceCents: number;
  imageUrl: string;
  available: boolean;
  visibility: string;
};

function headerKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cell(row: Record<string, unknown>, names: string[]) {
  for (const [key, value] of Object.entries(row)) {
    if (names.includes(headerKey(key))) return value;
  }
  return "";
}

function categoryName(value: unknown) {
  const key = String(value ?? "").trim().toLowerCase();
  if (["laptop", "laptops", "notebook", "notebooks"].includes(key)) return "Laptops";
  if (["pc", "pcs", "desktop", "desktops", "computer", "computers"].includes(key)) return "PCs";
  if (["display", "displays", "monitor", "monitors", "screen", "screens"].includes(key)) return "Displays";
  if (!key || ["accessory", "accessories", "audio"].includes(key)) return "Accessories";
  return String(value).trim().slice(0, 80);
}

function priceCents(value: unknown) {
  const text = String(value ?? "").replace(/[$,\s]/g, "");
  if (!text) return -1;
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) return -1;
  return Math.round(amount * 100);
}

function yes(value: unknown, fallback: boolean) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return fallback;
  if (["yes", "y", "true", "1", "available"].includes(text)) return true;
  if (["no", "n", "false", "0", "unavailable"].includes(text)) return false;
  return fallback;
}

function rowsFromSheet(records: Record<string, unknown>[]): ImportRow[] {
  return records.map((record) => {
    const image = String(cell(record, ["image", "imageurl", "photo", "photourl"]) ?? "").trim();
    const visibility = String(cell(record, ["visibility", "who"]) ?? "").toLowerCase();
    return {
      sku: String(cell(record, ["sku", "skunumber", "productsku"]) ?? "").trim(),
      name: String(cell(record, ["name", "product", "productname"]) ?? "").trim(),
      category: categoryName(cell(record, ["category", "type"])),
      description: String(cell(record, ["description", "details"]) ?? "").trim(),
      specs: String(cell(record, ["specs", "specifications", "spec"]) ?? "").trim(),
      priceCents: priceCents(cell(record, ["price", "priceusd", "usd"])),
      imageUrl: image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/") ? image : "",
      available: yes(cell(record, ["available", "instock"]), true),
      visibility: visibility.includes("auth") ? "authorized" : "all",
    };
  });
}

async function spreadsheet() {
  return import("xlsx");
}

function downloadTemplate() {
  void spreadsheet().then((XLSX) => {
    const sheet = XLSX.utils.json_to_sheet([
    {
      SKU: "MT-L16",
      Name: "Studio laptop 16",
      Category: "Laptops",
      Description: "A larger notebook for design desks.",
      Specs: "16-inch display, 32 GB memory, 1 TB storage",
      Price: 1899,
      Available: "yes",
      Visibility: "all",
      Image: "",
    },
  ]);
  sheet["!cols"] = [12, 24, 16, 42, 42, 12, 14, 16, 28].map((wch) => ({ wch }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Catalog");
    XLSX.writeFile(book, "catalog-template.xlsx");
  });
}

function readProductPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo."));
        return;
      }
      ctx.fillStyle = "#f5f5f7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      let quality = 0.86;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > 850000 && quality > 0.45) {
        quality -= 0.12;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };
    image.src = url;
  });
}

function ProductsPage() {
  const client = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const query = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const [draft, setDraft] = useState<Product | null>(null);
  const [dollars, setDollars] = useState("");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const save = useMutation({
    mutationFn: (product: Product) => saveProduct({ data: { ...product, id: product.id || undefined } }),
    onSuccess: () => {
      toast.success(draft?.id ? "Product updated" : "Product added to the catalog");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => removeProduct({ data: id }),
    onSuccess: (result) => {
      toast.success(result.archived ? "Marked unavailable. It stays on past orders." : "Removed from the catalog");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const bringIn = useMutation({
    mutationFn: (rows: ImportRow[]) => importProducts({ data: { rows } }),
    onSuccess: (result) => {
      const skipped = result.skipped ? `, ${result.skipped} skipped` : "";
      toast.success(`Added ${result.created}, updated ${result.updated}${skipped}`);
      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  function open(product: Product) {
    setDraft(product);
    setDollars(product.id ? (product.priceCents / 100).toFixed(2) : "");
    setStock(String(product.stock ?? 0));
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("mts-catalog-view");
    if (stored === "list" || stored === "grid") setView(stored);
  }, []);

  function chooseView(next: "grid" | "list") {
    setView(next);
    window.localStorage.setItem("mts-catalog-view", next);
  }

  async function onSpreadsheet(file: File) {
    try {
      const XLSX = await spreadsheet();
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0] ?? ""];
      if (!sheet) {
        toast.error("That workbook is empty.");
        return;
      }
      const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows = rowsFromSheet(records).filter((row) => row.sku || row.name);
      if (!rows.length) {
        toast.error("No product rows found. Use the Excel template.");
        return;
      }
      bringIn.mutate(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that spreadsheet.");
    }
  }

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;

  const needle = search.trim().toLowerCase();
  const shown = query.data.filter((product) => {
    if (category !== "All" && product.category !== category) return false;
    if (!needle) return true;
    return `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle);
  });

  if (draft) {
    return (
      <ProductEditor
        draft={draft}
        dollars={dollars}
        stock={stock}
        saving={save.isPending}
        removing={remove.isPending}
        onChange={setDraft}
        onDollars={setDollars}
        onStock={setStock}
        onClose={() => setDraft(null)}
        onRemove={() => remove.mutate(draft.id)}
        onSave={() => {
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
          save.mutate({ ...draft, priceCents, stock: quantity });
        }}
        onPhotos={(files) => {
          const list = [...files].slice(0, 8 - draft.images.length);
          if ([...files].length > list.length) toast.message("A product can hold 8 photos.");
          void Promise.all(list.map((file) => {
            if (file.size > 8_000_000) throw new Error("Use a photo under 8 MB.");
            return readProductPhoto(file);
          }))
            .then((added) => {
              const images = [...draft.images, ...added].slice(0, 8);
              setDraft({ ...draft, images, imageUrl: draft.imageUrl || images[0] || "" });
            })
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not read that photo."));
        }}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="Store"
        title="Catalog"
        description="Add a product with a full photo, or upload an Excel file to create many at once."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={downloadTemplate}>
              Excel template
            </Button>
            <Button type="button" variant="secondary" disabled={bringIn.isPending} onClick={() => fileRef.current?.click()}>
              {bringIn.isPending ? "Importing" : "Upload Excel"}
            </Button>
            <Button type="button" onClick={() => open(blank())}>
              New product
            </Button>
          </>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onSpreadsheet(file);
        }}
      />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...CATEGORIES].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "h-9 shrink-0 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white"
                  : "h-9 shrink-0 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink"
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-9 sm:w-56"
          />
          <div className="flex shrink-0 rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Catalog view">
            <button
              type="button"
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              onClick={() => chooseView("grid")}
              className={view === "grid" ? "grid size-8 place-items-center rounded-md bg-ink text-white" : "grid size-8 place-items-center rounded-md text-muted"}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-pressed={view === "list"}
              aria-label="List view"
              onClick={() => chooseView("list")}
              className={view === "list" ? "grid size-8 place-items-center rounded-md bg-ink text-white" : "grid size-8 place-items-center rounded-md text-muted"}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>
      {shown.length === 0 ? <p className="text-sm text-muted">No products match this view.</p> : null}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((product) => {
            const Icon = ICONS[product.category] ?? Monitor;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => open(product)}
                className="overflow-hidden rounded-xl border border-line bg-surface text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-line-strong"
              >
                <div className="grid aspect-[4/3] place-items-center bg-[#f5f5f7] p-6">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <Icon className="size-16 text-ink/80" strokeWidth={1.25} />
                  )}
                </div>
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted">{product.category}</p>
                    <Badge tone={product.available ? "good" : "neutral"}>{product.available ? "Active" : "Draft"}</Badge>
                  </div>
                  <p className="mt-1 text-xl font-medium tracking-tight">{product.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description || product.specs}</p>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <p className="text-lg font-medium tracking-tight">{money(product.priceCents)}</p>
                    <p className="text-xs text-subtle">{product.stock} in stock</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="stack-wrap overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="stack-table w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Inventory</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((product) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => open(product)} className="flex items-center gap-3 text-left">
                      <ProductThumb product={product} />
                      <span>
                        <span className="block font-medium">{product.name}</span>
                        <span className="block text-xs text-muted">{product.sku}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3" data-label="Status">
                    <Badge tone={product.available ? "good" : "neutral"}>{product.available ? "Active" : "Draft"}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums" data-label="Inventory">{product.stock} in stock</td>
                  <td className="px-4 py-3 text-muted" data-label="Category">{product.category}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums" data-label="Price">{money(product.priceCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const Icon = ICONS[product.category] ?? Monitor;
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f5f7]">
      {product.imageUrl ? <img src={product.imageUrl} alt="" className="size-full object-contain" /> : <Icon className="size-4 text-ink" />}
    </span>
  );
}

function ProductEditor({
  draft,
  dollars,
  stock,
  saving,
  removing,
  onChange,
  onDollars,
  onStock,
  onClose,
  onRemove,
  onSave,
  onPhotos,
}: {
  draft: Product;
  dollars: string;
  stock: string;
  saving: boolean;
  removing: boolean;
  onChange: (product: Product) => void;
  onDollars: (value: string) => void;
  onStock: (value: string) => void;
  onClose: () => void;
  onRemove: () => void;
  onSave: () => void;
  onPhotos: (files: File[]) => void;
}) {
  return (
    <form
      className="mx-auto grid max-w-5xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <ArrowLeft className="size-4" />
          Products
        </button>
        <div className="flex flex-wrap gap-2">
          {draft.id ? (
            <Button type="button" variant="danger" disabled={removing} onClick={onRemove}>
              {removing ? "Removing" : "Delete"}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            Discard
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{draft.id ? draft.name || "Edit product" : "Add product"}</h1>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-4">
          <Panel className="grid gap-3">
            <Field label="Title">
              <Input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="Short sleeve t-shirt" required />
            </Field>
            <Field label="Description">
              <Textarea value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} placeholder="What the customer should know before they order." />
            </Field>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold">Media</h2>
            <p className="mt-1 text-xs text-muted">Add up to 8 photos. The one marked Main is what the shop shows first.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {draft.images.map((image, index) => (
                <div key={`${index}-${image.length}`} className={draft.imageUrl === image ? "grid gap-2 overflow-hidden rounded-xl border-2 border-ink bg-[#f6f6f7] p-2" : "grid gap-2 overflow-hidden rounded-xl border border-line bg-[#f6f6f7] p-2"}>
                  <img src={image} alt="" className="aspect-square w-full object-contain" />
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" className="inline-flex h-8 items-center gap-1 text-xs font-semibold" onClick={() => onChange({ ...draft, imageUrl: image })}>
                      <Star className={draft.imageUrl === image ? "size-3.5 fill-ink" : "size-3.5"} />
                      {draft.imageUrl === image ? "Main" : "Set main"}
                    </button>
                    <button
                      type="button"
                      aria-label="Remove photo"
                      className="grid size-8 place-items-center rounded-lg text-muted"
                      onClick={() => {
                        const images = draft.images.filter((item) => item !== image);
                        onChange({ ...draft, images, imageUrl: draft.imageUrl === image ? images[0] ?? "" : draft.imageUrl });
                      }}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
              {draft.images.length < 8 ? (
                <label
                  className="grid min-h-36 cursor-pointer place-items-center rounded-xl border border-dashed border-line-strong bg-[#f6f6f7] px-3 py-6 text-center text-sm text-muted"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    onPhotos([...(event.dataTransfer.files ?? [])]);
                  }}
                >
                  <span className="grid justify-items-center gap-2">
                    <ImagePlus className="size-6" />
                    Add photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      onPhotos([...(event.target.files ?? [])]);
                      event.target.value = "";
                    }}
                  />
                </label>
              ) : null}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold">Pricing</h2>
            <div className="mt-3 max-w-xs">
              <Field label="Price">
                <Input value={dollars} onChange={(event) => onDollars(event.target.value)} inputMode="decimal" placeholder="0.00" required />
              </Field>
            </div>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold">Inventory</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <Input value={draft.sku} onChange={(event) => onChange({ ...draft, sku: event.target.value })} required />
              </Field>
              <Field label="Quantity">
                <Input value={stock} onChange={(event) => onStock(event.target.value)} inputMode="numeric" required />
              </Field>
            </div>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold">Specifications</h2>
            <div className="mt-3">
              <Textarea value={draft.specs} onChange={(event) => onChange({ ...draft, specs: event.target.value })} placeholder="Display, memory, ports, warranty." />
            </div>
          </Panel>
        </div>
        <div className="grid gap-4">
          <Panel>
            <h2 className="text-sm font-semibold">Status</h2>
            <div className="mt-3">
              <Select value={draft.available ? "active" : "draft"} onChange={(event) => onChange({ ...draft, available: event.target.value === "active" })}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
          </Panel>
          <Panel className="grid gap-3">
            <h2 className="text-sm font-semibold">Product organization</h2>
            <Field label="Category">
              <Select value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value })}>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sales channel">
              <Select value={draft.visibility} onChange={(event) => onChange({ ...draft, visibility: event.target.value })}>
                <option value="all">Online store</option>
                <option value="authorized">Authorized customers only</option>
              </Select>
            </Field>
          </Panel>
        </div>
      </div>
    </form>
  );
}
