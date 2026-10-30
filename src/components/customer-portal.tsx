import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ClipboardList, Headphones, House, LogOut, Menu, Receipt, Settings, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getSessionHome } from "@/lib/portal/api";
import { usePortalSession } from "@/lib/portal/use-portal-session";
import { setShopToken } from "@/lib/portal/shop-session";
import { useCart } from "@/lib/portal/store-cart";

const NAV = [
  { to: "/portal", label: "Home", icon: House, exact: true },
  { to: "/portal/tickets", label: "Tickets", icon: Headphones },
  { to: "/portal/shop", label: "Order", icon: ClipboardList },
  { to: "/portal/orders", label: "My orders", icon: ClipboardList },
  { to: "/portal/billing", label: "Billing", icon: Receipt },
  { to: "/portal/complaints", label: "Complaints", icon: Headphones },
  { to: "/portal/organization", label: "Organization", icon: House },
  { to: "/portal/account", label: "Account", icon: Settings },
] as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const session = usePortalSession();
  const user = useCurrentUser();
  const home = useQuery({ queryKey: ["session-home"], queryFn: () => getSessionHome() });
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const current = NAV.find((item) => ("exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`)));
  const name = user?.displayName || session.data?.customer.name || "there";
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)] bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4">
          <Link to="/portal" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white">MT</span>
            <span className="hidden text-sm font-semibold sm:inline">MTS User Portal</span>
          </Link>
          <nav className="hidden items-center gap-1 overflow-x-auto md:flex" aria-label="Customer">
            {NAV.map((item) => {
              const active = current?.to === item.to;
              return (
                <Link key={item.to} to={item.to} className={active ? "shrink-0 rounded-lg bg-ink px-3 py-2 text-sm text-white" : "shrink-0 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-2"}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <Link to="/portal/shop" className="relative grid size-11 place-items-center rounded-xl" aria-label="Order">
              <ClipboardList className="size-5" />
              {count > 0 ? <span className="absolute top-1 right-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-semibold leading-4 text-white">{count}</span> : null}
            </Link>
            <Link to="/portal/notifications" className="grid size-11 place-items-center rounded-xl" aria-label="Notifications"><Bell className="size-5" /></Link>
            {home.data?.destination === "admin" ? <a href="/" className="hidden px-2 text-xs font-semibold text-accent sm:inline">Admin</a> : null}
            <button type="button" className="grid size-11 place-items-center rounded-xl md:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
              <Menu className="size-5" />
            </button>
            <button type="button" className="hidden size-11 place-items-center rounded-xl md:grid" aria-label="Sign out" onClick={() => { setShopToken(""); void signOut("/login"); }}>
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
        <p className="mx-auto hidden w-full max-w-6xl truncate px-4 pb-2 text-xs text-muted md:block">{session.data?.organization || session.data?.business || user?.primaryEmail || name}</p>
      </header>
      <main className="min-w-0 px-4 py-5 md:px-6">{children}</main>
      {menu ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setMenu(false)} />
          <div className="absolute inset-x-0 top-0 grid gap-1 bg-surface p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold">{name}</p>
              <button type="button" aria-label="Close menu" onClick={() => setMenu(false)}><X className="size-5" /></button>
            </div>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenu(false)} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface-2">{item.label}</Link>
            ))}
            <button type="button" className="rounded-xl px-3 py-3 text-left text-sm font-medium" onClick={() => { setMenu(false); setShopToken(""); void signOut("/login"); }}>Sign out</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Locked({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto grid max-w-lg gap-2 rounded-2xl border border-line bg-surface p-5">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted">{body}</p>
    </section>
  );
}
