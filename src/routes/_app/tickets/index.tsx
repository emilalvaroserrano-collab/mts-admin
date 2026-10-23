import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listTickets } from "@/lib/portal/api";
import { ago } from "@/lib/portal/format";
import { ticketSearch } from "@/lib/portal/ticket-search";
import { ErrorNote, Loading, PageHeader, Select, StatusBadge } from "@/components/ui";

const VIEWS = ["", "Pending Projects", "Pending Orders", "Need Invoice"];

export const Route = createFileRoute("/_app/tickets/")({
  validateSearch: (search: Record<string, unknown>) => ticketSearch({
    q: typeof search.q === "string" ? search.q : "",
    status: typeof search.status === "string" ? search.status : "unresolved",
    org: typeof search.org === "string" ? search.org : "",
    category: typeof search.category === "string" ? search.category : "",
    assignee: typeof search.assignee === "string" ? search.assignee : "",
    view: typeof search.view === "string" ? search.view : "",
  }),
  component: TicketsPage,
});

function TicketsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = useQuery({
    queryKey: ["tickets", search],
    queryFn: () =>
      listTickets({
        data: {
          q: search.q,
          status: search.status,
          orgId: search.org ? Number(search.org) : null,
          category: search.category,
          assignee: search.assignee,
          view: search.view,
        },
      }),
  });

  function setSearch(partial: Partial<typeof search>) {
    navigate({ search: (prev) => ({ ...prev, ...partial }) });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Zendesk"
        title="Tickets"
        description="Unresolved work, saved views, and the conversation stay tied to Zendesk when the account is connected."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((view) => (
          <button
            key={view || "all-views"}
            type="button"
            onClick={() => setSearch({ view })}
            className={
              search.view === view
                ? "h-9 rounded-md bg-accent px-3 text-sm text-accent-fg"
                : "h-9 rounded-md border border-line bg-surface px-3 text-sm"
            }
          >
            {view || "All views"}
          </button>
        ))}
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={search.status} onChange={(event) => setSearch({ status: event.target.value })} aria-label="Status">
          <option value="unresolved">Unresolved</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="solved">Solved and closed</option>
          <option value="all">Every status</option>
        </Select>
        <Select value={search.org} onChange={(event) => setSearch({ org: event.target.value })} aria-label="Company">
          <option value="">All companies</option>
          {query.data?.orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
        <Select value={search.category} onChange={(event) => setSearch({ category: event.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {query.data?.categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </Select>
        <Select value={search.assignee} onChange={(event) => setSearch({ assignee: event.target.value })} aria-label="Assignee">
          <option value="">Anyone</option>
          {query.data?.assignees.map((assignee) => (
            <option key={assignee}>{assignee}</option>
          ))}
        </Select>
      </div>
      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorNote message={query.error.message} /> : null}
      {query.data ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {query.data.tickets.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-muted" colSpan={5}>
                    No tickets match this view.
                  </td>
                </tr>
              ) : null}
              {query.data.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/tickets/$ticketId" params={{ ticketId: String(ticket.id) }} className="font-medium hover:underline">
                      {ticket.subject}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {ticket.zendeskId ? `#${ticket.zendeskId}` : `P-${ticket.id}`}
                      {ticket.viewLabel ? ` · ${ticket.viewLabel}` : ""}
                      {ticket.category ? ` · ${ticket.category}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{ticket.organizationName || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={ticket.status} />
                  </td>
                  <td className="px-4 py-3">{ticket.assignee || "Unassigned"}</td>
                  <td className="px-4 py-3 text-muted">{ago(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
