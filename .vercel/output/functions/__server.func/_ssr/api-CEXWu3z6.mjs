import { r as createServerFn } from "./ssr.mjs";
import { c as enqueueJob, d as finishJob, i as authMiddleware, n as alternativeMode, p as getSql, s as dueJobs, w as sendOrderEmail, x as resendStoredEmail, y as recordEvent } from "./commerce-CJJAh49r.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CEXWu3z6.js
function s(row, key) {
	const value = row[key];
	if (value == null) return "";
	if (value instanceof Date) return value.toISOString();
	return String(value);
}
function n(row, key) {
	const value = row[key];
	if (typeof value === "number") return value;
	if (typeof value === "bigint") return Number(value);
	if (typeof value === "string" && value.trim() !== "") return Number(value);
	return 0;
}
function b(row, key) {
	const value = row[key];
	return value === true || value === "t" || value === "true" || value === 1;
}
function nid(row, key) {
	if (row[key] == null || row[key] === "") return null;
	const value = n(row, key);
	return Number.isFinite(value) ? value : null;
}
function tagsOf(value) {
	return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}
function asRole(value) {
	if (value === "owner" || value === "admin" || value === "agent" || value === "viewer") return value;
	return "agent";
}
function obj(input) {
	if (!input || typeof input !== "object") return {};
	return input;
}
function str(value, max = 500) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function flag(value, fallback = false) {
	return typeof value === "boolean" ? value : fallback;
}
function intish(value) {
	if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
	if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Math.trunc(Number(value));
	return null;
}
function mapPolicy(row) {
	return {
		id: s(row, "id"),
		label: s(row, "label"),
		description: s(row, "description"),
		canOrder: b(row, "can_order"),
		canRequestUsers: b(row, "can_request_users"),
		canApproveOrders: b(row, "can_approve_orders"),
		canManagePortal: b(row, "can_manage_portal"),
		scope: s(row, "scope"),
		canTicket: row.can_ticket == null ? true : b(row, "can_ticket"),
		canShop: b(row, "can_shop"),
		canPurchase: b(row, "can_purchase"),
		canPayNow: b(row, "can_pay_now"),
		canOrderIt: b(row, "can_order_it"),
		canOrderPhone: b(row, "can_order_phone"),
		canDefer: b(row, "can_defer")
	};
}
function cleanSubdomain(raw) {
	return raw.trim().replace(/^https?:\/\//i, "").replace(/\.zendesk\.com.*$/i, "").replace(/\/.*$/, "").slice(0, 80);
}
function basicAuth(email, apiToken) {
	const raw = `${email}/token:${apiToken}`;
	if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf8").toString("base64");
	return btoa(raw);
}
function envZendesk() {
	const clientId = (process.env.ZENDESK_OAUTH_CLIENT_ID || "").trim();
	const clientSecret = (process.env.ZENDESK_OAUTH_CLIENT_SECRET || "").trim();
	const tokenUrl = process.env.ZENDESK_OAUTH_TOKEN_URL || "";
	const subdomain = cleanSubdomain(process.env.ZENDESK_SUBDOMAIN || process.env.ZENDESK_HOST || tokenUrl || "shop");
	const email = (process.env.ZENDESK_EMAIL || process.env.ZENDESK_AGENT_EMAIL || "").trim();
	const apiToken = (process.env.ZENDESK_API_TOKEN || process.env.ZENDESK_TOKEN || process.env.ZENDESK_API_KEY || "").trim();
	return {
		subdomain,
		email,
		apiToken,
		fromEnv: Boolean(subdomain && clientId && clientSecret) || Boolean(subdomain && email && apiToken),
		oauthClientId: clientId,
		oauthClientSecret: clientSecret,
		oauthScopes: (process.env.ZENDESK_OAUTH_SCOPES || "read write").trim()
	};
}
async function readZendesk(sql) {
	const envz = envZendesk();
	const row = (await sql`select subdomain, email, api_token, oauth_client_id, oauth_client_secret, oauth_scopes from integration_settings where id = 1`)[0];
	const storedId = row ? s(row, "oauth_client_id") : "";
	const storedSecret = row ? s(row, "oauth_client_secret") : "";
	return {
		subdomain: envz.subdomain || (row ? cleanSubdomain(s(row, "subdomain")) : "") || "shop",
		email: envz.email || (row ? s(row, "email") : ""),
		apiToken: envz.apiToken || (row ? s(row, "api_token") : ""),
		fromEnv: envz.fromEnv,
		oauthClientId: envz.oauthClientId || storedId,
		oauthClientSecret: envz.oauthClientSecret || storedSecret,
		oauthScopes: envz.oauthClientId ? envz.oauthScopes : row && s(row, "oauth_scopes") ? s(row, "oauth_scopes") : envz.oauthScopes
	};
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function oauthReady(settings) {
	return Boolean(settings.subdomain && settings.oauthClientId && settings.oauthClientSecret);
}
var oauthCache = globalThis;
async function zendeskAccessToken(settings) {
	const key = `${settings.subdomain}:${settings.oauthClientId}:${settings.oauthScopes}`;
	const cached = oauthCache.__zendeskOauth;
	if (cached && cached.key === key && cached.expiresAt > Date.now() + 15e3) return cached.token;
	const scopes = [settings.oauthScopes || "read write", "users:read users:write tickets:read tickets:write organizations:read"];
	let lastDetail = "Zendesk rejected the OAuth client.";
	for (const scope of scopes) {
		for (const asForm of [false, true]) {
			const body = asForm ? new URLSearchParams({
				grant_type: "client_credentials",
				client_id: settings.oauthClientId,
				client_secret: settings.oauthClientSecret,
				scope
			}) : JSON.stringify({
				grant_type: "client_credentials",
				client_id: settings.oauthClientId,
				client_secret: settings.oauthClientSecret,
				scope
			});
			const response = await fetch(`https://${settings.subdomain}.zendesk.com/oauth/tokens`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": asForm ? "application/x-www-form-urlencoded" : "application/json"
				},
				body
			});
			const text = await response.text();
			if (response.ok) {
				const parsed = JSON.parse(text);
				if (!parsed.access_token) throw new Error("Zendesk OAuth did not return an access token.");
				const ttl = typeof parsed.expires_in === "number" && parsed.expires_in > 60 ? parsed.expires_in * 1e3 : 18e5;
				oauthCache.__zendeskOauth = {
					key,
					token: parsed.access_token,
					expiresAt: Date.now() + ttl
				};
				return parsed.access_token;
			}
			lastDetail = text.replaceAll(settings.oauthClientSecret, "").slice(0, 180);
			if (response.status !== 400 && response.status !== 401 && response.status !== 415) throw new Error(`Zendesk OAuth returned ${response.status}. ${lastDetail}`);
		}
		if (!/invalid_scope|scope/i.test(lastDetail)) break;
	}
	throw new Error(`Zendesk OAuth returned 400. ${lastDetail}`);
}
async function zendeskAuthorization(settings) {
	if (oauthReady(settings)) return `Bearer ${await zendeskAccessToken(settings)}`;
	if (settings.subdomain && settings.email && settings.apiToken) return `Basic ${basicAuth(settings.email, settings.apiToken)}`;
	throw new Error("Zendesk is not connected. Set ZENDESK_OAUTH_CLIENT_ID and ZENDESK_OAUTH_CLIENT_SECRET for shop, or an API token.");
}
async function zendesk(settings, path, init) {
	if (!settings.subdomain || !oauthReady(settings) && !(settings.email && settings.apiToken)) throw new Error("Zendesk is not connected. Set ZENDESK_OAUTH_CLIENT_ID and ZENDESK_OAUTH_CLIENT_SECRET for shop, or an API token.");
	const url = path.startsWith("http") ? path : `https://${settings.subdomain}.zendesk.com/api/v2${path}`;
	const run = async () => fetch(url, {
		...init,
		headers: {
			Authorization: await zendeskAuthorization(settings),
			Accept: "application/json",
			"Content-Type": "application/json",
			...init?.headers ?? {}
		}
	});
	let response = await run();
	if (response.status === 401 && oauthReady(settings)) {
		oauthCache.__zendeskOauth = void 0;
		response = await run();
	}
	if (response.status === 429) {
		await sleep(Math.min(Number(response.headers.get("retry-after") || "2") || 2, 8) * 1e3);
		response = await run();
	}
	const text = await response.text();
	if (response.status === 429) throw new Error("Zendesk rate limit reached. Wait a moment and try again.");
	if (!response.ok) {
		let detail = text.replaceAll(settings.apiToken, "").replaceAll(settings.oauthClientSecret, "").slice(0, 180);
		try {
			const parsed = JSON.parse(text);
			if (typeof parsed.description === "string") detail = parsed.description.slice(0, 180);
			else if (typeof parsed.error === "string") detail = parsed.error.slice(0, 180);
		} catch {}
		throw new Error(`Zendesk returned ${response.status}. ${detail}`);
	}
	return text ? JSON.parse(text) : {};
}
function supportConnected(settings) {
	return oauthReady(settings) || Boolean(settings.subdomain && settings.email && settings.apiToken);
}
async function filePortalTicket(sql, input) {
	const recent = await sql`
    select id, zendesk_id from tickets
    where lower(requester_email) = lower(${input.email})
      and subject = ${input.subject}
      and created_at > now() - interval '20 minutes'
    order by id desc
    limit 1
  `;
	if (recent[0]) return {
		ticketId: n(recent[0], "id"),
		zendeskId: s(recent[0], "zendesk_id")
	};
	const ticketId = n((await sql`
    insert into tickets (subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label)
    values (
      ${input.subject}, 'new', 'normal', ${input.category}, ${input.organizationId},
      ${input.name}, ${input.email}, 'portal,customer', ''
    )
    returning id
  `)[0], "id");
	await sql`
    insert into ticket_comments (ticket_id, author_name, body, public_note)
    values (${ticketId}, ${input.name || "Customer"}, ${input.body}, true)
  `;
	let zendeskId = "";
	const settings = await readZendesk(sql);
	if (!supportConnected(settings)) {
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
		return {
			ticketId,
			zendeskId
		};
	}
	try {
		const remote = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: {
				subject: input.subject,
				comment: { body: input.body },
				tags: ["portal", "customer"],
				status: "new",
				requester: {
					name: input.name || input.email,
					email: input.email
				}
			} })
		})).ticket);
		zendeskId = remote.id != null ? String(remote.id) : "";
		if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
	} catch {
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
	}
	return {
		ticketId,
		zendeskId
	};
}
var getSessionHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a918b2797a5be32ed7a20dff55e9c38d29629dc0ef44513ed038a4247e339169"));
var openPortalFromAuth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("36088162f1764903b1db469770d95d49a581e235cece6369ffcd06a7c02b1c07"));
var savePortalCompany = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const business = str(raw.business, 160);
	const phone = str(raw.phone, 40);
	const city = str(raw.city, 80);
	if (!token) throw new Error("Sign in again.");
	if (!business) throw new Error("Enter the company name.");
	return {
		token,
		business,
		phone,
		city
	};
}).handler(createSsrRpc("f03851143e75eacf9555a0652ab6610686ed21e8cb847b86a1759fc3ebbb28c7"));
var getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3f30520125428c05602f315273312b8a15eee718a92a5af4748653977e75b589"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b8970975a479b325d55bc98118214e07425b316ecf450eb26da0a941dcce9fa7"));
var getNotification = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("fd35791ca7d409310cdb3216ede8fad5b0c317d726293081a6ce30901f5f2364"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e4757ece97cc9d09404e3b5af23b1650f02f5f8e84a5fee0edf33befa441c5dc"));
function ticketFilter(input) {
	const raw = obj(input);
	return {
		q: str(raw.q, 120),
		status: str(raw.status, 32) || "unresolved",
		orgId: intish(raw.orgId),
		category: str(raw.category, 80),
		assignee: str(raw.assignee, 120),
		view: str(raw.view, 80)
	};
}
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(ticketFilter).handler(createSsrRpc("8fc8c591f3586970bd83eebfb0f17f9a574bc871aa0a60fad52a0b01589563bf"));
var getTicket = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing ticket.");
	return value;
}).handler(createSsrRpc("4adceff40dbb5d9b2ea595bcf4ab2c6e92b7fe74e73108bf1f85e2a365176b14"));
var replyTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const ticketId = intish(raw.ticketId);
	const body = str(raw.body, 4e3);
	if (!ticketId || !body) throw new Error("Write a reply before sending.");
	return {
		ticketId,
		body,
		publicNote: flag(raw.publicNote, true)
	};
}).handler(createSsrRpc("b0e1e288e1f670a85f294c653c0de13e892bedc014c6ac62dee675c698fc6a1a"));
var updateTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	if (!id) throw new Error("Missing ticket.");
	const status = str(raw.status, 32);
	if (status && ![
		"new",
		"open",
		"pending",
		"solved",
		"closed"
	].includes(status)) throw new Error("Unknown status.");
	return {
		id,
		status,
		assignee: str(raw.assignee, 120),
		priority: str(raw.priority, 32),
		organizationId: raw.organizationId === void 0 ? void 0 : intish(raw.organizationId)
	};
}).handler(createSsrRpc("5745ee98f006b7faf92a1bc4397e11590b20a2526db8579e3e2094f9a67dbbe5"));
var listOrgs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4fbe74b4be576658496e247d516ea505284bbe0f38aff11191be8ca286b160ce"));
var getOrg = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing company.");
	return value;
}).handler(createSsrRpc("f0aed5deacb7fe81e5d9ad3ee604664b02c2f90fa43d049b98963e1fdf9cf62a"));
var saveOrg = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	if (!name) throw new Error("Company name is required.");
	return {
		id: intish(raw.id),
		name,
		domain: str(raw.domain, 160),
		industry: str(raw.industry, 80),
		phone: str(raw.phone, 40),
		address: str(raw.address, 240),
		zendeskOrgId: str(raw.zendeskOrgId, 40),
		notes: str(raw.notes, 2e3),
		portalAccess: flag(raw.portalAccess, true),
		orderingEnabled: flag(raw.orderingEnabled, true),
		userRequestsEnabled: flag(raw.userRequestsEnabled, true),
		approvalRequired: flag(raw.approvalRequired, true)
	};
}).handler(createSsrRpc("418c0f1e1a743693f9818c0fa3a0a5d88c422f497823edd34de53215bedfbd35"));
var getPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("232a25774506ba82cea2e255080fc9efafaa2fa8e9a845ab20d3a5fb6d6eb618"));
var saveCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	const email = str(raw.email, 180);
	if (!name || !email) throw new Error("Name and email are required.");
	const level = str(raw.permissionLevel, 32) || "regular";
	if (level !== "regular" && level !== "authorized") throw new Error("Unknown permission level.");
	return {
		id: intish(raw.id),
		organizationId: intish(raw.organizationId),
		name,
		email,
		title: str(raw.title, 120),
		permissionLevel: level,
		canOrder: flag(raw.canOrder),
		canRequestUsers: flag(raw.canRequestUsers),
		canApproveOrders: flag(raw.canApproveOrders),
		active: flag(raw.active, true),
		zendeskUserId: str(raw.zendeskUserId, 40)
	};
}).handler(createSsrRpc("4a80509859e38f16a6df04b02480fa29987bad92a917963f03201d814a6a56df"));
var reviewRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const decision = str(raw.decision, 16);
	if (!id || decision !== "approved" && decision !== "denied") throw new Error("Choose a decision.");
	return {
		id,
		decision
	};
}).handler(createSsrRpc("cb2ab385cfd834099b031a34d4128fc790f7111f4d4082652e985dad027dad0f"));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e11cfcd4ab1992da649de8b88723932e1f58799e9fe3b16826626dcbe17fd43c"));
var saveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	const sku = str(raw.sku, 40);
	if (!name || !sku) throw new Error("Name and SKU are required.");
	const price = intish(raw.priceCents);
	if (price == null || price < 0) throw new Error("Enter a price.");
	const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : "";
	const images = (Array.isArray(raw.images) ? raw.images : []).filter((item) => typeof item === "string" && item.length > 0).slice(0, 8);
	if (imageUrl && !images.includes(imageUrl)) images.unshift(imageUrl);
	const photos = images.slice(0, 8);
	if (photos.some((item) => item.length > 9e5)) throw new Error("A photo is too large. Use images under 8 MB.");
	const main = imageUrl && photos.includes(imageUrl) ? imageUrl : photos[0] ?? "";
	const visibility = str(raw.visibility, 32) === "authorized" ? "authorized" : "all";
	return {
		id: intish(raw.id),
		sku,
		name,
		category: str(raw.category, 80),
		description: str(raw.description, 2e3),
		specs: str(raw.specs, 2e3),
		priceCents: price,
		stock: Math.max(0, intish(raw.stock) ?? 0),
		imageUrl: main,
		images: photos,
		available: flag(raw.available, true),
		visibility
	};
}).handler(createSsrRpc("c3af807360839902a06252eb3c0eeb62f3fe3187e2d913498d4b4f3b94eb2376"));
var removeProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing product.");
	return value;
}).handler(createSsrRpc("4a674cd9b9a1c8fa62fa2f63958614f12ca20d1de8364be501d5607b0174770d"));
var importProducts = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const rows = Array.isArray(raw.rows) ? raw.rows : [];
	if (!rows.length) throw new Error("That spreadsheet has no products.");
	if (rows.length > 200) throw new Error("Import up to 200 products at a time.");
	return { rows: rows.map((item) => {
		const row = obj(item);
		const image = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
		const imageUrl = image.startsWith("https://") || image.startsWith("http://") || image.startsWith("/") ? image.slice(0, 500) : "";
		const price = intish(row.priceCents);
		return {
			sku: str(row.sku, 40),
			name: str(row.name, 160),
			category: str(row.category, 80) || "Accessories",
			description: str(row.description, 2e3),
			specs: str(row.specs, 2e3),
			priceCents: price != null && price >= 0 ? price : -1,
			imageUrl,
			available: flag(row.available, true),
			visibility: str(row.visibility, 32) === "authorized" ? "authorized" : "all"
		};
	}) };
}).handler(createSsrRpc("45e81e25d62f6095d14f3de49f21278e58c08d05748828c68c5c3c925994a191"));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("831f84a019fab8dbd63d43c67e9a251b3d70bfbe081fa76acaf0e33db552ab25"));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("c115b8940b8a58256bd3f466da852cb9acb7532ab6385b8a57f40498fee5711d"));
async function mailOrder(sql, orderId, template) {
	const row = (await sql`
    select o.ship_email, o.payment_status, o.tracking_number, o.tracking_carrier, cu.email as customer_email
    from orders o
    left join customer_users cu on cu.id = o.customer_user_id
    where o.id = ${orderId}
  `)[0];
	if (!row) return;
	const to = s(row, "ship_email") || s(row, "customer_email");
	const number = `MT-${1e3 + orderId}`;
	if (template === "confirmation") {
		await sendOrderEmail(sql, {
			orderId,
			to,
			template,
			subject: `${number} received`,
			body: `We received ${number}. We will email you again when it ships. Payment: ${s(row, "payment_status") || "pending"}.`
		});
		return;
	}
	if (template === "payment_due") {
		await sendOrderEmail(sql, {
			orderId,
			to,
			template,
			subject: `${number} payment is still open`,
			body: `${number} is still unpaid. Reply to this message or pay from the link in your account.`
		});
		return;
	}
	if (template === "shipped" || template === "delivered") await sendOrderEmail(sql, {
		orderId,
		to,
		template,
		subject: template === "delivered" ? `${number} delivered` : `${number} shipped`,
		body: `${number} is ${template}.${s(row, "tracking_number") ? ` Tracking ${s(row, "tracking_carrier")} ${s(row, "tracking_number")}.` : ""}`
	});
}
async function pushTicket(sql, ticketId) {
	const ticket = (await sql`select * from tickets where id = ${ticketId}`)[0];
	if (!ticket || s(ticket, "zendesk_id")) return;
	const settings = await readZendesk(sql);
	if (!supportConnected(settings)) throw new Error("Zendesk Support is not connected.");
	const comments = await sql`select body from ticket_comments where ticket_id = ${ticketId} order by id limit 1`;
	const remote = obj((await zendesk(settings, "/tickets.json", {
		method: "POST",
		body: JSON.stringify({ ticket: {
			subject: s(ticket, "subject"),
			comment: { body: comments[0] ? s(comments[0], "body") : s(ticket, "subject") },
			status: "new",
			requester: {
				name: s(ticket, "requester_name") || s(ticket, "requester_email"),
				email: s(ticket, "requester_email")
			}
		} })
	})).ticket);
	const zendeskId = remote.id != null ? String(remote.id) : "";
	if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
}
async function ensureOrderTicket(sql, orderId) {
	const order = (await sql`
    select o.id, o.ticket_id, o.organization_id, o.notes, coalesce(org.name, '') as organization_name,
      coalesce(cu.name, o.ship_name, '') as customer_name, coalesce(cu.email, o.ship_email, '') as customer_email
    from orders o
    left join organizations org on org.id = o.organization_id
    left join customer_users cu on cu.id = o.customer_user_id
    where o.id = ${orderId}
  `)[0];
	if (!order) return;
	let ticketId = nid(order, "ticket_id") ?? 0;
	if (!ticketId) {
		ticketId = n((await sql`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
      ) values (
        ${`Catalog order MT-${1e3 + orderId}`}, 'open', 'normal', 'Ordering', ${n(order, "organization_id")},
        ${s(order, "customer_name")}, ${s(order, "customer_email")}, 'order,pending_order', 'Pending Orders'
      )
      returning id
    `)[0], "id");
		await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, 'Desk', ${`${s(order, "organization_name")}\n${s(order, "notes")}`}, true)
    `;
		await sql`update orders set ticket_id = ${ticketId}, updated_at = now() where id = ${orderId}`;
	}
	await pushTicket(sql, ticketId);
	const fresh = await sql`select zendesk_id from tickets where id = ${ticketId}`;
	const zendeskId = fresh[0] ? s(fresh[0], "zendesk_id") : "";
	if (zendeskId) await sql`update orders set zendesk_ticket_id = ${zendeskId} where id = ${orderId}`;
}
async function sweepDesk(sql) {
	const unpaid = await sql`
    select id from orders
    where payment_status in ('', 'pending', 'unpaid', 'portal')
      and status not in ('cancelled', 'fulfilled')
      and created_at < now() - interval '3 days'
    limit 20
  `;
	for (const row of unpaid) {
		const id = n(row, "id");
		await enqueueJob(sql, "remind_unpaid", `remind-${id}`, { orderId: id });
	}
	const stale = await sql`
    select id from orders
    where shipment_status = 'unfulfilled' and status in ('approved', 'processing')
      and created_at < now() - interval '2 days'
    limit 20
  `;
	for (const row of stale) {
		const id = n(row, "id");
		await enqueueJob(sql, "stale_shipment", `stale-${id}`, { orderId: id });
	}
}
async function runPortalJobs(sql) {
	await sweepDesk(sql);
	try {
		const { sweepSarahActions } = await import("./sarah-PMAGRA0B.mjs").then((n) => n.i).then((n) => n.i);
		await sweepSarahActions(sql);
	} catch {}
	const jobs = await dueJobs(sql, 12);
	for (const job of jobs) {
		let payload = {};
		try {
			payload = JSON.parse(job.payload);
		} catch {
			payload = {};
		}
		try {
			if (job.kind === "email" && payload.emailId) await resendStoredEmail(sql, payload.emailId);
			else if (job.kind === "zendesk_ticket" && payload.ticketId) await pushTicket(sql, payload.ticketId);
			else if (job.kind === "order_ticket" && payload.orderId) await ensureOrderTicket(sql, payload.orderId);
			else if (job.kind === "remind_unpaid" && payload.orderId) await mailOrder(sql, payload.orderId, "payment_due");
			else if (job.kind === "stale_shipment" && payload.orderId) await recordEvent(sql, {
				orderId: payload.orderId,
				kind: "attention",
				actor: "Desk",
				detail: "Still unfulfilled after 2 days"
			});
			await finishJob(sql, job.id, "", job.attempts + 1, job.maxAttempts);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Job failed.";
			await finishJob(sql, job.id, message, job.attempts + 1, job.maxAttempts);
		}
	}
}
var runDeskJobs = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("a82dcc574f2c811376947f9a445ecc8fe8aedde58a4c89185836103347ca2bb3"));
var createOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const organizationId = intish(raw.organizationId);
	if (!organizationId) throw new Error("Choose a company.");
	const items = (Array.isArray(raw.items) ? raw.items : []).map((item) => {
		const row = obj(item);
		return {
			productId: intish(row.productId) ?? 0,
			quantity: intish(row.quantity) ?? 0
		};
	}).filter((item) => item.productId > 0 && item.quantity > 0);
	if (!items.length) throw new Error("Add at least one product.");
	const paymentMethod = str(raw.paymentMethod, 32);
	const returnUrl = str(raw.returnUrl, 300);
	return {
		organizationId,
		customerUserId: intish(raw.customerUserId),
		notes: str(raw.notes, 2e3),
		paymentMethod,
		returnUrl,
		items
	};
}).handler(createSsrRpc("72d38b4e1c78504ef4b98122d058ed8f7eb0f96a26b270a4da09f895640f0b62"));
var updateOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const status = str(raw.status, 32);
	const allowed = [
		"pending",
		"approved",
		"processing",
		"fulfilled",
		"cancelled"
	];
	const shipments = [
		"unfulfilled",
		"shipped",
		"out_for_delivery",
		"delivered"
	];
	const shipmentStatus = str(raw.shipmentStatus, 32);
	if (!id || !allowed.includes(status)) throw new Error("Choose an order status.");
	const items = Array.isArray(raw.items) ? raw.items.map((item) => {
		const row = obj(item);
		const quantity = intish(row.quantity) ?? 0;
		if (quantity < 1 || quantity > 999) throw new Error("Enter a quantity between 1 and 999.");
		return {
			productId: intish(row.productId),
			sku: str(row.sku, 40),
			quantity
		};
	}) : null;
	if (items && !items.length) throw new Error("An order needs at least one item.");
	return {
		id,
		status,
		approvalNote: str(raw.approvalNote, 2e3),
		processingNote: str(raw.processingNote, 2e3),
		shipmentStatus: shipments.includes(shipmentStatus) ? shipmentStatus : "unfulfilled",
		trackingNumber: str(raw.trackingNumber, 80),
		trackingCarrier: str(raw.trackingCarrier, 40),
		notes: typeof raw.notes === "string" ? str(raw.notes, 2e3) : null,
		items
	};
}).handler(createSsrRpc("e8753131772855b6687893f6be22770d2601ad7ac111e01c082caf03596aa957"));
var deleteOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("b45630fe88b9fdd90686d2d7a534599ac59ea74aafb49cea01803f4e5f2ceec0"));
var trackAwb = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const awb = str(typeof input === "string" ? input : obj(input).awb, 40);
	if (awb.replace(/[^0-9A-Za-z]/g, "").length < 8) throw new Error("Scan or type the air waybill.");
	return awb;
}).handler(createSsrRpc("a7b2cf4fd8d09d663efd676ff546f27a64487258b43a14f92ed476ea7e8a8821"));
var linkOrderTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("19ad874d40be191851943cd0742210b04365886e52ed9a5b0313fd7e1556fafe"));
var listForms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b8a8e07cb55604bc37b9e39b903a2f687bbef309a8c2d4d5427e8ef4df807382"));
var saveForm = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	if (!name) throw new Error("Form name is required.");
	const required = Array.isArray(raw.requiredFields) ? raw.requiredFields.map((field) => str(field, 40)).filter(Boolean) : tagsOf(str(raw.requiredFields, 400));
	return {
		id: intish(raw.id),
		name,
		category: str(raw.category, 80),
		subcategory: str(raw.subcategory, 80),
		zendeskField: str(raw.zendeskField, 80),
		requiredFields: required.join(","),
		restricted: flag(raw.restricted),
		active: flag(raw.active, true)
	};
}).handler(createSsrRpc("33566ad32bac51299c67cf4c015d83da54b46db4a6ca2c11a6b6132ff080f94c"));
var testForm = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const formId = intish(raw.formId);
	const organizationId = intish(raw.organizationId);
	if (!formId || !organizationId) throw new Error("Choose a form and a company.");
	const fields = obj(raw.fields);
	const clean = {};
	for (const [key, value] of Object.entries(fields)) clean[key] = str(value, 2e3);
	return {
		formId,
		organizationId,
		fields: clean,
		asRegular: flag(raw.asRegular, true)
	};
}).handler(createSsrRpc("e4ddc06d2ec61b5cbd56f561d7961a7fde0d8f395472983bbfe965eeadc48814"));
var listPolicies = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2811f80dd615bd5d4c4435f679121e304e6b7e4ae9b6da5b60cdf3b1a4df2ab2"));
var savePolicy = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = str(raw.id, 40);
	if (!id) throw new Error("Missing role.");
	return {
		id,
		canOrder: flag(raw.canOrder),
		canRequestUsers: flag(raw.canRequestUsers),
		canApproveOrders: flag(raw.canApproveOrders),
		canManagePortal: flag(raw.canManagePortal),
		canTicket: flag(raw.canTicket, true),
		canShop: flag(raw.canShop),
		canPurchase: flag(raw.canPurchase),
		canPayNow: flag(raw.canPayNow),
		canOrderIt: flag(raw.canOrderIt),
		canOrderPhone: flag(raw.canOrderPhone),
		canDefer: flag(raw.canDefer)
	};
}).handler(createSsrRpc("bff56ee0338820f149806a5679ea1867d0ee6ff1080722d2dcd1fb01b77afa9a"));
var getSarahMetrics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b19d278eb40756dc5b50f427d70db4b06243d51f42ec23d38708f7c7732543c7"));
var getIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("af4de7546fdba97335a36bf244736651e02e56040a542e4d8626b1a6938c0137"));
var saveIntegration = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	return {
		subdomain: cleanSubdomain(str(raw.subdomain, 120)),
		email: str(raw.email, 180),
		apiToken: str(raw.apiToken, 200),
		clearToken: flag(raw.clearToken),
		oauthClientId: str(raw.oauthClientId, 120),
		oauthClientSecret: str(raw.oauthClientSecret, 200),
		oauthScopes: str(raw.oauthScopes, 180) || "read write",
		clearOauth: flag(raw.clearOauth)
	};
}).handler(createSsrRpc("039e73ecb7b770fd06ca72d4dd05126cc1107c36ed79939ac642d1c75b0b9549"));
var testIntegration = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8267b9b43d81ff77f996791a832672ab18dedee21e7104a4debb5d87677dc705"));
var syncZendesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("db77de5565864615cf86e0700205113a8803b82964fde96f76c4a8aa8d167062"));
var syncPortalUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("eefe1b2139b9a095ac3d34188838b25316468915b51adccccd6f3c4c895177e2"));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("62d5a17b50ad151ca9ad632360b484b9338217ef1cbf03b4906c1f95b5c61b2c"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const brandName = str(raw.brandName, 80);
	if (!brandName) throw new Error("Brand name is required.");
	return {
		brandName,
		supportEmail: str(raw.supportEmail, 180),
		tagline: str(raw.tagline, 240),
		notifyNewTicket: flag(raw.notifyNewTicket, true),
		notifyNewOrder: flag(raw.notifyNewOrder, true),
		customerCatalogVisible: flag(raw.customerCatalogVisible, true)
	};
}).handler(createSsrRpc("b0f379b93ca9398d5e1a4acccb7adc4ce9e00add400f24ff4afd1298806bf9ac"));
var saveResend = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const fromEmail = str(raw.fromEmail, 180).replace(/[<>]/g, "");
	if (!fromEmail.includes("@")) throw new Error("Enter the noreply address.");
	return {
		fromEmail,
		apiKey: str(raw.apiKey, 200)
	};
}).handler(createSsrRpc("e974204c52d0e42fe66ef3d4a57018eecc005bebfc64151909d0b35966c0f406"));
var testResend = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("571bab71bc9d2a5f073ec33d084cb4dd1f4f246bdc978c53fb86e1b4a2c93b01"));
var sendTestEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const to = str(typeof input === "string" ? input : obj(input).to, 180);
	if (!to.includes("@")) throw new Error("Enter the address that should receive the test.");
	return to;
}).handler(createSsrRpc("439a145bbc49341541751ebb26a5a14e2008ae6af126636cc4070024b168ab16"));
var saveStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const userId = str(raw.userId, 80);
	const role = asRole(str(raw.role, 32));
	if (!userId) throw new Error("Missing staff member.");
	return {
		userId,
		role,
		active: flag(raw.active, true),
		organizationId: intish(raw.organizationId)
	};
}).handler(createSsrRpc("bb2b538133ede151b6fe4b4b094400ad002c31b110d59bd68450c339801704bb"));
var getPayments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("dfaa658b4c2fce2c8aac4fba6f146d0ddd01dc410e260030ad8cd5570345adaa"));
var savePayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const terms = str(raw.invoiceTerms, 40);
	return {
		cardEnabled: flag(raw.cardEnabled, false),
		invoiceEnabled: flag(raw.invoiceEnabled, true),
		purchaseOrderEnabled: flag(raw.purchaseOrderEnabled, true),
		publishableKey: str(raw.publishableKey, 120),
		secretKey: str(raw.secretKey, 200),
		clearSecret: flag(raw.clearSecret, false),
		invoiceTerms: [
			"Net 15",
			"Net 30",
			"Net 45"
		].includes(terms) ? terms : "Net 30",
		requirePo: flag(raw.requirePo, false),
		alternativeEnabled: flag(raw.alternativeEnabled, true),
		alternativeClientId: str(raw.alternativeClientId, 120),
		alternativeClientSecret: str(raw.alternativeClientSecret, 200),
		clearAlternativeSecret: flag(raw.clearAlternativeSecret, false),
		alternativeEnvironment: alternativeMode(str(raw.alternativeEnvironment, 16))
	};
}).handler(createSsrRpc("225663cb1bb354603c205d5aabd6a5459388309ad5b5aa1cc93b0b72913dc023"));
var testPayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("5b73ba21e97c8dad3c8ec2284acf2248c024c6a0be0fbd07abde9efcb935e5f5"));
var testAlternative = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f4c15876b91381be1a1a5430cc4e73bb3e7e5629b928e57536f1869b91f20f15"));
var refreshAlternativeOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("ac50fa25a8c0af214c48b56e2b0b07ed7496ef6c0e0bc82e42fa187a6b973ddd"));
var getStorefront = createServerFn({ method: "GET" }).handler(createSsrRpc("e002bfeae19e89322e5bda5a5d1981718c1ac500764589e5558f116614fe1bf2"));
var getShopCheckout = createServerFn({ method: "GET" }).validator((input) => typeof input === "string" ? input : "").handler(createSsrRpc("2444a9daa5bdee0aa8bad40ecac51400b55a10983502f68e6bcfeaedd89c4aee"));
var setShopPayLater = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	if (!id) throw new Error("Choose a shop customer.");
	return {
		id,
		payLater: raw.payLater === true
	};
}).handler(createSsrRpc("7f8fdd49231c93a0d6e183ccb30e97fcc8d1127c35f2ec79cd549c0b9c8e1cfc"));
async function shopByToken(sql, token) {
	if (!token) return void 0;
	return (await sql`
    select * from shop_customers
    where session_token = ${token} and session_expires > now()
    limit 1
  `)[0];
}
var shopRegister = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, true)).handler(createSsrRpc("62beba8a04e9f66641d4e6f42ae1724ce382e7d5b742d5a63659c53f8e81676f"));
var shopLogin = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, false)).handler(createSsrRpc("c66c27b00ab4372a9b30c9c26822c913f782ecdf4dc9681d32499b38af81ad3e"));
var shopLogout = createServerFn({ method: "POST" }).validator((input) => ({ token: str(obj(input).token, 80) })).handler(createSsrRpc("be47dfa17f463fbc61a2a072b0aaaa230867d9fe47c5118e17df31be541667b3"));
var getShopAccount = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("38afa57349a8410b70ad520028e233a2fc20ba16edbf8a32e82ad41a833184c8"));
async function accessFor(sql, row) {
	const roleId = s(row, "role_id") || "regular";
	const rows = await sql`select * from role_policies where id = ${roleId}`;
	const policy = rows[0] ? mapPolicy(rows[0]) : null;
	const canShop = Boolean(policy?.canShop) || b(row, "grant_shop");
	const canDefer = b(row, "grant_invoice");
	return {
		roleId,
		roleLabel: canDefer ? "Account" : canShop ? "Shop" : "Customer",
		canTicket: policy ? policy.canTicket : true,
		canShop,
		canPurchase: Boolean(policy?.canPurchase) || b(row, "grant_shop"),
		canPayNow: Boolean(policy?.canPayNow) || b(row, "grant_shop"),
		canOrderIt: Boolean(policy?.canOrderIt) || b(row, "grant_services"),
		canOrderPhone: Boolean(policy?.canOrderPhone) || b(row, "grant_services"),
		canDefer
	};
}
async function requirePortal(sql, token) {
	const row = await shopByToken(sql, token);
	if (!row) throw new Error("Sign in again.");
	return {
		row,
		access: await accessFor(sql, row)
	};
}
async function loadPortalCustomer(token) {
	const sql = await getSql();
	const found = await requirePortal(sql, token);
	return {
		sql,
		row: found.row,
		access: found.access
	};
}
var getPortalSession = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("3baa30964d8426c8002968b9b4948517b2b19f5ddaeb2112b27d172cf0a36297"));
var getPortalTicket = createServerFn({ method: "GET" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing ticket.");
	return {
		token,
		id
	};
}).handler(createSsrRpc("b45e7ed1b61a7c28074338a2b5cc836c55971be769e5fb609cc9be95e60ce586"));
var submitPortalTicket = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const subject = str(raw.subject, 180);
	const body = str(raw.body, 4e3);
	const category = str(raw.category, 80) || "IT support";
	const severity = str(raw.severity, 20) || "normal";
	const device = str(raw.device, 120);
	if (!token) throw new Error("Sign in again.");
	if (!subject || !body) throw new Error("Subject and details are required.");
	return {
		token,
		subject,
		body,
		category,
		severity,
		device
	};
}).handler(createSsrRpc("b8b12c9a304b1d765d10479d586d5610229b362f4b8c73110c26d0f846e6732f"));
var refreshPortalTicket = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing ticket.");
	return {
		token,
		id
	};
}).handler(createSsrRpc("0fcef1892d29b84597bde18ac0a5888625a7e35aa57c71eb6c4bc67625a12947"));
var SERVICE_MENU = {
	outlook: {
		group: "it",
		name: "Outlook and mailbox setup",
		cents: 15e3
	},
	printer: {
		group: "it",
		name: "Printer setup",
		cents: 8e3
	},
	network: {
		group: "it",
		name: "Network visit",
		cents: 25e3
	},
	phone: {
		group: "phone",
		name: "Business phone line",
		cents: 4500
	},
	internet: {
		group: "phone",
		name: "Internet circuit",
		cents: 8900
	}
};
createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const service = str(raw.service, 20);
	const notes = str(raw.notes, 1e3);
	if (!token) throw new Error("Sign in again.");
	if (!(service in SERVICE_MENU)) throw new Error("Choose a service.");
	return {
		token,
		service,
		notes
	};
}).handler(createSsrRpc("520532b038adf7ac3062ca749dad742b0de24ff3b591e3c0b635d89e8fabdb83"));
var setShopRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const roleId = str(raw.roleId, 40);
	if (!id || !roleId) throw new Error("Choose a customer and a role.");
	return {
		id,
		roleId
	};
}).handler(createSsrRpc("9682f71bb42db5a4157e422855a9c0b7f7b8e56235d35d75ae07a3a7f6489d5b"));
var INTERESTS = [
	"Managed IT",
	"Microsoft 365",
	"Phone Systems",
	"Internet Services",
	"Cloud Services",
	"Hardware"
];
createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const creds = shopCredentials({
		email: raw.email,
		password: raw.password,
		name: raw.name
	}, true);
	const business = str(raw.business, 160);
	const phone = str(raw.phone, 40);
	const interests = (Array.isArray(raw.interests) ? raw.interests : []).filter((item) => typeof item === "string" && INTERESTS.includes(item)).slice(0, 6);
	if (!business) throw new Error("Enter the business name.");
	if (!phone) throw new Error("Enter a phone number.");
	return {
		...creds,
		business,
		phone,
		interests
	};
}).handler(createSsrRpc("ef51c3075a53a008f87aa89b4711bbe4b962b6e305c21dbef6aec357557c2f1e"));
var portalVerify = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const email = str(raw.email, 160).toLowerCase();
	const code = str(raw.code, 12);
	if (!email || !code) throw new Error("Enter the email and the code.");
	return {
		email,
		code
	};
}).handler(createSsrRpc("45f98ce29f8c5a81ef97557158a44ab33945153681a2bcd317f544ea1876d5d4"));
var listServiceCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("d8c5d6a23fa55f4afab3270ccd551b0035ee0bf29a1dedfb5e1ba4a2a4ba039f"));
var getService = createServerFn({ method: "GET" }).validator((id) => intish(id)).handler(createSsrRpc("6de3fdc725c91247b6561b3442ec198fddd1c34421f12f136656704a45bc6809"));
var listCampaigns = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("3f60e2662d7932ee0461c87e59b043986cf6757ef091542c9f3ba7728beae611"));
var saveCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const title = str(raw.title, 140);
	if (!title) throw new Error("Enter a title.");
	const audience = str(raw.audience, 20);
	return {
		title,
		body: str(raw.body, 600),
		audience: audience === "shop" || audience === "business" ? audience : "all",
		ctaLabel: str(raw.ctaLabel, 40),
		ctaHref: str(raw.ctaHref, 180)
	};
}).handler(createSsrRpc("1a9f623f8b82f424a5ee457e79e56aec6cc2a3cb370615b917c00dc5381acf02"));
var listMyComplaints = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("51c36197aaad24d6d70e3ff7b74e8c2f27d065d0a27c7642eecac403824db25a"));
var listCustomerNotices = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("9c2488172386df5a665488576e0533748606742135cc82a02cbfaf3dfc6bb281"));
var markCustomerNotice = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing notice.");
	return {
		token,
		id
	};
}).handler(createSsrRpc("5aea27d5aa47f2a51e5074b057732de927026de4fc23ed2dc35d56b3d527574b"));
var respondToQuote = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	const decision = str(raw.decision, 20);
	if (!token || !id) throw new Error("Missing quote.");
	if (decision !== "accepted" && decision !== "rejected") throw new Error("Accept or reject the quote.");
	return {
		token,
		id,
		decision
	};
}).handler(createSsrRpc("ee937fb0ccf5d7691746545e15f16517fe62988e7edcef4e115c7738025fa757"));
var submitComplaint = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const kind = str(raw.kind, 40);
	const subject = str(raw.subject, 160);
	const body = str(raw.body, 2e3);
	if (!token || !subject || !body) throw new Error("Describe the complaint.");
	return {
		token,
		kind: kind || "General feedback",
		subject,
		body
	};
}).handler(createSsrRpc("cf8428acf6adafd55c56df22a028cf5f57aeef70b59fae77b9226f786bacecea"));
var replyPortalTicket = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	const body = str(raw.body, 4e3);
	if (!token || !id || !body) throw new Error("Write a reply.");
	return {
		token,
		id,
		body
	};
}).handler(createSsrRpc("3d7f01015833c17daf8a2b0316fd1b739e9112f411e9ae6599991404062cb349"));
var saveCustomerSignup = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const interests = (Array.isArray(raw.interests) ? raw.interests : []).filter((item) => typeof item === "string").map((item) => item.slice(0, 40)).slice(0, 6);
	return {
		business: str(raw.business, 160),
		phone: str(raw.phone, 40),
		address: str(raw.address, 160),
		city: str(raw.city, 80),
		interests
	};
}).handler(createSsrRpc("7c2bfc7d3833b20a93517d3f4fefa3465d783cadcdec5572dbab0d92ca28ac92"));
var requestPortalService = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const serviceId = intish(raw.serviceId);
	const details = str(raw.details, 2e3);
	const severity = str(raw.severity, 20) || "normal";
	if (!token || !serviceId) throw new Error("Choose a service.");
	if (!details) throw new Error("Tell us what you need.");
	return {
		token,
		serviceId,
		details,
		severity
	};
}).handler(createSsrRpc("6d616b6177f9370fcbbfa995d8126aa9ca4beb37a314de8d56cb14b417fc2de7"));
var ORDER_OFFERINGS = {
	network: {
		name: "Connect an office to the network",
		category: "Network"
	},
	"voip-line": {
		name: "VoIP phone line",
		category: "Phone"
	},
	"voip-ext": {
		name: "VoIP extension",
		category: "Phone"
	},
	"fax-physical": {
		name: "Physical fax",
		category: "Fax"
	},
	"fax-efax": {
		name: "eFax",
		category: "Fax"
	},
	"internet-spectrum": {
		name: "Spectrum cable",
		category: "Internet"
	},
	"internet-att": {
		name: "AT&T Fiber",
		category: "Internet"
	},
	"internet-frontier": {
		name: "Frontier Fiber",
		category: "Internet"
	},
	"internet-fixed": {
		name: "Fixed wireless",
		category: "Internet"
	},
	wiring: {
		name: "Wiring drop",
		category: "Wiring"
	}
};
var orderPortalOffering = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const offering = str(raw.offering, 40);
	const site = str(raw.site, 200);
	const notes = str(raw.notes, 1e3);
	const recipientEmail = str(raw.recipientEmail, 160).toLowerCase();
	const drops = intish(raw.drops) ?? 1;
	const shipPhone = Boolean(raw.shipPhone);
	const confirmMonthly = Boolean(raw.confirmMonthly);
	if (!token) throw new Error("Sign in again.");
	if (!(offering in ORDER_OFFERINGS)) throw new Error("Choose a service.");
	return {
		token,
		offering,
		site,
		notes,
		recipientEmail,
		drops: Math.min(50, Math.max(1, drops)),
		shipPhone,
		confirmMonthly
	};
}).handler(createSsrRpc("b1b3463343f831da61496ab0abe2f169c155d98606a8e082ef945610179b79f0"));
var listPortalServices = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("83f6eb4edddc59c53ff4ce85d434f999b6ff089fc143e91c50aa859970d31089"));
var listServiceDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("609c4c84a1c6c47e1747f027d7b2dd6e4e042fd2a281daac55e37a8e339fb9b6"));
var setServiceStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const status = str(raw.status, 20);
	const quoteNote = str(raw.quoteNote, 500);
	if (!id) throw new Error("Choose a request.");
	if (![
		"requested",
		"quoted",
		"approved",
		"provisioning",
		"active",
		"declined"
	].includes(status)) throw new Error("Unknown status.");
	return {
		id,
		status,
		quoteNote
	};
}).handler(createSsrRpc("86ff99aad4389fdd6baf46537c4b43b8ea1002f7643d4173bd7cc0c3678481ea"));
var listPortalCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3508cbba2401c1c5c44d4aa7068c8c17df8a52fb379af9a4b3b2ccd410276928"));
var setPortalGrants = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	if (!id) throw new Error("Choose a customer.");
	return {
		id,
		shop: flag(raw.shop),
		services: flag(raw.services),
		invoice: flag(raw.invoice)
	};
}).handler(createSsrRpc("975333af53d3e32135550ef42f500cdf2dc7103754b4eb7feac31a37d482d18e"));
var listDeskAccounts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("325fed0546db7ebc0701af5dd01048e22449bf1085ad2fee9bbb8ba20a5406b2"));
var setDeskRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const userId = str(raw.userId, 80);
	const role = str(raw.role, 32);
	if (!userId) throw new Error("Choose an account.");
	if (![
		"customer",
		"viewer",
		"agent",
		"admin",
		"owner"
	].includes(role)) throw new Error("Unknown role.");
	return {
		userId,
		role
	};
}).handler(createSsrRpc("ee0efd003670f71c9b646af7a590d18ac2fda0608bba17eeb24f503f24df1919"));
var saveShopProfile = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	if (!token) throw new Error("Sign in again.");
	return {
		token,
		name: str(raw.name, 120),
		phone: str(raw.phone, 40),
		address: str(raw.address, 160),
		city: str(raw.city, 80),
		region: str(raw.region, 80),
		postal: str(raw.postal, 20),
		country: str(raw.country, 80) || "United States"
	};
}).handler(createSsrRpc("2f84c8ccf973926d40b951049a6a795b28384fecc69bbc024dbd0625b2fa66d9"));
function shopCredentials(input, named) {
	const raw = obj(input);
	const email = str(raw.email, 160).toLowerCase();
	const password = str(raw.password, 80);
	const name = str(raw.name, 120);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
	if (password.length < 8) throw new Error("Use at least 8 characters.");
	if (named && !name) throw new Error("Enter your name.");
	return {
		email,
		password,
		name
	};
}
var placeStorefrontOrder = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 120);
	const email = str(raw.email, 160).toLowerCase();
	const address = str(raw.address, 160);
	const city = str(raw.city, 80);
	const region = str(raw.region, 80);
	const postal = str(raw.postal, 20);
	if (!name) throw new Error("Enter your name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
	if (!address || !city || !postal) throw new Error("Enter a shipping address.");
	const items = (Array.isArray(raw.items) ? raw.items : []).map((item) => {
		const row = obj(item);
		return {
			sku: str(row.sku, 40),
			quantity: intish(row.quantity) ?? 0
		};
	}).filter((item) => item.sku && item.quantity > 0 && item.quantity <= 99);
	if (!items.length) throw new Error("Your cart is empty.");
	const shippingMethod = str(raw.shippingMethod, 20) === "express" ? "express" : "standard";
	return {
		name,
		email,
		phone: str(raw.phone, 40),
		company: str(raw.company, 120),
		address,
		city,
		region,
		postal,
		country: str(raw.country, 80) || "United States",
		shippingMethod,
		paymentMethod: str(raw.paymentMethod, 32),
		notes: str(raw.notes, 1e3),
		password: str(raw.password, 80),
		token: str(raw.token, 80),
		cardBrand: str(raw.cardBrand, 16) === "debit" ? "debit" : "credit",
		cardLast4: str(raw.cardLast4, 4).replace(/\D/g, "").slice(-4),
		cardExp: str(raw.cardExp, 5),
		items
	};
}).handler(createSsrRpc("e83e5ac0f5c822bd05d3ae44dca014fb2cf4db09c717579c103ca29f85bb716c"));
//#endregion
export { runDeskJobs as $, listOrders as A, testIntegration as At, markCustomerNotice as B, linkOrderTicket as C, shopRegister as Ct, listForms as D, syncZendesk as Dt, listDeskAccounts as E, syncPortalUsers as Et, listProducts as F, updateTicket as Ft, refreshAlternativeOrder as G, orderPortalOffering as H, listServiceCatalog as I, replyPortalTicket as J, refreshPortalTicket as K, listServiceDesk as L, listPolicies as M, testResend as Mt, listPortalCustomers as N, trackAwb as Nt, listMyComplaints as O, testAlternative as Ot, listPortalServices as P, updateOrder as Pt, reviewRequest as Q, listTickets as R, importProducts as S, shopLogout as St, listCustomerNotices as T, submitPortalTicket as Tt, placeStorefrontOrder as U, openPortalFromAuth as V, portalVerify as W, requestPortalService as X, replyTicket as Y, respondToQuote as Z, getShell as _, setPortalGrants as _t, getIntegration as a, saveIntegration as at, getStorefront as b, setShopRole as bt, getOrg as c, savePolicy as ct, getPortalSession as d, saveResend as dt, runPortalJobs as et, getPortalTicket as f, saveSettings as ft, getSettings as g, setDeskRole as gt, getSessionHome as h, sendTestEmail as ht, getDashboard as i, saveForm as it, listOrgs as j, testPayments as jt, listNotifications as k, testForm as kt, getPayments as l, savePortalCompany as lt, getService as m, saveStaff as mt, deleteOrder as n, saveCustomer as nt, getNotification as o, saveOrg as ot, getSarahMetrics as p, saveShopProfile as pt, removeProduct as q, filePortalTicket as r, saveCustomerSignup as rt, getOrder as s, savePayments as st, createOrder as t, saveCampaign as tt, getPeople as u, saveProduct as ut, getShopAccount as v, setServiceStatus as vt, listCampaigns as w, submitComplaint as wt, getTicket as x, shopLogin as xt, getShopCheckout as y, setShopPayLater as yt, loadPortalCustomer as z };
