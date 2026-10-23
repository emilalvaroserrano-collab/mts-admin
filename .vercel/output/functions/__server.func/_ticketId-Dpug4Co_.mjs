import { o as __toESM } from "./_runtime.mjs";
import { t as ticketSearch } from "./_ssr/ticket-search-CEf18BGL.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { M as updateTicket, l as getTicket, v as replyTicket } from "./_ssr/api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, m as Textarea, o as Field, p as StatusBadge, r as Button, u as PageHeader } from "./_ssr/ui-V14V10_q.mjs";
import { i as stamp } from "./_ssr/format-BF_Jz8jj.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$1 } from "./_ssr/router-29RYm-xQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_ticketId-Dpug4Co_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TicketPage() {
	const { ticketId } = Route$1.useParams();
	const id = Number(ticketId);
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["ticket", id],
		queryFn: () => getTicket({ data: id })
	});
	const [body, setBody] = (0, import_react.useState)("");
	const [publicNote, setPublicNote] = (0, import_react.useState)(true);
	const reply = useMutation({
		mutationFn: () => replyTicket({ data: {
			ticketId: id,
			body,
			publicNote
		} }),
		onSuccess: (result) => {
			setBody("");
			if (result.warning) toast.error(`Saved here. ${result.warning}`);
			else toast.success(publicNote ? "Reply sent" : "Internal note saved");
			client.invalidateQueries({ queryKey: ["ticket", id] });
			client.invalidateQueries({ queryKey: ["tickets"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const update = useMutation({
		mutationFn: (input) => updateTicket({ data: {
			id,
			status: input.status ?? query.data?.ticket.status ?? "open",
			assignee: input.assignee ?? query.data?.ticket.assignee ?? "",
			priority: input.priority ?? query.data?.ticket.priority ?? "normal"
		} }),
		onSuccess: (result) => {
			if (result.warning) toast.error(result.warning);
			else toast.success("Ticket updated");
			client.invalidateQueries({ queryKey: ["ticket", id] });
			client.invalidateQueries({ queryKey: ["tickets"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const ticket = query.data.ticket;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: ticket.zendeskId ? `Zendesk #${ticket.zendeskId}` : `Portal P-${ticket.id}`,
		title: ticket.subject,
		description: `${ticket.requesterName || "Unknown requester"}${ticket.requesterEmail ? ` · ${ticket.requesterEmail}` : ""}`,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/tickets",
			search: ticketSearch(),
			className: "inline-flex h-11 items-center text-sm text-accent",
			children: "Back to tickets"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Conversation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-4 grid gap-3",
				children: [query.data.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: comment.publicNote ? "rounded-lg border border-line px-3 py-3" : "rounded-lg bg-warn-soft px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-ink",
							children: comment.authorName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							comment.publicNote ? "Public" : "Internal",
							" · ",
							stamp(comment.createdAt)
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-sm",
						children: comment.body
					})]
				}, comment.id)), query.data.comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No replies yet."
				}) : null]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					reply.mutate();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: publicNote ? "Public reply" : "Internal note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: body,
						onChange: (event) => setBody(event.target.value),
						required: true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: publicNote ? "primary" : "secondary",
							onClick: () => setPublicNote(true),
							children: "Public"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: !publicNote ? "primary" : "secondary",
							onClick: () => setPublicNote(false),
							children: "Internal"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: reply.isPending,
						children: reply.isPending ? "Sending" : "Add to ticket"
					})]
				})]
			}) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "h-fit",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: ticket.status })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: ticket.status,
							onChange: (event) => update.mutate({ status: event.target.value }),
							children: [
								"new",
								"open",
								"pending",
								"solved",
								"closed"
							].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: status }, status))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Assignee",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: ticket.assignee,
							onChange: (event) => update.mutate({ assignee: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Unassigned"
								}),
								query.data.assignees.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name)),
								ticket.assignee && !query.data.assignees.includes(ticket.assignee) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: ticket.assignee }) : null
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: ticket.priority,
							onChange: (event) => update.mutate({ priority: event.target.value }),
							children: [
								"low",
								"normal",
								"high",
								"urgent"
							].map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: priority }, priority))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Company"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ticket.organizationId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/organizations/$orgId",
								params: { orgId: String(ticket.organizationId) },
								className: "text-accent",
								children: ticket.organizationName
							}) : "Unlinked" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ticket.category || "—" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "View"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ticket.viewLabel || "—" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Tags"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ticket.tags.length ? ticket.tags.join(", ") : "—" })] })
						]
					})
				]
			})]
		})]
	})] });
}
//#endregion
export { TicketPage as component };
