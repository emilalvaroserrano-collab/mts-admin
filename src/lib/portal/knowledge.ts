export type SarahPage = {
  id: string;
  to: "/portal" | "/portal/tickets" | "/portal/tickets/new" | "/portal/shop" | "/portal/orders" | "/portal/billing" | "/portal/complaints" | "/portal/organization" | "/portal/account" | "/portal/my-services" | "/portal/quotes" | "/portal/notifications";
  guide: string;
  label: string;
  words: string[];
};

export const PAGES: SarahPage[] = [
  { id: "home", to: "/portal", guide: "home", label: "Home", words: ["home", "dashboard", "start"] },
  { id: "tickets", to: "/portal/tickets", guide: "tickets", label: "Tickets", words: ["ticket", "tickets", "support", "help desk"] },
  { id: "new-ticket", to: "/portal/tickets/new", guide: "tickets", label: "New ticket", words: ["new ticket", "open a ticket"] },
  { id: "shop", to: "/portal/shop", guide: "order", label: "Order", words: ["shop", "catalog", "equipment", "laptop", "store"] },
  { id: "orders", to: "/portal/orders", guide: "orders", label: "My orders", words: ["my orders", "shipment", "tracking", "delivery"] },
  { id: "billing", to: "/portal/billing", guide: "billing", label: "Billing", words: ["billing", "invoice", "payment", "pay later"] },
  { id: "complaints", to: "/portal/complaints", guide: "complaints", label: "Complaints", words: ["complaint", "complaints", "feedback"] },
  { id: "organization", to: "/portal/organization", guide: "organization", label: "Organization", words: ["organization", "company"] },
  { id: "account", to: "/portal/account", guide: "account", label: "Account", words: ["account", "profile", "phone number"] },
  { id: "services", to: "/portal/my-services", guide: "services", label: "My services", words: ["my services", "active service", "provision"] },
  { id: "quotes", to: "/portal/quotes", guide: "quotes", label: "Quotes", words: ["quote", "quotes"] },
  { id: "notifications", to: "/portal/notifications", guide: "notifications", label: "Notifications", words: ["notification", "notifications", "alert"] },
];

const ARTICLES: { title: string; keywords: string[]; body: string; page: string }[] = [
  {
    title: "Manage Tech Service",
    keywords: ["manage tech", "mts", "company", "about the company", "desk", "sarah", "website", "managetechservice"],
    page: "home",
    body: "Manage Tech Service supports business IT. The public site is managetechservice.com. The customer portal is invite only. Access is requested at access.virtualcloudgroup.com. The desk phone is 818-758-4073. Sarah is the portal agent for the signed-in customer only. She cannot see other customers, and she cannot change roles. Role and grant changes stay in the admin portal.",
  },
  {
    title: "Portal map",
    keywords: ["portal", "pages", "menu", "what can you do", "where do i"],
    page: "home",
    body: "The customer portal pages are Home, Tickets, Order, My orders, Billing, Complaints, Organization, and Account. Home is the summary. Tickets are support requests. Order has Equipment and Order services. My orders shows status and shipment. Billing shows invoices and whether this account must pay now or may use order now, pay later. Complaints are filed there. Organization is the company on the account. Account holds the profile and phone. Sarah can open these pages and point at them while she speaks.",
  },
  {
    title: "Managed IT",
    keywords: ["managed it", "help desk", "server", "cyber", "backup", "endpoint", "security"],
    page: "tickets",
    body: "Managed IT services are Help Desk, Server Management, Network Support, Cybersecurity, Backup and Recovery, and Endpoint Security. A customer asks for these from Order services or by opening a ticket. Sarah can open the ticket and describe the request. She does not claim a technician is already dispatched.",
  },
  {
    title: "Cloud and business apps",
    keywords: ["cloud", "microsoft", "office 365", "outlook", "teams", "sharepoint", "azure", "intune", "google", "active directory", "daas", "migration"],
    page: "tickets",
    body: "Cloud services include hosting, migration, desktop as a service, infrastructure as a service, and virtual servers. Business application support covers Microsoft 365, Outlook, Teams, SharePoint, Azure, Intune, Active Directory, and Google Workspace. Sarah opens a ticket or a service request for these. She does not reset a password inside Microsoft herself.",
  },
  {
    title: "Projects",
    keywords: ["wifi", "wi-fi", "cabling", "consulting", "relocation", "audit", "project"],
    page: "quotes",
    body: "IT projects include Wi-Fi installation, network cabling, IT consulting, office relocation, and security audits. These are quoted. Sarah can note the site and the request. A quote is not an invoice and is not a completed install.",
  },
  {
    title: "Phone, fax, and internet",
    keywords: ["voip", "extension", "telxent", "fax", "efax", "spectrum", "fiber", "frontier", "wireless", "internet", "phone line"],
    page: "shop",
    body: "Phone and internet are ordered under Order services. A VoIP extension is 18 dollars a month extra on the Telxent bill. Sarah must not place it until the caller agrees to that monthly charge. Telxent still has to confirm the extension before it is billed. A new extension can add a desk phone to the cart if the caller wants a handset shipped. eFax needs the email address that should receive incoming faxes. Physical fax is a separate line. Internet options are Spectrum cable, AT&T Fiber, Frontier Fiber, and fixed wireless. Sarah records the site address with the request.",
  },
  {
    title: "Wiring",
    keywords: ["wiring", "drop", "cable drop", "175"],
    page: "shop",
    body: "Wiring is billed at 175 dollars per drop. Sarah asks how many drops and does not place the request until the caller agrees to that price. She repeats the count and the total before she asks for a yes.",
  },
  {
    title: "Tickets and Zendesk",
    keywords: ["ticket", "zendesk", "support", "printer", "outlook", "outage", "reply"],
    page: "tickets",
    body: "Sarah can list tickets, open a ticket, and add a public reply on this account only. If Zendesk is connected, the portal ticket is created there and public replies sync back. Private Zendesk notes are not shown. Sarah never invents a Zendesk number. If Zendesk is not connected, the ticket still exists in the portal and she says the desk copy is pending.",
  },
  {
    title: "Equipment and checkout",
    keywords: ["laptop", "equipment", "catalog", "cart", "checkout", "product", "desk phone"],
    page: "shop",
    body: "Equipment is on the Order page. Sarah can find a product and place it in the cart. Checkout is the store checkout, not something she completes by voice. She does not take or store a card number. Some accounts must pay before the order is placed. Accounts with deferred billing may choose Order now, pay later.",
  },
  {
    title: "Orders, shipping, and billing",
    keywords: ["shipment", "tracking", "order status", "invoice", "billing", "pay later", "payment", "barcode"],
    page: "orders",
    body: "My orders shows the status, payment state, and shipment for this account. The order page includes the shipment state the way a store would. The air waybill barcode is built from the order number so a courier scanner can read it. Billing lists invoices. Sarah can read status. She cannot mark a payment captured unless the payment provider has confirmed it.",
  },
  {
    title: "Account, organization, complaints",
    keywords: ["complaint", "profile", "organization", "update phone", "permissions", "role"],
    page: "account",
    body: "Account shows the name, email, and phone for this login. Sarah can update the phone number. Organization shows the company tied to the account. A complaint opens a ticket and is listed under Complaints. New registrations are customers first. An admin later decides who may shop, who must pay now, and who may order services on an invoice. Sarah cannot grant those permissions.",
  },
  {
    title: "How Sarah works",
    keywords: ["call", "chat", "listening", "microphone", "knowledge", "what do you know"],
    page: "home",
    body: "On a call, the line rings twice, then Sarah answers. She speaks first. The microphone stays closed while she talks, then opens when she finishes. She can chat or take the call. While she explains a page, she opens it and highlights it, and her voice continues. She uses this knowledge base for the company, the services, the prices she is allowed to quote, and the portal. She still runs a tool before she claims a ticket, order, or change was made.",
  },
];

export function matchPage(text: string) {
  const q = text.toLowerCase();
  const ranked = PAGES.map((page) => ({ page, score: page.words.reduce((sum, word) => sum + (q.includes(word) ? word.length : 0), 0) }));
  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].page : null;
}

export function pageById(id: string) {
  return PAGES.find((page) => page.id === id) ?? PAGES[0];
}

export function lookupKnowledge(query: string) {
  const q = query.toLowerCase();
  const ranked = ARTICLES.map((article) => ({
    article,
    score: article.keywords.reduce((sum, word) => sum + (q.includes(word) ? word.length : 0), 0),
  })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  const chosen = ranked.slice(0, 2);
  if (!chosen.length) return null;
  const page = pageById(chosen[0].article.page);
  return {
    summary: chosen.map((item) => item.article.body).join(" "),
    show: { to: page.to, guide: page.guide, label: page.label },
  };
}

export function knowledgeBrief() {
  return ARTICLES.map((article) => `${article.title}: ${article.body}`).join("\n");
}
