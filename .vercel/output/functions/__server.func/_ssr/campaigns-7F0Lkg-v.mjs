import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { w as listCampaigns } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campaigns-7F0Lkg-v.js
var import_jsx_runtime = require_jsx_runtime();
function CampaignsPage() {
	const token = useShopToken();
	const campaigns = useQuery({
		queryKey: ["campaigns", token],
		queryFn: () => listCampaigns({ data: token }),
		enabled: Boolean(token)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Campaigns"
			}),
			(campaigns.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid gap-2 rounded-xl border border-line bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: item.body
					}),
					item.ctaHref.startsWith("/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.ctaHref,
						className: "text-sm font-semibold text-accent",
						children: item.ctaLabel || "Open"
					}) : null
				]
			}, item.id)),
			campaigns.data && campaigns.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No campaigns for this account."
			}) : null
		]
	});
}
//#endregion
export { CampaignsPage as component };
