import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { a as orderEmail, c as shopifyFulfillment, i as orderCustomer, l as shopifyPayment, n as day, o as paymentLabel, r as money, s as shopifyDelivery, t as ago } from "./_ssr/format-DhyAHcG6.mjs";
import { C as linkOrderTicket, G as refreshAlternativeOrder, Nt as trackAwb, Pt as updateOrder, n as deleteOrder, s as getOrder } from "./_ssr/api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, f as Select, m as Textarea, o as Field, p as StatusBadge, r as Button, s as Input, t as Badge, u as PageHeader } from "./_ssr/ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { l as Route$21 } from "./_ssr/router-DN3-t_kz.mjs";
import { i as upsTrackUrl, n as normalizeAwb, t as isUpsAwb } from "./_ssr/awb-C_gAkvba.mjs";
import { n as code128Bars, t as OrderBarcode } from "./_ssr/order-barcode-BEtiwIcS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-BEIeKzxn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function detector() {
	const Ctor = window.BarcodeDetector;
	if (!Ctor) return null;
	return new Ctor({ formats: [
		"code_128",
		"code_39",
		"qr_code",
		"ean_13",
		"ean_8",
		"upc_a",
		"itf",
		"codabar",
		"pdf417",
		"data_matrix"
	] });
}
function AwbScanner({ onScan }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const videoRef = (0, import_react.useRef)(null);
	const onScanRef = (0, import_react.useRef)(onScan);
	onScanRef.current = onScan;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		let stopped = false;
		let stream = null;
		let timer = 0;
		const finish = (value) => {
			const awb = normalizeAwb(value);
			if (awb.length < 8) return;
			stopped = true;
			onScanRef.current(awb);
			setOpen(false);
		};
		(async () => {
			const reader = detector();
			if (!reader || !navigator.mediaDevices?.getUserMedia) {
				setMessage("This browser has no barcode scanner. Type the UPS 1Z number, or use Chrome.");
				return;
			}
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: { facingMode: { ideal: "environment" } }
				});
			} catch {
				setMessage("Allow the camera to scan the UPS label.");
				return;
			}
			const video = videoRef.current;
			if (!video) return;
			video.srcObject = stream;
			await video.play();
			const tick = async () => {
				if (stopped || !video.videoWidth) {
					timer = window.setTimeout(tick, 200);
					return;
				}
				try {
					const value = (await reader.detect(video)).find((hit) => hit.rawValue)?.rawValue;
					if (value) {
						finish(value);
						return;
					}
				} catch {}
				timer = window.setTimeout(tick, 200);
			};
			tick();
		})();
		return () => {
			stopped = true;
			window.clearTimeout(timer);
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "secondary",
			onClick: () => {
				setMessage("");
				setOpen(true);
			},
			children: "Scan UPS AWB"
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-lg border border-line bg-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: "aspect-[4/3] w-full object-cover",
				muted: true,
				playsInline: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 bg-surface px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: message || "Point the camera at the 1Z barcode."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs font-medium text-ink",
					onClick: () => setOpen(false),
					children: "Close"
				})]
			})]
		}) : message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: message
		}) : null]
	});
}
function ascii(value) {
	return value.replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, " ").slice(0, 110);
}
function esc(value) {
	return ascii(value).replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function drawBarcode(push, value, x, y, module, height) {
	const bars = code128Bars(value);
	let cursor = x + 10 * module;
	let index = 0;
	push("0 0 0 rg");
	while (index < bars.length) {
		if (!bars[index]) {
			cursor += module;
			index += 1;
			continue;
		}
		let run = 1;
		while (bars[index + run]) run += 1;
		const width = Number((run * module).toFixed(2));
		push(`${cursor.toFixed(2)} ${y} ${width} ${height} re f`);
		cursor += run * module;
		index += run;
	}
}
function buildOrderPdf(order) {
	const rows = [];
	const push = (cmd) => rows.push(cmd);
	push("0.188 0.188 0.188 rg");
	push("0 742 612 50 re f");
	push("BT");
	push("/F2 14 Tf");
	push("1 1 1 rg");
	push("1 0 0 1 48 762 Tm");
	push("(Manage Tech Service) Tj");
	push("/F1 9 Tf");
	push("1 0 0 1 48 750 Tm");
	push("(Catalog order) Tj");
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
	drawBarcode(push, order.number, 360, 656, 1.15, 52);
	push("BT");
	push("/F1 8 Tf");
	push("0.102 0.098 0.086 rg");
	push("1 0 0 1 372 646 Tm");
	push(`(${esc(order.number)}) Tj`);
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
function printAwb(number) {
	const label = document.getElementById("awb-label");
	if (!label) return;
	const popup = window.open("", "awb", "noopener,noreferrer,width=480,height=720");
	if (!popup) return;
	popup.document.write(`<!doctype html><meta charset="utf-8"><title>${number} air waybill</title>
    <style>body{margin:28px;font-family:Helvetica,sans-serif;color:#111}svg{width:100%;height:auto}p{text-align:center}</style>
    ${label.innerHTML}<script>addEventListener("load",()=>print())<\/script>`);
	popup.document.close();
}
function OrderPage() {
	const { orderId } = Route$21.useParams();
	const id = Number(orderId);
	const client = useQueryClient();
	const navigate = useNavigate();
	const query = useQuery({
		queryKey: ["order", id],
		queryFn: () => getOrder({ data: id })
	});
	const [status, setStatus] = (0, import_react.useState)("pending");
	const [approvalNote, setApprovalNote] = (0, import_react.useState)("");
	const [processingNote, setProcessingNote] = (0, import_react.useState)("");
	const [shipmentStatus, setShipmentStatus] = (0, import_react.useState)("unfulfilled");
	const [trackingNumber, setTrackingNumber] = (0, import_react.useState)("");
	const [trackingCarrier, setTrackingCarrier] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [addProductId, setAddProductId] = (0, import_react.useState)("");
	const [awbNote, setAwbNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setStatus(query.data.order.status);
		setApprovalNote(query.data.order.approvalNote);
		setProcessingNote(query.data.order.processingNote);
		setShipmentStatus(query.data.order.shipmentStatus || "unfulfilled");
		setTrackingNumber(query.data.order.trackingNumber);
		setTrackingCarrier(query.data.order.trackingCarrier);
		setNotes(query.data.order.notes);
		setLines(query.data.order.items.map((item) => ({
			productId: item.productId,
			productName: item.productName,
			sku: item.sku,
			quantity: item.quantity,
			unitPriceCents: item.unitPriceCents
		})));
	}, [query.data]);
	const save = useMutation({
		mutationFn: () => updateOrder({ data: {
			id,
			status,
			approvalNote,
			processingNote,
			shipmentStatus,
			trackingNumber,
			trackingCarrier,
			notes,
			items: lines.map((line) => ({
				productId: line.productId,
				sku: line.sku,
				quantity: line.quantity
			}))
		} }),
		onSuccess: () => {
			toast.success("Order updated");
			client.invalidateQueries({ queryKey: ["order", id] });
			client.invalidateQueries({ queryKey: ["orders"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
			client.invalidateQueries({ queryKey: ["shell"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const remove = useMutation({
		mutationFn: () => deleteOrder({ data: id }),
		onSuccess: () => {
			toast.success("Order deleted");
			client.invalidateQueries({ queryKey: ["orders"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
			client.invalidateQueries({ queryKey: ["shell"] });
			navigate({ to: "/orders" });
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
	const refreshPay = useMutation({
		mutationFn: () => refreshAlternativeOrder({ data: id }),
		onSuccess: (next) => {
			toast.success(next.paymentStatus ? `Payment ${next.paymentStatus}` : "Payment checked");
			client.invalidateQueries({ queryKey: ["order", id] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const scan = useMutation({
		mutationFn: (awb) => trackAwb({ data: awb }),
		onSuccess: (result) => {
			setTrackingNumber(result.awb);
			if (result.carrier) setTrackingCarrier(result.carrier);
			if (result.shipmentStatus) setShipmentStatus(result.shipmentStatus);
			setAwbNote(result.detail);
			toast.success(result.valid ? "Air waybill scanned" : "Check the scanned number");
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const order = query.data.order;
	const payment = shopifyPayment(order);
	const fulfillment = shopifyFulfillment(order);
	const delivery = shopifyDelivery(order);
	function openPdf() {
		const url = orderPdfUrl(order);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${order.number}.pdf`;
		anchor.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 1500);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: `Placed ${day(order.createdAt)}`,
				title: order.number,
				description: `${order.organizationName}${order.customerName ? ` · ${order.customerName}` : ""}${order.paymentMethod ? ` · ${paymentLabel(order.paymentMethod)}` : ""}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					order.paymentMethod === "alternative" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: order.paymentUrl || "https://go.alternativepayments.io",
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[13px] font-semibold text-white",
						children: "Pay with Alternative Payments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						disabled: refreshPay.isPending,
						onClick: () => refreshPay.mutate(),
						children: refreshPay.isPending ? "Checking" : "Check payment"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						type: "button",
						onClick: openPdf,
						children: "Order PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/orders",
						className: "inline-flex h-11 items-center text-sm text-accent",
						children: "All orders"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: payment.tone,
						children: payment.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: fulfillment.tone,
						children: fulfillment.label
					}),
					delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: delivery.tone,
						children: delivery.label
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: order.status }),
					order.ticketId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tickets/$ticketId",
						params: { ticketId: String(order.ticketId) },
						className: "text-sm text-accent",
						children: order.zendeskTicketId ? `Zendesk #${order.zendeskTicketId}` : `Portal ticket P-${order.ticketId}`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: "No linked ticket"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "Customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold",
							children: orderCustomer(order)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: orderEmail(order) || "No email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: order.shipPhone || "No phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: order.organizationName
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "Ship to"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: [
								order.shipAddress,
								order.shipCity,
								order.shipRegion,
								order.shipPostal,
								order.shipCountry
							].filter(Boolean).join(", ") || "No shipping address"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted",
							children: [order.shippingMethod === "express" ? "Express" : order.shippingMethod === "standard" ? "Standard" : "Not chosen", order.shippingCents ? ` · ${money(order.shippingCents)}` : order.shippingMethod ? " · Free" : ""]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "Payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold",
							children: payment.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: order.paymentMethod ? paymentLabel(order.paymentMethod) : "No method"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm tabular-nums",
							children: [
								"Items ",
								money(order.totalCents),
								order.shippingCents ? ` · Shipping ${money(order.shippingCents)}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold tabular-nums",
							children: ["Total ", money(order.totalCents + order.shippingCents)]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "Fulfillment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold",
							children: fulfillment.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: delivery?.label || "No delivery update"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xs text-muted",
							children: order.trackingNumber ? `${order.trackingCarrier || "Tracking"} ${order.trackingNumber}` : "No tracking number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								order.itemCount,
								" ",
								order.itemCount === 1 ? "item" : "items",
								" · Placed ",
								day(order.createdAt)
							]
						})
					] })
				]
			}),
			order.events.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Timeline"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line",
				children: order.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium capitalize",
								children: event.kind
							}),
							event.fromValue || event.toValue ? ` · ${event.fromValue || "—"} → ${event.toValue || "—"}` : "",
							event.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [" · ", event.detail]
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							event.actorName,
							" · ",
							ago(event.createdAt)
						]
					})]
				}, event.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_20rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "stack-wrap mt-4 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "stack-table w-full min-w-[28rem] text-left text-sm",
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
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lines.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
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
										className: "py-3",
										"data-label": "Qty",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											max: 999,
											value: item.quantity,
											disabled: !query.data.canEdit,
											"aria-label": `Quantity for ${item.productName}`,
											className: "h-8 w-16 font-mono",
											onChange: (event) => {
												const quantity = Math.max(1, Number(event.target.value) || 1);
												setLines((current) => current.map((line, lineIndex) => lineIndex === index ? {
													...line,
													quantity
												} : line));
											}
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 font-mono tabular-nums",
										"data-label": "Unit",
										children: money(item.unitPriceCents)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 text-right",
										"data-label": "Line",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono tabular-nums",
											children: money(item.quantity * item.unitPriceCents)
										}), query.data.canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "ml-3 text-xs text-muted hover:text-ink",
											onClick: () => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index)),
											children: "Remove"
										}) : null]
									})
								]
							}, `${item.sku}-${index}`)) })]
						})
					}),
					query.data.canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: addProductId,
							onChange: (event) => setAddProductId(event.target.value ? Number(event.target.value) : ""),
							"aria-label": "Add a product",
							className: "h-8 max-w-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Add a product"
							}), query.data.products.filter((product) => product.available).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: product.id,
								children: product.name
							}, product.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => {
								const product = query.data.products.find((item) => item.id === addProductId);
								if (!product) return;
								setLines((current) => [...current, {
									productId: product.id,
									productName: product.name,
									sku: product.sku,
									quantity: 1,
									unitPriceCents: product.priceCents
								}]);
								setAddProductId("");
							},
							children: "Add"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-right font-mono text-lg tabular-nums",
						children: money(lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: notes,
							disabled: !query.data.canEdit,
							onChange: (event) => setNotes(event.target.value)
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid content-start gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Air waybill"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"Code 128 of this order. A UPS scanner, or any courier barcode gun, reads it as ",
									order.number,
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								id: "awb-label",
								className: "mt-4 rounded-lg border border-line bg-white px-3 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink",
										children: "Manage Tech Service"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBarcode, { value: order.number })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-center font-mono text-sm tracking-[0.18em] text-ink",
										children: order.number
									}),
									order.shipName || order.shipCity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-center text-xs text-muted",
										children: [
											order.shipName,
											order.shipCity,
											order.shipRegion,
											order.shipPostal
										].filter(Boolean).join(", ")
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								type: "button",
								variant: "secondary",
								onClick: () => printAwb(order.number),
								children: "Print waybill"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
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
									label: "Shipment",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: shipmentStatus,
										onChange: (event) => setShipmentStatus(event.target.value),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "unfulfilled",
												children: "Not shipped"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "shipped",
												children: "Shipped"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "out_for_delivery",
												children: "Out for delivery"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "delivered",
												children: "Delivered"
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Carrier",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: trackingCarrier,
										onChange: (event) => setTrackingCarrier(event.target.value),
										placeholder: "UPS"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "UPS air waybill",
									hint: "Scan the 1Z barcode on the label, then save the order.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: trackingNumber,
										onChange: (event) => setTrackingNumber(event.target.value.toUpperCase()),
										placeholder: "1Z…",
										className: "font-mono",
										autoComplete: "off"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AwbScanner, { onScan: (awb) => scan.mutate(awb) }),
								awbNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: scan.isPending ? "Checking UPS…" : awbNote
								}) : null,
								isUpsAwb(trackingNumber.replace(/[^0-9A-Z]/gi, "").toUpperCase()) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-sm text-accent",
									href: upsTrackUrl(trackingNumber.replace(/\s/g, "")),
									target: "_blank",
									rel: "noreferrer",
									children: "Open this number on UPS"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Bench note",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: processingNote,
										onChange: (event) => setProcessingNote(event.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: !query.data.canEdit || save.isPending || lines.length === 0,
									children: save.isPending ? "Saving" : "Save order"
								}),
								query.data.canDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									disabled: remove.isPending,
									onClick: () => {
										if (window.confirm(`Delete ${order.number}? This cannot be undone.`)) remove.mutate();
									},
									children: remove.isPending ? "Deleting" : "Delete order"
								}) : null
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
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
						] })
					]
				})]
			})
		]
	});
}
//#endregion
export { OrderPage as component };
