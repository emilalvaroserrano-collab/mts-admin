import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StoreFrame, useStore } from "@/components/storefront";
import { money } from "@/lib/portal/format";
import { addToCart } from "@/lib/portal/store-cart";

export const Route = createFileRoute("/store/$slug/")({
  component: ShopPage,
});

function ShopPage() {
  return (
    <StoreFrame>
      <Shop />
    </StoreFrame>
  );
}

function Shop() {
  const { query } = useStore();
  const store = query.data;
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(store?.products.map((product) => product.category).filter(Boolean) ?? [])], [store]);
  if (!store) return null;
  const products = store.products.filter((product) => category === "All" || product.category === category);

  return (
    <main>
      <section className="border-b border-line bg-[#f6f6f6]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Online shop</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{store.brandName}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted">
              {store.tagline || "Order laptops, desk PCs, and the accessories that go with them."}
            </p>
          </div>
          {(() => {
            const hero = store.products.find((product) => product.category === "Laptops") ?? store.products[0];
            return hero?.imageUrl ? <img src={hero.imageUrl} alt="" className="aspect-[4/3] w-full rounded-2xl bg-white object-cover" /> : null;
          })()}
        </div>
      </section>
      <section id="catalog" className="mx-auto max-w-6xl px-4 py-10">
        {store.closed ? <p className="text-sm text-muted">The catalog is hidden right now. Ask your account team to turn it back on.</p> : null}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={item === category ? "h-8 shrink-0 rounded-full bg-ink px-3 text-[13px] font-medium text-white" : "h-8 shrink-0 rounded-full border border-line px-3 text-[13px] text-muted"}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="group">
              <Link to="/store/$slug/$sku" params={{ slug: store.slug, sku: product.sku }} className="block overflow-hidden rounded-2xl bg-[#f6f6f6]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                ) : (
                  <div className="aspect-square" />
                )}
              </Link>
              <div className="flex items-start justify-between gap-3 px-1 pt-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted">{product.category}</p>
                  <Link to="/store/$slug/$sku" params={{ slug: store.slug, sku: product.sku }} className="text-sm font-medium">
                    {product.name}
                  </Link>
                </div>
                <p className="text-sm tabular-nums">{money(product.priceCents)}</p>
              </div>
              <button type="button" onClick={() => addToCart(product.sku)} className="mt-3 h-9 w-full rounded-full border border-line text-[13px] font-medium hover:bg-[#f6f6f6]">
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
