import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alternative-DU8UBeZw.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-CJed2dQB.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var ALTERNATIVE_PORTAL = "https://go.alternativepayments.io";
var LIVE_API = "https://public-api.alternativepayments.io";
var SANDBOX_API = "https://public-api.demo.alternativepayments.io";
var tokenCache = null;
function alternativeMode(value) {
	const raw = (value || "").trim().toLowerCase();
	return raw === "live" || raw === "production" ? "live" : "sandbox";
}
function alternativeBase(mode) {
	const override = (process.env.ALTERNATIVE_API_BASE || "").trim().replace(/\/+$/, "");
	if (override) return override;
	return mode === "sandbox" ? SANDBOX_API : LIVE_API;
}
function envAlternative() {
	const clientId = (process.env.ALTERNATIVE_CLIENT_ID || process.env.ALTERNATIVE_PAYMENTS_CLIENT_ID || "").trim();
	const clientSecret = (process.env.ALTERNATIVE_CLIENT_SECRET || process.env.ALTERNATIVE_PAYMENTS_CLIENT_SECRET || "").trim();
	return {
		clientId,
		clientSecret,
		fromEnv: Boolean(clientId && clientSecret),
		mode: alternativeMode(process.env.ALTERNATIVE_ENV || process.env.ALTERNATIVE_ENVIRONMENT || "sandbox")
	};
}
function apiError(text, fallback) {
	try {
		const parsed = JSON.parse(text);
		return (parsed.error_description || parsed.message || parsed.error || fallback).slice(0, 180);
	} catch {
		return text ? text.slice(0, 180) : fallback;
	}
}
async function alternativeToken(creds) {
	const key = `${creds.mode}:${creds.clientId}`;
	if (tokenCache && tokenCache.key === key && tokenCache.expiresAt > Date.now() + 15e3) return tokenCache.token;
	const response = await fetch(`${alternativeBase(creds.mode)}/oauth/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`, "utf8").toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: "grant_type=client_credentials"
	});
	const text = await response.text();
	if (!response.ok) throw new Error(apiError(text, "Alternative Payments rejected the API key."));
	const body = JSON.parse(text);
	if (!body.access_token) throw new Error("Alternative Payments did not return a token.");
	tokenCache = {
		token: body.access_token,
		key,
		expiresAt: Date.now() + Math.max(60, body.expires_in || 3600) * 1e3
	};
	return body.access_token;
}
async function ap(creds, path, init) {
	const token = await alternativeToken(creds);
	const response = await fetch(`${alternativeBase(creds.mode)}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			...init?.body ? { "Content-Type": "application/json" } : {},
			...init?.headers
		}
	});
	const text = await response.text();
	if (!response.ok) throw new Error(apiError(text, `Alternative Payments ${path} failed.`));
	if (!text) return {};
	return JSON.parse(text);
}
async function probeAlternative(creds) {
	await ap(creds, "/customers?limit=1");
	return {
		mode: creds.mode,
		base: alternativeBase(creds.mode)
	};
}
async function ensureCustomer(creds, input) {
	if (input.existingId) try {
		const found = await ap(creds, `/customers/${encodeURIComponent(input.existingId)}`);
		if (found.id) return found.id;
	} catch {}
	const created = await ap(creds, "/customers", {
		method: "POST",
		body: JSON.stringify({
			name: input.name,
			email: input.email,
			external_id: input.externalId
		})
	});
	if (!created.id) throw new Error("Alternative Payments did not return a customer.");
	return created.id;
}
async function createAlternativeCheckout(creds, input) {
	const redirect = /^https:\/\/[^\s]+$/i.test(input.returnUrl) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(input.returnUrl) ? input.returnUrl : ALTERNATIVE_PORTAL;
	if (input.email) try {
		const customerId = await ensureCustomer(creds, {
			externalId: input.externalId,
			name: input.name || "Customer",
			email: input.email,
			existingId: input.existingCustomerId
		});
		const invoice = await ap(creds, "/invoices", {
			method: "POST",
			body: JSON.stringify({
				customer_id: customerId,
				currency: "USD",
				due_date: input.dueDate,
				line_items: input.lines.map((line) => ({
					description: line.description,
					amount: line.amount,
					quantity: line.quantity
				}))
			})
		});
		if (!invoice.id) throw new Error("Alternative Payments did not return an invoice.");
		return {
			url: (await ap(creds, `/invoices/${encodeURIComponent(invoice.id)}/payment-link`)).url || "https://go.alternativepayments.io",
			customerId,
			invoiceId: invoice.id,
			requestId: "",
			paymentStatus: (invoice.status || "UPCOMING").toLowerCase()
		};
	} catch {}
	const amount = input.lines.reduce((sum, line) => sum + line.amount * line.quantity, 0).toFixed(2);
	const requested = await ap(creds, "/payments/request", {
		method: "POST",
		body: JSON.stringify({
			amount,
			currency: "USD",
			redirect_url: redirect,
			reference_id: input.reference
		})
	});
	return {
		url: requested.url || "https://go.alternativepayments.io",
		customerId: input.existingCustomerId,
		invoiceId: "",
		requestId: requested.id || "",
		paymentStatus: (requested.status || "pending").toLowerCase()
	};
}
async function refreshAlternativePayment(creds, input) {
	if (input.invoiceId) {
		const invoice = await ap(creds, `/invoices/${encodeURIComponent(input.invoiceId)}`);
		const link = await ap(creds, `/invoices/${encodeURIComponent(input.invoiceId)}/payment-link`).catch(() => ({ url: "" }));
		return {
			status: (invoice.status || "").toLowerCase(),
			url: link.url || ""
		};
	}
	if (input.requestId) {
		const requested = await ap(creds, `/payments/request/${encodeURIComponent(input.requestId)}`);
		return {
			status: (requested.status || "").toLowerCase(),
			url: requested.url || ""
		};
	}
	return {
		status: "",
		url: ""
	};
}
async function loadAlternativeCreds(sql) {
	const env = envAlternative();
	if (env.fromEnv) return env;
	const row = (await sql`
    select alternative_client_id, alternative_client_secret, alternative_environment from payment_settings where id = 1
  `)[0];
	const clientId = row?.alternative_client_id?.trim() || "";
	const clientSecret = row?.alternative_client_secret?.trim() || "";
	if (!clientId || !clientSecret) return null;
	return {
		clientId,
		clientSecret,
		fromEnv: false,
		mode: alternativeMode(row?.alternative_environment)
	};
}
//#endregion
export { envAlternative as a, refreshAlternativePayment as c, createAlternativeCheckout as i, alternativeMode as n, loadAlternativeCreds as o, authMiddleware as r, probeAlternative as s, ALTERNATIVE_PORTAL as t };
