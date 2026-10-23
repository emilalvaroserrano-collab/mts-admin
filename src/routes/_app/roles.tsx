import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listPolicies, savePolicy } from "@/lib/portal/api";
import type { Policy } from "@/lib/portal/types";
import { Button, ErrorNote, Loading, PageHeader, Panel, Toggle, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/roles")({
  component: RolesPage,
});

function RolesPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["policies"], queryFn: () => listPolicies() });
  const [drafts, setDrafts] = useState<Policy[]>([]);

  useEffect(() => {
    if (query.data) setDrafts(query.data);
  }, [query.data]);

  const save = useMutation({
    mutationFn: (policy: Policy) =>
      savePolicy({
        data: {
          id: policy.id,
          canOrder: policy.canOrder,
          canRequestUsers: policy.canRequestUsers,
          canApproveOrders: policy.canApproveOrders,
          canManagePortal: policy.canManagePortal,
        },
      }),
    onSuccess: () => {
      toast.success("Role saved");
      client.invalidateQueries({ queryKey: ["policies"] });
      client.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;

  function patch(id: string, next: Partial<Policy>) {
    setDrafts((current) => current.map((policy) => (policy.id === id ? { ...policy, ...next } : policy)));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Access"
        title="Roles"
        description="What regular customers, authorized customers, agents, and admins are allowed to do. Company boundaries are enforced on the server."
      />
      <div className="grid gap-3">
        {drafts.map((policy) => (
          <Panel key={policy.id}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold">{policy.label}</h2>
                <p className="mt-1 max-w-xl text-sm text-muted">{policy.description}</p>
                <p className="mt-2 text-xs text-muted">Scope: {policy.scope}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Toggle checked={policy.canOrder} onCheckedChange={(canOrder) => patch(policy.id, { canOrder })} label="Can order products" />
              <Toggle
                checked={policy.canRequestUsers}
                onCheckedChange={(canRequestUsers) => patch(policy.id, { canRequestUsers })}
                label="Can request new users"
              />
              <Toggle
                checked={policy.canApproveOrders}
                onCheckedChange={(canApproveOrders) => patch(policy.id, { canApproveOrders })}
                label="Can approve orders"
              />
              <Toggle
                checked={policy.canManagePortal}
                onCheckedChange={(canManagePortal) => patch(policy.id, { canManagePortal })}
                label="Can change portal settings"
              />
            </div>
            <Button className="mt-4" type="button" disabled={save.isPending} onClick={() => save.mutate(policy)}>
              Save {policy.label.toLowerCase()}
            </Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}
