import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getCsrContext,
  getCsrPushConfig,
  saveAccountSite,
  saveCsrContext,
  subscribeCsrDevice,
} from "@/lib/portal/csr-api";

const fieldClass = "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-ink";
const profileFields = [
  ["preferred_name", "Preferred name"],
  ["title", "Job title"],
  ["department", "Department"],
  ["alternate_phone", "Alternate phone"],
  ["timezone", "Timezone"],
  ["language", "Preferred language"],
  ["billing_contact_name", "Billing contact"],
  ["billing_contact_email", "Billing contact email"],
  ["it_contact_name", "IT contact"],
  ["it_contact_email", "IT contact email"],
] as const;

export function CsrAccountContext({ token }: { token: string }) {
  const client = useQueryClient();
  const context = useQuery({
    queryKey: ["csr-context", token],
    queryFn: () => getCsrContext({ data: token }),
    enabled: Boolean(token),
  });
  if (context.isPending) return <p className="text-sm text-muted">Loading support profile…</p>;
  if (context.error)
    return (
      <p role="alert" className="text-sm text-danger">
        {context.error.message}
      </p>
    );
  if (!context.data) return null;
  const data = context.data;
  return (
    <div className="grid gap-6">
      <ProfileForm
        token={token}
        initial={data.profile || {}}
        onSaved={() => void client.invalidateQueries({ queryKey: ["csr-context", token] })}
      />
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Sites and delivery locations</h2>
        <p className="text-sm text-muted">
          Sarah uses these addresses for service and equipment requests.
        </p>
        {data.sites.map((site) => (
          <article key={String(site.id)} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-medium">{String(site.name)}</p>
            <p className="text-sm text-muted">
              {[site.address, site.city, site.region, site.postal].filter(Boolean).join(", ")}
            </p>
            <p className="text-sm text-muted">
              {[site.contact_name, site.contact_phone, site.access_hours]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        ))}
        <SiteForm
          token={token}
          onSaved={() => void client.invalidateQueries({ queryKey: ["csr-context", token] })}
        />
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Account approvals and support</h2>
        <p className="text-sm text-muted">Managed by your MTS account team.</p>
        {data.policy ? (
          <dl className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2">
            {[
              ["payment_terms", "Payment terms"],
              ["approver_name", "Approver"],
              ["approver_email", "Approver email"],
              ["support_hours", "Support hours"],
              ["sla", "Service agreement"],
              ["escalation_contact", "Escalation contact"],
            ].map(([key, label]) => (
              <div key={key}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm">{String(data.policy?.[key] || "Not configured")}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-muted">Purchase order required</dt>
              <dd className="text-sm">{data.policy.po_required ? "Yes" : "No"}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted">
            Your account team has not supplied a support policy yet.
          </p>
        )}
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Equipment</h2>
        {data.assets.map((asset) => (
          <article key={String(asset.id)} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-medium">{String(asset.name)}</p>
            <p className="text-sm text-muted">
              {[asset.model, asset.serial, asset.managed ? "MTS managed" : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        ))}
        {data.assets.length === 0 && (
          <p className="text-sm text-muted">Your account team has not registered equipment yet.</p>
        )}
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Services</h2>
        {data.services.length ? (
          data.services.map((service) => (
            <article
              key={String(service.id)}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <p className="font-medium">
                {String(service.service_name)}{" "}
                <span className="text-sm font-normal text-muted">
                  · {String(service.status).replaceAll("_", " ")}
                </span>
              </p>
              <p className="text-sm text-muted">
                {service.provider_reference
                  ? `Provider reference: ${service.provider_reference}`
                  : "Awaiting provider reference"}
                {Number(service.monthly_cents) > 0
                  ? ` · $${(Number(service.monthly_cents) / 100).toFixed(2)}/month${service.status !== "active" ? " quoted" : ""}`
                  : ""}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted">No services on this account yet.</p>
        )}
      </section>
    </div>
  );
}

function ProfileForm({
  token,
  initial,
  onSaved,
}: {
  token: string;
  initial: Record<string, string | number | boolean | null>;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({
    timezone: "America/Los_Angeles",
    language: "en",
    quiet_start: 22,
    quiet_end: 7,
    ...initial,
  });
  const save = useMutation({
    mutationFn: () => saveCsrContext({ data: { token, profile: draft } }),
    onSuccess: onSaved,
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2 className="text-lg font-semibold">Support profile</h2>
      <p className="text-sm text-muted">
        Keep your work details current so Sarah can pick up with the right context.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {profileFields.map(([key, label]) => (
          <label key={key} className="grid gap-1 text-sm">
            <span>{label}</span>
            <input
              className={fieldClass}
              value={String(draft[key] || "")}
              maxLength={key.includes("email") ? 160 : 120}
              type={key.includes("email") ? "email" : "text"}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <fieldset className="grid gap-3 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-medium">Notifications</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.notifications_push === true}
            onChange={(e) => setDraft({ ...draft, notifications_push: e.target.checked })}
          />
          Allow subscribed devices to receive push updates
        </label>
        <p className="text-sm text-muted">
          Use the device button below to subscribe. Your timezone determines quiet hours.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["quiet_start", "Quiet hours start"],
            ["quiet_end", "Quiet hours end"],
          ].map(([key, label]) => (
            <label className="grid gap-1 text-sm" key={key}>
              {label}
              <select
                className={fieldClass}
                value={Number(draft[key])}
                onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </fieldset>
      <DeviceNotifications
        token={token}
        onSubscribed={() => setDraft({ ...draft, notifications_push: true })}
      />
      {save.error && (
        <p role="alert" className="text-sm text-danger">
          {save.error.message}
        </p>
      )}
      {save.isSuccess && (
        <p role="status" className="text-sm text-muted">
          Support profile saved.
        </p>
      )}
      <button
        className="min-h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
        disabled={save.isPending}
      >
        Save support profile
      </button>
    </form>
  );
}

function DeviceNotifications({ token, onSubscribed }: { token: string; onSubscribed: () => void }) {
  const config = useQuery({ queryKey: ["csr-push-config"], queryFn: () => getCsrPushConfig() });
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  async function subscribe() {
    setBusy(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window))
        throw new Error("Device notifications are unavailable in this browser.");
      if (!config.data?.configured)
        throw new Error(
          "Device notifications are not configured yet. Ticket and order updates still appear in Notifications.",
        );
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Device notifications were not enabled.");
      const registration = await navigator.serviceWorker.register("/csr-sw.js");
      await navigator.serviceWorker.ready;
      const bytes = Uint8Array.from(
        atob(config.data.publicKey.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: bytes,
      });
      await subscribeCsrDevice({
        data: { token, subscription: subscription.toJSON() as Record<string, unknown> },
      });
      setStatus("This device will receive ticket, order, and service updates.");
      onSubscribed();
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Device subscription failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={busy || config.isPending}
        className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold"
        onClick={() => void subscribe()}
      >
        {busy ? "Enabling notifications…" : "Enable updates on this device"}
      </button>
      {status && (
        <p role="status" className="text-sm text-muted">
          {status}
        </p>
      )}
    </div>
  );
}

function SiteForm({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false),
    [site, setSite] = useState<Record<string, unknown>>({ country: "United States" });
  const save = useMutation({
    mutationFn: () => saveAccountSite({ data: { token, site } }),
    onSuccess: () => {
      onSaved();
      setOpen(false);
      setSite({ country: "United States" });
    },
  });
  if (!open)
    return (
      <button
        type="button"
        className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold"
        onClick={() => setOpen(true)}
      >
        Add a site
      </button>
    );
  return (
    <form
      className="grid gap-3 rounded-xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["name", "Site name"],
          ["address", "Service / delivery address"],
          ["city", "City"],
          ["region", "State / region"],
          ["postal", "Postal code"],
          ["country", "Country"],
          ["contact_name", "Onsite contact"],
          ["contact_phone", "Contact phone"],
          ["access_hours", "Access hours"],
        ].map(([key, label]) => (
          <label className="grid gap-1 text-sm" key={key}>
            {label}
            <input
              className={fieldClass}
              required={key === "name" || key === "address"}
              maxLength={200}
              value={String(site[key] || "")}
              onChange={(e) => setSite({ ...site, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {save.error && (
        <p role="alert" className="text-sm text-danger">
          {save.error.message}
        </p>
      )}
      <div className="flex gap-2">
        <button
          className="min-h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          disabled={save.isPending}
        >
          Save site
        </button>
        <button type="button" className="min-h-11 px-4 text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
