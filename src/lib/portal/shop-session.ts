import { useSyncExternalStore } from "react";

const KEY = "mts-shop-token";
const listeners = new Set<() => void>();

function read() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) || "";
}

export function shopToken() {
  return read();
}

export function setShopToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(KEY, token);
  else window.localStorage.removeItem(KEY);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useShopToken() {
  return useSyncExternalStore(subscribe, read, () => "");
}
