import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import type {
  Actor,
  Audit,
  Customer,
  Dashboard,
  Integration,
  Named,
  Order,
  OrderDraft,
  OrderItem,
  Org,
  OrgDetail,
  PeopleData,
  Policy,
  PortalSettings,
  Product,
  Role,
  ShellInfo,
  Staff,
  Ticket,
  TicketDetail,
  TicketFilter,
  TicketForm,
  TicketList,
  UserRequest,
} from "./types";

type Row = Record<string, unknown>;

function s(row: Row, key: string) {
  const value = row[key];
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function n(row: Row, key: string) {
  const value = row[key];
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return 0;
}

function b(row: Row, key: string) {
  const value = row[key];
  return value === true || value === "t" || value === "true" || value === 1;
}

function nid(row: Row, key: string): number | null {
  if (row[key] == null || row[key] === "") return null;
  const value = n(row, key);
  return Number.isFinite(value) ? value : null;
}

function tagsOf(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function asRole(value: string): Role {
  if (value === "owner" || value === "admin" || value === "agent" || value === "viewer") return value;
  return "agent";
}

function obj(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  return input as Record<string, unknown>;
}

function str(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function flag(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function intish(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Math.trunc(Number(value));
  }
  return null;
}

function mapActor(row: Row): Actor {
  const organizationName = s(row, "organization_name");
  return {
    userId: s(row, "user_id"),
    name: s(row, "name"),
    email: s(row, "email"),
    role: asRole(s(row, "role")),
    organizationId: nid(row, "organization_id"),
    organizationName: organizationName || null,
    active: b(row, "active"),
  };
}

function mapTicket(row: Row): Ticket {
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
    updatedAt: s(row, "updated_at"),
  };
}

function mapOrg(row: Row): Org {
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
    orderCount: n(row, "order_count"),
  };
}

function mapCustomer(row: Row): Customer {
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
  };
}

function mapOrder(row: Row, items: OrderItem[] = []): Order {
  const id = n(row, "id");
  return {
    id,
    number: `MT-${1000 + id}`,
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
    items,
  };
}

function mapItem(row: Row): OrderItem {
  return {
    id: n(row, "id"),
    productId: nid(row, "product_id"),
    productName: s(row, "product_name"),
    sku: s(row, "sku"),
    quantity: n(row, "quantity"),
    unitPriceCents: n(row, "unit_price_cents"),
  };
}

function mapProduct(row: Row): Product {
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
    visibility: s(row, "visibility") || "all",
  };
}

function mapForm(row: Row): TicketForm {
  return {
    id: n(row, "id"),
    name: s(row, "name"),
    category: s(row, "category"),
    subcategory: s(row, "subcategory"),
    zendeskField: s(row, "zendesk_field"),
    requiredFields: tagsOf(s(row, "required_fields")),
    restricted: b(row, "restricted"),
    active: b(row, "active"),
  };
}

function mapPolicy(row: Row): Policy {
  return {
    id: s(row, "id"),
    label: s(row, "label"),
    description: s(row, "description"),
    canOrder: b(row, "can_order"),
    canRequestUsers: b(row, "can_request_users"),
    canApproveOrders: b(row, "can_approve_orders"),
    canManagePortal: b(row, "can_manage_portal"),
    scope: s(row, "scope"),
  };
}

function mapAudit(row: Row): Audit {
  return {
    id: n(row, "id"),
    actorName: s(row, "actor_name"),
    action: s(row, "action"),
    target: s(row, "target"),
    detail: s(row, "detail"),
    createdAt: s(row, "created_at"),
  };
}

function mapStaff(row: Row): Staff {
  return {
    userId: s(row, "user_id"),
    name: s(row, "name"),
    email: s(row, "email"),
    role: asRole(s(row, "role")),
    organizationId: nid(row, "organization_id"),
    organizationName: s(row, "organization_name"),
    active: b(row, "active"),
  };
}

function mapRequest(row: Row): UserRequest {
  return {
    id: n(row, "id"),
    organizationId: nid(row, "organization_id"),
    organizationName: s(row, "organization_name"),
    requestedName: s(row, "requested_name"),
    requestedEmail: s(row, "requested_email"),
    requestedBy: s(row, "requested_by"),
    status: s(row, "status"),
    createdAt: s(row, "created_at"),
  };
}

const ORDER_SELECT = `
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

async function loadActor(sql: Sql, userId: string): Promise<Actor> {
  const users = await sql<Row>`select id, name, email from "user" where id = ${userId}`;
  const user = users[0];
  const name = user ? s(user, "name") || "Staff" : "Staff";
  const email = user ? s(user, "email") : "";
  await sql`
    insert into portal_staff (user_id, name, email, role)
    values (${userId}, ${name}, ${email}, 'agent')
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
  const rows = await sql<Row>`
    select staff.*, org.name as organization_name
    from portal_staff staff
    left join organizations org on org.id = staff.organization_id
    where staff.user_id = ${userId}
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not open a staff profile.");
  const actor = mapActor(row);
  if (!actor.active) throw new Error("This account is deactivated.");
  return actor;
}

function assertWrite(actor: Actor) {
  if (actor.role === "viewer") throw new Error("You have view-only access.");
}

function assertAdmin(actor: Actor) {
  assertWrite(actor);
  if (actor.role !== "owner" && actor.role !== "admin") {
    throw new Error("An admin has to make that change.");
  }
}

function assertOrg(actor: Actor, organizationId: number | null) {
  if (actor.organizationId != null && organizationId !== actor.organizationId) {
    throw new Error("That company is outside your access.");
  }
}

async function audit(sql: Sql, actor: Actor, action: string, target: string, detail: string) {
  await sql`
    insert into audit_logs (actor_user_id, actor_name, action, target, detail)
    values (${actor.userId}, ${actor.name}, ${action}, ${target}, ${detail})
  `;
}

async function orgNames(sql: Sql, actor: Actor): Promise<Named[]> {
  const rows =
    actor.organizationId == null
      ? await sql<Row>`select id, name from organizations order by name`
      : await sql<Row>`select id, name from organizations where id = ${actor.organizationId} order by name`;
  return rows.map((row) => ({ id: n(row, "id"), name: s(row, "name") }));
}

function cleanSubdomain(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\.zendesk\.com.*$/i, "")
    .replace(/\/.*$/, "")
    .slice(0, 80);
}

function basicAuth(email: string, apiToken: string) {
  const raw = `${email}/token:${apiToken}`;
  if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf8").toString("base64");
  return btoa(raw);
}

type ZSettings = { subdomain: string; email: string; apiToken: string; fromEnv: boolean };

function envZendesk(): ZSettings {
  const subdomain = cleanSubdomain(process.env.ZENDESK_SUBDOMAIN || process.env.ZENDESK_HOST || "");
  const email = (process.env.ZENDESK_EMAIL || process.env.ZENDESK_AGENT_EMAIL || "").trim();
  const apiToken = (process.env.ZENDESK_API_TOKEN || process.env.ZENDESK_TOKEN || process.env.ZENDESK_API_KEY || "").trim();
  return { subdomain, email, apiToken, fromEnv: Boolean(subdomain && email && apiToken) };
}

async function readZendesk(sql: Sql): Promise<ZSettings> {
  const envz = envZendesk();
  const rows = await sql<Row>`select subdomain, email, api_token from integration_settings where id = 1`;
  const row = rows[0];
  return {
    subdomain: envz.subdomain || (row ? cleanSubdomain(s(row, "subdomain")) : ""),
    email: envz.email || (row ? s(row, "email") : ""),
    apiToken: envz.apiToken || (row ? s(row, "api_token") : ""),
    fromEnv: envz.fromEnv,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function zendesk(settings: ZSettings, path: string, init?: RequestInit) {
  if (!settings.subdomain || !settings.email || !settings.apiToken) {
    throw new Error("Zendesk is not connected. Set ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, and ZENDESK_API_TOKEN.");
  }
  const url = path.startsWith("http") ? path : `https://${settings.subdomain}.zendesk.com/api/v2${path}`;
  const run = () =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Basic ${basicAuth(settings.email, settings.apiToken)}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  let response = await run();
  if (response.status === 429) {
    const wait = Math.min(Number(response.headers.get("retry-after") || "2") || 2, 8);
    await sleep(wait * 1000);
    response = await run();
  }
  const text = await response.text();
  if (response.status === 429) throw new Error("Zendesk rate limit reached. Wait a moment and try again.");
  if (!response.ok) {
    let detail = text.replaceAll(settings.apiToken, "").slice(0, 180);
    try {
      const parsed = JSON.parse(text) as { error?: unknown; description?: unknown };
      if (typeof parsed.description === "string") detail = parsed.description.slice(0, 180);
      else if (typeof parsed.error === "string") detail = parsed.error.slice(0, 180);
    } catch {
      /* keep the raw snippet */
    }
    throw new Error(`Zendesk returned ${response.status}. ${detail}`);
  }
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

async function rememberZendesk(sql: Sql, status: string, error: string, synced: boolean) {
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

function viewFromTags(tags: string[]) {
  if (tags.includes("need_invoice")) return "Need Invoice";
  if (tags.includes("pending_order")) return "Pending Orders";
  if (tags.includes("pending_project")) return "Pending Projects";
  return "";
}

function zdStatus(value: string) {
  if (value === "hold") return "pending";
  if (value === "new" || value === "open" || value === "pending" || value === "solved" || value === "closed") return value;
  return "open";
}

function indexUsers(payload: Record<string, unknown>) {
  const map = new Map<string, { name: string; email: string }>();
  const users = Array.isArray(payload.users) ? payload.users : [];
  for (const user of users) {
    const row = obj(user);
    if (row.id == null) continue;
    map.set(String(row.id), {
      name: typeof row.name === "string" ? row.name : "",
      email: typeof row.email === "string" ? row.email : "",
    });
  }
  return map;
}

async function linkOrganizations(sql: Sql, organizations: unknown[]) {
  for (const item of organizations) {
    const org = obj(item);
    if (org.id == null || typeof org.name !== "string" || !org.name.trim()) continue;
    const zendeskOrgId = String(org.id);
    const name = org.name.trim().slice(0, 160);
    const domain =
      Array.isArray(org.domain_names) && typeof org.domain_names[0] === "string" ? org.domain_names[0].slice(0, 160) : "";
    const existing = await sql<Row>`select id from organizations where zendesk_org_id = ${zendeskOrgId} limit 1`;
    if (existing[0]) continue;
    const byName = await sql<Row>`select id, zendesk_org_id from organizations where lower(name) = lower(${name}) limit 1`;
    if (byName[0]) {
      if (!s(byName[0], "zendesk_org_id")) {
        await sql`update organizations set zendesk_org_id = ${zendeskOrgId} where id = ${n(byName[0], "id")}`;
      }
      continue;
    }
    await sql`
      insert into organizations (name, domain, zendesk_org_id, notes)
      values (${name}, ${domain}, ${zendeskOrgId}, 'Imported from Zendesk.')
    `;
  }
}

async function linkRequesters(sql: Sql, users: Map<string, { name: string; email: string }>) {
  for (const [id, user] of users) {
    if (!user.email) continue;
    await sql`
      update customer_users
      set zendesk_user_id = ${id}
      where lower(email) = lower(${user.email}) and zendesk_user_id = ''
    `;
  }
}

async function saveRemoteComment(
  sql: Sql,
  ticketId: number,
  commentId: string,
  author: string,
  body: string,
  isPublic: boolean,
  createdAt: string,
) {
  const existing = await sql<Row>`
    select id, coalesce(zendesk_comment_id, '') as zendesk_comment_id
    from ticket_comments
    where zendesk_comment_id = ${commentId}
       or (ticket_id = ${ticketId} and zendesk_comment_id is null and body = ${body})
    limit 1
  `;
  const row = existing[0];
  if (row) {
    if (!s(row, "zendesk_comment_id")) {
      await sql`update ticket_comments set zendesk_comment_id = ${commentId} where id = ${n(row, "id")}`;
    }
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

async function pullComments(
  sql: Sql,
  settings: ZSettings,
  ticketId: number,
  zendeskId: string,
  knownUsers?: Map<string, { name: string; email: string }>,
) {
  const payload = await zendesk(settings, `/tickets/${encodeURIComponent(zendeskId)}/comments.json?include=users&sort_order=asc`);
  const users = indexUsers(payload);
  if (knownUsers) for (const [id, user] of knownUsers) users.set(id, user);
  const comments = Array.isArray(payload.comments) ? payload.comments : [];
  for (const item of comments) {
    const comment = obj(item);
    if (comment.id == null || typeof comment.body !== "string" || !comment.body.trim()) continue;
    const author = comment.author_id != null ? users.get(String(comment.author_id)) : undefined;
    await saveRemoteComment(
      sql,
      ticketId,
      String(comment.id),
      author?.name || "Requester",
      comment.body.slice(0, 8000),
      comment.public !== false,
      typeof comment.created_at === "string" ? comment.created_at : "",
    );
  }
}

async function refreshRemoteTicket(sql: Sql, ticket: Ticket) {
  const settings = await readZendesk(sql);
  if (!settings.apiToken || !ticket.zendeskId) return;
  const payload = await zendesk(settings, `/tickets/${encodeURIComponent(ticket.zendeskId)}.json?include=users`);
  const remote = obj(payload.ticket);
  if (typeof remote.subject !== "string") return;
  const users = indexUsers(payload);
  const requester = remote.requester_id != null ? users.get(String(remote.requester_id)) : undefined;
  const assignee = remote.assignee_id != null ? users.get(String(remote.assignee_id)) : undefined;
  const tags = Array.isArray(remote.tags) ? remote.tags.map((tag) => String(tag)) : ticket.tags;
  const orgRows = await sql<Row>`select id, zendesk_org_id from organizations where zendesk_org_id <> ''`;
  const orgMap = new Map(orgRows.map((row) => [s(row, "zendesk_org_id"), n(row, "id")]));
  const organizationId =
    remote.organization_id != null ? (orgMap.get(String(remote.organization_id)) ?? ticket.organizationId) : ticket.organizationId;
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

let zendeskSync: Promise<number> | null = null;
let zendeskSyncAt = 0;

async function importFromZendesk(sql: Sql, actor: Actor, settings: ZSettings) {
  let payload: Record<string, unknown>;
  try {
    payload = await zendesk(
      settings,
      "/tickets.json?include=users,organizations&per_page=100&sort_by=updated_at&sort_order=desc",
    );
  } catch {
    payload = await zendesk(settings, "/tickets.json?per_page=100&sort_by=updated_at&sort_order=desc");
  }
  const tickets: unknown[] = [];
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
  const orgRows = await sql<Row>`select id, zendesk_org_id from organizations where zendesk_org_id <> ''`;
  const orgMap = new Map(orgRows.map((row) => [s(row, "zendesk_org_id"), n(row, "id")]));
  let imported = 0;
  const fresh: { id: number; zendeskId: string }[] = [];
  for (const item of tickets) {
    const ticket = obj(item);
    if (ticket.id == null || typeof ticket.subject !== "string") continue;
    const zendeskId = String(ticket.id);
    const tags = Array.isArray(ticket.tags) ? ticket.tags.map((tag) => String(tag)) : [];
    const requester = ticket.requester_id != null ? users.get(String(ticket.requester_id)) : undefined;
    const assignee = ticket.assignee_id != null ? users.get(String(ticket.assignee_id)) : undefined;
    const organizationId = ticket.organization_id != null ? (orgMap.get(String(ticket.organization_id)) ?? null) : null;
    const status = zdStatus(typeof ticket.status === "string" ? ticket.status : "open");
    const priority = typeof ticket.priority === "string" && ticket.priority ? ticket.priority : "normal";
    const view = viewFromTags(tags);
    const saved = await sql<Row>`
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
    const ticketId = n(saved[0], "id");
    const existing = await sql<Row>`select count(*)::int as n from ticket_comments where ticket_id = ${ticketId}`;
    if ((existing[0] ? n(existing[0], "n") : 0) === 0) fresh.push({ id: ticketId, zendeskId });
    imported += 1;
  }
  for (const ticket of fresh.slice(0, 25)) {
    try {
      await pullComments(sql, settings, ticket.id, ticket.zendeskId, users);
    } catch {
      /* a single comment page should not fail the import */
    }
  }
  await rememberZendesk(sql, "connected", "", true);
  await audit(sql, actor, "Synced Zendesk", settings.subdomain, `${imported} tickets`);
  return imported;
}

async function ensureZendeskSync(sql: Sql, actor: Actor) {
  const settings = await readZendesk(sql);
  if (!settings.subdomain || !settings.email || !settings.apiToken) return;
  if (Date.now() - zendeskSyncAt < 120_000) return;
  zendeskSyncAt = Date.now();
  if (!zendeskSync) {
    zendeskSync = importFromZendesk(sql, actor, settings).finally(() => {
      zendeskSync = null;
    });
  }
  try {
    await zendeskSync;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    await rememberZendesk(sql, "error", message, false);
  }
}

async function pushTicketComment(
  sql: Sql,
  ticket: Ticket,
  body: string,
  isPublic: boolean,
  status: string,
) {
  const settings = await readZendesk(sql);
  if (!settings.apiToken || !ticket.zendeskId) return "";
  try {
    await zendesk(settings, `/tickets/${encodeURIComponent(ticket.zendeskId)}.json`, {
      method: "PUT",
      body: JSON.stringify({
        ticket: {
          status: status === "new" ? "open" : status,
          comment: { body, public: isPublic },
        },
      }),
    });
    return "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Zendesk update failed.";
    await rememberZendesk(sql, "error", message, false);
    return message;
  }
}

export const getShell = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ShellInfo> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const settings = await sql<Row>`select brand_name, tagline from portal_settings where id = 1`;
    const live = await readZendesk(sql);
    const integration = await sql<Row>`select last_status from integration_settings where id = 1`;
    const setting = settings[0];
    const link = integration[0];
    return {
      actor,
      brandName: setting ? s(setting, "brand_name") : "Manage Tech Service",
      tagline: setting ? s(setting, "tagline") : "",
      zendeskConnected: Boolean(live.subdomain && live.email && live.apiToken),
      zendeskStatus: link ? s(link, "last_status") : live.apiToken ? "ready" : "not_connected",
    };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Dashboard> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    await ensureZendeskSync(sql, actor);
    const scope = actor.organizationId;
    const counts = await sql<Row>`
      select
        count(*) filter (where status = 'new') as incoming,
        count(*) filter (where status = 'open') as open_count,
        count(*) filter (where status = 'pending') as pending_count,
        count(*) filter (where status in ('solved', 'closed')) as solved_count,
        count(*) filter (where view_label = 'Need Invoice' and status in ('new', 'open', 'pending')) as invoice_count
      from tickets
      where (${scope}::int is null or organization_id = ${scope})
    `;
    const orgs = await sql<Row>`
      select count(*)::int as n from organizations
      where (${scope}::int is null or id = ${scope})
    `;
    const people = await sql<Row>`
      select count(*)::int as n from customer_users
      where (${scope}::int is null or organization_id = ${scope})
    `;
    const recentTickets = await sql<Row>`
      select t.*, coalesce(o.name, '') as organization_name
      from tickets t
      left join organizations o on o.id = t.organization_id
      where (${scope}::int is null or t.organization_id = ${scope})
      order by t.updated_at desc
      limit 6
    `;
    const pendingOrders = await sql.query<Row>(
      `${ORDER_SELECT}
       where o.status in ('pending', 'approved', 'processing')
         and ($1::int is null or o.organization_id = $1)
       order by o.updated_at desc
       limit 5`,
      [scope],
    );
    const recentOrders = await sql.query<Row>(
      `${ORDER_SELECT}
       where ($1::int is null or o.organization_id = $1)
       order by o.updated_at desc
       limit 5`,
      [scope],
    );
    const activity = scope == null
      ? await sql<Row>`select * from audit_logs order by created_at desc limit 8`
      : await sql<Row>`
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
        solved: n(count, "solved_count"),
      },
      invoiceCount: n(count, "invoice_count"),
      recentTickets: recentTickets.map(mapTicket),
      pendingOrders: pendingOrders.map((row) => mapOrder(row)),
      recentOrders: recentOrders.map((row) => mapOrder(row)),
      activity: activity.map(mapAudit),
    };
  });

function ticketFilter(input: unknown): TicketFilter {
  const raw = obj(input);
  return {
    q: str(raw.q, 120),
    status: str(raw.status, 32) || "unresolved",
    orgId: intish(raw.orgId),
    category: str(raw.category, 80),
    assignee: str(raw.assignee, 120),
    view: str(raw.view, 80),
  };
}

export const listTickets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(ticketFilter)
  .handler(async ({ context, data }): Promise<TicketList> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    await ensureZendeskSync(sql, actor);
    if (data.orgId) assertOrg(actor, data.orgId);
    const clauses = ["true"];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown) => {
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
      clauses.push(
        `(t.subject ilike ${like} or coalesce(t.zendesk_id, '') ilike ${like} or cast(t.id as text) = ${exact})`,
      );
    }
    const tickets = await sql.query<Row>(
      `select t.*, coalesce(o.name, '') as organization_name
       from tickets t
       left join organizations o on o.id = t.organization_id
       where ${clauses.join(" and ")}
       order by t.updated_at desc
       limit 200`,
      params,
    );
    const categories = await sql.query<Row>(
      `select distinct category from tickets
       where category <> '' and ($1::int is null or organization_id = $1)
       order by category`,
      [actor.organizationId],
    );
    const assignees = await sql.query<Row>(
      `select distinct assignee from tickets
       where assignee <> '' and ($1::int is null or organization_id = $1)
       order by assignee`,
      [actor.organizationId],
    );
    return {
      tickets: tickets.map(mapTicket),
      orgs: await orgNames(sql, actor),
      categories: categories.map((row) => s(row, "category")),
      assignees: assignees.map((row) => s(row, "assignee")),
    };
  });

async function fetchTicket(sql: Sql, actor: Actor, id: number): Promise<TicketDetail> {
  const rows = await sql<Row>`
    select t.*, coalesce(o.name, '') as organization_name
    from tickets t
    left join organizations o on o.id = t.organization_id
    where t.id = ${id}
  `;
  const row = rows[0];
  if (!row) throw new Error("Ticket not found.");
  const ticket = mapTicket(row);
  assertOrg(actor, ticket.organizationId);
  const comments = await sql<Row>`
    select * from ticket_comments where ticket_id = ${id} order by created_at asc, id asc
  `;
  const assignees = await sql.query<Row>(
    `select distinct name from (
       select assignee as name from tickets where assignee <> '' and ($1::int is null or organization_id = $1)
       union
       select name from portal_staff where active = true
     ) people
     order by name`,
    [actor.organizationId],
  );
  return {
    ticket,
    comments: comments.map((comment) => ({
      id: n(comment, "id"),
      authorName: s(comment, "author_name"),
      body: s(comment, "body"),
      publicNote: b(comment, "public_note"),
      createdAt: s(comment, "created_at"),
    })),
    assignees: assignees.map((item) => s(item, "name")).filter(Boolean),
  };
}

export const getTicket = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing ticket.");
    return value;
  })
  .handler(async ({ context, data }): Promise<TicketDetail> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const detail = await fetchTicket(sql, actor, data);
    if (detail.ticket.zendeskId) {
      try {
        await refreshRemoteTicket(sql, detail.ticket);
        return fetchTicket(sql, actor, data);
      } catch {
        return detail;
      }
    }
    return detail;
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const ticketId = intish(raw.ticketId);
    const body = str(raw.body, 4000);
    if (!ticketId || !body) throw new Error("Write a reply before sending.");
    return { ticketId, body, publicNote: flag(raw.publicNote, true) };
  })
  .handler(async ({ context, data }) => {
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
    await audit(
      sql,
      actor,
      data.publicNote ? "Public reply" : "Internal note",
      detail.ticket.zendeskId || String(detail.ticket.id),
      warning ? `${data.body.slice(0, 140)} Zendesk: ${warning}` : data.body.slice(0, 180),
    );
    return { warning };
  });

export const updateTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const id = intish(raw.id);
    if (!id) throw new Error("Missing ticket.");
    const status = str(raw.status, 32);
    const allowed = ["new", "open", "pending", "solved", "closed"];
    if (status && !allowed.includes(status)) throw new Error("Unknown status.");
    return {
      id,
      status,
      assignee: str(raw.assignee, 120),
      priority: str(raw.priority, 32),
      organizationId: raw.organizationId === undefined ? undefined : intish(raw.organizationId),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const existing = await fetchTicket(sql, actor, data.id);
    const organizationId =
      data.organizationId === undefined ? existing.ticket.organizationId : data.organizationId;
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
    if (settings.apiToken && existing.ticket.zendeskId) {
      try {
        const ticketBody: Record<string, unknown> = {};
        if (status !== existing.ticket.status) ticketBody.status = status === "new" ? "open" : status;
        if (priority && priority !== existing.ticket.priority) ticketBody.priority = priority;
        if (assignee !== existing.ticket.assignee) {
          if (!assignee) {
            ticketBody.assignee_id = null;
          } else {
            const found = await zendesk(settings, `/users/search.json?query=${encodeURIComponent(assignee)}`);
            const people = Array.isArray(found.users) ? found.users : [];
            const match = people
              .map((person) => obj(person))
              .find((person) => typeof person.name === "string" && person.name.toLowerCase() === assignee.toLowerCase());
            const chosen = match ?? (people[0] ? obj(people[0]) : null);
            if (chosen?.id != null) ticketBody.assignee_id = chosen.id;
          }
        }
        if (Object.keys(ticketBody).length) {
          await zendesk(settings, `/tickets/${encodeURIComponent(existing.ticket.zendeskId)}.json`, {
            method: "PUT",
            body: JSON.stringify({ ticket: ticketBody }),
          });
        }
      } catch (error) {
        warning = error instanceof Error ? error.message : "Zendesk status update failed.";
        await rememberZendesk(sql, "error", warning, false);
      }
    }
    await audit(
      sql,
      actor,
      "Updated ticket",
      existing.ticket.zendeskId || String(data.id),
      `Status ${status}. Assignee ${assignee || "unassigned"}.`,
    );
    return { warning };
  });

const ORG_SELECT = `
  select o.*,
    (select count(*)::int from customer_users cu where cu.organization_id = o.id) as user_count,
    (select count(*)::int from tickets t where t.organization_id = o.id and t.status in ('new','open','pending')) as open_tickets,
    (select count(*)::int from orders ord where ord.organization_id = o.id) as order_count
  from organizations o
`;

export const listOrgs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Org[]> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const rows = await sql.query<Row>(
      `${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`,
      [actor.organizationId],
    );
    return rows.map(mapOrg);
  });

export const getOrg = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing company.");
    return value;
  })
  .handler(async ({ context, data }): Promise<OrgDetail> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertOrg(actor, data);
    const rows = await sql.query<Row>(`${ORG_SELECT} where o.id = $1`, [data]);
    const row = rows[0];
    if (!row) throw new Error("Company not found.");
    const people = await sql<Row>`
      select cu.*, o.name as organization_name
      from customer_users cu
      left join organizations o on o.id = cu.organization_id
      where cu.organization_id = ${data}
      order by cu.name
    `;
    const tickets = await sql<Row>`
      select t.*, o.name as organization_name
      from tickets t
      left join organizations o on o.id = t.organization_id
      where t.organization_id = ${data}
      order by t.updated_at desc
      limit 12
    `;
    const orders = await sql.query<Row>(
      `${ORDER_SELECT} where o.organization_id = $1 order by o.updated_at desc limit 12`,
      [data],
    );
    return {
      org: mapOrg(row),
      people: people.map(mapCustomer),
      tickets: tickets.map(mapTicket),
      orders: orders.map((item) => mapOrder(item)),
    };
  });

export const saveOrg = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
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
      notes: str(raw.notes, 2000),
      portalAccess: flag(raw.portalAccess, true),
      orderingEnabled: flag(raw.orderingEnabled, true),
      userRequestsEnabled: flag(raw.userRequestsEnabled, true),
      approvalRequired: flag(raw.approvalRequired, true),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    if (data.id) assertOrg(actor, data.id);
    else if (actor.organizationId != null) {
      throw new Error("You can only edit your assigned company.");
    }
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
    const inserted = await sql<Row>`
      insert into organizations (
        name, domain, industry, phone, address, zendesk_org_id, notes,
        portal_access, ordering_enabled, user_requests_enabled, approval_required
      ) values (
        ${data.name}, ${data.domain}, ${data.industry}, ${data.phone}, ${data.address},
        ${data.zendeskOrgId}, ${data.notes}, ${data.portalAccess}, ${data.orderingEnabled},
        ${data.userRequestsEnabled}, ${data.approvalRequired}
      )
      returning id
    `;
    const id = n(inserted[0], "id");
    await audit(sql, actor, "Added company", data.name, data.domain);
    return { id };
  });

export const getPeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PeopleData> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const people = await sql.query<Row>(
      `select cu.*, coalesce(o.name, '') as organization_name
       from customer_users cu
       left join organizations o on o.id = cu.organization_id
       where ($1::int is null or cu.organization_id = $1)
       order by cu.name`,
      [actor.organizationId],
    );
    const requests = await sql.query<Row>(
      `select r.*, coalesce(o.name, '') as organization_name
       from user_requests r
       left join organizations o on o.id = r.organization_id
       where ($1::int is null or r.organization_id = $1)
       order by case when r.status = 'pending' then 0 else 1 end, r.created_at desc`,
      [actor.organizationId],
    );
    const policies = await sql<Row>`select * from role_policies order by id`;
    return {
      people: people.map(mapCustomer),
      requests: requests.map(mapRequest),
      orgs: await orgNames(sql, actor),
      policies: policies.map(mapPolicy),
    };
  });

export const saveCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
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
      zendeskUserId: str(raw.zendeskUserId, 40),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    assertOrg(actor, data.organizationId);
    if (data.id) {
      const existing = await sql<Row>`select organization_id from customer_users where id = ${data.id}`;
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
    const inserted = await sql<Row>`
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

export const reviewRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const id = intish(raw.id);
    const decision = str(raw.decision, 16);
    if (!id || (decision !== "approved" && decision !== "denied")) throw new Error("Choose a decision.");
    return { id, decision };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const rows = await sql<Row>`select * from user_requests where id = ${data.id}`;
    const request = rows[0];
    if (!request) throw new Error("Request not found.");
    if (s(request, "status") !== "pending") throw new Error("That request is already reviewed.");
    const organizationId = nid(request, "organization_id");
    assertOrg(actor, organizationId);
    if (data.decision === "approved") {
      await sql`
        insert into customer_users (
          organization_id, name, email, title, permission_level, active
        ) values (
          ${organizationId}, ${s(request, "requested_name")}, ${s(request, "requested_email")},
          'Requested user', 'regular', true
        )
      `;
    }
    await sql`update user_requests set status = ${data.decision} where id = ${data.id}`;
    await audit(sql, actor, data.decision === "approved" ? "Approved user" : "Denied user", s(request, "requested_email"), s(request, "organization_id"));
    return { ok: true };
  });

export const listProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Product[]> => {
    const sql = await getSql();
    await loadActor(sql, context.userId);
    const rows = await sql<Row>`select * from products order by category, name`;
    return rows.map(mapProduct);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const name = str(raw.name, 160);
    const sku = str(raw.sku, 40);
    if (!name || !sku) throw new Error("Name and SKU are required.");
    const price = intish(raw.priceCents);
    if (price == null || price < 0) throw new Error("Enter a price.");
    const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : "";
    if (imageUrl.length > 900000) throw new Error("Image is too large. Use a photo under 8 MB.");
    const visibility = str(raw.visibility, 32) === "authorized" ? "authorized" : "all";
    return {
      id: intish(raw.id),
      sku,
      name,
      category: str(raw.category, 80),
      description: str(raw.description, 2000),
      specs: str(raw.specs, 2000),
      priceCents: price,
      imageUrl,
      available: flag(raw.available, true),
      visibility,
    };
  })
  .handler(async ({ context, data }) => {
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
    const inserted = await sql<Row>`
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

export const removeProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing product.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const used = await sql<Row>`select count(*)::int as n from order_items where product_id = ${data}`;
    const count = used[0] ? n(used[0], "n") : 0;
    if (count > 0) {
      await sql`update products set available = false where id = ${data}`;
      await audit(sql, actor, "Retired product", String(data), "Kept for order history and marked unavailable.");
      return { archived: true };
    }
    await sql`delete from products where id = ${data}`;
    await audit(sql, actor, "Removed product", String(data), "");
    return { archived: false };
  });

export const importProducts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const rows = Array.isArray(raw.rows) ? raw.rows : [];
    if (!rows.length) throw new Error("That spreadsheet has no products.");
    if (rows.length > 200) throw new Error("Import up to 200 products at a time.");
    return {
      rows: rows.map((item) => {
        const row = obj(item);
        const image = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
        const imageUrl = image.startsWith("https://") || image.startsWith("http://") || image.startsWith("/") ? image.slice(0, 500) : "";
        const price = intish(row.priceCents);
        return {
          sku: str(row.sku, 40),
          name: str(row.name, 160),
          category: str(row.category, 80) || "Accessories",
          description: str(row.description, 2000),
          specs: str(row.specs, 2000),
          priceCents: price != null && price >= 0 ? price : -1,
          imageUrl,
          available: flag(row.available, true),
          visibility: str(row.visibility, 32) === "authorized" ? "authorized" : "all",
        };
      }),
    };
  })
  .handler(async ({ context, data }) => {
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
      const existing = await sql<Row>`select id from products where lower(sku) = lower(${row.sku}) order by id limit 1`;
      const current = existing[0];
      if (current) {
        const id = n(current, "id");
        if (row.imageUrl) {
          await sql`
            update products set
              sku = ${row.sku}, name = ${row.name}, category = ${row.category},
              description = ${row.description}, specs = ${row.specs}, price_cents = ${row.priceCents},
              image_url = ${row.imageUrl}, available = ${row.available}, visibility = ${row.visibility}
            where id = ${id}
          `;
        } else {
          await sql`
            update products set
              sku = ${row.sku}, name = ${row.name}, category = ${row.category},
              description = ${row.description}, specs = ${row.specs}, price_cents = ${row.priceCents},
              available = ${row.available}, visibility = ${row.visibility}
            where id = ${id}
          `;
        }
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
    return { created, updated, skipped };
  });

async function orderById(sql: Sql, id: number, actor: Actor): Promise<Order> {
  const rows = await sql.query<Row>(`${ORDER_SELECT} where o.id = $1`, [id]);
  const row = rows[0];
  if (!row) throw new Error("Order not found.");
  assertOrg(actor, n(row, "organization_id"));
  const items = await sql<Row>`select * from order_items where order_id = ${id} order by id`;
  return mapOrder(row, items.map(mapItem));
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Order[]> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const rows = await sql.query<Row>(
      `${ORDER_SELECT} where ($1::int is null or o.organization_id = $1) order by o.updated_at desc`,
      [actor.organizationId],
    );
    return rows.map((row) => mapOrder(row));
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing order.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const order = await orderById(sql, data, actor);
    const orgs = await orgNames(sql, actor);
    const people = await sql.query<Row>(
      `select id, name, organization_id, can_order, permission_level from customer_users
       where ($1::int is null or organization_id = $1) and active = true order by name`,
      [actor.organizationId],
    );
    const products = await sql<Row>`select id, name, sku, price_cents, available from products order by name`;
    return {
      order,
      orgs,
      people: people.map((row) => ({
        id: n(row, "id"),
        name: s(row, "name"),
        organizationId: nid(row, "organization_id"),
        canOrder: b(row, "can_order") || s(row, "permission_level") === "authorized",
      })),
      products: products.map((row) => ({
        id: n(row, "id"),
        name: s(row, "name"),
        sku: s(row, "sku"),
        priceCents: n(row, "price_cents"),
        available: b(row, "available"),
      })),
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown): OrderDraft => {
    const raw = obj(input);
    const organizationId = intish(raw.organizationId);
    if (!organizationId) throw new Error("Choose a company.");
    const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
    const items = itemsRaw
      .map((item) => {
        const row = obj(item);
        return { productId: intish(row.productId) ?? 0, quantity: intish(row.quantity) ?? 0 };
      })
      .filter((item) => item.productId > 0 && item.quantity > 0);
    if (!items.length) throw new Error("Add at least one piece of equipment.");
    return {
      organizationId,
      customerUserId: intish(raw.customerUserId),
      notes: str(raw.notes, 2000),
      items,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    assertOrg(actor, data.organizationId);
    const orgs = await sql<Row>`select * from organizations where id = ${data.organizationId}`;
    const org = orgs[0];
    if (!org) throw new Error("Company not found.");
    if (!b(org, "ordering_enabled")) throw new Error("Equipment ordering is turned off for this company.");
    if (!b(org, "portal_access")) throw new Error("Portal access is off for this company.");
    if (data.customerUserId) {
      const people = await sql<Row>`select * from customer_users where id = ${data.customerUserId}`;
      const person = people[0];
      if (!person || nid(person, "organization_id") !== data.organizationId) {
        throw new Error("That person is not in this company.");
      }
      if (!b(person, "can_order") && s(person, "permission_level") !== "authorized") {
        throw new Error("This person is not allowed to order equipment.");
      }
    }
    const productRows = await sql.query<Row>(
      `select * from products where id in (${data.items.map((_, index) => `$${index + 1}`).join(",")})`,
      data.items.map((item) => item.productId),
    );
    if (productRows.length !== new Set(data.items.map((item) => item.productId)).size) {
      throw new Error("One of those products is no longer in the catalog.");
    }
    const unavailable = productRows.find((row) => !b(row, "available"));
    if (unavailable) throw new Error(`${s(unavailable, "name")} is not available.`);
    const status = b(org, "approval_required") ? "pending" : "approved";
    const inserted = await sql<Row>`
      insert into orders (organization_id, customer_user_id, status, notes, approval_note)
      values (
        ${data.organizationId},
        ${data.customerUserId},
        ${status},
        ${data.notes},
        ${status === "approved" ? "Approval is not required for this company." : ""}
      )
      returning id
    `;
    const id = n(inserted[0], "id");
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
    const settings = await sql<Row>`select notify_new_order from portal_settings where id = 1`;
    const notify = settings[0] ? b(settings[0], "notify_new_order") : false;
    await audit(
      sql,
      actor,
      "Created order",
      `MT-${1000 + id}`,
      notify ? "Desk notification preference is on." : s(org, "name"),
    );
    return { id };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const id = intish(raw.id);
    const status = str(raw.status, 32);
    const allowed = ["pending", "approved", "processing", "fulfilled", "cancelled"];
    if (!id || !allowed.includes(status)) throw new Error("Choose an order status.");
    return {
      id,
      status,
      approvalNote: str(raw.approvalNote, 2000),
      processingNote: str(raw.processingNote, 2000),
    };
  })
  .handler(async ({ context, data }) => {
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

export const linkOrderTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing order.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const order = await orderById(sql, data, actor);
    if (order.ticketId) return { ticketId: order.ticketId, warning: "" };
    const subject = `Equipment order ${order.number}`;
    const body = [
      `${order.organizationName}`,
      order.customerName ? `Requester: ${order.customerName}` : "",
      ...order.items.map((item) => `${item.quantity} x ${item.productName} (${item.sku})`),
      order.notes,
    ]
      .filter(Boolean)
      .join("\n");
    const inserted = await sql<Row>`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email,
        assignee, tags, view_label
      ) values (
        ${subject}, 'open', 'normal', 'Ordering', ${order.organizationId},
        ${order.customerName}, ${order.customerEmail}, ${actor.name},
        'order,pending_order', 'Pending Orders'
      )
      returning id
    `;
    const ticketId = n(inserted[0], "id");
    await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, ${actor.name}, ${body}, true)
    `;
    let zendeskId = "";
    let warning = "";
    const settings = await readZendesk(sql);
    if (settings.apiToken) {
      try {
        const orgRows = await sql<Row>`select zendesk_org_id from organizations where id = ${order.organizationId}`;
        const zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
        const payload: Record<string, unknown> = {
          subject,
          comment: { body },
          tags: ["order", "pending_order", "portal"],
          status: "open",
        };
        if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) payload.organization_id = Number(zendeskOrg);
        const created = await zendesk(settings, "/tickets.json", {
          method: "POST",
          body: JSON.stringify({ ticket: payload }),
        });
        const ticket = obj(created.ticket);
        zendeskId = ticket.id != null ? String(ticket.id) : "";
        if (zendeskId) {
          await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
        }
      } catch (error) {
        warning = error instanceof Error ? error.message : "Could not create the Zendesk ticket.";
        await rememberZendesk(sql, "error", warning, false);
      }
    }
    await sql`
      update orders set ticket_id = ${ticketId}, zendesk_ticket_id = ${zendeskId}, updated_at = now()
      where id = ${order.id}
    `;
    await audit(sql, actor, "Linked order ticket", order.number, zendeskId || `Portal ticket ${ticketId}`);
    return { ticketId, warning };
  });

export const listForms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TicketForm[]> => {
    const sql = await getSql();
    await loadActor(sql, context.userId);
    const rows = await sql<Row>`select * from ticket_forms order by name`;
    return rows.map(mapForm);
  });

export const saveForm = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const name = str(raw.name, 160);
    if (!name) throw new Error("Form name is required.");
    const required = Array.isArray(raw.requiredFields)
      ? raw.requiredFields.map((field) => str(field, 40)).filter(Boolean)
      : tagsOf(str(raw.requiredFields, 400));
    return {
      id: intish(raw.id),
      name,
      category: str(raw.category, 80),
      subcategory: str(raw.subcategory, 80),
      zendeskField: str(raw.zendeskField, 80),
      requiredFields: required.join(","),
      restricted: flag(raw.restricted),
      active: flag(raw.active, true),
    };
  })
  .handler(async ({ context, data }) => {
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
    const inserted = await sql<Row>`
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

export const testForm = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const formId = intish(raw.formId);
    const organizationId = intish(raw.organizationId);
    if (!formId || !organizationId) throw new Error("Choose a form and a company.");
    const fields = obj(raw.fields);
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) clean[key] = str(value, 2000);
    return { formId, organizationId, fields: clean, asRegular: flag(raw.asRegular, true) };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    assertOrg(actor, data.organizationId);
    const forms = await sql<Row>`select * from ticket_forms where id = ${data.formId}`;
    const form = forms[0] ? mapForm(forms[0]) : null;
    if (!form || !form.active) throw new Error("That form is not active.");
    if (form.restricted && data.asRegular) {
      throw new Error("This request type is limited to authorized customers.");
    }
    const missing = form.requiredFields.filter((field) => !data.fields[field]);
    if (missing.length) throw new Error(`Required: ${missing.join(", ")}.`);
    const subject = data.fields.subject || form.name;
    const body = form.requiredFields
      .filter((field) => field !== "subject")
      .map((field) => `${field}: ${data.fields[field] ?? ""}`)
      .join("\n");
    const orgs = await sql<Row>`select name from organizations where id = ${data.organizationId}`;
    const inserted = await sql<Row>`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
      ) values (
        ${subject}, 'new', 'normal', ${form.category}, ${data.organizationId},
        ${actor.name}, ${actor.email}, ${form.restricted ? "restricted,portal" : "portal"}, ''
      )
      returning id
    `;
    const ticketId = n(inserted[0], "id");
    await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, ${actor.name}, ${body || subject}, true)
    `;
    let warning = "";
    const settings = await readZendesk(sql);
    if (settings.apiToken) {
      try {
        const orgRows = await sql<Row>`select zendesk_org_id from organizations where id = ${data.organizationId}`;
        const zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
        const ticketPayload: Record<string, unknown> = {
          subject,
          comment: { body: body || subject },
          tags: ["portal", form.category.toLowerCase()].filter(Boolean),
          status: "new",
        };
        if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) ticketPayload.organization_id = Number(zendeskOrg);
        if (/^\d+$/.test(form.zendeskField)) {
          ticketPayload.custom_fields = [{ id: Number(form.zendeskField), value: data.fields.subject || form.name }];
        }
        const created = await zendesk(settings, "/tickets.json", {
          method: "POST",
          body: JSON.stringify({ ticket: ticketPayload }),
        });
        const remote = obj(created.ticket);
        const zendeskId = remote.id != null ? String(remote.id) : "";
        if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
      } catch (error) {
        warning = error instanceof Error ? error.message : "Zendesk did not accept the test ticket.";
        await rememberZendesk(sql, "error", warning, false);
      }
    }
    const notify = await sql<Row>`select notify_new_ticket from portal_settings where id = 1`;
    await audit(
      sql,
      actor,
      "Tested form",
      form.name,
      `${orgs[0] ? s(orgs[0], "name") : "Company"} · ticket ${ticketId}${notify[0] && b(notify[0], "notify_new_ticket") ? " · notification preference on" : ""}`,
    );
    return { ticketId, warning };
  });

export const listPolicies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Policy[]> => {
    const sql = await getSql();
    await loadActor(sql, context.userId);
    const rows = await sql<Row>`select * from role_policies order by id`;
    return rows.map(mapPolicy);
  });

export const savePolicy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const id = str(raw.id, 40);
    if (!id) throw new Error("Missing role.");
    return {
      id,
      canOrder: flag(raw.canOrder),
      canRequestUsers: flag(raw.canRequestUsers),
      canApproveOrders: flag(raw.canApproveOrders),
      canManagePortal: flag(raw.canManagePortal),
    };
  })
  .handler(async ({ context, data }) => {
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

export const getIntegration = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Integration & { orgs: Org[] }> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const live = await readZendesk(sql);
    const rows = await sql<Row>`select * from integration_settings where id = 1`;
    const row = rows[0] ?? {};
    const orgs = await sql.query<Row>(
      `${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`,
      [actor.organizationId],
    );
    let lastStatus = s(row, "last_status");
    if (live.fromEnv && (!lastStatus || lastStatus === "not_connected" || lastStatus === "saved")) lastStatus = "ready";
    return {
      subdomain: live.subdomain,
      email: live.email,
      tokenSet: Boolean(live.apiToken),
      fromEnv: live.fromEnv,
      lastSyncAt: s(row, "last_sync_at") || null,
      lastStatus,
      lastError: s(row, "last_error"),
      orgs: orgs.map(mapOrg),
    };
  });

export const saveIntegration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    return {
      subdomain: cleanSubdomain(str(raw.subdomain, 120)),
      email: str(raw.email, 180),
      apiToken: str(raw.apiToken, 200),
      clearToken: flag(raw.clearToken),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const live = await readZendesk(sql);
    if (live.fromEnv) {
      throw new Error("Zendesk is configured with ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, and ZENDESK_API_TOKEN. Those values are used automatically.");
    }
    const current = live;
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

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const settings = await readZendesk(sql);
    try {
      const me = await zendesk(settings, "/users/me.json");
      const user = obj(me.user);
      const name = typeof user.name === "string" ? user.name : settings.email;
      await rememberZendesk(sql, "connected", "", false);
      await audit(sql, actor, "Tested Zendesk", settings.subdomain, name);
      return { ok: true, name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection failed.";
      await rememberZendesk(sql, "error", message, false);
      throw new Error(message);
    }
  });

export const syncZendesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const settings = await readZendesk(sql);
    try {
      const imported = await importFromZendesk(sql, actor, settings);
      zendeskSyncAt = Date.now();
      return { imported };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed.";
      await rememberZendesk(sql, "error", message, false);
      throw new Error(message);
    }
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ settings: PortalSettings; staff: Staff[]; audit: Audit[]; orgs: Named[] }> => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    const rows = await sql<Row>`select * from portal_settings where id = 1`;
    const row = rows[0] ?? {};
    const staff = await sql<Row>`
      select staff.*, coalesce(o.name, '') as organization_name
      from portal_staff staff
      left join organizations o on o.id = staff.organization_id
      order by staff.created_at
    `;
    const logs =
      actor.organizationId == null
        ? await sql<Row>`select * from audit_logs order by created_at desc limit 40`
        : await sql<Row>`
            select * from audit_logs
            where actor_user_id = ${actor.userId}
               or target ilike ${"%" + (actor.organizationName ?? "") + "%"}
               or detail ilike ${"%" + (actor.organizationName ?? "") + "%"}
            order by created_at desc
            limit 40
          `;
    return {
      settings: {
        brandName: s(row, "brand_name") || "Manage Tech Service",
        supportEmail: s(row, "support_email"),
        tagline: s(row, "tagline"),
        notifyNewTicket: row.notify_new_ticket == null ? true : b(row, "notify_new_ticket"),
        notifyNewOrder: row.notify_new_order == null ? true : b(row, "notify_new_order"),
        customerCatalogVisible: row.customer_catalog_visible == null ? true : b(row, "customer_catalog_visible"),
      },
      staff: actor.organizationId
        ? staff.filter((item) => nid(item, "organization_id") === actor.organizationId || s(item, "user_id") === actor.userId).map(mapStaff)
        : staff.map(mapStaff),
      audit: logs.map(mapAudit),
      orgs: await orgNames(sql, actor),
    };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const brandName = str(raw.brandName, 80);
    if (!brandName) throw new Error("Brand name is required.");
    return {
      brandName,
      supportEmail: str(raw.supportEmail, 180),
      tagline: str(raw.tagline, 240),
      notifyNewTicket: flag(raw.notifyNewTicket, true),
      notifyNewOrder: flag(raw.notifyNewOrder, true),
      customerCatalogVisible: flag(raw.customerCatalogVisible, true),
    };
  })
  .handler(async ({ context, data }) => {
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

export const saveStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const userId = str(raw.userId, 80);
    const role = asRole(str(raw.role, 32));
    if (!userId) throw new Error("Missing staff member.");
    return {
      userId,
      role,
      active: flag(raw.active, true),
      organizationId: intish(raw.organizationId),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    if (data.userId === actor.userId && !data.active) throw new Error("You cannot deactivate yourself.");
    const rows = await sql<Row>`select * from portal_staff where user_id = ${data.userId}`;
    const current = rows[0];
    if (!current) throw new Error("Staff member not found.");
    const removingOwner =
      s(current, "role") === "owner" && b(current, "active") && (data.role !== "owner" || !data.active);
    if (removingOwner) {
      const owners = await sql<Row>`
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
