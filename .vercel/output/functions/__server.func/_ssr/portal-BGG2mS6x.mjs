import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as Outlet, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { V as openPortalFromAuth } from "./api-CEXWu3z6.mjs";
import { n as useCurrentUserState } from "./use-current-user-D9YQRpMJ.mjs";
import { n as Boot } from "./ui-kHtDn7EO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken, t as setShopToken } from "./shop-session-BlA38aat.mjs";
import { n as PortalShell } from "./customer-portal-DM12X9hv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-BGG2mS6x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PortalLayout() {
	const { user, isPending } = useCurrentUserState();
	const token = useShopToken();
	const link = useQuery({
		queryKey: ["portal-auth", user?.id],
		queryFn: () => openPortalFromAuth(),
		enabled: Boolean(user)
	});
	(0, import_react.useEffect)(() => {
		if (link.data?.token) setShopToken(link.data.token);
	}, [link.data?.token]);
	if (isPending || user && (link.isPending || link.data?.token !== token)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { PortalLayout as component };
