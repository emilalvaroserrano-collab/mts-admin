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
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Shield,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getShell } from "@/lib/portal/api";
import { storeSlug } from "@/lib/portal/format";
import type { Role, ShellInfo } from "@/lib/portal/types";
import { ticketSearch } from "@/lib/portal/ticket-search";
import { Boot, Input } from "./ui";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Work" },
  { to: "/tickets", label: "Tickets", icon: Ticket, group: "Work" },
  { to: "/orders", label: "Orders", icon: ClipboardList, group: "Work" },
  { to: "/organizations", label: "Companies", icon: Building2, group: "Directory" },
  { to: "/users", label: "People", icon: Users, group: "Directory" },
  { to: "/products", label: "Catalog", icon: Monitor, group: "Commerce" },
  { to: "/payments", label: "Payments", icon: CreditCard, group: "Commerce" },
  { to: "/forms", label: "Ticket forms", icon: ListTree, group: "Setup" },
  { to: "/roles", label: "Roles", icon: Shield, group: "Setup" },
  { to: "/integrations", label: "Zendesk", icon: Cable, group: "Setup" },
  { to: "/settings", label: "Settings", icon: Settings, group: "Setup" },
] as const;

const GROUPS = ["Work", "Directory", "Commerce", "Setup"] as const;

const NAV_COUNTS: Partial<Record<(typeof NAV)[number]["to"], (info: ShellInfo) => number>> = {
  "/tickets": (info) => info.ticketCount,
  "/organizations": (info) => info.companyCount,
  "/users": (info) => info.peopleCount,
  "/products": (info) => info.catalogCount,
  "/orders": (info) => info.orderCount,
};

function roleLabel(role: Role | undefined) {
  if (role === "owner") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "agent") return "Agent";
  if (role === "viewer") return "View only";
  return "Staff";
}

export function Shell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("mts-sidebar") === "collapsed");
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("mts-sidebar", next ? "collapsed" : "open");
      return next;
    });
  }

  if (isPending || (user && shell.isPending)) return <Boot />;
  if (!user) return null;
  const info = shell.data;
  const current = NAV.find((entry) => ("exact" in entry && entry.exact ? path === entry.to : path === entry.to || path.startsWith(`${entry.to}/`)));

  function Nav({ compact }: { compact: boolean }) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <div className={compact ? "flex h-16 shrink-0 items-center justify-center border-b border-line px-2" : "flex h-16 shrink-0 items-center gap-3 border-b border-line px-4"}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink text-xs font-semibold tracking-wide text-white">MT</span>
          {compact ? null : (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-ink">{info?.brandName ?? "Manage Tech Service"}</p>
                <p className="text-xs text-muted">Admin desk</p>
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Collapse sidebar"
                onClick={toggleCollapsed}
              >
                <PanelLeftClose className="size-4" />
              </button>
            </>
          )}
        </div>
        <nav className={compact ? "flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-3" : "flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"} aria-label="Admin">
          {compact ? (
            <button
              type="button"
              className="grid h-11 w-full place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Expand sidebar"
              title="Expand sidebar"
              onClick={toggleCollapsed}
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : null}
          {GROUPS.map((group) => (
            <div key={group}>
              {compact ? <div className="mx-2 mb-1 h-px bg-line" /> : <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase">{group}</p>}
              <div className="flex flex-col gap-0.5">
                {NAV.filter((item) => item.group === group).map((item) => {
                  const active = "exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
                  const Icon = item.icon;
                  const count = info ? NAV_COUNTS[item.to]?.(info) : undefined;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      search={item.to === "/tickets" ? ticketSearch() : undefined}
                      aria-current={active ? "page" : undefined}
                      title={compact ? `${item.label}${count != null ? ` (${count})` : ""}` : undefined}
                      className={
                        compact
                          ? active
                            ? "flex h-11 items-center justify-center rounded-xl bg-ink text-white"
                            : "flex h-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink"
                          : active
                            ? "flex h-11 items-center gap-2.5 rounded-xl bg-ink px-3 text-sm font-semibold text-white"
                            : "flex h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink"
                      }
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                      {compact ? null : <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      {!compact && count != null ? (
                        <span className={active ? "rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums" : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink"}>
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
                {group === "Commerce" ? (
                  <a
                    href={`/store/${storeSlug(info?.brandName ?? "Manage Tech Service")}`}
                    target="_blank"
                    rel="noreferrer"
                    title={compact ? "Online Shop" : undefined}
                    className={compact ? "flex h-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink" : "flex h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink"}
                  >
                    <Eye className="size-4 shrink-0" strokeWidth={1.75} />
                    {compact ? null : "Online Shop"}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </nav>
        <div className={compact ? "flex justify-center border-t border-line px-2 py-3" : "border-t border-line px-4 py-3"}>
          <p className={compact ? "flex items-center" : "flex items-center gap-2 text-xs font-medium text-ink"} title={info?.zendeskConnected ? "Zendesk connected" : "Zendesk needs a client"}>
            <span className={info?.zendeskConnected ? "size-2 rounded-full bg-good" : "size-2 rounded-full bg-warn"} />
            {compact ? null : info?.zendeskConnected ? "Zendesk connected" : "Zendesk needs a client"}
          </p>
          {compact ? null : <p className="mt-1 truncate text-xs text-muted">{roleLabel(info?.actor.role)} · {info?.actor.email || info?.actor.name}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={collapsed ? "min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]" : "min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]"}>
      <aside className="hidden border-r border-line lg:sticky lg:top-0 lg:block lg:h-screen"><Nav compact={collapsed} /></aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[min(18rem,88vw)] shadow-[8px_0_32px_rgba(0,57,112,0.18)]"><Nav compact={false} /></aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-5">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-line bg-surface lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase">{current?.group ?? "Desk"}</p>
            <p className="truncate text-sm font-semibold text-ink">{current?.label ?? "Admin"}</p>
          </div>
          <form
            className="relative min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ to: "/tickets", search: ticketSearch({ q: query.trim(), status: "all" }) });
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tickets"
              aria-label="Search tickets"
              className="h-11 border-transparent bg-surface-2 pl-9 sm:h-10"
            />
          </form>
          <UserButton />
        </header>
        {info?.actor.role === "viewer" ? (
          <p className="border-b border-[#e3c98a] bg-warn-soft px-4 py-2 text-sm text-warn">
            View-only access. Changes are turned off for this account.
          </p>
        ) : null}
        <div className="admin-main px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
