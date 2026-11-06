import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as signIn, n as authReturnUrl, t as authClient } from "./client-Dl8dG0gA.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as GROK_PROVIDERS } from "./server-oQb26vs1.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { h as getSessionHome, rt as saveCustomerSignup } from "./api-CEXWu3z6.mjs";
import { n as useCurrentUserState } from "./use-current-user-D9YQRpMJ.mjs";
import { n as Boot, o as Field, r as Button, s as Input } from "./ui-kHtDn7EO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-s8ESfCao.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Whether Auth0 is configured. Never returns the client id or secret. */
var getSignInOptions = createServerFn({ method: "GET" }).handler(createSsrRpc("86cd889593b62f1d3e2f3717c73b538effca0f26b68aa7c7b507ad486d7d2dfe"));
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 18 18",
		className: "size-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"
			})
		]
	});
}
function MicrosoftMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 18 18",
		className: "size-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#F25022",
				d: "M1 1h7.5v7.5H1z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#7FBA00",
				d: "M9.5 1H17v7.5H9.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#00A4EF",
				d: "M1 9.5h7.5V17H1z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FFB900",
				d: "M9.5 9.5H17V17H9.5z"
			})
		]
	});
}
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [business, setBusiness] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [interests, setInterests] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const options = useQuery({
		queryKey: ["sign-in-options"],
		queryFn: () => getSignInOptions()
	});
	const home = useQuery({
		queryKey: ["session-home", user?.id],
		queryFn: () => getSessionHome(),
		enabled: Boolean(user)
	});
	const auth0 = Boolean(options.data?.auth0);
	if (isPending || user && home.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: home.data?.destination === "admin" ? "/" : "/portal" });
	async function startProvider(providerId) {
		setError("");
		setBusy(true);
		try {
			await signIn(providerId, {
				callbackURL: authReturnUrl(),
				errorCallbackURL: authReturnUrl()
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not sign in.");
			setBusy(false);
		}
	}
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
					callbackURL: "/portal"
				});
				if (result.error) {
					setError(result.error.message ?? "Could not create the account.");
					return;
				}
				await saveCustomerSignup({ data: {
					business,
					phone,
					address,
					city,
					interests
				} });
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/portal"
				});
				if (result.error) {
					setError(result.error.message ?? "Could not sign in.");
					return;
				}
			}
			const next = await getSessionHome();
			navigate({ to: next.destination === "admin" ? "/" : "/portal" });
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not sign in.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-ink px-12 py-14 text-white lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-9 w-9 place-items-center rounded-lg bg-white text-xs font-semibold text-ink",
						children: "MT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Manage Tech Service"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "max-w-md text-4xl font-semibold leading-tight tracking-tight",
					children: "Welcome to MTS User Portal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-md text-lg leading-8 text-white/80",
					children: "One place to submit support tickets, track orders, and manage support requests."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-white/60",
					children: "Invite only. Accounts are added from Microsoft 365."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center bg-bg px-4 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[400px] rounded-xl border border-line bg-surface p-6 shadow-[0_1px_0_rgba(0,0,0,0.05)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 flex items-center gap-2.5 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-9 w-9 place-items-center rounded-lg bg-ink text-xs font-semibold text-white",
							children: "MT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold leading-tight",
							children: "MTS User Portal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Invite only"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold tracking-tight",
						children: "Welcome to MTS User Portal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: "One place to submit support tickets, track orders, and manage support requests."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-2",
						children: [auth0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							disabled: busy,
							onClick: () => startProvider("auth0"),
							children: "Continue with Auth0"
						}) : null, GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							disabled: busy,
							onClick: () => startProvider(provider.providerId),
							children: [
								provider.idp === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicrosoftMark, {}),
								"Continue with ",
								provider.label
							]
						}, provider.providerId))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-5 flex items-center gap-3 text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" }),
							"Email",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
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
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Company",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: business,
										onChange: (event) => setBusiness(event.target.value),
										required: true,
										autoComplete: "organization"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: phone,
										onChange: (event) => setPhone(event.target.value),
										required: true,
										autoComplete: "tel"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Address",
									hint: "Optional.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: address,
										onChange: (event) => setAddress(event.target.value),
										autoComplete: "street-address"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "City",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: city,
										onChange: (event) => setCity(event.target.value),
										autoComplete: "address-level2"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
										className: "text-xs font-medium text-muted",
										children: "Interested in"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											"Managed IT",
											"Cloud",
											"Phone",
											"Internet",
											"Microsoft 365",
											"Hardware"
										].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: interests.includes(item),
												onChange: () => setInterests((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])
											}), item]
										}, item))
									})]
								})
							] }) : null,
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-bad",
								role: "alert",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "Working" : "Continue with email"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-[13px] leading-5 text-muted",
						children: [
							"This portal is invite only. Microsoft 365 accounts are added by your administrator.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "font-semibold text-accent",
								href: "https://access.virtualcloudgroup.com/auth/signup",
								children: "Request access"
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
