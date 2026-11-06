//#region node_modules/.nitro/vite/services/ssr/assets/sarah-state-BYf1YbMx.js
var NEXT = {
	requested: ["validating", "cancelled"],
	validating: [
		"awaiting_confirmation",
		"executing",
		"failed",
		"cancelled"
	],
	awaiting_confirmation: ["executing", "cancelled"],
	executing: [
		"succeeded",
		"failed",
		"checking_status"
	],
	checking_status: [
		"succeeded",
		"failed",
		"manual_review"
	],
	succeeded: [],
	failed: [],
	cancelled: [],
	manual_review: [
		"checking_status",
		"succeeded",
		"failed"
	]
};
function allowTransition(from, to) {
	if (from === to) return true;
	const next = NEXT[from];
	return Boolean(next?.includes(to));
}
function reconcileDecision(input) {
	if (input.resourceFound && (input.status === "executing" || input.status === "checking_status")) return "succeeded";
	if ((input.status === "executing" || input.status === "checking_status") && input.ageMs >= 6e5) return "manual_review";
	if (input.status === "executing" && input.ageMs >= 2e4) return "checking_status";
	return null;
}
function confirmationFresh(ageMs) {
	return ageMs >= 0 && ageMs < 18e5;
}
function listPick(text) {
	const q = text.toLowerCase();
	if (!/\b(open|go to|take me to)\b/.test(q) || !/\b(ticket|one|first|second|third)\b/.test(q)) return null;
	if (/\b(first|1st)\b/.test(q)) return 0;
	if (/\b(second|2nd)\b/.test(q)) return 1;
	if (/\b(third|3rd)\b/.test(q)) return 2;
	const word = q.match(/\bticket\s*#?\s*(\d+)\b/);
	if (!word) return null;
	const index = Number(word[1]) - 1;
	return index >= 0 && index < 20 ? index : null;
}
function quoteFor(planned) {
	if (planned.tool === "order_service" && planned.offering === "voip-ext") return {
		title: "VoIP extension",
		detail: "Added to the Telxent bill only after Telxent confirms. It is not active yet.",
		amount: "$18 per month"
	};
	if (planned.tool === "order_service" && planned.offering === "wiring") {
		const drops = Math.min(50, Math.max(1, planned.drops || 1));
		return {
			title: "Wiring",
			detail: `${drops} drop${drops === 1 ? "" : "s"} at $175. Not billed until the desk confirms the work.`,
			amount: `$${drops * 175}`
		};
	}
	if (planned.tool === "update_contact" && planned.phone) return {
		title: "Phone number",
		detail: "This replaces the number on the account.",
		amount: planned.phone
	};
	return null;
}
function followUp(text, slots) {
	const q = text.toLowerCase();
	if (/\b(cancel that|never mind)\b/.test(q)) return { cancel: true };
	if (!slots.offering) return null;
	const count = q.match(/\b(?:make it|change it to|change to)\s+(\d{1,2})\b/);
	if (!count) return null;
	return { drops: Math.min(50, Math.max(1, Number(count[1]))) };
}
//#endregion
export { quoteFor as a, listPick as i, confirmationFresh as n, reconcileDecision as o, followUp as r, allowTransition as t };
