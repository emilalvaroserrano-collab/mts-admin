import { d as getPortalSession } from "./api-CEXWu3z6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-portal-session-DNENLyBs.js
function usePortalSession() {
	const token = useShopToken();
	return useQuery({
		queryKey: ["portal-session", token],
		queryFn: () => getPortalSession({ data: token }),
		enabled: Boolean(token)
	});
}
//#endregion
export { usePortalSession as t };
