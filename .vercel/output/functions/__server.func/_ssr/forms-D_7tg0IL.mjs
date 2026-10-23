import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as listForms, k as testForm, p as listOrgs, x as saveForm } from "./api-PAGCofpy.mjs";
import { a as ErrorNote, c as Loading, d as Panel, f as Select, g as errorText, h as Toggle, l as Modal, o as Field, r as Button, s as Input, t as Badge, u as PageHeader } from "./ui-V14V10_q.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forms-D_7tg0IL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blank = () => ({
	id: 0,
	name: "",
	category: "",
	subcategory: "",
	zendeskField: "",
	requiredFields: ["subject"],
	restricted: false,
	active: true
});
function FormsPage() {
	const client = useQueryClient();
	const navigate = useNavigate();
	const forms = useQuery({
		queryKey: ["forms"],
		queryFn: () => listForms()
	});
	const orgs = useQuery({
		queryKey: ["orgs"],
		queryFn: () => listOrgs()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [fieldsText, setFieldsText] = (0, import_react.useState)("subject");
	const [formId, setFormId] = (0, import_react.useState)("");
	const [organizationId, setOrganizationId] = (0, import_react.useState)("");
	const [asRegular, setAsRegular] = (0, import_react.useState)(true);
	const [values, setValues] = (0, import_react.useState)({});
	const save = useMutation({
		mutationFn: (form) => saveForm({ data: {
			id: form.id || void 0,
			name: form.name,
			category: form.category,
			subcategory: form.subcategory,
			zendeskField: form.zendeskField,
			requiredFields: form.requiredFields,
			restricted: form.restricted,
			active: form.active
		} }),
		onSuccess: () => {
			toast.success("Form saved");
			setDraft(null);
			client.invalidateQueries({ queryKey: ["forms"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	const test = useMutation({
		mutationFn: () => testForm({ data: {
			formId: Number(formId),
			organizationId: Number(organizationId),
			fields: values,
			asRegular
		} }),
		onSuccess: (result) => {
			if (result.warning) toast.error(`Ticket saved here. ${result.warning}`);
			else toast.success("Test ticket created");
			client.invalidateQueries({ queryKey: ["tickets"] });
			client.invalidateQueries({ queryKey: ["dashboard"] });
			navigate({
				to: "/tickets/$ticketId",
				params: { ticketId: String(result.ticketId) }
			});
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (forms.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (forms.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: forms.error.message });
	const chosen = forms.data.find((form) => form.id === formId);
	function open(form) {
		setDraft(form);
		setFieldsText(form.requiredFields.join(", "));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Intake",
			title: "Ticket forms",
			description: "Categories the desk accepts, the Zendesk field they map to, and who is allowed to use them.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => open(blank()),
				children: "Add form"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: forms.data.map((form) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => open(form),
				className: "rounded-2xl border border-line bg-surface p-4 text-left hover:bg-surface-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: form.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							form.category || "Uncategorized",
							form.subcategory ? ` · ${form.subcategory}` : "",
							form.zendeskField ? ` · ${form.zendeskField}` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [form.restricted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "warn",
							children: "Authorized only"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Open" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: form.active ? "good" : "neutral",
							children: form.active ? "Active" : "Off"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted",
					children: ["Required: ", form.requiredFields.join(", ") || "none"]
				})]
			}, form.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Test a submission"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Writes a portal ticket, and a Zendesk ticket when the connection is live."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						test.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Form",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formId,
									onChange: (event) => {
										const next = event.target.value ? Number(event.target.value) : "";
										setFormId(next);
										setValues({});
									},
									required: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choose"
									}), forms.data.filter((form) => form.active).map((form) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: form.id,
										children: form.name
									}, form.id))]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Company",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: organizationId,
									onChange: (event) => setOrganizationId(event.target.value ? Number(event.target.value) : ""),
									required: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choose"
									}), (orgs.data ?? []).map((org) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: org.id,
										children: org.name
									}, org.id))]
								})
							})]
						}),
						(chosen?.requiredFields ?? ["subject"]).map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: field,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: values[field] ?? "",
								onChange: (event) => setValues({
									...values,
									[field]: event.target.value
								}),
								required: true
							})
						}, field)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: asRegular,
							onCheckedChange: setAsRegular,
							label: "Submit as a regular customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: test.isPending,
							children: test.isPending ? "Submitting" : "Create test ticket"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: Boolean(draft),
			onOpenChange: (openState) => {
				if (!openState) setDraft(null);
			},
			title: draft?.id ? "Edit form" : "Add form",
			children: draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					const requiredFields = fieldsText.split(",").map((field) => field.trim()).filter(Boolean);
					save.mutate({
						...draft,
						requiredFields
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.name,
							onChange: (event) => setDraft({
								...draft,
								name: event.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Category",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.category,
								onChange: (event) => setDraft({
									...draft,
									category: event.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Subcategory",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.subcategory,
								onChange: (event) => setDraft({
									...draft,
									subcategory: event.target.value
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zendesk field",
						hint: "The custom field key this form writes to.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.zendeskField,
							onChange: (event) => setDraft({
								...draft,
								zendeskField: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Required fields",
						hint: "Comma separated. subject is used as the ticket title.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: fieldsText,
							onChange: (event) => setFieldsText(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.restricted,
						onCheckedChange: (restricted) => setDraft({
							...draft,
							restricted
						}),
						label: "Authorized customers only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: draft.active,
						onCheckedChange: (active) => setDraft({
							...draft,
							active
						}),
						label: "Active"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: save.isPending ? "Saving" : "Save form"
					})
				]
			}) : null
		})
	] });
}
//#endregion
export { FormsPage as component };
