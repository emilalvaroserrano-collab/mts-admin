import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { I as listServiceCatalog } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-BrT0Xi6L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PortalServices() {
	const session = usePortalSession();
	const catalog = useQuery({
		queryKey: ["service-catalog"],
		queryFn: () => listServiceCatalog()
	});
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("All");
	const categories = (0, import_react.useMemo)(() => ["All", ...new Set((catalog.data ?? []).map((item) => item.category))], [catalog.data]);
	const items = (catalog.data ?? []).filter((item) => {
		const text = `${item.name} ${item.summary} ${item.category}`.toLowerCase();
		return (category === "All" || item.category === category) && text.includes(q.toLowerCase());
	});
	const access = session.data?.access;
	const canOrder = Boolean(access?.canOrderIt || access?.canOrderPhone);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-5xl gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "IT services"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: canOrder ? "Choose a service. A request opens a ticket and waits for a quote. Nothing is billed until the desk approves it." : "You can read the catalog. Ordering stays off until an admin approves this account."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (event) => setQ(event.target.value),
					placeholder: "Search services",
					"aria-label": "Search services",
					className: "h-11 rounded-xl border border-line bg-surface px-3"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: category,
					onChange: (event) => setCategory(event.target.value),
					"aria-label": "Category",
					className: "h-11 rounded-xl border border-line bg-surface px-3",
					children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/portal/services/$serviceId",
					params: { serviceId: String(item.id) },
					className: "grid gap-1 rounded-xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
							children: item.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: item.summary
						})
					]
				}, item.id))
			}),
			catalog.data && items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nothing matches that search."
			}) : null
		]
	});
}
//#endregion
export { PortalServices as component };
