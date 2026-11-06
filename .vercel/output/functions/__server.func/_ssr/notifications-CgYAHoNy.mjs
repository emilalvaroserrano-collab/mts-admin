import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./format-DhyAHcG6.mjs";
import { k as listNotifications } from "./api-CEXWu3z6.mjs";
import { B as ClipboardList, G as Building2, q as Bell, r as Users, s as Ticket, u as Shield, x as Monitor, z as CreditCard } from "../_libs/lucide-react.mjs";
import { a as ErrorNote, c as Loading, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CgYAHoNy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AUDIENCE = {
	staff: "Everyone",
	agent: "Agents",
	admin: "Admins",
	owner: "Super Admin"
};
var KINDS = {
	ticket: {
		label: "Ticket",
		icon: Ticket,
		tone: "bg-info-soft text-info"
	},
	order: {
		label: "Order",
		icon: ClipboardList,
		tone: "bg-accent-soft text-accent"
	},
	person: {
		label: "Person",
		icon: Users,
		tone: "bg-[#e7eef8] text-ink"
	},
	company: {
		label: "Company",
		icon: Building2,
		tone: "bg-[#e7eef8] text-ink"
	},
	catalog: {
		label: "Catalog",
		icon: Monitor,
		tone: "bg-surface-2 text-ink"
	},
	payment: {
		label: "Payment",
		icon: CreditCard,
		tone: "bg-warn-soft text-warn"
	},
	desk: {
		label: "Desk",
		icon: Shield,
		tone: "bg-surface-2 text-ink"
	}
};
function kindOf(notice) {
	return KINDS[notice.kind] ?? {
		label: notice.kind || "Desk",
		icon: Bell,
		tone: "bg-surface-2 text-ink"
	};
}
function NotificationsPage() {
	const query = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications()
	});
	const [filter, setFilter] = (0, import_react.useState)("all");
	const unread = query.data?.filter((notice) => !notice.read).length ?? 0;
	const shown = (query.data ?? []).filter((notice) => filter === "all" || !notice.read);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid w-full min-w-0 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Desk",
				title: "Notifications",
				description: unread ? `${unread} unread for your role.` : "You are caught up. New desk activity will land here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:max-w-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter("all"),
					className: filter === "all" ? "h-11 rounded-full bg-ink text-sm font-semibold text-white" : "h-11 rounded-full border border-line bg-surface text-sm text-muted",
					children: "All"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setFilter("unread"),
					className: filter === "unread" ? "h-11 rounded-full bg-ink text-sm font-semibold text-white" : "h-11 rounded-full border border-line bg-surface text-sm text-muted",
					children: ["Unread", unread ? ` ${unread}` : ""]
				})]
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {}) : null,
			query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message }) : null,
			query.data && shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid place-items-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: filter === "unread" ? "No unread alerts" : "Nothing for your role yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted",
						children: "Tickets, orders, and people changes show up here when your role is allowed to see them."
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: shown.map((notice) => {
					const kind = kindOf(notice);
					const Icon = kind.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/notifications/$notificationId",
						params: { notificationId: String(notice.id) },
						className: notice.read ? "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4" : "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-accent/30 bg-white p-3 shadow-[0_1px_0_rgba(18,126,134,0.15)] sm:p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-11 place-items-center rounded-2xl ${kind.tone}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "grid min-w-0 gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex flex-wrap items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-semibold tracking-wide text-subtle uppercase",
												children: kind.label
											}), !notice.read ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-4 text-white",
												children: "New"
											}) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block truncate text-[15px] font-semibold",
											children: notice.title
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 text-xs text-muted",
										children: ago(notice.createdAt)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-2 text-sm leading-5 text-muted",
									children: notice.body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [AUDIENCE[notice.audience] || notice.audience, notice.actorName ? ` · ${notice.actorName}` : ""]
								})
							]
						})]
					}) }, notice.id);
				})
			})
		]
	});
}
//#endregion
export { NotificationsPage as component };
