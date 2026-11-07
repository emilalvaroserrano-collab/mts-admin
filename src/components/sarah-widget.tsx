import { useEffect, useRef, useState } from "react";
import { Phone, Send, X } from "lucide-react";

const AGENT_URL = "https://mts-agent.vercel.app/";

function AgentMark({ className = "size-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M16 27a16 16 0 0 1 32 0" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
      <rect x="7" y="23" width="10" height="15" rx="3" fill="currentColor" />
      <rect x="47" y="23" width="10" height="15" rx="3" fill="currentColor" />
      <path d="M32 16c8.4 0 15 6.4 15 14.4 0 6.2-3.4 10.4-8.2 13.2L32 54l-6.8-10.4C20.4 40.8 17 36.6 17 30.4 17 22.4 23.6 16 32 16z" fill="currentColor" />
      <circle cx="25.5" cy="31" r="1.8" fill="#f4f7f7" />
      <circle cx="32" cy="31" r="1.8" fill="#f4f7f7" />
      <circle cx="38.5" cy="31" r="1.8" fill="#f4f7f7" />
      <path d="M52 38c5 2 8 6 7 12" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="58" cy="52" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function SarahWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "agent">("menu");
  const [spot, setSpot] = useState<{ right: number; bottom: number } | null>(null);
  const [wide, setWide] = useState(false);
  const drag = useRef<{ px: number; py: number; right: number; bottom: number; moved: boolean; spot: { right: number; bottom: number } | null } | null>(null);
  const skipClick = useRef(false);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener("change", apply);
    const saved = window.localStorage.getItem("mts-sarah-spot");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { right?: number; bottom?: number };
        if (typeof parsed.right === "number" && typeof parsed.bottom === "number") setSpot({ right: parsed.right, bottom: parsed.bottom });
      } catch { /* keep the default corner */ }
    }
    const toggle = () => {
      if (openRef.current) {
        setOpen(false);
        setMode("menu");
      } else setOpen(true);
    };
    window.addEventListener("mts-sarah-toggle", toggle);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("mts-sarah-toggle", toggle);
    };
  }, []);

  const full = open && mode === "agent";
  const place = wide && spot ? { right: spot.right, bottom: spot.bottom } : undefined;

  return (
    <div
      className={full ? "fixed inset-0 z-50 flex md:inset-auto md:right-4 md:bottom-4 md:w-[24rem]" : open ? "fixed inset-x-0 bottom-0 z-50 flex justify-end md:inset-x-auto md:right-4 md:bottom-4 md:w-[24rem]" : "fixed z-50 hidden md:right-4 md:bottom-4 md:flex"}
      style={full && !wide ? undefined : { ...place, paddingBottom: place ? undefined : "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className={full ? "flex h-full w-full flex-col" : "flex w-full flex-col items-stretch gap-2 px-3 md:w-[24rem] md:items-end md:px-0"}>
        {full ? (
          <section className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#101418] md:h-[min(100dvh-2rem,40rem)] md:rounded-2xl md:shadow-2xl">
            <header className="flex h-12 items-center gap-2 bg-[#101418] px-2 text-white">
              <button type="button" aria-label="Back" onClick={() => setMode("menu")} className="grid size-10 place-items-center rounded-full"><X className="size-5" /></button>
              <p className="text-sm font-semibold">Manage Tech Service</p>
            </header>
            <iframe
              title="Manage Tech Service support"
              src={AGENT_URL}
              allow="microphone; camera; autoplay; display-capture; clipboard-write"
              className="h-full w-full border-0 bg-white"
            />
          </section>
        ) : null}
        {open && mode === "menu" ? (
          <section className="grid w-full gap-3 self-end rounded-2xl border border-line bg-surface p-4 shadow-lg md:w-80">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Support</p>
              <button type="button" aria-label="Close support" onClick={() => setOpen(false)}><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode("agent")} className="grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold">
                <Send className="size-5" />
                Chat
              </button>
              <button type="button" onClick={() => setMode("agent")} className="grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold">
                <Phone className="size-5" />
                Call
              </button>
            </div>
          </section>
        ) : null}
        <button
          type="button"
          aria-label="Talk to support"
          aria-expanded={open}
          onPointerDown={(event) => {
            if (!wide) return;
            const rect = event.currentTarget.getBoundingClientRect();
            drag.current = { px: event.clientX, py: event.clientY, right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom, moved: false, spot: null };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (!current) return;
            const right = current.right - (event.clientX - current.px);
            const bottom = current.bottom - (event.clientY - current.py);
            const next = {
              right: Math.min(window.innerWidth - 72, Math.max(8, right)),
              bottom: Math.min(window.innerHeight - 72, Math.max(8, bottom)),
            };
            if (Math.hypot(event.clientX - current.px, event.clientY - current.py) > 6) current.moved = true;
            current.spot = next;
            setSpot(next);
          }}
          onPointerUp={() => {
            const current = drag.current;
            drag.current = null;
            if (!current?.moved || !current.spot) return;
            skipClick.current = true;
            window.localStorage.setItem("mts-sarah-spot", JSON.stringify(current.spot));
          }}
          onClick={() => {
            if (skipClick.current) {
              skipClick.current = false;
              return;
            }
            if (open && mode === "menu") setOpen(false);
            else setOpen(true);
          }}
          className={full ? "hidden" : "grid size-16 cursor-grab place-items-center self-end rounded-full bg-[#f3f3f3] text-[#4a4a4a] shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-4 ring-white active:cursor-grabbing"}
        >
          <AgentMark />
        </button>
      </div>
    </div>
  );
}

export function SarahHeaderButton() {
  return (
    <button type="button" className="grid size-10 place-items-center rounded-xl md:hidden" aria-label="Talk to support" onClick={() => window.dispatchEvent(new Event("mts-sarah-toggle"))}>
      <AgentMark className="size-6" />
    </button>
  );
}
