import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePortalSession } from "@/lib/portal/use-portal-session";
import { saveShopProfile } from "@/lib/portal/api";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useShopToken } from "@/lib/portal/shop-session";

export const Route = createFileRoute("/portal/account")({
  component: AccountPage,
});

function AccountPage() {
  const token = useShopToken();
  const session = usePortalSession();
  const user = useCurrentUser();
  const customer = session.data?.customer;
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [city, setCity] = useState(customer?.city || "");
  const [region, setRegion] = useState(customer?.region || "");
  const [postal, setPostal] = useState(customer?.postal || "");
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: () => saveShopProfile({ data: { token, name, phone, address, city, region, postal, country: customer?.country || "United States" } }),
    onSuccess: () => setNotice("Account saved."),
    onError: (error) => setNotice(error instanceof Error ? error.message : "Could not save."),
  });
  return (
    <form className="mx-auto grid w-full max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <p className="text-sm text-muted">{user?.primaryEmail || customer?.email}. Password changes stay with the sign-in provider you used.</p>
      <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Name" aria-label="Name" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" aria-label="Phone" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Billing address" aria-label="Address" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className="h-11 rounded-xl border border-line bg-surface px-3" />
        <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="State" aria-label="State" className="h-11 rounded-xl border border-line bg-surface px-3" />
        <input value={postal} onChange={(event) => setPostal(event.target.value)} placeholder="Postal" aria-label="Postal code" className="h-11 rounded-xl border border-line bg-surface px-3" />
      </div>
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <button type="submit" disabled={save.isPending} className="h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50">Save account</button>
    </form>
  );
}
