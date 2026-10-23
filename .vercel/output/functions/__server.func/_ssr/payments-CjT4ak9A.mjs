import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as paymentLabel } from "./format-50WTgpEd.mjs";
import { V as testAlternative, W as testPayments, j as savePayments, o as getPayments } from "./api-DpH0j9Yg.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, h as Toggle, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-scpx6tUJ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-CjT4ak9A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PaymentsPage() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["payments"],
		queryFn: () => getPayments()
	});
	const [cardEnabled, setCardEnabled] = (0, import_react.useState)(false);
	const [invoiceEnabled, setInvoiceEnabled] = (0, import_react.useState)(true);
	const [purchaseOrderEnabled, setPurchaseOrderEnabled] = (0, import_react.useState)(true);
	const [publishableKey, setPublishableKey] = (0, import_react.useState)("");
	const [secretKey, setSecretKey] = (0, import_react.useState)("");
	const [clearSecret, setClearSecret] = (0, import_react.useState)(false);
	const [invoiceTerms, setInvoiceTerms] = (0, import_react.useState)("Net 30");
	const [requirePo, setRequirePo] = (0, import_react.useState)(false);
	const [alternativeEnabled, setAlternativeEnabled] = (0, import_react.useState)(true);
	const [alternativeClientId, setAlternativeClientId] = (0, import_react.useState)("");
	const [alternativeClientSecret, setAlternativeClientSecret] = (0, import_react.useState)("");
	const [clearAlternativeSecret, setClearAlternativeSecret] = (0, import_react.useState)(false);
	const [alternativeEnvironment, setAlternativeEnvironment] = (0, import_react.useState)("sandbox");
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setCardEnabled(query.data.cardEnabled);
		setInvoiceEnabled(query.data.invoiceEnabled);
		setPurchaseOrderEnabled(query.data.purchaseOrderEnabled);
		setPublishableKey(query.data.publishableKey);
		setSecretKey("");
		setClearSecret(false);
		setInvoiceTerms(query.data.invoiceTerms);
		setRequirePo(query.data.requirePo);
		setAlternativeEnabled(query.data.alternativeEnabled);
		setAlternativeClientId(query.data.alternativeClientId);
		setAlternativeClientSecret("");
		setClearAlternativeSecret(false);
		setAlternativeEnvironment(query.data.alternativeEnvironment);
	}, [query.data]);
	function refresh() {
		client.invalidateQueries({ queryKey: ["payments"] });
	}
	const save = useMutation({
		mutationFn: () => savePayments({ data: {
			cardEnabled,
			invoiceEnabled,
			purchaseOrderEnabled,
			publishableKey,
			secretKey,
			clearSecret,
			invoiceTerms,
			requirePo,
			alternativeEnabled,
			alternativeClientId,
			alternativeClientSecret,
			clearAlternativeSecret,
			alternativeEnvironment
		} }),
		onSuccess: () => {
			toast.success("Payment methods saved");
			setSecretKey("");
			refresh();
		},
		onError: (error) => toast.error(errorText(error))
	});
	const test = useMutation({
		mutationFn: () => testPayments(),
		onSuccess: (result) => {
			toast.success(`Stripe connected · ${result.name}`);
			refresh();
		},
		onError: (error) => {
			toast.error(errorText(error));
			refresh();
		}
	});
	const testAlternativeConnection = useMutation({
		mutationFn: () => testAlternative(),
		onSuccess: (result) => {
			toast.success(result.mode === "sandbox" ? "Sandbox connected" : "Live account connected");
			refresh();
		},
		onError: (error) => {
			toast.error(errorText(error));
			refresh();
		}
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	const data = query.data;
	const tone = data.lastStatus === "connected" || data.lastStatus === "ready" ? "good" : data.lastStatus === "error" ? "bad" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Checkout",
		title: "Payments",
		description: "Turn on Alternative Payments, card, invoice, or purchase order."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-4",
			onSubmit: (event) => {
				event.preventDefault();
				save.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Card"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: "Stripe. Set STRIPE_SECRET_KEY on the server, or paste a secret key here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: cardEnabled,
							onCheckedChange: setCardEnabled,
							label: "Accept card payments"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Publishable key",
								hint: data.fromEnv && data.publishableKey ? "Taken from STRIPE_PUBLISHABLE_KEY when that variable is set." : "Starts with pk_. Safe to store.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: publishableKey,
									onChange: (event) => setPublishableKey(event.target.value),
									autoComplete: "off",
									placeholder: "pk_live_…"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Secret key",
								hint: data.fromEnv ? "Taken from STRIPE_SECRET_KEY. It stays on the server." : data.secretSet && !clearSecret ? "A secret is already stored. Leave this blank to keep it." : "Starts with sk_. It is not shown again.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: secretKey,
									onChange: (event) => setSecretKey(event.target.value),
									autoComplete: "new-password",
									placeholder: data.secretSet ? "••••••••" : "sk_live_…",
									readOnly: data.fromEnv
								})
							}),
							data.fromEnv ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: clearSecret,
								onCheckedChange: setClearSecret,
								label: "Remove the stored secret"
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Alternative Payments"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: [
							"Checkout opens at",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://go.alternativepayments.io",
								className: "text-info underline-offset-2 hover:underline",
								target: "_blank",
								rel: "noreferrer",
								children: "go.alternativepayments.io"
							}),
							". Add API keys to create a customer, an invoice, and a payment link for each order."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: alternativeEnabled,
								onCheckedChange: setAlternativeEnabled,
								label: "Accept Alternative Payments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Environment",
								hint: data.alternativeEnvironmentLocked ? "Set with ALTERNATIVE_ENV. sandbox is the demo host. Use live for production." : "Sandbox uses the demo API. Switch to live only with production keys.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: alternativeEnvironment,
									disabled: data.alternativeEnvironmentLocked,
									onChange: (event) => setAlternativeEnvironment(event.target.value === "live" ? "live" : "sandbox"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "sandbox",
										children: "Sandbox"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "live",
										children: "Live"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Client id",
								hint: data.alternativeFromEnv ? "Taken from ALTERNATIVE_CLIENT_ID." : "From the Alternative Payments partner dashboard.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: alternativeClientId,
									onChange: (event) => setAlternativeClientId(event.target.value),
									autoComplete: "off",
									readOnly: data.alternativeFromEnv
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Client secret",
								hint: data.alternativeFromEnv ? "Taken from ALTERNATIVE_CLIENT_SECRET." : data.alternativeSecretSet && !clearAlternativeSecret ? "A secret is already stored. Leave this blank to keep it." : "Stored on the server. It is not shown again.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: alternativeClientSecret,
									onChange: (event) => setAlternativeClientSecret(event.target.value),
									autoComplete: "new-password",
									placeholder: data.alternativeSecretSet ? "••••••••" : "",
									readOnly: data.alternativeFromEnv
								})
							}),
							data.alternativeFromEnv ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: clearAlternativeSecret,
								onCheckedChange: setClearAlternativeSecret,
								label: "Remove the stored secret"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								disabled: testAlternativeConnection.isPending,
								onClick: () => testAlternativeConnection.mutate(),
								children: testAlternativeConnection.isPending ? "Checking" : "Test Alternative Payments"
							}) }),
							data.alternativeError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-bad",
								children: data.alternativeError
							}) : null,
							data.alternativeStatus === "connected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-good",
								children: "Connected"
							}) : null
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Invoice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: "Bill the company on terms. No card is charged."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: invoiceEnabled,
							onCheckedChange: setInvoiceEnabled,
							label: "Accept invoices"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Terms",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: invoiceTerms,
								onChange: (event) => setInvoiceTerms(event.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Net 15" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Net 30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Net 45" })
								]
							})
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Purchase order"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: "Accept a PO number in the order notes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: purchaseOrderEnabled,
							onCheckedChange: setPurchaseOrderEnabled,
							label: "Accept purchase orders"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: requirePo,
							onCheckedChange: setRequirePo,
							label: "Require a PO number in the notes"
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: save.isPending ? "Saving" : "Save methods"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						disabled: test.isPending,
						onClick: () => test.mutate(),
						children: test.isPending ? "Checking" : "Test Stripe"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Stripe"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone,
						children: data.lastStatus || "not connected"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[13px] text-muted",
					children: data.accountName || "No Stripe account confirmed yet."
				}),
				data.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[13px] text-bad",
					children: data.lastError
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Available on orders"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line text-[13px]",
				children: data.methods.length ? data.methods.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: paymentLabel(method)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: method === "invoice" ? data.invoiceTerms : method === "card" ? "Stripe" : method === "alternative" ? data.alternativeEnvironment === "sandbox" ? "Sandbox" : "Live" : data.requirePo ? "PO required" : "Optional"
					})]
				}, method)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-2 text-muted",
					children: "Turn on at least one method."
				})
			})] })]
		})]
	})] });
}
//#endregion
export { PaymentsPage as component };
