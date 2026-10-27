import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Minus, Plus, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getStorefront } from "@/lib/portal/api";
import { money } from "@/lib/portal/format";
import { setCartQuantity, useCart, useCartNotice } from "@/lib/portal/store-cart";
import type { Product } from "@/lib/portal/types";

const FREE_SHIPPING = 50000;

export function useStore() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const query = useQuery({ queryKey: ["storefront"], queryFn: () => getStorefront() });
  return { slug, query };
}

export function StoreFrame({ children }: { children: ReactNode }) {
  const { slug, query } = useStore();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [cartOpen, setCartOpen] = useState(false);
  const lines = useCart();
  const notice = useCartNotice();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const checkout = path.includes("/checkout");

  if (query.isPending) {
    return <main className="grid min-h-screen place-items-center bg-white text-sm text-muted">Opening the shop…</main>;
  }
  if (query.isError) {
    return <main className="grid min-h-screen place-items-center bg-white px-6 text-sm text-bad">{query.error.message}</main>;
  }
  const store = query.data;
  if (store.slug !== slug) return <Navigate to="/store/$slug" params={{ slug: store.slug }} />;

  if (checkout) {
    return (
      <div className="min-h-screen bg-white text-ink">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-8">
            <Link to="/store/$slug" params={{ slug: store.slug }} className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">MT</span>
              <span className="text-sm font-semibold">{store.brandName}</span>
            </Link>
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafb] text-ink">
      <div className="bg-ink px-4 py-2.5 text-center text-[12px] text-white/85">
        {store.tagline || "Free standard shipping on orders over $500."}
      </div>
      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/store/$slug" params={{ slug: store.slug }} className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-ink text-[11px] font-semibold text-white">MT</span>
            <span className="truncate text-sm font-semibold">{store.brandName}</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-[13px] text-muted md:flex">
            <Link to="/store/$slug" params={{ slug: store.slug }} className="hover:text-ink">Shop</Link>
            <a href="#catalog" className="hover:text-ink">Catalog</a>
            <Link to="/store/$slug/account" params={{ slug: store.slug }} className="hover:text-ink">Account</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/store/$slug/account"
              params={{ slug: store.slug }}
              className="shop-press grid size-11 place-items-center rounded-full text-ink hover:bg-accent-soft"
              aria-label="Account"
            >
              <UserRound className="size-5" />
            </Link>
            <button
              type="button"
              className="shop-press relative grid size-11 place-items-center rounded-full bg-ink text-white"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-5 text-white">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      <div className="pb-24 md:pb-0">{children}</div>
      <footer className="border-t border-line bg-white px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{store.brandName}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">{store.tagline || "Laptops, PCs, and the accessories that go with them."}</p>
          </div>
          <p className="text-sm text-muted">{store.supportEmail || "Questions go to your account team."}</p>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-white/95 px-2 py-2 backdrop-blur md:hidden" aria-label="Shop">
        <Link to="/store/$slug" params={{ slug: store.slug }} className="shop-press grid h-12 place-items-center text-[12px] font-medium text-muted">Shop</Link>
        <button type="button" className="shop-press grid h-12 place-items-center text-[12px] font-semibold text-ink" onClick={() => setCartOpen(true)}>
          Cart{count ? ` · ${count}` : ""}
        </button>
        <Link to="/store/$slug/account" params={{ slug: store.slug }} className="shop-press grid h-12 place-items-center text-[12px] font-medium text-muted">Account</Link>
      </nav>
      {notice ? <AddedToast products={store.products} notice={notice} onOpen={() => setCartOpen(true)} /> : null}
      {cartOpen ? <CartDrawer products={store.products} slug={store.slug} onClose={() => setCartOpen(false)} /> : null}
    </div>
  );
}

function AddedToast({ products, notice, onOpen }: { products: Product[]; notice: { sku: string; at: number }; onOpen: () => void }) {
  const [visible, setVisible] = useState(true);
  const product = products.find((item) => item.sku === notice.sku);
  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(timer);
  }, [notice.at, notice.sku]);
  if (!visible || !product) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="shop-rise fixed inset-x-4 bottom-24 z-30 flex items-center gap-3 rounded-2xl bg-ink px-3 py-3 text-left text-white shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-80"
    >
      {product.imageUrl ? <img src={product.imageUrl} alt="" className="size-12 rounded-xl object-cover" /> : <span className="size-12 rounded-xl bg-white/10" />}
      <span>
        <span className="block text-sm font-semibold">Added to cart</span>
        <span className="block text-xs text-white/70">{product.name}</span>
      </span>
    </button>
  );
}

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (next: number) => void; label: string }) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-line bg-white">
      <button type="button" className="shop-press grid size-11 place-items-center" aria-label={`Decrease ${label}`} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" className="shop-press grid size-11 place-items-center" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(99, value + 1))}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function CartDrawer({ products, slug, onClose }: { products: Product[]; slug: string; onClose: () => void }) {
  const lines = useCart();
  const detailed = lines.map((line) => ({ ...line, product: products.find((product) => product.sku === line.sku) })).filter((line) => line.product);
  const total = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
  const remaining = Math.max(0, FREE_SHIPPING - total);
  return (
    <div className="fixed inset-0 z-40">
      <button className="shop-fade absolute inset-0 bg-ink/40" aria-label="Close cart" onClick={onClose} />
      <aside className="shop-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between px-4">
          <p className="text-base font-semibold">Your cart</p>
          <button type="button" aria-label="Close" onClick={onClose} className="shop-press grid size-11 place-items-center rounded-full hover:bg-accent-soft">
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-4 rounded-2xl bg-accent-soft px-4 py-3 text-xs text-ink">
          {remaining === 0 ? "Standard shipping is free on this order." : `Add ${money(remaining)} more for free standard shipping.`}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (total / FREE_SHIPPING) * 100)}%` }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {detailed.length === 0 ? <p className="py-16 text-center text-sm text-muted">Your cart is empty.</p> : null}
          {detailed.map((line) => (
            <div key={line.sku} className="flex gap-3 border-b border-line py-4">
              {line.product?.imageUrl ? <img src={line.product.imageUrl} alt="" className="size-20 rounded-2xl bg-[#f3f6f7] object-cover" /> : <div className="size-20 rounded-2xl bg-[#f3f6f7]" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{line.product?.name}</p>
                <p className="mt-1 text-sm text-muted">{money(line.product?.priceCents ?? 0)}</p>
                <div className="mt-2">
                  <QtyStepper value={line.quantity} label={line.product?.name ?? "item"} onChange={(next) => setCartQuantity(line.sku, next)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4 pb-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">{money(total)}</span>
          </div>
          <p className="mb-3 text-xs text-muted">Shipping and taxes are calculated at checkout.</p>
          <Link
            to="/store/$slug/checkout"
            params={{ slug }}
            onClick={onClose}
            className={`shop-press flex h-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white ${detailed.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function SummaryToggle({ total, children }: { total: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#f3f6f7] lg:bg-transparent">
      <button type="button" className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold text-accent lg:hidden" onClick={() => setOpen((value) => !value)}>
        <span className="inline-flex items-center gap-1">{open ? "Hide order summary" : "Show order summary"} <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} /></span>
        <span className="text-ink tabular-nums">{total}</span>
      </button>
      <div className={open ? "shop-rise px-4 pb-4 lg:hidden" : "hidden"}>{children}</div>
    </div>
  );
}
