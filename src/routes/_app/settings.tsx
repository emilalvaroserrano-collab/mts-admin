import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings, saveStaff } from "@/lib/portal/api";
import type { PortalSettings, Role, Staff } from "@/lib/portal/types";
import { ago } from "@/lib/portal/format";
import { Button, ErrorNote, Field, Input, Loading, PageHeader, Panel, Select, Toggle, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

const ROLES: Role[] = ["owner", "admin", "agent", "viewer"];

function SettingsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (!query.data) return;
    setSettings(query.data.settings);
    setStaff(query.data.staff);
  }, [query.data]);

  const save = useMutation({
    mutationFn: (next: PortalSettings) => saveSettings({ data: next }),
    onSuccess: () => {
      toast.success("Portal settings saved");
      client.invalidateQueries({ queryKey: ["settings"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  const staffSave = useMutation({
    mutationFn: (member: Staff) =>
      saveStaff({
        data: {
          userId: member.userId,
          role: member.role,
          active: member.active,
          organizationId: member.organizationId,
        },
      }),
    onSuccess: () => {
      toast.success("Staff access updated");
      client.invalidateQueries({ queryKey: ["settings"] });
      client.invalidateQueries({ queryKey: ["shell"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (query.isPending || !settings) return <Loading />;
  if (query.isError) return <ErrorNote message={query.error.message} />;

  function patchStaff(userId: string, next: Partial<Staff>) {
    setStaff((current) => current.map((member) => (member.userId === userId ? { ...member, ...next } : member)));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Desk"
        title="Settings"
        description="Branding, who on staff can see which companies, and the record of changes."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <h2 className="text-sm font-semibold">Branding</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(settings);
            }}
          >
            <Field label="Name">
              <Input value={settings.brandName} onChange={(event) => setSettings({ ...settings, brandName: event.target.value })} required />
            </Field>
            <Field label="Support email">
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })}
              />
            </Field>
            <Field label="Tagline">
              <Input value={settings.tagline} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} />
            </Field>
            <Toggle
              checked={settings.notifyNewTicket}
              onCheckedChange={(notifyNewTicket) => setSettings({ ...settings, notifyNewTicket })}
              label="Note new tickets in the activity log"
            />
            <Toggle
              checked={settings.notifyNewOrder}
              onCheckedChange={(notifyNewOrder) => setSettings({ ...settings, notifyNewOrder })}
              label="Note new orders in the activity log"
            />
            <Toggle
              checked={settings.customerCatalogVisible}
              onCheckedChange={(customerCatalogVisible) => setSettings({ ...settings, customerCatalogVisible })}
              label="Show the catalog to customers"
            />
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving" : "Save settings"}
            </Button>
          </form>
        </Panel>
        <Panel>
          <h2 className="text-sm font-semibold">Activity</h2>
          <ul className="mt-3 divide-y divide-line">
            {query.data.audit.length === 0 ? <li className="py-3 text-sm text-muted">No changes yet.</li> : null}
            {query.data.audit.map((entry) => (
              <li key={entry.id} className="py-3">
                <p className="text-sm">
                  <span className="font-medium">{entry.actorName || "Desk"}</span> {entry.action.toLowerCase()}{" "}
                  <span className="font-medium">{entry.target}</span>
                </p>
                {entry.detail ? <p className="mt-1 text-xs text-muted">{entry.detail}</p> : null}
                <p className="mt-1 text-xs text-muted">{ago(entry.createdAt)}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel className="mt-4">
        <h2 className="text-sm font-semibold">Staff</h2>
        <p className="mt-1 text-sm text-muted">A company limit hides every other organization. Leave it open for the whole desk.</p>
        <ul className="mt-4 grid gap-4">
          {staff.map((member) => (
            <li key={member.userId} className="grid gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
              <div>
                <p className="font-medium">{member.name || member.email}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role">
                  <Select value={member.role} onChange={(event) => patchStaff(member.userId, { role: event.target.value as Role })}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Company limit">
                  <Select
                    value={member.organizationId ?? ""}
                    onChange={(event) =>
                      patchStaff(member.userId, { organizationId: event.target.value ? Number(event.target.value) : null })
                    }
                  >
                    <option value="">All companies</option>
                    {query.data.orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Toggle checked={member.active} onCheckedChange={(active) => patchStaff(member.userId, { active })} label="Account active" />
              <div>
                <Button type="button" size="sm" variant="secondary" disabled={staffSave.isPending} onClick={() => staffSave.mutate(member)}>
                  Save access
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
