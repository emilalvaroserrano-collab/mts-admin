// @ts-nocheck
import assert from "node:assert/strict";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { upsCheckDigitOk } from "./awb";
import {
  createOrder,
  getOrder,
  getPeople,
  getShopAccount,
  getTicket,
  linkOrderTicket,
  listProducts,
  listTickets,
  replyTicket,
  reviewRequest,
  saveCustomer,
  shopLogin,
  shopRegister,
  trackAwb,
  updateOrder,
} from "./api";

type TicketPost = { subject?: string; requester?: { email?: string }; tags?: string[] };

type Exec = {
  __executeServer: (opts: { data?: unknown }) => Promise<{ result?: unknown; error?: unknown }>;
};

async function call<T>(fn: Exec, data?: unknown): Promise<T> {
  const executed = await fn.__executeServer({ data });
  if (executed.error) throw executed.error;
  if (executed.result === undefined) {
    throw new Error(`Server function returned no result: ${JSON.stringify(executed)}`);
  }
  return executed.result as T;
}

const VALID_AWB = "1Z999AA10123456784";

function installZendesk() {
  process.env.ZENDESK_SUBDOMAIN = "shop";
  process.env.ZENDESK_OAUTH_CLIENT_ID = "e2e-client";
  process.env.ZENDESK_OAUTH_CLIENT_SECRET = "e2e-secret";
  let nextId = 88000;
  const posts: TicketPost[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/oauth/tokens")) {
      return new Response(JSON.stringify({ access_token: "e2e-token", expires_in: 3600 }), { status: 200 });
    }
    if (url.includes("/api/v2/tickets")) {
      const body = init?.body ? (JSON.parse(String(init.body)) as { ticket?: TicketPost }) : {};
      if (init?.method === "POST") posts.push(body.ticket ?? {});
      nextId += 1;
      return new Response(JSON.stringify({ ticket: { id: nextId } }), { status: 200 });
    }
    return original(input, init);
  }) as typeof fetch;
  return posts;
}

export async function runPortalFlow() {
  const { H3Event } = await import("h3-v2");
  await import("@tanstack/react-start/server");
  const eventStorage = (globalThis as Record<symbol, { run: <T>(store: unknown, fn: () => T) => T }>)[
    Symbol.for("tanstack-start:event-storage")
  ];
  const request = new Request("http://127.0.0.1:8080/");
  if (!eventStorage) throw new Error("Start event storage is not ready.");
  return eventStorage.run({ h3Event: new H3Event(request) }, () =>
    runWithStartContext(
      {
        request,
        startOptions: { functionMiddleware: [] },
        contextAfterGlobalMiddlewares: {},
        executedRequestMiddlewares: new Set(),
      },
      () => exercise(),
    ),
  );
}

async function exercise() {
  assert.equal(upsCheckDigitOk(VALID_AWB), true);
  assert.equal(upsCheckDigitOk("1Z999AA10123456785"), false);
  const zendeskPosts = installZendesk();

  const people = await call<Awaited<ReturnType<typeof getPeople>>>(getPeople);
  const harbor = people.orgs.find((org) => org.name === "Harbor & Pine Dental");
  assert.ok(harbor, "seeded companies are present");
  const pending = people.requests.filter((request) => request.status === "pending");
  const ruth = pending.find((request) => request.requestedEmail === "ruth.ibarra@northline.example");
  const maya = pending.find((request) => request.requestedEmail === "maya.chen@fieldnote.example");
  assert.ok(ruth && maya, "seeded access requests are pending");

  const stamp = Date.now();
  const invited = await call<Awaited<ReturnType<typeof saveCustomer>>>(saveCustomer, {
      organizationId: harbor.id,
      name: "Ada Quill",
      email: `ada.quill.${stamp}@harborpine.example`,
      title: "Clinic buyer",
      permissionLevel: "authorized",
      canOrder: true,
      canRequestUsers: false,
      canApproveOrders: false,
      active: true,
      zendeskUserId: "",
    },
  );
  assert.ok(invited.ticketId > 0, "inviting a person opens a portal ticket");
  assert.ok(invited.zendeskId, "the same ticket is created in Zendesk");
  assert.equal(zendeskPosts.at(-1)?.subject, "New user: Ada Quill");
  assert.equal(zendeskPosts.at(-1)?.requester?.email, `ada.quill.${stamp}@harborpine.example`);
  assert.ok(zendeskPosts.at(-1)?.tags?.includes("new_user"));

  const opened = await call<Awaited<ReturnType<typeof getTicket>>>(getTicket, invited.ticketId);
  assert.equal(opened.ticket.subject, "New user: Ada Quill");
  assert.equal(opened.ticket.zendeskId, invited.zendeskId);
  assert.ok(opened.comments.some((comment) => comment.body.includes("Admin invite")));
  const reply = await call<Awaited<ReturnType<typeof replyTicket>>>(replyTicket, {
    ticketId: invited.ticketId,
    body: "Account is ready for the clinic.",
    publicNote: true,
  });
  assert.equal(reply.warning, "");
  const afterReply = await call<Awaited<ReturnType<typeof getTicket>>>(getTicket, invited.ticketId);
  assert.equal(afterReply.ticket.status, "open");
  assert.ok(afterReply.comments.some((comment) => comment.body.includes("clinic")));

  const approved = await call<Awaited<ReturnType<typeof reviewRequest>>>(reviewRequest, { id: ruth.id, decision: "approved" });
  assert.ok(approved.zendeskId, "approving a request creates a Zendesk ticket");
  assert.equal(zendeskPosts.at(-1)?.subject, "New user: Ruth Ibarra");
  const denied = await call<Awaited<ReturnType<typeof reviewRequest>>>(reviewRequest, { id: maya.id, decision: "denied" });
  assert.equal(denied.ticketId, 0);
  const afterReview = await call<Awaited<ReturnType<typeof getPeople>>>(getPeople);
  assert.ok(afterReview.people.some((person) => person.email === "ruth.ibarra@northline.example"));
  assert.equal(afterReview.people.some((person) => person.email === "maya.chen@fieldnote.example"), false);

  const catalog = await call<Awaited<ReturnType<typeof listProducts>>>(listProducts);
  const product = catalog.find((item) => item.sku === "MT-D1" && item.available);
  assert.ok(product, "the dock is in the catalog");
  const order = await call<Awaited<ReturnType<typeof createOrder>>>(createOrder, {
    organizationId: harbor.id,
    customerUserId: invited.id,
    notes: "Front desk dock",
    paymentMethod: "invoice",
    returnUrl: "",
    items: [{ productId: product.id, quantity: 1 }],
  });
  const scanned = await call<Awaited<ReturnType<typeof trackAwb>>>(trackAwb, "1Z 999 AA1 0123 4567 84");
  assert.equal(scanned.awb, VALID_AWB);
  assert.equal(scanned.carrier, "UPS");
  assert.equal(scanned.valid, true);
  assert.equal(scanned.configured, false);
  const bad = await call<Awaited<ReturnType<typeof trackAwb>>>(trackAwb, "1Z999AA10123456785");
  assert.equal(bad.valid, false);
  await call(updateOrder, {
    id: order.id,
    status: "processing",
    approvalNote: "",
    processingNote: "Label scanned at the bench.",
    shipmentStatus: scanned.shipmentStatus || "shipped",
    trackingNumber: scanned.awb,
    trackingCarrier: scanned.carrier,
  });
  const saved = await call<Awaited<ReturnType<typeof getOrder>>>(getOrder, order.id);
  assert.equal(saved.order.trackingNumber, VALID_AWB);
  assert.equal(saved.order.trackingCarrier, "UPS");
  assert.equal(saved.order.shipmentStatus, "shipped");
  assert.equal(saved.order.customerName, "Ada Quill");
  const linked = await call<Awaited<ReturnType<typeof linkOrderTicket>>>(linkOrderTicket, order.id);
  assert.ok(linked.ticketId > 0);
  assert.equal(linked.warning, "");
  const linkedOrder = await call<Awaited<ReturnType<typeof getOrder>>>(getOrder, order.id);
  assert.equal(linkedOrder.order.ticketId, linked.ticketId);

  const shopEmail = `jun.park.${stamp}@shop.example`;
  const account = await call<Awaited<ReturnType<typeof shopRegister>>>(shopRegister, {
    name: "Jun Park",
    email: shopEmail,
    password: "warehouse-pass",
  });
  assert.equal(account.email, shopEmail);
  assert.equal(zendeskPosts.at(-1)?.subject, "New user: Jun Park");
  assert.equal(zendeskPosts.at(-1)?.requester?.email, shopEmail);
  const signedIn = await call<Awaited<ReturnType<typeof shopLogin>>>(shopLogin, {
    email: shopEmail,
    password: "warehouse-pass",
  });
  const profile = await call<Awaited<ReturnType<typeof getShopAccount>>>(getShopAccount, signedIn.token);
  assert.equal(profile?.customer.email, shopEmail);

  const tickets = await call<Awaited<ReturnType<typeof listTickets>>>(listTickets, { status: "all" });
  const subjects = tickets.tickets.map((ticket) => ticket.subject);
  assert.ok(subjects.includes("New user: Ada Quill"));
  assert.ok(subjects.includes("New user: Ruth Ibarra"));
  assert.ok(subjects.includes("New user: Jun Park"));

  return {
    invitedTicket: invited.zendeskId,
    approvedTicket: approved.zendeskId,
    orderNumber: saved.order.number,
    awb: saved.order.trackingNumber,
    zendeskPosts: zendeskPosts.length,
  };
}
