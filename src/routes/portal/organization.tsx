import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePortalSession } from "@/lib/portal/use-portal-session";
import { savePortalCompany } from "@/lib/portal/api";
import { useShopToken } from "@/lib/portal/shop-session";

export const Route = createFileRoute("/portal/organization")({
  component: OrganizationPage,
});

function OrganizationPage() {
  const token = useShopToken();
  const client = useQueryClient();
  const session = usePortalSession();
  const [business, setBusiness] = useState(session.data?.business || session.data?.organization || "");
  const [phone, setPhone] = useState(session.data?.customer.phone || "");
  const [city, setCity] = useState(session.data?.customer.city || "");
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: () => savePortalCompany({ data: { token, business, phone, city } }),
    onSuccess: () => {
      setNotice("Saved. A ticket was opened so the desk can review the change.");
      void client.invalidateQueries({ queryKey: ["portal-session", token] });
    },
    onError: (error) => setNotice(error instanceof Error ? error.message : "Could not save."),
  });
  return (
    <form className="mx-auto grid w-full max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <h1 className="text-2xl font-semibold tracking-tight">My organization</h1>
      <p className="text-sm text-muted">You only see this company. Saving a change opens a ticket for review.</p>
      <input value={business} onChange={(event) => setBusiness(event.target.value)} required placeholder="Company name" aria-label="Company name" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" aria-label="Phone" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className="h-11 rounded-xl border border-line bg-surface px-3" />
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <button type="submit" disabled={save.isPending} className="h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50">Save company</button>
    </form>
  );
}
