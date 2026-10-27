import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { storeSlug } from "./format";
import {
  ALTERNATIVE_PORTAL,
  alternativeMode,
  createAlternativeCheckout,
  envAlternative,
  loadAlternativeCreds,
  probeAlternative,
  refreshAlternativePayment,
} from "./alternative";
import { conversationsConfig, testConversations } from "./zendesk-conversations";
import { lookupAwb } from "./ups";
import {
  applyPaymentStatus,
  dueJobs,
  enqueueJob,
  finishJob,
  orderEvents,
  readAlternativeEvent,
  rebalanceHold,
  recordEvent,
  resendStoredEmail,
  reserveOrder,
  resolveMail,
  sendOrderEmail,
  setInventory,
  verifyAlternativeSignature,
} from "./commerce";
import type {
  Actor,
  Audit,
  Customer,
  Dashboard,
  Integration,
  Named,
  Order,
  OrderDraft,
  OrderEvent,
  OrderItem,
  Org,
  OrgDetail,
  PeopleData,
  Payments,
  Policy,
  PortalSettings,
  Product,
  Role,
  ShellInfo,
  ShopAccount,
  ShopCheckoutInfo,
  ShopCustomer,
  ShopOrder,
  Staff,
  Storefront,
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
    source: s(row, "source") === "shop" ? "shop" : s(row, "source") === "portal" ? "portal" : "company",
    staffUserId: s(row, "staff_user_id"),
    phone: s(row, "phone"),
    orderCount: n(row, "order_count"),
    lastOrderId: nid(row, "last_order_id"),
    lastOrderStatus: s(row, "last_order_status"),
    ticketId: nid(row, "ticket_id"),
    zendeskTicketId: s(row, "zendesk_ticket_id"),
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
    events: [],
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
    stock: n(row, "stock"),
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

async function loadActor(sql: Sql, userId: string): Promise<Actor> {
  const users = await sql<Row>`select id, name, email from "user" where id = ${userId}`;
  const user = users[0];
  const name = user ? s(user, "name") || "Staff" : "Staff";
  const email = user ? s(user, "email") : "";
  const createdRows = await sql<Row>`
    insert into portal_staff (user_id, name, email, role)
    values (${userId}, ${name}, ${email}, 'agent')
    on conflict (user_id) do update set
      name = excluded.name,
      email = case when excluded.email <> '' then excluded.email else portal_staff.email end
    returning (xmax = 0) as inserted
  `;
  const staffIsNew = Boolean(createdRows[0] && (createdRows[0].inserted === true || createdRows[0].inserted === "t"));
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
  if (email && !s(row, "zendesk_user_id")) {
    try {
      const zendeskUserId = await upsertZendeskUser(sql, {
        name,
        email,
        kind: "staff",
      });
      if (zendeskUserId) await sql`update portal_staff set zendesk_user_id = ${zendeskUserId} where user_id = ${userId}`;
    } catch {
      /* sign-in still opens if Zendesk is down */
    }
  }
  if (staffIsNew && email) {
    try {
      await openWelcomeTicket(sql, {
        name,
        email,
        organizationId: actor.organizationId,
        source: "Staff sign-in",
        detail: "First time this person opened the admin.",
        actorName: name,
      });
    } catch {
      /* a welcome ticket must not block sign-in */
    }
  }
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

type ZSettings = {
  subdomain: string;
  email: string;
  apiToken: string;
  fromEnv: boolean;
  oauthClientId: string;
  oauthClientSecret: string;
  oauthScopes: string;
};

function envZendesk(): ZSettings {
  const clientId = (process.env.ZENDESK_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = (process.env.ZENDESK_OAUTH_CLIENT_SECRET || "").trim();
  const tokenUrl = process.env.ZENDESK_OAUTH_TOKEN_URL || "";
  const subdomain = cleanSubdomain(process.env.ZENDESK_SUBDOMAIN || process.env.ZENDESK_HOST || tokenUrl || "shop");
  const email = (process.env.ZENDESK_EMAIL || process.env.ZENDESK_AGENT_EMAIL || "").trim();
  const apiToken = (process.env.ZENDESK_API_TOKEN || process.env.ZENDESK_TOKEN || process.env.ZENDESK_API_KEY || "").trim();
  const oauth = Boolean(subdomain && clientId && clientSecret);
  return {
    subdomain,
    email,
    apiToken,
    fromEnv: oauth || Boolean(subdomain && email && apiToken),
    oauthClientId: clientId,
    oauthClientSecret: clientSecret,
    oauthScopes: (process.env.ZENDESK_OAUTH_SCOPES || "read write").trim(),
  };
}

async function readZendesk(sql: Sql): Promise<ZSettings> {
  const envz = envZendesk();
  const rows = await sql<Row>`select subdomain, email, api_token, oauth_client_id, oauth_client_secret, oauth_scopes from integration_settings where id = 1`;
  const row = rows[0];
  const storedId = row ? s(row, "oauth_client_id") : "";
  const storedSecret = row ? s(row, "oauth_client_secret") : "";
  return {
    subdomain: envz.subdomain || (row ? cleanSubdomain(s(row, "subdomain")) : "") || "shop",
    email: envz.email || (row ? s(row, "email") : ""),
    apiToken: envz.apiToken || (row ? s(row, "api_token") : ""),
    fromEnv: envz.fromEnv,
    oauthClientId: envz.oauthClientId || storedId,
    oauthClientSecret: envz.oauthClientSecret || storedSecret,
    oauthScopes: envz.oauthClientId ? envz.oauthScopes : row && s(row, "oauth_scopes") ? s(row, "oauth_scopes") : envz.oauthScopes,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function oauthReady(settings: ZSettings) {
  return Boolean(settings.subdomain && settings.oauthClientId && settings.oauthClientSecret);
}

type OauthCache = { key: string; token: string; expiresAt: number };
const oauthCache = globalThis as typeof globalThis & { __zendeskOauth?: OauthCache };

async function zendeskAccessToken(settings: ZSettings) {
  const key = `${settings.subdomain}:${settings.oauthClientId}:${settings.oauthScopes}`;
  const cached = oauthCache.__zendeskOauth;
  if (cached && cached.key === key && cached.expiresAt > Date.now() + 15_000) return cached.token;
  const scopes = [settings.oauthScopes || "read write", "users:read users:write tickets:read tickets:write organizations:read"];
  let lastDetail = "Zendesk rejected the OAuth client.";
  for (const scope of scopes) {
    for (const asForm of [false, true]) {
      const body = asForm
        ? new URLSearchParams({
            grant_type: "client_credentials",
            client_id: settings.oauthClientId,
            client_secret: settings.oauthClientSecret,
            scope,
          })
        : JSON.stringify({
            grant_type: "client_credentials",
            client_id: settings.oauthClientId,
            client_secret: settings.oauthClientSecret,
            scope,
          });
      const response = await fetch(`https://${settings.subdomain}.zendesk.com/oauth/tokens`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": asForm ? "application/x-www-form-urlencoded" : "application/json",
        },
        body,
      });
      const text = await response.text();
      if (response.ok) {
        const parsed = JSON.parse(text) as { access_token?: string; expires_in?: number };
        if (!parsed.access_token) throw new Error("Zendesk OAuth did not return an access token.");
        const ttl = typeof parsed.expires_in === "number" && parsed.expires_in > 60 ? parsed.expires_in * 1000 : 30 * 60 * 1000;
        oauthCache.__zendeskOauth = { key, token: parsed.access_token, expiresAt: Date.now() + ttl };
        return parsed.access_token;
      }
      lastDetail = text.replaceAll(settings.oauthClientSecret, "").slice(0, 180);
      if (response.status !== 400 && response.status !== 401 && response.status !== 415) {
        throw new Error(`Zendesk OAuth returned ${response.status}. ${lastDetail}`);
      }
    }
    if (!/invalid_scope|scope/i.test(lastDetail)) break;
  }
  throw new Error(`Zendesk OAuth returned 400. ${lastDetail}`);
}

async function zendeskAuthorization(settings: ZSettings) {
  if (oauthReady(settings)) return `Bearer ${await zendeskAccessToken(settings)}`;
  if (settings.subdomain && settings.email && settings.apiToken) {
    return `Basic ${basicAuth(settings.email, settings.apiToken)}`;
  }
  throw new Error("Zendesk is not connected. Set ZENDESK_OAUTH_CLIENT_ID and ZENDESK_OAUTH_CLIENT_SECRET for shop, or an API token.");
}

async function zendesk(settings: ZSettings, path: string, init?: RequestInit) {
  if (!settings.subdomain || (!oauthReady(settings) && !(settings.email && settings.apiToken))) {
    throw new Error("Zendesk is not connected. Set ZENDESK_OAUTH_CLIENT_ID and ZENDESK_OAUTH_CLIENT_SECRET for shop, or an API token.");
  }
  const url = path.startsWith("http") ? path : `https://${settings.subdomain}.zendesk.com/api/v2${path}`;
  const run = async () =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: await zendeskAuthorization(settings),
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  let response = await run();
  if (response.status === 401 && oauthReady(settings)) {
    oauthCache.__zendeskOauth = undefined;
    response = await run();
  }
  if (response.status === 429) {
    const wait = Math.min(Number(response.headers.get("retry-after") || "2") || 2, 8);
    await sleep(wait * 1000);
    response = await run();
  }
  const text = await response.text();
  if (response.status === 429) throw new Error("Zendesk rate limit reached. Wait a moment and try again.");
  if (!response.ok) {
    let detail = text.replaceAll(settings.apiToken, "").replaceAll(settings.oauthClientSecret, "").slice(0, 180);
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

function supportConnected(settings: ZSettings) {
  return oauthReady(settings) || Boolean(settings.subdomain && settings.email && settings.apiToken);
}

async function upsertZendeskUser(sql: Sql, input: { name: string; email: string; kind: "staff" | "customer" | "shop" }) {
  const email = input.email.trim().toLowerCase();
  if (!email) return "";
  const settings = await readZendesk(sql);
  if (!supportConnected(settings)) return "";
  const tag = input.kind === "staff" ? "portal_staff" : input.kind === "shop" ? "shop_customer" : "portal_customer";
  const created = await zendesk(settings, "/users/create_or_update.json", {
    method: "POST",
    body: JSON.stringify({
      user: {
        name: input.name || email,
        email,
        role: "end-user",
        skip_verify_email: true,
        tags: [tag, "portal"],
      },
    }),
  });
  const remote = obj(created.user);
  return remote.id != null ? String(remote.id) : "";
}

async function openWelcomeTicket(
  sql: Sql,
  input: { name: string; email: string; organizationId: number | null; source: string; detail: string; actorName: string },
) {
  const subject = `New user: ${input.name || input.email}`;
  const body = [`Name: ${input.name}`, `Email: ${input.email}`, `Source: ${input.source}`, input.detail]
    .filter(Boolean)
    .join("\n");
  const inserted = await sql<Row>`
    insert into tickets (
      subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
    ) values (
      ${subject}, 'new', 'normal', 'Account', ${input.organizationId},
      ${input.name}, ${input.email}, 'new_user,portal', ''
    )
    returning id
  `;
  const ticketId = n(inserted[0], "id");
  await sql`
    insert into ticket_comments (ticket_id, author_name, body, public_note)
    values (${ticketId}, ${input.actorName || "Portal"}, ${body}, true)
  `;
  let zendeskId = "";
  let warning = "";
  const settings = await readZendesk(sql);
  if (!supportConnected(settings)) {
    await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
    return { ticketId, zendeskId, warning: "The portal ticket is open. Connect Zendesk to copy it to the desk." };
  }
  try {
    let zendeskOrg = "";
    if (input.organizationId) {
      const orgRows = await sql<Row>`select zendesk_org_id from organizations where id = ${input.organizationId}`;
      zendeskOrg = orgRows[0] ? s(orgRows[0], "zendesk_org_id") : "";
    }
    const ticketPayload: Record<string, unknown> = {
      subject,
      comment: { body },
      tags: ["new_user", "portal"],
      status: "new",
      requester: { name: input.name || input.email, email: input.email },
    };
    if (zendeskOrg && Number.isFinite(Number(zendeskOrg))) ticketPayload.organization_id = Number(zendeskOrg);
    const created = await zendesk(settings, "/tickets.json", {
      method: "POST",
      body: JSON.stringify({ ticket: ticketPayload }),
    });
    const remote = obj(created.ticket);
    zendeskId = remote.id != null ? String(remote.id) : "";
    if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
  } catch (error) {
    warning = error instanceof Error ? error.message : "Zendesk did not accept the new-user ticket.";
    await rememberZendesk(sql, "error", warning, false);
    await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
  }
  return { ticketId, zendeskId, warning };
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
  if (!supportConnected(settings) || !ticket.zendeskId) return;
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
  if (!supportConnected(settings) || !ticket.zendeskId) return "";
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
    const orders = await sql<Row>`
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
    `;
    const counts = orders[0];
    return {
      actor,
      brandName: setting ? s(setting, "brand_name") : "Manage Tech Service",
      tagline: setting ? s(setting, "tagline") : "",
      zendeskConnected: Boolean(oauthReady(live) || (live.subdomain && live.email && live.apiToken) || conversationsConfig().ready),
      zendeskStatus: link ? s(link, "last_status") : oauthReady(live) || live.apiToken ? "ready" : "not_connected",
      orderCount: counts ? n(counts, "orders") : 0,
      ticketCount: counts ? n(counts, "tickets") : 0,
      peopleCount: counts ? n(counts, "people") : 0,
      catalogCount: counts ? n(counts, "catalog") : 0,
      companyCount: counts ? n(counts, "companies") : 0,
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
    if (supportConnected(settings) && existing.ticket.zendeskId) {
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
      `select cu.*, coalesce(o.name, '') as organization_name, 'company' as source,
        coalesce((select count(*)::int from orders ord where ord.customer_user_id = cu.id), 0) as order_count,
        (select ord.id from orders ord where ord.customer_user_id = cu.id order by ord.id desc limit 1) as last_order_id,
        coalesce((select ord.status from orders ord where ord.customer_user_id = cu.id order by ord.id desc limit 1), '') as last_order_status,
        (select t.id from tickets t where lower(t.requester_email) = lower(cu.email) order by t.id desc limit 1) as ticket_id,
        coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(cu.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
       from customer_users cu
       left join organizations o on o.id = cu.organization_id
       where ($1::int is null or cu.organization_id = $1)
       order by cu.name`,
      [actor.organizationId],
    );
    const staff = await sql.query<Row>(
      `select staff.user_id as staff_user_id, staff.name, staff.email, staff.role as permission_level, staff.organization_id,
        staff.active, staff.created_at, staff.zendesk_user_id, coalesce(org.name, '') as organization_name, 'portal' as source,
        coalesce((select count(*)::int from orders ord where lower(ord.ship_email) = lower(staff.email)), 0) as order_count,
        (select ord.id from orders ord where lower(ord.ship_email) = lower(staff.email) order by ord.id desc limit 1) as last_order_id,
        coalesce((select ord.status from orders ord where lower(ord.ship_email) = lower(staff.email) order by ord.id desc limit 1), '') as last_order_status,
        (select t.id from tickets t where lower(t.requester_email) = lower(staff.email) order by t.id desc limit 1) as ticket_id,
        coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(staff.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
       from portal_staff staff
       left join organizations org on org.id = staff.organization_id
       where staff.email <> '' and ($1::int is null or staff.organization_id = $1)
       order by staff.name`,
      [actor.organizationId],
    );
    const shop = actor.organizationId
      ? []
      : await sql<Row>`
          select sc.id, sc.name, sc.email, sc.phone, sc.city, sc.created_at, sc.zendesk_user_id, 'shop' as source,
            coalesce((select count(*)::int from orders ord where ord.shop_customer_id = sc.id), 0) as order_count,
            (select ord.id from orders ord where ord.shop_customer_id = sc.id order by ord.id desc limit 1) as last_order_id,
            coalesce((select ord.status from orders ord where ord.shop_customer_id = sc.id order by ord.id desc limit 1), '') as last_order_status,
            (select t.id from tickets t where lower(t.requester_email) = lower(sc.email) order by t.id desc limit 1) as ticket_id,
            coalesce((select t.zendesk_id from tickets t where lower(t.requester_email) = lower(sc.email) and t.zendesk_id is not null order by t.id desc limit 1), '') as zendesk_ticket_id
          from shop_customers sc
          order by sc.created_at desc
        `;
    const requests = await sql.query<Row>(
      `select r.*, coalesce(o.name, '') as organization_name
       from user_requests r
       left join organizations o on o.id = r.organization_id
       where ($1::int is null or r.organization_id = $1)
       order by case when r.status = 'pending' then 0 else 1 end, r.created_at desc`,
      [actor.organizationId],
    );
    const policies = await sql<Row>`select * from role_policies order by id`;
    const directory = people.map(mapCustomer);
    const buyers = shop.map((row) => ({
      ...mapCustomer({ ...row, active: true, permission_level: "regular", organization_name: s(row, "city") }),
      title: "Online shop",
      active: true,
      source: "shop" as const,
    }));
    const accounts = staff.map((row) => ({
      ...mapCustomer(row),
      id: 0,
      title: s(row, "permission_level") === "owner" ? "Super Admin" : s(row, "permission_level") || "Staff",
      source: "portal" as const,
      canOrder: false,
      canRequestUsers: false,
      canApproveOrders: false,
    }));
    return {
      people: [...accounts, ...directory, ...buyers],
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
    const duplicate = await sql<Row>`
      select id from customer_users
      where lower(email) = lower(${data.email}) and id <> ${data.id ?? 0}
      limit 1
    `;
    if (duplicate[0]) throw new Error("That email is already in the directory.");
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
      return { id: data.id, ticketId: 0, zendeskId: "", warning: "" };
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
    const ticket = await openWelcomeTicket(sql, {
      name: data.name,
      email: data.email,
      organizationId: data.organizationId,
      source: "Admin invite",
      detail: data.title,
      actorName: actor.name,
    });
    const zendeskUserId = await upsertZendeskUser(sql, { name: data.name, email: data.email, kind: "customer" }).catch(() => "");
    if (zendeskUserId) await sql`update customer_users set zendesk_user_id = ${zendeskUserId} where id = ${n(inserted[0], "id")}`;
    return { id: n(inserted[0], "id"), ...ticket };
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
    let ticket: { ticketId: number; zendeskId: string; warning: string } | null = null;
    if (data.decision === "approved") {
      const duplicate = await sql<Row>`select id from customer_users where lower(email) = lower(${s(request, "requested_email")}) limit 1`;
      if (duplicate[0]) throw new Error("That email is already in the directory.");
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
        actorName: actor.name,
      });
      const zendeskUserId = await upsertZendeskUser(sql, {
        name: s(request, "requested_name"),
        email: s(request, "requested_email"),
        kind: "customer",
      }).catch(() => "");
      if (zendeskUserId) {
        await sql`update customer_users set zendesk_user_id = ${zendeskUserId} where lower(email) = lower(${s(request, "requested_email")})`;
      }
    }
    await sql`update user_requests set status = ${data.decision} where id = ${data.id}`;
    await audit(sql, actor, data.decision === "approved" ? "Approved user" : "Denied user", s(request, "requested_email"), s(request, "organization_id"));
    return { ok: true, ticketId: ticket?.ticketId ?? 0, zendeskId: ticket?.zendeskId ?? "", warning: ticket?.warning ?? "" };
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
      stock: Math.max(0, intish(raw.stock) ?? 0),
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
          stock = ${data.stock},
          image_url = ${data.imageUrl},
          available = ${data.available},
          visibility = ${data.visibility}
        where id = ${data.id}
      `;
      await audit(sql, actor, "Updated product", data.sku, data.available ? "Available" : "Hidden");
      return { id: data.id };
    }
    const inserted = await sql<Row>`
      insert into products (sku, name, category, description, specs, price_cents, stock, image_url, available, visibility)
      values (
        ${data.sku}, ${data.name}, ${data.category}, ${data.description}, ${data.specs},
        ${data.priceCents}, ${data.stock}, ${data.imageUrl}, ${data.available}, ${data.visibility}
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
    const events = await orderEvents(sql, order.id);
    const orgs = await orgNames(sql, actor);
    const people = await sql.query<Row>(
      `select id, name, organization_id, can_order, permission_level from customer_users
       where ($1::int is null or organization_id = $1) and active = true order by name`,
      [actor.organizationId],
    );
    const products = await sql<Row>`select id, name, sku, price_cents, available from products order by name`;
    return {
      order: { ...order, events },
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
      canEdit: actor.role !== "viewer",
      canDelete: actor.role === "owner",
    };
  });

async function settleNewOrder(sql: Sql, orderId: number, actor: string) {
  try {
    await reserveOrder(sql, orderId);
  } catch (error) {
    await sql`delete from orders where id = ${orderId}`;
    throw error;
  }
  await recordEvent(sql, { orderId, kind: "placed", to: "pending", actor, detail: "Stock held" });
  await mailOrder(sql, orderId, "confirmation");
  await enqueueJob(sql, "order_ticket", `order-${orderId}`, { orderId });
  await runPortalJobs(sql).catch(() => undefined);
}

async function mailOrder(sql: Sql, orderId: number, template: string) {
  const rows = await sql<Row>`
    select o.ship_email, o.payment_status, o.tracking_number, o.tracking_carrier, cu.email as customer_email
    from orders o
    left join customer_users cu on cu.id = o.customer_user_id
    where o.id = ${orderId}
  `;
  const row = rows[0];
  if (!row) return;
  const to = s(row, "ship_email") || s(row, "customer_email");
  const number = `MT-${1000 + orderId}`;
  if (template === "confirmation") {
    await sendOrderEmail(sql, {
      orderId,
      to,
      template,
      subject: `${number} received`,
      body: `We received ${number}. We will email you again when it ships. Payment: ${s(row, "payment_status") || "pending"}.`,
    });
    return;
  }
  if (template === "payment_due") {
    await sendOrderEmail(sql, {
      orderId,
      to,
      template,
      subject: `${number} payment is still open`,
      body: `${number} is still unpaid. Reply to this message or pay from the link in your account.`,
    });
    return;
  }
  if (template === "shipped" || template === "delivered") {
    await sendOrderEmail(sql, {
      orderId,
      to,
      template,
      subject: template === "delivered" ? `${number} delivered` : `${number} shipped`,
      body: `${number} is ${template}.${s(row, "tracking_number") ? ` Tracking ${s(row, "tracking_carrier")} ${s(row, "tracking_number")}.` : ""}`,
    });
  }
}

async function pushTicket(sql: Sql, ticketId: number) {
  const rows = await sql<Row>`select * from tickets where id = ${ticketId}`;
  const ticket = rows[0];
  if (!ticket || s(ticket, "zendesk_id")) return;
  const settings = await readZendesk(sql);
  if (!supportConnected(settings)) throw new Error("Zendesk Support is not connected.");
  const comments = await sql<Row>`select body from ticket_comments where ticket_id = ${ticketId} order by id limit 1`;
  const created = await zendesk(settings, "/tickets.json", {
    method: "POST",
    body: JSON.stringify({
      ticket: {
        subject: s(ticket, "subject"),
        comment: { body: comments[0] ? s(comments[0], "body") : s(ticket, "subject") },
        status: "new",
        requester: { name: s(ticket, "requester_name") || s(ticket, "requester_email"), email: s(ticket, "requester_email") },
      },
    }),
  });
  const remote = obj(created.ticket);
  const zendeskId = remote.id != null ? String(remote.id) : "";
  if (zendeskId) await sql`update tickets set zendesk_id = ${zendeskId} where id = ${ticketId}`;
}

async function ensureOrderTicket(sql: Sql, orderId: number) {
  const rows = await sql<Row>`
    select o.id, o.ticket_id, o.organization_id, o.notes, coalesce(org.name, '') as organization_name,
      coalesce(cu.name, o.ship_name, '') as customer_name, coalesce(cu.email, o.ship_email, '') as customer_email
    from orders o
    left join organizations org on org.id = o.organization_id
    left join customer_users cu on cu.id = o.customer_user_id
    where o.id = ${orderId}
  `;
  const order = rows[0];
  if (!order) return;
  let ticketId = nid(order, "ticket_id") ?? 0;
  if (!ticketId) {
    const inserted = await sql<Row>`
      insert into tickets (
        subject, status, priority, category, organization_id, requester_name, requester_email, tags, view_label
      ) values (
        ${`Catalog order MT-${1000 + orderId}`}, 'open', 'normal', 'Ordering', ${n(order, "organization_id")},
        ${s(order, "customer_name")}, ${s(order, "customer_email")}, 'order,pending_order', 'Pending Orders'
      )
      returning id
    `;
    ticketId = n(inserted[0], "id");
    await sql`
      insert into ticket_comments (ticket_id, author_name, body, public_note)
      values (${ticketId}, 'Desk', ${`${s(order, "organization_name")}\n${s(order, "notes")}`}, true)
    `;
    await sql`update orders set ticket_id = ${ticketId}, updated_at = now() where id = ${orderId}`;
  }
  await pushTicket(sql, ticketId);
  const fresh = await sql<Row>`select zendesk_id from tickets where id = ${ticketId}`;
  const zendeskId = fresh[0] ? s(fresh[0], "zendesk_id") : "";
  if (zendeskId) await sql`update orders set zendesk_ticket_id = ${zendeskId} where id = ${orderId}`;
}

async function sweepDesk(sql: Sql) {
  const unpaid = await sql<Row>`
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
  const stale = await sql<Row>`
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

export async function runPortalJobs(sql: Sql) {
  await sweepDesk(sql);
  const jobs = await dueJobs(sql, 12);
  for (const job of jobs) {
    let payload: { orderId?: number; ticketId?: number; emailId?: number } = {};
    try {
      payload = JSON.parse(job.payload) as typeof payload;
    } catch {
      payload = {};
    }
    try {
      if (job.kind === "email" && payload.emailId) await resendStoredEmail(sql, payload.emailId);
      else if (job.kind === "zendesk_ticket" && payload.ticketId) await pushTicket(sql, payload.ticketId);
      else if (job.kind === "order_ticket" && payload.orderId) await ensureOrderTicket(sql, payload.orderId);
      else if (job.kind === "remind_unpaid" && payload.orderId) await mailOrder(sql, payload.orderId, "payment_due");
      else if (job.kind === "stale_shipment" && payload.orderId) {
        await recordEvent(sql, { orderId: payload.orderId, kind: "attention", actor: "Desk", detail: "Still unfulfilled after 2 days" });
      }
      await finishJob(sql, job.id, "", job.attempts + 1, job.maxAttempts);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job failed.";
      await finishJob(sql, job.id, message, job.attempts + 1, job.maxAttempts);
    }
  }
}

export const runDeskJobs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    await runPortalJobs(sql);
    await audit(sql, actor, "Ran desk jobs", "queue", "");
    return { ok: true };
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
    if (!items.length) throw new Error("Add at least one product.");
    const paymentMethod = str(raw.paymentMethod, 32);
    const returnUrl = str(raw.returnUrl, 300);
    return {
      organizationId,
      customerUserId: intish(raw.customerUserId),
      notes: str(raw.notes, 2000),
      paymentMethod,
      returnUrl,
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
    if (!b(org, "ordering_enabled")) throw new Error("Catalog ordering is turned off for this company.");
    if (!b(org, "portal_access")) throw new Error("Portal access is off for this company.");
    if (data.customerUserId) {
      const people = await sql<Row>`select * from customer_users where id = ${data.customerUserId}`;
      const person = people[0];
      if (!person || nid(person, "organization_id") !== data.organizationId) {
        throw new Error("That person is not in this company.");
      }
      if (!b(person, "can_order") && s(person, "permission_level") !== "authorized") {
        throw new Error("This person is not allowed to order products.");
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
    const payments = await readPayments(sql);
    const method = data.paymentMethod || payments.methods[0] || "";
    if (!payments.methods.includes(method)) {
      throw new Error("Choose a payment method that is turned on.");
    }
    if (method === "purchase_order" && payments.requirePo && !/\bpo\b|purchase order/i.test(data.notes)) {
      throw new Error("Add the purchase order number in the notes.");
    }
    const inserted = await sql<Row>`
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
    let paymentUrl = "";
    if (method === "alternative") {
      const creds = await loadAlternativeCreds(sql);
      const buyer = data.customerUserId
        ? (await sql<Row>`select email from customer_users where id = ${data.customerUserId}`)[0]
        : undefined;
      const lines = data.items.map((item) => {
        const product = productRows.find((row) => n(row, "id") === item.productId);
        return {
          description: product ? s(product, "name") : "Product",
          amount: product ? n(product, "price_cents") / 100 : 0,
          quantity: item.quantity,
        };
      });
      const due = new Date();
      due.setDate(due.getDate() + 30);
      if (creds) {
        try {
          const checkout = await createAlternativeCheckout(creds, {
            reference: `MT-${1000 + id}`,
            returnUrl: data.returnUrl,
            externalId: `mts-org-${data.organizationId}`,
            name: s(org, "name"),
            email: buyer ? s(buyer, "email") : "",
            existingCustomerId: s(org, "alternative_customer_id"),
            dueDate: due.toISOString().slice(0, 10),
            lines,
          });
          paymentUrl = checkout.url;
          if (checkout.customerId) {
            await sql`update organizations set alternative_customer_id = ${checkout.customerId} where id = ${data.organizationId}`;
          }
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
      } else {
        paymentUrl = ALTERNATIVE_PORTAL;
        await sql`update orders set payment_url = ${paymentUrl}, payment_status = 'portal' where id = ${id}`;
      }
    }
    await settleNewOrder(sql, id, actor.name);
    return { id, paymentUrl };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const id = intish(raw.id);
    const status = str(raw.status, 32);
    const allowed = ["pending", "approved", "processing", "fulfilled", "cancelled"];
    const shipments = ["unfulfilled", "shipped", "out_for_delivery", "delivered"];
    const shipmentStatus = str(raw.shipmentStatus, 32);
    if (!id || !allowed.includes(status)) throw new Error("Choose an order status.");
    const items = Array.isArray(raw.items)
      ? raw.items.map((item) => {
          const row = obj(item);
          const quantity = intish(row.quantity) ?? 0;
          if (quantity < 1 || quantity > 999) throw new Error("Enter a quantity between 1 and 999.");
          return { productId: intish(row.productId), sku: str(row.sku, 40), quantity };
        })
      : null;
    if (items && !items.length) throw new Error("An order needs at least one item.");
    return {
      id,
      status,
      approvalNote: str(raw.approvalNote, 2000),
      processingNote: str(raw.processingNote, 2000),
      shipmentStatus: shipments.includes(shipmentStatus) ? shipmentStatus : "unfulfilled",
      trackingNumber: str(raw.trackingNumber, 80),
      trackingCarrier: str(raw.trackingCarrier, 40),
      notes: typeof raw.notes === "string" ? str(raw.notes, 2000) : null,
      items,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const order = await orderById(sql, data.id, actor);
    if (data.items) {
      await rebalanceHold(
        sql,
        data.id,
        data.items.filter((item) => item.productId).map((item) => ({ productId: item.productId as number, quantity: item.quantity })),
      );
    }
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
      const existing = await sql<Row>`select * from order_items where order_id = ${data.id}`;
      const catalog = await sql<Row>`select * from products`;
      await sql`delete from order_items where order_id = ${data.id}`;
      for (const item of data.items) {
        const prior = item.productId
          ? existing.find((row) => nid(row, "product_id") === item.productId)
          : existing.find((row) => s(row, "sku") === item.sku);
        const product = item.productId ? catalog.find((row) => n(row, "id") === item.productId) : undefined;
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
    if (order.status !== data.status) {
      await recordEvent(sql, { orderId: data.id, kind: "status", from: order.status, to: data.status, actor: actor.name });
    }
    if (order.shipmentStatus !== data.shipmentStatus) {
      await recordEvent(sql, {
        orderId: data.id,
        kind: "shipment",
        from: order.shipmentStatus,
        to: data.shipmentStatus,
        actor: actor.name,
        detail: data.trackingNumber,
      });
      if (data.shipmentStatus === "shipped" || data.shipmentStatus === "delivered") {
        await mailOrder(sql, data.id, data.shipmentStatus);
      }
    }
    await audit(sql, actor, "Updated order", order.number, data.status);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing order.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    if (actor.role !== "owner") throw new Error("Only a Super Admin can delete an order.");
    const order = await orderById(sql, data, actor);
    await setInventory(sql, data, "released");
    await sql`delete from orders where id = ${data}`;
    await audit(sql, actor, "Deleted order", order.number, order.organizationName);
    return { ok: true };
  });

export const trackAwb = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const awb = str(typeof input === "string" ? input : obj(input).awb, 40);
    if (awb.replace(/[^0-9A-Za-z]/g, "").length < 8) throw new Error("Scan or type the air waybill.");
    return awb;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await loadActor(sql, context.userId);
    return lookupAwb(data);
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
    const subject = `Catalog order ${order.number}`;
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
    if (settings.apiToken || supportConnected(settings)) {
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
        await enqueueJob(sql, "zendesk_ticket", `ticket-${ticketId}`, { ticketId });
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
    if (settings.apiToken || supportConnected(settings)) {
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
    const conversations = conversationsConfig();
    const rows = await sql<Row>`select * from integration_settings where id = 1`;
    const row = rows[0] ?? {};
    const orgs = await sql.query<Row>(
      `${ORG_SELECT} where ($1::int is null or o.id = $1) order by o.name`,
      [actor.organizationId],
    );
    let lastStatus = s(row, "last_status");
    let lastError = s(row, "last_error");
    const supportReady = oauthReady(live) || Boolean(live.email && live.apiToken);
    if (!supportReady && conversations.ready) {
      if (!lastStatus || lastStatus === "not_connected" || lastStatus === "saved" || lastStatus === "error") lastStatus = "connected";
      if (lastError.includes("OAUTH_CLIENT") || lastError.includes("not connected")) lastError = "";
    } else if ((live.fromEnv || conversations.ready) && (!lastStatus || lastStatus === "not_connected" || lastStatus === "saved")) {
      lastStatus = "ready";
    }
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
      oauthClientId: str(raw.oauthClientId, 120),
      oauthClientSecret: str(raw.oauthClientSecret, 200),
      oauthScopes: str(raw.oauthScopes, 180) || "read write",
      clearOauth: flag(raw.clearOauth),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const live = await readZendesk(sql);
    const current = live;
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
    oauthCache.__zendeskOauth = undefined;
    await audit(sql, actor, "Saved Zendesk", data.subdomain || "shop", data.email || oauthId);
    return { ok: true };
  });

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const settings = await readZendesk(sql);
    const conversations = conversationsConfig();
    if (!oauthReady(settings) && !(settings.subdomain && settings.email && settings.apiToken)) {
      if (!conversations.ready) {
        throw new Error("Zendesk is not connected. Add the Support API token or the Conversations API key.");
      }
      try {
        const result = await testConversations();
        await rememberZendesk(sql, "connected", "", false);
        await audit(sql, actor, "Tested Zendesk", "conversations", result.name);
        return { ok: true, name: result.name };
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
        return { ok: true, name: `${settings.subdomain} OAuth` };
      }
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
    const supportReady = oauthReady(settings) || Boolean(settings.subdomain && settings.email && settings.apiToken);
    if (!supportReady) {
      try {
        const result = await testConversations();
        await rememberZendesk(sql, "connected", "", true);
        await audit(sql, actor, "Tested Zendesk", "conversations", result.name);
        return { imported: 0 };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Connection failed.";
        await rememberZendesk(sql, "error", message, false);
        throw new Error(message);
      }
    }
    try {
      const imported = await importFromZendesk(sql, actor, settings);
      const users = await pushPortalUsers(sql);
      zendeskSyncAt = Date.now();
      if (users.failed && !users.synced) throw new Error(users.lastError);
      return { imported, users: users.synced };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed.";
      await rememberZendesk(sql, "error", message, false);
      throw new Error(message);
    }
  });

async function pushPortalUsers(sql: Sql) {
  const staff = await sql<Row>`select user_id, name, email from portal_staff where email <> ''`;
  const customers = await sql<Row>`select id, name, email from customer_users where email <> ''`;
  const shoppers = await sql<Row>`select id, name, email from shop_customers where email <> ''`;
  let synced = 0;
  let failed = 0;
  let lastError = "";
  for (const row of staff) {
    try {
      const id = await upsertZendeskUser(sql, { name: s(row, "name"), email: s(row, "email"), kind: "staff" });
      if (id) await sql`update portal_staff set zendesk_user_id = ${id} where user_id = ${s(row, "user_id")}`;
      synced += 1;
    } catch (error) {
      failed += 1;
      lastError = error instanceof Error ? error.message : "Could not sync a user.";
    }
  }
  for (const row of customers) {
    try {
      const id = await upsertZendeskUser(sql, { name: s(row, "name"), email: s(row, "email"), kind: "customer" });
      if (id) await sql`update customer_users set zendesk_user_id = ${id} where id = ${n(row, "id")}`;
      synced += 1;
    } catch (error) {
      failed += 1;
      lastError = error instanceof Error ? error.message : "Could not sync a user.";
    }
  }
  for (const row of shoppers) {
    try {
      const id = await upsertZendeskUser(sql, { name: s(row, "name"), email: s(row, "email"), kind: "shop" });
      if (id) await sql`update shop_customers set zendesk_user_id = ${id} where id = ${n(row, "id")}`;
      synced += 1;
    } catch (error) {
      failed += 1;
      lastError = error instanceof Error ? error.message : "Could not sync a user.";
    }
  }
  return { synced, failed, lastError };
}

export const syncPortalUsers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const settings = await readZendesk(sql);
    if (!supportConnected(settings)) {
      throw new Error("Zendesk is not connected. Add the OAuth client id and secret for shop, then test access.");
    }
    const users = await pushPortalUsers(sql);
    if (users.failed && !users.synced) throw new Error(users.lastError || "Could not sync users.");
    await rememberZendesk(sql, users.failed ? "error" : "connected", users.lastError, false);
    await audit(sql, actor, "Synced Zendesk users", String(users.synced), users.lastError);
    return { synced: users.synced, failed: users.failed };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
    const mail = await resolveMail(sql);
    const fromMatch = /<([^>]+)>/.exec(mail.from);
    return {
      settings: {
        brandName: s(row, "brand_name") || "Manage Tech Service",
        supportEmail: s(row, "support_email"),
        tagline: s(row, "tagline"),
        notifyNewTicket: row.notify_new_ticket == null ? true : b(row, "notify_new_ticket"),
        notifyNewOrder: row.notify_new_order == null ? true : b(row, "notify_new_order"),
        customerCatalogVisible: row.customer_catalog_visible == null ? true : b(row, "customer_catalog_visible"),
      },
      mail: {
        fromEmail: fromMatch?.[1] || mail.from || "noreply@managetechservice.com",
        keySet: Boolean(mail.key),
        status: s(row, "resend_status"),
        error: s(row, "resend_error"),
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

export const saveResend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const fromEmail = str(raw.fromEmail, 180).replace(/[<>]/g, "");
    if (!fromEmail.includes("@")) throw new Error("Enter the noreply address.");
    return { fromEmail, apiKey: str(raw.apiKey, 200) };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const current = await sql<Row>`select resend_api_key from portal_settings where id = 1`;
    const kept = current[0] ? s(current[0], "resend_api_key") : "";
    const key = data.apiKey || kept;
    const from = `Manage Tech Service <${data.fromEmail}>`;
    await sql`
      insert into portal_settings (id, resend_api_key, email_from)
      values (1, ${key}, ${from})
      on conflict (id) do update set
        resend_api_key = excluded.resend_api_key,
        email_from = excluded.email_from
    `;
    await audit(sql, actor, "Updated Resend", data.fromEmail, key ? "API key saved" : "No API key");
    return { ok: true };
  });

export const testResend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const mail = await resolveMail(sql);
    if (!mail.key) throw new Error("Add a Resend API key first.");
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${mail.key}` },
    });
    const text = await response.text();
    if (!response.ok) {
      const message = text.slice(0, 180) || "Resend rejected the API key.";
      await sql`update portal_settings set resend_status = 'error', resend_error = ${message} where id = 1`;
      throw new Error(message);
    }
    let domains = 0;
    try {
      const payload = JSON.parse(text) as { data?: unknown[] };
      domains = Array.isArray(payload.data) ? payload.data.length : 0;
    } catch {
      domains = 0;
    }
    const message = domains ? `Connected. ${domains} sending domain${domains === 1 ? "" : "s"}.` : "Connected. No sending domain is verified yet.";
    await sql`update portal_settings set resend_status = 'connected', resend_error = ${message} where id = 1`;
    return { ok: true, message };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const to = str(typeof input === "string" ? input : obj(input).to, 180);
    if (!to.includes("@")) throw new Error("Enter the address that should receive the test.");
    return to;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const mail = await resolveMail(sql);
    if (!mail.key) throw new Error("Add a Resend API key first.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${mail.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mail.from,
        to: [data],
        subject: "Manage Tech Service test email",
        text: `This is a test from the admin desk. It was sent from ${mail.from}.`,
      }),
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

function envStripe() {
  const secret = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "").trim();
  const publishable = (process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
  return { secret, publishable, fromEnv: Boolean(secret) };
}

async function syncAlternativeEnv(sql: Sql, row: Row) {
  const env = envAlternative();
  const storedMode = alternativeMode(s(row, "alternative_environment") || "sandbox");
  if (!env.fromEnv) {
    return {
      status: s(row, "alternative_status") || "portal",
      error: s(row, "alternative_error"),
      mode: storedMode,
    };
  }
  const same =
    s(row, "alternative_status") === "connected" &&
    storedMode === env.mode &&
    s(row, "alternative_client_id") === env.clientId;
  if (same) return { status: "connected", error: "", mode: env.mode };
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
    return { status: "connected", error: "", mode: env.mode };
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
    return { status: "error", error: message, mode: env.mode };
  }
}

async function readPayments(sql: Sql): Promise<Payments> {
  const env = envStripe();
  const rows = await sql<Row>`select * from payment_settings where id = 1`;
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
    purchaseOrderEnabled ? "purchase_order" : "",
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
    alternativeEnvironmentLocked: alternative.fromEnv,
  };
}

async function stripeSecret(sql: Sql) {
  const env = envStripe();
  if (env.secret) return env.secret;
  const rows = await sql<Row>`select stripe_secret_key from payment_settings where id = 1`;
  return rows[0] ? s(rows[0], "stripe_secret_key") : "";
}

async function stripeAccount(secret: string) {
  const response = await fetch("https://api.stripe.com/v1/account", {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const text = await response.text();
  if (!response.ok) {
    let detail = "Stripe rejected the key.";
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) detail = parsed.error.message.slice(0, 180);
    } catch {
      detail = text.slice(0, 180);
    }
    throw new Error(detail);
  }
  const account = JSON.parse(text) as {
    id?: string;
    business_profile?: { name?: string | null };
    settings?: { dashboard?: { display_name?: string | null } };
  };
  return account.settings?.dashboard?.display_name || account.business_profile?.name || account.id || "Stripe account";
}

export const getPayments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Payments> => {
    const sql = await getSql();
    await loadActor(sql, context.userId);
    return readPayments(sql);
  });

export const savePayments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = obj(input);
    const terms = str(raw.invoiceTerms, 40);
    const allowed = ["Net 15", "Net 30", "Net 45"];
    return {
      cardEnabled: flag(raw.cardEnabled, false),
      invoiceEnabled: flag(raw.invoiceEnabled, true),
      purchaseOrderEnabled: flag(raw.purchaseOrderEnabled, true),
      publishableKey: str(raw.publishableKey, 120),
      secretKey: str(raw.secretKey, 200),
      clearSecret: flag(raw.clearSecret, false),
      invoiceTerms: allowed.includes(terms) ? terms : "Net 30",
      requirePo: flag(raw.requirePo, false),
      alternativeEnabled: flag(raw.alternativeEnabled, true),
      alternativeClientId: str(raw.alternativeClientId, 120),
      alternativeClientSecret: str(raw.alternativeClientSecret, 200),
      clearAlternativeSecret: flag(raw.clearAlternativeSecret, false),
      alternativeEnvironment: alternativeMode(str(raw.alternativeEnvironment, 16)),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertAdmin(actor);
    const env = envStripe();
    const alternative = envAlternative();
    const current = await sql<Row>`
      select stripe_secret_key, stripe_publishable_key, alternative_client_id, alternative_client_secret
      from payment_settings where id = 1
    `;
    const storedSecret = current[0] ? s(current[0], "stripe_secret_key") : "";
    const storedAlternativeSecret = current[0] ? s(current[0], "alternative_client_secret") : "";
    if (env.fromEnv && (data.secretKey || data.clearSecret)) {
      throw new Error("The Stripe secret is set with STRIPE_SECRET_KEY. Remove it from the server environment to edit it here.");
    }
    if (alternative.fromEnv && (data.alternativeClientSecret || data.clearAlternativeSecret)) {
      throw new Error("Alternative Payments is set with ALTERNATIVE_CLIENT_ID and ALTERNATIVE_CLIENT_SECRET.");
    }
    const secret = data.clearSecret ? "" : data.secretKey || storedSecret;
    const alternativeSecret = data.clearAlternativeSecret ? "" : data.alternativeClientSecret || storedAlternativeSecret;
    if (data.cardEnabled && !env.secret && !secret) throw new Error("Add a Stripe secret key before turning on card payments.");
    if (data.publishableKey && !data.publishableKey.startsWith("pk_")) throw new Error("The publishable key should start with pk_.");
    if (data.secretKey && !data.secretKey.startsWith("sk_") && !data.secretKey.startsWith("rk_")) {
      throw new Error("The secret key should start with sk_.");
    }
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

export const testPayments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
      return { ok: true, name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe connection failed.";
      await sql`update payment_settings set last_status = 'error', last_error = ${message} where id = 1`;
      throw new Error(message);
    }
  });

export const testAlternative = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    assertWrite(actor);
    const creds = await loadAlternativeCreds(sql);
    if (!creds) {
      throw new Error("Add an Alternative Payments client id and secret, or set ALTERNATIVE_CLIENT_ID and ALTERNATIVE_CLIENT_SECRET.");
    }
    try {
      const probed = await probeAlternative(creds);
      await sql`
        update payment_settings
        set alternative_status = 'connected', alternative_error = '', alternative_enabled = true,
            alternative_environment = ${creds.mode}, alternative_client_id = ${creds.clientId}
        where id = 1
      `;
      await audit(sql, actor, "Tested Alternative Payments", creds.mode, probed.base);
      return { ok: true, mode: creds.mode };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Alternative Payments connection failed.";
      await sql`update payment_settings set alternative_status = 'error', alternative_error = ${message} where id = 1`;
      throw new Error(message);
    }
  });

export const refreshAlternativeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    const value = intish(id);
    if (!value) throw new Error("Missing order.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await loadActor(sql, context.userId);
    await orderById(sql, data, actor);
    const creds = await loadAlternativeCreds(sql);
    if (!creds) throw new Error("Alternative Payments is not connected.");
    const row = (await sql<Row>`select alternative_invoice_id, alternative_request_id, payment_url, payment_status from orders where id = ${data}`)[0];
    const refreshed = await refreshAlternativePayment(creds, {
      invoiceId: row ? s(row, "alternative_invoice_id") : "",
      requestId: row ? s(row, "alternative_request_id") : "",
    });
    await sql`
      update orders set
        payment_status = ${refreshed.status || (row ? s(row, "payment_status") : "")},
        payment_url = ${refreshed.url || (row ? s(row, "payment_url") : "")}
      where id = ${data}
    `;
    return orderById(sql, data, actor);
  });

export const getStorefront = createServerFn({ method: "GET" }).handler(async (): Promise<Storefront> => {
  const sql = await getSql();
  const settings = await sql<Row>`select * from portal_settings where id = 1`;
  const setting = settings[0];
  const brandName = setting ? s(setting, "brand_name") || "Manage Tech Service" : "Manage Tech Service";
  const closed = setting ? !b(setting, "customer_catalog_visible") : false;
  const rows = closed ? [] : await sql<Row>`select * from products where available = true order by category, name`;
  return {
    brandName,
    slug: storeSlug(brandName),
    tagline: setting ? s(setting, "tagline") : "",
    supportEmail: setting ? s(setting, "support_email") : "",
    closed,
    products: rows.map(mapProduct),
  };
});

export const getShopCheckout = createServerFn({ method: "GET" }).handler(async (): Promise<ShopCheckoutInfo> => {
  const sql = await getSql();
  const payments = await readPayments(sql);
  return {
    methods: payments.methods.length ? payments.methods : ["invoice"],
    invoiceTerms: payments.invoiceTerms,
    alternativeEnvironment: payments.alternativeEnvironment,
  };
});

const SHIPPING = {
  standard: { label: "Standard", cents: (subtotal: number) => (subtotal >= 50000 ? 0 : 1500) },
  express: { label: "Express", cents: () => 2500 },
} as const;

function shippingChoice(method: string, subtotal: number) {
  const key = method === "express" ? "express" : "standard";
  return { method: key, label: SHIPPING[key].label, cents: SHIPPING[key].cents(subtotal) };
}

async function hashShopPassword(password: string) {
  const { randomBytes, scryptSync } = await import("node:crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

async function shopPasswordMatches(password: string, stored: string) {
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

function mapShopCustomer(row: Row): ShopCustomer {
  return {
    name: s(row, "name"),
    email: s(row, "email"),
    phone: s(row, "phone"),
    address: s(row, "address"),
    city: s(row, "city"),
    region: s(row, "region"),
    postal: s(row, "postal"),
    country: s(row, "country") || "United States",
  };
}

async function shopByToken(sql: Sql, token: string) {
  if (!token) return undefined;
  const rows = await sql<Row>`select * from shop_customers where session_token = ${token} limit 1`;
  return rows[0];
}

async function shopOrders(sql: Sql, customerId: number, email: string): Promise<ShopOrder[]> {
  const rows = await sql<Row>`
    select o.*,
      coalesce((
        select sum(oi.quantity * oi.unit_price_cents)::int from order_items oi where oi.order_id = o.id
      ), 0) as goods_cents
    from orders o
    where o.shop_customer_id = ${customerId} or lower(o.ship_email) = ${email}
    order by o.created_at desc
  `;
  const orders: ShopOrder[] = [];
  for (const row of rows) {
    const items = await sql<Row>`select * from order_items where order_id = ${n(row, "id")} order by id`;
    orders.push({
      id: n(row, "id"),
      number: `MT-${1000 + n(row, "id")}`,
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
        unitPriceCents: n(item, "unit_price_cents"),
      })),
    });
  }
  return orders;
}

export const shopRegister = createServerFn({ method: "POST" })
  .validator((input: unknown) => shopCredentials(input, true))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql<Row>`select id from shop_customers where email = ${data.email}`;
    if (existing[0]) throw new Error("An account with that email already exists. Sign in instead.");
    const token = await newShopToken();
    await sql`
      insert into shop_customers (email, name, password_hash, session_token)
      values (${data.email}, ${data.name}, ${await hashShopPassword(data.password)}, ${token})
    `;
    const shopOrg = await sql<Row>`select id from organizations where domain = 'shop.managetech.example' limit 1`;
    await openWelcomeTicket(sql, {
      name: data.name,
      email: data.email,
      organizationId: shopOrg[0] ? n(shopOrg[0], "id") : null,
      source: "Online shop account",
      detail: "Customer created an account.",
      actorName: "Online shop",
    }).catch(() => undefined);
    await upsertZendeskUser(sql, { name: data.name, email: data.email, kind: "shop" })
      .then(async (zendeskUserId) => {
        if (zendeskUserId) await sql`update shop_customers set zendesk_user_id = ${zendeskUserId} where email = ${data.email}`;
      })
      .catch(() => undefined);
    return { token, email: data.email, name: data.name };
  });

export const shopLogin = createServerFn({ method: "POST" })
  .validator((input: unknown) => shopCredentials(input, false))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<Row>`select * from shop_customers where email = ${data.email}`;
    const row = rows[0];
    if (!row || !(await shopPasswordMatches(data.password, s(row, "password_hash")))) {
      throw new Error("Email or password is wrong.");
    }
    const token = await newShopToken();
    await sql`update shop_customers set session_token = ${token} where id = ${n(row, "id")}`;
    return { token, email: s(row, "email"), name: s(row, "name") };
  });

export const shopLogout = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ token: str(obj(input).token, 80) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (data.token) await sql`update shop_customers set session_token = '' where session_token = ${data.token}`;
    return { ok: true };
  });

export const getShopAccount = createServerFn({ method: "GET" })
  .validator((token: string) => str(token, 80))
  .handler(async ({ data }): Promise<ShopAccount | null> => {
    const sql = await getSql();
    const row = await shopByToken(sql, data);
    if (!row) return null;
    return { customer: mapShopCustomer(row), orders: await shopOrders(sql, n(row, "id"), s(row, "email")) };
  });

export const saveShopProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
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
      country: str(raw.country, 80) || "United States",
    };
  })
  .handler(async ({ data }) => {
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

function shopCredentials(input: unknown, named: boolean) {
  const raw = obj(input);
  const email = str(raw.email, 160).toLowerCase();
  const password = str(raw.password, 80);
  const name = str(raw.name, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  if (password.length < 8) throw new Error("Use at least 8 characters.");
  if (named && !name) throw new Error("Enter your name.");
  return { email, password, name };
}

export const placeStorefrontOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
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
    const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
    const items = itemsRaw
      .map((item) => {
        const row = obj(item);
        return { sku: str(row.sku, 40), quantity: intish(row.quantity) ?? 0 };
      })
      .filter((item) => item.sku && item.quantity > 0 && item.quantity <= 99);
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
      notes: str(raw.notes, 1000),
      password: str(raw.password, 80),
      token: str(raw.token, 80),
      items,
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const orgs = await sql<Row>`select id from organizations where domain = 'shop.managetech.example' limit 1`;
    const org = orgs[0];
    if (!org) throw new Error("The online shop is not ready to take orders.");
    const payments = await readPayments(sql);
    const method = payments.methods.includes(data.paymentMethod) ? data.paymentMethod : payments.methods[0] || "invoice";
    const skus = data.items.map((item) => item.sku);
    const products = await sql.query<Row>(
      `select * from products where available = true and sku in (${skus.map((_, index) => `$${index + 1}`).join(",")})`,
      skus,
    );
    if (products.length !== new Set(skus).size) throw new Error("A product in your cart is no longer available.");
    const subtotal = data.items.reduce((sum, item) => {
      const product = products.find((row) => s(row, "sku") === item.sku);
      return sum + (product ? n(product, "price_cents") * item.quantity : 0);
    }, 0);
    const shipping = shippingChoice(data.shippingMethod, subtotal);
    let customerId: number | null = null;
    let token = "";
    const signedIn = await shopByToken(sql, data.token);
    if (signedIn && s(signedIn, "email") === data.email) customerId = n(signedIn, "id");
    if (!customerId && data.password.length >= 8) {
      const existing = await sql<Row>`select id from shop_customers where email = ${data.email}`;
      if (!existing[0]) {
        token = await newShopToken();
        const insertedCustomer = await sql<Row>`
          insert into shop_customers (email, name, password_hash, phone, address, city, region, postal, country, session_token)
          values (
            ${data.email}, ${data.name}, ${await hashShopPassword(data.password)}, ${data.phone},
            ${data.address}, ${data.city}, ${data.region}, ${data.postal}, ${data.country}, ${token}
          )
          returning id
        `;
        customerId = n(insertedCustomer[0], "id");
        const shopOrgId = n(org, "id");
        await openWelcomeTicket(sql, {
          name: data.name,
          email: data.email,
          organizationId: shopOrgId,
          source: "Checkout account",
          detail: "Customer created an account while placing an order.",
          actorName: "Online shop",
        }).catch(() => undefined);
        await upsertZendeskUser(sql, { name: data.name, email: data.email, kind: "shop" })
          .then(async (zendeskUserId) => {
            if (zendeskUserId) await sql`update shop_customers set zendesk_user_id = ${zendeskUserId} where id = ${customerId}`;
          })
          .catch(() => undefined);
      }
    }
    if (!customerId) {
      const byEmail = await sql<Row>`select id from shop_customers where email = ${data.email}`;
      if (byEmail[0]) customerId = n(byEmail[0], "id");
    }
    const note = [data.company, data.notes].filter(Boolean).join(" · ");
    const inserted = await sql<Row>`
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
    `;
    const id = n(inserted[0], "id");
    const lines = data.items.map((item) => {
      const product = products.find((row) => s(row, "sku") === item.sku);
      return {
        description: product ? s(product, "name") : item.sku,
        amount: product ? n(product, "price_cents") / 100 : 0,
        quantity: item.quantity,
        product,
      };
    });
    for (const line of lines) {
      if (!line.product) continue;
      await sql`
        insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents)
        values (${id}, ${n(line.product, "id")}, ${s(line.product, "name")}, ${s(line.product, "sku")}, ${line.quantity}, ${n(line.product, "price_cents")})
      `;
    }
    let paymentUrl = "";
    if (method === "alternative") {
      const creds = await loadAlternativeCreds(sql);
      if (creds) {
        try {
          const due = new Date();
          due.setDate(due.getDate() + 30);
          const checkout = await createAlternativeCheckout(creds, {
            reference: `MT-${1000 + id}`,
            returnUrl: ALTERNATIVE_PORTAL,
            externalId: `mts-shop-${data.email}`,
            name: data.name,
            email: data.email,
            existingCustomerId: "",
            dueDate: due.toISOString().slice(0, 10),
            lines: lines.map((line) => ({ description: line.description, amount: line.amount, quantity: line.quantity })),
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
    }
    await sql`
      insert into audit_logs (actor_user_id, actor_name, action, target, detail)
      values ('', 'Online shop', 'Created order', ${`MT-${1000 + id}`}, ${data.email})
    `;
    await settleNewOrder(sql, id, "Online shop");
    return { id, number: `MT-${1000 + id}`, paymentUrl, token, totalCents: subtotal + shipping.cents };
  });


