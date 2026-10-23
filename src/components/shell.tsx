import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Cable,
  ClipboardList,
  CreditCard,
  Eye,
  LayoutDashboard,
  ListTree,
  Menu,
  Monitor,
  Settings,
  Shield,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode, Fragment } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getShell } from "@/lib/portal/api";
import { storeSlug } from "@/lib/portal/format";
import { ticketSearch } from "@/lib/portal/ticket-search";
import { Boot, Input } from "./ui";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/organizations", label: "Companies", icon: Building2 },
  { to: "/users", label: "People", icon: Users },
  { to: "/products", label: "Catalog", icon: Monitor },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/forms", label: "Ticket forms", icon: ListTree },
  { to: "/roles", label: "Roles", icon: Shield },
  { to: "/integrations", label: "Zendesk", icon: Cable },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shell = useQuery({
    queryKey: ["shell"],
    queryFn: () => getShell(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const item = NAV.find((entry) => ("exact" in entry && entry.exact ? path === entry.to : path === entry.to || path.startsWith(`${entry.to}/`)));
    document.title = item ? `${item.label} · Manage Tech Service` : "Manage Tech Service";
  }, [path]);

  if (isPending || (user && shell.isPending)) return <Boot />;
  if (!user) return null;
  const info = shell.data;

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white">MT</span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-ink">{info?.brandName ?? "Manage Tech Service"}</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2" aria-label="Admin">
        {NAV.map((item) => {
          const active = "exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Fragment key={item.to}>
              <Link
                to={item.to}
                search={item.to === "/tickets" ? ticketSearch() : undefined}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex h-8 items-center gap-2 rounded-lg bg-accent-soft px-2 text-[13px] font-semibold text-ink"
                    : "flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                }
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
              {item.to === "/products" ? (
                <a
                  href={`/store/${storeSlug(info?.brandName ?? "Manage Tech Service")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                >
                  <Eye className="size-4 shrink-0" strokeWidth={1.75} />
                  Online Shop
                </a>
              ) : null}
            </Fragment>
          );
        })}
      </nav>
      <div className="border-t border-line px-3 py-3 text-xs text-muted">
        <p className="font-medium text-ink">{info?.zendeskConnected ? "Zendesk connected" : "Zendesk not connected"}</p>
        <p className="mt-1 truncate">{info?.actor.email || info?.actor.name}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-surface md:block">{nav}</aside>
      {open ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-surface">{nav}</aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface px-3 sm:px-4">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-line bg-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ to: "/tickets", search: ticketSearch({ q: query.trim(), status: "all" }) });
            }}
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tickets"
              aria-label="Search tickets"
              className="h-8 border-transparent bg-surface-2"
            />
          </form>
          <UserButton />
        </header>
        {info?.actor.role === "viewer" ? (
          <p className="border-b border-[#e3c98a] bg-warn-soft px-4 py-2 text-[13px] text-warn">
            View-only access. Changes are turned off for this account.
          </p>
        ) : null}
        <div className="px-4 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
