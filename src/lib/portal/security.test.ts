import assert from "node:assert/strict";
import test from "node:test";
import { commentIsPublic, unpaidCardStatus, verificationDecision } from "./security.ts";

const future = new Date(Date.now() + 60_000).toISOString();
const past = new Date(Date.now() - 60_000).toISOString();

test("verification rejects a missing account and a wrong code", () => {
  assert.equal(verificationDecision({ hasAccount: false, storedCode: "123456", submittedCode: "123456", expiresAt: future, attempts: 0 }).reason, "missing");
  assert.equal(verificationDecision({ hasAccount: true, storedCode: "123456", submittedCode: "000000", expiresAt: future, attempts: 0 }).reason, "mismatch");
});

test("verification rejects an expired or already used code", () => {
  assert.equal(verificationDecision({ hasAccount: true, storedCode: "", submittedCode: "123456", expiresAt: future, attempts: 0 }).reason, "mismatch");
  assert.equal(verificationDecision({ hasAccount: true, storedCode: "123456", submittedCode: "123456", expiresAt: past, attempts: 0 }).reason, "expired");
});

test("verification locks after five failures and accepts one valid code", () => {
  assert.equal(verificationDecision({ hasAccount: true, storedCode: "123456", submittedCode: "123456", expiresAt: future, attempts: 5 }).reason, "locked");
  assert.equal(verificationDecision({ hasAccount: true, storedCode: "123456", submittedCode: "123456", expiresAt: future, attempts: 4 }).ok, true);
});

test("private Zendesk comments stay private", () => {
  assert.equal(commentIsPublic(false), false);
  assert.equal(commentIsPublic("false"), false);
  assert.equal(commentIsPublic(true), true);
  assert.equal(commentIsPublic(undefined), true);
});

test("a card fragment is not a completed payment", () => {
  assert.equal(unpaidCardStatus(), "pending");
});
