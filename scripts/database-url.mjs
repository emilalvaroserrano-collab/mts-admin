// @ts-check
/**
 * Neon connection strings as Vercel injects them.
 *
 * Runtime prefers the pooled URL. Migrations prefer the direct (unpooled) URL,
 * because the pooler rejects some schema statements.
 *
 * `channel_binding=require` is in Neon's Vercel snippet and is not supported by
 * node-postgres, so it is removed before the driver sees the string.
 */

const RUNTIME_KEYS = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];
const MIGRATION_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
];

/**
 * @param {string | undefined} value
 * @returns {string}
 */
export function cleanDatabaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw.replace(/([?&])channel_binding=[^&]*&?/g, "$1").replace(/[?&]$/, "");
  }
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @param {string[]} keys
 * @returns {string}
 */
function first(env, keys) {
  for (const key of keys) {
    const value = cleanDatabaseUrl(env?.[key]);
    if (value) return value;
  }
  return "";
}

/** Pooled URL for app queries and Better Auth. */
export function databaseUrl(env = process.env) {
  return first(env, RUNTIME_KEYS);
}

/** Direct URL for migrations during the Vercel build. */
export function migrationDatabaseUrl(env = process.env) {
  return first(env, MIGRATION_KEYS);
}
