import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Headphones, Keyboard, Laptop, Monitor, Plus, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importProducts, listProducts, removeProduct, saveProduct } from "@/lib/portal/api";
import type { Product } from "@/lib/portal/types";
import { money } from "@/lib/portal/format";
import { Button, ErrorNote, Field, Input, Loading, Modal, PageHeader, Select, Textarea, Toggle, errorText } from "@/components/ui";

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
  imageUrl: "",
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
  const [category, setCategory] = useState<string>("All");
  const save = useMutation({
    mutationFn: (product: Product) => saveProduct({ data: { ...product, id: product.id || undefined } }),
    onSuccess: () => {
      toast.success(draft?.id ? "Product updated" : "Product added to the catalog");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => removeProduct({ data: id }),
    onSuccess: (result) => {
      toast.success(result.archived ? "Marked unavailable. It stays on past orders." : "Removed from the catalog");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const bringIn = useMutation({
    mutationFn: (rows: ImportRow[]) => importProducts({ data: { rows } }),
    onSuccess: (result) => {
      const skipped = result.skipped ? `, ${result.skipped} skipped` : "";
      toast.success(`Added ${result.created}, updated ${result.updated}${skipped}`);
      client.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  function open(product: Product) {
    setDraft(product);
    setDollars(product.id ? (product.priceCents / 100).toFixed(2) : "");
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

  const shown = query.data.filter((product) => category === "All" || product.category === category);

  return (
    <div>
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
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={
              category === item
                ? "h-8 shrink-0 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white"
                : "h-8 shrink-0 rounded-lg bg-surface px-3 text-[13px] font-medium text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            }
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => open(blank())}
          className="grid min-h-72 place-items-center rounded-xl border border-dashed border-line-strong bg-surface text-ink"
        >
          <span className="grid justify-items-center gap-2">
            <Plus className="size-6" strokeWidth={1.5} />
            <span className="text-sm font-medium">New product</span>
          </span>
        </button>
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
                <p className="text-xs font-medium text-muted">{product.category}</p>
                <p className="mt-1 text-xl font-medium tracking-tight">{product.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description || product.specs}</p>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <p className="text-lg font-medium tracking-tight">{money(product.priceCents)}</p>
                  <p className="text-xs text-subtle">{product.available ? "Available" : "Unavailable"}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {shown.length === 0 ? <p className="mt-8 text-sm text-muted">Nothing in {category} yet.</p> : null}
      <Modal
        open={Boolean(draft)}
        onOpenChange={(openState) => {
          if (!openState) setDraft(null);
        }}
        title={draft?.id ? "Edit product" : "New product"}
        description={draft?.id ? "Update the photo, price, and who can order it." : "Add one product to the catalog."}
      >
        {draft ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
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
              save.mutate({ ...draft, priceCents });
            }}
          >
            <div className="overflow-hidden rounded-2xl bg-[#f5f5f7]">
              {draft.imageUrl ? (
                <img src={draft.imageUrl} alt="" className="aspect-[4/3] w-full object-contain p-4" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center text-sm text-muted">No photo yet</div>
              )}
            </div>
            <Field label="Photo" hint="Full product photo. Large files are resized before they are saved.">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  if (file.size > 8_000_000) {
                    toast.error("Use a photo under 8 MB.");
                    return;
                  }
                  void readProductPhoto(file)
                    .then((imageUrl) => setDraft({ ...draft, imageUrl }))
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not read that photo."));
                }}
              />
            </Field>
            <Field label="Name">
              <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <Input value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} required />
              </Field>
              <Field label="Price (USD)">
                <Input value={dollars} onChange={(event) => setDollars(event.target.value)} inputMode="decimal" required />
              </Field>
            </div>
            <Field label="Category">
              <Select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description">
              <Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </Field>
            <Field label="Specifications">
              <Textarea value={draft.specs} onChange={(event) => setDraft({ ...draft, specs: event.target.value })} />
            </Field>
            <Field label="Who can order it">
              <Select value={draft.visibility} onChange={(event) => setDraft({ ...draft, visibility: event.target.value })}>
                <option value="all">Everyone</option>
                <option value="authorized">Authorized customers only</option>
              </Select>
            </Field>
            <Toggle checked={draft.available} onCheckedChange={(available) => setDraft({ ...draft, available })} label="Available to order" />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving" : draft.id ? "Save product" : "Create product"}
              </Button>
              {draft.id ? (
                <Button type="button" variant="danger" onClick={() => remove.mutate(draft.id)}>
                  Remove
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
