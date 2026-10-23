import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Boot, Button, Field, Input } from "@/components/ui";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden="true">
      <path fill="#F25022" d="M1 1h7.5v7.5H1z" />
      <path fill="#7FBA00" d="M9.5 1H17v7.5H9.5z" />
      <path fill="#00A4EF" d="M1 9.5h7.5V17H1z" />
      <path fill="#FFB900" d="M9.5 9.5H17V17H9.5z" />
    </svg>
  );
}

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

  async function startProvider(providerId: string) {
    setError("");
    setBusy(true);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
      setBusy(false);
    }
  }

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
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-ink px-12 py-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-xs font-semibold text-ink">MT</span>
          <p className="text-sm font-semibold">Manage Tech Service</p>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">The admin for companies, tickets, and the catalog.</h1>
          <ul className="mt-8 max-w-sm space-y-3 text-sm text-white/75">
            <li>Google, Microsoft, or email.</li>
            <li>Zendesk stays the system of record for support tickets.</li>
            <li>Orders stay inside the companies a person is allowed to see.</li>
          </ul>
        </div>
        <p className="text-sm text-white/60">Staff access only.</p>
      </section>
      <section className="flex items-center justify-center bg-bg px-4 py-12">
        <div className="w-full max-w-[400px] rounded-xl border border-line bg-surface p-6 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-xs font-semibold text-white">MT</span>
            <div>
              <p className="text-sm font-semibold leading-tight">Manage Tech Service</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{mode === "up" ? "Create account" : "Log in"}</h2>
          <p className="mt-1 text-[13px] text-muted">Choose Google, Microsoft, or email.</p>
          {authEnabled ? (
            <div className="mt-5 grid gap-2">
              {GROK_PROVIDERS.map((provider) => (
                <Button
                  key={provider.providerId}
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => startProvider(provider.providerId)}
                >
                  {provider.idp === "google" ? <GoogleMark /> : <MicrosoftMark />}
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">Sign-in is disabled.</p>
          )}
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            Email
            <span className="h-px flex-1 bg-line" />
          </div>
          <form className="grid gap-3" onSubmit={submit}>
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
              {busy ? "Working" : mode === "up" ? "Create account with email" : "Continue with email"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 text-[13px] text-muted underline-offset-2 hover:underline"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError("");
            }}
          >
            {mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}
