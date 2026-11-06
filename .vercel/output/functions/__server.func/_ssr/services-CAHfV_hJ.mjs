import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { L as listServiceDesk, vt as setServiceStatus } from "./api-CEXWu3z6.mjs";
import { _ as errorText, a as ErrorNote, c as Loading, d as Panel, u as PageHeader } from "./ui-kHtDn7EO.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-CAHfV_hJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"requested",
	"quoted",
	"approved",
	"provisioning",
	"active",
	"declined"
];
function ServicesDesk() {
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["service-desk"],
		queryFn: () => listServiceDesk()
	});
	const [note, setNote] = (0, import_react.useState)({});
	const save = useMutation({
		mutationFn: setServiceStatus,
		onSuccess: () => {
			toast.success("Request updated");
			client.invalidateQueries({ queryKey: ["service-desk"] });
		},
		onError: (error) => toast.error(errorText(error))
	});
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: query.error.message });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Services",
			title: "Service requests",
			description: "Quotes and provisioning for managed IT, cloud, projects, Microsoft 365, phone, and internet. Hardware stays in the shop."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [query.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No service requests yet."
			}) }) : null, query.data.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: item.serviceName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									item.category,
									" · ",
									item.customer || item.email,
									" · ",
									item.organization || "No company"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase text-accent",
							children: item.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: item.details
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								defaultValue: item.status,
								"aria-label": "Status",
								className: "h-10 rounded-xl border border-line px-2 text-sm",
								onChange: (event) => save.mutate({ data: {
									id: item.id,
									status: event.target.value,
									quoteNote: note[item.id] ?? item.quoteNote
								} }),
								children: STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: status }, status))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: note[item.id] ?? item.quoteNote,
								onChange: (event) => setNote((current) => ({
									...current,
									[item.id]: event.target.value
								})),
								placeholder: "Quote or provisioning note",
								className: "h-10 rounded-xl border border-line px-3 text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-10 rounded-full bg-ink px-4 text-xs font-semibold text-white",
								onClick: () => save.mutate({ data: {
									id: item.id,
									status: item.status,
									quoteNote: note[item.id] ?? item.quoteNote
								} }),
								children: "Save note"
							})
						]
					})
				]
			}, item.id))]
		})]
	});
}
//#endregion
export { ServicesDesk as component };
