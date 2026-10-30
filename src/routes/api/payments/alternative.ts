import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { applyPaymentStatus, readAlternativeEvent, verifyAlternativeSignature } from "@/lib/portal/commerce";

type Row = Record<string, unknown>;

export const Route = createFileRoute("/api/payments/alternative")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        try {
          await verifyAlternativeSignature(request, raw);
          const event = readAlternativeEvent(raw ? JSON.parse(raw) : {});
          const sql = await getSql();
          const reference = Number(/^MT-(\d+)$/.exec(event.reference)?.[1] ?? 0);
          const byNumber = reference > 1000 ? reference - 1000 : 0;
          const rows = byNumber
            ? await sql<Row>`select id from orders where id = ${byNumber} limit 1`
            : event.invoiceId
              ? await sql<Row>`select id from orders where alternative_invoice_id = ${event.invoiceId} limit 1`
              : [];
          const id = Number(rows[0]?.id ?? 0);
          if (!id) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
          await applyPaymentStatus(sql, id, event.status || "paid", "Alternative Payments");
          return Response.json({ ok: true, orderId: id });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Webhook rejected.";
          const status = /signature|SECRET/.test(message) ? 401 : 400;
          return Response.json({ ok: false, error: message }, { status });
        }
      },
    },
  },
});
