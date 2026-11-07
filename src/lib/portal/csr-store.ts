import type { Sql } from "../db";
import { canonical, needsConfirmation, permitted, type CsrAccess } from "./csr-policy.ts";

type Row = Record<string, unknown>;
export type CsrRecord = Record<string, string | number | boolean | null>;
export type CsrContext = {
  profile: CsrRecord | null;
  policy: CsrRecord | null;
  sites: CsrRecord[];
  services: CsrRecord[];
  assets: CsrRecord[];
};
export const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export class CsrError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export async function requestBody(request: Request): Promise<Row> {
  const raw = await request.text();
  if (raw.length > 64_000) throw new CsrError("Request is too large.", 413);
  if (!raw) return {};
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new CsrError("Invalid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new CsrError("Expected a JSON object.");
  return value as Row;
}

export async function createCsrSession(
  sql: Sql,
  customerId: number,
  portalHash: string,
  authSessionId: string,
) {
  const rows =
    await sql<Row>`select c.session_token from shop_customers c join "user" u on lower(u.email)=lower(c.email) join "session" a on a."userId"=u.id where c.id=${customerId} and c.session_expires>now() and a.id=${authSessionId} and a."expiresAt">now()`;
  if (!rows[0] || !portalHash || (await digest(String(rows[0].session_token))) !== portalHash)
    throw new CsrError("Portal session expired.", 401);
  const token = `csr_${crypto.randomUUID()}${crypto.randomUUID()}`;
  await sql`insert into csr_sessions(token_hash,customer_id,portal_token_hash,auth_session_id) values(${await digest(token)},${customerId},${portalHash},${authSessionId})`;
  return token;
}

export async function authorizeCsrSession(sql: Sql, header: string) {
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith("csr_")) return null;
  const rows = await sql<Row>`
    select s.customer_id, s.portal_token_hash, c.session_token from csr_sessions s
    join shop_customers c on c.id = s.customer_id
    join "session" a on a.id = s.auth_session_id
    join "user" u on u.id=a."userId" and lower(u.email)=lower(c.email)
    where s.token_hash = ${await digest(token)} and s.expires_at > now() and c.session_expires > now() and a."expiresAt">now()
  `;
  const row = rows[0];
  if (!row || (await digest(String(row.session_token))) !== row.portal_token_hash) return null;
  return {
    id: `customer:${row.customer_id}`,
    name: "Sarah customer session",
    scope: "customer",
    customerId: Number(row.customer_id),
    sql,
  };
}

export async function customerContext(sql: Sql, customerId: number): Promise<CsrContext> {
  const [profiles, policies, sites, services, assets] = await Promise.all([
    sql<Row>`select preferred_name, title, department, alternate_phone, timezone, language, billing_contact_name, billing_contact_email, it_contact_name, it_contact_email, notifications_push, quiet_start, quiet_end from csr_profiles where customer_id = ${customerId}`,
    sql<Row>`select spending_limit_cents, approval_threshold_cents, po_required, payment_terms, approver_name, approver_email, support_hours, sla, escalation_contact from csr_account_policies where customer_id = ${customerId}`,
    sql<Row>`select id, name, address, city, region, postal, country, contact_name, contact_phone, access_hours from csr_sites where customer_id = ${customerId} order by created_at`,
    sql<Row>`select id, service_name, category, status, quantity, site_id, provider_reference, assigned_users, recipients_json, handset_sku, monthly_cents from service_requests where shop_customer_id = ${customerId} order by created_at desc limit 50`,
    sql<Row>`select id,site_id,name,category,model,serial,managed,notes from csr_assets where customer_id=${customerId} order by name`,
  ]);
  return {
    profile: (profiles[0] || null) as CsrRecord | null,
    policy: (policies[0] || null) as CsrRecord | null,
    sites: sites as CsrRecord[],
    services: services as CsrRecord[],
    assets: assets as CsrRecord[],
  };
}

export async function saveCsrProfile(sql: Sql, customerId: number, body: Row) {
  const timezone = text(body.timezone, 80) || "America/Los_Angeles";
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  } catch {
    throw new CsrError("Choose a valid timezone.");
  }
  for (const key of ["billing_contact_email", "it_contact_email"])
    if (body[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(body[key])))
      throw new CsrError("Enter a valid contact email.");
  const start = Number(body.quiet_start ?? 22),
    end = Number(body.quiet_end ?? 7);
  if (![start, end].every((v) => Number.isInteger(v) && v >= 0 && v < 24))
    throw new CsrError("Quiet hours must be from 0 to 23.");
  await sql`
    insert into csr_profiles(customer_id, preferred_name, title, department, alternate_phone, timezone, language, billing_contact_name, billing_contact_email, it_contact_name, it_contact_email, notifications_push, quiet_start, quiet_end)
    values(${customerId}, ${text(body.preferred_name, 120)}, ${text(body.title, 120)}, ${text(body.department, 120)}, ${text(body.alternate_phone, 40)}, ${timezone}, ${text(body.language, 30) || "en"}, ${text(body.billing_contact_name, 120)}, ${text(body.billing_contact_email, 160)}, ${text(body.it_contact_name, 120)}, ${text(body.it_contact_email, 160)}, ${body.notifications_push === true}, ${start}, ${end})
    on conflict(customer_id) do update set preferred_name=excluded.preferred_name, title=excluded.title, department=excluded.department,
      alternate_phone=excluded.alternate_phone, timezone=excluded.timezone, language=excluded.language,
      billing_contact_name=excluded.billing_contact_name, billing_contact_email=excluded.billing_contact_email,
      it_contact_name=excluded.it_contact_name, it_contact_email=excluded.it_contact_email,
      notifications_push=excluded.notifications_push, quiet_start=excluded.quiet_start, quiet_end=excluded.quiet_end, updated_at=now()
  `;
}

export async function saveCsrSite(sql: Sql, customerId: number, body: Row) {
  if (!text(body.name) || !text(body.address))
    throw new CsrError("Site name and service address are required.");
  const id = text(body.id, 80) || crypto.randomUUID();
  const existing = await sql<Row>`select customer_id from csr_sites where id=${id}`;
  if (existing[0] && Number(existing[0].customer_id) !== customerId)
    throw new CsrError("Site not found.", 404);
  await sql`
    insert into csr_sites(id,customer_id,name,address,city,region,postal,country,contact_name,contact_phone,access_hours)
    values(${id},${customerId},${text(body.name, 120)},${text(body.address)},${text(body.city, 80)},${text(body.region, 80)},${text(body.postal, 20)},${text(body.country, 80) || "United States"},${text(body.contact_name, 120)},${text(body.contact_phone, 40)},${text(body.access_hours, 160)})
    on conflict(id) do update set name=excluded.name,address=excluded.address,city=excluded.city,region=excluded.region,postal=excluded.postal,country=excluded.country,contact_name=excluded.contact_name,contact_phone=excluded.contact_phone,access_hours=excluded.access_hours
    where csr_sites.customer_id=${customerId}
  `;
  return { id };
}

async function fingerprint(method: string, path: string, body: Row) {
  return digest(`${method}\n${path}\n${canonical(body)}`);
}

async function actionDescription(sql: Sql, customerId: number, path: string, body: Row) {
  const resource = path.split("/").slice(5).join("/");
  if (resource === "orders") {
    const items = Array.isArray(body.items) ? (body.items as Row[]) : [];
    if (!items.length || items.length > 20)
      throw new CsrError("Choose from 1 to 20 catalog items.");
    let amount = 0;
    const descriptions: string[] = [],
      seen = new Set<string>();
    for (const item of items) {
      const quantity = Number(item.quantity);
      const sku = text(item.sku, 80);
      if (seen.has(sku)) throw new CsrError("Combine duplicate catalog items into one quantity.");
      seen.add(sku);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
        throw new CsrError("Quantity must be from 1 to 99.");
      const products =
        await sql<Row>`select name,price_cents,stock from products where sku=${text(item.sku, 80)} and available=true`;
      if (!products[0] || Number(products[0].stock) < quantity)
        throw new CsrError("That item is unavailable in the requested quantity.");
      amount += Number(products[0].price_cents) * quantity;
      descriptions.push(`${quantity} × ${products[0].name}`);
    }
    const policies =
      await sql<Row>`select spending_limit_cents,approval_threshold_cents,po_required from csr_account_policies where customer_id=${customerId}`;
    const policy = policies[0];
    if (policy?.spending_limit_cents != null && amount > Number(policy.spending_limit_cents))
      throw new CsrError("This exceeds the account spending limit.", 403);
    if (
      policy?.approval_threshold_cents != null &&
      amount > Number(policy.approval_threshold_cents)
    )
      throw new CsrError("An account approver must approve this purchase.", 403);
    if (policy?.po_required === true && !text(body.purchaseOrder, 100))
      throw new CsrError("A purchase order number is required.");
    const shipping = body.shippingMethod === "express" ? 2500 : amount >= 50000 ? 0 : 1500;
    return `${descriptions.join(", ")}. Equipment: $${(amount / 100).toFixed(2)} USD. Shipping: $${(shipping / 100).toFixed(2)}. Total: $${((amount + shipping) / 100).toFixed(2)} USD. ${body.payLater === true ? "Use approved invoice terms." : "Payment is required; placing an order does not mark it paid."}`;
  }
  if (resource === "services" && body.offering === "voip-ext")
    return `${Number(body.quantity) || 1} VoIP extension(s) at $18 USD per month each. Telxent must confirm activation and billing. ${body.shipPhone === true ? "A handset is a separate catalog purchase." : ""}`;
  if (resource === "services" && body.offering === "wiring")
    return `${Number(body.drops) || 1} network drop(s) at $175 USD each. Total: $${(Number(body.drops) || 1) * 175}. Scheduling and work confirmation are required.`;
  return `${requestLabel(resource)}${text(body.subject || body.name || body.offering, 160) ? `: ${text(body.subject || body.name || body.offering, 160)}` : ""}. ${resource === "" ? "Save these account details." : ""}`;
}
function requestLabel(resource: string) {
  if (resource.endsWith("/close")) return "Resolve this support ticket";
  if (resource.endsWith("/cancel")) return "Cancel this order";
  if (resource.endsWith("/pay")) return "Retrieve the payment link";
  if (resource.endsWith("/delete")) return "Permanently delete this order";
  if (/tickets\/\d+\/replies/.test(resource)) return "Post a public reply on this ticket";
  return (
    (
      {
        services: "Submit a service request",
        tickets: "Create a support ticket",
        complaints: "File a complaint",
        organization: "Submit a company update",
        sites: "Save this site",
        context: "Save support preferences",
      } as Record<string, string>
    )[resource] || "Confirm this account action"
  );
}

export async function runConfirmedAction(
  request: Request,
  sql: Sql,
  customerId: number,
  access: CsrAccess,
  execute: () => Promise<Response>,
) {
  const resource = new URL(request.url).pathname.split("/").slice(5).join("/");
  const body = request.method === "GET" ? {} : await requestBody(request.clone());
  if (!permitted(access, request.method, resource, body))
    return reply({ error: "This account is not authorized for that action." }, 403);
  if (!needsConfirmation(request.method, resource)) return execute();
  const actionId = request.headers.get("X-MTS-Action-Id") || "";
  const rows =
    await sql<Row>`select * from csr_actions where id=${actionId} and customer_id=${customerId}`;
  const action = rows[0];
  if (
    !action ||
    action.fingerprint !== (await fingerprint(request.method, new URL(request.url).pathname, body))
  )
    return reply({ error: "Review and confirm this exact action first." }, 428);
  if (action.status === "succeeded" && action.result_json)
    return reply(JSON.parse(String(action.result_json)), Number(action.response_status) || 200);
  if (
    action.title !== (await actionDescription(sql, customerId, new URL(request.url).pathname, body))
  )
    return reply(
      {
        error:
          "The price, availability, or account policy changed. Review a new confirmation before proceeding.",
      },
      409,
    );
  const claimed =
    await sql<Row>`update csr_actions set status='executing',updated_at=now() where id=${actionId} and customer_id=${customerId} and status='approved' and expires_at>now() returning id`;
  if (!claimed[0])
    return reply(
      {
        error:
          "This action is expired, cancelled, or already being processed. Check its status before trying again.",
        actionId,
        status: action.status,
      },
      409,
    );
  try {
    const response = await execute();
    const result = await response.clone().text();
    // Failed writes may already have created local or remote resources. Never retry automatically.
    await sql`update csr_actions set status=${response.ok ? "succeeded" : "manual_review"},result_json=${result},response_status=${response.status},updated_at=now() where id=${actionId} and customer_id=${customerId}`;
    return response;
  } catch (error) {
    await sql`update csr_actions set status='manual_review',updated_at=now() where id=${actionId} and customer_id=${customerId}`;
    throw error;
  }
}

export async function handleCsrResource(
  request: Request,
  sql: Sql,
  customerId: number,
  organizationId: number | null,
  access: CsrAccess,
): Promise<Response | null> {
  const url = new URL(request.url),
    resource = url.pathname.split("/").slice(5),
    kind = resource[0];
  const body = request.method === "GET" ? {} : await requestBody(request.clone());
  if (kind === "context") {
    if (request.method === "GET") return reply(await customerContext(sql, customerId));
    if (request.method === "PATCH") {
      await saveCsrProfile(sql, customerId, body);
      return reply({ saved: true });
    }
  }
  if (kind === "sites" && request.method === "POST")
    return reply(await saveCsrSite(sql, customerId, body), 201);
  if (kind === "confirmations") {
    if (resource.length === 1 && request.method === "POST") {
      const method = text(body.method, 10),
        path = text(body.path, 200),
        payload = (
          body.body && typeof body.body === "object" && !Array.isArray(body.body) ? body.body : {}
        ) as Row;
      if (
        !["POST", "PATCH"].includes(method) ||
        !path.startsWith(`/api/agent/customers/${customerId}`) ||
        path.split("/")[4] !== String(customerId)
      )
        throw new CsrError("Invalid action target.");
      const target = path.split("/").slice(5).join("/");
      if (!needsConfirmation(method, target) || target.endsWith("/delete"))
        throw new CsrError("This action is not available through customer support.", 403);
      if (!permitted(access, method, target, payload))
        throw new CsrError("This account is not authorized for that action.", 403);
      const title = await actionDescription(sql, customerId, path, payload),
        hash = await fingerprint(method, path, payload);
      await sql`update csr_actions set status='expired',updated_at=now() where customer_id=${customerId} and fingerprint=${hash} and status in ('pending','approved') and (expires_at<=now() or title<>${title})`;
      const id = crypto.randomUUID();
      await sql`insert into csr_actions(id,customer_id,method,path,body_json,fingerprint,title) values(${id},${customerId},${method},${path},${canonical(payload)},${hash},${title}) on conflict do nothing`;
      const actions =
        await sql<Row>`select id,title,status from csr_actions where customer_id=${customerId} and fingerprint=${hash} and status in ('pending','approved','executing','manual_review') order by created_at desc limit 1`;
      const action = actions[0];
      if (!action)
        throw new CsrError(
          "Action state changed. Check the existing request before continuing.",
          409,
        );
      if (["executing", "manual_review"].includes(String(action.status)))
        throw new CsrError(
          `Action ${action.id} is awaiting reconciliation. Check its status; do not submit another copy.`,
          409,
        );
      return reply(
        {
          id: action.id,
          title: action.title,
          method,
          path,
          details: payload,
          status: action.status,
        },
        201,
      );
    }
    const id = text(resource[1], 80);
    if (request.method === "GET") {
      const rows =
        await sql<Row>`select id,title,status,result_json,review_note,created_at,updated_at from csr_actions where id=${id} and customer_id=${customerId}`;
      return rows[0] ? reply(rows[0]) : reply({ error: "Action not found." }, 404);
    }
    if (request.method === "POST" && ["accept", "cancel"].includes(resource[2])) {
      const status = resource[2] === "accept" ? "approved" : "cancelled";
      const rows =
        await sql<Row>`update csr_actions set status=${status},accepted_at=case when ${status}='approved' then now() else null end,updated_at=now() where id=${id} and customer_id=${customerId} and status='pending' and expires_at>now() returning id,status`;
      return rows[0]
        ? reply(rows[0])
        : reply({ error: "This confirmation has expired or was already answered." }, 409);
    }
  }
  if (kind === "conversations") {
    if (resource.length === 1 && request.method === "GET") {
      const before =
        text(url.searchParams.get("before"), 80) || new Date(Date.now() + 1000).toISOString();
      if (!Number.isFinite(Date.parse(before))) throw new CsrError("Invalid history cursor.");
      return reply(
        await sql<Row>`select id,title,status,summary,created_at,updated_at from csr_conversations where customer_id=${customerId} and updated_at<${before}::timestamptz order by updated_at desc,id desc limit 30`,
      );
    }
    if (resource.length === 1 && request.method === "POST") {
      const id = crypto.randomUUID();
      await sql`insert into csr_conversations(id,customer_id,title) values(${id},${customerId},${text(body.title, 120) || "Conversation with Sarah"})`;
      return reply({ id }, 201);
    }
    const conversationId = text(resource[1], 80);
    const owned =
      await sql<Row>`select id from csr_conversations where id=${conversationId} and customer_id=${customerId}`;
    if (!owned[0]) return reply({ error: "Conversation not found." }, 404);
    if (resource[2] === "messages" && request.method === "GET") {
      const before = Number(url.searchParams.get("before") || Number.MAX_SAFE_INTEGER);
      if (!Number.isSafeInteger(before) || before <= 0)
        throw new CsrError("Invalid message cursor.");
      const rows =
        await sql<Row>`select id,external_id,role,body,created_at from csr_messages where conversation_id=${conversationId} and id<${before} order by id desc limit 100`;
      return reply(rows.reverse());
    }
    if (resource[2] === "messages" && request.method === "POST") {
      const role = body.role,
        externalId = text(body.externalId, 160),
        message = text(body.body, 16000);
      if (!["user", "assistant"].includes(String(role)) || !externalId || !message)
        throw new CsrError("Message identity, role and body are required.");
      await sql`insert into csr_messages(conversation_id,external_id,role,body) values(${conversationId},${externalId},${role},${message}) on conflict(conversation_id,external_id) do update set body=excluded.body`;
      await sql`update csr_conversations set updated_at=now(),title=case when title='Conversation with Sarah' and ${role}='user' then ${message.slice(0, 100)} else title end where id=${conversationId} and customer_id=${customerId}`;
      return reply({ saved: true });
    }
  }
  if (kind === "knowledge" && request.method === "GET") {
    const query = text(url.searchParams.get("q"), 120).replace(/[%_]/g, "");
    if (query.length < 2) throw new CsrError("Enter a search term.");
    return reply(
      await sql<Row>`select id,title,body,source_url,updated_at from csr_knowledge where approved=true and (organization_id is null or organization_id=${organizationId}) and (title ilike ${`%${query}%`} or body ilike ${`%${query}%`}) order by updated_at desc limit 5`,
    );
  }
  if (kind === "ledger" && request.method === "GET") {
    const documents =
      await sql<Row>`select source,external_id,number,currency,total_cents,outstanding_cents,due_date,status,source_updated_at from csr_billing_documents where customer_id=${customerId} order by source_updated_at desc limit 100`;
    const services =
      await sql<Row>`select service_name,status,quantity,monthly_cents,provider_reference from service_requests where shop_customer_id=${customerId} and monthly_cents>0 order by created_at desc`;
    return reply({
      connected: documents.length > 0,
      documents,
      recurringServices: services,
      note: documents.length
        ? "Balances are supplied by the billing source; check source_updated_at."
        : "No billing-source records have been synchronized. Portal orders are not an accounting ledger.",
    });
  }
  if (kind === "push") {
    if (request.method === "GET")
      return reply({
        publicKey: process.env.CSR_VAPID_PUBLIC_KEY || "",
        configured: Boolean(process.env.CSR_VAPID_PUBLIC_KEY && process.env.CSR_VAPID_PRIVATE_KEY),
      });
    if (request.method === "POST") {
      const subscription = body.subscription as Row | undefined,
        endpoint = text(subscription?.endpoint, 2000),
        keys = subscription?.keys as Row | undefined;
      let target: URL;
      try {
        target = new URL(endpoint);
      } catch {
        throw new CsrError("Invalid push endpoint.");
      }
      // Only known push providers; stored endpoints are later fetched by the worker.
      if (
        target.protocol !== "https:" ||
        !/(^|\.)(push\.services\.mozilla\.com|fcm\.googleapis\.com|web\.push\.apple\.com|notify\.windows\.com)$/.test(
          target.hostname,
        ) ||
        !text(keys?.p256dh, 200) ||
        !text(keys?.auth, 100)
      )
        throw new CsrError("Unsupported push subscription.");
      await sql`insert into csr_push_subscriptions(endpoint,customer_id,subscription_json) values(${endpoint},${customerId},${JSON.stringify(subscription)}) on conflict(endpoint) do update set customer_id=excluded.customer_id,subscription_json=excluded.subscription_json`;
      await sql`insert into csr_profiles(customer_id,notifications_push) values(${customerId},true) on conflict(customer_id) do update set notifications_push=true`;
      return reply({ subscribed: true });
    }
  }
  return null;
}
