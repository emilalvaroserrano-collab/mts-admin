import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { n as SwitchThumb, t as Switch } from "../_libs/@radix-ui/react-switch+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-V14V10_q.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonStyles = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
			ghost: "text-ink hover:bg-surface-2",
			danger: "border border-bad/30 bg-bad-soft text-bad hover:opacity-90"
		},
		size: {
			md: "h-11 px-4",
			sm: "h-9 px-3"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonStyles({
			variant,
			size
		}), className),
		...props
	});
}
var fieldClass = "h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-subtle";
function Input(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: cn(fieldClass, props.className)
	});
}
function Textarea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: cn(fieldClass, "h-auto min-h-28 py-3", props.className)
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: cn(fieldClass, "pr-8", props.className)
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-ink",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
var tones = {
	neutral: "bg-surface-2 text-muted",
	good: "bg-good-soft text-good",
	warn: "bg-warn-soft text-warn",
	bad: "bg-bad-soft text-bad",
	info: "bg-info-soft text-info",
	pine: "bg-accent-soft text-accent"
};
function Badge({ tone = "neutral", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone]),
		children
	});
}
var statusTone = {
	new: "info",
	incoming: "info",
	open: "pine",
	pending: "warn",
	solved: "good",
	closed: "neutral",
	approved: "info",
	processing: "warn",
	fulfilled: "good",
	cancelled: "bad",
	denied: "bad",
	urgent: "bad",
	high: "warn",
	normal: "neutral",
	low: "neutral",
	active: "good",
	inactive: "neutral"
};
function StatusBadge({ value }) {
	const key = value.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: statusTone[key] ?? "neutral",
		children: value
	});
}
function Modal({ open, onOpenChange, title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed top-1/2 left-1/2 z-50 max-h-[calc(100vh-2rem)] w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-5 outline-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-3xl leading-tight text-ink",
					children: title
				}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-sm text-muted",
					children: description
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "grid h-11 w-11 place-items-center rounded-md text-muted hover:bg-surface-2",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children
			})]
		})] })
	});
}
function Toggle({ checked, onCheckedChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-ink",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange,
			"aria-label": label,
			className: "relative h-6 w-11 shrink-0 rounded-full bg-line-strong data-[state=checked]:bg-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "block size-5 translate-x-0.5 rounded-full bg-surface transition-transform duration-150 data-[state=checked]:translate-x-5" })
		})]
	});
}
function PageHeader({ eyebrow, title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-muted",
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl leading-tight tracking-tight text-ink",
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: description
				}) : null
			]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: actions
		}) : null]
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-2xl border border-line bg-surface p-5", className),
		children
	});
}
function Loading({ label = "Loading the desk" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		"aria-busy": "true",
		"aria-label": label,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 animate-pulse rounded-md bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-surface-2" })
		]
	});
}
function ErrorNote({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad",
		role: "alert",
		children: message
	});
}
function Empty({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-line-strong px-4 py-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-ink",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: body
		})]
	});
}
function Boot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-bg px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl text-ink",
				children: "ManageTech"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Opening the desk"
			})]
		})
	});
}
function errorText(error) {
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong.";
}
//#endregion
export { ErrorNote as a, Loading as c, Panel as d, Select as f, errorText as g, Toggle as h, Empty as i, Modal as l, Textarea as m, Boot as n, Field as o, StatusBadge as p, Button as r, Input as s, Badge as t, PageHeader as u };
