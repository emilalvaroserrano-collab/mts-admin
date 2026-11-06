import assert from "node:assert/strict";
import test from "node:test";
import { allowTransition, confirmationFresh, confirmSnapshot, followUp, listPick, phoneChoice, quoteFor, reconcileDecision, wantsNavigation } from "./sarah-state.ts";

test("a timeout is not a failure", () => {
  assert.equal(reconcileDecision({ status: "executing", ageMs: 30_000, resourceFound: false }), "checking_status");
  assert.equal(reconcileDecision({ status: "checking_status", ageMs: 11 * 60_000, resourceFound: false }), "manual_review");
  assert.equal(reconcileDecision({ status: "checking_status", ageMs: 30_000, resourceFound: true }), "succeeded");
  assert.equal(allowTransition("executing", "failed"), true);
  assert.equal(allowTransition("executing", "awaiting_confirmation"), false);
});

test("navigation is only an explicit request to open a page", () => {
  assert.equal(wantsNavigation("show me my tickets"), false);
  assert.equal(wantsNavigation("open the billing page"), true);
});

test("a quote expires and the second listed ticket can be opened", () => {
  assert.equal(confirmationFresh(10 * 60_000), true);
  assert.equal(confirmationFresh(31 * 60_000), false);
  assert.equal(listPick("open the second ticket"), 1);
  assert.equal(listPick("show me my tickets"), null);
});

test("a quote snapshot is the price the server will charge", () => {
  assert.equal(confirmSnapshot({ tool: "order_service", offering: "voip-ext" })?.amountCents, 1800);
  assert.equal(confirmSnapshot({ tool: "order_service", offering: "wiring", drops: 3 })?.amountCents, 52500);
  assert.equal(confirmSnapshot({ tool: "account" }), null);
});

test("a paid quote shows the server price, not a guessed one", () => {
  assert.equal(quoteFor({ tool: "order_service", offering: "voip-ext" })?.amount, "$18 per month");
  assert.equal(quoteFor({ tool: "order_service", offering: "wiring", drops: 3 })?.amount, "$525");
  assert.equal(quoteFor({ tool: "account" }), null);
});

test("a desk phone answer is not a charge approval", () => {
  assert.equal(phoneChoice("no"), false);
  assert.equal(phoneChoice("yes, ship a desk phone"), true);
  assert.equal(phoneChoice("eighteen dollars"), null);
});

test("a follow-up changes the open quote instead of starting a new one", () => {
  assert.deepEqual(followUp("make it 3", { offering: "wiring", drops: 1 }), { drops: 3 });
  assert.equal(followUp("make it 3", {}), null);
  assert.equal(followUp("cancel that", { offering: "wiring" })?.cancel, true);
});



