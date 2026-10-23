import type { Order } from "./types";
import { day, money } from "./format";

function ascii(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, " ").slice(0, 110);
}

function esc(value: string) {
  return ascii(value).replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildOrderPdf(order: Order): Uint8Array {
  const rows: string[] = [];
  const push = (cmd: string) => rows.push(cmd);

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
  const ticket = order.zendeskTicketId
    ? `Zendesk ${order.zendeskTicketId}`
    : order.ticketId
      ? `Portal ticket ${order.ticketId}`
      : "No linked ticket";
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
    order.processingNote ? `Processing: ${order.processingNote}` : "",
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
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
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
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export function orderPdfBytes(order: Order) {
  return buildOrderPdf(order);
}

export function orderPdfUrl(order: Order) {
  const bytes = buildOrderPdf(order);
  return URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
}
