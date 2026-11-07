import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { deliverCsrPush } from "@/lib/portal/csr-events";
import { reply } from "@/lib/portal/csr-store";

export const Route = createFileRoute("/api/csr-jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.CRON_SECRET || "",
          actual = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
        if (
          !expected ||
          Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
          !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
        )
          return reply({ error: "Unauthorized" }, 401);
        return reply(await deliverCsrPush(await getSql()));
      },
    },
  },
});
