import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-session-BlA38aat.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "mts-shop-token";
var listeners = /* @__PURE__ */ new Set();
function read() {
	if (typeof window === "undefined") return "";
	return window.localStorage.getItem(KEY) || "";
}
function setShopToken(token) {
	if (typeof window === "undefined") return;
	if (token) window.localStorage.setItem(KEY, token);
	else window.localStorage.removeItem(KEY);
	listeners.forEach((listener) => listener());
}
function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function useShopToken() {
	return (0, import_react.useSyncExternalStore)(subscribe, read, () => "");
}
//#endregion
export { useShopToken as n, setShopToken as t };
