import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  findCsrStaffCustomers,
  listCsrReviewActions,
  reconcileCsrAction,
  getCsrStaffCustomer,
  publishCsrKnowledge,
  saveCsrAccountPolicy,
  saveCsrAsset,
  updateCsrServiceStatus,
} from "@/lib/portal/csr-staff";
import { SERVICE_TRANSITIONS } from "@/lib/portal/csr-policy";
import type { CsrContext } from "@/lib/portal/csr-store";

export const Route = createFileRoute("/_app/csr")({ component: CsrOperations });
const inputClass = "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm";
const buttonClass =
  "min-h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50";

function CsrOperations() {
  const [query, setQuery] = useState(""),
    [customerId, setCustomerId] = useState(0);
  const customers = useQuery({
    queryKey: ["csr-customers", query],
    queryFn: () => findCsrStaffCustomers({ data: query }),
  });
  const context = useQuery({
    queryKey: ["csr-staff", customerId],
    queryFn: () => getCsrStaffCustomer({ data: customerId }),
    enabled: customerId > 0,
  });
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sarah workspace</h1>
        <p className="mt-2 text-sm text-muted">
          Manage account approvals, service fulfillment, and the guidance Sarah can use.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Find a customer
          <input
            className={inputClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Customer
          <select
            aria-label="Customer"
            className={inputClass}
            value={customerId}
            onChange={(e) => setCustomerId(Number(e.target.value))}
          >
            <option value={0}>Choose a customer</option>
            {customers.data?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || customer.email} · {customer.email}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(customers.error || context.error) && (
        <p role="alert">{(customers.error || context.error)?.message}</p>
      )}
      {context.isFetching && <p>Loading account context…</p>}
      {context.data && (
        <CustomerWorkspace key={customerId} customerId={customerId} context={context.data} />
      )}
    </div>
  );
}

function CustomerWorkspace({ customerId, context }: { customerId: number; context: CsrContext }) {
  const client = useQueryClient(),
    [policy, setPolicy] = useState<Record<string, unknown>>(context.policy || {});
  const save = useMutation({
    mutationFn: () => saveCsrAccountPolicy({ data: { customerId, policy } }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["csr-staff", customerId] }),
  });
  const fields = [
    ["approver_name", "Approver name"],
    ["approver_email", "Approver email"],
    ["payment_terms", "Payment terms"],
    ["support_hours", "Support hours"],
    ["sla", "Service agreement / response targets"],
    ["escalation_contact", "Escalation contact"],
  ] as const;
  return (
    <>
      <form
        className="grid gap-4 rounded-2xl border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <h2 className="text-lg font-semibold">Account policy</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="grid gap-1 text-sm">
              {label}
              <input
                className={inputClass}
                type={key.includes("email") ? "email" : "text"}
                value={String(policy[key] || "")}
                onChange={(e) => setPolicy({ ...policy, [key]: e.target.value })}
              />
            </label>
          ))}
          {[
            ["spending_limit_cents", "Maximum equipment subtotal (USD)"],
            ["approval_threshold_cents", "Approval required above (USD)"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-1 text-sm">
              {label}
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                placeholder="No limit set"
                value={policy[key] == null || policy[key] === "" ? "" : Number(policy[key]) / 100}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    [key]: e.target.value === "" ? null : Math.round(Number(e.target.value) * 100),
                  })
                }
              />
            </label>
          ))}
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={policy.po_required === true}
            onChange={(e) => setPolicy({ ...policy, po_required: e.target.checked })}
          />
          Require a purchase order number
        </label>
        <p className="text-sm text-muted">
          Purchases above the approval threshold are held for the account approver. They are never
          submitted by Sarah automatically.
        </p>
        <Result pending={save.isPending} error={save.error} success={save.isSuccess} />
        <button className={buttonClass} disabled={save.isPending}>
          Save policy
        </button>
      </form>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Service fulfillment</h2>
        {context.services.map((service) => (
          <ServiceStatus
            key={`${service.id}-${service.status}`}
            customerId={customerId}
            service={service}
          />
        ))}
        {!context.services.length && <p className="text-sm text-muted">No service requests.</p>}
      </section>
      <ReviewActions customerId={customerId} />
      <AssetForm customerId={customerId} context={context} />
      <KnowledgeForm customerId={customerId} />
    </>
  );
}
function ServiceStatus({
  customerId,
  service,
}: {
  customerId: number;
  service: CsrContext["services"][number];
}) {
  const client = useQueryClient(),
    [status, setStatus] = useState(""),
    [reference, setReference] = useState(String(service.provider_reference || ""));
  const update = useMutation({
    mutationFn: () =>
      updateCsrServiceStatus({
        data: { customerId, requestId: Number(service.id), status, providerReference: reference },
      }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["csr-staff", customerId] }),
  });
  const next = SERVICE_TRANSITIONS[String(service.status)] || [];
  return (
    <form
      className="grid gap-3 rounded-xl border border-line bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate();
      }}
    >
      <div>
        <p className="font-semibold">
          {String(service.service_name)} · #{service.id}
        </p>
        <p className="text-sm text-muted">
          {String(service.status).replaceAll("_", " ")} · Quantity {service.quantity}
        </p>
      </div>
      {next.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Next status
              <select
                required
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Choose status</option>
                {next.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Provider confirmation reference
              <input
                className={inputClass}
                required={status === "active"}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </label>
          </div>
          <Result pending={update.isPending} error={update.error} success={update.isSuccess} />
          <button className={buttonClass} disabled={update.isPending}>
            Update service
          </button>
        </>
      )}
    </form>
  );
}
function KnowledgeForm({ customerId }: { customerId: number }) {
  const [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [sourceUrl, setSourceUrl] = useState(""),
    [global, setGlobal] = useState(false),
    [approved, setApproved] = useState(false);
  const publish = useMutation({
    mutationFn: () =>
      publishCsrKnowledge({ data: { customerId, title, body, sourceUrl, global, approved } }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setSourceUrl("");
      setApproved(false);
    },
  });
  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        publish.mutate();
      }}
    >
      <h2 className="text-lg font-semibold">Add support guidance</h2>
      <label className="grid gap-1 text-sm">
        Title
        <input
          required
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Approved procedure or policy
        <textarea
          required
          className="min-h-40 rounded-xl border border-line bg-surface p-3 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Source link
        <input
          className={inputClass}
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={global} onChange={(e) => setGlobal(e.target.checked)} />
        Share across MTS customer organizations
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
        I approve this guidance for Sarah’s responses
      </label>
      <Result pending={publish.isPending} error={publish.error} success={publish.isSuccess} />
      <button className={buttonClass} disabled={publish.isPending}>
        Save guidance
      </button>
    </form>
  );
}
function Result({
  pending,
  error,
  success,
}: {
  pending: boolean;
  error: Error | null;
  success: boolean;
}) {
  return error ? (
    <p role="alert" className="text-sm text-danger">
      {error.message}
    </p>
  ) : pending ? (
    <p role="status" className="text-sm text-muted">
      Saving…
    </p>
  ) : success ? (
    <p role="status" className="text-sm text-muted">
      Saved.
    </p>
  ) : null;
}

function AssetForm({ customerId, context }: { customerId: number; context: CsrContext }) {
  const client = useQueryClient(),
    [draft, setDraft] = useState({
      name: "",
      category: "",
      model: "",
      serial: "",
      siteId: "",
      managed: false,
      notes: "",
    });
  const save = useMutation({
    mutationFn: () => saveCsrAsset({ data: { customerId, ...draft } }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["csr-staff", customerId] });
      setDraft({
        name: "",
        category: "",
        model: "",
        serial: "",
        siteId: "",
        managed: false,
        notes: "",
      });
    },
  });
  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2 className="text-lg font-semibold">Equipment register</h2>
      {context.assets.map((asset) => (
        <p className="text-sm text-muted" key={String(asset.id)}>
          {String(asset.name)} · {String(asset.model)} · {String(asset.serial)}
        </p>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        {(["name", "category", "model", "serial", "notes"] as const).map((key) => (
          <label className="grid gap-1 text-sm" key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <input
              className={inputClass}
              required={key === "name"}
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="grid gap-1 text-sm">
          Site
          <select
            className={inputClass}
            value={draft.siteId}
            onChange={(e) => setDraft({ ...draft, siteId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {context.sites.map((site) => (
              <option key={String(site.id)} value={String(site.id)}>
                {String(site.name)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.managed}
          onChange={(e) => setDraft({ ...draft, managed: e.target.checked })}
        />
        Managed by MTS
      </label>
      <Result pending={save.isPending} error={save.error} success={save.isSuccess} />
      <button className={buttonClass} disabled={save.isPending}>
        Register equipment
      </button>
    </form>
  );
}

function ReviewActions({ customerId }: { customerId: number }) {
  const actions = useQuery({
    queryKey: ["csr-review", customerId],
    queryFn: () => listCsrReviewActions({ data: customerId }),
    refetchInterval: 30000,
  });
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">Requests needing review</h2>
      <p className="text-sm text-muted">
        Check the portal and provider records before recording the actual outcome. Processing
        requests must be at least five minutes old.
      </p>
      {actions.error && <p role="alert">{actions.error.message}</p>}
      {actions.data?.map((action) => (
        <ReviewAction key={action.id} customerId={customerId} action={action} />
      ))}
      {actions.data?.length === 0 && (
        <p className="text-sm text-muted">No requests need reconciliation.</p>
      )}
    </section>
  );
}
function ReviewAction({
  customerId,
  action,
}: {
  customerId: number;
  action: { id: string; title: string; status: string };
}) {
  const client = useQueryClient(),
    [outcome, setOutcome] = useState<"completed" | "not_completed">("not_completed"),
    [reference, setReference] = useState(""),
    [note, setNote] = useState("");
  const save = useMutation({
    mutationFn: () =>
      reconcileCsrAction({ data: { customerId, actionId: action.id, outcome, reference, note } }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["csr-review", customerId] }),
  });
  return (
    <form
      className="grid gap-3 rounded-xl border border-line bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <p className="font-medium">{action.title}</p>
      <p className="text-sm text-muted">{action.status.replaceAll("_", " ")}</p>
      <label className="grid gap-1 text-sm">
        Verified outcome
        <select
          className={inputClass}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as "completed" | "not_completed")}
        >
          <option value="not_completed">Did not complete</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Ticket, order, or provider reference
        <input
          className={inputClass}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Review note
        <textarea
          required
          minLength={10}
          className="min-h-24 rounded-xl border border-line bg-surface p-3 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <Result pending={save.isPending} error={save.error} success={save.isSuccess} />
      <button className={buttonClass} disabled={save.isPending}>
        Record reconciliation
      </button>
    </form>
  );
}
