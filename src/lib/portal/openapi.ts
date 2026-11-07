export const agentOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "Manage Tech Service CSR Agent API",
    version: "1.0.0",
    description: "Super admin key for the CSR agent. It is not tied to one user. It can create, read, update, and delete any customer. A new user must verify the email that was sent to them. The key cannot mark that email verified by itself, and it cannot set a password, role, grant, or card.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      agentKey: { type: "http", scheme: "bearer", bearerFormat: "mts_" },
    },
  },
  security: [{ agentKey: [] }],
  paths: {
    "/api/agent/customers": {
      get: {
        summary: "Find customers",
        parameters: [{ name: "q", in: "query", schema: { type: "string" }, description: "Name, email, or business. Empty returns the latest 50." }],
        responses: { "200": { description: "Customers without secrets. Includes verified." } },
      },
      post: {
        summary: "Create a user. Email is required and must be verified by that user. Other profile fields are optional.",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" }, name: { type: "string" }, phone: { type: "string" }, business: { type: "string" }, address: { type: "string" }, city: { type: "string" }, region: { type: "string" }, postal: { type: "string" }, country: { type: "string" } } } } } },
        responses: { "201": { description: "{ id, email, verified: false, mailed }. The code is emailed. It is not returned." } },
      },
    },
    "/api/agent/customers/{id}": {
      get: { summary: "Read one customer", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Profile, grants, and access flags." } } },
      patch: {
        summary: "Update profile and company fields. Cannot set verified, role, grants, or a password.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, business: { type: "string" }, address: { type: "string" }, city: { type: "string" }, region: { type: "string" }, postal: { type: "string" }, country: { type: "string" } } } } } },
        responses: { "200": { description: "{ ok: true, verified }" } },
      },
      delete: {
        summary: "Delete this user. Orders stay, with the customer link cleared.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "{ ok: true }" } },
      },
    },
    "/api/agent/customers/{id}/verify": {
      post: {
        summary: "Submit the code the user read from their email",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["code"], properties: { code: { type: "string" } } } } } },
        responses: { "200": { description: "{ ok: true, verified: true }" } },
      },
    },
    "/api/agent/customers/{id}/verify/resend": {
      post: {
        summary: "Email a new verification code. The code is not returned.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "{ ok: true, mailed }" } },
      },
    },
    "/api/agent/customers/{id}/pages": {
      get: { summary: "Portal pages this customer can open", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Home, Tickets, Order (/portal/shop), Orders, Billing, Complaints, Organization, Account, Notifications." } } },
    },
    "/api/agent/customers/{id}/home": {
      get: { summary: "Home summary shown on /portal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Open tickets, pending orders, unpaid charges, and service counts." } } },
    },
    "/api/agent/customers/{id}/shop": {
      get: { summary: "Order page shown on /portal/shop", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Equipment catalog when this account can shop, plus the service menu (network, VoIP, fax, internet, wiring)." } } },
    },
    "/api/agent/customers/{id}/billing": {
      get: { summary: "Billing page shown on /portal/billing", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Order totals and whether invoice purchasing is allowed. 403 when shop and invoice are both off." } } },
    },
    "/api/agent/customers/{id}/organization": {
      get: { summary: "Organization page shown on /portal/organization", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Company name, phone, and city." } } },
      post: {
        summary: "Save the company and open a review ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["business"], properties: { business: { type: "string" }, phone: { type: "string" }, city: { type: "string" } } } } } },
        responses: { "200": { description: "{ ok, ticketId, zendeskId }" } },
      },
    },
    "/api/agent/customers/{id}/tickets": {
      get: { summary: "List this customer's tickets", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Tickets for this email only." } } },
      post: {
        summary: "Open a ticket and copy it to Zendesk when connected",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["subject", "body"], properties: { subject: { type: "string" }, body: { type: "string" }, category: { type: "string" }, severity: { type: "string" }, device: { type: "string" } } } } } },
        responses: { "200": { description: "{ ticketId, zendeskId }" } },
      },
    },
    "/api/agent/customers/{id}/tickets/{ticketId}": {
      get: { summary: "Read one ticket and its public comments", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "ticketId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Ticket or 404 if it is not this customer's." } } },
    },
    "/api/agent/customers/{id}/tickets/{ticketId}/replies": {
      post: {
        summary: "Add a public reply and a desk copy ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "ticketId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["body"], properties: { body: { type: "string" } } } } } },
        responses: { "200": { description: "{ ok: true, ticketId }" } },
      },
    },
    "/api/agent/customers/{id}/orders": {
      get: { summary: "Orders page shown on /portal/orders", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Orders for this customer id or ship email." } } },
      post: {
        summary: "Place an equipment order for this customer from catalog SKUs",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["items"], properties: { items: { type: "array" }, sku: { type: "string" }, quantity: { type: "integer" }, payLater: { type: "boolean" }, shippingMethod: { type: "string", enum: ["standard", "express"] }, address: { type: "string" }, city: { type: "string" }, region: { type: "string" }, postal: { type: "string" }, notes: { type: "string" } } } } } },
        responses: { "200": { description: "{ placed, number, totalCents, paymentUrl, paymentMethod, items }. Card numbers are never accepted." } },
      },
    },
    "/api/agent/customers/{id}/orders/{orderId}": {
      get: { summary: "One order, the /portal/orders/{orderId} page", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "orderId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Lines, payment, shipment, and tracking. 404 if it is not this customer's." } } },
    },
    "/api/agent/customers/{id}/services": {
      get: { summary: "List service requests", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "service_requests for this customer." } } },
      post: {
        summary: "Order a portal service",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["offering"], properties: { offering: { type: "string", enum: ["network", "voip-line", "voip-ext", "fax-physical", "fax-efax", "internet-spectrum", "internet-att", "internet-frontier", "internet-fixed", "wiring"] }, site: { type: "string" }, notes: { type: "string" }, recipientEmail: { type: "string" }, drops: { type: "integer" }, shipPhone: { type: "boolean" }, confirmMonthly: { type: "boolean" } } } } } },
        responses: { "200": { description: "{ id, ticketId }. voip-ext requires confirmMonthly true. wiring is $175 per drop." } },
      },
    },
    "/api/agent/customers/{id}/quotes/{requestId}": {
      post: {
        summary: "Accept or reject a quoted request",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "requestId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["decision"], properties: { decision: { type: "string", enum: ["accepted", "rejected"] } } } } } },
        responses: { "200": { description: "{ status }" } },
      },
    },
    "/api/agent/customers/{id}/complaints": {
      get: { summary: "List complaints", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "This customer's complaints." } } },
      post: {
        summary: "File a complaint and a ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["subject", "body"], properties: { kind: { type: "string" }, subject: { type: "string" }, body: { type: "string" } } } } } },
        responses: { "200": { description: "{ id, ticketId, zendeskId }" } },
      },
    },
    "/api/agent/customers/{id}/notices": {
      get: { summary: "List notices", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "This customer's notices." } } },
    },
    "/api/agent/customers/{id}/notices/{noticeId}/read": {
      post: { summary: "Mark one notice read", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "noticeId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "{ ok: true }" } } },
    },
  },
};
