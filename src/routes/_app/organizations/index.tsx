import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { listOrgs, saveOrg } from "@/lib/portal/api";
import { Badge, Button, Empty, ErrorNote, Field, Input, Loading, Modal, PageHeader } from "@/components/ui";
import { errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/organizations/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const query = useQuery({ queryKey: ["orgs"], queryFn: () => listOrgs() });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const navigate = useNavigate();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      saveOrg({
        data: {
          name,
          domain,
          industry,
          phone: "",
          address: "",
          zendeskOrgId: "",
          notes: "",
          portalAccess: true,
          orderingEnabled: true,
          userRequestsEnabled: true,
          approvalRequired: true,
        },
      }),
    onSuccess: (result) => {
      toast.success("Company added");
      client.invalidateQueries({ queryKey: ["orgs"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      navigate({ to: "/organizations/$orgId", params: { orgId: String(result.id) } });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Companies"
        description="Profiles, Zendesk organizations, and who is allowed to order."
        actions={<Button onClick={() => setOpen(true)}>Add company</Button>}
      />
      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorNote message={query.error.message} /> : null}
      {query.data && query.data.length === 0 ? <Empty title="No companies" body="Add the first customer organization." /> : null}
      {query.data && query.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">People</th>
                <th className="px-4 py-3 font-medium">Open tickets</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((org) => (
                <tr key={org.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/organizations/$orgId" params={{ orgId: String(org.id) }} className="font-medium hover:underline">
                      {org.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {org.industry || "No industry"}
                      {org.zendeskOrgId ? ` · Zendesk ${org.zendeskOrgId}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{org.userCount}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{org.openTickets}</td>
                  <td className="px-4 py-3">
                    <Badge tone={org.portalAccess ? "good" : "neutral"}>{org.portalAccess ? "Portal on" : "Portal off"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Modal open={open} onOpenChange={setOpen} title="Add company" description="You can link the Zendesk organization after it is saved.">
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Name">
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>
          <Field label="Domain">
            <Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="company.example" />
          </Field>
          <Field label="Industry">
            <Input value={industry} onChange={(event) => setIndustry(event.target.value)} />
          </Field>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving" : "Create company"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
