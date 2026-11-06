import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-cart-C_9hSDdQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "mts-store-cart";
var EMPTY = [];
var lines = EMPTY;
var listeners = /* @__PURE__ */ new Set();
var notice = null;
var noticeListeners = /* @__PURE__ */ new Set();
function read() {
	if (typeof window === "undefined") return EMPTY;
	try {
		const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
		if (!Array.isArray(parsed)) return EMPTY;
		return parsed.filter((line) => line && typeof line.sku === "string" && line.quantity > 0);
	} catch {
		return EMPTY;
	}
}
function write(next) {
	lines = next;
	if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
	listeners.forEach((listener) => listener());
}
function ensure() {
	if (typeof window === "undefined" || lines !== EMPTY) return;
	lines = read();
}
function addToCart(sku, quantity = 1) {
	ensure();
	const current = lines === EMPTY ? [] : lines;
	const next = current.find((line) => line.sku === sku) ? current.map((line) => line.sku === sku ? {
		...line,
		quantity: Math.min(99, line.quantity + quantity)
	} : line) : [...current, {
		sku,
		quantity
	}];
	notice = {
		sku,
		at: Date.now()
	};
	noticeListeners.forEach((listener) => listener());
	write(next);
}
function setCartQuantity(sku, quantity) {
	ensure();
	const current = lines === EMPTY ? [] : lines;
	write(quantity <= 0 ? current.filter((line) => line.sku !== sku) : current.map((line) => line.sku === sku ? {
		...line,
		quantity
	} : line));
}
function clearCart() {
	write([]);
}
function subscribe(listener) {
	listeners.add(listener);
	ensure();
	return () => listeners.delete(listener);
}
function useCart() {
	return (0, import_react.useSyncExternalStore)(subscribe, () => lines, () => EMPTY);
}
function useCartNotice() {
	return (0, import_react.useSyncExternalStore)((listener) => {
		noticeListeners.add(listener);
		return () => noticeListeners.delete(listener);
	}, () => notice, () => null);
}
//#endregion
export { useCartNotice as a, useCart as i, clearCart as n, setCartQuantity as r, addToCart as t };
