import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Panel, s as Input, u as PageHeader } from "./ui-kHtDn7EO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/docs-CUp9Ws_y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	{
		id: "auth",
		title: "Authentication",
		note: "Staff sign-in. The session cookie is __Host-grok-auth.session_token. The live preview also accepts Authorization: Bearer with that session token.",
		endpoints: [
			{
				method: "GET",
				path: "/api/auth/get-session",
				title: "Current session",
				auth: "Session cookie or bearer token",
				summary: "Returns the signed-in staff user, or null when the desk is signed out.",
				response: `{ "session": { "user": { "id": "…", "email": "…", "name": "…" } } }`
			},
			{
				method: "POST",
				path: "/api/auth/sign-in/email",
				title: "Email sign-in",
				auth: "None",
				summary: "Signs a staff account in with email and password and sets the session cookie.",
				request: `{ "email": "ada@managetechservice.com", "password": "••••••••" }`,
				response: `{ "token": "…", "user": { "id": "…", "email": "…" } }`
			},
			{
				method: "POST",
				path: "/api/auth/sign-up/email",
				title: "Email sign-up",
				auth: "None",
				summary: "Creates a staff account. A welcome ticket is opened in the portal and queued for Zendesk.",
				request: `{ "name": "Ada Cruz", "email": "ada@managetechservice.com", "password": "••••••••" }`
			},
			{
				method: "POST",
				path: "/api/auth/sign-out",
				title: "Sign out",
				auth: "Session cookie or bearer token",
				summary: "Clears the staff session."
			},
			{
				method: "GET",
				path: "/auth/popup?providerId=grok-google",
				title: "Google or Microsoft",
				auth: "None",
				summary: "Starts the sign-in popup. Use providerId grok-google or grok-microsoft. The callback is /api/auth/oauth2/callback/:providerId."
			}
		]
	},
	{
		id: "zendesk",
		title: "Zendesk",
		note: "Point the Zendesk webhook at this URL. The shared secret must match ZENDESK_WEBHOOK_SECRET. Support user and ticket sync still needs the shop OAuth client.",
		endpoints: [{
			method: "POST",
			path: "/api/zendesk/webhook",
			title: "Conversations webhook",
			auth: "HMAC-SHA256",
			summary: "Stores a Conversations event after the signature, timestamp, and webhook id are checked. The timestamp must be within five minutes.",
			request: `Headers
x-zendesk-webhook-signature: base64 HMAC of timestamp + raw body
x-zendesk-webhook-signature-timestamp: unix time
x-zendesk-webhook-id: the webhook id

Body: the JSON Zendesk sends.`,
			response: `{ "ok": true, "stored": true }`
		}]
	},
	{
		id: "payments",
		title: "Payments",
		note: "Alternative Payments should post invoice updates here. A paid status commits stock. A failed or refunded status releases it. Orders are matched by reference MT-1001 or by the stored invoice id.",
		endpoints: [{
			method: "POST",
			path: "/api/payments/alternative",
			title: "Payment webhook",
			auth: "HMAC-SHA256 hex",
			summary: "Updates the order payment status. In sandbox with no webhook secret the signature is skipped. Live mode requires ALTERNATIVE_WEBHOOK_SECRET.",
			request: `Headers
x-alternative-signature: sha256=<hex hmac of the raw body>
Accepted aliases: x-signature, x-webhook-signature

{
  "type": "invoice.paid",
  "data": {
    "reference": "MT-1008",
    "invoice_id": "inv_…",
    "status": "paid"
  }
}`,
			response: `{ "ok": true, "orderId": 8 }`
		}]
	},
	{
		id: "jobs",
		title: "Jobs",
		note: "Vercel calls this every hour. It also runs from Zendesk → Run queued jobs. Each pass retries failed mail and Zendesk copies, reminds unpaid orders after 3 days, and flags shipments still open after 2 days.",
		endpoints: [{
			method: "POST",
			path: "/api/jobs/run",
			title: "Drain the queue",
			auth: "Bearer CRON_SECRET when that variable is set",
			summary: "Runs due jobs. With no CRON_SECRET the route is open, so set the secret before production.",
			request: `Authorization: Bearer <CRON_SECRET>`,
			response: `{ "ok": true }`
		}]
	},
	{
		id: "desk",
		title: "Desk session",
		note: "Catalog, orders, people, tickets, and settings are not public HTTP routes. They run inside the signed-in admin session. These are the operations that session performs.",
		endpoints: [
			{
				method: "GET",
				path: "Session · catalog",
				title: "List and save products",
				auth: "Staff session. Viewers cannot write.",
				summary: "Products have a SKU, title, price in cents, stock, Active or Draft, and a photo. A new order reserves stock. Cancelling or a failed payment puts it back."
			},
			{
				method: "POST",
				path: "Session · orders",
				title: "Create, edit, ship, delete",
				auth: "Staff session. Only Super Admin can delete.",
				summary: "Order numbers are MT- followed by 1000 plus the id. Status moves pending → approved → processing → fulfilled, or cancelled. Shipment is unfulfilled, shipped, out for delivery, or delivered.",
				response: `{ "id": 8, "number": "MT-1008", "paymentUrl": "…" }`
			},
			{
				method: "POST",
				path: "Session · people",
				title: "Sync users to Zendesk",
				auth: "Admin session",
				summary: "Sync to Zendesk creates or updates each portal, shop, and company user. Without the shop OAuth client id and secret the portal keeps the person and retries the copy."
			},
			{
				method: "POST",
				path: "Session · mail",
				title: "Resend",
				auth: "Admin session",
				summary: "Settings stores the API key and the from address. Mail is sent as Manage Tech Service <noreply@managetechservice.com>. Order confirmation, payment due, and shipping messages use that sender."
			}
		]
	},
	{
		id: "shop",
		title: "Online shop",
		note: "The customer store is a site, not a bearer API. Customers sign in on the store and see their own orders.",
		endpoints: [{
			method: "GET",
			path: "/store/:slug",
			title: "Storefront",
			auth: "Public",
			summary: "The shop linked from the sidebar. :slug is the brand name made URL-safe. Checkout collects shipping, then payment, then places the order and holds stock."
		}, {
			method: "GET",
			path: "/store/:slug/account",
			title: "Customer account",
			auth: "Shop session",
			summary: "The signed-in customer sees profile, orders, and shipment status. The shop session is separate from the staff session."
		}]
	}
];
function DocsPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const needle = query.trim().toLowerCase();
	const groups = (0, import_react.useMemo)(() => GROUPS.map((group) => ({
		...group,
		endpoints: group.endpoints.filter((endpoint) => {
			if (!needle) return true;
			return `${group.title} ${endpoint.title} ${endpoint.path} ${endpoint.summary}`.toLowerCase().includes(needle);
		})
	})).filter((group) => group.endpoints.length > 0), [needle]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Reference",
				title: "API",
				description: "HTTP routes partners call, and the desk operations that stay behind the staff session."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex gap-2 overflow-x-auto pb-1",
					"aria-label": "API sections",
					children: GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `#${group.id}`,
						className: "h-9 shrink-0 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium leading-9 text-ink",
						children: group.title
					}, group.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search the API",
					"aria-label": "Search the API",
					className: "h-9 sm:w-56"
				})]
			}),
			groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nothing matches that search."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6",
				children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: group.id,
					className: "scroll-mt-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: group.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-3xl text-sm text-muted",
							children: group.note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid gap-3",
							children: group.endpoints.map((endpoint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								className: "p-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-w-0 items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: endpoint.method === "GET" ? "rounded-md bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info" : "rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent",
											children: endpoint.method
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "truncate text-sm font-medium",
											children: endpoint.path
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: endpoint.auth
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 px-4 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: endpoint.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: endpoint.summary
										})] }),
										endpoint.request ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, {
											label: "Request",
											value: endpoint.request
										}) : null,
										endpoint.response ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, {
											label: "Response",
											value: endpoint.response
										}) : null
									]
								})]
							}, `${endpoint.method}-${endpoint.path}`))
						})
					]
				}, group.id))
			})
		]
	});
}
function Code({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold tracking-[0.12em] text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "mt-1 overflow-x-auto rounded-lg bg-[#f6f6f7] p-3 text-xs leading-5 text-ink",
			children: value
		})]
	});
}
//#endregion
export { DocsPage as component };
