import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

function chunkLoadFailed(message: string) {
  return /dynamically imported module|module script failed|error loading dynamically imported module/i.test(message);
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const message = errorMessage(error);
  useEffect(() => {
    if (!chunkLoadFailed(message)) return;
    const key = "mts-chunk-reload";
    if (sessionStorage.getItem(key) === window.location.pathname) return;
    sessionStorage.setItem(key, window.location.pathname);
    window.location.reload();
  }, [message]);

  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">{message}</p>
      <button
        type="button"
        className="mt-2 h-9 rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </main>
  );
}