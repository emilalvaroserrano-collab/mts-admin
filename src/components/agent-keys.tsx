import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Panel } from "@/components/ui";
import { createAgentKey, listAgentKeys, revokeAgentKey } from "@/lib/portal/agent-keys";

export function AgentKeys() {
  const client = useQueryClient();
  const [name, setName] = useState("CSR agent");
  const [secret, setSecret] = useState("");
  const keys = useQuery({ queryKey: ["agent-keys"], queryFn: () => listAgentKeys() });
  const create = useMutation({
    mutationFn: () => createAgentKey({ data: { name } }),
    onSuccess: (result) => {
      setSecret(result.key);
      setName("CSR agent");
      toast.success("Key created. Copy it now. It is not shown again.");
      void client.invalidateQueries({ queryKey: ["agent-keys"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not create the key."),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => revokeAgentKey({ data: { id } }),
    onSuccess: () => {
      toast.success("Key revoked");
      void client.invalidateQueries({ queryKey: ["agent-keys"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not revoke the key."),
  });

  return (
    <Panel className="grid gap-3 p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Super admin agent key</h2>
        <p className="mt-1 text-sm text-muted">This key is not tied to one user. The CSR uses it as Authorization: Bearer and can create, read, update, or delete any customer. A new user still has to verify their own email. The secret is stored as a hash and shown once.</p>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Key name" placeholder="Key name" required />
        <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating" : "Create key"}</Button>
      </form>
      {secret ? (
        <div className="grid gap-2 rounded-lg bg-[#f6f6f7] p-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-subtle uppercase">Copy this key now</p>
          <code className="break-all text-sm">{secret}</code>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(secret).then(() => toast.success("Copied"));
            }}
          >
            Copy key
          </Button>
        </div>
      ) : null}
      <div className="grid gap-2">
        {(keys.data ?? []).map((key) => (
          <div key={key.id} className="flex flex-col gap-2 rounded-lg border border-line px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{key.name}</p>
              <p className="text-xs text-muted">Super admin · {key.prefix}… {key.revokedAt ? "Revoked" : key.lastUsedAt ? `Last used ${key.lastUsedAt}` : "Not used yet"}</p>
            </div>
            {key.revokedAt ? null : (
              <Button type="button" variant="danger" disabled={revoke.isPending} onClick={() => revoke.mutate(key.id)}>Revoke</Button>
            )}
          </div>
        ))}
        {keys.isError ? <p className="text-sm text-bad">Only an admin can see agent keys.</p> : null}
      </div>
    </Panel>
  );
}
