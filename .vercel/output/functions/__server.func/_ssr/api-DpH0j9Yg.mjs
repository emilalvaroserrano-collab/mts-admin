import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { n as alternativeMode, r as authMiddleware } from "./alternative-DU8UBeZw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DpH0j9Yg.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function tagsOf(value) {
	return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}
function asRole(value) {
	if (value === "owner" || value === "admin" || value === "agent" || value === "viewer") return value;
	return "agent";
}
function obj(input) {
	if (!input || typeof input !== "object") return {};
	return input;
}
function str(value, max = 500) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function flag(value, fallback = false) {
	return typeof value === "boolean" ? value : fallback;
}
function intish(value) {
	if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
	if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Math.trunc(Number(value));
	return null;
}
function cleanSubdomain(raw) {
	return raw.trim().replace(/^https?:\/\//i, "").replace(/\.zendesk\.com.*$/i, "").replace(/\/.*$/, "").slice(0, 80);
}
var getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3f30520125428c05602f315273312b8a15eee718a92a5af4748653977e75b589"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e4757ece97cc9d09404e3b5af23b1650f02f5f8e84a5fee0edf33befa441c5dc"));
function ticketFilter(input) {
	const raw = obj(input);
	return {
		q: str(raw.q, 120),
		status: str(raw.status, 32) || "unresolved",
		orgId: intish(raw.orgId),
		category: str(raw.category, 80),
		assignee: str(raw.assignee, 120),
		view: str(raw.view, 80)
	};
}
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(ticketFilter).handler(createSsrRpc("8fc8c591f3586970bd83eebfb0f17f9a574bc871aa0a60fad52a0b01589563bf"));
var getTicket = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing ticket.");
	return value;
}).handler(createSsrRpc("4adceff40dbb5d9b2ea595bcf4ab2c6e92b7fe74e73108bf1f85e2a365176b14"));
var replyTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const ticketId = intish(raw.ticketId);
	const body = str(raw.body, 4e3);
	if (!ticketId || !body) throw new Error("Write a reply before sending.");
	return {
		ticketId,
		body,
		publicNote: flag(raw.publicNote, true)
	};
}).handler(createSsrRpc("b0e1e288e1f670a85f294c653c0de13e892bedc014c6ac62dee675c698fc6a1a"));
var updateTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	if (!id) throw new Error("Missing ticket.");
	const status = str(raw.status, 32);
	if (status && ![
		"new",
		"open",
		"pending",
		"solved",
		"closed"
	].includes(status)) throw new Error("Unknown status.");
	return {
		id,
		status,
		assignee: str(raw.assignee, 120),
		priority: str(raw.priority, 32),
		organizationId: raw.organizationId === void 0 ? void 0 : intish(raw.organizationId)
	};
}).handler(createSsrRpc("5745ee98f006b7faf92a1bc4397e11590b20a2526db8579e3e2094f9a67dbbe5"));
var listOrgs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4fbe74b4be576658496e247d516ea505284bbe0f38aff11191be8ca286b160ce"));
var getOrg = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing company.");
	return value;
}).handler(createSsrRpc("f0aed5deacb7fe81e5d9ad3ee604664b02c2f90fa43d049b98963e1fdf9cf62a"));
var saveOrg = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	if (!name) throw new Error("Company name is required.");
	return {
		id: intish(raw.id),
		name,
		domain: str(raw.domain, 160),
		industry: str(raw.industry, 80),
		phone: str(raw.phone, 40),
		address: str(raw.address, 240),
		zendeskOrgId: str(raw.zendeskOrgId, 40),
		notes: str(raw.notes, 2e3),
		portalAccess: flag(raw.portalAccess, true),
		orderingEnabled: flag(raw.orderingEnabled, true),
		userRequestsEnabled: flag(raw.userRequestsEnabled, true),
		approvalRequired: flag(raw.approvalRequired, true)
	};
}).handler(createSsrRpc("418c0f1e1a743693f9818c0fa3a0a5d88c422f497823edd34de53215bedfbd35"));
var getPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("232a25774506ba82cea2e255080fc9efafaa2fa8e9a845ab20d3a5fb6d6eb618"));
var saveCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	const email = str(raw.email, 180);
	if (!name || !email) throw new Error("Name and email are required.");
	const level = str(raw.permissionLevel, 32) || "regular";
	if (level !== "regular" && level !== "authorized") throw new Error("Unknown permission level.");
	return {
		id: intish(raw.id),
		organizationId: intish(raw.organizationId),
		name,
		email,
		title: str(raw.title, 120),
		permissionLevel: level,
		canOrder: flag(raw.canOrder),
		canRequestUsers: flag(raw.canRequestUsers),
		canApproveOrders: flag(raw.canApproveOrders),
		active: flag(raw.active, true),
		zendeskUserId: str(raw.zendeskUserId, 40)
	};
}).handler(createSsrRpc("4a80509859e38f16a6df04b02480fa29987bad92a917963f03201d814a6a56df"));
var reviewRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const decision = str(raw.decision, 16);
	if (!id || decision !== "approved" && decision !== "denied") throw new Error("Choose a decision.");
	return {
		id,
		decision
	};
}).handler(createSsrRpc("cb2ab385cfd834099b031a34d4128fc790f7111f4d4082652e985dad027dad0f"));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e11cfcd4ab1992da649de8b88723932e1f58799e9fe3b16826626dcbe17fd43c"));
var saveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	const sku = str(raw.sku, 40);
	if (!name || !sku) throw new Error("Name and SKU are required.");
	const price = intish(raw.priceCents);
	if (price == null || price < 0) throw new Error("Enter a price.");
	const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : "";
	if (imageUrl.length > 9e5) throw new Error("Image is too large. Use a photo under 8 MB.");
	const visibility = str(raw.visibility, 32) === "authorized" ? "authorized" : "all";
	return {
		id: intish(raw.id),
		sku,
		name,
		category: str(raw.category, 80),
		description: str(raw.description, 2e3),
		specs: str(raw.specs, 2e3),
		priceCents: price,
		imageUrl,
		available: flag(raw.available, true),
		visibility
	};
}).handler(createSsrRpc("c3af807360839902a06252eb3c0eeb62f3fe3187e2d913498d4b4f3b94eb2376"));
var removeProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing product.");
	return value;
}).handler(createSsrRpc("4a674cd9b9a1c8fa62fa2f63958614f12ca20d1de8364be501d5607b0174770d"));
var importProducts = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const rows = Array.isArray(raw.rows) ? raw.rows : [];
	if (!rows.length) throw new Error("That spreadsheet has no products.");
	if (rows.length > 200) throw new Error("Import up to 200 products at a time.");
	return { rows: rows.map((item) => {
		const row = obj(item);
		const image = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
		const imageUrl = image.startsWith("https://") || image.startsWith("http://") || image.startsWith("/") ? image.slice(0, 500) : "";
		const price = intish(row.priceCents);
		return {
			sku: str(row.sku, 40),
			name: str(row.name, 160),
			category: str(row.category, 80) || "Accessories",
			description: str(row.description, 2e3),
			specs: str(row.specs, 2e3),
			priceCents: price != null && price >= 0 ? price : -1,
			imageUrl,
			available: flag(row.available, true),
			visibility: str(row.visibility, 32) === "authorized" ? "authorized" : "all"
		};
	}) };
}).handler(createSsrRpc("45e81e25d62f6095d14f3de49f21278e58c08d05748828c68c5c3c925994a191"));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("831f84a019fab8dbd63d43c67e9a251b3d70bfbe081fa76acaf0e33db552ab25"));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("c115b8940b8a58256bd3f466da852cb9acb7532ab6385b8a57f40498fee5711d"));
var createOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const organizationId = intish(raw.organizationId);
	if (!organizationId) throw new Error("Choose a company.");
	const items = (Array.isArray(raw.items) ? raw.items : []).map((item) => {
		const row = obj(item);
		return {
			productId: intish(row.productId) ?? 0,
			quantity: intish(row.quantity) ?? 0
		};
	}).filter((item) => item.productId > 0 && item.quantity > 0);
	if (!items.length) throw new Error("Add at least one product.");
	const paymentMethod = str(raw.paymentMethod, 32);
	const returnUrl = str(raw.returnUrl, 300);
	return {
		organizationId,
		customerUserId: intish(raw.customerUserId),
		notes: str(raw.notes, 2e3),
		paymentMethod,
		returnUrl,
		items
	};
}).handler(createSsrRpc("72d38b4e1c78504ef4b98122d058ed8f7eb0f96a26b270a4da09f895640f0b62"));
var updateOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = intish(raw.id);
	const status = str(raw.status, 32);
	const allowed = [
		"pending",
		"approved",
		"processing",
		"fulfilled",
		"cancelled"
	];
	const shipments = [
		"unfulfilled",
		"shipped",
		"out_for_delivery",
		"delivered"
	];
	const shipmentStatus = str(raw.shipmentStatus, 32);
	if (!id || !allowed.includes(status)) throw new Error("Choose an order status.");
	return {
		id,
		status,
		approvalNote: str(raw.approvalNote, 2e3),
		processingNote: str(raw.processingNote, 2e3),
		shipmentStatus: shipments.includes(shipmentStatus) ? shipmentStatus : "unfulfilled",
		trackingNumber: str(raw.trackingNumber, 80),
		trackingCarrier: str(raw.trackingCarrier, 40)
	};
}).handler(createSsrRpc("e8753131772855b6687893f6be22770d2601ad7ac111e01c082caf03596aa957"));
var linkOrderTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("19ad874d40be191851943cd0742210b04365886e52ed9a5b0313fd7e1556fafe"));
var listForms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b8a8e07cb55604bc37b9e39b903a2f687bbef309a8c2d4d5427e8ef4df807382"));
var saveForm = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 160);
	if (!name) throw new Error("Form name is required.");
	const required = Array.isArray(raw.requiredFields) ? raw.requiredFields.map((field) => str(field, 40)).filter(Boolean) : tagsOf(str(raw.requiredFields, 400));
	return {
		id: intish(raw.id),
		name,
		category: str(raw.category, 80),
		subcategory: str(raw.subcategory, 80),
		zendeskField: str(raw.zendeskField, 80),
		requiredFields: required.join(","),
		restricted: flag(raw.restricted),
		active: flag(raw.active, true)
	};
}).handler(createSsrRpc("33566ad32bac51299c67cf4c015d83da54b46db4a6ca2c11a6b6132ff080f94c"));
var testForm = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const formId = intish(raw.formId);
	const organizationId = intish(raw.organizationId);
	if (!formId || !organizationId) throw new Error("Choose a form and a company.");
	const fields = obj(raw.fields);
	const clean = {};
	for (const [key, value] of Object.entries(fields)) clean[key] = str(value, 2e3);
	return {
		formId,
		organizationId,
		fields: clean,
		asRegular: flag(raw.asRegular, true)
	};
}).handler(createSsrRpc("e4ddc06d2ec61b5cbd56f561d7961a7fde0d8f395472983bbfe965eeadc48814"));
var listPolicies = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2811f80dd615bd5d4c4435f679121e304e6b7e4ae9b6da5b60cdf3b1a4df2ab2"));
var savePolicy = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const id = str(raw.id, 40);
	if (!id) throw new Error("Missing role.");
	return {
		id,
		canOrder: flag(raw.canOrder),
		canRequestUsers: flag(raw.canRequestUsers),
		canApproveOrders: flag(raw.canApproveOrders),
		canManagePortal: flag(raw.canManagePortal)
	};
}).handler(createSsrRpc("bff56ee0338820f149806a5679ea1867d0ee6ff1080722d2dcd1fb01b77afa9a"));
var getIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("af4de7546fdba97335a36bf244736651e02e56040a542e4d8626b1a6938c0137"));
var saveIntegration = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	return {
		subdomain: cleanSubdomain(str(raw.subdomain, 120)),
		email: str(raw.email, 180),
		apiToken: str(raw.apiToken, 200),
		clearToken: flag(raw.clearToken)
	};
}).handler(createSsrRpc("039e73ecb7b770fd06ca72d4dd05126cc1107c36ed79939ac642d1c75b0b9549"));
var testIntegration = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8267b9b43d81ff77f996791a832672ab18dedee21e7104a4debb5d87677dc705"));
var syncZendesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("db77de5565864615cf86e0700205113a8803b82964fde96f76c4a8aa8d167062"));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("62d5a17b50ad151ca9ad632360b484b9338217ef1cbf03b4906c1f95b5c61b2c"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const brandName = str(raw.brandName, 80);
	if (!brandName) throw new Error("Brand name is required.");
	return {
		brandName,
		supportEmail: str(raw.supportEmail, 180),
		tagline: str(raw.tagline, 240),
		notifyNewTicket: flag(raw.notifyNewTicket, true),
		notifyNewOrder: flag(raw.notifyNewOrder, true),
		customerCatalogVisible: flag(raw.customerCatalogVisible, true)
	};
}).handler(createSsrRpc("b0f379b93ca9398d5e1a4acccb7adc4ce9e00add400f24ff4afd1298806bf9ac"));
var saveStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const userId = str(raw.userId, 80);
	const role = asRole(str(raw.role, 32));
	if (!userId) throw new Error("Missing staff member.");
	return {
		userId,
		role,
		active: flag(raw.active, true),
		organizationId: intish(raw.organizationId)
	};
}).handler(createSsrRpc("bb2b538133ede151b6fe4b4b094400ad002c31b110d59bd68450c339801704bb"));
var getPayments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("dfaa658b4c2fce2c8aac4fba6f146d0ddd01dc410e260030ad8cd5570345adaa"));
var savePayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = obj(input);
	const terms = str(raw.invoiceTerms, 40);
	return {
		cardEnabled: flag(raw.cardEnabled, false),
		invoiceEnabled: flag(raw.invoiceEnabled, true),
		purchaseOrderEnabled: flag(raw.purchaseOrderEnabled, true),
		publishableKey: str(raw.publishableKey, 120),
		secretKey: str(raw.secretKey, 200),
		clearSecret: flag(raw.clearSecret, false),
		invoiceTerms: [
			"Net 15",
			"Net 30",
			"Net 45"
		].includes(terms) ? terms : "Net 30",
		requirePo: flag(raw.requirePo, false),
		alternativeEnabled: flag(raw.alternativeEnabled, true),
		alternativeClientId: str(raw.alternativeClientId, 120),
		alternativeClientSecret: str(raw.alternativeClientSecret, 200),
		clearAlternativeSecret: flag(raw.clearAlternativeSecret, false),
		alternativeEnvironment: alternativeMode(str(raw.alternativeEnvironment, 16))
	};
}).handler(createSsrRpc("225663cb1bb354603c205d5aabd6a5459388309ad5b5aa1cc93b0b72913dc023"));
var testPayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("5b73ba21e97c8dad3c8ec2284acf2248c024c6a0be0fbd07abde9efcb935e5f5"));
var testAlternative = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f4c15876b91381be1a1a5430cc4e73bb3e7e5629b928e57536f1869b91f20f15"));
var refreshAlternativeOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = intish(id);
	if (!value) throw new Error("Missing order.");
	return value;
}).handler(createSsrRpc("ac50fa25a8c0af214c48b56e2b0b07ed7496ef6c0e0bc82e42fa187a6b973ddd"));
var getStorefront = createServerFn({ method: "GET" }).handler(createSsrRpc("e002bfeae19e89322e5bda5a5d1981718c1ac500764589e5558f116614fe1bf2"));
var getShopCheckout = createServerFn({ method: "GET" }).handler(createSsrRpc("2444a9daa5bdee0aa8bad40ecac51400b55a10983502f68e6bcfeaedd89c4aee"));
var shopRegister = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, true)).handler(createSsrRpc("62beba8a04e9f66641d4e6f42ae1724ce382e7d5b742d5a63659c53f8e81676f"));
var shopLogin = createServerFn({ method: "POST" }).validator((input) => shopCredentials(input, false)).handler(createSsrRpc("c66c27b00ab4372a9b30c9c26822c913f782ecdf4dc9681d32499b38af81ad3e"));
var shopLogout = createServerFn({ method: "POST" }).validator((input) => ({ token: str(obj(input).token, 80) })).handler(createSsrRpc("be47dfa17f463fbc61a2a072b0aaaa230867d9fe47c5118e17df31be541667b3"));
var getShopAccount = createServerFn({ method: "GET" }).validator((token) => str(token, 80)).handler(createSsrRpc("38afa57349a8410b70ad520028e233a2fc20ba16edbf8a32e82ad41a833184c8"));
var saveShopProfile = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const token = str(raw.token, 80);
	if (!token) throw new Error("Sign in again.");
	return {
		token,
		name: str(raw.name, 120),
		phone: str(raw.phone, 40),
		address: str(raw.address, 160),
		city: str(raw.city, 80),
		region: str(raw.region, 80),
		postal: str(raw.postal, 20),
		country: str(raw.country, 80) || "United States"
	};
}).handler(createSsrRpc("2f84c8ccf973926d40b951049a6a795b28384fecc69bbc024dbd0625b2fa66d9"));
function shopCredentials(input, named) {
	const raw = obj(input);
	const email = str(raw.email, 160).toLowerCase();
	const password = str(raw.password, 80);
	const name = str(raw.name, 120);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
	if (password.length < 8) throw new Error("Use at least 8 characters.");
	if (named && !name) throw new Error("Enter your name.");
	return {
		email,
		password,
		name
	};
}
var placeStorefrontOrder = createServerFn({ method: "POST" }).validator((input) => {
	const raw = obj(input);
	const name = str(raw.name, 120);
	const email = str(raw.email, 160).toLowerCase();
	const address = str(raw.address, 160);
	const city = str(raw.city, 80);
	const region = str(raw.region, 80);
	const postal = str(raw.postal, 20);
	if (!name) throw new Error("Enter your name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
	if (!address || !city || !postal) throw new Error("Enter a shipping address.");
	const items = (Array.isArray(raw.items) ? raw.items : []).map((item) => {
		const row = obj(item);
		return {
			sku: str(row.sku, 40),
			quantity: intish(row.quantity) ?? 0
		};
	}).filter((item) => item.sku && item.quantity > 0 && item.quantity <= 99);
	if (!items.length) throw new Error("Your cart is empty.");
	const shippingMethod = str(raw.shippingMethod, 20) === "express" ? "express" : "standard";
	return {
		name,
		email,
		phone: str(raw.phone, 40),
		company: str(raw.company, 120),
		address,
		city,
		region,
		postal,
		country: str(raw.country, 80) || "United States",
		shippingMethod,
		paymentMethod: str(raw.paymentMethod, 32),
		notes: str(raw.notes, 1e3),
		password: str(raw.password, 80),
		token: str(raw.token, 80),
		items
	};
}).handler(createSsrRpc("e83e5ac0f5c822bd05d3ae44dca014fb2cf4db09c717579c103ca29f85bb716c"));
//#endregion
export { saveOrg as A, syncZendesk as B, refreshAlternativeOrder as C, saveCustomer as D, reviewRequest as E, saveShopProfile as F, updateOrder as G, testForm as H, saveStaff as I, updateTicket as K, shopLogin as L, savePolicy as M, saveProduct as N, saveForm as O, saveSettings as P, shopLogout as R, placeStorefrontOrder as S, replyTicket as T, testIntegration as U, testAlternative as V, testPayments as W, listOrders as _, getOrg as a, listProducts as b, getSettings as c, getShopCheckout as d, getStorefront as f, listForms as g, linkOrderTicket as h, getOrder as i, savePayments as j, saveIntegration as k, getShell as l, importProducts as m, getDashboard as n, getPayments as o, getTicket as p, getIntegration as r, getPeople as s, createOrder as t, getShopAccount as u, listOrgs as v, removeProduct as w, listTickets as x, listPolicies as y, shopRegister as z };
