import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QtyStepper, StoreFrame, useStore } from "@/components/storefront";
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
  if (!store) return null;
  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-sm">
        <p>That product is not in the shop.</p>
        <Link to="/store/$slug" params={{ slug: store.slug }} className="mt-4 inline-block underline">
          Back to the shop
        </Link>
      </main>
    );
  }
  const related = store.products.filter((item) => item.category === product.category && item.sku !== product.sku).slice(0, 3);
  return (
    <main className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:py-12 lg:grid-cols-2">
        <div className="shop-rise overflow-hidden rounded-[28px] bg-[#eef4f5]">
          {product.imageUrl ? <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square" />}
        </div>
        <div className="shop-rise lg:py-6">
          <Link to="/store/$slug" params={{ slug: store.slug }} className="text-sm text-muted">
            {store.brandName}
          </Link>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold tabular-nums">{money(product.priceCents)}</p>
          <p className="mt-4 max-w-md text-base leading-7 text-muted">{product.description}</p>
          {product.specs ? <p className="mt-4 rounded-2xl bg-[#f3f6f7] px-4 py-3 text-sm leading-6">{product.specs}</p> : null}
          <p className="mt-3 text-xs text-muted">{product.sku}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            className="shop-press mt-3 h-12 w-full rounded-full border border-line text-sm font-semibold"
          >
            Buy it now
          </button>
        </div>
      </div>
      {related.length ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-lg font-semibold">You may also like</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.sku} to="/store/$slug/$sku" params={{ slug: store.slug, sku: item.sku }} className="shop-card rounded-3xl bg-[#f7fafb] p-3">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="aspect-square w-full rounded-2xl object-cover" /> : <div className="aspect-square rounded-2xl bg-white" />}
                <p className="mt-3 text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-muted">{money(item.priceCents)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
