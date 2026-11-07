import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ingestCsrEvent, verifyCsrEvent } from "@/lib/portal/csr-events";
import { CsrError, reply } from "@/lib/portal/csr-store";

export const Route = createFileRoute("/api/csr-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (raw.length > 64000) return reply({ error: "Event is too large." }, 413);
          verifyCsrEvent(
            raw,
            request.headers.get("X-MTS-Timestamp") || "",
            request.headers.get("X-MTS-Signature") || "",
            process.env.CSR_EVENTS_SECRET || "",
          );
          return reply(await ingestCsrEvent(await getSql(), JSON.parse(raw)));
        } catch (error) {
          return reply(
            { error: error instanceof Error ? error.message : "Event rejected." },
            error instanceof CsrError ? error.status : 400,
          );
        }
      },
    },
  },
});
