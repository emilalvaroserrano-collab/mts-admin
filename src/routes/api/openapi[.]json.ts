import { createFileRoute } from "@tanstack/react-router";
import { agentOpenApi } from "@/lib/portal/openapi";

export const Route = createFileRoute("/api/openapi.json")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        return Response.json({ ...agentOpenApi, servers: [{ url: origin }] });
      },
    },
  },
});
