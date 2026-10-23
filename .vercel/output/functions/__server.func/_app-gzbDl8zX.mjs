import { o as __toESM } from "./_runtime.mjs";
import { t as ticketSearch } from "./_ssr/ticket-search-CEf18BGL.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link, g as Outlet, p as useRouterState, x as Navigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { c as getShell } from "./_ssr/api-PAGCofpy.mjs";
import { _ as ClipboardList, a as Ticket, d as Menu, f as ListTree, o as Shield, p as LayoutDashboard, r as Users, s as Settings, t as X, u as Monitor, v as Cable, y as Building2 } from "./_libs/lucide-react.mjs";
import { n as Boot, s as Input } from "./_ssr/ui-V14V10_q.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { i as signOut } from "./_ssr/client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./_ssr/server-uV7TznTk.mjs";
import { n as useCurrentUserState, t as useCurrentUser } from "./_ssr/use-current-user-B7Cbrtsy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-gzbDl8zX.js
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
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
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
		label: "Equipment",
		icon: Monitor
	},
	{
		to: "/orders",
		label: "Orders",
		icon: ClipboardList
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
		document.title = item ? `${item.label} · ManageTech` : "ManageTech Admin";
	}, [path]);
	if (isPending || user && shell.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (!user) return null;
	const info = shell.data;
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-10 w-10 place-items-center rounded-lg bg-accent font-display text-lg text-accent-fg",
					children: "M"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-xl leading-none text-ink",
						children: info?.brandName ?? "ManageTech"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Admin desk"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-1 flex-col gap-1 px-2",
				"aria-label": "Desk",
				children: NAV.map((item) => {
					const active = "exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						search: item.to === "/tickets" ? ticketSearch() : void 0,
						"aria-current": active ? "page" : void 0,
						className: active ? "flex h-11 items-center gap-3 rounded-lg bg-accent-soft px-3 text-sm font-medium text-accent" : "flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-ink hover:bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
					}, item.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-line px-4 py-4 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: info?.zendeskConnected ? "Zendesk connected" : "Zendesk not connected" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 truncate",
						children: info?.actor.email || info?.actor.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 capitalize",
						children: info?.actor.role
					})
				]
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
					className: "absolute inset-y-0 left-0 w-72 border-r border-line bg-surface",
					children: nav
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-bg/95 px-3 py-3 backdrop-blur sm:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-11 w-11 place-items-center rounded-md border border-line bg-surface md:hidden",
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
									placeholder: "Search tickets by id or subject",
									"aria-label": "Search tickets"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden text-right sm:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: info?.actor.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: info?.actor.organizationName ?? "All companies"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
						]
					}),
					info?.actor.role === "viewer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-b border-line bg-warn-soft px-4 py-2 text-sm text-warn sm:px-8",
						children: "View-only access. Changes are turned off for this account."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8",
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
