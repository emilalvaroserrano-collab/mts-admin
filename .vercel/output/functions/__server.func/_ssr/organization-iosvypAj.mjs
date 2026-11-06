import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { lt as savePortalCompany } from "./api-CEXWu3z6.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/organization-iosvypAj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrganizationPage() {
	const token = useShopToken();
	const client = useQueryClient();
	const session = usePortalSession();
	const [business, setBusiness] = (0, import_react.useState)(session.data?.business || session.data?.organization || "");
	const [phone, setPhone] = (0, import_react.useState)(session.data?.customer.phone || "");
	const [city, setCity] = (0, import_react.useState)(session.data?.customer.city || "");
	const [notice, setNotice] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => savePortalCompany({ data: {
			token,
			business,
			phone,
			city
		} }),
		onSuccess: () => {
			setNotice("Saved. A ticket was opened so the desk can review the change.");
			client.invalidateQueries({ queryKey: ["portal-session", token] });
		},
		onError: (error) => setNotice(error instanceof Error ? error.message : "Could not save.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mx-auto grid w-full max-w-lg gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "My organization"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "You only see this company. Saving a change opens a ticket for review."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: business,
				onChange: (event) => setBusiness(event.target.value),
				required: true,
				placeholder: "Company name",
				"aria-label": "Company name",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: phone,
				onChange: (event) => setPhone(event.target.value),
				placeholder: "Phone",
				"aria-label": "Phone",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: city,
				onChange: (event) => setCity(event.target.value),
				placeholder: "City",
				"aria-label": "City",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: save.isPending,
				className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
				children: "Save company"
			})
		]
	});
}
//#endregion
export { OrganizationPage as component };
