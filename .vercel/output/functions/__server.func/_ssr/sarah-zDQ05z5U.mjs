import { r as createServerFn } from "./ssr.mjs";
import { r as filePortalTicket, z as loadPortalCustomer } from "./api-CEXWu3z6.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { a as quoteFor, i as listPick, n as confirmationFresh, o as reconcileDecision, r as followUp, t as allowTransition } from "./sarah-state-BYf1YbMx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sarah-zDQ05z5U.js
var PAGES = [
	{
		id: "home",
		to: "/portal",
		guide: "home",
		label: "Home",
		words: [
			"home",
			"dashboard",
			"start"
		]
	},
	{
		id: "tickets",
		to: "/portal/tickets",
		guide: "tickets",
		label: "Tickets",
		words: [
			"ticket",
			"tickets",
			"support",
			"help desk"
		]
	},
	{
		id: "new-ticket",
		to: "/portal/tickets/new",
		guide: "tickets",
		label: "New ticket",
		words: ["new ticket", "open a ticket"]
	},
	{
		id: "shop",
		to: "/portal/shop",
		guide: "order",
		label: "Order",
		words: [
			"shop",
			"catalog",
			"equipment",
			"laptop",
			"store"
		]
	},
	{
		id: "orders",
		to: "/portal/orders",
		guide: "orders",
		label: "My orders",
		words: [
			"my orders",
			"shipment",
			"tracking",
			"delivery"
		]
	},
	{
		id: "billing",
		to: "/portal/billing",
		guide: "billing",
		label: "Billing",
		words: [
			"billing",
			"invoice",
			"payment",
			"pay later"
		]
	},
	{
		id: "complaints",
		to: "/portal/complaints",
		guide: "complaints",
		label: "Complaints",
		words: [
			"complaint",
			"complaints",
			"feedback"
		]
	},
	{
		id: "organization",
		to: "/portal/organization",
		guide: "organization",
		label: "Organization",
		words: ["organization", "company"]
	},
	{
		id: "account",
		to: "/portal/account",
		guide: "account",
		label: "Account",
		words: [
			"account",
			"profile",
			"phone number"
		]
	},
	{
		id: "services",
		to: "/portal/my-services",
		guide: "home",
		label: "My services",
		words: [
			"my services",
			"active service",
			"provision"
		]
	},
	{
		id: "quotes",
		to: "/portal/quotes",
		guide: "home",
		label: "Quotes",
		words: ["quote", "quotes"]
	},
	{
		id: "notifications",
		to: "/portal/notifications",
		guide: "home",
		label: "Notifications",
		words: [
			"notification",
			"notifications",
			"alert"
		]
	}
];
var ARTICLES = [
	{
		title: "Manage Tech Service",
		keywords: [
			"manage tech",
			"mts",
			"company",
			"about the company",
			"desk",
			"sarah",
			"website",
			"managetechservice"
		],
		page: "home",
		body: "Manage Tech Service supports business IT. The public site is managetechservice.com. The customer portal is invite only. Access is requested at access.virtualcloudgroup.com. The desk phone is 818-758-4073. Sarah is the portal agent for the signed-in customer only. She cannot see other customers, and she cannot change roles. Role and grant changes stay in the admin portal."
	},
	{
		title: "Portal map",
		keywords: [
			"portal",
			"pages",
			"menu",
			"what can you do",
			"where do i"
		],
		page: "home",
		body: "The customer portal pages are Home, Tickets, Order, My orders, Billing, Complaints, Organization, and Account. Home is the summary. Tickets are support requests. Order has Equipment and Order services. My orders shows status and shipment. Billing shows invoices and whether this account must pay now or may use order now, pay later. Complaints are filed there. Organization is the company on the account. Account holds the profile and phone. Sarah can open these pages and point at them while she speaks."
	},
	{
		title: "Managed IT",
		keywords: [
			"managed it",
			"help desk",
			"server",
			"cyber",
			"backup",
			"endpoint",
			"security"
		],
		page: "tickets",
		body: "Managed IT services are Help Desk, Server Management, Network Support, Cybersecurity, Backup and Recovery, and Endpoint Security. A customer asks for these from Order services or by opening a ticket. Sarah can open the ticket and describe the request. She does not claim a technician is already dispatched."
	},
	{
		title: "Cloud and business apps",
		keywords: [
			"cloud",
			"microsoft",
			"office 365",
			"outlook",
			"teams",
			"sharepoint",
			"azure",
			"intune",
			"google",
			"active directory",
			"daas",
			"migration"
		],
		page: "tickets",
		body: "Cloud services include hosting, migration, desktop as a service, infrastructure as a service, and virtual servers. Business application support covers Microsoft 365, Outlook, Teams, SharePoint, Azure, Intune, Active Directory, and Google Workspace. Sarah opens a ticket or a service request for these. She does not reset a password inside Microsoft herself."
	},
	{
		title: "Projects",
		keywords: [
			"wifi",
			"wi-fi",
			"cabling",
			"consulting",
			"relocation",
			"audit",
			"project"
		],
		page: "quotes",
		body: "IT projects include Wi-Fi installation, network cabling, IT consulting, office relocation, and security audits. These are quoted. Sarah can note the site and the request. A quote is not an invoice and is not a completed install."
	},
	{
		title: "Phone, fax, and internet",
		keywords: [
			"voip",
			"extension",
			"telxent",
			"fax",
			"efax",
			"spectrum",
			"fiber",
			"frontier",
			"wireless",
			"internet",
			"phone line"
		],
		page: "shop",
		body: "Phone and internet are ordered under Order services. A VoIP extension is 18 dollars a month extra on the Telxent bill. Sarah must not place it until the caller agrees to that monthly charge. Telxent still has to confirm the extension before it is billed. A new extension can add a desk phone to the cart if the caller wants a handset shipped. eFax needs the email address that should receive incoming faxes. Physical fax is a separate line. Internet options are Spectrum cable, AT&T Fiber, Frontier Fiber, and fixed wireless. Sarah records the site address with the request."
	},
	{
		title: "Wiring",
		keywords: [
			"wiring",
			"drop",
			"cable drop",
			"175"
		],
		page: "shop",
		body: "Wiring is billed at 175 dollars per drop. Sarah asks how many drops and does not place the request until the caller agrees to that price. She repeats the count and the total before she asks for a yes."
	},
	{
		title: "Tickets and Zendesk",
		keywords: [
			"ticket",
			"zendesk",
			"support",
			"printer",
			"outlook",
			"outage",
			"reply"
		],
		page: "tickets",
		body: "Sarah can list tickets, open a ticket, and add a public reply on this account only. If Zendesk is connected, the portal ticket is created there and public replies sync back. Private Zendesk notes are not shown. Sarah never invents a Zendesk number. If Zendesk is not connected, the ticket still exists in the portal and she says the desk copy is pending."
	},
	{
		title: "Equipment and checkout",
		keywords: [
			"laptop",
			"equipment",
			"catalog",
			"cart",
			"checkout",
			"product",
			"desk phone"
		],
		page: "shop",
		body: "Equipment is on the Order page. Sarah can find a product and place it in the cart. Checkout is the store checkout, not something she completes by voice. She does not take or store a card number. Some accounts must pay before the order is placed. Accounts with deferred billing may choose Order now, pay later."
	},
	{
		title: "Orders, shipping, and billing",
		keywords: [
			"shipment",
			"tracking",
			"order status",
			"invoice",
			"billing",
			"pay later",
			"payment",
			"barcode"
		],
		page: "orders",
		body: "My orders shows the status, payment state, and shipment for this account. The order page includes the shipment state the way a store would. The air waybill barcode is built from the order number so a courier scanner can read it. Billing lists invoices. Sarah can read status. She cannot mark a payment captured unless the payment provider has confirmed it."
	},
	{
		title: "Account, organization, complaints",
		keywords: [
			"complaint",
			"profile",
			"organization",
			"update phone",
			"permissions",
			"role"
		],
		page: "account",
		body: "Account shows the name, email, and phone for this login. Sarah can update the phone number. Organization shows the company tied to the account. A complaint opens a ticket and is listed under Complaints. New registrations are customers first. An admin later decides who may shop, who must pay now, and who may order services on an invoice. Sarah cannot grant those permissions."
	},
	{
		title: "How Sarah works",
		keywords: [
			"call",
			"chat",
			"listening",
			"microphone",
			"knowledge",
			"what do you know"
		],
		page: "home",
		body: "On a call, the line rings twice, then Sarah answers. She speaks first. The microphone stays closed while she talks, then opens when she finishes. She can chat or take the call. While she explains a page, she opens it and highlights it, and her voice continues. She uses this knowledge base for the company, the services, the prices she is allowed to quote, and the portal. She still runs a tool before she claims a ticket, order, or change was made."
	}
];
function matchPage(text) {
	const q = text.toLowerCase();
	const ranked = PAGES.map((page) => ({
		page,
		score: page.words.reduce((sum, word) => sum + (q.includes(word) ? word.length : 0), 0)
	}));
	ranked.sort((a, b) => b.score - a.score);
	return ranked[0]?.score ? ranked[0].page : null;
}
function pageById(id) {
	return PAGES.find((page) => page.id === id) ?? PAGES[0];
}
function lookupKnowledge(query) {
	const q = query.toLowerCase();
	const chosen = ARTICLES.map((article) => ({
		article,
		score: article.keywords.reduce((sum, word) => sum + (q.includes(word) ? word.length : 0), 0)
	})).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
	if (!chosen.length) return null;
	const page = pageById(chosen[0].article.page);
	return {
		summary: chosen.map((item) => item.article.body).join(" "),
		show: {
			to: page.to,
			guide: page.guide,
			label: page.label
		}
	};
}
var YES = /\b(yes|yeah|yep|agree|confirmed|confirm|go ahead|please do|do it|that's right|that is right|ok|okay)\b/i;
var NO = /\b(no|nope|don't|do not|cancel|never mind|stop)\b/i;
function affirms(text) {
	if (/\$?\s*18\b|eighteen/.test(text) && !/\b(yes|yeah|yep|agree|go ahead|confirm|do it|please do)\b/i.test(text)) return false;
	return YES.test(text) && !NO.test(text);
}
function declines(text) {
	return NO.test(text) && !/\bknow\b/i.test(text);
}
function emailIn(text) {
	return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase() ?? "";
}
function dropsIn(text) {
	const word = text.match(/\b(\d{1,2})\b/);
	const n = word ? Number(word[1]) : 1;
	return Math.min(50, Math.max(1, n));
}
function planUtterance(text) {
	const raw = text.trim();
	const q = raw.toLowerCase();
	if (!raw) return { tool: "ask" };
	if (declines(q) && q.split(/\s+/).length <= 6) return { tool: "decline" };
	if (/\b(who am i|my account|my profile|what.*account)\b/.test(q)) return { tool: "account" };
	if (/\b(my tickets|open tickets|ticket status|any tickets)\b/.test(q)) return { tool: "list_tickets" };
	if (/\b(my orders|order status|where.*order|shipment|tracking)\b/.test(q)) return { tool: "list_orders" };
	if (/\b(my requests|my services|quote status)\b/.test(q)) return { tool: "list_requests" };
	if (/\b(take me to|go to|bring me to|bring up the|open the)\b/.test(q)) {
		const page = matchPage(q);
		if (page) return {
			tool: "show",
			page: page.id
		};
	}
	if (/\b(what|how|explain|tell me|price|cost|about)\b/.test(q) && lookupKnowledge(raw)) return {
		tool: "lookup",
		query: raw
	};
	if (/\bphone\b/.test(q) && /\b(change|update|new number|call me at)\b/.test(q)) {
		const phone = raw.match(/(\+?[\d][\d\s().-]{6,})/)?.[1]?.trim() ?? "";
		return phone ? {
			tool: "update_contact",
			phone
		} : { tool: "ask" };
	}
	if (/\b(laptop|printer|monitor|headset|desk phone|mouse|dock|keyboard|webcam|equipment|catalog)\b/.test(q)) return {
		tool: "find_equipment",
		query: raw,
		add: /\b(add|cart|buy|i'll take|ill take)\b/.test(q)
	};
	if (/\b(file a complaint|complaint)\b/.test(q)) return {
		tool: "complaint",
		subject: raw.slice(0, 140),
		body: raw
	};
	if (/\b(reply|respond|update ticket)\b/.test(q)) {
		const id = Number(raw.match(/ticket\s*#?\s*(\d+)/i)?.[1] ?? raw.match(/\b(\d{1,6})\b/)?.[1] ?? 0);
		if (id) return {
			tool: "reply_ticket",
			id,
			body: raw
		};
	}
	if (/\b(extension|ext)\b/.test(q)) return {
		tool: "order_service",
		offering: "voip-ext",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: /\b(desk phone|handset|ship)\b/.test(q),
		confirmMonthly: false
	};
	if (/\bvoip|phone line\b/.test(q)) return {
		tool: "order_service",
		offering: "voip-line",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\befax|e-fax\b/.test(q)) return {
		tool: "order_service",
		offering: "fax-efax",
		site: "",
		notes: raw,
		recipientEmail: emailIn(raw),
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\bfax\b/.test(q)) return {
		tool: "order_service",
		offering: "fax-physical",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\bwiring|network drop\b/.test(q)) return {
		tool: "order_service",
		offering: "wiring",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: dropsIn(q),
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\bspectrum\b/.test(q)) return {
		tool: "order_service",
		offering: "internet-spectrum",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\batt\b|\bat&t\b/.test(q)) return {
		tool: "order_service",
		offering: "internet-att",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\bfrontier\b/.test(q)) return {
		tool: "order_service",
		offering: "internet-frontier",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\bfixed wireless\b/.test(q)) return {
		tool: "order_service",
		offering: "internet-fixed",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\binternet\b|\bnetwork\b|\bnew office\b|\bconnect\b/.test(q)) return {
		tool: "order_service",
		offering: "network",
		site: "",
		notes: raw,
		recipientEmail: "",
		drops: 1,
		shipPhone: false,
		confirmMonthly: false
	};
	if (/\b(open|create|file|submit)\b/.test(q) && /\bticket\b/.test(q)) return {
		tool: "open_ticket",
		subject: raw.slice(0, 140),
		body: raw,
		category: "Chat"
	};
	if (/\b(down|broken|not working|outage)\b/.test(q)) return {
		tool: "open_ticket",
		subject: raw.slice(0, 140),
		body: raw,
		category: "Chat"
	};
	if (affirms(q) && q.split(/\s+/).length <= 8) return { tool: "confirm" };
	return { tool: "ask" };
}
function s(row, key) {
	const value = row?.[key];
	return value == null ? "" : String(value);
}
function n(row, key) {
	const value = Number(row?.[key] ?? 0);
	return Number.isFinite(value) ? value : 0;
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || "there";
}
var OFFERING_LABEL = {
	network: "connecting the office to the network",
	"voip-line": "a VoIP phone line",
	"voip-ext": "a VoIP extension",
	"fax-physical": "a physical fax line",
	"fax-efax": "eFax",
	"internet-spectrum": "Spectrum cable internet",
	"internet-att": "AT&T Fiber",
	"internet-frontier": "Frontier Fiber",
	"internet-fixed": "fixed wireless internet",
	wiring: "wiring"
};
async function runTool(token, planned, approved = false) {
	if (planned.tool === "ask" || planned.tool === "confirm" || planned.tool === "decline") return { summary: "I can check tickets, orders, and services, or open something new. What should I take care of?" };
	if (planned.tool === "show") {
		const page = pageById(planned.page);
		return {
			summary: `I'm opening ${page.label} now. I'll stay on the line while you look.`,
			show: {
				to: page.to,
				guide: page.guide,
				label: page.label
			},
			navigate: true
		};
	}
	if (planned.tool === "lookup") {
		const found = lookupKnowledge(planned.query);
		if (!found) return { summary: "I can walk you through tickets, orders, billing, or the services we offer. What would you like to review?" };
		return {
			summary: found.summary,
			show: found.show
		};
	}
	const { sql, row } = await loadPortalCustomer(token);
	const name = s(row, "name");
	const email = s(row, "email");
	const id = n(row, "id");
	const orgId = s(row, "organization_id") ? n(row, "organization_id") : null;
	if (planned.tool === "account") return { summary: `${name}, I have ${email} on the line${s(row, "business_name") ? ` for ${s(row, "business_name")}` : ""}. Phone on the account is ${s(row, "phone") || "not set"}.` };
	if (planned.tool === "list_tickets") {
		const tickets = await sql`
      select id, subject, status from tickets
      where lower(requester_email) = lower(${email})
      order by updated_at desc limit 5
    `;
		if (!tickets.length) return {
			summary: `${firstName(name)}, there are no tickets on this account right now.`,
			cards: []
		};
		return {
			summary: `${firstName(name)}, here is what I have.`,
			cards: tickets.map((item) => ({
				title: `Ticket ${n(item, "id")}`,
				detail: `${s(item, "subject")} · ${s(item, "status")}`
			})),
			refs: tickets.map((item) => n(item, "id"))
		};
	}
	if (planned.tool === "list_orders") {
		const orders = await sql`
      select id, status, payment_status, shipment_status from orders
      where shop_customer_id = ${id} or lower(ship_email) = lower(${email})
      order by created_at desc limit 5
    `;
		if (!orders.length) return {
			summary: `${firstName(name)}, I don't see any orders on this account yet.`,
			cards: []
		};
		return {
			summary: `${firstName(name)}, here are the recent orders.`,
			cards: orders.map((item) => ({
				title: `MT-${1e3 + n(item, "id")}`,
				detail: `${s(item, "status")} · payment ${s(item, "payment_status") || "pending"} · ${s(item, "shipment_status") || "not shipped"}`
			}))
		};
	}
	if (planned.tool === "list_requests") {
		const rows = await sql`select id, service_name, status from service_requests where shop_customer_id = ${id} order by id desc limit 5`;
		if (!rows.length) return {
			summary: `${firstName(name)}, there are no service requests on this account yet.`,
			cards: []
		};
		return {
			summary: `${firstName(name)}, here are the service requests.`,
			cards: rows.map((item) => ({
				title: s(item, "service_name"),
				detail: s(item, "status")
			}))
		};
	}
	if (planned.tool === "open_ticket") {
		const ticket = await filePortalTicket(sql, {
			name,
			email,
			organizationId: orgId,
			subject: planned.subject,
			category: planned.category || "Chat",
			body: planned.body
		});
		const remote = ticket.zendeskId ? ` Zendesk number ${ticket.zendeskId}.` : " It is on the desk, and Zendesk will get it when the connection is up.";
		return { summary: `I've opened that for you, ${firstName(name)}. The ticket number is ${ticket.ticketId}.${remote}` };
	}
	if (planned.tool === "reply_ticket") {
		if (!(await sql`select id, zendesk_id from tickets where id = ${planned.id} and lower(requester_email) = lower(${email})`)[0]) return { summary: "I can't find that ticket on this account." };
		await sql`insert into ticket_comments (ticket_id, author_name, body, public_note) values (${planned.id}, ${name || "Customer"}, ${planned.body}, true)`;
		const copy = await deskCopy(sql, {
			name,
			email,
			organizationId: orgId,
			subject: `Sarah reply on ticket ${planned.id}`,
			category: "Chat",
			body: planned.body
		});
		return { summary: `I added your note to ticket ${planned.id}.${copy}` };
	}
	if (planned.tool === "complaint") {
		const ticket = await filePortalTicket(sql, {
			name,
			email,
			organizationId: orgId,
			subject: `Complaint: ${planned.subject}`,
			category: "Complaint",
			body: planned.body
		});
		await sql`
      insert into complaints (shop_customer_id, organization_id, kind, subject, body, status, ticket_id)
      values (${id}, ${orgId}, 'General feedback', ${planned.subject}, ${planned.body}, 'open', ${ticket.ticketId})
    `;
		return { summary: `${firstName(name)}, I logged that complaint on ticket ${ticket.ticketId}. A specialist will follow it.` };
	}
	if (planned.tool === "update_contact") {
		if (!approved) return {
			summary: `${firstName(name)}, I can change the phone on this account to ${planned.phone}. Say yes if that number is right.`,
			needsConfirm: planned
		};
		await sql`update shop_customers set phone = ${planned.phone} where id = ${id}`;
		const copy = await deskCopy(sql, {
			name,
			email,
			organizationId: orgId,
			subject: `Sarah updated phone to ${planned.phone}`,
			category: "Account",
			body: `Sarah changed the portal phone number to ${planned.phone}.`
		});
		return { summary: `${firstName(name)}, I updated the phone number on your account to ${planned.phone}.${copy}` };
	}
	if (planned.tool === "find_equipment") {
		const like = `%${planned.query.replace(/%/g, "")}%`;
		const products = await sql`
      select sku, name, price_cents from products
      where available = true and (name ilike ${like} or category ilike ${like} or sku ilike ${like})
      order by name limit 3
    `;
		const phone = await sql`select sku, name, price_cents from products where available = true and (sku = 'desk-phone' or name ilike '%phone%') order by id limit 1`;
		const rows = products.length ? products : /\bphone\b/i.test(planned.query) && phone[0] ? phone : [];
		if (!rows.length) return {
			summary: "I don't see that in the catalog. I can open a ticket so the desk can source it.",
			cards: []
		};
		const cards = rows.map((item) => ({
			title: s(item, "name"),
			detail: `${s(item, "sku")} · $${(n(item, "price_cents") / 100).toFixed(2)}`
		}));
		if (!planned.add) return {
			summary: `I found ${cards.length === 1 ? cards[0].title : `${cards.length} matches`}. Say add to cart if you want one.`,
			cards
		};
		const match = rows[0];
		const copy = await deskCopy(sql, {
			name,
			email,
			organizationId: orgId,
			subject: `Sarah placed ${s(match, "sku")} in the cart`,
			category: "Ordering",
			body: `Sarah placed ${s(match, "name")} (${s(match, "sku")}) in the cart after the customer asked. Checkout is still the customer's step.`
		});
		return {
			summary: `I put ${s(match, "name")} in your cart.${copy}`,
			cartSku: s(match, "sku"),
			cards
		};
	}
	if (planned.tool === "order_service") {
		if (planned.offering === "voip-ext" && !planned.confirmMonthly) return {
			summary: `${firstName(name)}, an extension adds eighteen dollars a month to the Telxent bill. It is not billed until Telxent confirms it. Say yes if you agree and I will place it.`,
			needsConfirm: planned
		};
		if (planned.offering === "wiring" && !planned.confirmMonthly) {
			const dollars = planned.drops * 175;
			return {
				summary: `${firstName(name)}, wiring is one hundred seventy-five dollars per drop. That is ${dollars} dollars for ${planned.drops} drop${planned.drops === 1 ? "" : "s"}, and it is not billed until the desk confirms the work. Say yes and I will send it.`,
				needsConfirm: planned
			};
		}
		if (planned.offering === "fax-efax" && !planned.recipientEmail) return { summary: "What email address should receive the incoming faxes?" };
		const label = OFFERING_LABEL[planned.offering];
		const detail = [
			`Service: ${label}`,
			planned.site ? `Site: ${planned.site}` : "",
			planned.recipientEmail ? `Incoming fax email: ${planned.recipientEmail}` : "",
			planned.offering === "voip-ext" ? "Customer confirmed $18 per month on the Telxent bill. Telxent confirmation is still required." : "",
			planned.shipPhone ? "Ship a desk phone." : "",
			planned.offering === "wiring" ? `Drops: ${planned.drops} at $175 each.` : "",
			planned.notes
		].filter(Boolean).join("\n");
		const prior = await sql`
      select id from service_requests
      where shop_customer_id = ${id} and category = ${planned.offering} and details = ${detail}
        and created_at > now() - interval '15 minutes'
      limit 1
    `;
		if (prior[0]) return { summary: `${firstName(name)}, that request is already in. Request ${n(prior[0], "id")}. I didn't send a second one.` };
		const inserted = await sql`
      insert into service_requests (shop_customer_id, organization_id, category, service_name, details, severity, status)
      values (${id}, ${orgId}, ${planned.offering}, ${label}, ${detail}, 'normal', 'requested')
      returning id
    `;
		const ticket = await filePortalTicket(sql, {
			name,
			email,
			organizationId: orgId,
			subject: `Order: ${label}`,
			category: planned.offering,
			body: detail
		});
		return {
			summary: `${firstName(name)}, I sent the request for ${label}. Request ${n(inserted[0], "id")}, ticket ${ticket.ticketId}.`,
			cartSku: planned.shipPhone ? "desk-phone" : void 0
		};
	}
	return { summary: "Tell me what you need and I will take care of it on this account." };
}
async function deskCopy(sql, input) {
	const ticket = await filePortalTicket(sql, input).catch(() => null);
	if (!ticket) return "";
	return ticket.zendeskId ? ` Desk ticket ${ticket.ticketId}, Zendesk ${ticket.zendeskId}.` : ` Desk ticket ${ticket.ticketId}. Zendesk gets the copy when the connection is up.`;
}
function answer(result, actionId, notice = "") {
	return {
		reply: result.summary,
		cartSku: result.cartSku || "",
		actionId,
		show: result.navigate ? result.show ?? null : null,
		navigate: Boolean(result.navigate && result.show),
		cards: result.cards ?? [],
		notice,
		quote: actionId && result.needsConfirm ? quoteFor(result.needsConfirm) : null
	};
}
async function logEvent(sql, actionId, from, to, detail) {
	if (!allowTransition(from, to) && from) return;
	await sql`
    insert into agent_action_events (id, action_id, from_status, to_status, detail)
    values (${crypto.randomUUID()}, ${actionId}, ${from}, ${to}, ${detail.slice(0, 300)})
  `;
}
async function readSlots(sql, customerId) {
	const rows = await sql`select slots_json from agent_context where customer_id = ${customerId} limit 1`;
	if (!rows[0]) return {};
	try {
		return JSON.parse(s(rows[0], "slots_json"));
	} catch {
		return {};
	}
}
async function writeSlots(sql, customerId, slots) {
	const current = await readSlots(sql, customerId);
	const body = JSON.stringify({
		...current,
		...slots
	});
	await sql`
    insert into agent_context (customer_id, slots_json, updated_at)
    values (${customerId}, ${body}, now())
    on conflict (customer_id) do update set slots_json = ${body}, updated_at = now()
  `;
}
async function moveOpenActions(sql, customerId) {
	if (process.env.SARAH_ACTION_ENGINE === "0") return "";
	const rows = customerId == null ? await sql`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where status in ('executing', 'checking_status')
        order by updated_at asc
        limit 40
      ` : await sql`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where customer_id = ${customerId} and status in ('executing', 'checking_status')
        order by updated_at desc
        limit 5
      `;
	let notice = "";
	for (const row of rows) {
		const status = s(row, "status");
		const owner = n(row, "customer_id");
		const ageMs = Date.now() - new Date(s(row, "updated_at") || Date.now()).getTime();
		let found = false;
		if (s(row, "tool_name") === "order_service") try {
			const planned = JSON.parse(s(row, "parameters_json"));
			if (planned.tool === "order_service") {
				const hit = await sql`
            select id from service_requests
            where shop_customer_id = ${owner} and category = ${planned.offering}
              and created_at > now() - interval '20 minutes'
            limit 1
          `;
				found = Boolean(hit[0]);
			}
		} catch {
			found = false;
		}
		const next = reconcileDecision({
			status,
			ageMs: Number.isFinite(ageMs) ? ageMs : 0,
			resourceFound: found
		});
		if (!next || next === status) continue;
		if (!allowTransition(status, next)) continue;
		await sql`update agent_actions set status = ${next}, updated_at = now() where id = ${s(row, "id")}`;
		await logEvent(sql, s(row, "id"), status, next, found ? "Matched an existing request." : "No confirmed result yet.");
		if (next === "checking_status") notice = "I'm still checking whether that last request went through.";
		if (next === "manual_review") notice = "I can't confirm that last request yet, so the desk will check it.";
		if (next === "succeeded") notice = "That earlier request did go through. I didn't send it again.";
	}
	return notice;
}
async function reconcileCustomer(sql, customerId) {
	return moveOpenActions(sql, customerId);
}
async function holdConfirm(sql, customerId, planned) {
	const parameters = JSON.stringify(planned);
	const key = `hold-${planned.tool}-${parameters}`.slice(0, 240);
	const existing = await sql`select id, status from agent_actions where customer_id = ${customerId} and idempotency_key = ${key} order by created_at desc limit 1`;
	if (existing[0] && s(existing[0], "status") === "awaiting_confirmation") return s(existing[0], "id");
	const id = crypto.randomUUID();
	await sql`
    insert into agent_actions (id, customer_id, tool_name, status, idempotency_key, parameters_json)
    values (${id}, ${customerId}, ${planned.tool}, 'awaiting_confirmation', ${`${key}-${id}`}, ${parameters})
  `;
	await logEvent(sql, id, "", "awaiting_confirmation", planned.tool);
	return id;
}
async function takeConfirm(sql, customerId, actionId) {
	const rows = await sql`select parameters_json, status, created_at from agent_actions where id = ${actionId} and customer_id = ${customerId} limit 1`;
	if (!rows[0] || s(rows[0], "status") !== "awaiting_confirmation") return null;
	const ageMs = Date.now() - new Date(s(rows[0], "created_at") || Date.now()).getTime();
	if (!confirmationFresh(Number.isFinite(ageMs) ? ageMs : 0)) {
		await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${actionId} and customer_id = ${customerId}`;
		await logEvent(sql, actionId, "awaiting_confirmation", "cancelled", "Quote expired.");
		return "expired";
	}
	await sql`update agent_actions set status = 'executing', updated_at = now() where id = ${actionId} and customer_id = ${customerId}`;
	await logEvent(sql, actionId, "awaiting_confirmation", "executing", "Customer confirmed.");
	try {
		return JSON.parse(s(rows[0], "parameters_json"));
	} catch {
		return null;
	}
}
async function finishConfirm(sql, actionId, from, status, summary) {
	if (from && !allowTransition(from, status)) return;
	await sql`update agent_actions set status = ${status}, result_json = ${JSON.stringify({ summary })}, updated_at = now() where id = ${actionId}`;
	await logEvent(sql, actionId, from, status, summary);
}
var TOOLS = [
	{
		type: "function",
		function: {
			name: "account",
			description: "Read the signed-in customer's name, email, company, and phone.",
			parameters: {
				type: "object",
				properties: {}
			}
		}
	},
	{
		type: "function",
		function: {
			name: "list_tickets",
			description: "List this customer's support tickets.",
			parameters: {
				type: "object",
				properties: {}
			}
		}
	},
	{
		type: "function",
		function: {
			name: "list_orders",
			description: "List this customer's orders and shipment status.",
			parameters: {
				type: "object",
				properties: {}
			}
		}
	},
	{
		type: "function",
		function: {
			name: "list_requests",
			description: "List this customer's service requests.",
			parameters: {
				type: "object",
				properties: {}
			}
		}
	},
	{
		type: "function",
		function: {
			name: "open_ticket",
			description: "Open a support ticket for this customer.",
			parameters: {
				type: "object",
				properties: {
					subject: { type: "string" },
					body: { type: "string" },
					category: { type: "string" }
				},
				required: ["subject", "body"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "reply_ticket",
			description: "Add a public reply to one of this customer's tickets.",
			parameters: {
				type: "object",
				properties: {
					id: { type: "number" },
					body: { type: "string" }
				},
				required: ["id", "body"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "order_service",
			description: "Order a portal service for this customer. voip-ext needs confirmMonthly true only after they agree to $18 a month. wiring needs confirmMonthly true only after they agree to $175 per drop.",
			parameters: {
				type: "object",
				properties: {
					offering: {
						type: "string",
						enum: [
							"network",
							"voip-line",
							"voip-ext",
							"fax-physical",
							"fax-efax",
							"internet-spectrum",
							"internet-att",
							"internet-frontier",
							"internet-fixed",
							"wiring"
						]
					},
					site: { type: "string" },
					notes: { type: "string" },
					recipientEmail: { type: "string" },
					drops: { type: "number" },
					shipPhone: { type: "boolean" },
					confirmMonthly: { type: "boolean" }
				},
				required: ["offering"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "complaint",
			description: "File a complaint for this customer.",
			parameters: {
				type: "object",
				properties: {
					subject: { type: "string" },
					body: { type: "string" }
				},
				required: ["subject", "body"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "update_contact",
			description: "Update this customer's phone number.",
			parameters: {
				type: "object",
				properties: { phone: { type: "string" } },
				required: ["phone"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "find_equipment",
			description: "Find a catalog product for this customer.",
			parameters: {
				type: "object",
				properties: { query: { type: "string" } },
				required: ["query"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "lookup_kb",
			description: "Look up how Manage Tech Service and this portal work.",
			parameters: {
				type: "object",
				properties: { query: { type: "string" } },
				required: ["query"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "show_page",
			description: "Open a portal page and point at it while speaking. page is home, tickets, new-ticket, shop, orders, billing, complaints, organization, account, services, quotes, or notifications.",
			parameters: {
				type: "object",
				properties: { page: { type: "string" } },
				required: ["page"]
			}
		}
	}
];
function sarahSystem(channel, profile) {
	return `You are Sarah, the phone and chat agent for Manage Tech Service. Channel: ${channel}. Only this account: ${profile}. Answer in one or two short spoken sentences. No markdown and no speech tags. Use a tool before you claim a ticket, order, or change. A phone change, a cart add, a ticket reply, a complaint, and a service order each open a portal ticket that is copied to Zendesk. Reading an account, listing records, or opening a page does not. Never invent ticket numbers, prices, or shipment dates. A VoIP extension is eighteen dollars a month on the Telxent bill and is not placed until they agree. Wiring is one hundred seventy-five dollars per drop and is not placed until they agree. Desk phone is 818-758-4073. You cannot change roles or take a card number. The page map and catalog live in knowledge.md.`;
}
async function askGrok(token, channel, history, profile) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	const messages = [{
		role: "system",
		content: sarahSystem(channel, profile)
	}, ...history.slice(-4)];
	let last = "";
	let cartSku = "";
	let pending;
	let show = null;
	for (let turn = 0; turn < 2; turn += 1) {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4-1-fast-non-reasoning",
				messages,
				tools: TOOLS,
				tool_choice: "auto",
				max_tokens: 120,
				temperature: .3
			})
		});
		if (!res.ok) return last ? {
			reply: last,
			cartSku: cartSku || void 0,
			pending,
			show
		} : null;
		const message = (await res.json()).choices?.[0]?.message;
		if (!message) return last ? {
			reply: last,
			cartSku: cartSku || void 0,
			pending,
			show
		} : null;
		const calls = message.tool_calls ?? [];
		if (!calls.length) return {
			reply: message.content || last || "How else can I help?",
			cartSku: cartSku || void 0,
			pending,
			show
		};
		messages.push(message);
		for (const call of calls) {
			const name = call.function?.name || call.name || "";
			const rawArgs = call.function?.arguments ?? call.arguments ?? {};
			let args = {};
			if (typeof rawArgs === "string") try {
				args = JSON.parse(rawArgs);
			} catch {
				args = {};
			}
			else args = rawArgs;
			const result = await runTool(token, toolFromModel(name, args));
			last = result.summary;
			if (result.cartSku) cartSku = result.cartSku;
			if (result.needsConfirm) pending = result.needsConfirm;
			if (result.navigate && result.show) show = result.show;
			messages.push({
				role: "tool",
				tool_call_id: call.id,
				content: result.summary
			});
		}
	}
	return last ? {
		reply: last,
		cartSku: cartSku || void 0,
		pending,
		show
	} : null;
}
function toolFromModel(name, args) {
	if (name === "lookup_kb") return {
		tool: "lookup",
		query: String(args.query || "").slice(0, 200)
	};
	if (name === "show_page") return {
		tool: "show",
		page: String(args.page || "home").slice(0, 40)
	};
	if (name === "account") return { tool: "account" };
	if (name === "list_tickets") return { tool: "list_tickets" };
	if (name === "list_orders") return { tool: "list_orders" };
	if (name === "list_requests") return { tool: "list_requests" };
	if (name === "open_ticket") return {
		tool: "open_ticket",
		subject: String(args.subject || "Support request").slice(0, 160),
		body: String(args.body || "").slice(0, 2e3),
		category: String(args.category || "Chat").slice(0, 40)
	};
	if (name === "reply_ticket") return {
		tool: "reply_ticket",
		id: Number(args.id) || 0,
		body: String(args.body || "").slice(0, 2e3)
	};
	if (name === "complaint") return {
		tool: "complaint",
		subject: String(args.subject || "Complaint").slice(0, 160),
		body: String(args.body || "").slice(0, 2e3)
	};
	if (name === "update_contact") return {
		tool: "update_contact",
		phone: String(args.phone || "").slice(0, 40)
	};
	if (name === "find_equipment") return {
		tool: "find_equipment",
		query: String(args.query || "").slice(0, 80),
		add: false
	};
	if (name === "order_service") {
		const offering = String(args.offering || "network");
		return {
			tool: "order_service",
			offering: offering in OFFERING_LABEL ? offering : "network",
			site: String(args.site || "").slice(0, 200),
			notes: String(args.notes || "").slice(0, 1e3),
			recipientEmail: String(args.recipientEmail || "").slice(0, 160),
			drops: Math.min(50, Math.max(1, Number(args.drops) || 1)),
			shipPhone: Boolean(args.shipPhone),
			confirmMonthly: false
		};
	}
	return { tool: "ask" };
}
var askSarah_createServerFn_handler = createServerRpc({
	id: "d546dfb9d1a169f04dab7a8cc66259559b076f6eb0215dc5d6b0952637b28820",
	name: "askSarah",
	filename: "src/lib/portal/sarah.ts"
}, (opts) => askSarah.__executeServer(opts));
var askSarah = createServerFn({ method: "POST" }).validator((input) => {
	const raw = input ?? {};
	const token = String(raw.token || "").slice(0, 80);
	const text = String(raw.text || "").trim().slice(0, 1e3);
	const channel = raw.channel === "call" ? "call" : "chat";
	const actionId = String(raw.actionId || "").slice(0, 80);
	const history = Array.isArray(raw.history) ? raw.history.slice(-6).map((item) => ({
		role: item?.role === "assistant" ? "assistant" : "user",
		content: String(item?.content || "").slice(0, 500)
	})).filter((item) => item.content) : [];
	if (!token || !text) throw new Error("Say what you need.");
	return {
		token,
		text,
		channel,
		actionId,
		history
	};
}).handler(askSarah_createServerFn_handler, async ({ data }) => {
	const { sql, row } = await loadPortalCustomer(data.token);
	const profile = `${s(row, "name")} <${s(row, "email")}> ${s(row, "business_name")}`.trim();
	const customerId = n(row, "id");
	const notice = await reconcileCustomer(sql, customerId).catch(() => "");
	const slots = await readSlots(sql, customerId).catch(() => ({}));
	let planned = planUtterance(data.text);
	const nudge = followUp(data.text, slots);
	if (nudge?.cancel && data.actionId) {
		await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
		await logEvent(sql, data.actionId, "awaiting_confirmation", "cancelled", "Customer cancelled.").catch(() => void 0);
		return {
			reply: "Understood. I did not place that.",
			cartSku: "",
			actionId: "",
			show: null,
			navigate: false,
			cards: [],
			notice,
			quote: null
		};
	}
	if (nudge && "drops" in nudge && slots.offering) {
		if (data.actionId) await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
		planned = {
			tool: "order_service",
			offering: slots.offering,
			site: slots.site || "",
			notes: data.text,
			recipientEmail: "",
			drops: nudge.drops ?? slots.drops ?? 1,
			shipPhone: false,
			confirmMonthly: false
		};
	}
	if (data.actionId && affirms(data.text) && planned.tool !== "order_service") {
		const stored = await takeConfirm(sql, customerId, data.actionId);
		if (stored === "expired") return {
			reply: "That quote expired. Tell me the service again and I'll price it fresh.",
			cartSku: "",
			actionId: "",
			show: null,
			navigate: false,
			cards: [],
			notice,
			quote: null
		};
		if (!stored) return {
			reply: "That confirmation isn't open anymore. Tell me again what you want.",
			cartSku: "",
			actionId: "",
			show: null,
			navigate: false,
			cards: [],
			notice,
			quote: null
		};
		const next = stored.tool === "order_service" ? {
			...stored,
			confirmMonthly: true
		} : stored;
		let result;
		try {
			result = await runTool(data.token, next, true);
		} catch {
			await finishConfirm(sql, data.actionId, "executing", "checking_status", "The result did not come back.");
			return {
				reply: "I'm still checking whether that went through. I won't send it again.",
				cartSku: "",
				actionId: data.actionId,
				show: null,
				navigate: false,
				cards: [],
				notice: "I'm still checking whether that went through.",
				quote: null
			};
		}
		const status = result.needsConfirm ? "checking_status" : "succeeded";
		await finishConfirm(sql, data.actionId, "executing", status, result.summary);
		const actionId = result.needsConfirm ? await holdConfirm(sql, customerId, result.needsConfirm) : "";
		if (next.tool === "order_service") await writeSlots(sql, customerId, {
			offering: next.offering,
			drops: next.drops,
			site: next.site
		}).catch(() => void 0);
		return answer(result, actionId, notice);
	}
	if (data.actionId && (planned.tool === "decline" || declines(data.text))) {
		await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${data.actionId} and customer_id = ${customerId} and status = 'awaiting_confirmation'`;
		await logEvent(sql, data.actionId, "awaiting_confirmation", "cancelled", "Customer declined.").catch(() => void 0);
		return {
			reply: "Understood. I did not place that.",
			cartSku: "",
			actionId: "",
			show: null,
			navigate: false,
			cards: [],
			notice,
			quote: null
		};
	}
	const pick = listPick(data.text);
	const picked = pick == null ? void 0 : slots.ticketIds?.[pick];
	if (picked) return answer({
		summary: `I'm opening ticket ${picked}.`,
		navigate: true,
		show: {
			to: "/portal/tickets",
			guide: "tickets",
			label: `Ticket ${picked}`,
			ticketId: String(picked)
		}
	}, "", notice);
	if (planned.tool !== "ask" && planned.tool !== "confirm" && planned.tool !== "decline") {
		const result = await runTool(data.token, planned, false);
		const actionId = result.needsConfirm ? await holdConfirm(sql, customerId, result.needsConfirm) : "";
		if (planned.tool === "order_service") await writeSlots(sql, customerId, {
			offering: planned.offering,
			drops: planned.drops,
			site: planned.site
		}).catch(() => void 0);
		if (planned.tool === "list_tickets" && result.refs) await writeSlots(sql, customerId, { ticketIds: result.refs }).catch(() => void 0);
		return answer(result, actionId, notice);
	}
	const grok = await askGrok(data.token, data.channel === "call" ? "call" : "chat", [...data.history, {
		role: "user",
		content: data.text
	}], profile).catch(() => null);
	if (grok?.reply) {
		const actionId = grok.pending ? await holdConfirm(sql, customerId, grok.pending) : "";
		return {
			reply: grok.reply,
			cartSku: grok.cartSku || "",
			actionId,
			show: grok.show ?? null,
			navigate: Boolean(grok.show),
			cards: [],
			notice,
			quote: grok.pending ? quoteFor(grok.pending) : null
		};
	}
	return answer(await runTool(data.token, { tool: "ask" }), "", notice);
});
var getSarahQuote_createServerFn_handler = createServerRpc({
	id: "2c7b2f58b059dda7a01a4e3287c2f8b9af57d94a5a3f01871a734f75e0bd4c50",
	name: "getSarahQuote",
	filename: "src/lib/portal/sarah.ts"
}, (opts) => getSarahQuote.__executeServer(opts));
var getSarahQuote = createServerFn({ method: "POST" }).validator((input) => {
	const token = String(input?.token || "").slice(0, 80);
	if (!token) throw new Error("Sign in first.");
	return { token };
}).handler(getSarahQuote_createServerFn_handler, async ({ data }) => {
	const { sql, row } = await loadPortalCustomer(data.token);
	const customerId = n(row, "id");
	const rows = await sql`
      select id, parameters_json, created_at
      from agent_actions
      where customer_id = ${customerId} and status = 'awaiting_confirmation'
      order by created_at desc
      limit 1
    `;
	if (!rows[0]) return {
		actionId: "",
		quote: null
	};
	const ageMs = Date.now() - new Date(s(rows[0], "created_at") || Date.now()).getTime();
	if (!confirmationFresh(Number.isFinite(ageMs) ? ageMs : 0)) {
		await sql`update agent_actions set status = 'cancelled', updated_at = now() where id = ${s(rows[0], "id")} and customer_id = ${customerId}`;
		return {
			actionId: "",
			quote: null
		};
	}
	try {
		const planned = JSON.parse(s(rows[0], "parameters_json"));
		return {
			actionId: s(rows[0], "id"),
			quote: quoteFor(planned)
		};
	} catch {
		return {
			actionId: "",
			quote: null
		};
	}
});
function humanSpeech(text) {
	let clean = text.replace(/\[[^\]]+\]|<[^>]+>/g, "").replace(/\bI will\b/g, "I'll").replace(/\bI am\b/g, "I'm").replace(/\bdo not\b/gi, "don't").replace(/\bcannot\b/gi, "can't").replace(/\$18(?:\s*\/\s*|\s+per\s+)month/gi, "eighteen dollars per month").replace(/\$175/g, "one hundred seventy-five dollars").replace(/\s+/g, " ").trim();
	if (/^(ha,?|haha,?)\s+/i.test(clean) && !/outage|down|complaint|frustrated|security|payment|invoice|sorry/i.test(clean)) clean = clean.replace(/^(ha,?|haha,?)\s+/i, "[chuckle] ");
	const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 2);
	if (parts.length < 2) return clean;
	return `${parts[0]} [breath] ${parts[1]}`;
}
var speakSarah_createServerFn_handler = createServerRpc({
	id: "560d4f09a38fbc36ee96de5380dd2d123119d3c1e056dd7c479bfccdd9a55612",
	name: "speakSarah",
	filename: "src/lib/portal/sarah.ts"
}, (opts) => speakSarah.__executeServer(opts));
var speakSarah = createServerFn({ method: "POST" }).validator((input) => {
	const text = String(input?.text || "").replace(/\s+/g, " ").trim().slice(0, 700);
	if (!text) throw new Error("Nothing to say.");
	return { text: humanSpeech(text) };
}).handler(speakSarah_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return { audio: "" };
	for (const voice_id of ["ara", "iris"]) {
		const res = await fetch("https://api.x.ai/v1/tts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				text: data.text,
				voice_id,
				language: "en",
				speed: .98,
				output_format: {
					codec: "mp3",
					sample_rate: 44100,
					bit_rate: 192e3
				}
			})
		});
		const type = res.headers.get("content-type") || "";
		if (!res.ok || !type.includes("audio")) continue;
		const bytes = Buffer.from(await res.arrayBuffer());
		if (bytes.byteLength < 100) continue;
		return { audio: bytes.toString("base64") };
	}
	return { audio: "" };
});
var hearSarah_createServerFn_handler = createServerRpc({
	id: "deaddf2bcd2b88033f995c1350da2d08cad0e1f736c4f506900155f1c2444400",
	name: "hearSarah",
	filename: "src/lib/portal/sarah.ts"
}, (opts) => hearSarah.__executeServer(opts));
var hearSarah = createServerFn({ method: "POST" }).validator((input) => {
	const raw = input ?? {};
	const audio = String(raw.audio || "");
	const mime = String(raw.mime || "audio/webm").split(";")[0] || "audio/webm";
	if (!audio || audio.length > 18e5) throw new Error("I didn't catch that.");
	return {
		audio,
		mime
	};
}).handler(hearSarah_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return { text: "" };
	const bytes = Buffer.from(data.audio, "base64");
	const form = new FormData();
	form.append("model", "grok-voice-transcribe-2.0");
	form.append("file", new File([new Uint8Array(bytes)], "turn.webm", { type: data.mime }));
	const res = await fetch("https://api.x.ai/v1/stt", {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}` },
		body: form
	});
	if (!res.ok) return { text: "" };
	const body = await res.json();
	return { text: String(body.text || body.transcript || "").trim() };
});
//#endregion
export { askSarah_createServerFn_handler, getSarahQuote_createServerFn_handler, hearSarah_createServerFn_handler, speakSarah_createServerFn_handler };
