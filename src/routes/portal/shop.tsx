import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getStorefront, orderPortalOffering } from "@/lib/portal/api";
import { money } from "@/lib/portal/format";
import { useShopToken } from "@/lib/portal/shop-session";
import { addToCart } from "@/lib/portal/store-cart";

export const Route = createFileRoute("/portal/shop")({
  component: OrderPage,
});

const SERVICES = [
  { id: "network", label: "Connect an office", detail: "Bring the network or internet into a new office." },
  { id: "voip", label: "Phone and VoIP", detail: "A line, or an extension on the Telxent bill." },
  { id: "fax", label: "Fax", detail: "A physical fax line, or eFax to an email address." },
  { id: "internet", label: "Internet", detail: "Spectrum, AT&T Fiber, Frontier Fiber, or fixed wireless." },
  { id: "wiring", label: "Wiring", detail: "$175 per drop." },
] as const;

function OrderPage() {
  const token = useShopToken();
  const shop = useQuery({ queryKey: ["storefront"], queryFn: () => getStorefront() });
  const [tab, setTab] = useState<"equipment" | "services">("equipment");
  const [q, setQ] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number]["id"]>("network");
  const [site, setSite] = useState("");
  const [notes, setNotes] = useState("");
  const [voipKind, setVoipKind] = useState<"line" | "ext">("ext");
  const [shipPhone, setShipPhone] = useState(false);
  const [confirmMonthly, setConfirmMonthly] = useState(false);
  const [faxKind, setFaxKind] = useState<"physical" | "efax">("efax");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [provider, setProvider] = useState<"spectrum" | "att" | "frontier" | "fixed">("spectrum");
  const [drops, setDrops] = useState(1);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const products = (shop.data?.products ?? []).filter((item) => `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(q.toLowerCase()));
  const slug = shop.data?.slug || "manage-tech-service";
  const phones = (shop.data?.products ?? []).filter((item) => /phone/i.test(`${item.name} ${item.category} ${item.sku}`));

  const place = useMutation({
    mutationFn: () => {
      const offering =
        service === "voip" ? (voipKind === "ext" ? "voip-ext" : "voip-line")
        : service === "fax" ? (faxKind === "efax" ? "fax-efax" : "fax-physical")
        : service === "internet" ? (`internet-${provider}` as const)
        : service;
      return orderPortalOffering({
        data: { token, offering, site, notes, recipientEmail, drops, shipPhone: service === "voip" && voipKind === "ext" && shipPhone, confirmMonthly },
      });
    },
    onSuccess: (result) => {
      if (service === "voip" && voipKind === "ext" && shipPhone) {
        const sku = phones[0]?.sku || "desk-phone";
        addToCart(sku, 1);
        setDone(`Request ${result.id} is in. The desk phone is in your cart. Telxent still has to confirm the $18 monthly extension before it is billed.`);
      } else if (service === "voip" && voipKind === "ext") {
        setDone(`Request ${result.id} is in. You confirmed $18 per month. Telxent still has to confirm the extension before it is added to the bill.`);
      } else if (service === "wiring") {
        setDone(`Request ${result.id} is in. Wiring is ${money(drops * 17500)} for ${drops} drop${drops === 1 ? "" : "s"}. It is not billed until the desk confirms the work.`);
      } else {
        setDone(`Request ${result.id} is in. A ticket was opened for the desk.`);
      }
      setError("");
    },
    onError: (cause) => {
      setDone("");
      setError(cause instanceof Error ? cause.message : "Could not send the order.");
    },
  });

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
        <p className="text-sm text-muted">Equipment from the catalog, or a service for the office.</p>
      </div>
      <div className="flex gap-2">
        {(["equipment", "services"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={tab === item ? "h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white" : "h-10 rounded-full border border-line px-4 text-sm font-semibold"}>
            {item === "equipment" ? "Equipment" : "Order services"}
          </button>
        ))}
      </div>
      {tab === "equipment" ? (
        <>
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search equipment" aria-label="Search equipment" className="h-11 rounded-xl border border-line bg-surface px-3" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {products.map((product) => (
              <a key={product.id} href={`/store/${slug}/${product.sku}`} className="overflow-hidden rounded-xl border border-line bg-surface">
                {product.imageUrl ? <img src={product.imageUrl} alt="" className="aspect-square w-full bg-surface-2 object-contain" /> : <div className="aspect-square bg-surface-2" />}
                <div className="grid gap-1 p-3">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-sm text-muted">{money(product.priceCents)}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      ) : (
        <form className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]" onSubmit={(event) => { event.preventDefault(); setError(""); place.mutate(); }}>
          <div className="grid content-start gap-2">
            {SERVICES.map((item) => (
              <button key={item.id} type="button" onClick={() => setService(item.id)} className={service === item.id ? "rounded-xl border border-ink bg-surface px-3 py-3 text-left" : "rounded-xl border border-line bg-surface px-3 py-3 text-left"}>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="text-xs text-muted">{item.detail}</span>
              </button>
            ))}
          </div>
          <div className="grid content-start gap-3 rounded-2xl border border-line bg-surface p-4">
            {service === "network" ? <p className="text-sm text-muted">Use this to connect an office to the network, or to bring internet into a new location.</p> : null}
            {service === "voip" ? (
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={voipKind === "line"} onChange={() => setVoipKind("line")} /> New VoIP phone line</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={voipKind === "ext"} onChange={() => setVoipKind("ext")} /> Add an extension</label>
                {voipKind === "ext" ? (
                  <div className="grid gap-2 rounded-xl bg-surface-2 p-3">
                    <p className="text-sm">An extension adds <span className="font-semibold">$18 per month</span> to the Telxent VoIP bill. Telxent sends the confirmation. Nothing is billed until that confirmation comes back.</p>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1" checked={confirmMonthly} onChange={(event) => setConfirmMonthly(event.target.checked)} />
                      I agree to the $18 monthly extension on the Telxent bill.
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1" checked={shipPhone} onChange={(event) => setShipPhone(event.target.checked)} />
                      I need a phone shipped. Add a desk phone to the cart.
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}
            {service === "fax" ? (
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={faxKind === "physical"} onChange={() => setFaxKind("physical")} /> Physical fax</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={faxKind === "efax"} onChange={() => setFaxKind("efax")} /> eFax</label>
                {faxKind === "efax" ? (
                  <label className="grid gap-1 text-sm">
                    Email that should receive incoming faxes
                    <input value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} type="email" required className="h-11 rounded-xl border border-line px-3" />
                  </label>
                ) : null}
              </div>
            ) : null}
            {service === "internet" ? (
              <div className="grid gap-2">
                {([
                  ["spectrum", "Spectrum cable"],
                  ["att", "AT&T Fiber"],
                  ["frontier", "Frontier Fiber"],
                  ["fixed", "Fixed wireless"],
                ] as const).map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2 text-sm"><input type="radio" checked={provider === id} onChange={() => setProvider(id)} /> {label}</label>
                ))}
              </div>
            ) : null}
            {service === "wiring" ? (
              <label className="grid gap-1 text-sm">
                Number of drops · $175 each
                <input value={drops} onChange={(event) => setDrops(Math.max(1, Number(event.target.value) || 1))} type="number" min={1} max={50} className="h-11 w-28 rounded-xl border border-line px-3" />
                <span className="text-muted">{money(drops * 17500)} before the desk confirms the work.</span>
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              Office address
              <input value={site} onChange={(event) => setSite(event.target.value)} className="h-11 rounded-xl border border-line px-3" />
            </label>
            <label className="grid gap-1 text-sm">
              Notes
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-24 rounded-xl border border-line px-3 py-2" />
            </label>
            {error ? <p className="text-sm text-bad">{error}</p> : null}
            {done ? <p className="text-sm">{done} {shipPhone ? <a className="font-semibold text-accent" href={`/store/${slug}/checkout`}>Checkout the phone</a> : null}</p> : null}
            <button type="submit" disabled={place.isPending || !token} className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50">
              {place.isPending ? "Sending" : "Submit order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
