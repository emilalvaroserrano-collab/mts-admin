import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { tt as saveCampaign } from "./api-CEXWu3z6.mjs";
import { _ as errorText, d as Panel, o as Field, r as Button, s as Input, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campaigns-BEzz0Bb2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CampaignAdmin() {
	const client = useQueryClient();
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("all");
	const [ctaLabel, setCtaLabel] = (0, import_react.useState)("");
	const [ctaHref, setCtaHref] = (0, import_react.useState)("/portal/services");
	const save = useMutation({
		mutationFn: () => saveCampaign({ data: {
			title,
			body,
			audience,
			ctaLabel,
			ctaHref
		} }),
		onSuccess: () => {
			toast.success("Campaign published");
			setTitle("");
			setBody("");
			client.invalidateQueries({ queryKey: ["campaigns"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Customers",
			title: "Campaigns",
			description: "Customers only see a campaign when it matches their access. All, shop, or business."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "grid max-w-xl gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: title,
						onChange: (event) => setTitle(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Message",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: body,
						onChange: (event) => setBody(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Audience",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: audience,
						onChange: (event) => setAudience(event.target.value),
						className: "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Everyone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "shop",
								children: "Shop customers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "business",
								children: "Business accounts"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Button label",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ctaLabel,
						onChange: (event) => setCtaLabel(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Button link",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ctaHref,
						onChange: (event) => setCtaHref(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: save.isPending,
					onClick: () => save.mutate(),
					children: "Publish"
				})
			]
		})]
	});
}
//#endregion
export { CampaignAdmin as component };
