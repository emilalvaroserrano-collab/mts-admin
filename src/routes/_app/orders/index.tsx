import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { createOrder, getPayments, getPeople, listOrders, listProducts } from "@/lib/portal/api";
import { money, paymentLabel, shopifyDelivery, shopifyFulfillment, shopifyPayment, day, orderCustomer, orderEmail } from "@/lib/portal/format";
import type { Order } from "@/lib/portal/types";
import { Badge, Button, ErrorNote, Field, Input, Loading, Modal, PageHeader, Select, Textarea, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/orders/")({
  component: OrdersPage,
});

function matchesView(order: Order, view: string) {
  const payment = shopifyPayment(order);
  const fulfillment = shopifyFulfillment(order);
  if (view === "open") return order.status !== "cancelled";
  if (view === "unfulfilled") return fulfillment.label === "Unfulfilled";
  if (view === "unpaid") return payment.label === "Unpaid" || payment.label === "Payment pending" || payment.label === "Authorized";
  if (view === "fulfilled") return fulfillment.label === "Fulfilled";
  if (view === "canceled") return order.status === "cancelled";
  return true;
}

function OrdersPage() {
  const query = useQuery({ queryKey: ["orders"], queryFn: () => listOrders() });
  const people = useQuery({ queryKey: ["people"], queryFn: () => getPeople() });
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => getPayments() });
  const [open, setOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [customerUserId, setCustomerUserId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [lines, setLines] = useState<{ productId: number; name: string; quantity: number }[]>([]);
  const [view, setView] = useState("all");
  const navigate = useNavigate();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      createOrder({
        data: {
          organizationId: Number(organizationId),
          customerUserId: customerUserId === "" ? null : Number(customerUserId),
          notes,
          paymentMethod: paymentMethod || payments.data?.methods[0] || "",
          returnUrl: `${window.location.origin}/orders`,
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        },
      }),
    onSuccess: (result) => {
      toast.success("Order created");
      setOpen(false);
      setLines([]);
      setNotes("");
      client.invalidateQueries({ queryKey: ["orders"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      client.invalidateQueries({ queryKey: ["shell"] });
      if (result.paymentUrl && (paymentMethod || payments.data?.methods[0]) === "alternative") {
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
      }
      navigate({ to: "/orders/$orderId", params: { orderId: String(result.id) } });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  const companyPeople = people.data?.people.filter((person) => person.organizationId === organizationId && person.active) ?? [];
  const catalog = products.data?.filter((product) => product.available) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Orders"
        description="Payment, fulfillment, and delivery follow the current state of each order."
        actions={<Button onClick={() => setOpen(true)}>New order</Button>}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {[
          ["all", "All"],
          ["open", "Open"],
          ["unfulfilled", "Unfulfilled"],
          ["unpaid", "Unpaid"],
          ["fulfilled", "Fulfilled"],
          ["canceled", "Canceled"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={view === id ? "h-8 shrink-0 rounded-full bg-ink px-3 text-[13px] font-semibold text-white" : "h-8 shrink-0 rounded-full border border-line px-3 text-[13px] text-muted"}
          >
            {label}
          </button>
        ))}
      </div>
      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorNote message={query.error.message} /> : null}
      {query.data ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody>
              {query.data.filter((order) => matchesView(order, view)).map((order) => {
                const payment = shopifyPayment(order);
                const fulfillment = shopifyFulfillment(order);
                const delivery = shopifyDelivery(order);
                return (
                  <tr key={order.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link to="/orders/$orderId" params={{ orderId: String(order.id) }} className="font-medium hover:underline">
                        {order.number}
                      </Link>
                      <p className="text-xs text-muted">{order.organizationName}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{day(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p>{orderCustomer(order)}</p>
                      <p className="text-xs text-muted">{orderEmail(order) || "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">{money(order.totalCents + order.shippingCents)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={payment.tone}>{payment.label}</Badge>
                      <p className="mt-1 text-xs text-muted">{order.paymentMethod ? paymentLabel(order.paymentMethod) : "—"}</p>
                    </td>
                    <td className="px-4 py-3"><Badge tone={fulfillment.tone}>{fulfillment.label}</Badge></td>
                    <td className="px-4 py-3">
                      {delivery ? <Badge tone={delivery.tone}>{delivery.label}</Badge> : <span className="text-muted">—</span>}
                      {order.trackingNumber ? <p className="mt-1 font-mono text-xs text-muted">{order.trackingNumber}</p> : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{order.itemCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <Modal open={open} onOpenChange={setOpen} title="New order" description="Ordering follows the company rules and the person's permissions.">
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Company">
            <Select
              value={organizationId}
              onChange={(event) => {
                setOrganizationId(event.target.value ? Number(event.target.value) : "");
                setCustomerUserId("");
              }}
              required
            >
              <option value="">Choose</option>
              {people.data?.orgs.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </Select>
          </Field>
          <Field label="Requester">
            <Select value={customerUserId} onChange={(event) => setCustomerUserId(event.target.value ? Number(event.target.value) : "")}>
              <option value="">Desk, no customer</option>
              {companyPeople.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2">
            <Select value={productId} onChange={(event) => setProductId(event.target.value ? Number(event.target.value) : "")} aria-label="Product">
              <option value="">Product</option>
              {catalog.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </Select>
            <Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Quantity" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const product = catalog.find((item) => item.id === productId);
                if (!product) return;
                setLines((current) => [...current, { productId: product.id, name: product.name, quantity }]);
                setProductId("");
                setQuantity(1);
              }}
            >
              Add
            </Button>
          </div>
          <ul className="text-sm">
            {lines.map((line, index) => (
              <li key={`${line.productId}-${index}`} className="flex justify-between border-t border-line py-2">
                <span>{line.quantity} × {line.name}</span>
                <button type="button" className="text-muted" onClick={() => setLines(lines.filter((_, item) => item !== index))}>Remove</button>
              </li>
            ))}
          </ul>
          <Field label="Payment">
            <Select value={paymentMethod || payments.data?.methods[0] || ""} onChange={(event) => setPaymentMethod(event.target.value)}>
              {(payments.data?.methods ?? []).map((method) => (
                <option key={method} value={method}>
                  {paymentLabel(method)}
                  {method === "invoice" && payments.data ? ` · ${payments.data.invoiceTerms}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
          <Button type="submit" disabled={save.isPending || lines.length === 0}>{save.isPending ? "Saving" : "Place order"}</Button>
        </form>
      </Modal>
    </div>
  );
}
