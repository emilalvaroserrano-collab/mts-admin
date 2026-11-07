import { createHmac, timingSafeEqual } from "node:crypto";
import type { Sql } from "../db";
import { canTransition, inQuietHours } from "./csr-policy.ts";
import { CsrError, digest, text } from "./csr-store.ts";

export function verifyCsrEvent(
  raw: string,
  timestamp: string,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  if (!secret) throw new CsrError("CSR events are not configured.", 503);
  if (
    !/^\d{10,13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp) * (timestamp.length === 10 ? 1000 : 1)) > 300000
  )
    throw new CsrError("Event timestamp expired.", 401);
  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  if (
    !/^[a-f0-9]{64}$/i.test(signature) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature.toLowerCase()))
  )
    throw new CsrError("Invalid event signature.", 401);
}

export async function ingestCsrEvent(sql: Sql, body: Record<string, unknown>) {
  const eventId = text(body.eventId, 160),
    customerId = Number(body.customerId),
    source = text(body.source, 80);
  if (!eventId || !source || !Number.isInteger(customerId) || customerId <= 0)
    throw new CsrError("Source, eventId and customerId are required.");
  const customers = await sql`select id from shop_customers where id=${customerId}`;
  if (!customers[0]) throw new CsrError("Customer not found.", 404);
  const id = await digest(`${source}:${eventId}`);
  if (body.type === "billing.document") {
    const externalId = text(body.externalId, 160),
      number = text(body.number, 100),
      status = text(body.status, 40),
      currency = text(body.currency, 3) || "USD";
    const total = Number(body.totalCents),
      outstanding = Number(body.outstandingCents),
      updated = text(body.updatedAt, 80);
    const due = text(body.dueDate, 10) || null;
    if (
      !externalId ||
      !number ||
      !status ||
      !Number.isFinite(Date.parse(updated)) ||
      !/^\w{3}$/.test(currency) ||
      ![total, outstanding].every((v) => Number.isSafeInteger(v) && v >= 0) ||
      outstanding > total ||
      (due && !/^\d{4}-\d{2}-\d{2}$/.test(due))
    )
      throw new CsrError("Invalid billing document.");
    const docId = await digest(`${source}:${externalId}`);
    const existing = await sql<{
      customer_id: number;
    }>`select customer_id from csr_billing_documents where id=${docId}`;
    if (existing[0] && Number(existing[0].customer_id) !== customerId)
      throw new CsrError("Billing document belongs to a different customer.", 409);
    const rows = await sql`
      with received as (insert into csr_external_events(id) values(${id}) on conflict do nothing returning id)
      insert into csr_billing_documents(id,customer_id,source,external_id,number,currency,total_cents,outstanding_cents,due_date,status,source_updated_at)
      select ${docId},${customerId},${source},${externalId},${number},${currency},${total},${outstanding},${due}::date,${status},${updated}::timestamptz where exists(select 1 from received)
      on conflict(source,external_id) do update set number=excluded.number,total_cents=excluded.total_cents,outstanding_cents=excluded.outstanding_cents,due_date=excluded.due_date,status=excluded.status,source_updated_at=excluded.source_updated_at
      where csr_billing_documents.customer_id=excluded.customer_id and csr_billing_documents.source_updated_at<excluded.source_updated_at returning id
    `;
    return { processed: rows.length > 0 };
  }
  if (body.type === "service.status") {
    const requestId = Number(body.requestId),
      status = text(body.status, 40),
      reference = text(body.providerReference, 160);
    const current = await sql<{
      status: string;
    }>`select status from service_requests where id=${requestId} and shop_customer_id=${customerId}`;
    if (!current[0]) throw new CsrError("Service request not found.", 404);
    if (current[0].status === status) return { processed: false };
    if (!canTransition(current[0].status, status))
      throw new CsrError("Invalid service transition.", 409);
    if (status === "active" && !reference)
      throw new CsrError("Provider confirmation reference is required for activation.");
    const rows = await sql`
      with received as (insert into csr_external_events(id) values(${id}) on conflict do nothing returning id)
      update service_requests set status=${status},provider_reference=case when ${reference}<>'' then ${reference} else provider_reference end,updated_at=now()
      where id=${requestId} and shop_customer_id=${customerId} and status=${current[0].status} and exists(select 1 from received) returning id
    `;
    return { processed: rows.length > 0 };
  }
  throw new CsrError("Unsupported event type.");
}

export async function deliverCsrPush(sql: Sql) {
  const publicKey = process.env.CSR_VAPID_PUBLIC_KEY,
    privateKey = process.env.CSR_VAPID_PRIVATE_KEY,
    subject = process.env.CSR_VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return { configured: false, delivered: 0 };
  const webpush = await import("web-push");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  const jobs = await sql<{ notice_id: number; customer_id: number; attempts: number }>`
    update csr_push_outbox set status='sending',next_attempt_at=now()+interval '5 minutes',attempts=attempts+1
    where notice_id in (select notice_id from csr_push_outbox where status in ('pending','sending') and next_attempt_at<=now() and attempts<6 order by notice_id limit 20 for update skip locked)
    returning notice_id,customer_id,attempts
  `;
  let delivered = 0;
  for (const job of jobs) {
    const profiles = await sql<{
      notifications_push: boolean;
      timezone: string;
      quiet_start: number;
      quiet_end: number;
    }>`select notifications_push,timezone,quiet_start,quiet_end from csr_profiles where customer_id=${job.customer_id}`;
    const profile = profiles[0];
    if (!profile?.notifications_push) {
      await sql`update csr_push_outbox set status='skipped' where notice_id=${job.notice_id}`;
      continue;
    }
    if (inQuietHours(new Date(), profile.timezone, profile.quiet_start, profile.quiet_end)) {
      await sql`update csr_push_outbox set status='pending',attempts=attempts-1,next_attempt_at=now()+interval '30 minutes' where notice_id=${job.notice_id}`;
      continue;
    }
    const notices = await sql<{
      title: string;
      body: string;
      href: string;
    }>`select title,body,href from customer_notices where id=${job.notice_id} and shop_customer_id=${job.customer_id}`;
    const subscriptions = await sql<{
      endpoint: string;
      subscription_json: string;
    }>`select endpoint,subscription_json from csr_push_subscriptions where customer_id=${job.customer_id}`;
    let failed = false;
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          JSON.parse(subscription.subscription_json),
          JSON.stringify({ ...notices[0], tag: `mts-notice-${job.notice_id}` }),
          { TTL: 3600, timeout: 10000 },
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410)
          await sql`delete from csr_push_subscriptions where endpoint=${subscription.endpoint} and customer_id=${job.customer_id}`;
        else failed = true;
      }
    }
    await sql`update csr_push_outbox set status=${failed ? (job.attempts >= 6 ? "failed" : "pending") : "delivered"},next_attempt_at=now()+interval '5 minutes',last_error=${failed ? "Push provider did not accept all notifications." : ""} where notice_id=${job.notice_id}`;
    if (!failed) delivered++;
  }
  return { configured: true, delivered };
}
