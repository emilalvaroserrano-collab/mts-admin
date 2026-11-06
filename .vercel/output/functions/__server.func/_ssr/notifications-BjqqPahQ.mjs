import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as markCustomerNotice, T as listCustomerNotices } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-BjqqPahQ.js
var import_jsx_runtime = require_jsx_runtime();
function NoticesPage() {
	const token = useShopToken();
	const client = useQueryClient();
	const notices = useQuery({
		queryKey: ["customer-notices", token],
		queryFn: () => listCustomerNotices({ data: token }),
		enabled: Boolean(token)
	});
	const mark = useMutation({
		mutationFn: (id) => markCustomerNotice({ data: {
			token,
			id
		} }),
		onSuccess: () => void client.invalidateQueries({ queryKey: ["customer-notices", token] })
	});
	const unread = (notices.data ?? []).filter((item) => !item.read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-3xl gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Notifications"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: unread ? `${unread} unread` : "You're caught up."
			}),
			(notices.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: item.href || "/portal",
				onClick: () => {
					if (!item.read) mark.mutate(item.id);
				},
				className: item.read ? "rounded-xl border border-line bg-surface px-4 py-3 text-sm" : "rounded-xl border border-ink bg-surface px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-semibold",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: item.body
				})]
			}, item.id)),
			notices.data && notices.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No notifications yet. Ticket, order, and request updates show up here."
			}) : null
		]
	});
}
//#endregion
export { NoticesPage as component };
