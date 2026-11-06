import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, w as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { c as __exportAll } from "./ssr.mjs";
import { E as verifyAlternativeSignature, _ as readAlternativeEvent, p as getSql, r as applyPaymentStatus } from "./commerce-CJJAh49r.mjs";
import { n as SESSION_TOKEN_COOKIE, r as auth } from "./server-oQb26vs1.mjs";
import { et as runPortalJobs } from "./api-CEXWu3z6.mjs";
import { o as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as verifyZendeskWebhook, n as ingestZendeskWebhook } from "./zendesk-conversations-DZ-6Nhsi.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ticket-search-CEf18BGL.js
var ticketSearchDefaults = {
	q: "",
	status: "unresolved",
	org: "",
	category: "",
	assignee: "",
	view: ""
};
function ticketSearch(partial = {}) {
	return {
		...ticketSearchDefaults,
		...partial
	};
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DN3-t_kz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function chunkLoadFailed(message) {
	return /dynamically imported module|module script failed|error loading dynamically imported module/i.test(message);
}
function AppErrorComponent({ error }) {
	const message = errorMessage(error);
	(0, import_react.useEffect)(() => {
		if (!chunkLoadFailed(message)) return;
		const key = "mts-chunk-reload";
		if (sessionStorage.getItem(key) === window.location.pathname) return;
		sessionStorage.setItem(key, window.location.pathname);
		window.location.reload();
	}, [message]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 h-9 rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900",
				onClick: () => window.location.reload(),
				children: "Reload"
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-DMMm-fDt.css";
var Route$55 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: "Manage Tech Service Admin" },
			{
				name: "description",
				content: "Admin for companies, tickets, the catalog, orders, and payments."
			},
			{
				name: "theme-color",
				content: "#003970"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
				client,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" })]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$49 = () => import("../_-BPLmxYOM.mjs");
var Route$54 = createFileRoute("/$")({ component: lazyRouteComponent($$splitComponentImporter$49, "component") });
var $$splitComponentImporter$48 = () => import("../_app-BeUfDdTW.mjs");
var Route$53 = createFileRoute("/_app")({ component: lazyRouteComponent($$splitComponentImporter$48, "component") });
var $$splitComponentImporter$47 = () => import("./login-s8ESfCao.mjs");
var Route$52 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$47, "component") });
var $$splitComponentImporter$46 = () => import("./portal-BGG2mS6x.mjs");
var Route$51 = createFileRoute("/portal")({ component: lazyRouteComponent($$splitComponentImporter$46, "component") });
var $$splitComponentImporter$45 = () => import("../_app-qdWBQpqZ.mjs");
var Route$50 = createFileRoute("/_app/")({ component: lazyRouteComponent($$splitComponentImporter$45, "component") });
var $$splitComponentImporter$44 = () => import("./access-B2I6JBxD.mjs");
var Route$49 = createFileRoute("/_app/access")({ component: lazyRouteComponent($$splitComponentImporter$44, "component") });
var $$splitComponentImporter$43 = () => import("./campaigns-BEzz0Bb2.mjs");
var Route$48 = createFileRoute("/_app/campaigns")({ component: lazyRouteComponent($$splitComponentImporter$43, "component") });
var $$splitComponentImporter$42 = () => import("./docs-CUp9Ws_y.mjs");
var Route$47 = createFileRoute("/_app/docs")({ component: lazyRouteComponent($$splitComponentImporter$42, "component") });
var $$splitComponentImporter$41 = () => import("./forms-BHhyY4O1.mjs");
var Route$46 = createFileRoute("/_app/forms")({ component: lazyRouteComponent($$splitComponentImporter$41, "component") });
var $$splitComponentImporter$40 = () => import("./integrations-D10j1op_.mjs");
var Route$45 = createFileRoute("/_app/integrations")({ component: lazyRouteComponent($$splitComponentImporter$40, "component") });
var $$splitComponentImporter$39 = () => import("./payments-C_8zc4Lo.mjs");
var Route$44 = createFileRoute("/_app/payments")({ component: lazyRouteComponent($$splitComponentImporter$39, "component") });
var $$splitComponentImporter$38 = () => import("./products-BBIRyI4-.mjs");
var Route$43 = createFileRoute("/_app/products")({ component: lazyRouteComponent($$splitComponentImporter$38, "component") });
var $$splitComponentImporter$37 = () => import("./roles-DTONut5b.mjs");
var Route$42 = createFileRoute("/_app/roles")({ component: lazyRouteComponent($$splitComponentImporter$37, "component") });
var $$splitComponentImporter$36 = () => import("./services-CAHfV_hJ.mjs");
var Route$41 = createFileRoute("/_app/services")({ component: lazyRouteComponent($$splitComponentImporter$36, "component") });
var $$splitComponentImporter$35 = () => import("./settings-8ryFnCPb.mjs");
var Route$40 = createFileRoute("/_app/settings")({ component: lazyRouteComponent($$splitComponentImporter$35, "component") });
var $$splitComponentImporter$34 = () => import("./users-1wek31R2.mjs");
var Route$39 = createFileRoute("/_app/users")({ component: lazyRouteComponent($$splitComponentImporter$34, "component") });
/**
* Live-preview sign-in popup — server-only (NEVER import from the client).
*
* The sandbox preview runs the app in a partitioned iframe, so OAuth must happen
* in a top-level popup (first-party cookies). This handler is the ENTIRE popup
* document — no React shell:
*
*   Phase 1 (`?providerId=…`): start OAuth server-side and 302 straight to the
*     broker / upstream login page. The popup never paints the app.
*   Phase 2 (`?done=1`): after the broker round-trip, emit a tiny HTML page that
*     posts the session token to the opener and closes. No SPA hydrate, no
*     server-fn round-trip.
*
* Wired automatically by the Vite `authPopupPlugin` in `vite.config.ts` during
* `npm run dev` (live preview). Do NOT create `src/routes/auth/popup.tsx` — a
* React route here paints the full app shell in the popup. The opener lives in
* `client.ts` (`signIn` → `openSignInPopup`).
*/
/**
* Handle `GET /auth/popup`. Invoked by the Vite `authPopupPlugin` (dev / live
* preview). Do not re-export this from a React route file.
*/
async function handleAuthPopupRequest(request) {
	const url = new URL(request.url);
	if (url.searchParams.get("done") === "1") {
		const errored = url.searchParams.has("error");
		const message = {
			source: "grok-auth-popup",
			token: errored ? null : readCookie(request, SESSION_TOKEN_COOKIE),
			...errored ? { error: url.searchParams.get("error") ?? "sign_in_failed" } : {}
		};
		return new Response(completionHtml(message), {
			status: 200,
			headers: {
				"content-type": "text/html; charset=utf-8",
				"cache-control": "no-store"
			}
		});
	}
	const providerId = url.searchParams.get("providerId")?.trim();
	if (!providerId) return new Response("Missing providerId", {
		status: 400,
		headers: { "content-type": "text/plain; charset=utf-8" }
	});
	const back = `${url.origin}/auth/popup?done=1`;
	try {
		const apiRes = await auth.api.signInWithOAuth2({
			body: {
				providerId,
				callbackURL: back,
				errorCallbackURL: `${back}&error=1`
			},
			headers: request.headers,
			asResponse: true
		});
		if (!apiRes.ok) return completionResponse({
			source: "grok-auth-popup",
			token: null,
			error: await apiRes.text().catch(() => "") || `oauth_init_failed_${apiRes.status}`
		});
		const location = (await apiRes.json().catch(() => null))?.url;
		if (!location) return completionResponse({
			source: "grok-auth-popup",
			token: null,
			error: "oauth_init_missing_url"
		});
		const headers = new Headers({
			location,
			"cache-control": "no-store"
		});
		for (const cookie of apiRes.headers.getSetCookie()) headers.append("set-cookie", cookie);
		return new Response(null, {
			status: 302,
			headers
		});
	} catch (err) {
		return completionResponse({
			source: "grok-auth-popup",
			token: null,
			error: err instanceof Error ? err.message : "oauth_init_threw"
		});
	}
}
function completionResponse(message) {
	return new Response(completionHtml(message), {
		status: 200,
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}
/** Minimal HTML: postMessage the token to the opener and close. No React. */
function completionHtml(message) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<title>Signing in…</title>
<style>
  html,body{margin:0;min-height:100%;background:#0b0b0c;color:#a1a1aa;
    font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  main{min-height:100vh;display:grid;place-items:center;padding:1.5rem;text-align:center}
</style>
</head>
<body>
<main><p>Signing you in…</p></main>
<script type="application/json" id="grok-auth-popup-msg">${JSON.stringify(message).replace(/</g, "\\u003c")}<\/script>
<script>
(function () {
  var el = document.getElementById("grok-auth-popup-msg");
  var msg = { source: "grok-auth-popup", token: null };
  try { if (el && el.textContent) msg = JSON.parse(el.textContent); } catch (e) {}
  try {
    if (window.opener) window.opener.postMessage(msg, window.location.origin);
  } catch (e) {}
  try { window.close(); } catch (e) {}
})();
<\/script>
</body>
</html>`;
}
/** Read a single cookie value from the request (handles `=` inside values). */
function readCookie(request, name) {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const eq = trimmed.indexOf("=");
		if (eq <= 0) continue;
		if (trimmed.slice(0, eq) !== name) continue;
		const raw = trimmed.slice(eq + 1);
		try {
			return decodeURIComponent(raw);
		} catch {
			return raw;
		}
	}
	return null;
}
var Route$38 = createFileRoute("/auth/popup")({ server: { handlers: { GET: ({ request }) => handleAuthPopupRequest(request) } } });
var $$splitComponentImporter$33 = () => import("./portal-YC0RHCg3.mjs");
var Route$37 = createFileRoute("/portal/")({ component: lazyRouteComponent($$splitComponentImporter$33, "component") });
var $$splitComponentImporter$32 = () => import("./account-oIEsdEPN.mjs");
var Route$36 = createFileRoute("/portal/account")({ component: lazyRouteComponent($$splitComponentImporter$32, "component") });
var $$splitComponentImporter$31 = () => import("./billing-fbD-6eCk.mjs");
var Route$35 = createFileRoute("/portal/billing")({ component: lazyRouteComponent($$splitComponentImporter$31, "component") });
var $$splitComponentImporter$30 = () => import("./campaigns-7F0Lkg-v.mjs");
var Route$34 = createFileRoute("/portal/campaigns")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = () => import("./complaints-8WPOmLRm.mjs");
var Route$33 = createFileRoute("/portal/complaints")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./login-B68kXbT2.mjs");
var Route$32 = createFileRoute("/portal/login")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./my-services-BCLRonXS.mjs");
var Route$31 = createFileRoute("/portal/my-services")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./notifications-BjqqPahQ.mjs");
var Route$30 = createFileRoute("/portal/notifications")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./organization-iosvypAj.mjs");
var Route$29 = createFileRoute("/portal/organization")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./quotes-BCR0XHkZ.mjs");
var Route$28 = createFileRoute("/portal/quotes")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./register-B8E7-K9s.mjs");
var Route$27 = createFileRoute("/portal/register")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./shop-D1bQYOTL.mjs");
var Route$26 = createFileRoute("/portal/shop")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./verify-BwU7UmDO.mjs");
var Route$25 = createFileRoute("/portal/verify")({
	validateSearch: (search) => ({
		email: typeof search.email === "string" ? search.email : "",
		code: typeof search.code === "string" ? search.code : ""
	}),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./notifications-CgYAHoNy.mjs");
var Route$24 = createFileRoute("/_app/notifications/")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("../_notificationId-CWPJdi7n.mjs");
var Route$23 = createFileRoute("/_app/notifications/$notificationId")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./orders-g4E_NAAV.mjs");
var Route$22 = createFileRoute("/_app/orders/")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("../_orderId-BEIeKzxn.mjs");
var Route$21 = createFileRoute("/_app/orders/$orderId")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./organizations--wSa0yID.mjs");
var Route$20 = createFileRoute("/_app/organizations/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("../_orgId-C6il4X7x.mjs");
var Route$19 = createFileRoute("/_app/organizations/$orgId")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./tickets-DdhUaHGq.mjs");
var Route$18 = createFileRoute("/_app/tickets/")({
	validateSearch: (search) => ticketSearch({
		q: typeof search.q === "string" ? search.q : "",
		status: typeof search.status === "string" ? search.status : "unresolved",
		org: typeof search.org === "string" ? search.org : "",
		category: typeof search.category === "string" ? search.category : "",
		assignee: typeof search.assignee === "string" ? search.assignee : "",
		view: typeof search.view === "string" ? search.view : ""
	}),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("../_ticketId-D0BQgk9X.mjs");
var Route$17 = createFileRoute("/_app/tickets/$ticketId")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var Route$16 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var Route$15 = createFileRoute("/api/jobs/run")({ server: { handlers: { POST: async ({ request }) => {
	const secret = (process.env.CRON_SECRET || "").trim();
	const header = request.headers.get("authorization") || "";
	if (secret && header !== `Bearer ${secret}`) return Response.json({
		ok: false,
		error: "Unauthorized."
	}, { status: 401 });
	try {
		const sql = await getSql();
		await runPortalJobs(sql);
		return Response.json({ ok: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Jobs failed.";
		return Response.json({
			ok: false,
			error: message
		}, { status: 500 });
	}
} } } });
var Route$14 = createFileRoute("/api/payments/alternative")({ server: { handlers: { POST: async ({ request }) => {
	const raw = await request.text();
	try {
		await verifyAlternativeSignature(request, raw);
		const event = readAlternativeEvent(raw ? JSON.parse(raw) : {});
		const sql = await getSql();
		const reference = Number(/^MT-(\d+)$/.exec(event.reference)?.[1] ?? 0);
		const byNumber = reference > 1e3 ? reference - 1e3 : 0;
		const rows = byNumber ? await sql`select id from orders where id = ${byNumber} limit 1` : event.invoiceId ? await sql`select id from orders where alternative_invoice_id = ${event.invoiceId} limit 1` : [];
		const id = Number(rows[0]?.id ?? 0);
		if (!id) return Response.json({
			ok: false,
			error: "Order not found."
		}, { status: 404 });
		await applyPaymentStatus(sql, id, event.status || "paid", "Alternative Payments");
		return Response.json({
			ok: true,
			orderId: id
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Webhook rejected.";
		const status = /signature|SECRET/.test(message) ? 401 : 400;
		return Response.json({
			ok: false,
			error: message
		}, { status });
	}
} } } });
var Route$13 = createFileRoute("/api/zendesk/webhook")({ server: { handlers: { POST: async ({ request }) => {
	const raw = await request.text();
	try {
		await verifyZendeskWebhook(request, raw);
		const payload = raw ? JSON.parse(raw) : {};
		const sql = await getSql();
		const stored = await ingestZendeskWebhook(sql, payload);
		return Response.json({
			ok: true,
			stored
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Webhook rejected.";
		const status = /signature|timestamp|Webhook ID|SECRET/.test(message) ? 401 : 400;
		return Response.json({
			ok: false,
			error: message
		}, { status });
	}
} } } });
var $$splitComponentImporter$12 = () => import("./orders-CxvlAmWN.mjs");
var Route$12 = createFileRoute("/portal/orders/")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("../_orderId-BZy5-MCA.mjs");
var Route$11 = createFileRoute("/portal/orders/$orderId")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./services-BrT0Xi6L.mjs");
var Route$10 = createFileRoute("/portal/services/")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("../_serviceId-ONjgVVvR.mjs");
var Route$9 = createFileRoute("/portal/services/$serviceId")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./tickets-BdNuNv02.mjs");
var Route$8 = createFileRoute("/portal/tickets/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("../_ticketId-BRtQ-j4A.mjs");
var Route$7 = createFileRoute("/portal/tickets/$ticketId")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./new-6A1xNd31.mjs");
var Route$6 = createFileRoute("/portal/tickets/new")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("../_slug-Ip4lLNZC.mjs");
var Route$5 = createFileRoute("/store/$slug/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("../_sku-BWvtWSEo.mjs");
var Route$4 = createFileRoute("/store/$slug/$sku")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./account-DXiDtces.mjs");
var Route$3 = createFileRoute("/store/$slug/account")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./checkout-CxKOQOFX.mjs");
var Route$2 = createFileRoute("/store/$slug/checkout")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./services-Bb7g6ZQM.mjs");
var Route$1 = createFileRoute("/store/$slug/services")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./tickets-B8chFZPh.mjs");
var Route = createFileRoute("/store/$slug/tickets")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var SplatRoute = Route$54.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$55
});
var AppRoute = Route$53.update({
	id: "/_app",
	getParentRoute: () => Route$55
});
var LoginRoute = Route$52.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$55
});
var PortalRoute = Route$51.update({
	id: "/portal",
	path: "/portal",
	getParentRoute: () => Route$55
});
var AppIndexRoute = Route$50.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
});
var AppAccessRoute = Route$49.update({
	id: "/access",
	path: "/access",
	getParentRoute: () => AppRoute
});
var AppCampaignsRoute = Route$48.update({
	id: "/campaigns",
	path: "/campaigns",
	getParentRoute: () => AppRoute
});
var AppDocsRoute = Route$47.update({
	id: "/docs",
	path: "/docs",
	getParentRoute: () => AppRoute
});
var AppFormsRoute = Route$46.update({
	id: "/forms",
	path: "/forms",
	getParentRoute: () => AppRoute
});
var AppIntegrationsRoute = Route$45.update({
	id: "/integrations",
	path: "/integrations",
	getParentRoute: () => AppRoute
});
var AppPaymentsRoute = Route$44.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => AppRoute
});
var AppProductsRoute = Route$43.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => AppRoute
});
var AppRolesRoute = Route$42.update({
	id: "/roles",
	path: "/roles",
	getParentRoute: () => AppRoute
});
var AppServicesRoute = Route$41.update({
	id: "/services",
	path: "/services",
	getParentRoute: () => AppRoute
});
var AppSettingsRoute = Route$40.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AppRoute
});
var AppUsersRoute = Route$39.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AppRoute
});
var AuthPopupRoute = Route$38.update({
	id: "/auth/popup",
	path: "/auth/popup",
	getParentRoute: () => Route$55
});
var PortalIndexRoute = Route$37.update({
	id: "/",
	path: "/",
	getParentRoute: () => PortalRoute
});
var PortalAccountRoute = Route$36.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => PortalRoute
});
var PortalBillingRoute = Route$35.update({
	id: "/billing",
	path: "/billing",
	getParentRoute: () => PortalRoute
});
var PortalCampaignsRoute = Route$34.update({
	id: "/campaigns",
	path: "/campaigns",
	getParentRoute: () => PortalRoute
});
var PortalComplaintsRoute = Route$33.update({
	id: "/complaints",
	path: "/complaints",
	getParentRoute: () => PortalRoute
});
var PortalLoginRoute = Route$32.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => PortalRoute
});
var PortalMyServicesRoute = Route$31.update({
	id: "/my-services",
	path: "/my-services",
	getParentRoute: () => PortalRoute
});
var PortalNotificationsRoute = Route$30.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => PortalRoute
});
var PortalOrganizationRoute = Route$29.update({
	id: "/organization",
	path: "/organization",
	getParentRoute: () => PortalRoute
});
var PortalQuotesRoute = Route$28.update({
	id: "/quotes",
	path: "/quotes",
	getParentRoute: () => PortalRoute
});
var PortalRegisterRoute = Route$27.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => PortalRoute
});
var PortalShopRoute = Route$26.update({
	id: "/shop",
	path: "/shop",
	getParentRoute: () => PortalRoute
});
var PortalVerifyRoute = Route$25.update({
	id: "/verify",
	path: "/verify",
	getParentRoute: () => PortalRoute
});
var AppNotificationsIndexRoute = Route$24.update({
	id: "/notifications/",
	path: "/notifications/",
	getParentRoute: () => AppRoute
});
var AppNotificationsNotificationIdRoute = Route$23.update({
	id: "/notifications/$notificationId",
	path: "/notifications/$notificationId",
	getParentRoute: () => AppRoute
});
var AppOrdersIndexRoute = Route$22.update({
	id: "/orders/",
	path: "/orders/",
	getParentRoute: () => AppRoute
});
var AppOrdersOrderIdRoute = Route$21.update({
	id: "/orders/$orderId",
	path: "/orders/$orderId",
	getParentRoute: () => AppRoute
});
var AppOrganizationsIndexRoute = Route$20.update({
	id: "/organizations/",
	path: "/organizations/",
	getParentRoute: () => AppRoute
});
var AppOrganizationsOrgIdRoute = Route$19.update({
	id: "/organizations/$orgId",
	path: "/organizations/$orgId",
	getParentRoute: () => AppRoute
});
var AppTicketsIndexRoute = Route$18.update({
	id: "/tickets/",
	path: "/tickets/",
	getParentRoute: () => AppRoute
});
var AppTicketsTicketIdRoute = Route$17.update({
	id: "/tickets/$ticketId",
	path: "/tickets/$ticketId",
	getParentRoute: () => AppRoute
});
var ApiAuthSplatRoute = Route$16.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$55
});
var ApiJobsRunRoute = Route$15.update({
	id: "/api/jobs/run",
	path: "/api/jobs/run",
	getParentRoute: () => Route$55
});
var ApiPaymentsAlternativeRoute = Route$14.update({
	id: "/api/payments/alternative",
	path: "/api/payments/alternative",
	getParentRoute: () => Route$55
});
var ApiZendeskWebhookRoute = Route$13.update({
	id: "/api/zendesk/webhook",
	path: "/api/zendesk/webhook",
	getParentRoute: () => Route$55
});
var PortalOrdersIndexRoute = Route$12.update({
	id: "/orders/",
	path: "/orders/",
	getParentRoute: () => PortalRoute
});
var PortalOrdersOrderIdRoute = Route$11.update({
	id: "/orders/$orderId",
	path: "/orders/$orderId",
	getParentRoute: () => PortalRoute
});
var PortalServicesIndexRoute = Route$10.update({
	id: "/services/",
	path: "/services/",
	getParentRoute: () => PortalRoute
});
var PortalServicesServiceIdRoute = Route$9.update({
	id: "/services/$serviceId",
	path: "/services/$serviceId",
	getParentRoute: () => PortalRoute
});
var PortalTicketsIndexRoute = Route$8.update({
	id: "/tickets/",
	path: "/tickets/",
	getParentRoute: () => PortalRoute
});
var PortalTicketsTicketIdRoute = Route$7.update({
	id: "/tickets/$ticketId",
	path: "/tickets/$ticketId",
	getParentRoute: () => PortalRoute
});
var PortalTicketsNewRoute = Route$6.update({
	id: "/tickets/new",
	path: "/tickets/new",
	getParentRoute: () => PortalRoute
});
var StoreSlugIndexRoute = Route$5.update({
	id: "/store/$slug/",
	path: "/store/$slug/",
	getParentRoute: () => Route$55
});
var StoreSlugSkuRoute = Route$4.update({
	id: "/store/$slug/$sku",
	path: "/store/$slug/$sku",
	getParentRoute: () => Route$55
});
var StoreSlugAccountRoute = Route$3.update({
	id: "/store/$slug/account",
	path: "/store/$slug/account",
	getParentRoute: () => Route$55
});
var StoreSlugCheckoutRoute = Route$2.update({
	id: "/store/$slug/checkout",
	path: "/store/$slug/checkout",
	getParentRoute: () => Route$55
});
var StoreSlugServicesRoute = Route$1.update({
	id: "/store/$slug/services",
	path: "/store/$slug/services",
	getParentRoute: () => Route$55
});
var StoreSlugTicketsRoute = Route.update({
	id: "/store/$slug/tickets",
	path: "/store/$slug/tickets",
	getParentRoute: () => Route$55
});
var AppRouteChildren = {
	AppAccessRoute,
	AppCampaignsRoute,
	AppDocsRoute,
	AppFormsRoute,
	AppIntegrationsRoute,
	AppPaymentsRoute,
	AppProductsRoute,
	AppRolesRoute,
	AppServicesRoute,
	AppSettingsRoute,
	AppUsersRoute,
	AppIndexRoute,
	AppNotificationsNotificationIdRoute,
	AppOrdersOrderIdRoute,
	AppOrganizationsOrgIdRoute,
	AppTicketsTicketIdRoute,
	AppNotificationsIndexRoute,
	AppOrdersIndexRoute,
	AppOrganizationsIndexRoute,
	AppTicketsIndexRoute
};
var AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
var PortalRouteChildren = {
	PortalAccountRoute,
	PortalBillingRoute,
	PortalCampaignsRoute,
	PortalComplaintsRoute,
	PortalLoginRoute,
	PortalMyServicesRoute,
	PortalNotificationsRoute,
	PortalOrganizationRoute,
	PortalQuotesRoute,
	PortalRegisterRoute,
	PortalShopRoute,
	PortalVerifyRoute,
	PortalIndexRoute,
	PortalOrdersOrderIdRoute,
	PortalServicesServiceIdRoute,
	PortalTicketsTicketIdRoute,
	PortalTicketsNewRoute,
	PortalOrdersIndexRoute,
	PortalServicesIndexRoute,
	PortalTicketsIndexRoute
};
var rootRouteChildren = {
	SplatRoute,
	AppRoute: AppRouteWithChildren,
	LoginRoute,
	PortalRoute: PortalRoute._addFileChildren(PortalRouteChildren),
	AuthPopupRoute,
	ApiAuthSplatRoute,
	ApiJobsRunRoute,
	ApiPaymentsAlternativeRoute,
	ApiZendeskWebhookRoute,
	StoreSlugSkuRoute,
	StoreSlugAccountRoute,
	StoreSlugCheckoutRoute,
	StoreSlugServicesRoute,
	StoreSlugTicketsRoute,
	StoreSlugIndexRoute
};
var routeTree = Route$55._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$11 as a, Route$19 as c, Route$25 as d, ticketSearch as f, Route$9 as i, Route$21 as l, Route$4 as n, Route$17 as o, Route$7 as r, Route$18 as s, router_exports as t, Route$23 as u };
