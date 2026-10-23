import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getPeople, reviewRequest, saveCustomer } from "@/lib/portal/api";
import type { Customer, Policy } from "@/lib/portal/types";
import { ago } from "@/lib/portal/format";
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
});

function PeoplePage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["people"], queryFn: () => getPeople() });
  const [draft, setDraft] = useState<Customer | null>(null);
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
    onSuccess: () => {
      toast.success("Person saved");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["people"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });
  const review = useMutation({
    mutationFn: (input: { id: number; decision: "approved" | "denied" }) => reviewRequest({ data: input }),
    onSuccess: () => {
      toast.success("Request reviewed");
      client.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;
  const pending = query.data.requests.filter((request) => request.status === "pending");

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

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="People"
        description="Customer users, Zendesk requesters, and requests for new accounts."
        actions={<Button onClick={() => setDraft({ ...blank(), organizationId: query.data.orgs[0]?.id ?? null })}>Add person</Button>}
      />
      {pending.length > 0 ? (
        <Panel className="mb-4">
          <h2 className="text-sm font-semibold">Requests waiting</h2>
          <ul className="mt-3 divide-y divide-line">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{request.requestedName}</p>
                  <p className="text-xs text-muted">
                    {request.requestedEmail} · {request.organizationName} · asked by {request.requestedBy || "unknown"} · {ago(request.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review.mutate({ id: request.id, decision: "approved" })}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => review.mutate({ id: request.id, decision: "denied" })}>Deny</Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Zendesk</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {query.data.people.map((person) => (
              <tr key={person.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs text-muted">{person.title || person.email}</p>
                </td>
                <td className="px-4 py-3">{person.organizationName || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={person.permissionLevel === "authorized" ? "pine" : "neutral"}>{person.permissionLevel}</Badge>
                    <StatusBadge value={person.active ? "active" : "inactive"} />
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{person.zendeskUserId || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="secondary" onClick={() => setDraft(person)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(draft)}
        onOpenChange={(open) => { if (!open) setDraft(null); }}
        title={draft?.id ? "Edit person" : "Add person"}
        description="Permissions are enforced when an order is placed."
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
