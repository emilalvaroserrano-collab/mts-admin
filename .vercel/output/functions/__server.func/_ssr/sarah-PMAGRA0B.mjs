import { r as __exportAll } from "../_runtime.mjs";
import { c as __exportAll$1, r as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { o as reconcileDecision, t as allowTransition } from "./sarah-state-BYf1YbMx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sarah-PMAGRA0B.js
var sarah_PMAGRA0B_exports = /* @__PURE__ */ __exportAll({
	a: () => speakSarah,
	i: () => sarah_exports,
	n: () => getSarahQuote,
	r: () => hearSarah,
	t: () => askSarah
});
var sarah_exports = /* @__PURE__ */ __exportAll$1({
	askSarah: () => askSarah,
	getSarahQuote: () => getSarahQuote,
	hearSarah: () => hearSarah,
	speakSarah: () => speakSarah,
	sweepSarahActions: () => sweepSarahActions
});
function s(row, key) {
	const value = row?.[key];
	return value == null ? "" : String(value);
}
function n(row, key) {
	const value = Number(row?.[key] ?? 0);
	return Number.isFinite(value) ? value : 0;
}
async function logEvent(sql, actionId, from, to, detail) {
	if (!allowTransition(from, to) && from) return;
	await sql`
    insert into agent_action_events (id, action_id, from_status, to_status, detail)
    values (${crypto.randomUUID()}, ${actionId}, ${from}, ${to}, ${detail.slice(0, 300)})
  `;
}
async function moveOpenActions(sql, customerId) {
	if (process.env.SARAH_ACTION_ENGINE === "0") return "";
	const rows = customerId == null ? await sql`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where status in ('executing', 'checking_status')
        order by updated_at asc
        limit 40
      ` : await sql`
        select id, customer_id, status, tool_name, parameters_json, updated_at
        from agent_actions
        where customer_id = ${customerId} and status in ('executing', 'checking_status')
        order by updated_at desc
        limit 5
      `;
	let notice = "";
	for (const row of rows) {
		const status = s(row, "status");
		const owner = n(row, "customer_id");
		const ageMs = Date.now() - new Date(s(row, "updated_at") || Date.now()).getTime();
		let found = false;
		if (s(row, "tool_name") === "order_service") try {
			const planned = JSON.parse(s(row, "parameters_json"));
			if (planned.tool === "order_service") {
				const hit = await sql`
            select id from service_requests
            where shop_customer_id = ${owner} and category = ${planned.offering}
              and created_at > now() - interval '20 minutes'
            limit 1
          `;
				found = Boolean(hit[0]);
			}
		} catch {
			found = false;
		}
		const next = reconcileDecision({
			status,
			ageMs: Number.isFinite(ageMs) ? ageMs : 0,
			resourceFound: found
		});
		if (!next || next === status) continue;
		if (!allowTransition(status, next)) continue;
		await sql`update agent_actions set status = ${next}, updated_at = now() where id = ${s(row, "id")}`;
		await logEvent(sql, s(row, "id"), status, next, found ? "Matched an existing request." : "No confirmed result yet.");
		if (next === "checking_status") notice = "I'm still checking whether that last request went through.";
		if (next === "manual_review") notice = "I can't confirm that last request yet, so the desk will check it.";
		if (next === "succeeded") notice = "That earlier request did go through. I didn't send it again.";
	}
	return notice;
}
async function sweepSarahActions(sql) {
	await moveOpenActions(sql, null);
}
var askSarah = createServerFn({ method: "POST" }).validator((input) => {
	const raw = input ?? {};
	const token = String(raw.token || "").slice(0, 80);
	const text = String(raw.text || "").trim().slice(0, 1e3);
	const channel = raw.channel === "call" ? "call" : "chat";
	const actionId = String(raw.actionId || "").slice(0, 80);
	const history = Array.isArray(raw.history) ? raw.history.slice(-6).map((item) => ({
		role: item?.role === "assistant" ? "assistant" : "user",
		content: String(item?.content || "").slice(0, 500)
	})).filter((item) => item.content) : [];
	if (!token || !text) throw new Error("Say what you need.");
	return {
		token,
		text,
		channel,
		actionId,
		history
	};
}).handler(createSsrRpc("d546dfb9d1a169f04dab7a8cc66259559b076f6eb0215dc5d6b0952637b28820"));
var getSarahQuote = createServerFn({ method: "POST" }).validator((input) => {
	const token = String(input?.token || "").slice(0, 80);
	if (!token) throw new Error("Sign in first.");
	return { token };
}).handler(createSsrRpc("2c7b2f58b059dda7a01a4e3287c2f8b9af57d94a5a3f01871a734f75e0bd4c50"));
function humanSpeech(text) {
	let clean = text.replace(/\[[^\]]+\]|<[^>]+>/g, "").replace(/\bI will\b/g, "I'll").replace(/\bI am\b/g, "I'm").replace(/\bdo not\b/gi, "don't").replace(/\bcannot\b/gi, "can't").replace(/\$18(?:\s*\/\s*|\s+per\s+)month/gi, "eighteen dollars per month").replace(/\$175/g, "one hundred seventy-five dollars").replace(/\s+/g, " ").trim();
	if (/^(ha,?|haha,?)\s+/i.test(clean) && !/outage|down|complaint|frustrated|security|payment|invoice|sorry/i.test(clean)) clean = clean.replace(/^(ha,?|haha,?)\s+/i, "[chuckle] ");
	const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 2);
	if (parts.length < 2) return clean;
	return `${parts[0]} [breath] ${parts[1]}`;
}
var speakSarah = createServerFn({ method: "POST" }).validator((input) => {
	const text = String(input?.text || "").replace(/\s+/g, " ").trim().slice(0, 700);
	if (!text) throw new Error("Nothing to say.");
	return { text: humanSpeech(text) };
}).handler(createSsrRpc("560d4f09a38fbc36ee96de5380dd2d123119d3c1e056dd7c479bfccdd9a55612"));
var hearSarah = createServerFn({ method: "POST" }).validator((input) => {
	const raw = input ?? {};
	const audio = String(raw.audio || "");
	const mime = String(raw.mime || "audio/webm").split(";")[0] || "audio/webm";
	if (!audio || audio.length > 18e5) throw new Error("I didn't catch that.");
	return {
		audio,
		mime
	};
}).handler(createSsrRpc("deaddf2bcd2b88033f995c1350da2d08cad0e1f736c4f506900155f1c2444400"));
//#endregion
export { speakSarah as a, sarah_PMAGRA0B_exports as i, getSarahQuote as n, hearSarah as r, askSarah as t };
