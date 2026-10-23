import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Boot, Button, Field, Input } from "@/components/ui";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending) return <Boot />;
  if (user) return <Navigate to="/" />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "up") {
        const result = await authClient.signUp.email({ email, password, name, callbackURL: "/" });
        if (result.error) {
          setError(result.error.message ?? "Could not create the account.");
          return;
        }
      } else {
        const result = await authClient.signIn.email({ email, password, callbackURL: "/" });
        if (result.error) {
          setError(result.error.message ?? "Could not sign in.");
          return;
        }
      }
      navigate({ to: "/" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-12">
      <div className="w-full max-w-[400px] rounded-xl border border-line bg-surface p-6 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-xs font-semibold text-white">MT</span>
          <div>
            <p className="text-sm font-semibold leading-tight">Manage Tech Service</p>
            <p className="text-xs text-muted">Admin</p>
          </div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{mode === "up" ? "Create account" : "Log in"}</h1>
        <p className="mt-1 text-[13px] text-muted">Sign in to companies, tickets, catalog, and orders.</p>
        {authEnabled ? (
          <div className="mt-5 grid gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="secondary"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              >
                Continue with {provider.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted">Sign-in is disabled.</p>
        )}
        <form className="mt-5 grid gap-3" onSubmit={submit}>
            {mode === "up" ? (
              <Field label="Name">
                <Input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
              </Field>
            ) : null}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password" hint="At least 8 characters.">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
              />
            </Field>
            {error ? (
              <p className="text-sm text-bad" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Working" : mode === "up" ? "Create staff account" : "Sign in with email"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 text-sm text-muted underline-offset-2 hover:underline"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError("");
            }}
          >
            {mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
    </main>
  );
}
