import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { createOrder, getPeople, listOrders, listProducts } from "@/lib/portal/api";
import { money } from "@/lib/portal/format";
import { Button, ErrorNote, Field, Input, Loading, Modal, PageHeader, Select, StatusBadge, Textarea, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  const query = useQuery({ queryKey: ["orders"], queryFn: () => listOrders() });
  const people = useQuery({ queryKey: ["people"], queryFn: () => getPeople() });
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const [open, setOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [customerUserId, setCustomerUserId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ productId: number; name: string; quantity: number }[]>([]);
  const navigate = useNavigate();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      createOrder({
        data: {
          organizationId: Number(organizationId),
          customerUserId: customerUserId === "" ? null : Number(customerUserId),
          notes,
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
        description="What was requested, who approved it, and the Zendesk ticket that tracks it."
        actions={<Button onClick={() => setOpen(true)}>New order</Button>}
      />
      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorNote message={query.error.message} /> : null}
      {query.data ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/orders/$orderId" params={{ orderId: String(order.id) }} className="font-medium hover:underline">
                      {order.number}
                    </Link>
                    <p className="text-xs text-muted">{order.customerName || "Desk order"}</p>
                  </td>
                  <td className="px-4 py-3">{order.organizationName}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{money(order.totalCents)}</td>
                  <td className="px-4 py-3">{order.zendeskTicketId ? `#${order.zendeskTicketId}` : order.ticketId ? `P-${order.ticketId}` : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge value={order.status} /></td>
                </tr>
              ))}
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
          <Field label="Notes"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></Field>
          <Button type="submit" disabled={save.isPending || lines.length === 0}>{save.isPending ? "Saving" : "Place order"}</Button>
        </form>
      </Modal>
    </div>
  );
}
