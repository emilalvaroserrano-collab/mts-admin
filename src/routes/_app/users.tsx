import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getPeople, reviewRequest, saveCustomer, syncPortalUsers } from "@/lib/portal/api";
import type { Customer, Policy } from "@/lib/portal/types";
import { ago, day } from "@/lib/portal/format";
import { Badge, Button, ErrorNote, Field, Input, Loading, Modal, PageHeader, Panel, Select, StatusBadge, Toggle, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/users")({
  component: PeoplePage,
});

const blank = (): Customer => ({
  id: 0,
  organizationId: null,
  organizationName: "",
  name: "",
  email: "",
  title: "",
  permissionLevel: "regular",
  canOrder: false,
  canRequestUsers: false,
  canApproveOrders: false,
  active: true,
  zendeskUserId: "",
  createdAt: "",
  source: "company",
  staffUserId: "",
  phone: "",
  orderCount: 0,
  lastOrderId: null,
  lastOrderStatus: "",
  ticketId: null,
  zendeskTicketId: "",
});

function PeoplePage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["people"], queryFn: () => getPeople() });
  const [draft, setDraft] = useState<Customer | null>(null);
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const save = useMutation({
    mutationFn: (person: Customer) =>
      saveCustomer({
        data: {
          id: person.id || undefined,
          organizationId: person.organizationId,
          name: person.name,
          email: person.email,
          title: person.title,
          permissionLevel: person.permissionLevel,
          canOrder: person.canOrder,
          canRequestUsers: person.canRequestUsers,
          canApproveOrders: person.canApproveOrders,
          active: person.active,
          zendeskUserId: person.zendeskUserId,
        },
      }),
    onSuccess: (result) => {
      toast.success(result.zendeskId ? `Person saved. Zendesk ticket ${result.zendeskId}` : "Person saved");
      if (result.warning) toast.message(result.warning);
      setDraft(null);
      client.invalidateQueries({ queryKey: ["people"] });
      client.invalidateQueries({ queryKey: ["shell"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const review = useMutation({
    mutationFn: (input: { id: number; decision: "approved" | "denied" }) => reviewRequest({ data: input }),
    onSuccess: (result) => {
      toast.success(result.zendeskId ? `Request reviewed. Zendesk ticket ${result.zendeskId}` : "Request reviewed");
      if (result.warning) toast.message(result.warning);
      client.invalidateQueries({ queryKey: ["people"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const syncUsers = useMutation({
    mutationFn: () => syncPortalUsers(),
    onSuccess: (result) => {
      toast.success(result.failed ? `Synced ${result.synced}. ${result.failed} failed.` : `Synced ${result.synced} users to Zendesk`);
      client.invalidateQueries({ queryKey: ["people"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;
  const pending = query.data.requests.filter((request) => request.status === "pending");
  const needle = search.trim().toLowerCase();
  const people = query.data.people.filter((person) => {
    if (view === "active" && !person.active) return false;
    if (view === "inactive" && person.active) return false;
    if (view === "order" && !person.canOrder) return false;
    if (view === "approve" && !person.canApproveOrders) return false;
    if (view === "shop" && person.source !== "shop") return false;
    if (view === "portal" && person.source !== "portal") return false;
    if (view === "company" && person.source !== "company") return false;
    if (!needle) return true;
    return [person.name, person.email, person.organizationName, person.title, person.phone].join(" ").toLowerCase().includes(needle);
  });

  function applyPolicy(level: string) {
    const policy = query.data?.policies.find((item) => item.id === level);
    setDraft((current) =>
      current
        ? {
            ...current,
            permissionLevel: level,
            canOrder: policy?.canOrder ?? current.canOrder,
            canRequestUsers: policy?.canRequestUsers ?? current.canRequestUsers,
            canApproveOrders: policy?.canApproveOrders ?? current.canApproveOrders,
          }
        : current,
    );
  }

  function addShopPerson(person: Customer) {
    setDraft({
      ...blank(),
      name: person.name,
      email: person.email,
      title: "Online shop",
      phone: person.phone,
      organizationId: query.data?.orgs[0]?.id ?? null,
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="People"
        description="Company users and online shop customers, with their orders and Zendesk ticket."
        actions={
          <>
            <Button variant="secondary" disabled={syncUsers.isPending} onClick={() => syncUsers.mutate()}>
              {syncUsers.isPending ? "Syncing" : "Sync to Zendesk"}
            </Button>
            <Button onClick={() => setDraft({ ...blank(), organizationId: query.data.orgs[0]?.id ?? null })}>Add person</Button>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or company" aria-label="Search people" className="sm:max-w-xs" />
        <div className="flex gap-2 overflow-x-auto">
          {[
            ["all", "All"],
            ["company", "Company"],
            ["shop", "Shop"],
            ["portal", "Portal"],
            ["active", "Active"],
            ["inactive", "Inactive"],
            ["order", "Can order"],
            ["approve", "Approvers"],
            ["requests", "Requests"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={view === id ? "h-8 shrink-0 rounded-full bg-ink px-3 text-[13px] font-semibold text-white" : "h-8 shrink-0 rounded-full border border-line px-3 text-[13px] text-muted"}
            >
              {label}
              {id === "requests" && pending.length > 0 ? ` ${pending.length}` : ""}
            </button>
          ))}
        </div>
      </div>
      {view === "requests" || pending.length > 0 ? (
        <Panel className="mb-4">
          <h2 className="text-sm font-semibold">{view === "requests" ? "Account requests" : "Requests waiting"}</h2>
          <ul className="mt-3 divide-y divide-line">
            {(view === "requests" ? query.data.requests : pending).map((request) => (
              <li key={request.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{request.requestedName}</p>
                  <p className="text-xs text-muted">
                    {request.requestedEmail} · {request.organizationName || "No company"} · asked by {request.requestedBy || "unknown"} · {ago(request.createdAt)}
                  </p>
                </div>
                {request.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => review.mutate({ id: request.id, decision: "approved" })}>Approve</Button>
                    <Button size="sm" variant="secondary" onClick={() => review.mutate({ id: request.id, decision: "denied" })}>Deny</Button>
                  </div>
                ) : (
                  <StatusBadge value={request.status} />
                )}
              </li>
            ))}
            {(view === "requests" ? query.data.requests : pending).length === 0 ? <li className="py-3 text-sm text-muted">No requests.</li> : null}
          </ul>
        </Panel>
      ) : null}
      {view !== "requests" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={`${person.source}-${person.staffUserId || person.id}`} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-medium">{person.name || person.email}</p>
                    <p className="text-xs text-muted">{person.email}</p>
                    {person.phone ? <p className="text-xs text-muted">{person.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <p>{person.source === "shop" ? "Online shop" : person.source === "portal" ? person.organizationName || "Portal" : person.organizationName || "No company"}</p>
                    <p className="text-xs text-muted">{person.source === "company" ? person.title || "—" : person.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {person.source === "shop" ? <Badge tone="info">Shop</Badge> : person.source === "portal" ? <Badge tone="pine">Portal</Badge> : <Badge tone={person.permissionLevel === "authorized" ? "pine" : "neutral"}>{person.permissionLevel}</Badge>}
                      <StatusBadge value={person.active ? "active" : "inactive"} />
                      {person.canOrder ? <Badge tone="good">Orders</Badge> : null}
                      {person.canApproveOrders ? <Badge tone="warn">Approves</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {person.lastOrderId ? (
                      <Link to="/orders/$orderId" params={{ orderId: String(person.lastOrderId) }} className="font-medium hover:underline">
                        MT-{1000 + person.lastOrderId}
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                    <p className="text-xs text-muted">{person.orderCount} {person.orderCount === 1 ? "order" : "orders"}{person.lastOrderStatus ? ` · ${person.lastOrderStatus}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {person.ticketId ? (
                      <Link to="/tickets/$ticketId" params={{ ticketId: String(person.ticketId) }} className="text-accent hover:underline">
                        {person.zendeskTicketId ? `#${person.zendeskTicketId}` : `P-${person.ticketId}`}
                      </Link>
                    ) : (
                      <span className="text-muted">{person.zendeskUserId ? `User ${person.zendeskUserId}` : "Not synced"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{person.createdAt ? day(person.createdAt) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {person.source === "shop" ? (
                      <Button size="sm" variant="secondary" onClick={() => addShopPerson(person)}>Add to company</Button>
                    ) : person.source === "portal" ? (
                      <span className="text-xs text-muted">Staff account</span>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setDraft(person)}>Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {people.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No one matches that view.</p> : null}
        </div>
      ) : null}
      <Modal
        open={Boolean(draft)}
        onOpenChange={(open) => { if (!open) setDraft(null); }}
        title={draft?.id ? "Edit person" : "Add person"}
        description="Saving a new person opens their Zendesk ticket. Permissions are checked when they order."
      >
        {draft ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(draft);
            }}
          >
            <Field label="Name"><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></Field>
            <Field label="Email"><Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required /></Field>
            <Field label="Title"><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
            <Field label="Company">
              <Select
                value={draft.organizationId ?? ""}
                onChange={(event) => setDraft({ ...draft, organizationId: event.target.value ? Number(event.target.value) : null })}
              >
                <option value="">No company</option>
                {query.data.orgs.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
              </Select>
            </Field>
            <Field label="Permission level">
              <Select value={draft.permissionLevel} onChange={(event) => applyPolicy(event.target.value)}>
                <option value="regular">Regular customer</option>
                <option value="authorized">Authorized customer</option>
              </Select>
            </Field>
            <Field label="Zendesk user id" hint="Requester id from Zendesk, when you have one.">
              <Input value={draft.zendeskUserId} onChange={(event) => setDraft({ ...draft, zendeskUserId: event.target.value })} />
            </Field>
            <Toggle checked={draft.canOrder} onCheckedChange={(canOrder) => setDraft({ ...draft, canOrder })} label="Can order products" />
            <Toggle checked={draft.canRequestUsers} onCheckedChange={(canRequestUsers) => setDraft({ ...draft, canRequestUsers })} label="Can request users" />
            <Toggle checked={draft.canApproveOrders} onCheckedChange={(canApproveOrders) => setDraft({ ...draft, canApproveOrders })} label="Can approve orders" />
            <Toggle checked={draft.active} onCheckedChange={(active) => setDraft({ ...draft, active })} label="Account active" />
            <PolicyHint policies={query.data.policies} />
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving" : "Save person"}</Button>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}

function PolicyHint({ policies }: { policies: Policy[] }) {
  return (
    <p className="text-xs text-muted">
      Templates: {policies.filter((policy) => policy.id === "regular" || policy.id === "authorized").map((policy) => policy.label).join(" and ") || "set on the Roles page"}.
    </p>
  );
}