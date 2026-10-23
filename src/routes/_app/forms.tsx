import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { listForms, listOrgs, saveForm, testForm } from "@/lib/portal/api";
import type { TicketForm } from "@/lib/portal/types";
import { Badge, Button, ErrorNote, Field, Input, Loading, Modal, PageHeader, Panel, Select, Toggle, errorText } from "@/components/ui";

export const Route = createFileRoute("/_app/forms")({
  component: FormsPage,
});

const blank = (): TicketForm => ({
  id: 0,
  name: "",
  category: "",
  subcategory: "",
  zendeskField: "",
  requiredFields: ["subject"],
  restricted: false,
  active: true,
});

function FormsPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const forms = useQuery({ queryKey: ["forms"], queryFn: () => listForms() });
  const orgs = useQuery({ queryKey: ["orgs"], queryFn: () => listOrgs() });
  const [draft, setDraft] = useState<TicketForm | null>(null);
  const [fieldsText, setFieldsText] = useState("subject");
  const [formId, setFormId] = useState<number | "">("");
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [asRegular, setAsRegular] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: (form: TicketForm) =>
      saveForm({
        data: {
          id: form.id || undefined,
          name: form.name,
          category: form.category,
          subcategory: form.subcategory,
          zendeskField: form.zendeskField,
          requiredFields: form.requiredFields,
          restricted: form.restricted,
          active: form.active,
        },
      }),
    onSuccess: () => {
      toast.success("Form saved");
      setDraft(null);
      client.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  const test = useMutation({
    mutationFn: () =>
      testForm({
        data: {
          formId: Number(formId),
          organizationId: Number(organizationId),
          fields: values,
          asRegular,
        },
      }),
    onSuccess: (result) => {
      if (result.warning) toast.error(`Ticket saved here. ${result.warning}`);
      else toast.success("Test ticket created");
      client.invalidateQueries({ queryKey: ["tickets"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      navigate({ to: "/tickets/$ticketId", params: { ticketId: String(result.ticketId) } });
    },
    onError: (error) => toast.error(errorText(error)),
  });

  if (forms.isPending) return <Loading />;
  if (forms.isError) return <ErrorNote message={forms.error.message} />;
  const chosen = forms.data.find((form) => form.id === formId);

  function open(form: TicketForm) {
    setDraft(form);
    setFieldsText(form.requiredFields.join(", "));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Intake"
        title="Ticket forms"
        description="Categories the desk accepts, the Zendesk field they map to, and who is allowed to use them."
        actions={<Button onClick={() => open(blank())}>Add form</Button>}
      />
      <div className="grid gap-3">
        {forms.data.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => open(form)}
            className="rounded-2xl border border-line bg-surface p-4 text-left hover:bg-surface-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{form.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {form.category || "Uncategorized"}
                  {form.subcategory ? ` · ${form.subcategory}` : ""}
                  {form.zendeskField ? ` · ${form.zendeskField}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {form.restricted ? <Badge tone="warn">Authorized only</Badge> : <Badge>Open</Badge>}
                <Badge tone={form.active ? "good" : "neutral"}>{form.active ? "Active" : "Off"}</Badge>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">Required: {form.requiredFields.join(", ") || "none"}</p>
          </button>
        ))}
      </div>
      <Panel className="mt-6">
        <h2 className="text-sm font-semibold">Test a submission</h2>
        <p className="mt-1 text-sm text-muted">Writes a portal ticket, and a Zendesk ticket when the connection is live.</p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            test.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Form">
              <Select
                value={formId}
                onChange={(event) => {
                  const next = event.target.value ? Number(event.target.value) : "";
                  setFormId(next);
                  setValues({});
                }}
                required
              >
                <option value="">Choose</option>
                {forms.data.filter((form) => form.active).map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Company">
              <Select
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value ? Number(event.target.value) : "")}
                required
              >
                <option value="">Choose</option>
                {(orgs.data ?? []).map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {(chosen?.requiredFields ?? ["subject"]).map((field) => (
            <Field key={field} label={field}>
              <Input
                value={values[field] ?? ""}
                onChange={(event) => setValues({ ...values, [field]: event.target.value })}
                required
              />
            </Field>
          ))}
          <Toggle checked={asRegular} onCheckedChange={setAsRegular} label="Submit as a regular customer" />
          <Button type="submit" disabled={test.isPending}>
            {test.isPending ? "Submitting" : "Create test ticket"}
          </Button>
        </form>
      </Panel>
      <Modal
        open={Boolean(draft)}
        onOpenChange={(openState) => {
          if (!openState) setDraft(null);
        }}
        title={draft?.id ? "Edit form" : "Add form"}
      >
        {draft ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const requiredFields = fieldsText
                .split(",")
                .map((field) => field.trim())
                .filter(Boolean);
              save.mutate({ ...draft, requiredFields });
            }}
          >
            <Field label="Name">
              <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <Input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
              </Field>
              <Field label="Subcategory">
                <Input value={draft.subcategory} onChange={(event) => setDraft({ ...draft, subcategory: event.target.value })} />
              </Field>
            </div>
            <Field label="Zendesk field" hint="The custom field key this form writes to.">
              <Input value={draft.zendeskField} onChange={(event) => setDraft({ ...draft, zendeskField: event.target.value })} />
            </Field>
            <Field label="Required fields" hint="Comma separated. subject is used as the ticket title.">
              <Input value={fieldsText} onChange={(event) => setFieldsText(event.target.value)} />
            </Field>
            <Toggle checked={draft.restricted} onCheckedChange={(restricted) => setDraft({ ...draft, restricted })} label="Authorized customers only" />
            <Toggle checked={draft.active} onCheckedChange={(active) => setDraft({ ...draft, active })} label="Active" />
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving" : "Save form"}
            </Button>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
