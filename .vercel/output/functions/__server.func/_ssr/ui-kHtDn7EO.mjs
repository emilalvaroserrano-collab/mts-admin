import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { j as LayoutGrid, k as List, t as X } from "../_libs/lucide-react.mjs";
import { n as SwitchThumb, t as Switch } from "../_libs/@radix-ui/react-switch+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-kHtDn7EO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonStyles = cva("inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)] transition-colors disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			primary: "bg-accent text-white hover:bg-[#0c6368]",
			secondary: "border border-line-strong bg-surface text-ink shadow-none hover:bg-surface-2",
			ghost: "text-ink shadow-none hover:bg-surface-2",
			danger: "border border-bad/20 bg-bad-soft text-bad shadow-none hover:opacity-90"
		},
		size: {
			md: "h-8 px-3",
			sm: "h-7 px-2.5"
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
var fieldClass = "h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink outline-none placeholder:text-subtle";
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
			className: "fixed inset-x-0 bottom-0 z-50 max-h-[92vh] w-full overflow-auto rounded-t-3xl border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.16)] outline-none sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-base font-semibold text-ink",
					children: title
				}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-sm text-muted",
					children: description
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "grid size-7 place-items-center rounded-lg text-muted hover:bg-surface-2",
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
		className: "flex min-w-0 flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 max-w-full",
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase",
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 break-words text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]",
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl break-words text-sm text-muted",
					children: description
				}) : null
			]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "admin-actions flex flex-wrap gap-2",
			children: actions
		}) : null]
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("grid min-w-0 max-w-full content-start gap-3 overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] break-words", className),
		children
	});
}
function useViewMode(key, fallback = "grid") {
	const [mode, setMode] = (0, import_react.useState)(fallback);
	(0, import_react.useEffect)(() => {
		const saved = window.localStorage.getItem(key);
		if (saved === "grid" || saved === "list") setMode(saved);
	}, [key]);
	function choose(next) {
		setMode(next);
		window.localStorage.setItem(key, next);
	}
	return [mode, choose];
}
function ViewSwitch({ mode, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 rounded-lg border border-line bg-surface p-0.5",
		role: "group",
		"aria-label": "Layout",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": mode === "grid",
			"aria-label": "Grid view",
			onClick: () => onChange("grid"),
			className: mode === "grid" ? "grid size-11 place-items-center rounded-md bg-ink text-white md:size-8" : "grid size-11 place-items-center rounded-md text-muted md:size-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": mode === "list",
			"aria-label": "List view",
			onClick: () => onChange("list"),
			className: mode === "list" ? "grid size-11 place-items-center rounded-md bg-ink text-white md:size-8" : "grid size-11 place-items-center rounded-md text-muted md:size-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
		})]
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
				className: "text-sm font-semibold text-ink",
				children: "Manage Tech Service"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: "Opening admin"
			})]
		})
	});
}
function errorText(error) {
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong.";
}
//#endregion
export { errorText as _, ErrorNote as a, Loading as c, Panel as d, Select as f, ViewSwitch as g, Toggle as h, Empty as i, Modal as l, Textarea as m, Boot as n, Field as o, StatusBadge as p, Button as r, Input as s, Badge as t, PageHeader as u, useViewMode as v };
