import { createServerFn } from "@tanstack/react-start";
import { filePortalTicket, loadPortalCustomer } from "@/lib/portal/api";
import { lookupKnowledge, pageById } from "@/lib/portal/knowledge";
import { affirms, declines, planUtterance, spokenFallback, type Offering, type Planned } from "@/lib/portal/sarah-plan";
import { allowTransition, confirmationFresh, confirmSnapshot, followUp, listPick, phoneChoice, quoteFor, receiptAmount, reconcileDecision, type SarahQuote, type SarahReceipt, type SarahSlots } from "@/lib/portal/sarah-state";

type Guide = { to: "/portal" | "/portal/tickets" | "/portal/tickets/new" | "/portal/shop" | "/portal/orders" | "/portal/billing" | "/portal/complaints" | "/portal/organization" | "/portal/account" | "/portal/my-services" | "/portal/quotes" | "/portal/notifications"; guide: string; label: string; ticketId?: string };

function pageFor(planned: Planned): Guide | null {
  const id =
    planned.tool === "list_tickets" || planned.tool === "open_ticket" || planned.tool === "reply_ticket" ? "tickets"
    : planned.tool === "list_orders" ? "orders"
    : planned.tool === "find_equipment" || planned.tool === "order_service" ? "shop"
    : planned.tool === "complaint" ? "complaints"
    : planned.tool === "account" || planned.tool === "update_contact" ? "account"
    : planned.tool === "list_requests" ? "services"
    : "";
  if (!id) return null;
  const page = pageById(id);
  return { to: page.to, guide: page.guide, label: page.label };
}

type Row = Record<string, unknown>;

function s(row: Row | undefined, key: string) {
  const value = row?.[key];
  return value == null ? "" : String(value);
}

function n(row: Row | undefined, key: string) {
  const value = Number(row?.[key] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

const OFFERING_LABEL: Record<Offering, string> = {
  network: "connecting the office to the network",
  "voip-line": "a VoIP phone line",
  "voip-ext": "a VoIP extension",
  "fax-physical": "a physical fax line",
  "fax-efax": "eFax",
  "internet-spectrum": "Spectrum cable internet",
  "internet-att": "AT&T Fiber",
  "internet-frontier": "Frontier Fiber",
  "internet-fixed": "fixed wireless internet",
  wiring: "wiring",
};

async function runTool(token: string, planned: Planned, approved = false): Promise<{ summary: string; cartSku?: string; needsConfirm?: Planned; show?: Guide | null; navigate?: boolean; cards?: { title: string; detail: string }[]; refs?: number[] }> {
  if (planned.tool === "ask" || planned.tool === "confirm" || planned.tool === "decline") {
    return { summary: "I can check tickets, orders, and services, or open something new. What should I take care of?" };
  }
  if (planned.tool === "show") {
    const page = pageById(planned.page);
    return { summary: `I'm opening ${page.label} now. I'll stay on the line while you look.`, show: { to: page.to, guide: page.guide, label: page.label }, navigate: true };
  }
  if (planned.tool === "lookup") {
    const found = lookupKnowledge(planned.query);
    if (!found) return { summary: "I can walk you through tickets, orders, billing, or the services we offer. What would you like to review?" };
    return { summary: found.summary, show: found.show };
  }
  const { sql, row, access } = await loadPortalCustomer(token);
  const name = s(row, "name");
  const email = s(row, "email");
  const id = n(row, "id");
  const orgId = s(row, "organization_id") ? n(row, "organization_id") : null;

  if (planned.tool === "account") {
    return {
      summary: `${name}, I have ${email} on the line${s(row, "business_name") ? ` for ${s(row, "business_name")}` : ""}. Phone on the account is ${s(row, "phone") || "not set"}.`,
    };
  }
  if (planned.tool === "list_tickets") {
    const tickets = await sql<Row>`
      select id, subject, status from tickets
      where lower(requester_email) = lower(${email})
      order by updated_at desc limit 5
    `;
    if (!tickets.length) return { summary: `${firstName(name)}, there are no tickets on this account right now.`, cards: [] };
    return {
      summary: `${firstName(name)}, here is what I have.`,
      cards: tickets.map((item) => ({ title: `Ticket ${n(item, "id")}`, detail: `${s(item, "subject")} · ${s(item, "status")}` })),
      refs: tickets.map((item) => n(item, "id")),
    };
  }
  if (planned.tool === "list_orders") {
    const orders = await sql<Row>`
      select id, status, payment_status, shipment_status from orders
      where shop_customer_id = ${id} or lower(ship_email) = lower(${email})
      order by created_at desc limit 5
    `;
    if (!orders.length) return { summary: `${firstName(name)}, I don't see any orders on this account yet.`, cards: [] };
    return {
      summary: `${firstName(name)}, here are the recent orders.`,
      cards: orders.map((item) => ({ title: `MT-${1000 + n(item, "id")}`, detail: `${s(item, "status")} · payment ${s(item, "payment_status") || "pending"} · ${s(item, "shipment_status") || "not shipped"}` })),
    };
  }
  if (planned.tool === "list_requests") {
    const rows = await sql<Row>`select id, service_name, status from service_requests where shop_customer_id = ${id} order by id desc limit 5`;
    if (!rows.length) return { summary: `${firstName(name)}, there are no service requests on this account yet.`, cards: [] };
    return { summary: `${firstName(name)}, here are the service requests.`, cards: rows.map((item) => ({ title: s(item, "service_name"), detail: s(item, "status") })) };
  }
  if (planned.tool === "open_ticket") {
    if (!access.canTicket) return { summary: "This account can't open tickets. I didn't send one." };
    const ticket = await filePortalTicket(sql, { name, email, organizationId: orgId, subject: planned.subject, category: planned.category || "Chat", body: planned.body });
    const outage = /\b(down|outage)\b/i.test(planned.subject);
    const remote = ticket.zendeskId ? ` Zendesk number ${ticket.zendeskId}.` : " Zendesk gets the copy when the connection is up.";
    return {
      summary: outage
        ? `The whole office being down is the priority. Ticket ${ticket.ticketId} is with the desk.${remote} Is it the computers only, or the phones too? I did not order a new service.`
        : `I've opened that for you. The ticket number is ${ticket.ticketId}.${remote}`,
    };
  }
  if (planned.tool === "reply_ticket") {
    const tickets = await sql<Row>`select id, zendesk_id from tickets where id = ${planned.id} and lower(requester_email) = lower(${email})`;
    if (!tickets[0]) return { summary: "I can't find that ticket on this account." };
    await sql`insert into ticket_comments (ticket_id, author_name, body, public_note) values (${planned.id}, ${name || "Customer"}, ${planned.body}, true)`;
    const copy = await deskCopy(sql, { name, email, organizationId: orgId, subject: `Sarah reply on ticket ${planned.id}`, category: "Chat", body: planned.body });
    return { summary: `I added your note to ticket ${planned.id}.${copy}` };
  }
  if (planned.tool === "complaint") {
    const ticket = await filePortalTicket(sql, { name, email, organizationId: orgId, subject: `Complaint: ${planned.subject}`, category: "Complaint", body: planned.body });
    await sql`
      insert into complaints (shop_customer_id, organization_id, kind, subject, body, status, ticket_id)
      values (${id}, ${orgId}, 'General feedback', ${planned.subject}, ${planned.body}, 'open', ${ticket.ticketId})
    `;
    return { summary: `${firstName(name)}, I logged that complaint on ticket ${ticket.ticketId}. A specialist will follow it.` };
  }
  if (planned.tool === "update_contact") {
    if (!approved) return { summary: `${firstName(name)}, I can change the phone on this account to ${planned.phone}. Press Confirm if that number is right.`, needsConfirm: planned };
    await sql`update shop_customers set phone = ${planned.phone} where id = ${id}`;
    const copy = await deskCopy(sql, { name, email, organizationId: orgId, subject: `Sarah updated phone to ${planned.phone}`, category: "Account", body: `Sarah changed the portal phone number to ${planned.phone}.` });
    return { summary: `${firstName(name)}, I updated the phone number on your account to ${planned.phone}.${copy}` };
  }
  if (planned.tool === "find_equipment") {
    if (planned.add && !access.canShop) return { summary: "This account can't shop, so I didn't add anything to a cart." };
    const like = `%${planned.query.replace(/%/g, "")}%`;
    const products = await sql<Row>`
      select sku, name, price_cents from products
      where available = true and (name ilike ${like} or category ilike ${like} or sku ilike ${like})
      order by name limit 3
    `;
    const phone = await sql<Row>`select sku, name, price_cents from products where available = true and (sku = 'desk-phone' or name ilike '%phone%') order by id limit 1`;
    const rows = products.length ? products : (/\bphone\b/i.test(planned.query) && phone[0] ? phone : []);
    if (!rows.length) return { summary: "I don't see that in the catalog. I can open a ticket so the desk can source it.", cards: [] };
    const cards = rows.map((item) => ({ title: s(item, "name"), detail: `${s(item, "sku")} · $${(n(item, "price_cents") / 100).toFixed(2)}` }));
    if (!planned.add) return { summary: `I found ${cards.length === 1 ? cards[0].title : `${cards.length} matches`}. Say add to cart if you want one.`, cards };
    const match = rows[0];
    const copy = await deskCopy(sql, { name, email, organizationId: orgId, subject: `Sarah placed ${s(match, "sku")} in the cart`, category: "Ordering", body: `Sarah placed ${s(match, "name")} (${s(match, "sku")}) in the cart after the customer asked. Checkout is still the customer's step.` });
    return { summary: `I put ${s(match, "name")} in your cart.${copy}`, cartSku: s(match, "sku"), cards };
  }
  if (planned.tool === "order_service") {
    const phoneService = planned.offering.startsWith("voip") || planned.offering.startsWith("fax");
    if (phoneService && !access.canOrderPhone) return { summary: "This account isn't set up to order phone service. I didn't send anything." };
    if (!phoneService && !access.canOrderIt) return { summary: "This account isn't set up to order that service. I didn't send anything." };
    if (planned.offering === "voip-ext" && !planned.confirmMonthly) {
      return { summary: `${firstName(name)}, an extension adds eighteen dollars a month to the Telxent bill. ${planned.shipPhone ? "I'll include a desk phone." : "No desk phone on this one."} It is not active until Telxent confirms it. Press Confirm and I will place it.`, needsConfirm: planned };
    }
    if (planned.offering === "wiring" && !planned.confirmMonthly) {
      const dollars = planned.drops * 175;
      return { summary: `${firstName(name)}, wiring is one hundred seventy-five dollars per drop. That is ${dollars} dollars for ${planned.drops} drop${planned.drops === 1 ? "" : "s"}, and it is not billed until the desk confirms the work. Press Confirm and I will send it.`, needsConfirm: planned };
    }
    if (planned.offering === "fax-efax" && !planned.recipientEmail) {
      return { summary: "What email address should receive the incoming faxes?" };
    }
    const label = OFFERING_LABEL[planned.offering];
    const detail = [
      `Service: ${label}`,
      planned.site ? `Site: ${planned.site}` : "",
      planned.recipientEmail ? `Incoming fax email: ${planned.recipientEmail}` : "",
      planned.offering === "voip-ext" ? "Customer confirmed $18 per month on the Telxent bill. Telxent confirmation is still required." : "",
      planned.shipPhone ? "Ship a desk phone." : "",
      planned.offering === "wiring" ? `Drops: ${planned.drops} at $175 each.` : "",
      planned.notes,
    ].filter(Boolean).join("\n");
    const prior = await sql<Row>`
      select id from service_requests
      where shop_customer_id = ${id} and category = ${planned.offering} and details = ${detail}
        and created_at > now() - interval '15 minutes'
      limit 1
    `;
    if (prior[0]) {
      return { summary: `${firstName(name)}, that request is already in. Request ${n(prior[0], "id")}. I didn't send a second one.` };
    }
    const inserted = await sql<Row>`
      insert into service_requests (shop_customer_id, organization_id, category, service_name, details, severity, status)
      values (${id}, ${orgId}, ${planned.offering}, ${label}, ${detail}, 'normal', 'requested')
      returning id
    `;
    const ticket = await filePortalTicket(sql, { name, email, organizationId: orgId, subject: `Order: ${label}`, category: planned.offering, body: detail });
    return {
      summary: `${firstName(name)}, I sent the request for ${label}. Request ${n(inserted[0], "id")}, ticket ${ticket.ticketId}.`,
      cartSku: planned.shipPhone ? "desk-phone" : undefined,
    };
  }
  return { summary: "Tell me what you need and I will take care of it on this account." };
}

async function deskCopy(
  sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"],
  input: { name: string; email: string; organizationId: number | null; subject: string; category: string; body: string },
) {
  const ticket = await filePortalTicket(sql, input).catch(() => null);
  if (!ticket) return "";
  return ticket.zendeskId
    ? ` Desk ticket ${ticket.ticketId}, Zendesk ${ticket.zendeskId}.`
    : ` Desk ticket ${ticket.ticketId}. Zendesk gets the copy when the connection is up.`;
}

function answer(result: { summary: string; cartSku?: string; needsConfirm?: Planned; show?: Guide | null; navigate?: boolean; cards?: { title: string; detail: string }[] }, actionId: string, notice = "") {
  return {
    reply: result.summary,
    cartSku: result.cartSku || "",
    actionId,
    show: result.navigate ? result.show ?? null : null,
    navigate: Boolean(result.navigate && result.show),
    cards: result.cards ?? [],
    notice,
    quote: actionId && result.needsConfirm ? quoteFor(result.needsConfirm) : null,
    presentation: actionId && result.needsConfirm ? "confirmation_sheet" : result.navigate ? "navigation_suggestion" : "inline_result",
    status: actionId && result.needsConfirm ? "awaiting_confirmation" : "",
    tool: result.needsConfirm?.tool || "",
  };
}

async function logEvent(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], actionId: string, from: string, to: string, detail: string) {
  if (!allowTransition(from, to) && from) return;
  await sql`
    insert into agent_action_events (id, action_id, from_status, to_status, detail)
    values (${crypto.randomUUID()}, ${actionId}, ${from}, ${to}, ${detail.slice(0, 300)})
  `;
}

async function readSlots(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number): Promise<SarahSlots> {
  const rows = await sql<Row>`select slots_json from agent_context where customer_id = ${customerId} limit 1`;
  if (!rows[0]) return {};
  try { return JSON.parse(s(rows[0], "slots_json")) as SarahSlots; } catch { return {}; }
}

async function writeSlots(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number, slots: SarahSlots) {
  const current = await readSlots(sql, customerId);
  const body = JSON.stringify({ ...current, ...slots });
  await sql`
    insert into agent_context (customer_id, slots_json, updated_at)
    values (${customerId}, ${body}, now())
    on conflict (customer_id) do update set slots_json = ${body}, updated_at = now()
  `;
}

async function moveOpenActions(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number | null) {
  if (process.env.SARAH_ACTION_ENGINE === "0") return "";
  const rows = customerId == null
    ? await sql<Row>`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where status in ('executing', 'checking_status')
        order by updated_at asc
        limit 40
      `
    : await sql<Row>`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where customer_id = ${customerId} and status in ('executing', 'checking_status')
        order by updated_at desc
        limit 5
      `;
  let notice = "";
  for (const row of rows) {
    const status = s(row, "status");
    const owner = n(row, "customer_id");
    const ageMs = Date.now() - new Date(s(row, "updated_at") || Date.now()).getTime();
    let found = false;
    if (s(row, "tool_name") === "order_service") {
      try {
        const planned = JSON.parse(s(row, "parameters_json")) as Planned;
        if (planned.tool === "order_service") {
          const hit = await sql<Row>`
            select id from service_requests
            where shop_customer_id = ${owner} and category = ${planned.offering}
              and created_at > now() - interval '20 minutes'
            limit 1
          `;
          found = Boolean(hit[0]);
        }
      } catch { found = false; }
    }
    const next = reconcileDecision({ status, ageMs: Number.isFinite(ageMs) ? ageMs : 0, resourceFound: found });
    if (!next || next === status) continue;
    if (!allowTransition(status, next)) continue;
    await sql`update agent_actions set status = ${next}, updated_at = now() where id = ${s(row, "id")}`;
    await logEvent(sql, s(row, "id"), status, next, found ? "Matched an existing request." : "No confirmed result yet.");
    if (next === "checking_status") notice = "I'm still checking whether that last request went through.";
    if (next === "manual_review") notice = "I can't confirm that last request yet, so the desk will check it.";
    if (next === "succeeded") notice = "That earlier request did go through. I didn't send it again.";
  }
  return notice;
}

async function reconcileCustomer(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number) {
  return moveOpenActions(sql, customerId);
}

export async function sweepSarahActions(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"]) {
  await moveOpenActions(sql, null);
}

async function closeConfirmation(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], actionId: string, status: "accepted" | "cancelled" | "expired") {
  await sql`
    update pending_action_confirmations
    set status = ${status}, accepted_at = case when ${status} = 'accepted' then now() else accepted_at end
    where action_id = ${actionId} and status = 'open'
  `;
}

async function holdConfirm(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number, planned: Planned) {
  const parameters = JSON.stringify(planned);
  const key = `hold-${planned.tool}-${parameters}`.slice(0, 240);
  const existing = await sql<Row>`select id, status from agent_actions where customer_id = ${customerId} and idempotency_key = ${key} order by created_at desc limit 1`;
  if (existing[0] && s(existing[0], "status") === "awaiting_confirmation") return s(existing[0], "id");
  const id = crypto.randomUUID();
  await sql`
    insert into agent_actions (id, customer_id, tool_name, status, idempotency_key, parameters_json)
    values (${id}, ${customerId}, ${planned.tool}, 'awaiting_confirmation', ${`${key}-${id}`}, ${parameters})
  `;
  await logEvent(sql, id, "", "awaiting_confirmation", planned.tool);
  const snap = confirmSnapshot(planned);
  if (snap) {
    await sql`
      insert into pending_action_confirmations (id, customer_id, action_id, tool_name, service, quantity, amount_cents, cadence, terms)
      values (${crypto.randomUUID()}, ${customerId}, ${id}, ${planned.tool}, ${snap.service}, ${snap.quantity}, ${snap.amountCents}, ${snap.cadence}, ${snap.terms})
    `;
  }
  return id;
}

async function openQuote(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number, actionId: string) {
  if (!actionId) return null;
  const rows = await sql<Row>`select parameters_json, status from agent_actions where id = ${actionId} and customer_id = ${customerId} limit 1`;
  if (!rows[0] || s(rows[0], "status") !== "awaiting_confirmation") return null;
  try {
    return quoteFor(JSON.parse(s(rows[0], "parameters_json")) as Planned);
  } catch {
    return null;
  }
}

async function takeConfirm(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number, actionId: string): Promise<Planned | "expired" | null> {
  const rows = await sql<Row>`select parameters_json, status, created_at from agent_actions where id = ${actionId} and customer_id = ${customerId} limit 1`;
  if (!rows[0] || s(rows[0], "status") !== "awaiting_confirmation") return null;
  const ageMs = Date.now() - new Date(s(rows[0], "created_at") || Date.now()).getTime();
  if (!confirmationFresh(Number.isFinite(ageMs) ? ageMs : 0)) {
    await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${actionId} and customer_id = ${customerId}`;
    await logEvent(sql, actionId, "awaiting_confirmation", "cancelled", "Quote expired.");
    await closeConfirmation(sql, actionId, "expired");
    return "expired";
  }
  await sql`update agent_actions set status = 'executing', updated_at = now() where id = ${actionId} and customer_id = ${customerId}`;
  await logEvent(sql, actionId, "awaiting_confirmation", "executing", "Customer confirmed.");
  await closeConfirmation(sql, actionId, "accepted");
  try {
    return JSON.parse(s(rows[0], "parameters_json")) as Planned;
  } catch {
    return null;
  }
}

async function finishConfirm(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], actionId: string, from: string, status: string, summary: string, receipt: SarahReceipt | null = null) {
  if (from && !allowTransition(from, status)) return;
  await sql`update agent_actions set status = ${status}, result_json = ${JSON.stringify({ summary, receipt })}, updated_at = now() where id = ${actionId}`;
  await logEvent(sql, actionId, from, status, summary);
}

async function storedReceipt(sql: Awaited<ReturnType<typeof loadPortalCustomer>>["sql"], customerId: number, actionId: string, planned: Planned, summary: string): Promise<SarahReceipt | null> {
  const rows = await sql<Row>`
    select service, amount_cents, cadence, terms
    from pending_action_confirmations
    where action_id = ${actionId} and customer_id = ${customerId}
    order by created_at desc
    limit 1
  `;
  if (!rows[0]) return null;
  const request = summary.match(/Request (\d+)/)?.[1];
  const ticket = summary.match(/[Tt]icket (\d+)/)?.[1];
  const phone = planned.tool === "update_contact" ? planned.phone : "";
  return {
    title: s(rows[0], "service") === "voip-ext" ? "VoIP extension" : s(rows[0], "service") === "wiring" ? "Wiring" : "Phone number",
    reference: request ? `Request ${request}` : ticket ? `Ticket ${ticket}` : "Updated",
    amount: receiptAmount(n(rows[0], "amount_cents"), s(rows[0], "cadence"), phone),
    note: s(rows[0], "terms"),
  };
}

const emptyDecision = { reply: "", cartSku: "", actionId: "", status: "", receipt: null as SarahReceipt | null };

export async function executeSarahDecision(token: string, actionId: string, decision: "confirm" | "cancel") {
  const { sql, row } = await loadPortalCustomer(token);
  const customerId = n(row, "id");
  if (!actionId) return { ...emptyDecision, reply: "There is no open quote." };
  if (decision === "cancel") {
    const open = await sql<Row>`select id from agent_actions where id = ${actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation' limit 1`;
    if (!open[0]) return { ...emptyDecision, reply: "That confirmation isn't open anymore." };
    await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${actionId} and customer_id = ${customerId}`;
    await logEvent(sql, actionId, "awaiting_confirmation", "cancelled", "Customer pressed Cancel.");
    await closeConfirmation(sql, actionId, "cancelled");
    return { ...emptyDecision, reply: "Understood. I did not place that.", status: "cancelled" };
  }
  const stored = await takeConfirm(sql, customerId, actionId);
  if (stored === "expired") return { ...emptyDecision, reply: "That quote expired. Tell me the service again and I'll price it fresh.", status: "cancelled" };
  if (!stored) return { ...emptyDecision, reply: "That confirmation isn't open anymore. Tell me again what you want." };
  const next = stored.tool === "order_service" ? { ...stored, confirmMonthly: true } : stored;
  let result: Awaited<ReturnType<typeof runTool>>;
  try {
    result = await runTool(token, next, true);
  } catch {
    await finishConfirm(sql, actionId, "executing", "checking_status", "The result did not come back.");
    return { ...emptyDecision, reply: "I'm still checking whether that went through. I won't send it again.", actionId, status: "checking_status" };
  }
  const receipt = await storedReceipt(sql, customerId, actionId, next, result.summary);
  await finishConfirm(sql, actionId, "executing", result.needsConfirm ? "checking_status" : "succeeded", result.summary, receipt);
  if (next.tool === "order_service") await writeSlots(sql, customerId, { offering: next.offering, drops: next.drops, site: next.site }).catch(() => undefined);
  return { reply: result.summary, cartSku: result.cartSku || "", actionId: "", status: "succeeded", receipt };
}

const TOOLS = [
  { type: "function", function: { name: "account", description: "Read the signed-in customer's name, email, company, and phone.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "list_tickets", description: "List this customer's support tickets.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "list_orders", description: "List this customer's orders and shipment status.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "list_requests", description: "List this customer's service requests.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "open_ticket", description: "Open a support ticket for this customer.", parameters: { type: "object", properties: { subject: { type: "string" }, body: { type: "string" }, category: { type: "string" } }, required: ["subject", "body"] } } },
  { type: "function", function: { name: "reply_ticket", description: "Add a public reply to one of this customer's tickets.", parameters: { type: "object", properties: { id: { type: "number" }, body: { type: "string" } }, required: ["id", "body"] } } },
  { type: "function", function: { name: "order_service", description: "Order a portal service for this customer. voip-ext needs confirmMonthly true only after they agree to $18 a month. wiring needs confirmMonthly true only after they agree to $175 per drop.", parameters: { type: "object", properties: { offering: { type: "string", enum: ["network", "voip-line", "voip-ext", "fax-physical", "fax-efax", "internet-spectrum", "internet-att", "internet-frontier", "internet-fixed", "wiring"] }, site: { type: "string" }, notes: { type: "string" }, recipientEmail: { type: "string" }, drops: { type: "number" }, shipPhone: { type: "boolean" }, confirmMonthly: { type: "boolean" } }, required: ["offering"] } } },
  { type: "function", function: { name: "complaint", description: "File a complaint for this customer.", parameters: { type: "object", properties: { subject: { type: "string" }, body: { type: "string" } }, required: ["subject", "body"] } } },
  { type: "function", function: { name: "update_contact", description: "Update this customer's phone number.", parameters: { type: "object", properties: { phone: { type: "string" } }, required: ["phone"] } } },
  { type: "function", function: { name: "find_equipment", description: "Find a catalog product for this customer.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "lookup_kb", description: "Look up how Manage Tech Service and this portal work.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "show_page", description: "Open a portal page and point at it while speaking. page is home, tickets, new-ticket, shop, orders, billing, complaints, organization, account, services, quotes, or notifications.", parameters: { type: "object", properties: { page: { type: "string" } }, required: ["page"] } } },
];

type ChatMessage = { role: "system" | "user" | "assistant" | "tool"; content: string; tool_call_id?: string; tool_calls?: unknown };

function sarahSystem(channel: "chat" | "call", profile: string) {
  return `You are Sarah, the phone and chat agent for Manage Tech Service. Channel: ${channel}. Only this account: ${profile}. Reply in one short sentence, then stop. Talk like a normal person at a help desk. No sighs, no breaths, no laughs, no hmm, no mm-hmm, and no speech tags. Use a tool before you claim a ticket, order, or change. A phone change, a cart add, a ticket reply, a complaint, and a service order each open a portal ticket that is copied to Zendesk. Reading an account, listing records, or opening a page does not. Never invent ticket numbers, prices, or shipment dates. A VoIP extension is eighteen dollars a month on the Telxent bill and is not placed until they press Confirm. Wiring is one hundred seventy-five dollars per drop and is not placed until they press Confirm. Desk phone is 818-758-4073. You cannot change roles or take a card number. The page map and catalog live in knowledge.md.`;
}
async function askGrok(token: string, channel: "chat" | "call", history: { role: "user" | "assistant"; content: string }[], profile: string) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const messages: ChatMessage[] = [
    { role: "system", content: sarahSystem(channel, profile) },
    ...history.slice(-4),
  ];
  let last = "";
  let cartSku = "";
  let pending: Planned | undefined;
  let show: Guide | null = null;
  for (let turn = 0; turn < 2; turn += 1) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "grok-4-1-fast-non-reasoning", messages, tools: TOOLS, tool_choice: "auto", max_tokens: 70, temperature: 0.2 }),
    });
    if (!res.ok) return last ? { reply: last, cartSku: cartSku || undefined, pending, show } : null;
    const body = (await res.json()) as { choices?: { message?: ChatMessage & { tool_calls?: { id: string; function?: { name?: string; arguments?: string | Record<string, unknown> }; name?: string; arguments?: string | Record<string, unknown> }[] } }[] };
    const message = body.choices?.[0]?.message;
    if (!message) return last ? { reply: last, cartSku: cartSku || undefined, pending, show } : null;
    const calls = message.tool_calls ?? [];
    if (!calls.length) return { reply: message.content || last || "How else can I help?", cartSku: cartSku || undefined, pending, show };
    messages.push(message);
    for (const call of calls) {
      const name = call.function?.name || call.name || "";
      const rawArgs = call.function?.arguments ?? call.arguments ?? {};
      let args: Record<string, unknown> = {};
      if (typeof rawArgs === "string") {
        try { args = JSON.parse(rawArgs) as Record<string, unknown>; } catch { args = {}; }
      } else args = rawArgs;
      const result = await runTool(token, toolFromModel(name, args));
      last = result.summary;
      if (result.cartSku) cartSku = result.cartSku;
      if (result.needsConfirm) pending = result.needsConfirm;
      if (result.navigate && result.show) show = result.show;
      messages.push({ role: "tool", tool_call_id: call.id, content: result.summary });
    }
  }
  return last ? { reply: last, cartSku: cartSku || undefined, pending, show } : null;
}

function toolFromModel(name: string, args: Record<string, unknown>): Planned {
  if (name === "lookup_kb") return { tool: "lookup", query: String(args.query || "").slice(0, 200) };
  if (name === "show_page") return { tool: "show", page: String(args.page || "home").slice(0, 40) };
  if (name === "account") return { tool: "account" };
  if (name === "list_tickets") return { tool: "list_tickets" };
  if (name === "list_orders") return { tool: "list_orders" };
  if (name === "list_requests") return { tool: "list_requests" };
  if (name === "open_ticket") return { tool: "open_ticket", subject: String(args.subject || "Support request").slice(0, 160), body: String(args.body || "").slice(0, 2000), category: String(args.category || "Chat").slice(0, 40) };
  if (name === "reply_ticket") return { tool: "reply_ticket", id: Number(args.id) || 0, body: String(args.body || "").slice(0, 2000) };
  if (name === "complaint") return { tool: "complaint", subject: String(args.subject || "Complaint").slice(0, 160), body: String(args.body || "").slice(0, 2000) };
  if (name === "update_contact") return { tool: "update_contact", phone: String(args.phone || "").slice(0, 40) };
  if (name === "find_equipment") return { tool: "find_equipment", query: String(args.query || "").slice(0, 80), add: false };
  if (name === "order_service") {
    const offering = String(args.offering || "network") as Offering;
    return {
      tool: "order_service",
      offering: offering in OFFERING_LABEL ? offering : "network",
      site: String(args.site || "").slice(0, 200),
      notes: String(args.notes || "").slice(0, 1000),
      recipientEmail: String(args.recipientEmail || "").slice(0, 160),
      drops: Math.min(50, Math.max(1, Number(args.drops) || 1)),
      shipPhone: Boolean(args.shipPhone),
      confirmMonthly: false,
    };
  }
  return { tool: "ask" };
}

export const askSarah = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { token?: string; channel?: string; text?: string; actionId?: string; history?: { role?: string; content?: string }[] };
    const token = String(raw.token || "").slice(0, 80);
    const text = String(raw.text || "").trim().slice(0, 1000);
    const channel = raw.channel === "call" ? "call" : "chat";
    const actionId = String(raw.actionId || "").slice(0, 80);
    const history = Array.isArray(raw.history)
      ? raw.history.slice(-6).map((item) => ({
          role: item?.role === "assistant" ? "assistant" as const : "user" as const,
          content: String(item?.content || "").slice(0, 500),
        })).filter((item) => item.content)
      : [];
    if (!token || !text) throw new Error("Say what you need.");
    return { token, text, channel, actionId, history };
  })
  .handler(async ({ data }) => runSarahTurn({ ...data, channel: data.channel === "call" ? "call" : "chat" }));

export async function runSarahTurn(data: {
  token: string;
  text: string;
  channel: "chat" | "call";
  actionId: string;
  history: { role: "user" | "assistant"; content: string }[];
}) {
    const { sql, row, access } = await loadPortalCustomer(data.token);
    const profile = `${s(row, "name")} <${s(row, "email")}> ${s(row, "business_name")}`.trim();
    const customerId = n(row, "id");
    const notice = await reconcileCustomer(sql, customerId).catch(() => "");
    const slots = await readSlots(sql, customerId).catch(() => ({} as SarahSlots));
    let planned = planUtterance(data.text);
    const choice = slots.phoneAsk === "voip-ext" ? phoneChoice(data.text) : null;
    if (choice !== null) {
      planned = { tool: "order_service", offering: "voip-ext", site: slots.site || "", notes: data.text, recipientEmail: "", drops: 1, shipPhone: choice, confirmMonthly: false };
      slots.phoneAsk = "done";
      await writeSlots(sql, customerId, { phoneAsk: "done", offering: "voip-ext" }).catch(() => undefined);
    }
    const nudge = followUp(data.text, slots);
    if (nudge?.cancel && data.actionId) {
      await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
      await logEvent(sql, data.actionId, "awaiting_confirmation", "cancelled", "Customer cancelled.").catch(() => undefined);
      await closeConfirmation(sql, data.actionId, "cancelled");
      return { reply: "Understood. I did not place that.", cartSku: "", actionId: "", show: null, navigate: false, cards: [] as { title: string; detail: string }[], notice, quote: null as SarahQuote | null };
    }
    if (nudge && "drops" in nudge && slots.offering) {
      if (data.actionId) {
        await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
        await closeConfirmation(sql, data.actionId, "cancelled");
      }
      planned = { tool: "order_service", offering: slots.offering as Offering, site: slots.site || "", notes: data.text, recipientEmail: "", drops: nudge.drops ?? slots.drops ?? 1, shipPhone: false, confirmMonthly: false };
    }
    if (data.actionId && affirms(data.text) && planned.tool !== "order_service") {
      const held = await openQuote(sql, customerId, data.actionId);
      return { reply: "Press Confirm on that quote. I won't send it from a yes in the message.", cartSku: "", actionId: held ? data.actionId : "", show: null, navigate: false, cards: [] as { title: string; detail: string }[], notice, quote: held };
    }
    if (data.actionId && (planned.tool === "decline" || declines(data.text))) {
      await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
      await logEvent(sql, data.actionId, "awaiting_confirmation", "cancelled", "Customer declined.").catch(() => undefined);
      await closeConfirmation(sql, data.actionId, "cancelled");
      return { reply: "Understood. I did not place that.", cartSku: "", actionId: "", show: null, navigate: false, cards: [] as { title: string; detail: string }[], notice, quote: null as SarahQuote | null };
    }
    const pick = listPick(data.text);
    const picked = pick == null ? undefined : slots.ticketIds?.[pick];
    if (picked) {
      return answer({
        summary: `I'm opening ticket ${picked}.`,
        navigate: true,
        show: { to: "/portal/tickets", guide: "tickets", label: `Ticket ${picked}`, ticketId: String(picked) },
      }, "", notice);
    }
    const actionable = planned.tool !== "ask" && planned.tool !== "confirm" && planned.tool !== "decline";
    if (planned.tool === "order_service") {
      const phoneService = planned.offering.startsWith("voip") || planned.offering.startsWith("fax");
      if ((phoneService && !access.canOrderPhone) || (!phoneService && !access.canOrderIt)) {
        return { reply: phoneService ? "This account isn't set up to order phone service. I didn't send anything." : "This account isn't set up to order that service. I didn't send anything.", cartSku: "", actionId: "", show: null, navigate: false, cards: [] as { title: string; detail: string }[], notice, quote: null as SarahQuote | null };
      }
    }
    if (planned.tool === "order_service" && planned.offering === "voip-ext" && !planned.shipPhone && slots.phoneAsk !== "done" && !/\b(no phone|no handset|desk phone|handset)\b/i.test(data.text)) {
      await writeSlots(sql, customerId, { phoneAsk: "voip-ext", offering: "voip-ext" }).catch(() => undefined);
      return { reply: "Before I price that, do you need a desk phone shipped, or just the extension?", cartSku: "", actionId: "", show: null, navigate: false, cards: [] as { title: string; detail: string }[], notice, quote: null as SarahQuote | null };
    }
    if (actionable) {
      const result = await runTool(data.token, planned, false);
      const actionId = result.needsConfirm ? await holdConfirm(sql, customerId, result.needsConfirm) : "";
      if (planned.tool === "order_service") await writeSlots(sql, customerId, { offering: planned.offering, drops: planned.drops, site: planned.site }).catch(() => undefined);
      if (planned.tool === "list_tickets" && result.refs) await writeSlots(sql, customerId, { ticketIds: result.refs }).catch(() => undefined);
      return answer(result, actionId, notice);
    }
    const grok = await askGrok(data.token, data.channel === "call" ? "call" : "chat", [...data.history, { role: "user", content: data.text }], profile).catch(() => null);
    if (grok?.reply) {
      const actionId = grok.pending ? await holdConfirm(sql, customerId, grok.pending) : "";
      return { reply: grok.reply, cartSku: grok.cartSku || "", actionId, show: grok.show ?? null, navigate: Boolean(grok.show), cards: [] as { title: string; detail: string }[], notice, quote: grok.pending ? quoteFor(grok.pending) : null };
    }
    const result = await runTool(data.token, { tool: "ask" });
    const held = await openQuote(sql, customerId, data.actionId);
    const joke = spokenFallback(data.text);
    const spoken = joke ? { ...result, summary: joke } : held ? { ...result, summary: "I have not sent that yet. The quote is still here if you want it." } : result;
    return { ...answer(spoken, held ? data.actionId : "", notice), quote: held };
}

export const getSarahQuote = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const token = String((input as { token?: string } | null)?.token || "").slice(0, 80);
    if (!token) throw new Error("Sign in first.");
    return { token };
  })
  .handler(async ({ data }) => {
    const { sql, row } = await loadPortalCustomer(data.token);
    const customerId = n(row, "id");
    const rows = await sql<Row>`
      select id, parameters_json, created_at
      from agent_actions
      where customer_id = ${customerId} and status = 'awaiting_confirmation'
      order by created_at desc
      limit 1
    `;
    if (!rows[0]) return { actionId: "", quote: null as SarahQuote | null };
    const ageMs = Date.now() - new Date(s(rows[0], "created_at") || Date.now()).getTime();
    if (!confirmationFresh(Number.isFinite(ageMs) ? ageMs : 0)) {
      await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${s(rows[0], "id")} and customer_id = ${customerId}`;
      await closeConfirmation(sql, s(rows[0], "id"), "expired");
      return { actionId: "", quote: null as SarahQuote | null };
    }
    try {
      const planned = JSON.parse(s(rows[0], "parameters_json")) as Planned;
      return { actionId: s(rows[0], "id"), quote: quoteFor(planned) };
    } catch {
      return { actionId: "", quote: null as SarahQuote | null };
    }
  });

function decisionInput(input: unknown) {
  const raw = input as { token?: string; actionId?: string } | null;
  const token = String(raw?.token || "").slice(0, 80);
  const actionId = String(raw?.actionId || "").slice(0, 80);
  if (!token || !actionId) throw new Error("That quote is not open.");
  return { token, actionId };
}

export const confirmSarahAction = createServerFn({ method: "POST" })
  .validator(decisionInput)
  .handler(async ({ data }) => executeSarahDecision(data.token, data.actionId, "confirm"));

export const cancelSarahAction = createServerFn({ method: "POST" })
  .validator(decisionInput)
  .handler(async ({ data }) => executeSarahDecision(data.token, data.actionId, "cancel"));

export const getSarahStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const token = String((input as { token?: string } | null)?.token || "").slice(0, 80);
    if (!token) return { token: "" };
    return { token };
  })
  .handler(async ({ data }) => {
    if (!data.token) return { banner: "" };
    try {
      const { sql, row } = await loadPortalCustomer(data.token);
      const rows = await sql<Row>`
        select tool_name, status from agent_actions
        where customer_id = ${n(row, "id")} and status in ('executing', 'checking_status', 'manual_review', 'awaiting_confirmation')
        order by updated_at desc limit 1
      `;
      const status = s(rows[0], "status");
      if (status === "awaiting_confirmation") return { banner: "Sarah is waiting on a yes before she sends that." };
      if (status === "manual_review") return { banner: "Sarah could not confirm the last request. The desk is checking it." };
      if (status === "checking_status" || status === "executing") return { banner: "Sarah is still checking whether that last request went through." };
      return { banner: "" };
    } catch {
      return { banner: "" };
    }
  });

function humanSpeech(text: string) {
  const clean = text
    .replace(/\[[^\]]+\]|<[^>]+>/g, " ")
    .replace(/\b(sigh|sighs|breath|breathe|breathing|chuckle|chuckles|laughs)\b/gi, " ")
    .replace(/^(ha+|haha|hehe|hmm+|ahh+|ohh+|mm-?hmm|uh-?huh|um+|uh+)[,.! ]+/i, "")
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\$18(?:\s*\/\s*|\s+per\s+)month/gi, "eighteen dollars per month")
    .replace(/\$175/g, "one hundred seventy-five dollars")
    .replace(/\s+/g, " ")
    .trim();
  return clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 2).join(" ");
}

export const speakSarah = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const text = String((input as { text?: string })?.text || "").replace(/\s+/g, " ").trim().slice(0, 700);
    if (!text) throw new Error("Nothing to say.");
    return { text: humanSpeech(text) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { audio: "" };
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        text: data.text,
        voice_id: "ara",
        language: "en",
        speed: 1.05,
        output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 64000 },
      }),
    });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("audio")) return { audio: "" };
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.byteLength < 100) return { audio: "" };
    return { audio: bytes.toString("base64") };
  });

export const hearSarah = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { audio?: string; mime?: string };
    const audio = String(raw.audio || "");
    const mime = String(raw.mime || "audio/webm").split(";")[0] || "audio/webm";
    if (!audio || audio.length > 1_800_000) throw new Error("I didn't catch that.");
    return { audio, mime };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { text: "" };
    const bytes = Buffer.from(data.audio, "base64");
    const ext = data.mime.includes("mp4") ? "m4a" : data.mime.includes("ogg") ? "ogg" : data.mime.includes("wav") ? "wav" : "webm";
    const form = new FormData();
    form.append("model", "grok-voice-transcribe-2.0");
    form.append("language", "en");
    form.append("format", "true");
    for (const term of ["Manage Tech Service", "Telxent", "VoIP", "eFax", "Zendesk"]) form.append("keyterm", term);
    form.append("file", new File([new Uint8Array(bytes)], `turn.${ext}`, { type: data.mime }));
    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return { text: "" };
    const body = (await res.json()) as { text?: string; transcript?: string };
    return { text: String(body.text || body.transcript || "").trim() };
  });
