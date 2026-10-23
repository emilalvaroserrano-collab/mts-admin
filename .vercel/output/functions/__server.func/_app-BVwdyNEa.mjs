import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link, g as Outlet, p as useRouterState, x as Navigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { i as signOut } from "./_ssr/client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./_ssr/server-62924Kqb.mjs";
import { o as storeSlug } from "./_ssr/format-50WTgpEd.mjs";
import { n as useCurrentUserState, t as useCurrentUser } from "./_ssr/use-current-user-B7Cbrtsy.mjs";
import { l as getShell } from "./_ssr/api-DpH0j9Yg.mjs";
import { _ as Eye, a as Ticket, b as Cable, c as Settings, d as Menu, f as ListTree, n as Users, p as LayoutDashboard, s as Shield, t as X, u as Monitor, v as CreditCard, x as Building2, y as ClipboardList } from "./_libs/lucide-react.mjs";
import { n as Boot, s as Input } from "./_ssr/ui-scpx6tUJ.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { s as ticketSearch } from "./_ssr/router-BdeEeSvI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BVwdyNEa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-7 place-items-center rounded-full bg-[#e3e3e3] text-xs font-semibold text-ink",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-[13px] font-medium sm:inline",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var NAV = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/tickets",
		label: "Tickets",
		icon: Ticket
	},
	{
		to: "/organizations",
		label: "Companies",
		icon: Building2
	},
	{
		to: "/users",
		label: "People",
		icon: Users
	},
	{
		to: "/products",
		label: "Catalog",
		icon: Monitor
	},
	{
		to: "/orders",
		label: "Orders",
		icon: ClipboardList
	},
	{
		to: "/payments",
		label: "Payments",
		icon: CreditCard
	},
	{
		to: "/forms",
		label: "Ticket forms",
		icon: ListTree
	},
	{
		to: "/roles",
		label: "Roles",
		icon: Shield
	},
	{
		to: "/integrations",
		label: "Zendesk",
		icon: Cable
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function Shell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const shell = useQuery({
		queryKey: ["shell"],
		queryFn: () => getShell(),
		enabled: Boolean(user)
	});
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [path]);
	(0, import_react.useEffect)(() => {
		const item = NAV.find((entry) => "exact" in entry && entry.exact ? path === entry.to : path === entry.to || path.startsWith(`${entry.to}/`));
		document.title = item ? `${item.label} · Manage Tech Service` : "Manage Tech Service";
	}, [path]);
	if (isPending || user && shell.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (!user) return null;
	const info = shell.data;
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5 border-b border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white",
					children: "MT"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[13px] font-semibold leading-tight text-ink",
						children: info?.brandName ?? "Manage Tech Service"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Admin"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2",
				"aria-label": "Admin",
				children: NAV.map((item) => {
					const active = "exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						search: item.to === "/tickets" ? ticketSearch() : void 0,
						"aria-current": active ? "page" : void 0,
						className: active ? "flex h-8 items-center gap-2 rounded-lg bg-[#f1f1f1] px-2 text-[13px] font-semibold text-ink" : "flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted hover:bg-[#f7f7f7] hover:text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4 shrink-0",
							strokeWidth: 1.75
						}), item.label]
					}), item.to === "/products" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `/store/${storeSlug(info?.brandName ?? "Manage Tech Service")}`,
						target: "_blank",
						rel: "noreferrer",
						className: "flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted hover:bg-[#f7f7f7] hover:text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
							className: "size-4 shrink-0",
							strokeWidth: 1.75
						}), "Online Shop"]
					}) : null] }, item.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-line px-3 py-3 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-ink",
					children: info?.zendeskConnected ? "Zendesk connected" : "Zendesk not connected"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate",
					children: info?.actor.email || info?.actor.name
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden border-r border-line bg-surface md:block",
				children: nav
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-30 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "absolute inset-0 bg-ink/40",
					"aria-label": "Close menu",
					onClick: () => setOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "absolute inset-y-0 left-0 w-64 border-r border-line bg-surface",
					children: nav
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface px-3 sm:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-8 place-items-center rounded-lg border border-line bg-surface md:hidden",
								"aria-label": open ? "Close menu" : "Open menu",
								onClick: () => setOpen((value) => !value),
								children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
								className: "min-w-0 flex-1",
								onSubmit: (event) => {
									event.preventDefault();
									navigate({
										to: "/tickets",
										search: ticketSearch({
											q: query.trim(),
											status: "all"
										})
									});
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Search tickets",
									"aria-label": "Search tickets",
									className: "h-8 border-transparent bg-[#f1f1f1]"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
						]
					}),
					info?.actor.role === "viewer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-b border-[#e3c98a] bg-warn-soft px-4 py-2 text-[13px] text-warn",
						children: "View-only access. Changes are turned off for this account."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-5 sm:px-6",
						children
					})
				]
			})
		]
	});
}
function AppLayout() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AppLayout as component };
