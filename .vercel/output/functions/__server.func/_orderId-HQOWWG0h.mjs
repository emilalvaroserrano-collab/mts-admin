import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { i as getOrder, j as updateOrder, u as linkOrderTicket } from "./_ssr/api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, m as Textarea, o as Field, p as StatusBadge, r as Button, u as PageHeader } from "./_ssr/ui-V14V10_q.mjs";
import { n as day, r as money } from "./_ssr/format-BF_Jz8jj.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as Route$5 } from "./_ssr/router-29RYm-xQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-HQOWWG0h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ascii(value) {
	return value.replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, " ").slice(0, 110);
}
function esc(value) {
	return ascii(value).replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function buildOrderPdf(order) {
	const rows = [];
	const push = (cmd) => rows.push(cmd);
	push("0.110 0.239 0.227 rg");
	push("0 742 612 50 re f");
	push("BT");
	push("/F2 18 Tf");
	push("1 1 1 rg");
	push("1 0 0 1 48 764 Tm");
	push("(ManageTech) Tj");
	push("/F1 9 Tf");
	push("1 0 0 1 48 750 Tm");
	push("(Equipment order) Tj");
	push("ET");
	push("0.102 0.098 0.086 rg");
	push("BT");
	push("/F2 16 Tf");
	push(`1 0 0 1 48 710 Tm`);
	push(`(${esc(order.number)}) Tj`);
	push("/F1 11 Tf");
	push(`1 0 0 1 48 690 Tm`);
	push(`(${esc(order.organizationName)}) Tj`);
	push(`1 0 0 1 48 674 Tm`);
	push(`(${esc(order.customerName || "No requester")}  ${esc(order.customerEmail)}) Tj`);
	push(`1 0 0 1 48 652 Tm`);
	push(`(Status ${esc(order.status)}    Placed ${esc(day(order.createdAt))}) Tj`);
	const ticket = order.zendeskTicketId ? `Zendesk ${order.zendeskTicketId}` : order.ticketId ? `Portal ticket ${order.ticketId}` : "No linked ticket";
	push(`1 0 0 1 48 636 Tm`);
	push(`(${esc(ticket)}) Tj`);
	push("ET");
	push("0.78 0.76 0.72 RG");
	push("0.6 w");
	push("48 618 m 564 618 l S");
	push("BT");
	push("/F2 9 Tf");
	push("0.45 0.43 0.40 rg");
	push("1 0 0 1 48 600 Tm");
	push("(Item) Tj");
	push("1 0 0 1 320 600 Tm");
	push("(Qty) Tj");
	push("1 0 0 1 380 600 Tm");
	push("(Unit) Tj");
	push("1 0 0 1 480 600 Tm");
	push("(Line) Tj");
	push("ET");
	let y = 580;
	for (const item of order.items.slice(0, 12)) {
		const line = item.quantity * item.unitPriceCents;
		push("0.102 0.098 0.086 rg");
		push("BT");
		push("/F1 10 Tf");
		push(`1 0 0 1 48 ${y} Tm`);
		push(`(${esc(`${item.productName}  ${item.sku}`)}) Tj`);
		push(`1 0 0 1 320 ${y} Tm`);
		push(`(${item.quantity}) Tj`);
		push(`1 0 0 1 380 ${y} Tm`);
		push(`(${esc(money(item.unitPriceCents))}) Tj`);
		push(`1 0 0 1 480 ${y} Tm`);
		push(`(${esc(money(line))}) Tj`);
		push("ET");
		y -= 18;
	}
	y -= 8;
	push("0.78 0.76 0.72 RG");
	push(`48 ${y + 12} m 564 ${y + 12} l S`);
	push("BT");
	push("/F2 12 Tf");
	push("0.102 0.098 0.086 rg");
	push(`1 0 0 1 380 ${y} Tm`);
	push(`(Total  ${esc(money(order.totalCents))}) Tj`);
	push("ET");
	y -= 36;
	const notes = [
		order.notes ? `Notes: ${order.notes}` : "",
		order.approvalNote ? `Approval: ${order.approvalNote}` : "",
		order.processingNote ? `Processing: ${order.processingNote}` : ""
	].filter(Boolean);
	push("BT");
	push("/F1 10 Tf");
	for (const note of notes) {
		push(`1 0 0 1 48 ${y} Tm`);
		push(`(${esc(note)}) Tj`);
		y -= 16;
	}
	push("ET");
	push("BT");
	push("/F1 8 Tf");
	push("0.45 0.43 0.40 rg");
	push("1 0 0 1 48 48 Tm");
	push("(Zendesk remains the system of record for the linked support ticket.) Tj");
	push("ET");
	const stream = rows.join("\n");
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
		`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
	];
	let body = "%PDF-1.4\n";
	const offsets = [0];
	objects.forEach((obj, index) => {
		offsets.push(body.length);
		body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
	});
	const xref = body.length;
	body += `xref\n0 ${objects.length + 1}\n`;
	body += "0000000000 65535 f \n";
	for (let i = 1; i < offsets.length; i += 1) body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
	body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	return new TextEncoder().encode(body);
}
function orderPdfUrl(order) {
	const bytes = buildOrderPdf(order);
	return URL.createObjectURL(new Blob([bytes.buffer], { type: "application/pdf" }));
}
var STATUSES = [
	"pending",
	"approved",
	"processing",
	"fulfilled",
	"cancelled"
];
function OrderPage() {
	const { orderId } = Route$5.useParams();
	const id = Number(orderId);
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["order", id],
		queryFn: () => getOrder({ data: id })
	});
	const [status, setStatus] = (0, import_react.useState)("pending");
	const [approvalNote, setApprovalNote] = (0, import_react.useState)("");
	const [processingNote, setProcessingNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setStatus(query.data.order.status);
		setApprovalNote(query.data.order.approvalNote);
		setProcessingNote(query.data.order.processingNote);
	}, [query.data]);
	const save = useMutation({
		mutationFn: () => updateOrder({ data: {
			id,
			status,
			approvalNote,
			processingNote
		} }),
		onSuccess: () => {
			toast.success("Order updated");
			client.invalidateQueries({ queryKey: ["order", id] });
			client.invalidateQueries({ queryKey: ["orders"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const link = useMutation({
		mutationFn: () => linkOrderTicket({ data: id }),
		onSuccess: (result) => {
			if (result.warning) toast.error(`Ticket saved here. ${result.warning}`);
			else toast.success("Linked to a ticket");
			client.invalidateQueries({ queryKey: ["order", id] });
			client.invalidateQueries({ queryKey: ["tickets"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const order = query.data.order;
	function openPdf() {
		const url = orderPdfUrl(order);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${order.number}.pdf`;
		anchor.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 1500);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: `Placed ${day(order.createdAt)}`,
			title: order.number,
			description: `${order.organizationName}${order.customerName ? ` · ${order.customerName}` : ""}`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				type: "button",
				onClick: openPdf,
				children: "Order PDF"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/orders",
				className: "inline-flex h-11 items-center text-sm text-accent",
				children: "All orders"
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: order.status }), order.ticketId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tickets/$ticketId",
				params: { ticketId: String(order.ticketId) },
				className: "text-sm text-accent",
				children: order.zendeskTicketId ? `Zendesk #${order.zendeskTicketId}` : `Portal ticket P-${order.ticketId}`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-muted",
				children: "No linked ticket"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Equipment"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[28rem] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Item"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 font-medium",
									children: "Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 text-right font-medium",
									children: "Line"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: item.productName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: item.sku
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 font-mono tabular-nums",
									children: item.quantity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 font-mono tabular-nums",
									children: money(item.unitPriceCents)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 text-right font-mono tabular-nums",
									children: money(item.quantity * item.unitPriceCents)
								})
							]
						}, item.id)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-right font-mono text-lg tabular-nums",
					children: money(order.totalCents)
				}),
				order.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 whitespace-pre-wrap text-sm text-muted",
					children: order.notes
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid content-start gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Processing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						save.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: status,
								onChange: (event) => setStatus(event.target.value),
								children: STATUSES.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value,
									children: value
								}, value))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Approval",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: approvalNote,
								onChange: (event) => setApprovalNote(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Bench note",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: processingNote,
								onChange: (event) => setProcessingNote(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: save.isPending ? "Saving" : "Save order"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Zendesk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: order.ticketSubject || "Creates a portal ticket tagged Pending Orders, and a Zendesk ticket when the desk is connected."
					}),
					order.ticketId ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						type: "button",
						variant: "secondary",
						disabled: link.isPending,
						onClick: () => link.mutate(),
						children: link.isPending ? "Linking" : "Create ticket"
					})
				] })]
			})]
		})
	] });
}
//#endregion
export { OrderPage as component };
