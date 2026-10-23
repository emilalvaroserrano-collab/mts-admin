import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StoreFrame, useStore } from "@/components/storefront";
import { getShopAccount, getShopCheckout, placeStorefrontOrder } from "@/lib/portal/api";
import { money, paymentLabel } from "@/lib/portal/format";
import { clearCart, useCart } from "@/lib/portal/store-cart";
import { setShopToken, useShopToken } from "@/lib/portal/shop-session";
import { Button, Field, Input, Textarea } from "@/components/ui";

export const Route = createFileRoute("/store/$slug/checkout")({
  component: CheckoutPage,
});

const STEPS = ["information", "shipping", "payment"] as const;
type Step = (typeof STEPS)[number];

function CheckoutPage() {
  return (
    <StoreFrame>
      <Checkout />
    </StoreFrame>
  );
}

function Checkout() {
  const { slug, query } = useStore();
  const store = query.data;
  const lines = useCart();
  const token = useShopToken();
  const account = useQuery({
    queryKey: ["shop-account", token],
    queryFn: () => getShopAccount({ data: token }),
    enabled: Boolean(token),
  });
  const checkout = useQuery({ queryKey: ["shop-checkout"], queryFn: () => getShopCheckout() });
  const [step, setStep] = useState<Step>("information");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saveAccount, setSaveAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("United States");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const customer = account.data?.customer;
    if (!customer) return;
    setEmail(customer.email);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setCity(customer.city);
    setRegion(customer.region);
    setPostal(customer.postal);
    setCountry(customer.country || "United States");
  }, [account.data]);

  useEffect(() => {
    const methods = checkout.data?.methods ?? [];
    if (!paymentMethod && methods[0]) setPaymentMethod(methods[0]);
  }, [checkout.data, paymentMethod]);

  const detailed = lines
    .map((line) => ({ ...line, product: store?.products.find((product) => product.sku === line.sku) }))
    .filter((line) => line.product);
  const subtotal = detailed.reduce((sum, line) => sum + line.quantity * (line.product?.priceCents ?? 0), 0);
  const shippingCents = shippingMethod === "express" ? 2500 : subtotal >= 50000 ? 0 : 1500;
  const total = subtotal + shippingCents;

  const place = useMutation({
    mutationFn: () =>
      placeStorefrontOrder({
        data: {
          name,
          email,
          phone,
          company,
          address,
          city,
          region,
          postal,
          country,
          shippingMethod,
          paymentMethod,
          notes,
          password: saveAccount ? password : "",
          token,
          items: detailed.map((line) => ({ sku: line.sku, quantity: line.quantity })),
        },
      }),
    onSuccess: (result) => {
      if (result.token) setShopToken(result.token);
      clearCart();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not place the order."),
  });

  if (!store) return null;
  if (detailed.length === 0 && !place.data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-sm">
        <p>Your cart is empty.</p>
        <Link to="/store/$slug" params={{ slug: store.slug }} className="mt-4 inline-block underline">
          Return to the shop
        </Link>
      </main>
    );
  }
  if (place.data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Thank you</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{place.data.number}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The order is confirmed. Shipment starts as not yet shipped. You can follow it from your account.
        </p>
        {place.data.paymentUrl ? (
          <a href={place.data.paymentUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">
            Pay now
          </a>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/store/$slug/account" params={{ slug: store.slug }} className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-semibold">
            View order
          </Link>
          <Link to="/store/$slug" params={{ slug: store.slug }} className="inline-flex h-11 items-center text-sm text-muted">
            Keep shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link to="/store/$slug" params={{ slug }}>Cart</Link>
          {STEPS.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <button type="button" className={step === item ? "font-semibold text-ink" : ""} onClick={() => setStep(item)}>
                {item === "information" ? "Information" : item === "shipping" ? "Shipping" : "Payment"}
              </button>
            </span>
          ))}
        </nav>
        {step === "information" ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setStep("shipping");
            }}
          >
            <h1 className="text-xl font-semibold">Contact</h1>
            {account.data ? <p className="text-sm text-muted">Signed in as {account.data.customer.email}</p> : null}
            <Field label="Email">
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </Field>
            <Field label="Full name">
              <Input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </Field>
            <Field label="Phone">
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
            </Field>
            <Field label="Company">
              <Input value={company} onChange={(event) => setCompany(event.target.value)} autoComplete="organization" />
            </Field>
            {account.data ? null : (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={saveAccount} onChange={(event) => setSaveAccount(event.target.checked)} />
                Create an account to track this order
              </label>
            )}
            {saveAccount ? (
              <Field label="Password" hint="At least 8 characters.">
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
              </Field>
            ) : null}
            <Button type="submit">Continue to shipping</Button>
          </form>
        ) : null}
        {step === "shipping" ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setStep("payment");
            }}
          >
            <h1 className="text-xl font-semibold">Shipping address</h1>
            <Field label="Address">
              <Input value={address} onChange={(event) => setAddress(event.target.value)} required autoComplete="address-line1" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City">
                <Input value={city} onChange={(event) => setCity(event.target.value)} required autoComplete="address-level2" />
              </Field>
              <Field label="State">
                <Input value={region} onChange={(event) => setRegion(event.target.value)} autoComplete="address-level1" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Postal code">
                <Input value={postal} onChange={(event) => setPostal(event.target.value)} required autoComplete="postal-code" />
              </Field>
              <Field label="Country">
                <Input value={country} onChange={(event) => setCountry(event.target.value)} required autoComplete="country-name" />
              </Field>
            </div>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Shipping method</legend>
              <label className="flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <input type="radio" name="ship" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} />
                  Standard · 5–7 business days
                </span>
                <span className="tabular-nums">{subtotal >= 50000 ? "Free" : money(1500)}</span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <input type="radio" name="ship" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} />
                  Express · 2 business days
                </span>
                <span className="tabular-nums">{money(2500)}</span>
              </label>
            </fieldset>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("information")}>Back</Button>
              <Button type="submit">Continue to payment</Button>
            </div>
          </form>
        ) : null}
        {step === "payment" ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              place.mutate();
            }}
          >
            <h1 className="text-xl font-semibold">Payment</h1>
            <fieldset className="grid gap-2">
              {(checkout.data?.methods ?? ["invoice"]).map((method) => (
                <label key={method} className="flex items-center justify-between rounded-xl border border-line px-3 py-3 text-sm">
                  <span className="flex items-center gap-2">
                    <input type="radio" name="pay" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                    {paymentLabel(method)}
                  </span>
                  <span className="text-xs text-muted">
                    {method === "invoice" ? checkout.data?.invoiceTerms : method === "alternative" ? checkout.data?.alternativeEnvironment === "sandbox" ? "Sandbox" : "Hosted checkout" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
            <Field label="Order notes">
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            {error ? <p className="text-sm text-bad">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("shipping")}>Back</Button>
              <Button type="submit" disabled={place.isPending}>{place.isPending ? "Placing order" : `Pay ${money(total)}`}</Button>
            </div>
          </form>
        ) : null}
      </div>
      <aside className="h-fit rounded-2xl bg-[#f6f6f6] p-4">
        <h2 className="text-sm font-semibold">Order summary</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {detailed.map((line) => (
            <li key={line.sku} className="flex justify-between gap-3 py-2">
              <span>{line.quantity} × {line.product?.name}</span>
              <span className="tabular-nums">{money(line.quantity * (line.product?.priceCents ?? 0))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 text-sm text-muted">
          <p className="flex justify-between"><span>Subtotal</span><span className="tabular-nums text-ink">{money(subtotal)}</span></p>
          <p className="flex justify-between"><span>Shipping</span><span className="tabular-nums text-ink">{shippingCents === 0 ? "Free" : money(shippingCents)}</span></p>
        </div>
        <p className="mt-3 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </p>
      </aside>
    </main>
  );
}
