import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { P as listPortalServices } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
import { t as Locked } from "./customer-portal-DM12X9hv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-services-BCLRonXS.js
var import_jsx_runtime = require_jsx_runtime();
function MyServices() {
	const token = useShopToken();
	const session = usePortalSession();
	const mine = useQuery({
		queryKey: ["portal-services", token],
		queryFn: () => listPortalServices({ data: token }),
		enabled: Boolean(token)
	});
	if (session.data && !session.data.access.canOrderIt && !session.data.access.canOrderPhone) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locked, {
		title: "No managed services on this account",
		body: "Service ordering is approved from the admin desk. Tickets are still open to you."
	});
	const active = (mine.data ?? []).filter((item) => item.status === "approved" || item.status === "provisioned");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "My active services"
			}),
			active.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: item.serviceName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						item.status,
						" · ",
						item.category
					]
				})]
			}, item.id)),
			mine.data && active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nothing is provisioned yet. Open requests stay under Quotes."
			}) : null
		]
	});
}
//#endregion
export { MyServices as component };
