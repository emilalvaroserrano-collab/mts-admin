import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { pt as saveShopProfile } from "./api-CEXWu3z6.mjs";
import { t as useCurrentUser } from "./use-current-user-D9YQRpMJ.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-oIEsdEPN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const token = useShopToken();
	const session = usePortalSession();
	const user = useCurrentUser();
	const customer = session.data?.customer;
	const [name, setName] = (0, import_react.useState)(customer?.name || "");
	const [phone, setPhone] = (0, import_react.useState)(customer?.phone || "");
	const [address, setAddress] = (0, import_react.useState)(customer?.address || "");
	const [city, setCity] = (0, import_react.useState)(customer?.city || "");
	const [region, setRegion] = (0, import_react.useState)(customer?.region || "");
	const [postal, setPostal] = (0, import_react.useState)(customer?.postal || "");
	const [notice, setNotice] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => saveShopProfile({ data: {
			token,
			name,
			phone,
			address,
			city,
			region,
			postal,
			country: customer?.country || "United States"
		} }),
		onSuccess: () => setNotice("Account saved."),
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
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [user?.primaryEmail || customer?.email, ". Password changes stay with the sign-in provider you used."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				onChange: (event) => setName(event.target.value),
				required: true,
				placeholder: "Name",
				"aria-label": "Name",
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
				value: address,
				onChange: (event) => setAddress(event.target.value),
				placeholder: "Billing address",
				"aria-label": "Address",
				className: "h-11 rounded-xl border border-line bg-surface px-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: city,
						onChange: (event) => setCity(event.target.value),
						placeholder: "City",
						"aria-label": "City",
						className: "h-11 rounded-xl border border-line bg-surface px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: region,
						onChange: (event) => setRegion(event.target.value),
						placeholder: "State",
						"aria-label": "State",
						className: "h-11 rounded-xl border border-line bg-surface px-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: postal,
						onChange: (event) => setPostal(event.target.value),
						placeholder: "Postal",
						"aria-label": "Postal code",
						className: "h-11 rounded-xl border border-line bg-surface px-3"
					})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: save.isPending,
				className: "h-11 rounded-xl bg-ink text-sm font-semibold text-white disabled:opacity-50",
				children: "Save account"
			})
		]
	});
}
//#endregion
export { AccountPage as component };
