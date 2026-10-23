import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-D8wvluA6.mjs";
import { r as getSql } from "./db-CR8F9aB1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DDgGioSY.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
		createdAt: s(row, "created_at")
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
		items
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
		available: b(row, "available"),
		visibility: s(row, "visibility") || "all"
	};
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
		scope: s(row, "scope")
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
    ), 0) as total_cents
  from orders o
  join organizations org on org.id = o.organization_id
  left join customer_users cu on cu.id = o.customer_user_id
  left join tickets t on t.id = o.ticket_id
`;
async function loadActor(sql, userId) {
	const user = (await sql`select id, name, email from "user" where id = ${userId}`)[0];
	await sql`
    insert into portal_staff (user_id, name, email, role)
    values (${userId}, ${user ? s(user, "name") || "Staff" : "Staff"}, ${user ? s(user, "email") : ""}, 'agent')
    on conflict (user_id) do update set
      name = excluded.name,
      email = case when excluded.email <> '' then excluded.email else portal_staff.email end
  `;
	await sql`
    update portal_staff set role = 'owner'
    where user_id = ${userId}
      and role = 'agent'
      and not exists (
        select 1 from portal_staff other
        where other.role = 'owner' and other.user_id <> ${userId}
      )
  `;
	const row = (await sql`
    select staff.*, org.name as organization_name
    from portal_staff staff
    left join organizations org on org.id = staff.organization_id
    where staff.user_id = ${userId}
  `)[0];
	if (!row) throw new Error("Could not open a staff profile.");
	const actor = mapActor(row);
	if (!actor.active) throw new Error("This account is deactivated.");
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
async function readZendesk(sql) {
	const row = (await sql`select subdomain, email, api_token from integration_settings where id = 1`)[0];
	return {
		subdomain: row ? s(row, "subdomain") : "",
		email: row ? s(row, "email") : "",
		apiToken: row ? s(row, "api_token") : ""
	};
}
async function zendesk(settings, path, init) {
	if (!settings.subdomain || !settings.email || !settings.apiToken) throw new Error("Zendesk is not connected.");
	const response = await fetch(`https://${settings.subdomain}.zendesk.com/api/v2${path}`, {
		...init,
		headers: {
			Authorization: `Basic ${basicAuth(settings.email, settings.apiToken)}`,
			Accept: "application/json",
			"Content-Type": "application/json",
			...init?.headers ?? {}
		}
	});
	const text = await response.text();
	if (response.status === 429) throw new Error("Zendesk rate limit reached. Wait a moment and try again.");
	if (!response.ok) throw new Error(`Zendesk returned ${response.status}. ${text.replaceAll(settings.apiToken, "").slice(0, 180)}`);
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
function viewFromTags(tags) {
	if (tags.includes("need_invoice")) return "Need Invoice";
	if (tags.includes("pending_order")) return "Pending Orders";
	if (tags.includes("pending_project")) return "Pending Projects";
	return "";
}
async function pushTicketComment(sql, ticket, body, isPublic, status) {
	const settings = await readZendesk(sql);
	if (!settings.apiToken || !ticket.zendeskId) return "";
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
	const integration = await sql`select subdomain, api_token, last_status from integration_settings where id = 1`;
	const setting = settings[0];
	const link = integration[0];
	return {
		actor,
		brandName: setting ? s(setting, "brand_name") : "ManageTech",
		tagline: setting ? s(setting, "tagline") : "",
		zendeskConnected: Boolean(link && s(link, "api_token") && s(link, "subdomain")),
		zendeskStatus: link ? s(link, "last_status") : "not_connected"
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
	return fetchTicket(sql, await loadActor(sql, context.userId), data);
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
	await sql`
      update tickets set
        status = ${status},
        assignee = ${assignee},
        priority = ${data.priority || existing.ticket.priority},
        organization_id = ${organizationId},
        updated_at = now()
      where id = ${data.id}
    `;
	const settings = await readZendesk(sql);
	let warning = "";
	if (settings.apiToken && existing.ticket.zendeskId && status !== existing.ticket.status) try {
		await zendesk(settings, `/tickets/${encodeURIComponent(existing.ticket.zendeskId)}.json`, {
			method: "PUT",
			body: JSON.stringify({ ticket: { status } })
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
	const people = await sql.query(`select cu.*, coalesce(o.name, '') as organization_name
       from customer_users cu
       left join organizations o on o.id = cu.organization_id
       where ($1::int is null or cu.organization_id = $1)
       order by cu.name`, [actor.organizationId]);
	const requests = await sql.query(`select r.*, coalesce(o.name, '') as organization_name
       from user_requests r
       left join organizations o on o.id = r.organization_id
       where ($1::int is null or r.organization_id = $1)
       order by case when r.status = 'pending' then 0 else 1 end, r.created_at desc`, [actor.organizationId]);
	const policies = await sql`select * from role_policies order by id`;
	return {
		people: people.map(mapCustomer),
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
		return { id: data.id };
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
	return { id: n(inserted[0], "id") };
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
	if (data.decision === "approved") await sql`
        insert into customer_users (
          organization_id, name, email, title, permission_level, active
        ) values (
          ${organizationId}, ${s(request, "requested_name")}, ${s(request, "requested_email")},
          'Requested user', 'regular', true
        )
      `;
	await sql`update user_requests set status = ${data.decision} where id = ${data.id}`;
	await audit(sql, actor, data.decision === "approved" ? "Approved user" : "Denied user", s(request, "requested_email"), s(request, "organization_id"));
	return { ok: true };
});
var listProducts_createServerFn_handler = createServerRpc({
	id: "e11cfcd4ab1992da649de8b88723932e1f58799e9fe3b16826626dcbe17fd43c",
	name: "listProducts",
	filename: "src/lib/portal/api.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProducts_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadActor(sql, context.userId);
	return (await sql`select * from products order by category, name`).map(mapProduct);
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
	if (imageUrl.length > 18e4) throw new Error("Image is too large. Use a file under 120 KB.");
	const visibility = str(raw.visibility, 32) === "authorized" ? "authorized" : "all";
	return {
		id: intish(raw.id),
		sku,
		name,
		category: str(raw.category, 80),
		description: str(raw.description, 2e3),
		specs: str(raw.specs, 2e3),
		priceCents: price,
		imageUrl,
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
          image_url = ${data.imageUrl},
          available = ${data.available},
          visibility = ${data.visibility}
        where id = ${data.id}
      `;
		await audit(sql, actor, "Updated product", data.sku, data.available ? "Available" : "Hidden");
		return { id: data.id };
	}
	const inserted = await sql`
      insert into products (sku, name, category, description, specs, price_cents, image_url, available, visibility)
      values (
        ${data.sku}, ${data.name}, ${data.category}, ${data.description}, ${data.specs},
        ${data.priceCents}, ${data.imageUrl}, ${data.available}, ${data.visibility}
      )
      returning id
    `;
	await audit(sql, actor, "Added product", data.sku, data.name);
	return { id: n(inserted[0], "id") };
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
	const orgs = await orgNames(sql, actor);
	const people = await sql.query(`select id, name, organization_id, can_order, permission_level from customer_users
       where ($1::int is null or organization_id = $1) and active = true order by name`, [actor.organizationId]);
	const products = await sql`select id, name, sku, price_cents, available from products order by name`;
	return {
		order,
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
		}))
	};
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
	if (!items.length) throw new Error("Add at least one piece of equipment.");
	return {
		organizationId,
		customerUserId: intish(raw.customerUserId),
		notes: str(raw.notes, 2e3),
		items
	};
}).handler(createOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	assertOrg(actor, data.organizationId);
	const org = (await sql`select * from organizations where id = ${data.organizationId}`)[0];
	if (!org) throw new Error("Company not found.");
	if (!b(org, "ordering_enabled")) throw new Error("Equipment ordering is turned off for this company.");
	if (!b(org, "portal_access")) throw new Error("Portal access is off for this company.");
	if (data.customerUserId) {
		const person = (await sql`select * from customer_users where id = ${data.customerUserId}`)[0];
		if (!person || nid(person, "organization_id") !== data.organizationId) throw new Error("That person is not in this company.");
		if (!b(person, "can_order") && s(person, "permission_level") !== "authorized") throw new Error("This person is not allowed to order equipment.");
	}
	const productRows = await sql.query(`select * from products where id in (${data.items.map((_, index) => `$${index + 1}`).join(",")})`, data.items.map((item) => item.productId));
	if (productRows.length !== new Set(data.items.map((item) => item.productId)).size) throw new Error("One of those products is no longer in the catalog.");
	const unavailable = productRows.find((row) => !b(row, "available"));
	if (unavailable) throw new Error(`${s(unavailable, "name")} is not available.`);
	const status = b(org, "approval_required") ? "pending" : "approved";
	const id = n((await sql`
      insert into orders (organization_id, customer_user_id, status, notes, approval_note)
      values (
        ${data.organizationId},
        ${data.customerUserId},
        ${status},
        ${data.notes},
        ${status === "approved" ? "Approval is not required for this company." : ""}
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
	return { id };
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
	if (!id || ![
		"pending",
		"approved",
		"processing",
		"fulfilled",
		"cancelled"
	].includes(status)) throw new Error("Choose an order status.");
	return {
		id,
		status,
		approvalNote: str(raw.approvalNote, 2e3),
		processingNote: str(raw.processingNote, 2e3)
	};
}).handler(updateOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertWrite(actor);
	const order = await orderById(sql, data.id, actor);
	await sql`
      update orders set
        status = ${data.status},
        approval_note = ${data.approvalNote},
        processing_note = ${data.processingNote},
        updated_at = now()
      where id = ${data.id}
    `;
	await audit(sql, actor, "Updated order", order.number, data.status);
	return { ok: true };
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
	const subject = `Equipment order ${order.number}`;
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
	if (settings.apiToken) try {
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
	if (settings.apiToken) try {
		const remote = obj((await zendesk(settings, "/tickets.json", {
			method: "POST",
			body: JSON.stringify({ ticket: {
				subject,
				comment: { body: body || subject },
				tags: ["portal", form.category.toLowerCase()],
				status: "new"
			} })
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
		canManagePortal: flag(raw.canManagePortal)
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
        can_manage_portal = ${data.canManagePortal}
      where id = ${data.id}
    `;
	await audit(sql, actor, "Updated role", data.id, "Permission template saved.");
	return { ok: true };
});
var getIntegration_createServerFn_handler = createServerRpc({
	id: "af4de7546fdba97335a36bf244736651e02e56040a542e4d8626b1a6938c0137",
	name: "getIntegration",
	filename: "src/lib/portal/api.ts"
}, (opts) => getIntegration.__executeServer(opts));
var getIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getIntegration_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	const row = (await sql`select * from integration_settings where id = 1`)[0] ?? {};
	const orgs = await sql.query(`${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`, [actor.organizationId]);
	return {
		subdomain: s(row, "subdomain"),
		email: s(row, "email"),
		tokenSet: Boolean(s(row, "api_token")),
		lastSyncAt: s(row, "last_sync_at") || null,
		lastStatus: s(row, "last_status"),
		lastError: s(row, "last_error"),
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
		clearToken: flag(raw.clearToken)
	};
}).handler(saveIntegration_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const actor = await loadActor(sql, context.userId);
	assertAdmin(actor);
	const current = await readZendesk(sql);
	const token = data.clearToken ? "" : data.apiToken || current.apiToken;
	await sql`
      insert into integration_settings (id, subdomain, email, api_token, last_status, last_error)
      values (1, ${data.subdomain}, ${data.email}, ${token}, 'saved', '')
      on conflict (id) do update set
        subdomain = excluded.subdomain,
        email = excluded.email,
        api_token = excluded.api_token,
        last_status = 'saved',
        last_error = ''
    `;
	await audit(sql, actor, "Saved Zendesk", data.subdomain || "cleared", data.email);
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
	try {
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
	try {
		let payload;
		try {
			payload = await zendesk(settings, "/tickets.json?include=users,organizations&per_page=50&sort_by=updated_at&sort_order=desc");
		} catch {
			payload = await zendesk(settings, "/tickets.json?per_page=50&sort_by=updated_at&sort_order=desc");
		}
		const tickets = Array.isArray(payload.tickets) ? payload.tickets : [];
		const users = Array.isArray(payload.users) ? payload.users : [];
		const userName = /* @__PURE__ */ new Map();
		for (const user of users) {
			const row = obj(user);
			if (row.id == null) continue;
			userName.set(String(row.id), {
				name: typeof row.name === "string" ? row.name : "",
				email: typeof row.email === "string" ? row.email : ""
			});
		}
		const orgRows = await sql`select id, zendesk_org_id from organizations where zendesk_org_id <> ''`;
		const orgMap = new Map(orgRows.map((row) => [s(row, "zendesk_org_id"), n(row, "id")]));
		let imported = 0;
		for (const item of tickets) {
			const ticket = obj(item);
			if (ticket.id == null || typeof ticket.subject !== "string") continue;
			const zendeskId = String(ticket.id);
			const tags = Array.isArray(ticket.tags) ? ticket.tags.map((tag) => String(tag)) : [];
			const requester = ticket.requester_id != null ? userName.get(String(ticket.requester_id)) : void 0;
			const assignee = ticket.assignee_id != null ? userName.get(String(ticket.assignee_id)) : void 0;
			const organizationId = ticket.organization_id != null ? orgMap.get(String(ticket.organization_id)) ?? null : null;
			const status = typeof ticket.status === "string" ? ticket.status : "open";
			const priority = typeof ticket.priority === "string" && ticket.priority ? ticket.priority : "normal";
			const view = viewFromTags(tags);
			const saved = await sql`
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
        `;
			const description = typeof ticket.description === "string" ? ticket.description : "";
			const ticketId = n(saved[0], "id");
			if (description) {
				const existing = await sql`select count(*)::int as n from ticket_comments where ticket_id = ${ticketId}`;
				if ((existing[0] ? n(existing[0], "n") : 0) === 0) await sql`
              insert into ticket_comments (ticket_id, author_name, body, public_note)
              values (${ticketId}, ${requester?.name || "Requester"}, ${description}, true)
            `;
			}
			imported += 1;
		}
		await rememberZendesk(sql, "connected", "", true);
		await audit(sql, actor, "Synced Zendesk", settings.subdomain, `${imported} tickets`);
		return { imported };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Sync failed.";
		await rememberZendesk(sql, "error", message, false);
		throw new Error(message);
	}
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
	return {
		settings: {
			brandName: s(row, "brand_name") || "ManageTech",
			supportEmail: s(row, "support_email"),
			tagline: s(row, "tagline"),
			notifyNewTicket: row.notify_new_ticket == null ? true : b(row, "notify_new_ticket"),
			notifyNewOrder: row.notify_new_order == null ? true : b(row, "notify_new_order"),
			customerCatalogVisible: row.customer_catalog_visible == null ? true : b(row, "customer_catalog_visible")
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
//#endregion
export { createOrder_createServerFn_handler, getDashboard_createServerFn_handler, getIntegration_createServerFn_handler, getOrder_createServerFn_handler, getOrg_createServerFn_handler, getPeople_createServerFn_handler, getSettings_createServerFn_handler, getShell_createServerFn_handler, getTicket_createServerFn_handler, linkOrderTicket_createServerFn_handler, listForms_createServerFn_handler, listOrders_createServerFn_handler, listOrgs_createServerFn_handler, listPolicies_createServerFn_handler, listProducts_createServerFn_handler, listTickets_createServerFn_handler, removeProduct_createServerFn_handler, replyTicket_createServerFn_handler, reviewRequest_createServerFn_handler, saveCustomer_createServerFn_handler, saveForm_createServerFn_handler, saveIntegration_createServerFn_handler, saveOrg_createServerFn_handler, savePolicy_createServerFn_handler, saveProduct_createServerFn_handler, saveSettings_createServerFn_handler, saveStaff_createServerFn_handler, syncZendesk_createServerFn_handler, testForm_createServerFn_handler, testIntegration_createServerFn_handler, updateOrder_createServerFn_handler, updateTicket_createServerFn_handler };
