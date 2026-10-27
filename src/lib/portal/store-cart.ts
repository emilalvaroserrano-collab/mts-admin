import { useSyncExternalStore } from "react";

export type CartLine = { sku: string; quantity: number };

const KEY = "mts-store-cart";
const EMPTY: CartLine[] = [];
let lines: CartLine[] = EMPTY;
const listeners = new Set<() => void>();
let notice: { sku: string; at: number } | null = null;
const noticeListeners = new Set<() => void>();

function read(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]") as CartLine[];
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((line) => line && typeof line.sku === "string" && line.quantity > 0);
  } catch {
    return EMPTY;
  }
}

function write(next: CartLine[]) {
  lines = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function ensure() {
  if (typeof window === "undefined" || lines !== EMPTY) return;
  lines = read();
}

export function addToCart(sku: string, quantity = 1) {
  ensure();
  const current = lines === EMPTY ? [] : lines;
  const found = current.find((line) => line.sku === sku);
  const next = found
    ? current.map((line) => (line.sku === sku ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line))
    : [...current, { sku, quantity }];
  notice = { sku, at: Date.now() };
  noticeListeners.forEach((listener) => listener());
  write(next);
}

export function setCartQuantity(sku: string, quantity: number) {
  ensure();
  const current = lines === EMPTY ? [] : lines;
  write(quantity <= 0 ? current.filter((line) => line.sku !== sku) : current.map((line) => (line.sku === sku ? { ...line, quantity } : line)));
}

export function clearCart() {
  write([]);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensure();
  return () => listeners.delete(listener);
}

export function useCart() {
  return useSyncExternalStore(subscribe, () => lines, () => EMPTY);
}

export function useCartNotice() {
  return useSyncExternalStore(
    (listener) => {
      noticeListeners.add(listener);
      return () => noticeListeners.delete(listener);
    },
    () => notice,
    () => null,
  );
}
