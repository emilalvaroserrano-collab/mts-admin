import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { P as listPortalServices, Z as respondToQuote } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
import { t as Locked } from "./customer-portal-DM12X9hv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes-BCR0XHkZ.js
var import_jsx_runtime = require_jsx_runtime();
function QuotesPage() {
	const token = useShopToken();
	const client = useQueryClient();
	const session = usePortalSession();
	const mine = useQuery({
		queryKey: ["portal-services", token],
		queryFn: () => listPortalServices({ data: token }),
		enabled: Boolean(token)
	});
	const respond = useMutation({
		mutationFn: (input) => respondToQuote({ data: {
			token,
			...input
		} }),
		onSuccess: () => void client.invalidateQueries({ queryKey: ["portal-services", token] })
	});
	if (session.data && !session.data.access.canOrderIt && !session.data.access.canOrderPhone) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locked, {
		title: "Quotes are not open yet",
		body: "An admin approves service ordering before a quote can be requested."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Quotes and requests"
			}),
			(mine.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border border-line bg-surface px-4 py-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: item.serviceName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [item.status, item.quoteNote ? ` · ${item.quoteNote}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-muted",
						children: item.details
					}),
					item.status === "quoted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-10 rounded-xl bg-ink px-3 text-xs font-semibold text-white",
							onClick: () => respond.mutate({
								id: item.id,
								decision: "accepted"
							}),
							children: "Accept"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-10 rounded-xl border border-line px-3 text-xs font-semibold",
							onClick: () => respond.mutate({
								id: item.id,
								decision: "rejected"
							}),
							children: "Decline"
						})]
					}) : null
				]
			}, item.id)),
			mine.data && mine.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No requests yet."
			}) : null
		]
	});
}
//#endregion
export { QuotesPage as component };
