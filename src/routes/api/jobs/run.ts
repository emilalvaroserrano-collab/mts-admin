import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { runPortalJobs } from "@/lib/portal/api";

export const Route = createFileRoute("/api/jobs/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = (process.env.CRON_SECRET || "").trim();
        const header = request.headers.get("authorization") || "";
        if (secret && header !== `Bearer ${secret}`) {
          return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        try {
          const sql = await getSql();
          await runPortalJobs(sql);
          return Response.json({ ok: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Jobs failed.";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
