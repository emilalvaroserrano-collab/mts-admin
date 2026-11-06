import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { t as ago } from "./_ssr/format-DhyAHcG6.mjs";
import { o as getNotification } from "./_ssr/api-CEXWu3z6.mjs";
import { B as ClipboardList, G as Building2, V as ChevronLeft, q as Bell, r as Users, s as Ticket, u as Shield, x as Monitor, z as CreditCard } from "./_libs/lucide-react.mjs";
import { a as ErrorNote, c as Loading } from "./_ssr/ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { u as Route$23 } from "./_ssr/router-DN3-t_kz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_notificationId-CWPJdi7n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AUDIENCE = {
	staff: "Everyone on the desk, including view-only",
	agent: "Agents, admins, and Super Admins",
	admin: "Admins and Super Admins",
	owner: "Super Admin only"
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
function NotificationPage() {
	const { notificationId } = Route$23.useParams();
	const id = Number(notificationId);
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["notification", id],
		queryFn: () => getNotification({ data: id })
	});
	(0, import_react.useEffect)(() => {
		if (!query.isSuccess) return;
		client.invalidateQueries({ queryKey: ["notifications"] });
		client.invalidateQueries({ queryKey: ["shell"] });
	}, [
		query.isSuccess,
		id,
		client
	]);
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const notice = query.data;
	const kind = KINDS[notice.kind] ?? {
		label: notice.kind || "Desk",
		icon: Bell,
		tone: "bg-surface-2 text-ink"
	};
	const Icon = kind.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid w-full min-w-0 gap-4 pb-24 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/notifications",
				className: "inline-flex h-11 w-fit items-center gap-1 text-sm font-semibold text-ink",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Notifications"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid w-full min-w-0 gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-12 shrink-0 place-items-center rounded-2xl ${kind.tone}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase",
									children: kind.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 break-words text-2xl font-semibold tracking-tight",
									children: notice.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: ago(notice.createdAt)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-[15px] leading-7 text-ink",
						children: notice.body || "No extra detail was recorded."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-bg px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[11px] font-semibold tracking-wide text-subtle uppercase",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-sm font-medium",
								children: notice.actorName || "The desk"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-bg px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[11px] font-semibold tracking-wide text-subtle uppercase",
								children: "Who can see this"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-sm font-medium",
								children: AUDIENCE[notice.audience] || notice.audience
							})]
						})]
					})
				]
			}),
			notice.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 z-20 px-4 md:static md:px-0",
				style: { bottom: "max(5.25rem, calc(env(safe-area-inset-bottom) + 4.5rem))" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: notice.href,
					className: "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white shadow-lg lg:w-fit lg:px-6 lg:shadow-none",
					children: "Open the record"
				})
			}) : null
		]
	});
}
//#endregion
export { NotificationPage as component };
