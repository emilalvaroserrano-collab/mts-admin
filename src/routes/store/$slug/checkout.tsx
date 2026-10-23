import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StoreFrame, useStore } from "@/components/storefront";
import { placeStorefrontOrder } from "@/lib/portal/api";
import { money } from "@/lib/portal/format";
import { clearCart, useCart } from "@/lib/portal/store-cart";
import { Button, Field, Input, Textarea } from "@/components/ui";

export const Route = createFileRoute("/store/$slug/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <StoreFrame>
      <Checkout />
    </StoreFrame>
  );
}

function Checkout() {
  const { query } = useStore();
  const store = query.data;
  const lines = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const detailed = lines
    .map((line) => ({ ...line, product: store?.products.find((product) => product.sku === line.sku) }))
    .filter((line) => line.product);
  const total = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
  const place = useMutation({
    mutationFn: () =>
      placeStorefrontOrder({
        data: { name, email, company, notes, items: detailed.map((line) => ({ sku: line.sku, quantity: line.quantity })) },
      }),
    onSuccess: () => clearCart(),
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not place the order."),
  });

  if (!store) return null;
  if (place.data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Order placed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{place.data.number}</h1>
        <p className="mt-3 text-sm text-muted">We sent this to the desk as a pending order. Invoice is the payment method unless your team changes it.</p>
        <Link to="/store/$slug" params={{ slug: store.slug }} className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">
          Back to the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          place.mutate();
        }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </Field>
        <Field label="Company">
          <Input value={company} onChange={(event) => setCompany(event.target.value)} autoComplete="organization" />
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </Field>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Button type="submit" disabled={place.isPending || detailed.length === 0}>
          {place.isPending ? "Placing order" : "Place order"}
        </Button>
      </form>
      <aside className="h-fit rounded-2xl border border-line p-4">
        <h2 className="text-sm font-semibold">Your order</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {detailed.map((line) => (
            <li key={line.sku} className="flex justify-between gap-3 py-2">
              <span>
                {line.quantity} × {line.product?.name}
              </span>
              <span className="tabular-nums">{money(line.quantity * (line.product?.priceCents ?? 0))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </p>
      </aside>
    </main>
  );
}
