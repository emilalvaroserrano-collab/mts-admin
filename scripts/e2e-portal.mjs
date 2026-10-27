/**
 * Production-path test. In-memory database, fake Zendesk desk.
 * Does not read DATABASE_URL, so it cannot write to Neon.
 *
 *   node scripts/e2e-portal.mjs
 */
import { createServer } from "vite";

for (const key of Object.keys(process.env)) {
  if (
    key === "DATABASE_URL" ||
    key.startsWith("DATABASE_URL_") ||
    key.startsWith("POSTGRES_") ||
    key.startsWith("PG") ||
    key.startsWith("NEON_") ||
    key.startsWith("ZENDESK_") ||
    key.startsWith("UPS_")
  ) {
    delete process.env[key];
  }
}
process.env.VITE_AUTH_ENABLED = "false";

const server = await createServer({
  cacheDir: "/workspace/.grok/e2e-vite",
  ssr: { external: true },
  plugins: [
    {
      name: "e2e-externalize-auth",
      enforce: "post",
      configResolved(config) {
        if (Array.isArray(config.ssr.noExternal)) {
          config.ssr.noExternal = config.ssr.noExternal.filter((item) => item !== "better-auth");
        }
      },
    },
  ],
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const mod = await server.ssrLoadModule("/src/lib/portal/flow.e2e.ts");
  const result = await mod.runPortalFlow();
  console.log(JSON.stringify({ ok: true, ...result }));
} finally {
  await server.close();
}
