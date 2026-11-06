import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

type Row = Record<string, unknown>;

function s(row: Row | undefined, key: string) {
  const value = row?.[key];
  return value == null ? "" : String(value);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function newSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `mts_${body}`;
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<Row>`select role, active, name, email from portal_staff where user_id = ${userId}`;
  const row = rows[0];
  if (!row || row.active === false) throw new Error("This account cannot create agent keys.");
  const role = s(row, "role");
  if (role !== "owner" && role !== "admin") throw new Error("An admin has to create an agent key.");
  return { sql, name: s(row, "name") || s(row, "email") || "Admin" };
}

export const listAgentKeys = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await requireAdmin(context.userId);
    const rows = await sql<Row>`
      select id, name, prefix, scope, created_at, last_used_at, revoked_at
      from agent_api_keys
      order by created_at desc
    `;
    return rows.map((row) => ({
      id: s(row, "id"),
      name: s(row, "name"),
      prefix: s(row, "prefix"),
      scope: s(row, "scope") || "super_admin",
      createdAt: s(row, "created_at"),
      lastUsedAt: s(row, "last_used_at"),
      revokedAt: s(row, "revoked_at"),
    }));
  });

export const createAgentKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const name = String((input as { name?: string } | null)?.name || "").trim().slice(0, 80);
    if (!name) throw new Error("Name the key.");
    return { name };
  })
  .handler(async ({ data, context }) => {
    const { sql, name } = await requireAdmin(context.userId);
    const secret = newSecret();
    const id = crypto.randomUUID();
    const prefix = secret.slice(0, 12);
    await sql`
      insert into agent_api_keys (id, name, prefix, key_hash, created_by, scope)
      values (${id}, ${data.name}, ${prefix}, ${await sha256(secret)}, ${name}, 'super_admin')
    `;
    await sql`
      insert into audit_logs (actor_user_id, actor_name, action, target, detail)
      values (${context.userId}, ${name}, 'Created agent key', ${data.name}, ${prefix})
    `;
    return { id, name: data.name, prefix, key: secret };
  });

export const revokeAgentKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const id = String((input as { id?: string } | null)?.id || "").slice(0, 80);
    if (!id) throw new Error("Choose a key.");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { sql, name } = await requireAdmin(context.userId);
    await sql`update agent_api_keys set revoked_at = now() where id = ${data.id} and revoked_at is null`;
    await sql`
      insert into audit_logs (actor_user_id, actor_name, action, target, detail)
      values (${context.userId}, ${name}, 'Revoked agent key', ${data.id}, '')
    `;
    return { ok: true };
  });

export async function authorizeAgentKey(header: string) {
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith("mts_")) return null;
  const sql = await getSql();
  const rows = await sql<Row>`
    select id, name, scope from agent_api_keys
    where key_hash = ${await sha256(token)} and revoked_at is null
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  await sql`update agent_api_keys set last_used_at = now() where id = ${s(row, "id")}`;
  return { id: s(row, "id"), name: s(row, "name"), scope: s(row, "scope") || "super_admin", sql };
}
