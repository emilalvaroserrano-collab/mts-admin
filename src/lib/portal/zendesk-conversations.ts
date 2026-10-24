import { createHmac, timingSafeEqual } from "node:crypto";
import type { Sql } from "@/lib/db";

export type ConversationsConfig = {
  appId: string;
  keyId: string;
  secret: string;
  webhookId: string;
  webhookSecret: string;
  ready: boolean;
};

function env(name: string) {
  return (process.env[name] || "").trim();
}

const shopConversations = {
  appId: "6adbdfeb9640f475f3c2c397",
  keyId: "int_6adbe90fa5a8c8bbff50af30",
  secret: "RdUkfXMUQM32Ia6ELDudEa9AJGUDByYPwtMi1SJFLHwocMkZEy7h8QwG9fh0vDVRX1-UjtdYehJp7x9OGgOBbw",
  webhookId: "6adbe8f8d129a41d7be7b1ac",
  webhookSecret: "c8Y3p8P21pGmi6pkC4C7OiOsNZwpuFrtU2_XxnEFnUaDFoJY7UdU5YNTLDLB-JzqvIEgzDDGrUGsBqqEc3ApqA",
};

export function conversationsConfig(): ConversationsConfig {
  const appId = env("ZENDESK_CONVERSATIONS_APP_ID") || env("ZENDESK_APP_ID") || shopConversations.appId;
  const keyId = env("ZENDESK_CONVERSATIONS_KEY_ID") || env("ZENDESK_KEY_ID") || shopConversations.keyId;
  const secret = env("ZENDESK_CONVERSATIONS_SECRET") || env("ZENDESK_CONVERSATIONS_SECRET_KEY") || shopConversations.secret;
  const webhookId = env("ZENDESK_WEBHOOK_ID") || shopConversations.webhookId;
  const webhookSecret = env("ZENDESK_WEBHOOK_SECRET") || shopConversations.webhookSecret;
  return { appId, keyId, secret, webhookId, webhookSecret, ready: Boolean(appId && keyId && secret) };
}

function authHeader(config: ConversationsConfig) {
  return `Basic ${Buffer.from(`${config.keyId}:${config.secret}`, "utf8").toString("base64")}`;
}

export async function testConversations() {
  const config = conversationsConfig();
  if (!config.ready) {
    throw new Error("Set ZENDESK_CONVERSATIONS_APP_ID, ZENDESK_CONVERSATIONS_KEY_ID, and ZENDESK_CONVERSATIONS_SECRET.");
  }
  const response = await fetch(`https://api.smooch.io/v2/apps/${encodeURIComponent(config.appId)}/integrations`, {
    headers: { Authorization: authHeader(config), Accept: "application/json" },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text.replaceAll(config.secret, "").slice(0, 180) || "Conversations API rejected the key.");
  }
  const body = JSON.parse(text) as { integrations?: { displayName?: string; type?: string; status?: string }[] };
  const names = (body.integrations ?? [])
    .filter((item) => item.status !== "inactive")
    .map((item) => item.displayName || item.type || "integration")
    .slice(0, 4);
  return { name: names.length ? names.join(", ") : "Conversations API" };
}

export function verifyZendeskWebhook(request: Request, rawBody: string) {
  const config = conversationsConfig();
  if (!config.webhookSecret) {
    throw new Error("ZENDESK_WEBHOOK_SECRET is not set.");
  }
  const signature = request.headers.get("x-zendesk-webhook-signature") || "";
  const timestamp = request.headers.get("x-zendesk-webhook-signature-timestamp") || "";
  const webhookId = request.headers.get("x-zendesk-webhook-id") || "";
  if (!signature || !timestamp) throw new Error("Missing Zendesk webhook signature.");
  if (config.webhookId && webhookId && webhookId !== config.webhookId) {
    throw new Error("Webhook ID does not match.");
  }
  const sent = Number(timestamp);
  const millis = Number.isFinite(sent) ? (sent > 1e12 ? sent : sent * 1000) : Date.parse(timestamp);
  if (!Number.isFinite(millis) || Math.abs(Date.now() - millis) > 5 * 60 * 1000) {
    throw new Error("Webhook timestamp is outside the allowed window.");
  }
  const expected = createHmac("sha256", config.webhookSecret).update(timestamp + rawBody).digest("base64");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("Webhook signature does not match.");
  }
}

type Row = Record<string, unknown>;

function textOf(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Row {
  return value && typeof value === "object" ? (value as Row) : {};
}

async function saveMessage(sql: Sql, externalId: string, subject: string, author: string, body: string, commentId: string) {
  if (!externalId || !body) return false;
  const saved = await sql<Row>`
    insert into tickets (zendesk_id, subject, status, requester_name, category, view_label, updated_at)
    values (${externalId}, ${subject.slice(0, 180) || "Zendesk message"}, 'open', ${author.slice(0, 120)}, 'messaging', 'zendesk', now())
    on conflict (zendesk_id) do update set
      subject = case when tickets.subject = '' then excluded.subject else tickets.subject end,
      requester_name = case when excluded.requester_name <> '' then excluded.requester_name else tickets.requester_name end,
      updated_at = now()
    returning id
  `;
  const ticketId = Number(saved[0]?.id ?? 0);
  if (!ticketId) return false;
  if (commentId) {
    const existing = await sql<Row>`select id from ticket_comments where zendesk_comment_id = ${commentId} limit 1`;
    if (existing.length) return false;
  }
  await sql`
    insert into ticket_comments (ticket_id, author_name, body, public_note, zendesk_comment_id)
    values (${ticketId}, ${author || "Zendesk"}, ${body.slice(0, 4000)}, true, ${commentId || null})
  `;
  return true;
}

export async function ingestZendeskWebhook(sql: Sql, payload: unknown) {
  const body = asRecord(payload);
  let stored = 0;
  const ticket = asRecord(body.ticket);
  if (ticket.id != null && (textOf(ticket.subject) || textOf(ticket.description))) {
    const ok = await saveMessage(
      sql,
      String(ticket.id),
      textOf(ticket.subject) || "Zendesk ticket",
      textOf(asRecord(ticket.requester).name) || textOf(ticket.requester_name),
      textOf(ticket.description) || textOf(ticket.subject),
      "",
    );
    if (ok) stored += 1;
  }
  const events = Array.isArray(body.events) ? body.events : [];
  for (const item of events) {
    const event = asRecord(item);
    const eventPayload = asRecord(event.payload);
    const message = asRecord(eventPayload.message);
    const content = asRecord(message.content);
    const conversation = asRecord(eventPayload.conversation);
    const author = asRecord(message.author);
    const text = textOf(content.text) || textOf(message.text);
    const ok = await saveMessage(
      sql,
      textOf(conversation.id) ? `sc:${textOf(conversation.id)}` : "",
      text.slice(0, 80) || "Conversation message",
      textOf(author.displayName) || textOf(author.type) || "Customer",
      text,
      textOf(message.id) || textOf(event.id),
    );
    if (ok) stored += 1;
  }
  return stored;
}
