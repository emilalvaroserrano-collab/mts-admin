import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Boot, o as Field, r as Button, s as Input } from "./ui-V14V10_q.mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-uV7TznTk.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B9zsT_IA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(event) {
		event.preventDefault();
		setError("");
		setBusy(true);
		try {
			if (mode === "up") {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: "/"
				});
				if (result.error) {
					setError(result.error.message ?? "Could not create the account.");
					return;
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (result.error) {
					setError(result.error.message ?? "Could not sign in.");
					return;
				}
			}
			navigate({ to: "/" });
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not sign in.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-accent px-10 py-12 text-accent-fg lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl",
					children: "ManageTech"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "max-w-md font-display text-5xl leading-tight",
					children: "The desk for companies we already support."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-8 max-w-sm space-y-4 text-sm text-accent-fg/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Zendesk stays the system of record for support tickets." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Companies, permissions, equipment, and orders live here." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Every change stays inside the companies a person is allowed to see." })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-accent-fg/70",
					children: "Staff sign in with Google, X, or email."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center px-4 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl text-ink lg:hidden",
						children: "ManageTech"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-ink",
						children: "Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Admin access for the service desk."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
							children: ["Continue with ", provider.label]
						}, provider.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-3",
						onSubmit: submit,
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: name,
									onChange: (event) => setName(event.target.value),
									required: true,
									autoComplete: "name"
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									required: true,
									autoComplete: "email"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Password",
								hint: "At least 8 characters.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: password,
									onChange: (event) => setPassword(event.target.value),
									required: true,
									minLength: 8,
									autoComplete: mode === "up" ? "new-password" : "current-password"
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-bad",
								role: "alert",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "Working" : mode === "up" ? "Create staff account" : "Sign in with email"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 text-sm text-muted underline-offset-2 hover:underline",
						onClick: () => {
							setMode(mode === "in" ? "up" : "in");
							setError("");
						},
						children: mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
