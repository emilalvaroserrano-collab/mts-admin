import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [added, setAdded] = useState("");
  const categories = useMemo(() => ["All", ...new Set(store?.products.map((product) => product.category).filter(Boolean) ?? [])], [store]);
  if (!store) return null;
  const needle = q.trim().toLowerCase();
  const products = store.products
    .filter((product) => (category === "All" || product.category === category) && (!needle || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle)))
    .sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  const hero = store.products.find((product) => product.category === "Laptops") ?? store.products[0];

  return (
    <main>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:py-16 lg:grid-cols-2">
          <div className="shop-rise">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Online shop</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">{store.brandName}</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              {store.tagline || "Order laptops, desk PCs, and the accessories that go with them."}
            </p>
            <a href="#catalog" className="shop-press mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white">
              Shop the catalog
            </a>
          </div>
          {hero?.imageUrl ? (
            <Link to="/store/$slug/$sku" params={{ slug: store.slug, sku: hero.sku }} className="shop-rise shop-card block overflow-hidden rounded-[28px] bg-[#eef4f5]">
              <img src={hero.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
            </Link>
          ) : null}
        </div>
      </section>
      <section id="catalog" className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {store.closed ? <p className="mb-4 rounded-2xl bg-warn-soft px-4 py-3 text-sm text-warn">The catalog is hidden right now. Ask your account team to turn it back on.</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search laptops, docks, accessories"
              aria-label="Search products"
              className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base outline-none"
            />
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
            className="h-12 rounded-full border border-line bg-white px-4 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={item === category ? "shop-press h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-white" : "shop-press h-11 shrink-0 rounded-full bg-white px-4 text-sm text-muted"}
            >
              {item}
            </button>
          ))}
        </div>
        {products.length === 0 ? <p className="py-16 text-center text-sm text-muted">Nothing matches that search.</p> : null}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <article key={product.id} className="shop-card shop-rise rounded-[24px] bg-white p-3" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
              <Link to="/store/$slug/$sku" params={{ slug: store.slug, sku: product.sku }} className="block overflow-hidden rounded-[18px] bg-[#eef4f5]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover transition duration-500 hover:scale-[1.03]" />
                ) : (
                  <div className="aspect-square" />
                )}
              </Link>
              <div className="flex items-start justify-between gap-3 px-1 pt-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{product.category}</p>
                  <Link to="/store/$slug/$sku" params={{ slug: store.slug, sku: product.sku }} className="text-base font-semibold">
                    {product.name}
                  </Link>
                </div>
                <p className="text-sm font-semibold tabular-nums">{money(product.priceCents)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  addToCart(product.sku);
                  setAdded(product.sku);
                  window.setTimeout(() => setAdded((current) => (current === product.sku ? "" : current)), 1200);
                }}
                className="shop-press mt-3 h-12 w-full rounded-full bg-accent-soft text-sm font-semibold text-ink"
              >
                {added === product.sku ? "Added" : "Add to cart"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
