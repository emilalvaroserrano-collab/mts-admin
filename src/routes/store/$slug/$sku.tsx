import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhotoLightbox, QtyStepper, StoreFrame, useStore } from "@/components/storefront";
import { money } from "@/lib/portal/format";
import { addToCart } from "@/lib/portal/store-cart";

export const Route = createFileRoute("/store/$slug/$sku")({
  component: ProductPage,
});

function ProductPage() {
  return (
    <StoreFrame>
      <Product />
    </StoreFrame>
  );
}

function Product() {
  const { sku } = Route.useParams();
  const navigate = useNavigate();
  const { query } = useStore();
  const store = query.data;
  const product = store?.products.find((item) => item.sku === sku);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState("");
  const [open, setOpen] = useState(false);
  if (!store) return null;
  if (!product) {
    return (
      <main className="mx-auto grid max-w-3xl gap-3 px-4 py-16 text-sm">
        <p>That product is not in the shop.</p>
        <Link to="/store/$slug" params={{ slug: store.slug }} className="inline-flex text-sm underline">
          Back to the shop
        </Link>
      </main>
    );
  }
  const related = store.products.filter((item) => item.category === product.category && item.sku !== product.sku).slice(0, 3);
  const gallery = product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const shown = photo && gallery.includes(photo) ? photo : product.imageUrl;
  return (
    <main className="grid bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:py-12 lg:grid-cols-2">
        <div className="shop-rise grid content-start gap-3">
          <button type="button" className="shop-press overflow-hidden rounded-[28px] bg-[#eef4f5]" onClick={() => shown && setOpen(true)} aria-label={`View ${product.name}`}>
            {shown ? <img src={shown} alt="" className="aspect-square w-full object-contain transition duration-300 hover:scale-[1.02]" /> : <div className="aspect-square" />}
          </button>
          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((image, index) => (
                <button key={`${index}-${image.length}`} type="button" onClick={() => setPhoto(image)} className={shown === image ? "overflow-hidden rounded-xl border-2 border-ink bg-[#eef4f5]" : "overflow-hidden rounded-xl border border-line bg-[#eef4f5]"}>
                  <img src={image} alt="" className="aspect-square w-full object-contain" />
                </button>
              ))}
            </div>
          ) : null}
          {open && shown ? <PhotoLightbox images={gallery} start={shown} alt={product.name} onClose={() => setOpen(false)} /> : null}
        </div>
        <div className="shop-rise grid content-start gap-4 lg:py-6">
          <Link to="/store/$slug" params={{ slug: store.slug }} className="text-sm text-muted">
            {store.brandName}
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{product.category}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="text-2xl font-semibold tabular-nums">{money(product.priceCents)}</p>
          <p className="max-w-md text-base leading-7 text-muted">{product.description}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              [product.available && product.stock > 0 ? `${product.stock} in stock` : "Confirm stock", "Ready to ship"],
              ["Tracked", "In your account"],
              [product.sku, "SKU"],
            ].map(([title, note]) => (
              <div key={note} className="min-w-0 overflow-hidden rounded-2xl bg-[#f3f6f7] px-3 py-3">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-[11px] text-muted">{note}</p>
              </div>
            ))}
          </div>
          {product.specs ? (
            <ul className="grid gap-2">
              {product.specs.split(/\n|•/).map((line) => line.trim()).filter(Boolean).slice(0, 6).map((line) => (
                <li key={line} className="rounded-2xl border border-line px-4 py-3 text-sm leading-6">{line}</li>
              ))}
            </ul>
          ) : null}
          <div className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <QtyStepper value={qty} label={product.name} onChange={(next) => setQty(Math.max(1, next))} />
              <button type="button" onClick={() => addToCart(product.sku, qty)} className="shop-press h-12 flex-1 rounded-full bg-ink text-sm font-semibold text-white">
                Add to cart
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                addToCart(product.sku, qty);
                navigate({ to: "/store/$slug/checkout", params: { slug: store.slug } });
              }}
              className="shop-press h-12 w-full rounded-full border border-line text-sm font-semibold"
            >
              Buy it now
            </button>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-28 lg:pb-16">
          <h2 className="text-lg font-semibold">Goes with this</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.sku} to="/store/$slug/$sku" params={{ slug: store.slug, sku: item.sku }} className="shop-card grid min-w-0 gap-3 overflow-hidden rounded-3xl border border-line bg-white p-3">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full rounded-2xl bg-[#f3f6f7] object-contain" /> : <div className="aspect-[4/3] rounded-2xl bg-[#f3f6f7]" />}
                <span className="flex items-start justify-between gap-3 px-1">
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-accent">{item.category}</span>
                    <span className="block truncate text-sm font-semibold">{item.name}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{money(item.priceCents)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : <div className="pb-24 md:pb-0" />}
      <div className="fixed inset-x-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden" style={{ bottom: "calc(4.6rem + env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-sm tabular-nums text-muted">{money(product.priceCents)}</p>
          </div>
          <button type="button" onClick={() => addToCart(product.sku, qty)} className="shop-press h-12 shrink-0 rounded-full bg-ink px-5 text-sm font-semibold text-white">
            Add
          </button>
        </div>
      </div>
    </main>
  );
}
