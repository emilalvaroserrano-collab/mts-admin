import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOrder, linkOrderTicket, refreshAlternativeOrder, updateOrder } from "@/lib/portal/api";
import { day, money, paymentLabel } from "@/lib/portal/format";
import { orderPdfUrl } from "@/lib/portal/pdf";
import { Button, ErrorNote, Field, Input, Loading, PageHeader, Panel, Select, StatusBadge, Textarea, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/orders/$orderId")({
  component: OrderPage,
});

const STATUSES = ["pending", "approved", "processing", "fulfilled", "cancelled"] as const;

function OrderPage() {
  const { orderId } = Route.useParams();
  const id = Number(orderId);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["order", id], queryFn: () => getOrder({ data: id }) });
  const [status, setStatus] = useState("pending");
  const [approvalNote, setApprovalNote] = useState("");
  const [processingNote, setProcessingNote] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("unfulfilled");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setStatus(query.data.order.status);
    setApprovalNote(query.data.order.approvalNote);
    setProcessingNote(query.data.order.processingNote);
    setShipmentStatus(query.data.order.shipmentStatus || "unfulfilled");
    setTrackingNumber(query.data.order.trackingNumber);
    setTrackingCarrier(query.data.order.trackingCarrier);
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => updateOrder({ data: { id, status, approvalNote, processingNote, shipmentStatus, trackingNumber, trackingCarrier } }),
    onSuccess: () => {
      toast.success("Order updated");
      client.invalidateQueries({ queryKey: ["order", id] });
      client.invalidateQueries({ queryKey: ["orders"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  const link = useMutation({
    mutationFn: () => linkOrderTicket({ data: id }),
    onSuccess: (result) => {
      if (result.warning) toast.error(`Ticket saved here. ${result.warning}`);
      else toast.success("Linked to a ticket");
      client.invalidateQueries({ queryKey: ["order", id] });
      client.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  const refreshPay = useMutation({
    mutationFn: () => refreshAlternativeOrder({ data: id }),
    onSuccess: (next) => {
      toast.success(next.paymentStatus ? `Payment ${next.paymentStatus}` : "Payment checked");
      client.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;
  const order = query.data.order;

  function openPdf() {
    const url = orderPdfUrl(order);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order.number}.pdf`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Placed ${day(order.createdAt)}`}
        title={order.number}
        description={`${order.organizationName}${order.customerName ? ` · ${order.customerName}` : ""}${order.paymentMethod ? ` · ${paymentLabel(order.paymentMethod)}` : ""}`}
        actions={
          <>
            {order.paymentMethod === "alternative" ? (
              <>
                <a
                  href={order.paymentUrl || "https://go.alternativepayments.io"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[13px] font-semibold text-white"
                >
                  Pay with Alternative Payments
                </a>
                <Button type="button" variant="secondary" disabled={refreshPay.isPending} onClick={() => refreshPay.mutate()}>
                  {refreshPay.isPending ? "Checking" : "Check payment"}
                </Button>
              </>
            ) : null}
            <Button variant="secondary" type="button" onClick={openPdf}>
              Order PDF
            </Button>
            <Link to="/orders" className="inline-flex h-11 items-center text-sm text-accent">
              All orders
            </Link>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={order.status} />
        {order.paymentStatus ? <StatusBadge value={order.paymentStatus} /> : null}
        {order.ticketId ? (
          <Link to="/tickets/$ticketId" params={{ ticketId: String(order.ticketId) }} className="text-sm text-accent">
            {order.zendeskTicketId ? `Zendesk #${order.zendeskTicketId}` : `Portal ticket P-${order.ticketId}`}
          </Link>
        ) : (
          <span className="text-sm text-muted">No linked ticket</span>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_20rem]">
        <Panel>
          <h2 className="text-sm font-semibold">Items</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Unit</th>
                  <th className="py-2 text-right font-medium">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="py-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted">{item.sku}</p>
                    </td>
                    <td className="py-3 font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3 font-mono tabular-nums">{money(item.unitPriceCents)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{money(item.quantity * item.unitPriceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-right font-mono text-lg tabular-nums">{money(order.totalCents)}</p>
          {order.notes ? <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{order.notes}</p> : null}
        </Panel>
        <div className="grid content-start gap-4">
          <Panel>
            <h2 className="text-sm font-semibold">Processing</h2>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <Field label="Status">
                <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Approval">
                <Textarea value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} />
              </Field>
              <Field label="Shipment">
                <Select value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)}>
                  <option value="unfulfilled">Not shipped</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                </Select>
              </Field>
              <Field label="Carrier">
                <Input value={trackingCarrier} onChange={(event) => setTrackingCarrier(event.target.value)} placeholder="UPS, FedEx…" />
              </Field>
              <Field label="Tracking number">
                <Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
              </Field>
              <Field label="Bench note">
                <Textarea value={processingNote} onChange={(event) => setProcessingNote(event.target.value)} />
              </Field>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving" : "Save order"}
              </Button>
            </form>
          </Panel>
          <Panel>
            <h2 className="text-sm font-semibold">Zendesk</h2>
            <p className="mt-2 text-sm text-muted">
              {order.ticketSubject || "Creates a portal ticket tagged Pending Orders, and a Zendesk ticket when the desk is connected."}
            </p>
            {order.ticketId ? null : (
              <Button className="mt-4" type="button" variant="secondary" disabled={link.isPending} onClick={() => link.mutate()}>
                {link.isPending ? "Linking" : "Create ticket"}
              </Button>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
