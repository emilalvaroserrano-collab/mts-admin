import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "@tanstack/react-router";
import { ShoppingBag, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getStorefront } from "@/lib/portal/api";
import { money } from "@/lib/portal/format";
import { setCartQuantity, useCart } from "@/lib/portal/store-cart";
import type { Product } from "@/lib/portal/types";

export function useStore() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const query = useQuery({ queryKey: ["storefront"], queryFn: () => getStorefront() });
  return { slug, query };
}

export function StoreFrame({ children }: { children: ReactNode }) {
  const { slug, query } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const lines = useCart();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (query.isPending) {
    return <main className="grid min-h-screen place-items-center bg-white text-sm text-muted">Opening the shop…</main>;
  }
  if (query.isError) {
    return <main className="grid min-h-screen place-items-center bg-white px-6 text-sm text-bad">{query.error.message}</main>;
  }
  const store = query.data;
  if (store.slug !== slug) return <Navigate to="/store/$slug" params={{ slug: store.slug }} />;

  return (
    <div className="min-h-screen bg-white text-ink">
      <div className="bg-ink px-4 py-2 text-center text-[12px] text-white/80">
        {store.tagline || "Laptops, PCs, and accessories for the teams you support."}
      </div>
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/store/$slug" params={{ slug: store.slug }} className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white">MT</span>
            <span className="truncate text-sm font-semibold">{store.brandName}</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-[13px] text-muted sm:flex">
            <Link to="/store/$slug" params={{ slug: store.slug }}>Shop</Link>
            <Link to="/store/$slug/account" params={{ slug: store.slug }}>Account</Link>
          </nav>
          <Link
            to="/store/$slug/account"
            params={{ slug: store.slug }}
            className="ml-auto grid size-10 place-items-center rounded-full border border-line sm:ml-0"
            aria-label="Account"
          >
            <UserRound className="size-4" />
          </Link>
          <button
            type="button"
            className="grid h-10 grid-flow-col items-center gap-2 rounded-full border border-line px-3 text-[13px] font-medium"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-4" />
            <span className="tabular-nums">{count}</span>
          </button>
        </div>
      </header>
      {children}
      <footer className="border-t border-line px-4 py-10 text-center text-xs text-muted">
        <p className="font-medium text-ink">{store.brandName}</p>
        <p className="mt-1">{store.supportEmail || "Questions go to your account team."}</p>
      </footer>
      {cartOpen ? <CartDrawer products={store.products} slug={store.slug} onClose={() => setCartOpen(false)} /> : null}
    </div>
  );
}

function CartDrawer({ products, slug, onClose }: { products: Product[]; slug: string; onClose: () => void }) {
  const lines = useCart();
  const detailed = lines.map((line) => ({ ...line, product: products.find((product) => product.sku === line.sku) })).filter((line) => line.product);
  const total = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-ink/40" aria-label="Close cart" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <p className="text-sm font-semibold">Cart</p>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-line">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {detailed.length === 0 ? <p className="py-10 text-sm text-muted">Your cart is empty.</p> : null}
          {detailed.map((line) => (
            <div key={line.sku} className="flex gap-3 border-b border-line py-4">
              {line.product?.imageUrl ? <img src={line.product.imageUrl} alt="" className="size-16 rounded-lg bg-[#f6f6f6] object-cover" /> : <div className="size-16 rounded-lg bg-[#f6f6f6]" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.product?.name}</p>
                <p className="text-xs text-muted">{money(line.product?.priceCents ?? 0)}</p>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  Qty
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={line.quantity}
                    onChange={(event) => setCartQuantity(line.sku, Number(event.target.value))}
                    className="h-8 w-16 rounded-lg border border-line px-2 text-sm text-ink"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold tabular-nums">{money(total)}</span>
          </div>
          <Link
            to="/store/$slug/checkout"
            params={{ slug }}
            onClick={onClose}
            className={`flex h-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white ${detailed.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
