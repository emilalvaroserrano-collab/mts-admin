import { r as createServerFn } from "./ssr.mjs";
import { C as resolveMail, S as reserveOrder, T as setInventory, a as createAlternativeCheckout, b as refreshAlternativePayment, c as enqueueJob, d as finishJob, g as probeAlternative, h as orderEvents, i as authMiddleware, m as loadAlternativeCreds, n as alternativeMode, p as getSql, s as dueJobs, t as ALTERNATIVE_PORTAL, u as envAlternative, v as rebalanceHold, w as sendOrderEmail, x as resendStoredEmail, y as recordEvent } from "./commerce-CJJAh49r.mjs";
import { d as storeSlug } from "./format-DhyAHcG6.mjs";
import { r as testConversations, t as conversationsConfig } from "./zendesk-conversations-DZ-6Nhsi.mjs";
import { i as upsTrackUrl, n as normalizeAwb, r as upsCheckDigitOk, t as isUpsAwb } from "./awb-C_gAkvba.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DCuXpdjo.js
function verificationDecision(input) {
	if (!input.hasAccount) return {
		ok: false,
		reason: "missing"
	};
	if (input.attempts >= 5) return {
		ok: false,
		reason: "locked"
	};
	if (!input.storedCode || input.storedCode !== input.submittedCode) return {
		ok: false,
		reason: "mismatch"
	};
	const expires = Date.parse(input.expiresAt);
	if (!Number.isFinite(expires) || expires < (input.now ?? Date.now())) return {
		ok: false,
		reason: "expired"
	};
	return {
		ok: true,
		reason: "valid"
	};
}
function commentIsPublic(flag) {
	return flag !== false && flag !== "false" && flag !== 0 && flag !== "f";
}
function unpaidCardStatus() {
	return "pending";
}
var cache = globalThis;
function upsHost() {
	return process.env.UPS_ENV === "sandbox" ? "https://wwwcie.ups.com" : "https://onlinetools.ups.com";
}
function shipmentFromUps(type, description) {
	const text = `${type} ${description}`.toLowerCase();
	if (text.includes("delivered") || type === "D") return "delivered";
	if (text.includes("out for delivery")) return "out_for_delivery";
	if (type === "I" || type === "P" || type === "M" || text.includes("transit") || text.includes("pickup")) return "shipped";
	return "";
}
async function upsToken() {
	const id = (process.env.UPS_CLIENT_ID || "").trim();
	const secret = (process.env.UPS_CLIENT_SECRET || "").trim();
	if (!id || !secret) return "";
	const cached = cache.__upsToken;
	if (cached && cached.expiresAt > Date.now() + 15e3) return cached.token;
	const response = await fetch(`${upsHost()}/security/v1/oauth/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${id}:${secret}`, "utf8").toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json"
		},
		body: "grant_type=client_credentials"
	});
	const text = await response.text();
	if (!response.ok) throw new Error(`UPS auth returned ${response.status}. ${text.slice(0, 160)}`);
	const body = JSON.parse(text);
	if (!body.access_token) throw new Error("UPS did not return an access token.");
	const ttl = Number(body.expires_in);
	cache.__upsToken = {
		token: body.access_token,
		expiresAt: Date.now() + (Number.isFinite(ttl) && ttl > 60 ? ttl * 1e3 : 3e6)
	};
	return body.access_token;
}
async function lookupAwb(raw) {
	const awb = normalizeAwb(raw);
	const ups = isUpsAwb(awb);
	const valid = ups ? upsCheckDigitOk(awb) : awb.length >= 8;
	const base = {
		awb,
		carrier: ups ? "UPS" : "",
		valid,
		configured: Boolean((process.env.UPS_CLIENT_ID || "").trim() && (process.env.UPS_CLIENT_SECRET || "").trim()),
		shipmentStatus: "",
		detail: ups ? valid ? "UPS air waybill." : "That 1Z number failed the UPS check digit. Confirm the label before shipping." : awb ? "Saved as a tracking number. It is not a UPS 1Z air waybill." : "Scan or type an air waybill.",
		url: ups ? upsTrackUrl(awb) : ""
	};
	if (!ups || !valid || !base.configured) return base;
	const token = await upsToken();
	const response = await fetch(`${upsHost()}/api/track/v1/details/${encodeURIComponent(awb)}`, { headers: {
		Authorization: `Bearer ${token}`,
		transId: `mts-${Date.now()}`,
		transactionSrc: "manage-tech-service",
		Accept: "application/json"
	} });
	const text = await response.text();
	if (!response.ok) return {
		...base,
		detail: `UPS tracking returned ${response.status}. The number is still saved.`
	};
	const parcel = JSON.parse(text).trackResponse?.shipment?.[0]?.package?.[0];
	const activity = parcel?.activity?.[0]?.status;
	const description = parcel?.currentStatus?.description || activity?.description || "UPS accepted the air waybill.";
	const type = activity?.type || "";
	return {
		...base,
		detail: description,
		shipmentStatus: shipmentFromUps(type, description)
	};
}
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
function mapActor(row) {
	const organizationName = s(row, "organization_name");
	return {
		userId: s(row, "user_id"),
		name: s(row, "name"),
		email: s(row, "email"),
		role: asRole(s(row, "role")),
		organizationId: nid(row, "organization_id"),
		organizationName: organizationName || null,
		active: b(row, "active")
	};
}
function mapTicket(row) {
	return {
		id: n(row, "id"),
		zendeskId: s(row, "zendesk_id"),
		subject: s(row, "subject"),
		status: s(row, "status"),
		priority: s(row, "priority"),
		category: s(row, "category"),
		organizationId: nid(row, "organization_id"),
		organizationName: s(row, "organization_name"),
		requesterName: s(row, "requester_name"),
		requesterEmail: s(row, "requester_email"),
		assignee: s(row, "assignee"),
		tags: tagsOf(s(row, "tags")),
		viewLabel: s(row, "view_label"),
		createdAt: s(row, "created_at"),
		updatedAt: s(row, "updated_at")
	};
}
function mapOrg(row) {
	return {
		id: n(row, "id"),
		name: s(row, "name"),
		domain: s(row, "domain"),
		industry: s(row, "industry"),
		phone: s(row, "phone"),
		address: s(row, "address"),
		zendeskOrgId: s(row, "zendesk_org_id"),
		notes: s(row, "notes"),
		portalAccess: b(row, "portal_access"),
		orderingEnabled: b(row, "ordering_enabled"),
		userRequestsEnabled: b(row, "user_requests_enabled"),
		approvalRequired: b(row, "approval_required"),
		createdAt: s(row, "created_at"),
		userCount: n(row, "user_count"),
		openTickets: n(row, "open_tickets"),
		orderCount: n(row, "order_count")
	};
}
function mapCustomer(row) {
	return {
		id: n(row, "id"),
		organizationId: nid(row, "organization_id"),
		organizationName: s(row, "organization_name"),
		name: s(row, "name"),
		email: s(row, "email"),
		title: s(row, "title"),
		permissionLevel: s(row, "permission_level") || "regular",
		canOrder: b(row, "can_order"),
		canRequestUsers: b(row, "can_request_users"),
		canApproveOrders: b(row, "can_approve_orders"),
		active: b(row, "active"),
		zendeskUserId: s(row, "zendesk_user_id"),
		createdAt: s(row, "created_at"),
		source: s(row, "source") === "shop" ? "shop" : s(row, "source") === "portal" ? "portal" : "company",
		staffUserId: s(row, "staff_user_id"),
		phone: s(row, "phone"),
		orderCount: n(row, "order_count"),
		lastOrderId: nid(row, "last_order_id"),
		lastOrderStatus: s(row, "last_order_status"),
		ticketId: nid(row, "ticket_id"),
		zendeskTicketId: s(row, "zendesk_ticket_id"),
		payLater: b(row, "pay_later")
	};
}
function mapOrder(row, items = []) {
	const id = n(row, "id");
	return {
		id,
		number: `MT-${1e3 + id}`,
		organizationId: n(row, "organization_id"),
		organizationName: s(row, "organization_name"),
		customerUserId: nid(row, "customer_user_id"),
		customerName: s(row, "customer_name"),
		customerEmail: s(row, "customer_email"),
		status: s(row, "status"),
		ticketId: nid(row, "ticket_id"),
		zendeskTicketId: s(row, "zendesk_ticket_id"),
		ticketSubject: s(row, "ticket_subject"),
		notes: s(row, "notes"),
		approvalNote: s(row, "approval_note"),
		processingNote: s(row, "processing_note"),
		createdAt: s(row, "created_at"),
		updatedAt: s(row, "updated_at"),
		totalCents: n(row, "total_cents"),
		paymentMethod: s(row, "payment_method"),
		paymentUrl: s(row, "payment_url"),
		paymentStatus: s(row, "payment_status"),
		shipName: s(row, "ship_name"),
		shipEmail: s(row, "ship_email"),
		shipPhone: s(row, "ship_phone"),
		shipAddress: s(row, "ship_address"),
		shipCity: s(row, "ship_city"),
		shipRegion: s(row, "ship_region"),
		shipPostal: s(row, "ship_postal"),
		shipCountry: s(row, "ship_country"),
		shippingMethod: s(row, "shipping_method"),
		shippingCents: n(row, "shipping_cents"),
		shipmentStatus: s(row, "shipment_status") || "unfulfilled",
		trackingNumber: s(row, "tracking_number"),
		trackingCarrier: s(row, "tracking_carrier"),
		itemCount: n(row, "item_count") || items.reduce((sum, item) => sum + item.quantity, 0),
		items,
		events: []
	};
}
function mapItem(row) {
	return {
		id: n(row, "id"),
		productId: nid(row, "product_id"),
		productName: s(row, "product_name"),
		sku: s(row, "sku"),
		quantity: n(row, "quantity"),
		unitPriceCents: n(row, "unit_price_cents")
	};
}
function mapProduct(row) {
	return {
		id: n(row, "id"),
		sku: s(row, "sku"),
		name: s(row, "name"),
		category: s(row, "category"),
		description: s(row, "description"),
		specs: s(row, "specs"),
		priceCents: n(row, "price_cents"),
		imageUrl: s(row, "image_url"),
		images: [],
		stock: n(row, "stock"),
		available: b(row, "available"),
		visibility: s(row, "visibility") || "all"
	};
}
async function attachImages(sql, products) {
	if (!products.length) return products;
	const rows = await sql`select product_id, url from product_images order by product_id, sort_order, id`;
	const grouped = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const id = n(row, "product_id");
		const list = grouped.get(id) ?? [];
		const url = s(row, "url");
		if (url) list.push(url);
		grouped.set(id, list);
	}
	return products.map((product) => {
		const stored = grouped.get(product.id) ?? [];
		const images = stored.length ? stored : product.imageUrl ? [product.imageUrl] : [];
		const imageUrl = product.imageUrl && images.includes(product.imageUrl) ? product.imageUrl : images[0] ?? "";
		return {
			...product,
			imageUrl,
			images
		};
	});
}
async function replaceImages(sql, productId, images) {
	await sql`delete from product_images where product_id = ${productId}`;
	for (let index = 0; index < images.length; index += 1) await sql`insert into product_images (product_id, url, sort_order) values (${productId}, ${images[index]}, ${index})`;
}
function mapForm(row) {
	return {
		id: n(row, "id"),
		name: s(row, "name"),
		category: s(row, "category"),
		subcategory: s(row, "subcategory"),
		zendeskField: s(row, "zendesk_field"),
		requiredFields: tagsOf(s(row, "required_fields")),
		restricted: b(row, "restricted"),
		active: b(row, "active")
	};
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
function mapAudit(row) {
	return {
		id: n(row, "id"),
		actorName: s(row, "actor_name"),
		action: s(row, "action"),
		target: s(row, "target"),
		detail: s(row, "detail"),
		createdAt: s(row, "created_at")
	};
}
function mapStaff(row) {
	return {
		userId: s(row, "user_id"),
		name: s(row, "name"),
		email: s(row, "email"),
		role: asRole(s(row, "role")),
		organizationId: nid(row, "organization_id"),
		organizationName: s(row, "organization_name"),
		active: b(row, "active")
	};
}
function mapRequest(row) {
	return {
		id: n(row, "id"),
		organizationId: nid(row, "organization_id"),
		organizationName: s(row, "organization_name"),
		requestedName: s(row, "requested_name"),
		requestedEmail: s(row, "requested_email"),
		requestedBy: s(row, "requested_by"),
		status: s(row, "status"),
		createdAt: s(row, "created_at")
	};
}
var ORDER_SELECT = `
  select o.*,
    org.name as organization_name,
    coalesce(cu.name, '') as customer_name,
    coalesce(cu.email, '') as customer_email,
    coalesce(t.subject, '') as ticket_subject,
    coalesce((
      select sum(oi.quantity * oi.unit_price_cents)::int
      from order_items oi where oi.order_id = o.id
    ), 0) as total_cents,
    coalesce((
      select sum(oi.quantity)::int
      from order_items oi where oi.order_id = o.id
    ), 0) as item_count
  from orders o
  join organizations org on org.id = o.organization_id
  left join customer_users cu on cu.id = o.customer_user_id
  left join tickets t on t.id = o.ticket_id
`;
async function loadActor(sql, userId) {
	const user = (await sql`select id, name, email from "user" where id = ${userId}`)[0];
	const name = user ? s(user, "name") || "Staff" : "Staff";
	const email = user ? s(user, "email") : "";
	const row = (await sql`
    select staff.*, org.name as organization_name
    from portal_staff staff
    left join organizations org on org.id = staff.organization_id
    where staff.user_id = ${userId}
  `)[0];
	if (!row) throw new Error("This account is a customer. An admin has to grant desk access.");
	await sql`
    update portal_staff set
      name = ${name},
      email = case when ${email} <> '' then ${email} else email end
    where user_id = ${userId}
  `;
	const actor = mapActor({
		...row,
		name,
		email: email || s(row, "email")
	});
	if (!actor.active) throw new Error("This account is deactivated.");
	if (email && !s(row, "zendesk_user_id")) try {
		const zendeskUserId = await upsertZendeskUser(sql, {
			name,
			email,
			kind: "staff"
		});
		if (zendeskUserId) await sql`update portal_staff set zendesk_user_id = ${zendeskUserId} where user_id = ${userId}`;
	} catch {}
	return actor;
}
function assertWrite(actor) {
	if (actor.role === "viewer") throw new Error("You have view-only access.");
}
function assertAdmin(actor) {
	assertWrite(actor);
	if (actor.role !== "owner" && actor.role !== "admin") throw new Error("An admin has to make that change.");
}
function assertOrg(actor, organizationId) {
	if (actor.organizationId != null && organizationId !== actor.organizationId) throw new Error("That company is outside your access.");
}
async function audit(sql, actor, action, target, detail) {
	await sql`
    insert into audit_logs (actor_user_id, actor_name, action, target, detail)
    values (${actor.userId}, ${actor.name}, ${action}, ${target}, ${detail})
  `;
	try {
		await publishNotice(sql, actor, action, target, detail);
	} catch {}
}
function audiencesFor(role) {
	if (role === "owner") return [
		"staff",
		"agent",
		"admin",
		"owner"
	];
	if (role === "admin") return [
		"staff",
		"agent",
		"admin"
	];
	if (role === "agent") return ["staff", "agent"];
	return ["staff"];
}
async function publishNotice(sql, actor, action, target, detail) {
	const text = action.toLowerCase();
	let kind = "desk";
	let audience = "admin";
	let href = "/";
	let title = target ? `${action} · ${target}` : action;
	let organizationId = null;
	const body = detail || `${actor.name || "Someone"} ${action.toLowerCase()}.`;
	if (/ticket|replied|comment/.test(text)) {
		kind = "ticket";
		audience = "staff";
		const row = (await sql`select id, subject, organization_id from tickets where zendesk_id = ${target} or id::text = ${target} limit 1`)[0];
		if (row) {
			href = `/tickets/${n(row, "id")}`;
			organizationId = nid(row, "organization_id");
			title = `${action} · ${s(row, "subject") || target}`;
		} else href = "/tickets";
	} else if (/order/.test(text)) {
		kind = "order";
		audience = /delet/.test(text) ? "owner" : /payment|invoice/.test(text) ? "admin" : "agent";
		const row = (await sql`select id, organization_id from orders where ('MT-' || (1000 + id)::text) = ${target} or id::text = ${target} limit 1`)[0];
		if (row) {
			href = `/orders/${n(row, "id")}`;
			organizationId = nid(row, "organization_id");
		} else href = "/orders";
	} else if (/person|user|invit/.test(text)) {
		kind = "person";
		audience = "admin";
		href = "/users";
	} else if (/company|org/.test(text)) {
		kind = "company";
		audience = "admin";
		const rows = await sql`select id from organizations where name = ${target} limit 1`;
		href = rows[0] ? `/organizations/${n(rows[0], "id")}` : "/organizations";
		organizationId = rows[0] ? n(rows[0], "id") : null;
	} else if (/product|catalog/.test(text)) {
		kind = "catalog";
		audience = "admin";
		href = "/products";
	} else if (/form/.test(text)) {
		kind = "desk";
		audience = "admin";
		href = "/forms";
	} else if (/payment|stripe|resend|setting/.test(text)) {
		kind = "payment";
		audience = "owner";
		href = /resend|setting/.test(text) ? "/settings" : "/payments";
	} else if (/zendesk|sync|job/.test(text)) {
		kind = "desk";
		audience = "admin";
		href = "/integrations";
	}
	await sql`
    insert into notifications (kind, title, body, href, audience, actor_name, organization_id)
    values (${kind}, ${title}, ${body}, ${href}, ${audience}, ${actor.name}, ${organizationId})
  `;
}
async function refreshRoleAlerts(sql) {
	await sql`
    insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
    select 'ticket', 'New ticket · ' || subject,
      coalesce(nullif(requester_name, ''), 'A customer') || ' opened a ticket that still needs a first reply.',
      '/tickets/' || id::text, 'staff', coalesce(requester_name, ''), organization_id, 'live:ticket:' || id::text, updated_at
    from tickets where status = 'new'
    on conflict (dedupe_key) where dedupe_key is not null do nothing
  `;
	await sql`
    insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
    select 'order', 'Order waiting · MT-' || (1000 + id)::text,
      'Payment is still open on this order.',
      '/orders/' || id::text, 'agent', '', organization_id, 'live:order:' || id::text, updated_at
    from orders
    where status <> 'cancelled' and coalesce(payment_status, '') in ('', 'unpaid', 'pending')
    on conflict (dedupe_key) where dedupe_key is not null do nothing
  `;
	await sql`
    insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
    select 'person', 'Account request · ' || requested_name,
      requested_email || ' was asked for by ' || coalesce(nullif(requested_by, ''), 'the desk') || '.',
      '/users', 'admin', coalesce(requested_by, ''), organization_id, 'live:request:' || id::text, created_at
    from user_requests where status = 'pending'
    on conflict (dedupe_key) where dedupe_key is not null do nothing
  `;
}
function mapNotice(row) {
	return {
		id: n(row, "id"),
		kind: s(row, "kind"),
		title: s(row, "title"),
		body: s(row, "body"),
		href: s(row, "href"),
		audience: s(row, "audience"),
		actorName: s(row, "actor_name"),
		read: b(row, "read"),
		createdAt: s(row, "created_at")
	};
}
async function noticeRows(sql, actor) {
	await refreshRoleAlerts(sql);
	const allowed = audiencesFor(actor.role);
	const marks = allowed.map((_, index) => `$${index + 2}`).join(", ");
	const orgSlot = `$${allowed.length + 2}`;
	return sql.query(`select n.*, exists(
        select 1 from notification_reads r where r.notification_id = n.id and r.user_id = $1
      ) as read
     from notifications n
     where n.audience in (${marks})
       and (${orgSlot}::int is null or n.organization_id is null or n.organization_id = ${orgSlot})
     order by n.created_at desc
     limit 80`, [
		actor.userId,
		...allowed,
		actor.organizationId
	]);
}
async function orgNames(sql, actor) {
	return (actor.organizationId == null ? await sql`select id, name from organizations order by name` : await sql`select id, name from organizations where id = ${actor.organizationId} order by name`).map((row) => ({
		id: n(row, "id"),
		name: s(row, "name")
	}));
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
async function rememberZendesk(sql, status, error, synced) {
	if (synced) {
		await sql`
      update integration_settings
      set last_status = ${status}, last_error = ${error}, last_sync_at = now()
      where id = 1
    `;
		return;
	}
	await sql`
    update integration_settings
    set last_status = ${status}, last_error = ${error}
    where id = 1
  `;
}
function supportConnected(settings) {
	return oauthReady(settings) || Boolean(settings.subdomain && settings.email && settings.apiToken);
}
async function upsertZendeskUser(sql, input) {
	const email = input.email.trim().toLowerCase();
	if (!email) return "";
	const settings = await readZendesk(sql);
	if (!supportConnected(settings)) return "";
	const tag = input.kind === "staff" ? "portal_staff" : input.kind === "shop" ? "shop_customer" : "portal_customer";
	const remote = obj((await zendesk(settings, "/users/create_or_update.json", {
		method: "POST",
		body: JSON.stringify({ user: {
			name: input.name || email,
			email,
			role: "end-user",
			skip_verify_email: true,
			tags: [tag, "portal"]
		} })
	})).user);
	return remote.id != null ? String(remote.id) : "";
}
async function openWelcomeTicket(sql, input) {
	const subject = `New user: ${input.name || input.email}`;
	const body = [
		`Name: ${input.name}`,
		`Email: ${input.email}`,
		`Source: ${input.source}`,
		input.detail
	].filter(Boolean).join("\n");
	const ticketId = n((await sql`
    insert into tickets (
      subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
    ) values (
      ${subject}, 'new', 'normal', 'Account', ${input.organizationId},
      ${input.name}, ${input.email}, 'new_user,portal', ''
    )
    returning id
  `)[0], "id");
	await sql`
    insert into ticket_comments (ticket_id, author_name, body, public_note)
    values (${ticketId}, ${input.actorName || "Portal"}, ${body}, true)
  `;
	let zendeskId = "";
	let warning = "";
	const settings = await readZendesk(sql);
	if (!supportConnected(settings)) {
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
		return {
			ticketId,
			zendeskId,
			warning: "The portal ticket is open. Connect Zendesk to copy it to the desk."
		};
	}
	try {
		let zendeskOrg = "";
		if (input.organizationId) {
			const orgRows = await sql`select zendesk_org_id from organizations where id = ${input.organizationId}`;
			zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
		}
		const ticketPayload = {
			subject,
			comment: { body },
			tags: ["new_user", "portal"],
			status: "new",
			requester: {
				name: input.name || input.email,
				email: input.email
			}
		};
		if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) ticketPayload.organization_id = Number(zendeskOrg);
		const remote = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: ticketPayload })
		})).ticket);
		zendeskId = remote.id != null ? String(remote.id) : "";
		if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
	} catch (error) {
		warning = error instanceof Error ? error.message : "Zendesk did not accept the new-user ticket.";
		await rememberZendesk(sql, "error", warning, false);
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
	}
	return {
		ticketId,
		zendeskId,
		warning
	};
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
var getSessionHome_createServerFn_handler = createServerRpc({
	id: "a918b2797a5be32ed7a20dff55e9c38d29629dc0ef44513ed038a4247e339169",
	name: "getSessionHome",
	filename: "src/lib/portal/api.ts"
}, (opts) => getSessionHome.__executeServer(opts));
var getSessionHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSessionHome_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const row = (await sql`select role, active from portal_staff where user_id = ${context.userId} limit 1`)[0];
	if (!row) {
		const any = await sql`select count(*)::int as n from portal_staff`;
		const empty = (any[0] ? n(any[0], "n") : 0) === 0;
		const user = (await sql`select name, email from "user" where id = ${context.userId} limit 1`)[0];
		const allow = (process.env.BOOTSTRAP_OWNER_EMAIL || "").trim().toLowerCase();
		const email = user ? s(user, "email").toLowerCase() : "";
		if (empty && allow && email === allow) {
			await sql`
          insert into portal_staff (user_id, name, email, role)
          values (${context.userId}, ${user ? s(user, "name") : "Owner"}, ${email}, 'owner')
          on conflict (user_id) do nothing
        `;
			return { destination: "admin" };
		}
	}
	return { destination: Boolean(row && b(row, "active")) ? "admin" : "portal" };
});
var openPortalFromAuth_createServerFn_handler = createServerRpc({
	id: "36088162f1764903b1db469770d95d49a581e235cece6369ffcd06a7c02b1c07",
	name: "openPortalFromAuth",
	filename: "src/lib/portal/api.ts"
}, (opts) => openPortalFromAuth.__executeServer(opts));
var openPortalFromAuth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(openPortalFromAuth_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const user = (await sql`select name, email from "user" where id = ${context.userId} limit 1`)[0];
	if (!user || !s(user, "email")) throw new Error("Sign in again.");
	const email = s(user, "email").toLowerCase();
	const name = s(user, "name") || email;
	const verifiedRow = await sql`select "emailVerified" as verified from "user" where id = ${context.userId} limit 1`;
	const verified = Boolean(verifiedRow[0] && b(verifiedRow[0], "verified"));
	if (!(await sql`select id from shop_customers where email = ${email}`)[0]) {
		const organizationId = n((await sql`
        insert into organizations (name, phone, portal_access, ordering_enabled, notes)
        values (${name}, '', true, true, 'Customer account. The shop is on. Services and invoices stay off until an admin approves them.')
        returning id
      `)[0], "id");
		await sql`
        insert into shop_customers (
          email, name, password_hash, organization_id, business_name, role_id, email_verified,
          grant_shop, grant_services, grant_invoice, pay_later
        ) values (
          ${email}, ${name}, ${await hashShopPassword(crypto.randomUUID())}, ${organizationId}, '', 'buyer', ${verified},
          true, false, false, false
        )
      `;
	}
	const token = await newShopToken();
	await sql`
      update shop_customers set
        session_token = ${token},
        session_expires = now() + interval '12 hours',
        name = ${name},
        email_verified = case when ${verified} then true else email_verified end
      where email = ${email}
    `;
	return {
		token,
		email,
		name
	};
});
var savePortalCompany_createServerFn_handler = createServerRpc({
	id: "f03851143e75eacf9555a0652ab6610686ed21e8cb847b86a1759fc3ebbb28c7",
	name: "savePortalCompany",
	filename: "src/lib/portal/api.ts"
}, (opts) => savePortalCompany.__executeServer(opts));
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
}).handler(savePortalCompany_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	let organizationId = nid(row, "organization_id");
	if (organizationId) await sql`update organizations set name = ${data.business}, phone = ${data.phone} where id = ${organizationId}`;
	else organizationId = n((await sql`
        insert into organizations (name, phone, portal_access, ordering_enabled, notes)
        values (${data.business}, ${data.phone}, true, true, 'Updated from the customer portal.')
        returning id
      `)[0], "id");
	await sql`
      update shop_customers set business_name = ${data.business}, phone = ${data.phone}, city = ${data.city}, organization_id = ${organizationId}
      where id = ${n(row, "id")}
    `;
	await filePortalTicket(sql, {
		name: s(row, "name"),
		email: s(row, "email"),
		organizationId,
		subject: `Company update: ${data.business}`,
		category: "Account",
		body: `${s(row, "name")} updated their portal.\nCompany: ${data.business}\nPhone: ${data.phone}\nCity: ${data.city}`
	}).catch(() => void 0);
	return { ok: true };
});
function viewFromTags(tags) {
	if (tags.includes("need_invoice")) return "Need Invoice";
	if (tags.includes("pending_order")) return "Pending Orders";
	if (tags.includes("pending_project")) return "Pending Projects";
	return "";
}
function zdStatus(value) {
	if (value === "hold") return "pending";
	if (value === "new" || value === "open" || value === "pending" || value === "solved" || value === "closed") return value;
	return "open";
}
function indexUsers(payload) {
	const map = /* @__PURE__ */ new Map();
	const users = Array.isArray(payload.users) ? payload.users : [];
	for (const user of users) {
		const row = obj(user);
		if (row.id == null) continue;
		map.set(String(row.id), {
			name: typeof row.name === "string" ? row.name : "",
			email: typeof row.email === "string" ? row.email : ""
		});
	}
	return map;
}
async function linkOrganizations(sql, organizations) {
	for (const item of organizations) {
		const org = obj(item);
		if (org.id == null || typeof org.name !== "string" || !org.name.trim()) continue;
		const zendeskOrgId = String(org.id);
		const name = org.name.trim().slice(0, 160);
		const domain = Array.isArray(org.domain_names) && typeof org.domain_names[0] === "string" ? org.domain_names[0].slice(0, 160) : "";
		if ((await sql`select id from organizations where zendesk_org_id = ${zendeskOrgId} limit 1`)[0]) continue;
		const byName = await sql`select id, zendesk_org_id from organizations where lower(name) = lower(${name}) limit 1`;
		if (byName[0]) {
			if (!s(byName[0], "zendesk_org_id")) await sql`update organizations set zendesk_org_id = ${zendeskOrgId} where id = ${n(byName[0], "id")}`;
			continue;
		}
		await sql`
      insert into organizations (name, domain, zendesk_org_id, notes)
      values (${name}, ${domain}, ${zendeskOrgId}, 'Imported from Zendesk.')
    `;
	}
}
async function linkRequesters(sql, users) {
	for (const [id, user] of users) {
		if (!user.email) continue;
		await sql`
      update customer_users
      set zendesk_user_id = ${id}
      where lower(email) = lower(${user.email}) and zendesk_user_id = ''
    `;
	}
}
async function saveRemoteComment(sql, ticketId, commentId, author, body, isPublic, createdAt) {
	const row = (await sql`
    select id, coalesce(zendesk_comment_id, '') as zendesk_comment_id
    from ticket_comments
    where zendesk_comment_id = ${commentId}
       or (ticket_id = ${ticketId} and zendesk_comment_id is null and body = ${body})
    limit 1
  `)[0];
	if (row) {
		if (!s(row, "zendesk_comment_id")) await sql`update ticket_comments set zendesk_comment_id = ${commentId} where id = ${n(row, "id")}`;
		return;
	}
	if (createdAt) {
		await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note, created_at, zendesk_comment_id)
      values (${ticketId}, ${author || "Requester"}, ${body}, ${isPublic}, ${createdAt}, ${commentId})
    `;
		return;
	}
	await sql`
    insert into ticket_comments (ticket_id, author_name, body, public_note, zendesk_comment_id)
    values (${ticketId}, ${author || "Requester"}, ${body}, ${isPublic}, ${commentId})
  `;
}
async function pullComments(sql, settings, ticketId, zendeskId, knownUsers) {
	const payload = await zendesk(settings, `/tickets/${encodeURIComponent(zendeskId)}/comments.json?include=users&sort_order=asc`);
	const users = indexUsers(payload);
	if (knownUsers) for (const [id, user] of knownUsers) users.set(id, user);
	const comments = Array.isArray(payload.comments) ? payload.comments : [];
	for (const item of comments) {
		const comment = obj(item);
		if (comment.id == null || typeof comment.body !== "string" || !comment.body.trim()) continue;
		const author = comment.author_id != null ? users.get(String(comment.author_id)) : void 0;
		await saveRemoteComment(sql, ticketId, String(comment.id), author?.name || "Requester", comment.body.slice(0, 8e3), comment.public !== false, typeof comment.created_at === "string" ? comment.created_at : "");
	}
}
async function refreshRemoteTicket(sql, ticket) {
	const settings = await readZendesk(sql);
	if (!supportConnected(settings) || !ticket.zendeskId) return;
	const payload = await zendesk(settings, `/tickets/${encodeURIComponent(ticket.zendeskId)}.json?include=users`);
	const remote = obj(payload.ticket);
	if (typeof remote.subject !== "string") return;
	const users = indexUsers(payload);
	const requester = remote.requester_id != null ? users.get(String(remote.requester_id)) : void 0;
	const assignee = remote.assignee_id != null ? users.get(String(remote.assignee_id)) : void 0;
	const tags = Array.isArray(remote.tags) ? remote.tags.map((tag) => String(tag)) : ticket.tags;
	const orgRows = await sql`select id, zendesk_org_id from organizations where zendesk_org_id <> ''`;
	const orgMap = new Map(orgRows.map((row) => [s(row, "zendesk_org_id"), n(row, "id")]));
	const organizationId = remote.organization_id != null ? orgMap.get(String(remote.organization_id)) ?? ticket.organizationId : ticket.organizationId;
	const status = zdStatus(typeof remote.status === "string" ? remote.status : ticket.status);
	const priority = typeof remote.priority === "string" && remote.priority ? remote.priority : ticket.priority || "normal";
	await sql`
    update tickets set
      subject = ${remote.subject},
      status = ${status},
      priority = ${priority},
      organization_id = ${organizationId},
      requester_name = ${requester?.name || ticket.requesterName},
      requester_email = ${requester?.email || ticket.requesterEmail},
      assignee = ${assignee?.name || ticket.assignee},
      tags = ${tags.join(",")},
      view_label = ${viewFromTags(tags) || ticket.viewLabel},
      updated_at = now()
    where id = ${ticket.id}
  `;
	await pullComments(sql, settings, ticket.id, ticket.zendeskId, users);
}
var zendeskSync = null;
var zendeskSyncAt = 0;
async function importFromZendesk(sql, actor, settings) {
	let payload;
	try {
		payload = await zendesk(settings, "/tickets.json?include=users,organizations&per_page=100&sort_by=updated_at&sort_order=desc");
	} catch {
		payload = await zendesk(settings, "/tickets.json?per_page=100&sort_by=updated_at&sort_order=desc");
	}
	const tickets = [];
	const users = indexUsers(payload);
	const organizations = Array.isArray(payload.organizations) ? [...payload.organizations] : [];
	if (Array.isArray(payload.tickets)) tickets.push(...payload.tickets);
	let next = typeof payload.next_page === "string" ? payload.next_page : "";
	for (let page = 1; next && page < 5; page += 1) {
		const more = await zendesk(settings, next);
		if (Array.isArray(more.tickets)) tickets.push(...more.tickets);
		for (const [id, user] of indexUsers(more)) users.set(id, user);
		if (Array.isArray(more.organizations)) organizations.push(...more.organizations);
		const upcoming = typeof more.next_page === "string" ? more.next_page : "";
		next = upcoming && upcoming !== next ? upcoming : "";
	}
	await linkOrganizations(sql, organizations);
	await linkRequesters(sql, users);
	const orgRows = await sql`select id, zendesk_org_id from organizations where zendesk_org_id <> ''`;
	const orgMap = new Map(orgRows.map((row) => [s(row, "zendesk_org_id"), n(row, "id")]));
	let imported = 0;
	const fresh = [];
	for (const item of tickets) {
		const ticket = obj(item);
		if (ticket.id == null || typeof ticket.subject !== "string") continue;
		const zendeskId = String(ticket.id);
		const tags = Array.isArray(ticket.tags) ? ticket.tags.map((tag) => String(tag)) : [];
		const requester = ticket.requester_id != null ? users.get(String(ticket.requester_id)) : void 0;
		const assignee = ticket.assignee_id != null ? users.get(String(ticket.assignee_id)) : void 0;
		const organizationId = ticket.organization_id != null ? orgMap.get(String(ticket.organization_id)) ?? null : null;
		const status = zdStatus(typeof ticket.status === "string" ? ticket.status : "open");
		const priority = typeof ticket.priority === "string" && ticket.priority ? ticket.priority : "normal";
		const view = viewFromTags(tags);
		const ticketId = n((await sql`
      insert into tickets (
        zendesk_id, subject, status, priority, organization_id, requester_name, requester_email,
        assignee, tags, view_label, updated_at
      ) values (
        ${zendeskId}, ${ticket.subject}, ${status}, ${priority}, ${organizationId},
        ${requester?.name ?? ""}, ${requester?.email ?? ""}, ${assignee?.name ?? ""},
        ${tags.join(",")}, ${view}, now()
      )
      on conflict (zendesk_id) do update set
        subject = excluded.subject,
        status = excluded.status,
        priority = excluded.priority,
        organization_id = coalesce(excluded.organization_id, tickets.organization_id),
        requester_name = case when excluded.requester_name <> '' then excluded.requester_name else tickets.requester_name end,
        requester_email = case when excluded.requester_email <> '' then excluded.requester_email else tickets.requester_email end,
        assignee = case when excluded.assignee <> '' then excluded.assignee else tickets.assignee end,
        tags = excluded.tags,
        view_label = case when excluded.view_label <> '' then excluded.view_label else tickets.view_label end,
        updated_at = now()
      returning id
    `)[0], "id");
		const existing = await sql`select count(*)::int as n from ticket_comments where ticket_id = ${ticketId}`;
		if ((existing[0] ? n(existing[0], "n") : 0) === 0) fresh.push({
			id: ticketId,
			zendeskId
		});
		imported += 1;
	}
	for (const ticket of fresh.slice(0, 25)) try {
		await pullComments(sql, settings, ticket.id, ticket.zendeskId, users);
	} catch {}
	await rememberZendesk(sql, "connected", "", true);
	await audit(sql, actor, "Synced Zendesk", settings.subdomain, `${imported} tickets`);
	return imported;
}
async function ensureZendeskSync(sql, actor) {
	const settings = await readZendesk(sql);
	if (!settings.subdomain || !settings.email || !settings.apiToken) return;
	if (Date.now() - zendeskSyncAt < 12e4) return;
	zendeskSyncAt = Date.now();
	if (!zendeskSync) zendeskSync = importFromZendesk(sql, actor, settings).finally(() => {
		zendeskSync = null;
	});
	try {
		await zendeskSync;
	} catch (error) {
		await rememberZendesk(sql, "error", error instanceof Error ? error.message : "Sync failed.", false);
	}
}
async function pushTicketComment(sql, ticket, body, isPublic, status) {
	const settings = await readZendesk(sql);
	if (!supportConnected(settings) || !ticket.zendeskId) return "";
	try {
		await zendesk(settings, `/tickets/${encodeURIComponent(ticket.zendeskId)}.json`, {
			method: "PUT",
			body: JSON.stringify({ ticket: {
				status: status === "new" ? "open" : status,
				comment: {
					body,
					public: isPublic
				}
			} })
		});
		return "";
	} catch (error) {
		const message = error instanceof Error ? error.message : "Zendesk update failed.";
		await rememberZendesk(sql, "error", message, false);
		return message;
	}
}
var getShell_createServerFn_handler = createServerRpc({
	id: "3f30520125428c05602f315273312b8a15eee718a92a5af4748653977e75b589",
	name: "getShell",
	filename: "src/lib/portal/api.ts"
}, (opts) => getShell.__executeServer(opts));
var getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getShell_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const settings = await sql`select brand_name, tagline from portal_settings where id = 1`;
	const live = await readZendesk(sql);
	const integration = await sql`select last_status from integration_settings where id = 1`;
	const setting = settings[0];
	const link = integration[0];
	const counts = (await sql`
      select
        (select count(*)::int from orders where (${actor.organizationId}::int is null or organization_id = ${actor.organizationId})) as orders,
        (select count(*)::int from tickets where (${actor.organizationId}::int is null or organization_id = ${actor.organizationId})) as tickets,
        (
          (select count(*)::int from customer_users where (${actor.organizationId}::int is null or organization_id = ${actor.organizationId}))
          + (select count(*)::int from shop_customers where ${actor.organizationId}::int is null)
          + (select count(*)::int from portal_staff where email <> '' and (${actor.organizationId}::int is null or organization_id = ${actor.organizationId}))
        ) as people,
        (select count(*)::int from organizations where (${actor.organizationId}::int is null or id = ${actor.organizationId})) as companies,
        (select count(*)::int from products) as catalog
    `)[0];
	return {
		actor,
		brandName: setting ? s(setting, "brand_name") : "Manage Tech Service",
		tagline: setting ? s(setting, "tagline") : "",
		zendeskConnected: Boolean(oauthReady(live) || live.subdomain && live.email && live.apiToken || conversationsConfig().ready),
		zendeskStatus: link ? s(link, "last_status") : oauthReady(live) || live.apiToken ? "ready" : "not_connected",
		orderCount: counts ? n(counts, "orders") : 0,
		ticketCount: counts ? n(counts, "tickets") : 0,
		peopleCount: counts ? n(counts, "people") : 0,
		catalogCount: counts ? n(counts, "catalog") : 0,
		companyCount: counts ? n(counts, "companies") : 0,
		noticeCount: (await noticeRows(sql, actor)).filter((row) => !b(row, "read")).length
	};
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "b8970975a479b325d55bc98118214e07425b316ecf450eb26da0a941dcce9fa7",
	name: "listNotifications",
	filename: "src/lib/portal/api.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return (await noticeRows(sql, await loadActor(sql, context.userId))).map(mapNotice);
});
var getNotification_createServerFn_handler = createServerRpc({
	id: "fd35791ca7d409310cdb3216ede8fad5b0c317d726293081a6ce30901f5f2364",
	name: "getNotification",
	filename: "src/lib/portal/api.ts"
}, (opts) => getNotification.__executeServer(opts));
var getNotification = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getNotification_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const row = (await noticeRows(sql, actor)).find((item) => n(item, "id") === data);
	if (!row) throw new Error("That notification is not available for your role.");
	await sql`
      insert into notification_reads (notification_id, user_id)
      values (${data}, ${actor.userId})
      on conflict (notification_id, user_id) do nothing
    `;
	return {
		...mapNotice(row),
		read: true
	};
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "e4757ece97cc9d09404e3b5af23b1650f02f5f8e84a5fee0edf33befa441c5dc",
	name: "getDashboard",
	filename: "src/lib/portal/api.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	await ensureZendeskSync(sql, actor);
	const scope = actor.organizationId;
	const counts = await sql`
      select
        count(*) filter (where status = 'new') as incoming,
        count(*) filter (where status = 'open') as open_count,
        count(*) filter (where status = 'pending') as pending_count,
        count(*) filter (where status in ('solved', 'closed')) as solved_count,
        count(*) filter (where view_label = 'Need Invoice' and status in ('new', 'open', 'pending')) as invoice_count
      from tickets
      where (${scope}::int is null or organization_id = ${scope})
    `;
	const orgs = await sql`
      select count(*)::int as n from organizations
      where (${scope}::int is null or id = ${scope})
    `;
	const people = await sql`
      select count(*)::int as n from customer_users
      where (${scope}::int is null or organization_id = ${scope})
    `;
	const recentTickets = await sql`
      select t.*, coalesce(o.name, '') as organization_name
      from tickets t
      left join organizations o on o.id = t.organization_id
      where (${scope}::int is null or t.organization_id = ${scope})
      order by t.updated_at desc
      limit 6
    `;
	const pendingOrders = await sql.query(`${ORDER_SELECT}
       where o.status in ('pending', 'approved', 'processing')
         and ($1::int is null or o.organization_id = $1)
       order by o.updated_at desc
       limit 5`, [scope]);
	const recentOrders = await sql.query(`${ORDER_SELECT}
       where ($1::int is null or o.organization_id = $1)
       order by o.updated_at desc
       limit 5`, [scope]);
	const activity = scope == null ? await sql`select * from audit_logs order by created_at desc limit 8` : await sql`
          select * from audit_logs
          where actor_user_id = ${actor.userId}
             or target ilike ${"%" + (actor.organizationName ?? "") + "%"}
             or detail ilike ${"%" + (actor.organizationName ?? "") + "%"}
          order by created_at desc
          limit 8
        `;
	const count = counts[0] ?? {};
	return {
		orgCount: orgs[0] ? n(orgs[0], "n") : 0,
		userCount: people[0] ? n(people[0], "n") : 0,
		tickets: {
			incoming: n(count, "incoming"),
			open: n(count, "open_count"),
			pending: n(count, "pending_count"),
			solved: n(count, "solved_count")
		},
		invoiceCount: n(count, "invoice_count"),
		recentTickets: recentTickets.map(mapTicket),
		pendingOrders: pendingOrders.map((row) => mapOrder(row)),
		recentOrders: recentOrders.map((row) => mapOrder(row)),
		activity: activity.map(mapAudit)
	};
});
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
var listTickets_createServerFn_handler = createServerRpc({
	id: "8fc8c591f3586970bd83eebfb0f17f9a574bc871aa0a60fad52a0b01589563bf",
	name: "listTickets",
	filename: "src/lib/portal/api.ts"
}, (opts) => listTickets.__executeServer(opts));
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(ticketFilter).handler(listTickets_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	await ensureZendeskSync(sql, actor);
	if (data.orgId) assertOrg(actor, data.orgId);
	const clauses = ["true"];
	const params = [];
	const add = (clause, value) => {
		params.push(value);
		clauses.push(clause.replace("?", `$${params.length}`));
	};
	if (actor.organizationId != null) add("t.organization_id = ?", actor.organizationId);
	if (data.orgId) add("t.organization_id = ?", data.orgId);
	if (data.status === "unresolved") clauses.push("t.status in ('new','open','pending')");
	else if (data.status === "solved") clauses.push("t.status in ('solved','closed')");
	else if (data.status && data.status !== "all") add("t.status = ?", data.status);
	if (data.view) add("t.view_label = ?", data.view);
	if (data.category) add("t.category = ?", data.category);
	if (data.assignee) add("t.assignee = ?", data.assignee);
	if (data.q) {
		params.push(`%${data.q}%`);
		const like = `$${params.length}`;
		params.push(data.q.replace(/^#/, ""));
		const exact = `$${params.length}`;
		clauses.push(`(t.subject ilike ${like} or coalesce(t.zendesk_id, '') ilike ${like} or cast(t.id as text) = ${exact})`);
	}
	const tickets = await sql.query(`select t.*, coalesce(o.name, '') as organization_name
       from tickets t
       left join organizations o on o.id = t.organization_id
       where ${clauses.join(" and ")}
       order by t.updated_at desc
       limit 200`, params);
	const categories = await sql.query(`select distinct category from tickets
       where category <> '' and ($1::int is null or organization_id = $1)
       order by category`, [actor.organizationId]);
	const assignees = await sql.query(`select distinct assignee from tickets
       where assignee <> '' and ($1::int is null or organization_id = $1)
       order by assignee`, [actor.organizationId]);
	return {
		tickets: tickets.map(mapTicket),
		orgs: await orgNames(sql, actor),
		categories: categories.map((row) => s(row, "category")),
		assignees: assignees.map((row) => s(row, "assignee"))
	};
});
async function fetchTicket(sql, actor, id) {
	const row = (await sql`
    select t.*, coalesce(o.name, '') as organization_name
    from tickets t
    left join organizations o on o.id = t.organization_id
    where t.id = ${id}
  `)[0];
	if (!row) throw new Error("Ticket not found.");
	const ticket = mapTicket(row);
	assertOrg(actor, ticket.organizationId);
	const comments = await sql`
    select * from ticket_comments where ticket_id = ${id} order by created_at asc, id asc
  `;
	const assignees = await sql.query(`select distinct name from (
       select assignee as name from tickets where assignee <> '' and ($1::int is null or organization_id = $1)
       union
       select name from portal_staff where active = true
     ) people
     order by name`, [actor.organizationId]);
	return {
		ticket,
		comments: comments.map((comment) => ({
			id: n(comment, "id"),
			authorName: s(comment, "author_name"),
			body: s(comment, "body"),
			publicNote: b(comment, "public_note"),
			createdAt: s(comment, "created_at")
		})),
		assignees: assignees.map((item) => s(item, "name")).filter(Boolean)
	};
}
var getTicket_createServerFn_handler = createServerRpc({
	id: "4adceff40dbb5d9b2ea595bcf4ab2c6e92b7fe74e73108bf1f85e2a365176b14",
	name: "getTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => getTicket.__executeServer(opts));
var getTicket = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing ticket.");
	return value;
}).handler(getTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const detail = await fetchTicket(sql, actor, data);
	if (detail.ticket.zendeskId) try {
		await refreshRemoteTicket(sql, detail.ticket);
		return fetchTicket(sql, actor, data);
	} catch {
		return detail;
	}
	return detail;
});
var replyTicket_createServerFn_handler = createServerRpc({
	id: "b0e1e288e1f670a85f294c653c0de13e892bedc014c6ac62dee675c698fc6a1a",
	name: "replyTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => replyTicket.__executeServer(opts));
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
}).handler(replyTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const detail = await fetchTicket(sql, actor, data.ticketId);
	const nextStatus = detail.ticket.status === "new" ? "open" : detail.ticket.status;
	await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${data.ticketId}, ${actor.name}, ${data.body}, ${data.publicNote})
    `;
	await sql`
      update tickets set status = ${nextStatus}, updated_at = now() where id = ${data.ticketId}
    `;
	const warning = await pushTicketComment(sql, detail.ticket, data.body, data.publicNote, nextStatus);
	await audit(sql, actor, data.publicNote ? "Public reply" : "Internal note", detail.ticket.zendeskId || String(detail.ticket.id), warning ? `${data.body.slice(0, 140)} Zendesk: ${warning}` : data.body.slice(0, 180));
	return { warning };
});
var updateTicket_createServerFn_handler = createServerRpc({
	id: "5745ee98f006b7faf92a1bc4397e11590b20a2526db8579e3e2094f9a67dbbe5",
	name: "updateTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => updateTicket.__executeServer(opts));
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
}).handler(updateTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const existing = await fetchTicket(sql, actor, data.id);
	const organizationId = data.organizationId === void 0 ? existing.ticket.organizationId : data.organizationId;
	assertOrg(actor, existing.ticket.organizationId);
	assertOrg(actor, organizationId);
	const status = data.status || existing.ticket.status;
	const assignee = data.assignee;
	const priority = data.priority || existing.ticket.priority;
	await sql`
      update tickets set
        status = ${status},
        assignee = ${assignee},
        priority = ${priority},
        organization_id = ${organizationId},
        updated_at = now()
      where id = ${data.id}
    `;
	const settings = await readZendesk(sql);
	let warning = "";
	if (supportConnected(settings) && existing.ticket.zendeskId) try {
		const ticketBody = {};
		if (status !== existing.ticket.status) ticketBody.status = status === "new" ? "open" : status;
		if (priority && priority !== existing.ticket.priority) ticketBody.priority = priority;
		if (assignee !== existing.ticket.assignee) {
			if (!assignee) ticketBody.assignee_id = null;
			else {
				const found = await zendesk(settings, `/users/search.json?query=${encodeURIComponent(assignee)}`);
				const people = Array.isArray(found.users) ? found.users : [];
				const chosen = people.map((person) => obj(person)).find((person) => typeof person.name === "string" && person.name.toLowerCase() === assignee.toLowerCase()) ?? (people[0] ? obj(people[0]) : null);
				if (chosen?.id != null) ticketBody.assignee_id = chosen.id;
			}
		}
		if (Object.keys(ticketBody).length) await zendesk(settings, `/tickets/${encodeURIComponent(existing.ticket.zendeskId)}.json`, {
			method: "PUT",
			body: JSON.stringify({ ticket: ticketBody })
		});
	} catch (error) {
		warning = error instanceof Error ? error.message : "Zendesk status update failed.";
		await rememberZendesk(sql, "error", warning, false);
	}
	await audit(sql, actor, "Updated ticket", existing.ticket.zendeskId || String(data.id), `Status ${status}. Assignee ${assignee || "unassigned"}.`);
	return { warning };
});
var ORG_SELECT = `
  select o.*,
    (select count(*)::int from customer_users cu where cu.organization_id = o.id) as user_count,
    (select count(*)::int from tickets t where t.organization_id = o.id and t.status in ('new','open','pending')) as open_tickets,
    (select count(*)::int from orders ord where ord.organization_id = o.id) as order_count
  from organizations o
`;
var listOrgs_createServerFn_handler = createServerRpc({
	id: "4fbe74b4be576658496e247d516ea505284bbe0f38aff11191be8ca286b160ce",
	name: "listOrgs",
	filename: "src/lib/portal/api.ts"
}, (opts) => listOrgs.__executeServer(opts));
var listOrgs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listOrgs_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	return (await sql.query(`${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`, [actor.organizationId])).map(mapOrg);
});
var getOrg_createServerFn_handler = createServerRpc({
	id: "f0aed5deacb7fe81e5d9ad3ee604664b02c2f90fa43d049b98963e1fdf9cf62a",
	name: "getOrg",
	filename: "src/lib/portal/api.ts"
}, (opts) => getOrg.__executeServer(opts));
var getOrg = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing company.");
	return value;
}).handler(getOrg_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	assertOrg(await loadActor(sql, context.userId), data);
	const row = (await sql.query(`${ORG_SELECT} where o.id = $1`, [data]))[0];
	if (!row) throw new Error("Company not found.");
	const people = await sql`
      select cu.*, o.name as organization_name
      from customer_users cu
      left join organizations o on o.id = cu.organization_id
      where cu.organization_id = ${data}
      order by cu.name
    `;
	const tickets = await sql`
      select t.*, o.name as organization_name
      from tickets t
      left join organizations o on o.id = t.organization_id
      where t.organization_id = ${data}
      order by t.updated_at desc
      limit 12
    `;
	const orders = await sql.query(`${ORDER_SELECT} where o.organization_id = $1 order by o.updated_at desc limit 12`, [data]);
	return {
		org: mapOrg(row),
		people: people.map(mapCustomer),
		tickets: tickets.map(mapTicket),
		orders: orders.map((item) => mapOrder(item))
	};
});
var saveOrg_createServerFn_handler = createServerRpc({
	id: "418c0f1e1a743693f9818c0fa3a0a5d88c422f497823edd34de53215bedfbd35",
	name: "saveOrg",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveOrg.__executeServer(opts));
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
}).handler(saveOrg_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	if (data.id) assertOrg(actor, data.id);
	else if (actor.organizationId != null) throw new Error("You can only edit your assigned company.");
	if (data.id) {
		await sql`
        update organizations set
          name = ${data.name},
          domain = ${data.domain},
          industry = ${data.industry},
          phone = ${data.phone},
          address = ${data.address},
          zendesk_org_id = ${data.zendeskOrgId},
          notes = ${data.notes},
          portal_access = ${data.portalAccess},
          ordering_enabled = ${data.orderingEnabled},
          user_requests_enabled = ${data.userRequestsEnabled},
          approval_required = ${data.approvalRequired}
        where id = ${data.id}
      `;
		await audit(sql, actor, "Updated company", data.name, data.portalAccess ? "Portal access on." : "Portal access off.");
		return { id: data.id };
	}
	const id = n((await sql`
      insert into organizations (
        name, domain, industry, phone, address, zendesk_org_id, notes,
        portal_access, ordering_enabled, user_requests_enabled, approval_required
      ) values (
        ${data.name}, ${data.domain}, ${data.industry}, ${data.phone}, ${data.address},
        ${data.zendeskOrgId}, ${data.notes}, ${data.portalAccess}, ${data.orderingEnabled},
        ${data.userRequestsEnabled}, ${data.approvalRequired}
      )
      returning id
    `)[0], "id");
	await audit(sql, actor, "Added company", data.name, data.domain);
	return { id };
});
var getPeople_createServerFn_handler = createServerRpc({
	id: "232a25774506ba82cea2e255080fc9efafaa2fa8e9a845ab20d3a5fb6d6eb618",
	name: "getPeople",
	filename: "src/lib/portal/api.ts"
}, (opts) => getPeople.__executeServer(opts));
var getPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPeople_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const people = await sql.query(`select cu.*, coalesce(o.name, '') as organization_name, 'company' as source,
        coalesce((select count(*)::int from orders ord where ord.customer_user_id = cu.id), 0) as order_count,
        (select ord.id from orders ord where ord.customer_user_id = cu.id order by ord.id desc limit 1) as last_order_id,
        coalesce((select ord.status from orders ord where ord.customer_user_id = cu.id order by ord.id desc limit 1), '') as last_order_status,
        (select t.id from tickets t where lower(t.requester_email) = lower(cu.email) order by t.id desc limit 1) as ticket_id,
        coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(cu.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
       from customer_users cu
       left join organizations o on o.id = cu.organization_id
       where ($1::int is null or cu.organization_id = $1)
       order by cu.name`, [actor.organizationId]);
	const staff = await sql.query(`select staff.user_id as staff_user_id, staff.name, staff.email, staff.role as permission_level, staff.organization_id,
        staff.active, staff.created_at, staff.zendesk_user_id, coalesce(org.name, '') as organization_name, 'portal' as source,
        coalesce((select count(*)::int from orders ord where lower(ord.ship_email) = lower(staff.email)), 0) as order_count,
        (select ord.id from orders ord where lower(ord.ship_email) = lower(staff.email) order by ord.id desc limit 1) as last_order_id,
        coalesce((select ord.status from orders ord where lower(ord.ship_email) = lower(staff.email) order by ord.id desc limit 1), '') as last_order_status,
        (select t.id from tickets t where lower(t.requester_email) = lower(staff.email) order by t.id desc limit 1) as ticket_id,
        coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(staff.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
       from portal_staff staff
       left join organizations org on org.id = staff.organization_id
       where staff.email <> '' and ($1::int is null or staff.organization_id = $1)
       order by staff.name`, [actor.organizationId]);
	const shop = actor.organizationId ? [] : await sql`
          select sc.id, sc.name, sc.email, sc.phone, sc.city, sc.created_at, sc.zendesk_user_id, sc.pay_later,
            coalesce(sc.role_id, 'regular') as permission_level, 'shop' as source,
            coalesce((select count(*)::int from orders ord where ord.shop_customer_id = sc.id), 0) as order_count,
            (select ord.id from orders ord where ord.shop_customer_id = sc.id order by ord.id desc limit 1) as last_order_id,
            coalesce((select ord.status from orders ord where ord.shop_customer_id = sc.id order by ord.id desc limit 1), '') as last_order_status,
            (select t.id from tickets t where lower(t.requester_email) = lower(sc.email) order by t.id desc limit 1) as ticket_id,
            coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(sc.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
          from shop_customers sc
          order by sc.created_at desc
        `;
	const requests = await sql.query(`select r.*, coalesce(o.name, '') as organization_name
       from user_requests r
       left join organizations o on o.id = r.organization_id
       where ($1::int is null or r.organization_id = $1)
       order by case when r.status = 'pending' then 0 else 1 end, r.created_at desc`, [actor.organizationId]);
	const policies = await sql`select * from role_policies order by id`;
	const directory = people.map(mapCustomer);
	const buyers = shop.map((row) => ({
		...mapCustomer({
			...row,
			active: true,
			organization_name: s(row, "city")
		}),
		title: "Online shop",
		active: true,
		source: "shop"
	}));
	return {
		people: [
			...staff.map((row) => ({
				...mapCustomer(row),
				id: 0,
				title: s(row, "permission_level") === "owner" ? "Super Admin" : s(row, "permission_level") || "Staff",
				source: "portal",
				canOrder: false,
				canRequestUsers: false,
				canApproveOrders: false
			})),
			...directory,
			...buyers
		],
		requests: requests.map(mapRequest),
		orgs: await orgNames(sql, actor),
		policies: policies.map(mapPolicy)
	};
});
var saveCustomer_createServerFn_handler = createServerRpc({
	id: "4a80509859e38f16a6df04b02480fa29987bad92a917963f03201d814a6a56df",
	name: "saveCustomer",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveCustomer.__executeServer(opts));
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
}).handler(saveCustomer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	assertOrg(actor, data.organizationId);
	if ((await sql`
      select id from customer_users
      where lower(email) = lower(${data.email}) and id <> ${data.id ?? 0}
      limit 1
    `)[0]) throw new Error("That email is already in the directory.");
	if (data.id) {
		const existing = await sql`select organization_id from customer_users where id = ${data.id}`;
		if (!existing[0]) throw new Error("Person not found.");
		assertOrg(actor, nid(existing[0], "organization_id"));
		await sql`
        update customer_users set
          organization_id = ${data.organizationId},
          name = ${data.name},
          email = ${data.email},
          title = ${data.title},
          permission_level = ${data.permissionLevel},
          can_order = ${data.canOrder},
          can_request_users = ${data.canRequestUsers},
          can_approve_orders = ${data.canApproveOrders},
          active = ${data.active},
          zendesk_user_id = ${data.zendeskUserId}
        where id = ${data.id}
      `;
		await audit(sql, actor, "Updated person", data.email, data.active ? data.permissionLevel : "Deactivated");
		return {
			id: data.id,
			ticketId: 0,
			zendeskId: "",
			warning: ""
		};
	}
	const inserted = await sql`
      insert into customer_users (
        organization_id, name, email, title, permission_level,
        can_order, can_request_users, can_approve_orders, active, zendesk_user_id
      ) values (
        ${data.organizationId}, ${data.name}, ${data.email}, ${data.title}, ${data.permissionLevel},
        ${data.canOrder}, ${data.canRequestUsers}, ${data.canApproveOrders}, ${data.active}, ${data.zendeskUserId}
      )
      returning id
    `;
	await audit(sql, actor, "Invited person", data.email, data.permissionLevel);
	const ticket = await openWelcomeTicket(sql, {
		name: data.name,
		email: data.email,
		organizationId: data.organizationId,
		source: "Admin invite",
		detail: data.title,
		actorName: actor.name
	});
	const zendeskUserId = await upsertZendeskUser(sql, {
		name: data.name,
		email: data.email,
		kind: "customer"
	}).catch(() => "");
	if (zendeskUserId) await sql`update customer_users set zendesk_user_id = ${zendeskUserId} where id = ${n(inserted[0], "id")}`;
	return {
		id: n(inserted[0], "id"),
		...ticket
	};
});
var reviewRequest_createServerFn_handler = createServerRpc({
	id: "cb2ab385cfd834099b031a34d4128fc790f7111f4d4082652e985dad027dad0f",
	name: "reviewRequest",
	filename: "src/lib/portal/api.ts"
}, (opts) => reviewRequest.__executeServer(opts));
var reviewRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const decision = str(raw.decision, 16);
	if (!id || decision !== "approved" && decision !== "denied") throw new Error("Choose a decision.");
	return {
		id,
		decision
	};
}).handler(reviewRequest_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const request = (await sql`select * from user_requests where id = ${data.id}`)[0];
	if (!request) throw new Error("Request not found.");
	if (s(request, "status") !== "pending") throw new Error("That request is already reviewed.");
	const organizationId = nid(request, "organization_id");
	assertOrg(actor, organizationId);
	let ticket = null;
	if (data.decision === "approved") {
		if ((await sql`select id from customer_users where lower(email) = lower(${s(request, "requested_email")}) limit 1`)[0]) throw new Error("That email is already in the directory.");
		await sql`
        insert into customer_users (
          organization_id, name, email, title, permission_level, active
        ) values (
          ${organizationId}, ${s(request, "requested_name")}, ${s(request, "requested_email")},
          'Requested user', 'regular', true
        )
      `;
		ticket = await openWelcomeTicket(sql, {
			name: s(request, "requested_name"),
			email: s(request, "requested_email"),
			organizationId,
			source: "Approved access request",
			detail: `Requested by ${s(request, "requested_by")}`,
			actorName: actor.name
		});
		const zendeskUserId = await upsertZendeskUser(sql, {
			name: s(request, "requested_name"),
			email: s(request, "requested_email"),
			kind: "customer"
		}).catch(() => "");
		if (zendeskUserId) await sql`update customer_users set zendesk_user_id = ${zendeskUserId} where lower(email) = lower(${s(request, "requested_email")})`;
	}
	await sql`update user_requests set status = ${data.decision} where id = ${data.id}`;
	await audit(sql, actor, data.decision === "approved" ? "Approved user" : "Denied user", s(request, "requested_email"), s(request, "organization_id"));
	return {
		ok: true,
		ticketId: ticket?.ticketId ?? 0,
		zendeskId: ticket?.zendeskId ?? "",
		warning: ticket?.warning ?? ""
	};
});
var listProducts_createServerFn_handler = createServerRpc({
	id: "e11cfcd4ab1992da649de8b88723932e1f58799e9fe3b16826626dcbe17fd43c",
	name: "listProducts",
	filename: "src/lib/portal/api.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProducts_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return attachImages(sql, (await sql`select * from products order by category, name`).map(mapProduct));
});
var saveProduct_createServerFn_handler = createServerRpc({
	id: "c3af807360839902a06252eb3c0eeb62f3fe3187e2d913498d4b4f3b94eb2376",
	name: "saveProduct",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveProduct.__executeServer(opts));
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
}).handler(saveProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	if (data.id) {
		await sql`
        update products set
          sku = ${data.sku},
          name = ${data.name},
          category = ${data.category},
          description = ${data.description},
          specs = ${data.specs},
          price_cents = ${data.priceCents},
          stock = ${data.stock},
          image_url = ${data.imageUrl},
          available = ${data.available},
          visibility = ${data.visibility}
        where id = ${data.id}
      `;
		await replaceImages(sql, data.id, data.images);
		await audit(sql, actor, "Updated product", data.sku, data.available ? "Available" : "Hidden");
		return { id: data.id };
	}
	const id = n((await sql`
      insert into products (sku, name, category, description, specs, price_cents, stock, image_url, available, visibility)
      values (
        ${data.sku}, ${data.name}, ${data.category}, ${data.description}, ${data.specs},
        ${data.priceCents}, ${data.stock}, ${data.imageUrl}, ${data.available}, ${data.visibility}
      )
      returning id
    `)[0], "id");
	await replaceImages(sql, id, data.images);
	await audit(sql, actor, "Added product", data.sku, data.name);
	return { id };
});
var removeProduct_createServerFn_handler = createServerRpc({
	id: "4a674cd9b9a1c8fa62fa2f63958614f12ca20d1de8364be501d5607b0174770d",
	name: "removeProduct",
	filename: "src/lib/portal/api.ts"
}, (opts) => removeProduct.__executeServer(opts));
var removeProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing product.");
	return value;
}).handler(removeProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const used = await sql`select count(*)::int as n from order_items where product_id = ${data}`;
	if ((used[0] ? n(used[0], "n") : 0) > 0) {
		await sql`update products set available = false where id = ${data}`;
		await audit(sql, actor, "Retired product", String(data), "Kept for order history and marked unavailable.");
		return { archived: true };
	}
	await sql`delete from products where id = ${data}`;
	await audit(sql, actor, "Removed product", String(data), "");
	return { archived: false };
});
var importProducts_createServerFn_handler = createServerRpc({
	id: "45e81e25d62f6095d14f3de49f21278e58c08d05748828c68c5c3c925994a191",
	name: "importProducts",
	filename: "src/lib/portal/api.ts"
}, (opts) => importProducts.__executeServer(opts));
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
}).handler(importProducts_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	let created = 0;
	let updated = 0;
	let skipped = 0;
	for (const row of data.rows) {
		if (!row.sku || !row.name || row.priceCents < 0) {
			skipped += 1;
			continue;
		}
		const current = (await sql`select id from products where lower(sku) = lower(${row.sku}) order by id limit 1`)[0];
		if (current) {
			const id = n(current, "id");
			if (row.imageUrl) await sql`
            update products set
              sku = ${row.sku}, name = ${row.name}, category = ${row.category},
              description = ${row.description}, specs = ${row.specs}, price_cents = ${row.priceCents},
              image_url = ${row.imageUrl}, available = ${row.available}, visibility = ${row.visibility}
            where id = ${id}
          `;
			else await sql`
            update products set
              sku = ${row.sku}, name = ${row.name}, category = ${row.category},
              description = ${row.description}, specs = ${row.specs}, price_cents = ${row.priceCents},
              available = ${row.available}, visibility = ${row.visibility}
            where id = ${id}
          `;
			updated += 1;
		} else {
			await sql`
          insert into products (sku, name, category, description, specs, price_cents, image_url, available, visibility)
          values (
            ${row.sku}, ${row.name}, ${row.category}, ${row.description}, ${row.specs},
            ${row.priceCents}, ${row.imageUrl}, ${row.available}, ${row.visibility}
          )
        `;
			created += 1;
		}
	}
	if (created + updated === 0) throw new Error("No products were imported. Each row needs a SKU, a name, and a price.");
	await audit(sql, actor, "Imported catalog", `${created} new`, `${updated} updated, ${skipped} skipped`);
	return {
		created,
		updated,
		skipped
	};
});
async function orderById(sql, id, actor) {
	const row = (await sql.query(`${ORDER_SELECT} where o.id = $1`, [id]))[0];
	if (!row) throw new Error("Order not found.");
	assertOrg(actor, n(row, "organization_id"));
	return mapOrder(row, (await sql`select * from order_items where order_id = ${id} order by id`).map(mapItem));
}
var listOrders_createServerFn_handler = createServerRpc({
	id: "831f84a019fab8dbd63d43c67e9a251b3d70bfbe081fa76acaf0e33db552ab25",
	name: "listOrders",
	filename: "src/lib/portal/api.ts"
}, (opts) => listOrders.__executeServer(opts));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listOrders_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	return (await sql.query(`${ORDER_SELECT} where ($1::int is null or o.organization_id = $1) order by o.updated_at desc`, [actor.organizationId])).map((row) => mapOrder(row));
});
var getOrder_createServerFn_handler = createServerRpc({
	id: "c115b8940b8a58256bd3f466da852cb9acb7532ab6385b8a57f40498fee5711d",
	name: "getOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => getOrder.__executeServer(opts));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(getOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const order = await orderById(sql, data, actor);
	const events = await orderEvents(sql, order.id);
	const orgs = await orgNames(sql, actor);
	const people = await sql.query(`select id, name, organization_id, can_order, permission_level from customer_users
       where ($1::int is null or organization_id = $1) and active = true order by name`, [actor.organizationId]);
	const products = await sql`select id, name, sku, price_cents, available from products order by name`;
	return {
		order: {
			...order,
			events
		},
		orgs,
		people: people.map((row) => ({
			id: n(row, "id"),
			name: s(row, "name"),
			organizationId: nid(row, "organization_id"),
			canOrder: b(row, "can_order") || s(row, "permission_level") === "authorized"
		})),
		products: products.map((row) => ({
			id: n(row, "id"),
			name: s(row, "name"),
			sku: s(row, "sku"),
			priceCents: n(row, "price_cents"),
			available: b(row, "available")
		})),
		canEdit: actor.role !== "viewer",
		canDelete: actor.role === "owner"
	};
});
async function settleNewOrder(sql, orderId, actor) {
	try {
		await reserveOrder(sql, orderId);
	} catch (error) {
		await sql`delete from orders where id = ${orderId}`;
		throw error;
	}
	await recordEvent(sql, {
		orderId,
		kind: "placed",
		to: "pending",
		actor,
		detail: "Stock held"
	});
	await mailOrder(sql, orderId, "confirmation");
	await enqueueJob(sql, "order_ticket", `order-${orderId}`, { orderId });
	await runPortalJobs(sql).catch(() => void 0);
}
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
var runDeskJobs_createServerFn_handler = createServerRpc({
	id: "a82dcc574f2c811376947f9a445ecc8fe8aedde58a4c89185836103347ca2bb3",
	name: "runDeskJobs",
	filename: "src/lib/portal/api.ts"
}, (opts) => runDeskJobs.__executeServer(opts));
var runDeskJobs = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(runDeskJobs_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	await runPortalJobs(sql);
	await audit(sql, actor, "Ran desk jobs", "queue", "");
	return { ok: true };
});
var createOrder_createServerFn_handler = createServerRpc({
	id: "72d38b4e1c78504ef4b98122d058ed8f7eb0f96a26b270a4da09f895640f0b62",
	name: "createOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => createOrder.__executeServer(opts));
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
}).handler(createOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	assertOrg(actor, data.organizationId);
	const org = (await sql`select * from organizations where id = ${data.organizationId}`)[0];
	if (!org) throw new Error("Company not found.");
	if (!b(org, "ordering_enabled")) throw new Error("Catalog ordering is turned off for this company.");
	if (!b(org, "portal_access")) throw new Error("Portal access is off for this company.");
	if (data.customerUserId) {
		const person = (await sql`select * from customer_users where id = ${data.customerUserId}`)[0];
		if (!person || nid(person, "organization_id") !== data.organizationId) throw new Error("That person is not in this company.");
		if (!b(person, "can_order") && s(person, "permission_level") !== "authorized") throw new Error("This person is not allowed to order products.");
	}
	const productRows = await sql.query(`select * from products where id in (${data.items.map((_, index) => `$${index + 1}`).join(",")})`, data.items.map((item) => item.productId));
	if (productRows.length !== new Set(data.items.map((item) => item.productId)).size) throw new Error("One of those products is no longer in the catalog.");
	const unavailable = productRows.find((row) => !b(row, "available"));
	if (unavailable) throw new Error(`${s(unavailable, "name")} is not available.`);
	const status = b(org, "approval_required") ? "pending" : "approved";
	const payments = await readPayments(sql);
	const method = data.paymentMethod || payments.methods[0] || "";
	if (!payments.methods.includes(method)) throw new Error("Choose a payment method that is turned on.");
	if (method === "purchase_order" && payments.requirePo && !/\bpo\b|purchase order/i.test(data.notes)) throw new Error("Add the purchase order number in the notes.");
	const id = n((await sql`
      insert into orders (organization_id, customer_user_id, status, notes, approval_note, payment_method)
      values (
        ${data.organizationId},
        ${data.customerUserId},
        ${status},
        ${data.notes},
        ${status === "approved" ? "Approval is not required for this company." : ""},
        ${method}
      )
      returning id
    `)[0], "id");
	for (const item of data.items) {
		const product = productRows.find((row) => n(row, "id") === item.productId);
		if (!product) continue;
		await sql`
        insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents)
        values (
          ${id}, ${item.productId}, ${s(product, "name")}, ${s(product, "sku")},
          ${item.quantity}, ${n(product, "price_cents")}
        )
      `;
	}
	const settings = await sql`select notify_new_order from portal_settings where id = 1`;
	const notify = settings[0] ? b(settings[0], "notify_new_order") : false;
	await audit(sql, actor, "Created order", `MT-${1e3 + id}`, notify ? "Desk notification preference is on." : s(org, "name"));
	let paymentUrl = "";
	if (method === "alternative") {
		const creds = await loadAlternativeCreds(sql);
		const buyer = data.customerUserId ? (await sql`select email from customer_users where id = ${data.customerUserId}`)[0] : void 0;
		const lines = data.items.map((item) => {
			const product = productRows.find((row) => n(row, "id") === item.productId);
			return {
				description: product ? s(product, "name") : "Product",
				amount: product ? n(product, "price_cents") / 100 : 0,
				quantity: item.quantity
			};
		});
		const due = /* @__PURE__ */ new Date();
		due.setDate(due.getDate() + 30);
		if (creds) try {
			const checkout = await createAlternativeCheckout(creds, {
				reference: `MT-${1e3 + id}`,
				returnUrl: data.returnUrl,
				externalId: `mts-org-${data.organizationId}`,
				name: s(org, "name"),
				email: buyer ? s(buyer, "email") : "",
				existingCustomerId: s(org, "alternative_customer_id"),
				dueDate: due.toISOString().slice(0, 10),
				lines
			});
			paymentUrl = checkout.url;
			if (checkout.customerId) await sql`update organizations set alternative_customer_id = ${checkout.customerId} where id = ${data.organizationId}`;
			await sql`
            update orders set
              payment_url = ${paymentUrl},
              alternative_invoice_id = ${checkout.invoiceId},
              alternative_request_id = ${checkout.requestId},
              payment_status = ${checkout.paymentStatus}
            where id = ${id}
          `;
		} catch {
			paymentUrl = ALTERNATIVE_PORTAL;
			await sql`update orders set payment_url = ${paymentUrl}, payment_status = 'portal' where id = ${id}`;
		}
		else {
			paymentUrl = ALTERNATIVE_PORTAL;
			await sql`update orders set payment_url = ${paymentUrl}, payment_status = 'portal' where id = ${id}`;
		}
	}
	await settleNewOrder(sql, id, actor.name);
	return {
		id,
		paymentUrl
	};
});
var updateOrder_createServerFn_handler = createServerRpc({
	id: "e8753131772855b6687893f6be22770d2601ad7ac111e01c082caf03596aa957",
	name: "updateOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => updateOrder.__executeServer(opts));
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
}).handler(updateOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const order = await orderById(sql, data.id, actor);
	if (data.items) await rebalanceHold(sql, data.id, data.items.filter((item) => item.productId).map((item) => ({
		productId: item.productId,
		quantity: item.quantity
	})));
	await sql`
      update orders set
        status = ${data.status},
        approval_note = ${data.approvalNote},
        processing_note = ${data.processingNote},
        shipment_status = ${data.shipmentStatus},
        tracking_number = ${data.trackingNumber},
        tracking_carrier = ${data.trackingCarrier},
        notes = coalesce(${data.notes}, notes),
        updated_at = now()
      where id = ${data.id}
    `;
	if (data.items) {
		const existing = await sql`select * from order_items where order_id = ${data.id}`;
		const catalog = await sql`select * from products`;
		await sql`delete from order_items where order_id = ${data.id}`;
		for (const item of data.items) {
			const prior = item.productId ? existing.find((row) => nid(row, "product_id") === item.productId) : existing.find((row) => s(row, "sku") === item.sku);
			const product = item.productId ? catalog.find((row) => n(row, "id") === item.productId) : void 0;
			const source = prior ?? product;
			if (!source) throw new Error("That product is not on this order or in the catalog.");
			await sql`
          insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents)
          values (
            ${data.id},
            ${prior ? nid(prior, "product_id") : item.productId},
            ${prior ? s(prior, "product_name") : s(source, "name")},
            ${prior ? s(prior, "sku") : s(source, "sku")},
            ${item.quantity},
            ${prior ? n(prior, "unit_price_cents") : n(source, "price_cents")}
          )
        `;
		}
	}
	if (data.status === "cancelled") await setInventory(sql, data.id, "released");
	else if (order.status === "cancelled") await setInventory(sql, data.id, "held");
	if (order.status !== data.status) await recordEvent(sql, {
		orderId: data.id,
		kind: "status",
		from: order.status,
		to: data.status,
		actor: actor.name
	});
	if (order.shipmentStatus !== data.shipmentStatus) {
		await recordEvent(sql, {
			orderId: data.id,
			kind: "shipment",
			from: order.shipmentStatus,
			to: data.shipmentStatus,
			actor: actor.name,
			detail: data.trackingNumber
		});
		if (data.shipmentStatus === "shipped" || data.shipmentStatus === "delivered") await mailOrder(sql, data.id, data.shipmentStatus);
	}
	await audit(sql, actor, "Updated order", order.number, data.status);
	return { ok: true };
});
var deleteOrder_createServerFn_handler = createServerRpc({
	id: "b45630fe88b9fdd90686d2d7a534599ac59ea74aafb49cea01803f4e5f2ceec0",
	name: "deleteOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => deleteOrder.__executeServer(opts));
var deleteOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(deleteOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	if (actor.role !== "owner") throw new Error("Only a Super Admin can delete an order.");
	const order = await orderById(sql, data, actor);
	await setInventory(sql, data, "released");
	await sql`delete from orders where id = ${data}`;
	await audit(sql, actor, "Deleted order", order.number, order.organizationName);
	return { ok: true };
});
var trackAwb_createServerFn_handler = createServerRpc({
	id: "a7b2cf4fd8d09d663efd676ff546f27a64487258b43a14f92ed476ea7e8a8821",
	name: "trackAwb",
	filename: "src/lib/portal/api.ts"
}, (opts) => trackAwb.__executeServer(opts));
var trackAwb = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const awb = str(typeof input === "string" ? input : obj(input).awb, 40);
	if (awb.replace(/[^0-9A-Za-z]/g, "").length < 8) throw new Error("Scan or type the air waybill.");
	return awb;
}).handler(trackAwb_createServerFn_handler, async ({ context, data }) => {
	await loadActor(await getSql(), context.userId);
	return lookupAwb(data);
});
var linkOrderTicket_createServerFn_handler = createServerRpc({
	id: "19ad874d40be191851943cd0742210b04365886e52ed9a5b0313fd7e1556fafe",
	name: "linkOrderTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => linkOrderTicket.__executeServer(opts));
var linkOrderTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(linkOrderTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const order = await orderById(sql, data, actor);
	if (order.ticketId) return {
		ticketId: order.ticketId,
		warning: ""
	};
	const subject = `Catalog order ${order.number}`;
	const body = [
		`${order.organizationName}`,
		order.customerName ? `Requester: ${order.customerName}` : "",
		...order.items.map((item) => `${item.quantity} x ${item.productName} (${item.sku})`),
		order.notes
	].filter(Boolean).join("\n");
	const ticketId = n((await sql`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email,
        assignee, tags, view_label
      ) values (
        ${subject}, 'open', 'normal', 'Ordering', ${order.organizationId},
        ${order.customerName}, ${order.customerEmail}, ${actor.name},
        'order,pending_order', 'Pending Orders'
      )
      returning id
    `)[0], "id");
	await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, ${actor.name}, ${body}, true)
    `;
	let zendeskId = "";
	let warning = "";
	const settings = await readZendesk(sql);
	if (settings.apiToken || supportConnected(settings)) try {
		const orgRows = await sql`select zendesk_org_id from organizations where id = ${order.organizationId}`;
		const zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
		const payload = {
			subject,
			comment: { body },
			tags: [
				"order",
				"pending_order",
				"portal"
			],
			status: "open"
		};
		if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) payload.organization_id = Number(zendeskOrg);
		const ticket = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: payload })
		})).ticket);
		zendeskId = ticket.id != null ? String(ticket.id) : "";
		if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
	} catch (error) {
		warning = error instanceof Error ? error.message : "Could not create the Zendesk ticket.";
		await rememberZendesk(sql, "error", warning, false);
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
	}
	await sql`
      update orders set ticket_id = ${ticketId}, zendesk_ticket_id = ${zendeskId}, updated_at = now()
      where id = ${order.id}
    `;
	await audit(sql, actor, "Linked order ticket", order.number, zendeskId || `Portal ticket ${ticketId}`);
	return {
		ticketId,
		warning
	};
});
var listForms_createServerFn_handler = createServerRpc({
	id: "b8a8e07cb55604bc37b9e39b903a2f687bbef309a8c2d4d5427e8ef4df807382",
	name: "listForms",
	filename: "src/lib/portal/api.ts"
}, (opts) => listForms.__executeServer(opts));
var listForms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listForms_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`select * from ticket_forms order by name`).map(mapForm);
});
var saveForm_createServerFn_handler = createServerRpc({
	id: "33566ad32bac51299c67cf4c015d83da54b46db4a6ca2c11a6b6132ff080f94c",
	name: "saveForm",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveForm.__executeServer(opts));
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
}).handler(saveForm_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	if (data.id) {
		await sql`
        update ticket_forms set
          name = ${data.name},
          category = ${data.category},
          subcategory = ${data.subcategory},
          zendesk_field = ${data.zendeskField},
          required_fields = ${data.requiredFields},
          restricted = ${data.restricted},
          active = ${data.active}
        where id = ${data.id}
      `;
		await audit(sql, actor, "Updated form", data.name, data.zendeskField);
		return { id: data.id };
	}
	const inserted = await sql`
      insert into ticket_forms (name, category, subcategory, zendesk_field, required_fields, restricted, active)
      values (
        ${data.name}, ${data.category}, ${data.subcategory}, ${data.zendeskField},
        ${data.requiredFields}, ${data.restricted}, ${data.active}
      )
      returning id
    `;
	await audit(sql, actor, "Added form", data.name, data.category);
	return { id: n(inserted[0], "id") };
});
var testForm_createServerFn_handler = createServerRpc({
	id: "e4ddc06d2ec61b5cbd56f561d7961a7fde0d8f395472983bbfe965eeadc48814",
	name: "testForm",
	filename: "src/lib/portal/api.ts"
}, (opts) => testForm.__executeServer(opts));
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
}).handler(testForm_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	assertOrg(actor, data.organizationId);
	const forms = await sql`select * from ticket_forms where id = ${data.formId}`;
	const form = forms[0] ? mapForm(forms[0]) : null;
	if (!form || !form.active) throw new Error("That form is not active.");
	if (form.restricted && data.asRegular) throw new Error("This request type is limited to authorized customers.");
	const missing = form.requiredFields.filter((field) => !data.fields[field]);
	if (missing.length) throw new Error(`Required: ${missing.join(", ")}.`);
	const subject = data.fields.subject || form.name;
	const body = form.requiredFields.filter((field) => field !== "subject").map((field) => `${field}: ${data.fields[field] ?? ""}`).join("\n");
	const orgs = await sql`select name from organizations where id = ${data.organizationId}`;
	const ticketId = n((await sql`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
      ) values (
        ${subject}, 'new', 'normal', ${form.category}, ${data.organizationId},
        ${actor.name}, ${actor.email}, ${form.restricted ? "restricted,portal" : "portal"}, ''
      )
      returning id
    `)[0], "id");
	await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, ${actor.name}, ${body || subject}, true)
    `;
	let warning = "";
	const settings = await readZendesk(sql);
	if (settings.apiToken || supportConnected(settings)) try {
		const orgRows = await sql`select zendesk_org_id from organizations where id = ${data.organizationId}`;
		const zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
		const ticketPayload = {
			subject,
			comment: { body: body || subject },
			tags: ["portal", form.category.toLowerCase()].filter(Boolean),
			status: "new"
		};
		if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) ticketPayload.organization_id = Number(zendeskOrg);
		if (/^\d+$/.test(form.zendeskField)) ticketPayload.custom_fields = [{
			id: Number(form.zendeskField),
			value: data.fields.subject || form.name
		}];
		const remote = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: ticketPayload })
		})).ticket);
		const zendeskId = remote.id != null ? String(remote.id) : "";
		if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
	} catch (error) {
		warning = error instanceof Error ? error.message : "Zendesk did not accept the test ticket.";
		await rememberZendesk(sql, "error", warning, false);
	}
	const notify = await sql`select notify_new_ticket from portal_settings where id = 1`;
	await audit(sql, actor, "Tested form", form.name, `${orgs[0] ? s(orgs[0], "name") : "Company"} · ticket ${ticketId}${notify[0] && b(notify[0], "notify_new_ticket") ? " · notification preference on" : ""}`);
	return {
		ticketId,
		warning
	};
});
var listPolicies_createServerFn_handler = createServerRpc({
	id: "2811f80dd615bd5d4c4435f679121e304e6b7e4ae9b6da5b60cdf3b1a4df2ab2",
	name: "listPolicies",
	filename: "src/lib/portal/api.ts"
}, (opts) => listPolicies.__executeServer(opts));
var listPolicies = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPolicies_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`select * from role_policies order by id`).map(mapPolicy);
});
var savePolicy_createServerFn_handler = createServerRpc({
	id: "bff56ee0338820f149806a5679ea1867d0ee6ff1080722d2dcd1fb01b77afa9a",
	name: "savePolicy",
	filename: "src/lib/portal/api.ts"
}, (opts) => savePolicy.__executeServer(opts));
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
}).handler(savePolicy_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	await sql`
      update role_policies set
        can_order = ${data.canOrder},
        can_request_users = ${data.canRequestUsers},
        can_approve_orders = ${data.canApproveOrders},
        can_manage_portal = ${data.canManagePortal},
        can_ticket = ${data.canTicket},
        can_shop = ${data.canShop},
        can_purchase = ${data.canPurchase},
        can_pay_now = ${data.canPayNow},
        can_order_it = ${data.canOrderIt},
        can_order_phone = ${data.canOrderPhone},
        can_defer = ${data.canDefer}
      where id = ${data.id}
    `;
	await audit(sql, actor, "Updated role", data.id, "Permission template saved.");
	return { ok: true };
});
var getSarahMetrics_createServerFn_handler = createServerRpc({
	id: "b19d278eb40756dc5b50f427d70db4b06243d51f42ec23d38708f7c7732543c7",
	name: "getSarahMetrics",
	filename: "src/lib/portal/api.ts"
}, (opts) => getSarahMetrics.__executeServer(opts));
var getSarahMetrics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSarahMetrics_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	try {
		const rows = await sql`select status, count(*)::int as n from agent_actions group by status`;
		const open = rows.reduce((sum, row) => sum + ([
			"executing",
			"checking_status",
			"manual_review",
			"awaiting_confirmation"
		].includes(s(row, "status")) ? n(row, "n") : 0), 0);
		return {
			counts: rows.map((row) => ({
				status: s(row, "status"),
				n: n(row, "n")
			})),
			open
		};
	} catch {
		return {
			counts: [],
			open: 0
		};
	}
});
var getIntegration_createServerFn_handler = createServerRpc({
	id: "af4de7546fdba97335a36bf244736651e02e56040a542e4d8626b1a6938c0137",
	name: "getIntegration",
	filename: "src/lib/portal/api.ts"
}, (opts) => getIntegration.__executeServer(opts));
var getIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getIntegration_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const live = await readZendesk(sql);
	const conversations = conversationsConfig();
	const row = (await sql`select * from integration_settings where id = 1`)[0] ?? {};
	const orgs = await sql.query(`${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`, [actor.organizationId]);
	let lastStatus = s(row, "last_status");
	let lastError = s(row, "last_error");
	if (!(oauthReady(live) || Boolean(live.email && live.apiToken)) && conversations.ready) {
		if (!lastStatus || lastStatus === "not_connected" || lastStatus === "saved" || lastStatus === "error") lastStatus = "connected";
		if (lastError.includes("OAUTH_CLIENT") || lastError.includes("not connected")) lastError = "";
	} else if ((live.fromEnv || conversations.ready) && (!lastStatus || lastStatus === "not_connected" || lastStatus === "saved")) lastStatus = "ready";
	return {
		subdomain: live.subdomain || "shop",
		email: live.email,
		tokenSet: Boolean(live.apiToken),
		fromEnv: live.fromEnv,
		lastSyncAt: s(row, "last_sync_at") || null,
		lastStatus,
		lastError,
		conversationsReady: conversations.ready,
		conversationsAppId: conversations.appId,
		webhookReady: Boolean(conversations.webhookSecret),
		webhookId: conversations.webhookId,
		oauthReady: oauthReady(live),
		oauthClientId: live.oauthClientId,
		oauthFromEnv: Boolean(envZendesk().oauthClientId && envZendesk().oauthClientSecret),
		oauthSecretSet: Boolean(live.oauthClientSecret),
		orgs: orgs.map(mapOrg)
	};
});
var saveIntegration_createServerFn_handler = createServerRpc({
	id: "039e73ecb7b770fd06ca72d4dd05126cc1107c36ed79939ac642d1c75b0b9549",
	name: "saveIntegration",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveIntegration.__executeServer(opts));
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
}).handler(saveIntegration_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const current = await readZendesk(sql);
	const token = data.clearToken ? "" : data.apiToken || current.apiToken;
	const oauthSecret = data.clearOauth ? "" : data.oauthClientSecret || current.oauthClientSecret;
	const oauthId = data.clearOauth ? "" : data.oauthClientId || current.oauthClientId;
	await sql`
      insert into integration_settings (id, subdomain, email, api_token, oauth_client_id, oauth_client_secret, oauth_scopes, last_status, last_error)
      values (1, ${data.subdomain || "shop"}, ${data.email}, ${token}, ${oauthId}, ${oauthSecret}, ${data.oauthScopes}, 'saved', '')
      on conflict (id) do update set
        subdomain = excluded.subdomain,
        email = excluded.email,
        api_token = excluded.api_token,
        oauth_client_id = excluded.oauth_client_id,
        oauth_client_secret = excluded.oauth_client_secret,
        oauth_scopes = excluded.oauth_scopes,
        last_status = 'saved',
        last_error = ''
    `;
	oauthCache.__zendeskOauth = void 0;
	await audit(sql, actor, "Saved Zendesk", data.subdomain || "shop", data.email || oauthId);
	return { ok: true };
});
var testIntegration_createServerFn_handler = createServerRpc({
	id: "8267b9b43d81ff77f996791a832672ab18dedee21e7104a4debb5d87677dc705",
	name: "testIntegration",
	filename: "src/lib/portal/api.ts"
}, (opts) => testIntegration.__executeServer(opts));
var testIntegration = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(testIntegration_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const settings = await readZendesk(sql);
	const conversations = conversationsConfig();
	if (!oauthReady(settings) && !(settings.subdomain && settings.email && settings.apiToken)) {
		if (!conversations.ready) throw new Error("Zendesk is not connected. Add the Support API token or the Conversations API key.");
		try {
			const result = await testConversations();
			await rememberZendesk(sql, "connected", "", false);
			await audit(sql, actor, "Tested Zendesk", "conversations", result.name);
			return {
				ok: true,
				name: result.name
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Connection failed.";
			await rememberZendesk(sql, "error", message, false);
			throw new Error(message);
		}
	}
	try {
		if (oauthReady(settings)) {
			await zendesk(settings, "/users.json?per_page=1");
			await rememberZendesk(sql, "connected", "", false);
			await audit(sql, actor, "Tested Zendesk", settings.subdomain, "OAuth client credentials");
			return {
				ok: true,
				name: `${settings.subdomain} OAuth`
			};
		}
		const user = obj((await zendesk(settings, "/users/me.json")).user);
		const name = typeof user.name === "string" ? user.name : settings.email;
		await rememberZendesk(sql, "connected", "", false);
		await audit(sql, actor, "Tested Zendesk", settings.subdomain, name);
		return {
			ok: true,
			name
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Connection failed.";
		await rememberZendesk(sql, "error", message, false);
		throw new Error(message);
	}
});
var syncZendesk_createServerFn_handler = createServerRpc({
	id: "db77de5565864615cf86e0700205113a8803b82964fde96f76c4a8aa8d167062",
	name: "syncZendesk",
	filename: "src/lib/portal/api.ts"
}, (opts) => syncZendesk.__executeServer(opts));
var syncZendesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(syncZendesk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const settings = await readZendesk(sql);
	if (!(oauthReady(settings) || Boolean(settings.subdomain && settings.email && settings.apiToken))) try {
		const result = await testConversations();
		await rememberZendesk(sql, "connected", "", true);
		await audit(sql, actor, "Tested Zendesk", "conversations", result.name);
		return { imported: 0 };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Connection failed.";
		await rememberZendesk(sql, "error", message, false);
		throw new Error(message);
	}
	try {
		const imported = await importFromZendesk(sql, actor, settings);
		const users = await pushPortalUsers(sql);
		zendeskSyncAt = Date.now();
		if (users.failed && !users.synced) throw new Error(users.lastError);
		return {
			imported,
			users: users.synced
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Sync failed.";
		await rememberZendesk(sql, "error", message, false);
		throw new Error(message);
	}
});
async function pushPortalUsers(sql) {
	const staff = await sql`select user_id, name, email from portal_staff where email <> ''`;
	const customers = await sql`select id, name, email from customer_users where email <> ''`;
	const shoppers = await sql`select id, name, email from shop_customers where email <> ''`;
	let synced = 0;
	let failed = 0;
	let lastError = "";
	for (const row of staff) try {
		const id = await upsertZendeskUser(sql, {
			name: s(row, "name"),
			email: s(row, "email"),
			kind: "staff"
		});
		if (id) await sql`update portal_staff set zendesk_user_id = ${id} where user_id = ${s(row, "user_id")}`;
		synced += 1;
	} catch (error) {
		failed += 1;
		lastError = error instanceof Error ? error.message : "Could not sync a user.";
	}
	for (const row of customers) try {
		const id = await upsertZendeskUser(sql, {
			name: s(row, "name"),
			email: s(row, "email"),
			kind: "customer"
		});
		if (id) await sql`update customer_users set zendesk_user_id = ${id} where id = ${n(row, "id")}`;
		synced += 1;
	} catch (error) {
		failed += 1;
		lastError = error instanceof Error ? error.message : "Could not sync a user.";
	}
	for (const row of shoppers) try {
		const id = await upsertZendeskUser(sql, {
			name: s(row, "name"),
			email: s(row, "email"),
			kind: "shop"
		});
		if (id) await sql`update shop_customers set zendesk_user_id = ${id} where id = ${n(row, "id")}`;
		synced += 1;
	} catch (error) {
		failed += 1;
		lastError = error instanceof Error ? error.message : "Could not sync a user.";
	}
	return {
		synced,
		failed,
		lastError
	};
}
var syncPortalUsers_createServerFn_handler = createServerRpc({
	id: "eefe1b2139b9a095ac3d34188838b25316468915b51adccccd6f3c4c895177e2",
	name: "syncPortalUsers",
	filename: "src/lib/portal/api.ts"
}, (opts) => syncPortalUsers.__executeServer(opts));
var syncPortalUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(syncPortalUsers_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	if (!supportConnected(await readZendesk(sql))) throw new Error("Zendesk is not connected. Add the OAuth client id and secret for shop, then test access.");
	const users = await pushPortalUsers(sql);
	if (users.failed && !users.synced) throw new Error(users.lastError || "Could not sync users.");
	await rememberZendesk(sql, users.failed ? "error" : "connected", users.lastError, false);
	await audit(sql, actor, "Synced Zendesk users", String(users.synced), users.lastError);
	return {
		synced: users.synced,
		failed: users.failed
	};
});
var getSettings_createServerFn_handler = createServerRpc({
	id: "62d5a17b50ad151ca9ad632360b484b9338217ef1cbf03b4906c1f95b5c61b2c",
	name: "getSettings",
	filename: "src/lib/portal/api.ts"
}, (opts) => getSettings.__executeServer(opts));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettings_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const row = (await sql`select * from portal_settings where id = 1`)[0] ?? {};
	const staff = await sql`
      select staff.*, coalesce(o.name, '') as organization_name
      from portal_staff staff
      left join organizations o on o.id = staff.organization_id
      order by staff.created_at
    `;
	const logs = actor.organizationId == null ? await sql`select * from audit_logs order by created_at desc limit 40` : await sql`
            select * from audit_logs
            where actor_user_id = ${actor.userId}
               or target ilike ${"%" + (actor.organizationName ?? "") + "%"}
               or detail ilike ${"%" + (actor.organizationName ?? "") + "%"}
            order by created_at desc
            limit 40
          `;
	const mail = await resolveMail(sql);
	const fromMatch = /<([^>]+)>/.exec(mail.from);
	return {
		settings: {
			brandName: s(row, "brand_name") || "Manage Tech Service",
			supportEmail: s(row, "support_email"),
			tagline: s(row, "tagline"),
			notifyNewTicket: row.notify_new_ticket == null ? true : b(row, "notify_new_ticket"),
			notifyNewOrder: row.notify_new_order == null ? true : b(row, "notify_new_order"),
			customerCatalogVisible: row.customer_catalog_visible == null ? true : b(row, "customer_catalog_visible")
		},
		mail: {
			fromEmail: fromMatch?.[1] || mail.from || "noreply@managetechservice.com",
			keySet: Boolean(mail.key),
			status: s(row, "resend_status"),
			error: s(row, "resend_error")
		},
		staff: actor.organizationId ? staff.filter((item) => nid(item, "organization_id") === actor.organizationId || s(item, "user_id") === actor.userId).map(mapStaff) : staff.map(mapStaff),
		audit: logs.map(mapAudit),
		orgs: await orgNames(sql, actor)
	};
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "b0f379b93ca9398d5e1a4acccb7adc4ce9e00add400f24ff4afd1298806bf9ac",
	name: "saveSettings",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveSettings.__executeServer(opts));
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
}).handler(saveSettings_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	await sql`
      insert into portal_settings (
        id, brand_name, support_email, tagline, notify_new_ticket, notify_new_order, customer_catalog_visible
      ) values (
        1, ${data.brandName}, ${data.supportEmail}, ${data.tagline},
        ${data.notifyNewTicket}, ${data.notifyNewOrder}, ${data.customerCatalogVisible}
      )
      on conflict (id) do update set
        brand_name = excluded.brand_name,
        support_email = excluded.support_email,
        tagline = excluded.tagline,
        notify_new_ticket = excluded.notify_new_ticket,
        notify_new_order = excluded.notify_new_order,
        customer_catalog_visible = excluded.customer_catalog_visible
    `;
	await audit(sql, actor, "Updated settings", data.brandName, data.supportEmail);
	return { ok: true };
});
var saveResend_createServerFn_handler = createServerRpc({
	id: "e974204c52d0e42fe66ef3d4a57018eecc005bebfc64151909d0b35966c0f406",
	name: "saveResend",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveResend.__executeServer(opts));
var saveResend = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const fromEmail = str(raw.fromEmail, 180).replace(/[<>]/g, "");
	if (!fromEmail.includes("@")) throw new Error("Enter the noreply address.");
	return {
		fromEmail,
		apiKey: str(raw.apiKey, 200)
	};
}).handler(saveResend_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const current = await sql`select resend_api_key from portal_settings where id = 1`;
	const kept = current[0] ? s(current[0], "resend_api_key") : "";
	const key = data.apiKey || kept;
	await sql`
      insert into portal_settings (id, resend_api_key, email_from)
      values (1, ${key}, ${`Manage Tech Service <${data.fromEmail}>`})
      on conflict (id) do update set
        resend_api_key = excluded.resend_api_key,
        email_from = excluded.email_from
    `;
	await audit(sql, actor, "Updated Resend", data.fromEmail, key ? "API key saved" : "No API key");
	return { ok: true };
});
var testResend_createServerFn_handler = createServerRpc({
	id: "571bab71bc9d2a5f073ec33d084cb4dd1f4f246bdc978c53fb86e1b4a2c93b01",
	name: "testResend",
	filename: "src/lib/portal/api.ts"
}, (opts) => testResend.__executeServer(opts));
var testResend = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(testResend_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	assertAdmin(await loadActor(sql, context.userId));
	const mail = await resolveMail(sql);
	if (!mail.key) throw new Error("Add a Resend API key first.");
	const response = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${mail.key}` } });
	const text = await response.text();
	if (!response.ok) {
		const message = text.slice(0, 180) || "Resend rejected the API key.";
		await sql`update portal_settings set resend_status = 'error', resend_error = ${message} where id = 1`;
		throw new Error(message);
	}
	let domains = 0;
	try {
		const payload = JSON.parse(text);
		domains = Array.isArray(payload.data) ? payload.data.length : 0;
	} catch {
		domains = 0;
	}
	const message = domains ? `Connected. ${domains} sending domain${domains === 1 ? "" : "s"}.` : "Connected. No sending domain is verified yet.";
	await sql`update portal_settings set resend_status = 'connected', resend_error = ${message} where id = 1`;
	return {
		ok: true,
		message
	};
});
var sendTestEmail_createServerFn_handler = createServerRpc({
	id: "439a145bbc49341541751ebb26a5a14e2008ae6af126636cc4070024b168ab16",
	name: "sendTestEmail",
	filename: "src/lib/portal/api.ts"
}, (opts) => sendTestEmail.__executeServer(opts));
var sendTestEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const to = str(typeof input === "string" ? input : obj(input).to, 180);
	if (!to.includes("@")) throw new Error("Enter the address that should receive the test.");
	return to;
}).handler(sendTestEmail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const mail = await resolveMail(sql);
	if (!mail.key) throw new Error("Add a Resend API key first.");
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${mail.key}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			from: mail.from,
			to: [data],
			subject: "Manage Tech Service test email",
			text: `This is a test from the admin desk. It was sent from ${mail.from}.`
		})
	});
	const text = await response.text();
	if (!response.ok) {
		const message = text.slice(0, 180) || "Resend did not send the test.";
		await sql`update portal_settings set resend_status = 'error', resend_error = ${message} where id = 1`;
		throw new Error(message);
	}
	await sql`update portal_settings set resend_status = 'connected', resend_error = ${`Test sent to ${data}`} where id = 1`;
	await audit(sql, actor, "Sent test email", data, mail.from);
	return { ok: true };
});
var saveStaff_createServerFn_handler = createServerRpc({
	id: "bb2b538133ede151b6fe4b4b094400ad002c31b110d59bd68450c339801704bb",
	name: "saveStaff",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveStaff.__executeServer(opts));
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
}).handler(saveStaff_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	if (data.userId === actor.userId && !data.active) throw new Error("You cannot deactivate yourself.");
	const current = (await sql`select * from portal_staff where user_id = ${data.userId}`)[0];
	if (!current) throw new Error("Staff member not found.");
	if (s(current, "role") === "owner" && b(current, "active") && (data.role !== "owner" || !data.active)) {
		const owners = await sql`
        select count(*)::int as n from portal_staff where role = 'owner' and active = true
      `;
		if ((owners[0] ? n(owners[0], "n") : 0) <= 1) throw new Error("The last owner cannot be removed.");
	}
	await sql`
      update portal_staff set
        role = ${data.role},
        active = ${data.active},
        organization_id = ${data.organizationId}
      where user_id = ${data.userId}
    `;
	await audit(sql, actor, "Updated staff", s(current, "email"), `${data.role}${data.organizationId ? ` · company ${data.organizationId}` : " · all companies"}`);
	return { ok: true };
});
function envStripe() {
	const secret = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "").trim();
	return {
		secret,
		publishable: (process.env.STRIPE_PUBLISHABLE_KEY || "").trim(),
		fromEnv: Boolean(secret)
	};
}
async function syncAlternativeEnv(sql, row) {
	const env = envAlternative();
	const storedMode = alternativeMode(s(row, "alternative_environment") || "sandbox");
	if (!env.fromEnv) return {
		status: s(row, "alternative_status") || "portal",
		error: s(row, "alternative_error"),
		mode: storedMode
	};
	if (s(row, "alternative_status") === "connected" && storedMode === env.mode && s(row, "alternative_client_id") === env.clientId) return {
		status: "connected",
		error: "",
		mode: env.mode
	};
	try {
		await probeAlternative(env);
		await sql`
      update payment_settings set
        alternative_status = 'connected',
        alternative_error = '',
        alternative_enabled = true,
        alternative_environment = ${env.mode},
        alternative_client_id = ${env.clientId}
      where id = 1
    `;
		return {
			status: "connected",
			error: "",
			mode: env.mode
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Alternative Payments connection failed.";
		await sql`
      update payment_settings set
        alternative_status = 'error',
        alternative_error = ${message},
        alternative_environment = ${env.mode},
        alternative_client_id = ${env.clientId}
      where id = 1
    `;
		return {
			status: "error",
			error: message,
			mode: env.mode
		};
	}
}
async function readPayments(sql) {
	const env = envStripe();
	const rows = await sql`select * from payment_settings where id = 1`;
	const row = rows[0] ?? {};
	const cardEnabled = b(row, "card_enabled");
	const invoiceEnabled = rows[0] ? b(row, "invoice_enabled") : true;
	const purchaseOrderEnabled = rows[0] ? b(row, "purchase_order_enabled") : true;
	const alternative = envAlternative();
	const synced = await syncAlternativeEnv(sql, row);
	const alternativeEnabled = synced.status === "connected" ? true : rows[0] ? b(row, "alternative_enabled") : true;
	const methods = [
		alternativeEnabled ? "alternative" : "",
		cardEnabled ? "card" : "",
		invoiceEnabled ? "invoice" : "",
		purchaseOrderEnabled ? "purchase_order" : ""
	].filter(Boolean);
	let lastStatus = s(row, "last_status") || "not_connected";
	if (env.fromEnv && (lastStatus === "not_connected" || lastStatus === "saved")) lastStatus = "ready";
	let alternativeStatus = synced.status;
	if (alternative.fromEnv && alternativeStatus === "saved") alternativeStatus = "ready";
	return {
		cardEnabled,
		invoiceEnabled,
		purchaseOrderEnabled,
		publishableKey: env.publishable || s(row, "stripe_publishable_key"),
		secretSet: Boolean(env.secret || s(row, "stripe_secret_key")),
		fromEnv: env.fromEnv,
		invoiceTerms: s(row, "invoice_terms") || "Net 30",
		requirePo: b(row, "require_po"),
		lastStatus,
		lastError: s(row, "last_error"),
		accountName: s(row, "account_name"),
		methods,
		alternativeEnabled,
		alternativeClientId: alternative.clientId || s(row, "alternative_client_id"),
		alternativeSecretSet: Boolean(alternative.clientSecret || s(row, "alternative_client_secret")),
		alternativeFromEnv: alternative.fromEnv,
		alternativeStatus,
		alternativeError: synced.error,
		alternativePortalUrl: ALTERNATIVE_PORTAL,
		alternativeEnvironment: synced.mode,
		alternativeEnvironmentLocked: alternative.fromEnv
	};
}
async function stripeSecret(sql) {
	const env = envStripe();
	if (env.secret) return env.secret;
	const rows = await sql`select stripe_secret_key from payment_settings where id = 1`;
	return rows[0] ? s(rows[0], "stripe_secret_key") : "";
}
async function stripeAccount(secret) {
	const response = await fetch("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${secret}` } });
	const text = await response.text();
	if (!response.ok) {
		let detail = "Stripe rejected the key.";
		try {
			const parsed = JSON.parse(text);
			if (parsed.error?.message) detail = parsed.error.message.slice(0, 180);
		} catch {
			detail = text.slice(0, 180);
		}
		throw new Error(detail);
	}
	const account = JSON.parse(text);
	return account.settings?.dashboard?.display_name || account.business_profile?.name || account.id || "Stripe account";
}
var getPayments_createServerFn_handler = createServerRpc({
	id: "dfaa658b4c2fce2c8aac4fba6f146d0ddd01dc410e260030ad8cd5570345adaa",
	name: "getPayments",
	filename: "src/lib/portal/api.ts"
}, (opts) => getPayments.__executeServer(opts));
var getPayments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPayments_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return readPayments(sql);
});
var savePayments_createServerFn_handler = createServerRpc({
	id: "225663cb1bb354603c205d5aabd6a5459388309ad5b5aa1cc93b0b72913dc023",
	name: "savePayments",
	filename: "src/lib/portal/api.ts"
}, (opts) => savePayments.__executeServer(opts));
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
}).handler(savePayments_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const env = envStripe();
	const alternative = envAlternative();
	const current = await sql`
      select stripe_secret_key, stripe_publishable_key, alternative_client_id, alternative_client_secret
      from payment_settings where id = 1
    `;
	const storedSecret = current[0] ? s(current[0], "stripe_secret_key") : "";
	const storedAlternativeSecret = current[0] ? s(current[0], "alternative_client_secret") : "";
	if (env.fromEnv && (data.secretKey || data.clearSecret)) throw new Error("The Stripe secret is set with STRIPE_SECRET_KEY. Remove it from the server environment to edit it here.");
	if (alternative.fromEnv && (data.alternativeClientSecret || data.clearAlternativeSecret)) throw new Error("Alternative Payments is set with ALTERNATIVE_CLIENT_ID and ALTERNATIVE_CLIENT_SECRET.");
	const secret = data.clearSecret ? "" : data.secretKey || storedSecret;
	const alternativeSecret = data.clearAlternativeSecret ? "" : data.alternativeClientSecret || storedAlternativeSecret;
	if (data.cardEnabled && !env.secret && !secret) throw new Error("Add a Stripe secret key before turning on card payments.");
	if (data.publishableKey && !data.publishableKey.startsWith("pk_")) throw new Error("The publishable key should start with pk_.");
	if (data.secretKey && !data.secretKey.startsWith("sk_") && !data.secretKey.startsWith("rk_")) throw new Error("The secret key should start with sk_.");
	const publishable = env.publishable || data.publishableKey;
	const clientId = alternative.clientId || data.alternativeClientId;
	await sql`
      insert into payment_settings (
        id, card_enabled, invoice_enabled, purchase_order_enabled,
        stripe_publishable_key, stripe_secret_key, invoice_terms, require_po, last_status, last_error,
        alternative_enabled, alternative_client_id, alternative_client_secret, alternative_environment
      ) values (
        1, ${data.cardEnabled}, ${data.invoiceEnabled}, ${data.purchaseOrderEnabled},
        ${publishable}, ${secret}, ${data.invoiceTerms}, ${data.requirePo}, 'saved', '',
        ${data.alternativeEnabled}, ${clientId}, ${alternativeSecret}, ${alternative.fromEnv ? alternative.mode : data.alternativeEnvironment}
      )
      on conflict (id) do update set
        card_enabled = excluded.card_enabled,
        invoice_enabled = excluded.invoice_enabled,
        purchase_order_enabled = excluded.purchase_order_enabled,
        stripe_publishable_key = excluded.stripe_publishable_key,
        stripe_secret_key = excluded.stripe_secret_key,
        invoice_terms = excluded.invoice_terms,
        require_po = excluded.require_po,
        last_status = 'saved',
        last_error = '',
        alternative_enabled = excluded.alternative_enabled,
        alternative_client_id = excluded.alternative_client_id,
        alternative_client_secret = excluded.alternative_client_secret,
        alternative_environment = excluded.alternative_environment
    `;
	await audit(sql, actor, "Saved payments", data.invoiceTerms, data.alternativeEnabled ? "Alternative Payments on" : "Alternative Payments off");
	return { ok: true };
});
var testPayments_createServerFn_handler = createServerRpc({
	id: "5b73ba21e97c8dad3c8ec2284acf2248c024c6a0be0fbd07abde9efcb935e5f5",
	name: "testPayments",
	filename: "src/lib/portal/api.ts"
}, (opts) => testPayments.__executeServer(opts));
var testPayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(testPayments_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const secret = await stripeSecret(sql);
	if (!secret) throw new Error("Add a Stripe secret key first. Use STRIPE_SECRET_KEY or the form.");
	try {
		const name = await stripeAccount(secret);
		await sql`
        update payment_settings
        set last_status = 'connected', last_error = '', account_name = ${name}, card_enabled = true
        where id = 1
      `;
		await audit(sql, actor, "Tested Stripe", name, "");
		return {
			ok: true,
			name
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Stripe connection failed.";
		await sql`update payment_settings set last_status = 'error', last_error = ${message} where id = 1`;
		throw new Error(message);
	}
});
var testAlternative_createServerFn_handler = createServerRpc({
	id: "f4c15876b91381be1a1a5430cc4e73bb3e7e5629b928e57536f1869b91f20f15",
	name: "testAlternative",
	filename: "src/lib/portal/api.ts"
}, (opts) => testAlternative.__executeServer(opts));
var testAlternative = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(testAlternative_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const creds = await loadAlternativeCreds(sql);
	if (!creds) throw new Error("Add an Alternative Payments client id and secret, or set ALTERNATIVE_CLIENT_ID and ALTERNATIVE_CLIENT_SECRET.");
	try {
		const probed = await probeAlternative(creds);
		await sql`
        update payment_settings
        set alternative_status = 'connected', alternative_error = '', alternative_enabled = true,
            alternative_environment = ${creds.mode}, alternative_client_id = ${creds.clientId}
        where id = 1
      `;
		await audit(sql, actor, "Tested Alternative Payments", creds.mode, probed.base);
		return {
			ok: true,
			mode: creds.mode
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Alternative Payments connection failed.";
		await sql`update payment_settings set alternative_status = 'error', alternative_error = ${message} where id = 1`;
		throw new Error(message);
	}
});
var refreshAlternativeOrder_createServerFn_handler = createServerRpc({
	id: "ac50fa25a8c0af214c48b56e2b0b07ed7496ef6c0e0bc82e42fa187a6b973ddd",
	name: "refreshAlternativeOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => refreshAlternativeOrder.__executeServer(opts));
var refreshAlternativeOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(refreshAlternativeOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	await orderById(sql, data, actor);
	const creds = await loadAlternativeCreds(sql);
	if (!creds) throw new Error("Alternative Payments is not connected.");
	const row = (await sql`select alternative_invoice_id, alternative_request_id, payment_url, payment_status from orders where id = ${data}`)[0];
	const refreshed = await refreshAlternativePayment(creds, {
		invoiceId: row ? s(row, "alternative_invoice_id") : "",
		requestId: row ? s(row, "alternative_request_id") : ""
	});
	await sql`
      update orders set
        payment_status = ${refreshed.status || (row ? s(row, "payment_status") : "")},
        payment_url = ${refreshed.url || (row ? s(row, "payment_url") : "")}
      where id = ${data}
    `;
	return orderById(sql, data, actor);
});
var getStorefront_createServerFn_handler = createServerRpc({
	id: "e002bfeae19e89322e5bda5a5d1981718c1ac500764589e5558f116614fe1bf2",
	name: "getStorefront",
	filename: "src/lib/portal/api.ts"
}, (opts) => getStorefront.__executeServer(opts));
var getStorefront = createServerFn({ method: "GET" }).handler(getStorefront_createServerFn_handler, async () => {
	const sql = await getSql();
	const setting = (await sql`select * from portal_settings where id = 1`)[0];
	const brandName = setting ? s(setting, "brand_name") || "Manage Tech Service" : "Manage Tech Service";
	const closed = setting ? !b(setting, "customer_catalog_visible") : false;
	const rows = closed ? [] : await sql`select * from products where available = true order by category, name`;
	return {
		brandName,
		slug: storeSlug(brandName),
		tagline: setting ? s(setting, "tagline") : "",
		supportEmail: setting ? s(setting, "support_email") : "",
		closed,
		products: await attachImages(sql, rows.map(mapProduct))
	};
});
var getShopCheckout_createServerFn_handler = createServerRpc({
	id: "2444a9daa5bdee0aa8bad40ecac51400b55a10983502f68e6bcfeaedd89c4aee",
	name: "getShopCheckout",
	filename: "src/lib/portal/api.ts"
}, (opts) => getShopCheckout.__executeServer(opts));
var getShopCheckout = createServerFn({ method: "GET" }).validator((input) => typeof input === "string" ? input : "").handler(getShopCheckout_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const payments = await readPayments(sql);
	const signedIn = await shopByToken(sql, data);
	const access = signedIn ? await accessFor(sql, signedIn) : null;
	return {
		methods: payments.methods.length ? payments.methods : ["invoice"],
		invoiceTerms: payments.invoiceTerms,
		alternativeEnvironment: payments.alternativeEnvironment,
		payLater: Boolean(signedIn && (b(signedIn, "pay_later") || access?.canDefer)),
		sandboxReady: payments.alternativeEnvironment !== "live" && payments.alternativeSecretSet,
		signedIn: Boolean(signedIn),
		canPurchase: Boolean(access?.canPurchase),
		canPayNow: Boolean(access?.canPayNow)
	};
});
var setShopPayLater_createServerFn_handler = createServerRpc({
	id: "7f8fdd49231c93a0d6e183ccb30e97fcc8d1127c35f2ec79cd549c0b9c8e1cfc",
	name: "setShopPayLater",
	filename: "src/lib/portal/api.ts"
}, (opts) => setShopPayLater.__executeServer(opts));
var setShopPayLater = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	if (!id) throw new Error("Choose a shop customer.");
	return {
		id,
		payLater: raw.payLater === true
	};
}).handler(setShopPayLater_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const rows = await sql`select email from shop_customers where id = ${data.id}`;
	if (!rows[0]) throw new Error("That shop customer was not found.");
	await sql`update shop_customers set pay_later = ${data.payLater} where id = ${data.id}`;
	await audit(sql, actor, data.payLater ? "Allowed pay later" : "Required payment", s(rows[0], "email"), data.payLater ? "Order now, pay later." : "Must pay at checkout.");
	return { ok: true };
});
var SHIPPING = {
	standard: {
		label: "Standard",
		cents: (subtotal) => subtotal >= 5e4 ? 0 : 1500
	},
	express: {
		label: "Express",
		cents: () => 2500
	}
};
function shippingChoice(method, subtotal) {
	const key = method === "express" ? "express" : "standard";
	return {
		method: key,
		label: SHIPPING[key].label,
		cents: SHIPPING[key].cents(subtotal)
	};
}
async function hashShopPassword(password) {
	const { randomBytes, scryptSync } = await import("node:crypto");
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}
async function shopPasswordMatches(password, stored) {
	const { scryptSync, timingSafeEqual } = await import("node:crypto");
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const next = scryptSync(password, salt, 32);
	const prev = Buffer.from(hash, "hex");
	if (prev.length !== next.length) return false;
	return timingSafeEqual(prev, next);
}
async function newShopToken() {
	const { randomBytes } = await import("node:crypto");
	return randomBytes(32).toString("hex");
}
function mapShopCustomer(row) {
	return {
		name: s(row, "name"),
		email: s(row, "email"),
		phone: s(row, "phone"),
		address: s(row, "address"),
		city: s(row, "city"),
		region: s(row, "region"),
		postal: s(row, "postal"),
		country: s(row, "country") || "United States",
		payLater: b(row, "pay_later")
	};
}
async function shopByToken(sql, token) {
	if (!token) return void 0;
	return (await sql`
    select * from shop_customers
    where session_token = ${token} and session_expires > now()
    limit 1
  `)[0];
}
async function notifyCustomer(sql, customerId, title, body, href) {
	if (!customerId) return;
	await sql`
    insert into customer_notices (shop_customer_id, title, body, href)
    values (${customerId}, ${title}, ${body}, ${href})
  `;
}
async function shopOrders(sql, customerId, email) {
	const rows = await sql`
    select o.*,
      coalesce((
        select sum(oi.quantity * oi.unit_price_cents)::int from order_items oi where oi.order_id = o.id
      ), 0) as goods_cents
    from orders o
    where o.shop_customer_id = ${customerId} or lower(o.ship_email) = ${email}
    order by o.created_at desc
  `;
	const orders = [];
	for (const row of rows) {
		const items = await sql`select * from order_items where order_id = ${n(row, "id")} order by id`;
		orders.push({
			id: n(row, "id"),
			number: `MT-${1e3 + n(row, "id")}`,
			createdAt: s(row, "created_at"),
			status: s(row, "status"),
			shipmentStatus: s(row, "shipment_status") || "unfulfilled",
			trackingNumber: s(row, "tracking_number"),
			trackingCarrier: s(row, "tracking_carrier"),
			shippingMethod: s(row, "shipping_method"),
			paymentMethod: s(row, "payment_method"),
			paymentUrl: s(row, "payment_url"),
			totalCents: n(row, "goods_cents") + n(row, "shipping_cents"),
			shipName: s(row, "ship_name"),
			shipAddress: s(row, "ship_address"),
			shipCity: s(row, "ship_city"),
			shipRegion: s(row, "ship_region"),
			shipPostal: s(row, "ship_postal"),
			shipCountry: s(row, "ship_country"),
			items: items.map((item) => ({
				name: s(item, "product_name"),
				sku: s(item, "sku"),
				quantity: n(item, "quantity"),
				unitPriceCents: n(item, "unit_price_cents")
			}))
		});
	}
	return orders;
}
var shopRegister_createServerFn_handler = createServerRpc({
	id: "62beba8a04e9f66641d4e6f42ae1724ce382e7d5b742d5a63659c53f8e81676f",
	name: "shopRegister",
	filename: "src/lib/portal/api.ts"
}, (opts) => shopRegister.__executeServer(opts));
var shopRegister = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, true)).handler(shopRegister_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if ((await sql`select id from shop_customers where email = ${data.email}`)[0]) throw new Error("An account with that email already exists. Sign in instead.");
	const token = await newShopToken();
	await sql`
      insert into shop_customers (email, name, password_hash, session_token, session_expires, role_id, grant_shop, grant_services, grant_invoice)
      values (${data.email}, ${data.name}, ${await hashShopPassword(data.password)}, ${token}, now() + interval '12 hours', 'regular', false, false, false)
    `;
	const shopOrg = await sql`select id from organizations where domain = 'shop.managetech.example' limit 1`;
	await openWelcomeTicket(sql, {
		name: data.name,
		email: data.email,
		organizationId: shopOrg[0] ? n(shopOrg[0], "id") : null,
		source: "Online shop account",
		detail: "Customer created an account.",
		actorName: "Online shop"
	}).catch(() => void 0);
	await upsertZendeskUser(sql, {
		name: data.name,
		email: data.email,
		kind: "shop"
	}).then(async (zendeskUserId) => {
		if (zendeskUserId) await sql`update shop_customers set zendesk_user_id = ${zendeskUserId} where email = ${data.email}`;
	}).catch(() => void 0);
	return {
		token,
		email: data.email,
		name: data.name
	};
});
var shopLogin_createServerFn_handler = createServerRpc({
	id: "c66c27b00ab4372a9b30c9c26822c913f782ecdf4dc9681d32499b38af81ad3e",
	name: "shopLogin",
	filename: "src/lib/portal/api.ts"
}, (opts) => shopLogin.__executeServer(opts));
var shopLogin = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, false)).handler(shopLogin_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = (await sql`select * from shop_customers where email = ${data.email}`)[0];
	if (!row || !await shopPasswordMatches(data.password, s(row, "password_hash"))) throw new Error("Email or password is wrong.");
	if (!b(row, "email_verified")) throw new Error("Verify your email before signing in.");
	const token = await newShopToken();
	await sql`update shop_customers set session_token = ${token}, session_expires = now() + interval '12 hours' where id = ${n(row, "id")}`;
	return {
		token,
		email: s(row, "email"),
		name: s(row, "name")
	};
});
var shopLogout_createServerFn_handler = createServerRpc({
	id: "be47dfa17f463fbc61a2a072b0aaaa230867d9fe47c5118e17df31be541667b3",
	name: "shopLogout",
	filename: "src/lib/portal/api.ts"
}, (opts) => shopLogout.__executeServer(opts));
var shopLogout = createServerFn({ method: "POST" }).validator((input) => ({ token: str(obj(input).token, 80) })).handler(shopLogout_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (data.token) await sql`update shop_customers set session_token = '', session_expires = now() where session_token = ${data.token}`;
	return { ok: true };
});
var getShopAccount_createServerFn_handler = createServerRpc({
	id: "38afa57349a8410b70ad520028e233a2fc20ba16edbf8a32e82ad41a833184c8",
	name: "getShopAccount",
	filename: "src/lib/portal/api.ts"
}, (opts) => getShopAccount.__executeServer(opts));
var getShopAccount = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(getShopAccount_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = await shopByToken(sql, data);
	if (!row) return null;
	return {
		customer: mapShopCustomer(row),
		orders: await shopOrders(sql, n(row, "id"), s(row, "email"))
	};
});
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
function mapPortalTicket(row, comments = []) {
	return {
		id: n(row, "id"),
		subject: s(row, "subject"),
		status: s(row, "status"),
		category: s(row, "category"),
		zendeskId: s(row, "zendesk_id"),
		updatedAt: s(row, "updated_at"),
		comments: comments.map((item) => ({
			author: s(item, "author_name"),
			body: s(item, "body"),
			at: s(item, "created_at")
		}))
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
var getPortalSession_createServerFn_handler = createServerRpc({
	id: "3baa30964d8426c8002968b9b4948517b2b19f5ddaeb2112b27d172cf0a36297",
	name: "getPortalSession",
	filename: "src/lib/portal/api.ts"
}, (opts) => getPortalSession.__executeServer(opts));
var getPortalSession = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(getPortalSession_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = await shopByToken(sql, data);
	if (!row) return null;
	const access = await accessFor(sql, row);
	const tickets = await sql`
      select id, subject, status, category, zendesk_id, updated_at
      from tickets
      where lower(requester_email) = lower(${s(row, "email")})
      order by updated_at desc
      limit 20
    `;
	const orgId = nid(row, "organization_id");
	const orgs = orgId ? await sql`select name from organizations where id = ${orgId}` : [];
	return {
		customer: mapShopCustomer(row),
		access,
		tickets: tickets.map((item) => mapPortalTicket(item)),
		business: s(row, "business_name"),
		organization: orgs[0] ? s(orgs[0], "name") : "",
		interests: s(row, "interests").split(",").map((item) => item.trim()).filter(Boolean),
		verified: b(row, "email_verified"),
		grants: {
			shop: b(row, "grant_shop"),
			services: b(row, "grant_services"),
			invoice: b(row, "grant_invoice")
		}
	};
});
var getPortalTicket_createServerFn_handler = createServerRpc({
	id: "b45e7ed1b61a7c28074338a2b5cc836c55971be769e5fb609cc9be95e60ce586",
	name: "getPortalTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => getPortalTicket.__executeServer(opts));
var getPortalTicket = createServerFn({ method: "GET" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing ticket.");
	return {
		token,
		id
	};
}).handler(getPortalTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const ticket = (await sql`
      select * from tickets where id = ${data.id} and lower(requester_email) = lower(${s(row, "email")})
    `)[0];
	if (!ticket) throw new Error("That ticket is not on this account.");
	return mapPortalTicket(ticket, await sql`
      select * from ticket_comments
      where ticket_id = ${data.id} and public_note = true
      order by created_at
    `);
});
var submitPortalTicket_createServerFn_handler = createServerRpc({
	id: "b8b12c9a304b1d765d10479d586d5610229b362f4b8c73110c26d0f846e6732f",
	name: "submitPortalTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => submitPortalTicket.__executeServer(opts));
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
}).handler(submitPortalTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row, access } = await requirePortal(sql, data.token);
	if (!access.canTicket) throw new Error("This account cannot open tickets.");
	const name = s(row, "name");
	const email = s(row, "email");
	const orgId = nid(row, "organization_id");
	const detail = [
		`Category: ${data.category}`,
		`Severity: ${data.severity}`,
		data.device ? `Device: ${data.device}` : "",
		data.body
	].filter(Boolean).join("\n");
	const ticketId = n((await sql`
      insert into tickets (subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label)
      values (${data.subject}, 'new', ${data.severity === "high" ? "high" : "normal"}, ${data.category}, ${orgId}, ${name}, ${email}, 'portal,customer', '')
      returning id
    `)[0], "id");
	await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, ${name || email}, ${detail}, true)
    `;
	let zendeskId = "";
	let warning = "";
	const settings = await readZendesk(sql);
	if (!supportConnected(settings)) {
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
		warning = "The ticket is open in the portal. Zendesk will receive it when the desk is connected.";
	} else try {
		const remote = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: {
				subject: data.subject,
				comment: { body: detail },
				tags: [
					"portal",
					"customer",
					data.category.toLowerCase().replace(/\s+/g, "_")
				],
				status: "new",
				requester: {
					name: name || email,
					email
				}
			} })
		})).ticket);
		zendeskId = remote.id != null ? String(remote.id) : "";
		if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
		await upsertZendeskUser(sql, {
			name,
			email,
			kind: "shop"
		}).catch(() => "");
	} catch (error) {
		warning = error instanceof Error ? error.message : "Zendesk did not accept the ticket.";
		await rememberZendesk(sql, "error", warning, false);
		await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
	}
	await publishNotice(sql, {
		userId: "",
		name: name || email,
		email,
		role: "viewer",
		organizationId: null,
		organizationName: null,
		active: true
	}, "Opened ticket", String(ticketId), data.subject).catch(() => void 0);
	await notifyCustomer(sql, n(row, "id"), "Ticket opened", data.subject, `/portal/tickets/${ticketId}`).catch(() => void 0);
	return {
		ticketId,
		zendeskId,
		warning
	};
});
var refreshPortalTicket_createServerFn_handler = createServerRpc({
	id: "0fcef1892d29b84597bde18ac0a5888625a7e35aa57c71eb6c4bc67625a12947",
	name: "refreshPortalTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => refreshPortalTicket.__executeServer(opts));
var refreshPortalTicket = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing ticket.");
	return {
		token,
		id
	};
}).handler(refreshPortalTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const ticket = (await sql`
      select * from tickets where id = ${data.id} and lower(requester_email) = lower(${s(row, "email")})
    `)[0];
	if (!ticket) throw new Error("That ticket is not on this account.");
	const zendeskId = s(ticket, "zendesk_id");
	const settings = await readZendesk(sql);
	if (!zendeskId || !supportConnected(settings)) return {
		synced: false,
		warning: zendeskId ? "Zendesk is not connected." : "This ticket is not in Zendesk yet."
	};
	const body = obj((await zendesk(settings, `/tickets/${encodeURIComponent(zendeskId)}.json`)).ticket);
	await sql`update tickets set status = ${zdStatus(String(body.status || s(ticket, "status")))}, updated_at = now() where id = ${data.id}`;
	const comments = await zendesk(settings, `/tickets/${encodeURIComponent(zendeskId)}/comments.json`);
	const list = Array.isArray(comments.comments) ? comments.comments : [];
	for (const item of list) {
		const comment = obj(item);
		const commentId = comment.id != null ? String(comment.id) : "";
		const text = typeof comment.body === "string" ? comment.body.slice(0, 4e3) : "";
		if (!commentId || !text) continue;
		const isPublic = commentIsPublic(comment.public);
		if ((await sql`select id from ticket_comments where zendesk_comment_id = ${commentId} limit 1`).length) continue;
		await sql`
        insert into ticket_comments (ticket_id, author_name, body, public_note, zendesk_comment_id)
        values (${data.id}, 'Zendesk', ${text}, ${isPublic}, ${commentId})
      `;
	}
	return {
		synced: true,
		warning: ""
	};
});
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
var orderPortalService_createServerFn_handler = createServerRpc({
	id: "520532b038adf7ac3062ca749dad742b0de24ff3b591e3c0b635d89e8fabdb83",
	name: "orderPortalService",
	filename: "src/lib/portal/api.ts"
}, (opts) => orderPortalService.__executeServer(opts));
var orderPortalService = createServerFn({ method: "POST" }).validator((input) => {
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
}).handler(orderPortalService_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row, access } = await requirePortal(sql, data.token);
	const item = SERVICE_MENU[data.service];
	if (item.group === "it" && !access.canOrderIt) throw new Error("This account cannot order IT services.");
	if (item.group === "phone" && !access.canOrderPhone) throw new Error("This account cannot order phone or internet services.");
	if (!access.canDefer) throw new Error("This account cannot take an invoice. Pay-later services are turned off.");
	const org = (await sql`select id from organizations where domain = 'shop.managetech.example' limit 1`)[0];
	if (!org) throw new Error("The service desk is not ready to take orders.");
	const id = n((await sql`
      insert into orders (
        organization_id, shop_customer_id, status, notes, approval_note, payment_method, payment_status,
        ship_name, ship_email, ship_phone, shipping_method, shipment_status
      ) values (
        ${n(org, "id")}, ${n(row, "id")}, 'pending', ${data.notes}, 'Service ordered from the customer portal.',
        'invoice', 'pay_later', ${s(row, "name")}, ${s(row, "email")}, ${s(row, "phone")}, 'standard', 'unfulfilled'
      )
      returning id
    `)[0], "id");
	await sql`
      insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents)
      values (${id}, null, ${item.name}, ${data.service}, 1, ${item.cents})
    `;
	return {
		id,
		number: `MT-${1e3 + id}`
	};
});
var setShopRole_createServerFn_handler = createServerRpc({
	id: "9682f71bb42db5a4157e422855a9c0b7f7b8e56235d35d75ae07a3a7f6489d5b",
	name: "setShopRole",
	filename: "src/lib/portal/api.ts"
}, (opts) => setShopRole.__executeServer(opts));
var setShopRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const roleId = str(raw.roleId, 40);
	if (!id || !roleId) throw new Error("Choose a customer and a role.");
	return {
		id,
		roleId
	};
}).handler(setShopRole_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	if (!(await sql`select id from role_policies where id = ${data.roleId}`)[0]) throw new Error("That role does not exist.");
	const rows = await sql`select email from shop_customers where id = ${data.id}`;
	if (!rows[0]) throw new Error("That shop customer was not found.");
	const payLater = data.roleId === "authorized";
	const shop = data.roleId === "buyer" || data.roleId === "authorized";
	const services = data.roleId === "authorized";
	await sql`
      update shop_customers set
        role_id = ${data.roleId},
        pay_later = ${payLater},
        grant_shop = ${shop},
        grant_services = ${services},
        grant_invoice = ${payLater}
      where id = ${data.id}
    `;
	await audit(sql, actor, "Set customer role", s(rows[0], "email"), data.roleId);
	return { ok: true };
});
var INTERESTS = [
	"Managed IT",
	"Microsoft 365",
	"Phone Systems",
	"Internet Services",
	"Cloud Services",
	"Hardware"
];
var portalRegister_createServerFn_handler = createServerRpc({
	id: "ef51c3075a53a008f87aa89b4711bbe4b962b6e305c21dbef6aec357557c2f1e",
	name: "portalRegister",
	filename: "src/lib/portal/api.ts"
}, (opts) => portalRegister.__executeServer(opts));
var portalRegister = createServerFn({ method: "POST" }).validator((input) => {
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
}).handler(portalRegister_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if ((await sql`select id from shop_customers where email = ${data.email}`)[0]) throw new Error("An account with that email already exists. Sign in instead.");
	const domain = data.email.split("@")[1] || "";
	const shared = [
		"gmail.com",
		"yahoo.com",
		"outlook.com",
		"hotmail.com",
		"icloud.com"
	].includes(domain);
	let organizationId = null;
	if (!shared && domain) {
		const found = await sql`select id from organizations where lower(domain) = ${domain} limit 1`;
		if (found[0]) organizationId = n(found[0], "id");
	}
	if (!organizationId) organizationId = n((await sql`
        insert into organizations (name, domain, phone, industry, portal_access, ordering_enabled, notes)
        values (${data.business}, ${shared ? "" : domain}, ${data.phone}, ${data.interests.join(", ")}, true, false, 'Created from the customer portal. Shopping and invoicing stay off until an admin approves them.')
        returning id
      `)[0], "id");
	const code = String(Math.floor(1e5 + Math.random() * 9e5));
	await sql`
      insert into shop_customers (
        email, name, password_hash, phone, business_name, organization_id, role_id,
        email_verified, verify_code, verify_expires, interests, grant_shop, grant_services, grant_invoice, pay_later
      ) values (
        ${data.email}, ${data.name}, ${await hashShopPassword(data.password)}, ${data.phone}, ${data.business}, ${organizationId}, 'regular',
        false, ${code}, now() + interval '30 minutes', ${data.interests.join(", ")}, false, false, false, false
      )
    `;
	const mail = await resolveMail(sql);
	let mailed = false;
	if (mail.key && mail.from) mailed = (await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${mail.key}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			from: mail.from,
			to: [data.email],
			subject: "Verify your Manage Tech Service portal",
			text: `Your verification code is ${code}. It expires in 30 minutes. This account starts as support only. An admin approves shop, services, and invoicing.`
		})
	})).ok;
	return {
		email: data.email,
		mailed,
		demoCode: mailed ? "" : code
	};
});
var portalVerify_createServerFn_handler = createServerRpc({
	id: "45f98ce29f8c5a81ef97557158a44ab33945153681a2bcd317f544ea1876d5d4",
	name: "portalVerify",
	filename: "src/lib/portal/api.ts"
}, (opts) => portalVerify.__executeServer(opts));
var portalVerify = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const email = str(raw.email, 160).toLowerCase();
	const code = str(raw.code, 12);
	if (!email || !code) throw new Error("Enter the email and the code.");
	return {
		email,
		code
	};
}).handler(portalVerify_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = (await sql`select * from shop_customers where email = ${data.email}`)[0];
	const decision = verificationDecision({
		hasAccount: Boolean(row),
		storedCode: row ? s(row, "verify_code") : "",
		submittedCode: data.code,
		expiresAt: row ? s(row, "verify_expires") : "",
		attempts: row ? n(row, "verify_attempts") : 0
	});
	if (!decision.ok || !row) {
		if (row && decision.reason === "mismatch") await sql`update shop_customers set verify_attempts = verify_attempts + 1 where id = ${n(row, "id")}`;
		if (decision.reason === "locked") throw new Error("Too many attempts. Ask for a new code.");
		if (decision.reason === "expired") throw new Error("That code has expired.");
		throw new Error("That code is wrong.");
	}
	const token = await newShopToken();
	await sql`
      update shop_customers set
        email_verified = true,
        verify_code = '',
        verify_attempts = 0,
        session_token = ${token},
        session_expires = now() + interval '12 hours'
      where id = ${n(row, "id")} and verify_code = ${data.code}
    `;
	await upsertZendeskUser(sql, {
		name: s(row, "name"),
		email: data.email,
		kind: "shop"
	}).catch(() => "");
	return {
		token,
		email: data.email
	};
});
var listServiceCatalog_createServerFn_handler = createServerRpc({
	id: "d8c5d6a23fa55f4afab3270ccd551b0035ee0bf29a1dedfb5e1ba4a2a4ba039f",
	name: "listServiceCatalog",
	filename: "src/lib/portal/api.ts"
}, (opts) => listServiceCatalog.__executeServer(opts));
var listServiceCatalog = createServerFn({ method: "GET" }).handler(listServiceCatalog_createServerFn_handler, async () => {
	return (await (await getSql())`select id, category, name, summary, kind, benefits, scope from service_catalog where active = true order by category, name`).map((row) => ({
		id: n(row, "id"),
		category: s(row, "category"),
		name: s(row, "name"),
		summary: s(row, "summary"),
		kind: s(row, "kind"),
		benefits: s(row, "benefits"),
		scope: s(row, "scope")
	}));
});
var getService_createServerFn_handler = createServerRpc({
	id: "6de3fdc725c91247b6561b3442ec198fddd1c34421f12f136656704a45bc6809",
	name: "getService",
	filename: "src/lib/portal/api.ts"
}, (opts) => getService.__executeServer(opts));
var getService = createServerFn({ method: "GET" }).validator((id) => intish(id)).handler(getService_createServerFn_handler, async ({ data }) => {
	const row = (await (await getSql())`select id, category, name, summary, kind, benefits, scope from service_catalog where id = ${data} and active = true`)[0];
	if (!row) return null;
	return {
		id: n(row, "id"),
		category: s(row, "category"),
		name: s(row, "name"),
		summary: s(row, "summary"),
		kind: s(row, "kind"),
		benefits: s(row, "benefits"),
		scope: s(row, "scope")
	};
});
var listCampaigns_createServerFn_handler = createServerRpc({
	id: "3f60e2662d7932ee0461c87e59b043986cf6757ef091542c9f3ba7728beae611",
	name: "listCampaigns",
	filename: "src/lib/portal/api.ts"
}, (opts) => listCampaigns.__executeServer(opts));
var listCampaigns = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(listCampaigns_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { access } = data ? await requirePortal(sql, data) : { access: null };
	return (await sql`select * from campaigns where active = true order by id desc`).filter((row) => {
		const audience = s(row, "audience");
		if (audience === "shop") return Boolean(access?.canShop);
		if (audience === "business") return Boolean(access?.canOrderIt || access?.canOrderPhone);
		return true;
	}).map((row) => ({
		id: n(row, "id"),
		title: s(row, "title"),
		body: s(row, "body"),
		audience: s(row, "audience"),
		ctaLabel: s(row, "cta_label"),
		ctaHref: s(row, "cta_href")
	}));
});
var saveCampaign_createServerFn_handler = createServerRpc({
	id: "1a9f623f8b82f424a5ee457e79e56aec6cc2a3cb370615b917c00dc5381acf02",
	name: "saveCampaign",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveCampaign.__executeServer(opts));
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
}).handler(saveCampaign_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	await sql`
      insert into campaigns (title, body, audience, cta_label, cta_href)
      values (${data.title}, ${data.body}, ${data.audience}, ${data.ctaLabel}, ${data.ctaHref})
    `;
	await audit(sql, actor, "Published campaign", data.title, data.audience);
	return { ok: true };
});
var listMyComplaints_createServerFn_handler = createServerRpc({
	id: "51c36197aaad24d6d70e3ff7b74e8c2f27d065d0a27c7642eecac403824db25a",
	name: "listMyComplaints",
	filename: "src/lib/portal/api.ts"
}, (opts) => listMyComplaints.__executeServer(opts));
var listMyComplaints = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(listMyComplaints_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data);
	return (await sql`
      select * from complaints where shop_customer_id = ${n(row, "id")} order by id desc limit 30
    `).map((item) => ({
		id: n(item, "id"),
		kind: s(item, "kind"),
		subject: s(item, "subject"),
		body: s(item, "body"),
		status: s(item, "status"),
		ticketId: n(item, "ticket_id"),
		createdAt: s(item, "created_at")
	}));
});
var listCustomerNotices_createServerFn_handler = createServerRpc({
	id: "9c2488172386df5a665488576e0533748606742135cc82a02cbfaf3dfc6bb281",
	name: "listCustomerNotices",
	filename: "src/lib/portal/api.ts"
}, (opts) => listCustomerNotices.__executeServer(opts));
var listCustomerNotices = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(listCustomerNotices_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data);
	return (await sql`
      select * from customer_notices where shop_customer_id = ${n(row, "id")} order by id desc limit 40
    `).map((item) => ({
		id: n(item, "id"),
		title: s(item, "title"),
		body: s(item, "body"),
		href: s(item, "href"),
		read: Boolean(s(item, "read_at")),
		createdAt: s(item, "created_at")
	}));
});
var markCustomerNotice_createServerFn_handler = createServerRpc({
	id: "5aea27d5aa47f2a51e5074b057732de927026de4fc23ed2dc35d56b3d527574b",
	name: "markCustomerNotice",
	filename: "src/lib/portal/api.ts"
}, (opts) => markCustomerNotice.__executeServer(opts));
var markCustomerNotice = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	const id = intish(raw.id);
	if (!token || !id) throw new Error("Missing notice.");
	return {
		token,
		id
	};
}).handler(markCustomerNotice_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	await sql`
      update customer_notices set read_at = now()
      where id = ${data.id} and shop_customer_id = ${n(row, "id")} and read_at is null
    `;
	return { ok: true };
});
var respondToQuote_createServerFn_handler = createServerRpc({
	id: "ee937fb0ccf5d7691746545e15f16517fe62988e7edcef4e115c7738025fa757",
	name: "respondToQuote",
	filename: "src/lib/portal/api.ts"
}, (opts) => respondToQuote.__executeServer(opts));
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
}).handler(respondToQuote_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const request = (await sql`
      select * from service_requests where id = ${data.id} and shop_customer_id = ${n(row, "id")}
    `)[0];
	if (!request) throw new Error("That request is not on this account.");
	if (s(request, "status") !== "quoted") throw new Error("Only a quoted request can be accepted or rejected.");
	await sql`update service_requests set status = ${data.decision} where id = ${data.id}`;
	await notifyCustomer(sql, n(row, "id"), data.decision === "accepted" ? "Quote accepted" : "Quote declined", s(request, "service_name"), "/portal/quotes");
	return { status: data.decision };
});
var submitComplaint_createServerFn_handler = createServerRpc({
	id: "cf8428acf6adafd55c56df22a028cf5f57aeef70b59fae77b9226f786bacecea",
	name: "submitComplaint",
	filename: "src/lib/portal/api.ts"
}, (opts) => submitComplaint.__executeServer(opts));
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
}).handler(submitComplaint_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const ticket = await filePortalTicket(sql, {
		name: s(row, "name"),
		email: s(row, "email"),
		organizationId: nid(row, "organization_id"),
		subject: `Complaint: ${data.subject}`,
		category: data.kind,
		body: data.body
	});
	const inserted = await sql`
      insert into complaints (shop_customer_id, organization_id, kind, subject, body, status, ticket_id)
      values (${n(row, "id")}, ${nid(row, "organization_id")}, ${data.kind}, ${data.subject}, ${data.body}, 'open', ${ticket.ticketId})
      returning id
    `;
	await notifyCustomer(sql, n(row, "id"), "Complaint received", data.subject, "/portal/complaints").catch(() => void 0);
	return {
		id: n(inserted[0], "id"),
		ticketId: ticket.ticketId,
		zendeskId: ticket.zendeskId
	};
});
var replyPortalTicket_createServerFn_handler = createServerRpc({
	id: "3d7f01015833c17daf8a2b0316fd1b739e9112f411e9ae6599991404062cb349",
	name: "replyPortalTicket",
	filename: "src/lib/portal/api.ts"
}, (opts) => replyPortalTicket.__executeServer(opts));
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
}).handler(replyPortalTicket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const ticket = (await sql`
      select * from tickets where id = ${data.id} and lower(requester_email) = lower(${s(row, "email")})
    `)[0];
	if (!ticket) throw new Error("That ticket is not on this account.");
	await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${data.id}, ${s(row, "name") || "Customer"}, ${data.body}, true)
    `;
	const zendeskId = s(ticket, "zendesk_id");
	const settings = await readZendesk(sql);
	if (zendeskId && supportConnected(settings)) await zendesk(settings, `/tickets/${encodeURIComponent(zendeskId)}.json`, {
		method: "PUT",
		body: JSON.stringify({ ticket: { comment: {
			body: data.body,
			public: true
		} } })
	}).catch(() => void 0);
	return { ok: true };
});
var saveCustomerSignup_createServerFn_handler = createServerRpc({
	id: "7c2bfc7d3833b20a93517d3f4fefa3465d783cadcdec5572dbab0d92ca28ac92",
	name: "saveCustomerSignup",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveCustomerSignup.__executeServer(opts));
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
}).handler(saveCustomerSignup_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const user = (await sql`select name, email, "emailVerified" as verified from "user" where id = ${context.userId} limit 1`)[0];
	if (!user || !s(user, "email")) throw new Error("Sign in again.");
	const email = s(user, "email").toLowerCase();
	const name = s(user, "name") || email;
	const existing = await sql`select id, organization_id from shop_customers where email = ${email}`;
	let organizationId = existing[0] ? nid(existing[0], "organization_id") : null;
	const company = data.business || name;
	if (!organizationId) organizationId = n((await sql`
        insert into organizations (name, phone, address, portal_access, ordering_enabled, notes)
        values (${company}, ${data.phone}, ${data.address}, true, false, 'Registered as a customer.')
        returning id
      `)[0], "id");
	else if (data.business) await sql`update organizations set name = ${data.business}, phone = ${data.phone}, address = ${data.address} where id = ${organizationId}`;
	if (!existing[0]) await sql`
        insert into shop_customers (
          email, name, password_hash, phone, address, city, organization_id, business_name, interests,
          role_id, email_verified, grant_shop, grant_services, grant_invoice, pay_later
        ) values (
          ${email}, ${name}, ${await hashShopPassword(crypto.randomUUID())}, ${data.phone}, ${data.address}, ${data.city},
          ${organizationId}, ${data.business}, ${data.interests.join(", ")}, 'regular', ${b(user, "verified")},
          false, false, false, false
        )
      `;
	else await sql`
        update shop_customers set
          phone = ${data.phone},
          address = ${data.address},
          city = ${data.city},
          business_name = ${data.business},
          interests = ${data.interests.join(", ")},
          organization_id = ${organizationId}
        where email = ${email}
      `;
	return { ok: true };
});
var requestPortalService_createServerFn_handler = createServerRpc({
	id: "6d616b6177f9370fcbbfa995d8126aa9ca4beb37a314de8d56cb14b417fc2de7",
	name: "requestPortalService",
	filename: "src/lib/portal/api.ts"
}, (opts) => requestPortalService.__executeServer(opts));
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
}).handler(requestPortalService_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row, access } = await requirePortal(sql, data.token);
	const item = (await sql`select * from service_catalog where id = ${data.serviceId} and active = true`)[0];
	if (!item) throw new Error("That service is not in the catalog.");
	if (s(item, "kind") === "phone") {
		if (!access.canOrderPhone) throw new Error("Phone and internet ordering is not approved for this account.");
	} else if (!access.canOrderIt) throw new Error("IT service ordering is not approved for this account.");
	const inserted = await sql`
      insert into service_requests (shop_customer_id, organization_id, category, service_name, details, severity, status)
      values (${n(row, "id")}, ${nid(row, "organization_id")}, ${s(item, "category")}, ${s(item, "name")}, ${data.details}, ${data.severity}, 'requested')
      returning id
    `;
	await filePortalTicket(sql, {
		name: s(row, "name"),
		email: s(row, "email"),
		organizationId: nid(row, "organization_id"),
		subject: `Service request: ${s(item, "name")}`,
		category: s(item, "category"),
		body: `${s(row, "name")} asked for ${s(item, "name")} (${s(item, "category")}).\nSeverity: ${data.severity}\n${data.details}`
	}).catch(() => void 0);
	await notifyCustomer(sql, n(row, "id"), "Service request sent", s(item, "name"), "/portal/quotes").catch(() => void 0);
	return {
		id: n(inserted[0], "id"),
		status: "requested"
	};
});
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
var orderPortalOffering_createServerFn_handler = createServerRpc({
	id: "b1b3463343f831da61496ab0abe2f169c155d98606a8e082ef945610179b79f0",
	name: "orderPortalOffering",
	filename: "src/lib/portal/api.ts"
}, (opts) => orderPortalOffering.__executeServer(opts));
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
}).handler(orderPortalOffering_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data.token);
	const item = ORDER_OFFERINGS[data.offering];
	if (data.offering === "voip-ext" && !data.confirmMonthly) throw new Error("Confirm the $18 monthly extension before this can be sent to Telxent.");
	if (data.offering === "fax-efax" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail)) throw new Error("Enter the email address that should receive incoming faxes.");
	if ((data.offering === "network" || data.offering.startsWith("internet")) && !data.site) throw new Error("Enter the office address.");
	const monthly = data.offering === "voip-ext" ? 18 : 0;
	const wiringCents = data.offering === "wiring" ? data.drops * 17500 : 0;
	const details = [
		`Service: ${item.name}`,
		data.site ? `Site: ${data.site}` : "",
		data.offering === "fax-efax" ? `Incoming fax email: ${data.recipientEmail}` : "",
		data.offering === "voip-ext" ? "Customer confirmed $18 per month added to the Telxent VoIP bill." : "",
		data.offering === "voip-ext" ? "Telxent confirmation is still required before the extension is billed." : "",
		data.shipPhone ? "Ship a desk phone with this extension." : "",
		data.offering === "wiring" ? `Drops: ${data.drops}. Wiring is $175 per drop ($${(wiringCents / 100).toFixed(2)}).` : "",
		monthly ? `Monthly add-on: $${monthly}.` : "",
		data.notes
	].filter(Boolean).join("\n");
	const inserted = await sql`
      insert into service_requests (shop_customer_id, organization_id, category, service_name, details, severity, status)
      values (${n(row, "id")}, ${nid(row, "organization_id")}, ${item.category}, ${item.name}, ${details}, 'normal', 'requested')
      returning id
    `;
	const ticket = await filePortalTicket(sql, {
		name: s(row, "name"),
		email: s(row, "email"),
		organizationId: nid(row, "organization_id"),
		subject: `Order: ${item.name}`,
		category: item.category,
		body: details
	});
	await notifyCustomer(sql, n(row, "id"), "Order sent", item.name, "/portal/orders").catch(() => void 0);
	return {
		id: n(inserted[0], "id"),
		ticketId: ticket.ticketId
	};
});
var listPortalServices_createServerFn_handler = createServerRpc({
	id: "83f6eb4edddc59c53ff4ce85d434f999b6ff089fc143e91c50aa859970d31089",
	name: "listPortalServices",
	filename: "src/lib/portal/api.ts"
}, (opts) => listPortalServices.__executeServer(opts));
var listPortalServices = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(listPortalServices_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const { row } = await requirePortal(sql, data);
	return (await sql`
      select * from service_requests
      where shop_customer_id = ${n(row, "id")}
      order by created_at desc
    `).map((item) => ({
		id: n(item, "id"),
		category: s(item, "category"),
		serviceName: s(item, "service_name"),
		details: s(item, "details"),
		severity: s(item, "severity"),
		status: s(item, "status"),
		quoteNote: s(item, "quote_note"),
		customer: s(row, "name"),
		email: s(row, "email"),
		organization: "",
		createdAt: s(item, "created_at")
	}));
});
var listServiceDesk_createServerFn_handler = createServerRpc({
	id: "609c4c84a1c6c47e1747f027d7b2dd6e4e042fd2a281daac55e37a8e339fb9b6",
	name: "listServiceDesk",
	filename: "src/lib/portal/api.ts"
}, (opts) => listServiceDesk.__executeServer(opts));
var listServiceDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listServiceDesk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`
      select r.*, c.name as customer_name, c.email as customer_email, o.name as organization_name
      from service_requests r
      left join shop_customers c on c.id = r.shop_customer_id
      left join organizations o on o.id = r.organization_id
      order by r.created_at desc
      limit 100
    `).map((item) => ({
		id: n(item, "id"),
		category: s(item, "category"),
		serviceName: s(item, "service_name"),
		details: s(item, "details"),
		severity: s(item, "severity"),
		status: s(item, "status"),
		quoteNote: s(item, "quote_note"),
		customer: s(item, "customer_name"),
		email: s(item, "customer_email"),
		organization: s(item, "organization_name"),
		createdAt: s(item, "created_at")
	}));
});
var setServiceStatus_createServerFn_handler = createServerRpc({
	id: "86ff99aad4389fdd6baf46537c4b43b8ea1002f7643d4173bd7cc0c3678481ea",
	name: "setServiceStatus",
	filename: "src/lib/portal/api.ts"
}, (opts) => setServiceStatus.__executeServer(opts));
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
}).handler(setServiceStatus_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	await sql`update service_requests set status = ${data.status}, quote_note = ${data.quoteNote}, updated_at = now() where id = ${data.id}`;
	await audit(sql, actor, "Updated service request", String(data.id), data.status);
	return { ok: true };
});
var listPortalCustomers_createServerFn_handler = createServerRpc({
	id: "3508cbba2401c1c5c44d4aa7068c8c17df8a52fb379af9a4b3b2ccd410276928",
	name: "listPortalCustomers",
	filename: "src/lib/portal/api.ts"
}, (opts) => listPortalCustomers.__executeServer(opts));
var listPortalCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPortalCustomers_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`
      select c.id, c.name, c.email, c.business_name, c.phone, c.interests, c.email_verified,
        c.grant_shop, c.grant_services, c.grant_invoice, c.role_id, o.name as organization_name
      from shop_customers c
      left join organizations o on o.id = c.organization_id
      order by c.created_at desc
    `).map((row) => ({
		id: n(row, "id"),
		name: s(row, "name"),
		email: s(row, "email"),
		business: s(row, "business_name"),
		phone: s(row, "phone"),
		interests: s(row, "interests"),
		verified: b(row, "email_verified"),
		shop: b(row, "grant_shop"),
		services: b(row, "grant_services"),
		invoice: b(row, "grant_invoice"),
		roleId: s(row, "role_id") || "regular",
		organization: s(row, "organization_name")
	}));
});
var setPortalGrants_createServerFn_handler = createServerRpc({
	id: "975333af53d3e32135550ef42f500cdf2dc7103754b4eb7feac31a37d482d18e",
	name: "setPortalGrants",
	filename: "src/lib/portal/api.ts"
}, (opts) => setPortalGrants.__executeServer(opts));
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
}).handler(setPortalGrants_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const roleId = data.services || data.invoice ? "authorized" : data.shop ? "buyer" : "regular";
	await sql`
      update shop_customers set
        grant_shop = ${data.shop || data.services},
        grant_services = ${data.services},
        grant_invoice = ${data.invoice},
        pay_later = ${data.invoice},
        role_id = ${roleId}
      where id = ${data.id}
    `;
	await audit(sql, actor, "Updated customer access", String(data.id), `${roleId} shop:${data.shop} services:${data.services} invoice:${data.invoice}`);
	return { ok: true };
});
var listDeskAccounts_createServerFn_handler = createServerRpc({
	id: "325fed0546db7ebc0701af5dd01048e22449bf1085ad2fee9bbb8ba20a5406b2",
	name: "listDeskAccounts",
	filename: "src/lib/portal/api.ts"
}, (opts) => listDeskAccounts.__executeServer(opts));
var listDeskAccounts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDeskAccounts_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`
      select u.id, u.name, u.email, s.role as staff_role, s.active as staff_active
      from "user" u
      left join portal_staff s on s.user_id = u.id
      order by u.email
    `).map((row) => ({
		id: s(row, "id"),
		name: s(row, "name"),
		email: s(row, "email"),
		role: row.staff_active === false || !s(row, "staff_role") ? "customer" : s(row, "staff_role")
	}));
});
var setDeskRole_createServerFn_handler = createServerRpc({
	id: "ee0efd003670f71c9b646af7a590d18ac2fda0608bba17eeb24f503f24df1919",
	name: "setDeskRole",
	filename: "src/lib/portal/api.ts"
}, (opts) => setDeskRole.__executeServer(opts));
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
}).handler(setDeskRole_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const user = (await sql`select id, name, email from "user" where id = ${data.userId}`)[0];
	if (!user) throw new Error("That person has not registered yet.");
	const current = await sql`select role, active from portal_staff where user_id = ${data.userId}`;
	if (Boolean(current[0] && s(current[0], "role") === "owner" && b(current[0], "active")) && data.role !== "owner") {
		const owners = await sql`select count(*)::int as n from portal_staff where role = 'owner' and active = true`;
		if ((owners[0] ? n(owners[0], "n") : 0) <= 1) throw new Error("The last owner has to stay on the desk.");
	}
	if (data.role === "customer") {
		await sql`delete from portal_staff where user_id = ${data.userId}`;
		await audit(sql, actor, "Made customer", s(user, "email"), "Desk access removed.");
		return { ok: true };
	}
	await sql`
      insert into portal_staff (user_id, name, email, role, active)
      values (${data.userId}, ${s(user, "name")}, ${s(user, "email")}, ${data.role}, true)
      on conflict (user_id) do update set
        role = ${data.role},
        active = true,
        name = ${s(user, "name")},
        email = ${s(user, "email")}
    `;
	await audit(sql, actor, "Set desk role", s(user, "email"), data.role);
	return { ok: true };
});
var saveShopProfile_createServerFn_handler = createServerRpc({
	id: "2f84c8ccf973926d40b951049a6a795b28384fecc69bbc024dbd0625b2fa66d9",
	name: "saveShopProfile",
	filename: "src/lib/portal/api.ts"
}, (opts) => saveShopProfile.__executeServer(opts));
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
}).handler(saveShopProfile_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = await shopByToken(sql, data.token);
	if (!row) throw new Error("Sign in again.");
	if (!data.name) throw new Error("Enter your name.");
	await sql`
      update shop_customers set
        name = ${data.name},
        phone = ${data.phone},
        address = ${data.address},
        city = ${data.city},
        region = ${data.region},
        postal = ${data.postal},
        country = ${data.country}
      where id = ${n(row, "id")}
    `;
	return { ok: true };
});
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
var placeStorefrontOrder_createServerFn_handler = createServerRpc({
	id: "e83e5ac0f5c822bd05d3ae44dca014fb2cf4db09c717579c103ca29f85bb716c",
	name: "placeStorefrontOrder",
	filename: "src/lib/portal/api.ts"
}, (opts) => placeStorefrontOrder.__executeServer(opts));
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
}).handler(placeStorefrontOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const org = (await sql`select id from organizations where domain = 'shop.managetech.example' limit 1`)[0];
	if (!org) throw new Error("The online shop is not ready to take orders.");
	const signedIn = await shopByToken(sql, data.token);
	if (!signedIn || s(signedIn, "email") !== data.email) throw new Error("Sign in to the customer portal with the same email before placing an order.");
	const access = await accessFor(sql, signedIn);
	if (!access.canPurchase) throw new Error("This account cannot purchase products.");
	const payLater = data.paymentMethod === "pay_later";
	if (payLater && !(access.canDefer || b(signedIn, "pay_later"))) throw new Error("This account has to pay before the order is placed.");
	if (!payLater && !access.canPayNow) throw new Error("This account cannot pay immediately.");
	const method = payLater ? "pay_later" : "card";
	const skus = data.items.map((item) => item.sku);
	const products = await sql.query(`select * from products where available = true and sku in (${skus.map((_, index) => `$${index + 1}`).join(",")})`, skus);
	if (products.length !== new Set(skus).size) throw new Error("A product in your cart is no longer available.");
	const subtotal = data.items.reduce((sum, item) => {
		const product = products.find((row) => s(row, "sku") === item.sku);
		return sum + (product ? n(product, "price_cents") * item.quantity : 0);
	}, 0);
	const shipping = shippingChoice(data.shippingMethod, subtotal);
	let customerId = signedIn && s(signedIn, "email") === data.email ? n(signedIn, "id") : null;
	let token = "";
	if (!customerId && data.password.length >= 8) {
		if (!(await sql`select id from shop_customers where email = ${data.email}`)[0]) {
			token = await newShopToken();
			customerId = n((await sql`
          insert into shop_customers (email, name, password_hash, phone, address, city, region, postal, country, session_token)
          values (
            ${data.email}, ${data.name}, ${await hashShopPassword(data.password)}, ${data.phone},
            ${data.address}, ${data.city}, ${data.region}, ${data.postal}, ${data.country}, ${token}
          )
          returning id
        `)[0], "id");
			const shopOrgId = n(org, "id");
			await openWelcomeTicket(sql, {
				name: data.name,
				email: data.email,
				organizationId: shopOrgId,
				source: "Checkout account",
				detail: "Customer created an account while placing an order.",
				actorName: "Online shop"
			}).catch(() => void 0);
			await upsertZendeskUser(sql, {
				name: data.name,
				email: data.email,
				kind: "shop"
			}).then(async (zendeskUserId) => {
				if (zendeskUserId) await sql`update shop_customers set zendesk_user_id = ${zendeskUserId} where id = ${customerId}`;
			}).catch(() => void 0);
		}
	}
	if (!customerId) {
		const byEmail = await sql`select id from shop_customers where email = ${data.email}`;
		if (byEmail[0]) customerId = n(byEmail[0], "id");
	}
	const note = [data.company, data.notes].filter(Boolean).join(" · ");
	const id = n((await sql`
      insert into orders (
        organization_id, customer_user_id, shop_customer_id, status, notes, approval_note, payment_method,
        ship_name, ship_email, ship_phone, ship_address, ship_city, ship_region, ship_postal, ship_country,
        shipping_method, shipping_cents, shipment_status
      ) values (
        ${n(org, "id")}, null, ${customerId}, 'pending', ${note}, 'Placed from the online shop.', ${method},
        ${data.name}, ${data.email}, ${data.phone}, ${data.address}, ${data.city}, ${data.region}, ${data.postal}, ${data.country},
        ${shipping.method}, ${shipping.cents}, 'unfulfilled'
      )
      returning id
    `)[0], "id");
	const lines = data.items.map((item) => {
		const product = products.find((row) => s(row, "sku") === item.sku);
		return {
			description: product ? s(product, "name") : item.sku,
			amount: product ? n(product, "price_cents") / 100 : 0,
			quantity: item.quantity,
			product
		};
	});
	for (const line of lines) {
		if (!line.product) continue;
		await sql`
        insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents)
        values (${id}, ${n(line.product, "id")}, ${s(line.product, "name")}, ${s(line.product, "sku")}, ${line.quantity}, ${n(line.product, "price_cents")})
      `;
	}
	await filePortalTicket(sql, {
		name: data.name,
		email: data.email,
		organizationId: signedIn ? nid(signedIn, "organization_id") : n(org, "id"),
		subject: `Shop order MT-${1e3 + id}`,
		category: "Hardware & Software",
		body: `${data.name} placed ${data.items.map((item) => `${item.quantity} × ${item.sku}`).join(", ")} from the online shop.`
	}).catch(() => void 0);
	let paymentUrl = "";
	await sql`
      update orders set
        card_brand = '',
        card_last4 = '',
        card_exp = '',
        payment_status = ${payLater ? "pay_later" : unpaidCardStatus()}
      where id = ${id}
    `;
	if (method === "card") {
		const creds = await loadAlternativeCreds(sql);
		if (creds) try {
			const due = /* @__PURE__ */ new Date();
			due.setDate(due.getDate() + 30);
			const checkout = await createAlternativeCheckout(creds, {
				reference: `MT-${1e3 + id}`,
				returnUrl: ALTERNATIVE_PORTAL,
				externalId: `mts-shop-${data.email}`,
				name: data.name,
				email: data.email,
				existingCustomerId: "",
				dueDate: due.toISOString().slice(0, 10),
				lines: lines.map((line) => ({
					description: line.description,
					amount: line.amount,
					quantity: line.quantity
				}))
			});
			paymentUrl = checkout.url;
			await sql`
            update orders set payment_url = ${paymentUrl}, alternative_invoice_id = ${checkout.invoiceId},
              alternative_request_id = ${checkout.requestId}, payment_status = ${checkout.paymentStatus}
            where id = ${id}
          `;
		} catch {
			paymentUrl = ALTERNATIVE_PORTAL;
			await sql`update orders set payment_url = ${paymentUrl} where id = ${id}`;
		}
	}
	await sql`
      insert into audit_logs (actor_user_id, actor_name, action, target, detail)
      values ('', 'Online shop', 'Created order', ${`MT-${1e3 + id}`}, ${data.email})
    `;
	await settleNewOrder(sql, id, "Online shop");
	await notifyCustomer(sql, customerId, payLater ? "Order invoiced" : "Order received", `MT-${1e3 + id} is ${payLater ? "on invoice" : "waiting for payment"}.`, `/portal/orders/${id}`).catch(() => void 0);
	return {
		id,
		number: `MT-${1e3 + id}`,
		paymentUrl,
		token,
		totalCents: subtotal + shipping.cents
	};
});
//#endregion
export { createOrder_createServerFn_handler, deleteOrder_createServerFn_handler, getDashboard_createServerFn_handler, getIntegration_createServerFn_handler, getNotification_createServerFn_handler, getOrder_createServerFn_handler, getOrg_createServerFn_handler, getPayments_createServerFn_handler, getPeople_createServerFn_handler, getPortalSession_createServerFn_handler, getPortalTicket_createServerFn_handler, getSarahMetrics_createServerFn_handler, getService_createServerFn_handler, getSessionHome_createServerFn_handler, getSettings_createServerFn_handler, getShell_createServerFn_handler, getShopAccount_createServerFn_handler, getShopCheckout_createServerFn_handler, getStorefront_createServerFn_handler, getTicket_createServerFn_handler, importProducts_createServerFn_handler, linkOrderTicket_createServerFn_handler, listCampaigns_createServerFn_handler, listCustomerNotices_createServerFn_handler, listDeskAccounts_createServerFn_handler, listForms_createServerFn_handler, listMyComplaints_createServerFn_handler, listNotifications_createServerFn_handler, listOrders_createServerFn_handler, listOrgs_createServerFn_handler, listPolicies_createServerFn_handler, listPortalCustomers_createServerFn_handler, listPortalServices_createServerFn_handler, listProducts_createServerFn_handler, listServiceCatalog_createServerFn_handler, listServiceDesk_createServerFn_handler, listTickets_createServerFn_handler, markCustomerNotice_createServerFn_handler, openPortalFromAuth_createServerFn_handler, orderPortalOffering_createServerFn_handler, orderPortalService_createServerFn_handler, placeStorefrontOrder_createServerFn_handler, portalRegister_createServerFn_handler, portalVerify_createServerFn_handler, refreshAlternativeOrder_createServerFn_handler, refreshPortalTicket_createServerFn_handler, removeProduct_createServerFn_handler, replyPortalTicket_createServerFn_handler, replyTicket_createServerFn_handler, requestPortalService_createServerFn_handler, respondToQuote_createServerFn_handler, reviewRequest_createServerFn_handler, runDeskJobs_createServerFn_handler, saveCampaign_createServerFn_handler, saveCustomerSignup_createServerFn_handler, saveCustomer_createServerFn_handler, saveForm_createServerFn_handler, saveIntegration_createServerFn_handler, saveOrg_createServerFn_handler, savePayments_createServerFn_handler, savePolicy_createServerFn_handler, savePortalCompany_createServerFn_handler, saveProduct_createServerFn_handler, saveResend_createServerFn_handler, saveSettings_createServerFn_handler, saveShopProfile_createServerFn_handler, saveStaff_createServerFn_handler, sendTestEmail_createServerFn_handler, setDeskRole_createServerFn_handler, setPortalGrants_createServerFn_handler, setServiceStatus_createServerFn_handler, setShopPayLater_createServerFn_handler, setShopRole_createServerFn_handler, shopLogin_createServerFn_handler, shopLogout_createServerFn_handler, shopRegister_createServerFn_handler, submitComplaint_createServerFn_handler, submitPortalTicket_createServerFn_handler, syncPortalUsers_createServerFn_handler, syncZendesk_createServerFn_handler, testAlternative_createServerFn_handler, testForm_createServerFn_handler, testIntegration_createServerFn_handler, testPayments_createServerFn_handler, testResend_createServerFn_handler, trackAwb_createServerFn_handler, updateOrder_createServerFn_handler, updateTicket_createServerFn_handler };
