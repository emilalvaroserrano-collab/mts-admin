import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { submitPortalTicket } from "@/lib/portal/api";
import { useShopToken } from "@/lib/portal/shop-session";

export const Route = createFileRoute("/portal/tickets/new")({
  component: NewTicket,
});

const CATEGORIES = [
  "Outlook Not Working",
  "Computer or Laptop Issue",
  "Phone Issue",
  "Printer Not Working",
  "Internet Connection Issue",
  "Network / Wi-Fi Problem",
  "Microsoft 365 Support",
  "Password / Account Access",
  "Software Installation",
  "Security Concern",
  "Other IT Issue",
];

function NewTicket() {
  const token = useShopToken();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState("normal");
  const [device, setDevice] = useState("");
  const [notice, setNotice] = useState("");
  const send = useMutation({
    mutationFn: () => submitPortalTicket({ data: { token, subject, category, body, severity, device } }),
    onSuccess: (result) => {
      void client.invalidateQueries({ queryKey: ["portal-session", token] });
      if (result.warning && !result.zendeskId) setNotice(result.warning);
      void navigate({ to: "/portal/tickets/$ticketId", params: { ticketId: String(result.ticketId) } });
    },
    onError: (error) => setNotice(error instanceof Error ? error.message : "Could not open the ticket."),
  });

  return (
    <form
      className="mx-auto grid w-full max-w-3xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("");
        send.mutate();
      }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">New ticket</h1>
      <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category" className="h-11 rounded-xl border border-line bg-surface px-3">
        {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
      </select>
      <input value={subject} onChange={(event) => setSubject(event.target.value)} required placeholder="Subject" aria-label="Subject" className="h-11 rounded-xl border border-line bg-surface px-3" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Priority" className="h-11 rounded-xl border border-line bg-surface px-3">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <input value={device} onChange={(event) => setDevice(event.target.value)} placeholder="Affected device" aria-label="Affected device" className="h-11 rounded-xl border border-line bg-surface px-3" />
      </div>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} required placeholder="What is happening?" aria-label="Description" className="min-h-32 rounded-xl border border-line bg-surface px-3 py-3" />
      {notice ? <p className="text-sm text-bad">{notice}</p> : null}
      <button type="submit" disabled={send.isPending} className="h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50">{send.isPending ? "Sending" : "Submit ticket"}</button>
    </form>
  );
}
