export function verificationDecision(input: {
  hasAccount: boolean;
  storedCode: string;
  submittedCode: string;
  expiresAt: string;
  attempts: number;
  now?: number;
}) {
  if (!input.hasAccount) return { ok: false as const, reason: "missing" };
  if (input.attempts >= 5) return { ok: false as const, reason: "locked" };
  if (!input.storedCode || input.storedCode !== input.submittedCode) return { ok: false as const, reason: "mismatch" };
  const expires = Date.parse(input.expiresAt);
  if (!Number.isFinite(expires) || expires < (input.now ?? Date.now())) return { ok: false as const, reason: "expired" };
  return { ok: true as const, reason: "valid" };
}

export function commentIsPublic(flag: unknown) {
  return flag !== false && flag !== "false" && flag !== 0 && flag !== "f";
}

export function unpaidCardStatus() {
  return "pending";
}
