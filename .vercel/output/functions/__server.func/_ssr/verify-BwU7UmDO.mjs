import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { W as portalVerify } from "./api-CEXWu3z6.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { d as Route$25 } from "./router-DN3-t_kz.mjs";
import { t as setShopToken } from "./shop-session-BlA38aat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-BwU7UmDO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VerifyPage() {
	const search = Route$25.useSearch();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)(search.email);
	const [code, setCode] = (0, import_react.useState)(search.code);
	const [error, setError] = (0, import_react.useState)("");
	const verify = useMutation({
		mutationFn: () => portalVerify({ data: {
			email,
			code
		} }),
		onSuccess: (result) => {
			setShopToken(result.token);
			navigate({ to: "/portal" });
		},
		onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not verify.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-[#f7fafb] px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid w-full max-w-md gap-4 rounded-3xl border border-line bg-white p-6",
			onSubmit: (event) => {
				event.preventDefault();
				setError("");
				verify.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Verify your email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Enter the 6-digit code. If mail is connected it was sent from noreply. If not, the code is shown here for the demo."
				}),
				search.code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl bg-accent-soft px-3 py-2 text-sm",
					children: ["Demo code: ", search.code]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: email,
					onChange: (event) => setEmail(event.target.value),
					type: "email",
					required: true,
					className: "h-12 rounded-xl border border-line px-3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: code,
					onChange: (event) => setCode(event.target.value),
					inputMode: "numeric",
					required: true,
					placeholder: "6-digit code",
					className: "h-12 rounded-xl border border-line px-3"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-bad",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: verify.isPending,
					className: "h-12 rounded-xl bg-ink text-sm font-semibold text-white",
					children: "Verify and sign in"
				})
			]
		})
	});
}
//#endregion
export { VerifyPage as component };
