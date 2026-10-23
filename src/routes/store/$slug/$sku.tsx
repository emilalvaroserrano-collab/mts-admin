import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreFrame, useStore } from "@/components/storefront";
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
  const { query } = useStore();
  const store = query.data;
  const product = store?.products.find((item) => item.sku === sku);
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
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2 lg:py-12">
      <div className="overflow-hidden rounded-2xl bg-[#f6f6f6]">
        {product.imageUrl ? <img src={product.imageUrl} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square" />}
      </div>
      <div>
        <Link to="/store/$slug" params={{ slug: store.slug }} className="text-xs text-muted">
          {store.brandName}
        </Link>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-muted">{product.category}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-lg tabular-nums">{money(product.priceCents)}</p>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">{product.description}</p>
        {product.specs ? <p className="mt-3 text-sm text-ink">{product.specs}</p> : null}
        <p className="mt-3 text-xs text-muted">{product.sku}</p>
        <button type="button" onClick={() => addToCart(product.sku)} className="mt-6 h-11 w-full rounded-full bg-ink text-sm font-semibold text-white sm:w-64">
          Add to cart
        </button>
      </div>
    </main>
  );
}
