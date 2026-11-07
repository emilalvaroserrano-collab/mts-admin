import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { CsrError, customerContext, text } from "./csr-store";
import { ingestCsrEvent } from "./csr-events";

export const listCsrReviewActions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((customerId: number) => customerId)
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data);
    return sql<{
      id: string;
      title: string;
      status: string;
      created_at: string;
    }>`select id,title,status,created_at from csr_actions where customer_id=${data} and status in ('manual_review','executing') order by created_at desc limit 50`;
  });

export const reconcileCsrAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      customerId: number;
      actionId: string;
      outcome: "completed" | "not_completed";
      reference: string;
      note: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data.customerId);
    if (!["completed", "not_completed"].includes(data.outcome) || text(data.note, 1000).length < 10)
      throw new CsrError("Record the verified outcome and a review note.");
    const note = `${data.outcome === "completed" ? "Completed" : "Not completed"}. Reference: ${text(data.reference, 160) || "none"}. ${text(data.note, 1000)}`;
    const rows =
      await sql`update csr_actions set status='reconciled',review_note=${note},updated_at=now() where id=${data.actionId} and customer_id=${data.customerId} and (status='manual_review' or (status='executing' and updated_at<now()-interval '5 minutes')) returning id`;
    if (!rows[0])
      throw new CsrError("This action is still processing or has already been reconciled.", 409);
    await sql`insert into audit_logs(actor_user_id,actor_name,action,target,detail) values(${context.userId},'MTS administrator','Reconciled CSR action',${data.actionId},${note})`;
    return { saved: true };
  });

async function staffCustomer(userId: string, customerId: number) {
  const sql = await getSql();
  const staff = await sql<{
    role: string;
    active: boolean;
    organization_id: number | null;
  }>`select role,active,organization_id from portal_staff where user_id=${userId}`;
  if (!staff[0]?.active || !["owner", "admin"].includes(staff[0].role))
    throw new CsrError("An MTS administrator is required.", 403);
  const customers = await sql<{
    organization_id: number | null;
  }>`select organization_id from shop_customers where id=${customerId}`;
  if (!customers[0]) throw new CsrError("Customer not found.", 404);
  if (
    staff[0].organization_id !== null &&
    staff[0].organization_id !== customers[0].organization_id
  )
    throw new CsrError("This customer is outside your organization.", 403);
  return {
    sql,
    organizationId: customers[0].organization_id,
    global: staff[0].organization_id === null,
  };
}

export const getCsrStaffCustomer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error("Choose a customer.");
    return id;
  })
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data);
    return customerContext(sql, data);
  });

export const findCsrStaffCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((q: string) => text(q, 100))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const staff = await sql<{
      role: string;
      active: boolean;
      organization_id: number | null;
    }>`select role,active,organization_id from portal_staff where user_id=${context.userId}`;
    if (!staff[0]?.active || !["owner", "admin"].includes(staff[0].role))
      throw new CsrError("An MTS administrator is required.", 403);
    const org = staff[0].organization_id,
      query = `%${data.replace(/[%_]/g, "")}%`;
    return sql<{
      id: number;
      name: string;
      email: string;
    }>`select id,name,email from shop_customers where (${org}::integer is null or organization_id=${org}) and (name ilike ${query} or email ilike ${query}) order by name limit 50`;
  });

export const saveCsrAccountPolicy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { customerId: number; policy: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data.customerId),
      body = data.policy;
    const money = (value: unknown) => {
      if (value === "" || value == null) return null;
      const cents = Number(value);
      if (!Number.isSafeInteger(cents) || cents < 0)
        throw new CsrError("Amount must be a nonnegative whole number of cents.");
      return cents;
    };
    const limit = money(body.spending_limit_cents),
      threshold = money(body.approval_threshold_cents);
    await sql`insert into csr_account_policies(customer_id,spending_limit_cents,approval_threshold_cents,po_required,payment_terms,approver_name,approver_email,support_hours,sla,escalation_contact)
      values(${data.customerId},${limit},${threshold},${body.po_required === true},${text(body.payment_terms, 300)},${text(body.approver_name, 120)},${text(body.approver_email, 160)},${text(body.support_hours, 300)},${text(body.sla, 1000)},${text(body.escalation_contact, 300)})
      on conflict(customer_id) do update set spending_limit_cents=excluded.spending_limit_cents,approval_threshold_cents=excluded.approval_threshold_cents,po_required=excluded.po_required,payment_terms=excluded.payment_terms,approver_name=excluded.approver_name,approver_email=excluded.approver_email,support_hours=excluded.support_hours,sla=excluded.sla,escalation_contact=excluded.escalation_contact,updated_at=now()`;
    await sql`insert into audit_logs(actor_user_id,actor_name,action,target,detail) values(${context.userId},'MTS administrator','Updated CSR policy',${String(data.customerId)},'Account purchasing and support policy updated.')`;
    return { saved: true };
  });

export const publishCsrKnowledge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      customerId: number;
      id?: string;
      title: string;
      body: string;
      sourceUrl?: string;
      global?: boolean;
      approved: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { sql, organizationId, global } = await staffCustomer(context.userId, data.customerId);
    if (data.global && !global)
      throw new CsrError("Only a global administrator can publish shared guidance.", 403);
    if (!data.global && !organizationId)
      throw new CsrError(
        "Assign the customer to an organization before publishing organization guidance.",
      );
    if (!text(data.title) || !text(data.body, 16000))
      throw new CsrError("Guide title and content are required.");
    const id = data.id || crypto.randomUUID(),
      orgId = data.global ? null : organizationId;
    const existing = await sql<{
      organization_id: number | null;
    }>`select organization_id from csr_knowledge where id=${id}`;
    if (existing[0] && existing[0].organization_id !== orgId)
      throw new CsrError("Guide is outside this organization.", 403);
    await sql`insert into csr_knowledge(id,organization_id,title,body,source_url,approved) values(${id},${orgId},${text(data.title)},${text(data.body, 16000)},${text(data.sourceUrl, 2000)},${data.approved === true}) on conflict(id) do update set title=excluded.title,body=excluded.body,source_url=excluded.source_url,approved=excluded.approved,updated_at=now()`;
    await sql`insert into audit_logs(actor_user_id,actor_name,action,target,detail) values(${context.userId},'MTS administrator','Published CSR guidance',${id},${text(data.title)})`;
    return { id };
  });

export const updateCsrServiceStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { customerId: number; requestId: number; status: string; providerReference: string }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data.customerId);
    const result = await ingestCsrEvent(sql, {
      ...data,
      type: "service.status",
      source: "MTS staff",
      eventId: crypto.randomUUID(),
    });
    await sql`insert into audit_logs(actor_user_id,actor_name,action,target,detail) values(${context.userId},'MTS administrator','Updated service fulfillment',${String(data.requestId)},${data.status})`;
    return result;
  });

export const saveCsrAsset = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      customerId: number;
      name: string;
      category: string;
      model: string;
      serial: string;
      siteId?: string;
      managed: boolean;
      notes: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { sql } = await staffCustomer(context.userId, data.customerId);
    if (!text(data.name)) throw new CsrError("Equipment name is required.");
    if (data.siteId) {
      const sites =
        await sql`select id from csr_sites where id=${data.siteId} and customer_id=${data.customerId}`;
      if (!sites[0]) throw new CsrError("Site not found.", 404);
    }
    const id = crypto.randomUUID();
    await sql`insert into csr_assets(id,customer_id,site_id,name,category,model,serial,managed,notes) values(${id},${data.customerId},${data.siteId || null},${text(data.name, 120)},${text(data.category, 80)},${text(data.model, 120)},${text(data.serial, 120)},${data.managed === true},${text(data.notes, 1000)})`;
    await sql`insert into audit_logs(actor_user_id,actor_name,action,target,detail) values(${context.userId},'MTS administrator','Registered customer equipment',${id},${text(data.name, 120)})`;
    return { id };
  });
