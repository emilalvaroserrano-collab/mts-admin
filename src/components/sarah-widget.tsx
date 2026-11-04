import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, Phone, PhoneOff, Send, X } from "lucide-react";
import { askSarah, hearSarah, speakSarah } from "@/lib/portal/sarah";
import type { Planned } from "@/lib/portal/sarah-plan";
import { useShopToken } from "@/lib/portal/shop-session";
import { addToCart } from "@/lib/portal/store-cart";

type Line = { from: "sarah" | "you"; text: string };
type Tour = { to: "/portal" | "/portal/tickets" | "/portal/tickets/new" | "/portal/shop" | "/portal/orders" | "/portal/billing" | "/portal/complaints" | "/portal/organization" | "/portal/account" | "/portal/my-services" | "/portal/quotes" | "/portal/notifications"; guide: string; label: string };
type Gate = "idle" | "ringing" | "speaking" | "cooldown" | "listening";

const GREETING = "Thank you for calling Manage Tech Service. This is Sarah. I have your account open. How may I help you?";

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

function words(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function isEcho(heard: string, spoken: string) {
  const a = words(heard);
  const b = words(spoken);
  if (a.length < 12 || b.length < 12) return false;
  if (b.includes(a) || a.includes(b)) return true;
  const mine = new Set(a.split(" "));
  const theirs = b.split(" ").filter((word) => word.length > 3);
  if (theirs.length < 4) return false;
  const hits = theirs.filter((word) => mine.has(word)).length;
  return hits / theirs.length > 0.55;
}

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function SarahWidget() {
  const token = useShopToken();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "chat" | "call">("menu");
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Planned | null>(null);
  const [gate, setGate] = useState<Gate>("idle");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [heard, setHeard] = useState("");
  const hearGen = useRef(0);
  const [tour, setTour] = useState<Tour | null>(null);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const live = useRef(false);
  const gateRef = useRef<Gate>("idle");
  const mutedRef = useRef(false);
  const busyRef = useRef(false);
  const spokenRef = useRef("");
  const dockAudio = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const earRef = useRef<Ear | null>(null);
  const ringRef = useRef<AudioContext | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<Line[]>([]);
  const pendingRef = useRef<Planned | null>(null);

  function setPhase(next: Gate) {
    gateRef.current = next;
    setGate(next);
  }

  function stopRing() {
    const ctx = ringRef.current;
    ringRef.current = null;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => undefined);
  }

  function stopEar() {
    const ear = earRef.current;
    earRef.current = null;
    if (!ear) return;
    window.clearInterval(ear.timer);
    if (ear.recorder && ear.recorder.state !== "inactive") {
      ear.recorder.onstop = null;
      ear.recorder.stop();
    }
    ear.stream.getTracks().forEach((track) => track.stop());
    if (ear.ctx.state !== "closed") void ear.ctx.close().catch(() => undefined);
  }

  function stopMic() {
    hearGen.current += 1;
    const rec = recRef.current;
    recRef.current = null;
    try { rec?.abort(); } catch { try { rec?.stop(); } catch { /* already closed */ } }
    const ear = earRef.current;
    if (ear) {
      window.clearInterval(ear.timer);
      ear.timer = 0;
      ear.closing = true;
      if (ear.recorder && ear.recorder.state !== "inactive") {
        ear.recorder.onstop = null;
        try { ear.recorder.stop(); } catch { /* already stopped */ }
      }
      ear.stream.getAudioTracks().forEach((track) => { track.enabled = false; });
    }
    if (gateRef.current === "listening") setPhase("idle");
  }

  function stopSpeaker() {
    const audio = dockAudio.current;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    window.speechSynthesis?.cancel();
  }

  function unlockAudio() {
    const audio = dockAudio.current;
    if (!audio) return;
    if (!audio.getAttribute("src")) audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    void audio.play().then(() => audio.pause()).catch(() => undefined);
  }

  function playDocked(src: string) {
    const audio = dockAudio.current;
    if (!audio) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const done = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.src = src;
      void audio.play().catch(done);
    });
  }

  async function playSarah(text: string, background = false) {
    stopMic();
    stopSpeaker();
    spokenRef.current = text;
    setPhase("speaking");
    const spoken = await speakSarah({ data: { text } }).catch(() => ({ audio: "" }));
    if (!background && !live.current) {
      setPhase("idle");
      return;
    }
    if (spoken.audio) {
      await playDocked(`data:audio/mpeg;base64,${spoken.audio}`);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      await new Promise<void>((resolve) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.94;
        utter.pitch = 1;
        const voice = window.speechSynthesis.getVoices().find((item) => /samantha|victoria|google us english|female/i.test(`${item.name} ${item.lang}`));
        if (voice) utter.voice = voice;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      });
    }
    const interrupted = !live.current || gateRef.current !== "speaking";
    if (interrupted) {
      if (!live.current) setPhase("idle");
      return;
    }
    setPhase("cooldown");
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setPhase("idle");
  }

  function listen() {
    if (!live.current || mutedRef.current || busyRef.current) return;
    if (gateRef.current === "ringing" || gateRef.current === "speaking" || gateRef.current === "cooldown" || gateRef.current === "listening") return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      void listenWithVad();
      return;
    }
    const gen = hearGen.current;
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    recRef.current = rec;
    setPhase("listening");
    rec.onresult = (event) => {
      if (hearGen.current !== gen || gateRef.current === "speaking") return;
      let finalText = "";
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const piece = event.results[index]?.[0]?.transcript || "";
        if (event.results[index]?.isFinal) finalText += piece;
        else interim += piece;
      }
      if (interim.trim()) setHeard(interim.trim());
      const said = finalText.trim();
      if (!said || isEcho(said, spokenRef.current)) return;
      setHeard("");
      stopMic();
      void turn(said, "call");
    };
    rec.onerror = (event) => {
      if (hearGen.current !== gen) return;
      if (event.error === "not-allowed") {
        setError("The microphone is blocked. You can still type.");
        stopMic();
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") return;
    };
    rec.onend = () => {
      if (recRef.current === rec) recRef.current = null;
      if (hearGen.current !== gen) return;
      if (gateRef.current === "listening") setPhase("idle");
      window.setTimeout(() => {
        if (hearGen.current === gen && live.current && !mutedRef.current && !busyRef.current && gateRef.current === "idle") listen();
      }, 300);
    };
    try { rec.start(); } catch { setPhase("idle"); void listenWithVad(); }
  }

  async function listenWithVad() {
    try {
      const ear = earRef.current ?? await openEar();
      earRef.current = ear;
      if (!live.current || mutedRef.current || busyRef.current) {
        if (!live.current) stopEar();
        return;
      }
      ear.stream.getAudioTracks().forEach((track) => { track.enabled = true; });
      ear.speaking = false;
      ear.closing = false;
      ear.hot = 0;
      ear.cool = 0;
      ear.chunks = [];
      setPhase("listening");
      const samples = new Uint8Array(ear.analyser.fftSize);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      ear.timer = window.setInterval(() => {
        if (!live.current || mutedRef.current || gateRef.current !== "listening") return;
        ear.analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const value = (sample - 128) / 128;
          sum += value * value;
        }
        const level = Math.sqrt(sum / samples.length);
        const trip = Math.max(0.008, ear.floor * 1.7);
        const hot = level > trip;
        if (!ear.speaking && !hot) ear.floor = ear.floor * 0.92 + level * 0.08;
        if (!ear.speaking) {
          ear.hot = hot ? ear.hot + 1 : 0;
          if (ear.hot < 3) return;
          ear.speaking = true;
          ear.cool = 0;
          ear.spoken = 0;
          ear.chunks = [];
          const rec = mime ? new MediaRecorder(ear.stream, { mimeType: mime }) : new MediaRecorder(ear.stream);
          ear.recorder = rec;
          rec.ondataavailable = (event) => { if (event.data.size) ear.chunks.push(event.data); };
          rec.start(250);
          return;
        }
        ear.cool = hot ? 0 : ear.cool + 1;
        ear.spoken += 1;
        if (ear.closing) return;
        if (ear.cool >= 16 || ear.spoken > 200) {
          ear.closing = true;
          void finishUtterance(ear);
        }
      }, 50);
    } catch {
      listenFallback();
    }
  }

  async function finishUtterance(ear: Ear) {
    if (ear.timer) {
      window.clearInterval(ear.timer);
      ear.timer = 0;
    }
    const rec = ear.recorder;
    ear.speaking = false;
    const blob = await new Promise<Blob>((resolve) => {
      if (!rec || rec.state === "inactive") {
        resolve(new Blob(ear.chunks, { type: rec?.mimeType || "audio/webm" }));
        return;
      }
      rec.onstop = () => resolve(new Blob(ear.chunks, { type: rec.mimeType || "audio/webm" }));
      rec.stop();
    });
    ear.stream.getAudioTracks().forEach((track) => { track.enabled = false; });
    setPhase("idle");
    if (!live.current) return;
    if (blob.size < 900) {
      listen();
      return;
    }
    const audio = await blobToBase64(blob);
    const heard = await hearSarah({ data: { audio, mime: blob.type || "audio/webm" } }).catch(() => ({ text: "" }));
    const text = heard.text.trim();
    if (!live.current || mutedRef.current) return;
    if (!text || isEcho(text, spokenRef.current)) {
      listen();
      return;
    }
    void turn(text, "call");
  }

  function listenFallback() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("This phone can't open the mic. You can still type.");
      return;
    }
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    recRef.current = rec;
    setPhase("listening");
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript || "";
      stopMic();
      if (!text || isEcho(text, spokenRef.current)) return;
      void turn(text, "call");
    };
    rec.onerror = () => { if (recRef.current === rec) stopMic(); };
    rec.onend = () => {
      if (recRef.current !== rec) return;
      recRef.current = null;
      if (gateRef.current === "listening") setPhase("idle");
    };
    try { rec.start(); } catch { setPhase("idle"); }
  }

  async function ringTwice() {
    stopRing();
    const ctx = new AudioContext();
    ringRef.current = ctx;
    const burst = (at: number) => {
      for (const freq of [440, 480]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.05, at + 0.03);
        gain.gain.setValueAtTime(0.05, at + 0.95);
        gain.gain.linearRampToValueAtTime(0, at + 1.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 1.06);
      }
    };
    const now = ctx.currentTime + 0.05;
    burst(now);
    burst(now + 1.7);
    await new Promise((resolve) => window.setTimeout(resolve, 2900));
    if (ringRef.current === ctx) {
      ringRef.current = null;
      if (ctx.state !== "closed") await ctx.close().catch(() => undefined);
    }
  }

  async function turn(text: string, channel: "chat" | "call") {
    const said = text.trim();
    if (!said || !token || busyRef.current) return;
    if (channel === "call" && isEcho(said, spokenRef.current)) return;
    stopMic();
    busyRef.current = true;
    setBusy(true);
    const history = linesRef.current.slice(-6).map((line) => ({ role: line.from === "sarah" ? "assistant" as const : "user" as const, content: line.text }));
    const nextLines = [...linesRef.current, { from: "you" as const, text: said }];
    linesRef.current = nextLines;
    setLines(nextLines);
    setDraft("");
    setError("");
    try {
      const result = await askSarah({ data: { token, text: said, channel, pending: pendingRef.current, history } });
      pendingRef.current = result.pending;
      setPending(result.pending);
      if (result.cartSku) addToCart(result.cartSku, 1);
      const withReply = [...linesRef.current, { from: "sarah" as const, text: result.reply }];
      linesRef.current = withReply;
      setLines(withReply);
      if (result.show) {
        setTour(result.show);
        void navigate({ to: result.show.to });
      }
      if (channel === "call" && live.current) await playSarah(result.reply);
      else if (result.show) void playSarah(result.reply, true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sarah couldn't reach the desk.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      if (channel === "call" && live.current && !mutedRef.current && gateRef.current === "idle") listen();
    }
  }

  async function startCall() {
    unlockAudio();
    live.current = true;
    mutedRef.current = false;
    setMuted(false);
    setSeconds(0);
    setMode("call");
    setPhase("ringing");
    setLines([]);
    linesRef.current = [];
    pendingRef.current = null;
    setPending(null);
    await ringTwice();
    if (!live.current) return;
    const greeting = [{ from: "sarah" as const, text: GREETING }];
    setLines(greeting);
    linesRef.current = greeting;
    await playSarah(GREETING);
    if (live.current && !mutedRef.current) listen();
  }

  function endCall() {
    live.current = false;
    stopRing();
    stopMic();
    stopEar();
    stopSpeaker();
    setTour(null);
    setPhase("idle");
    setMode("menu");
  }

  function close() {
    endCall();
    setOpen(false);
  }

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) stopMic();
    else if (live.current && gateRef.current === "idle" && !busyRef.current) listen();
  }

  useEffect(() => {
    if (!tour) {
      setBox(null);
      return;
    }
    const timer = window.setTimeout(() => {
      const heading = document.querySelector("main h1, main h2") as HTMLElement | null;
      const marked = document.querySelector(`[data-guide="${tour.guide}"]`) as HTMLElement | null;
      const target = heading || marked;
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      const rect = target.getBoundingClientRect();
      setBox({ top: Math.max(8, rect.top - 6), left: Math.max(8, rect.left - 6), width: rect.width + 12, height: rect.height + 12 });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [tour]);

  useEffect(() => {
    if (mode !== "call") return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines, mode]);

  const talking = gate === "speaking" || gate === "cooldown";
  const hearing = gate === "listening";

  return (
    <div className={open && mode !== "menu" && !tour ? "fixed inset-0 z-40 flex md:inset-auto md:right-4 md:bottom-4 md:w-[24rem]" : "fixed inset-x-0 bottom-0 z-40 flex justify-end md:inset-x-auto md:right-4"} style={open && mode !== "menu" && !tour ? undefined : { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className={open && mode !== "menu" && !tour ? "flex h-full w-full flex-col" : "flex w-full flex-col items-stretch gap-2 px-3 md:w-[24rem] md:items-end md:px-0"}>
        <audio ref={dockAudio} playsInline preload="auto" className="hidden" />
        {open && mode === "chat" ? (
          <section className={tour ? "grid max-h-64 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl bg-[#efeae2] shadow-2xl" : "grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#efeae2] md:h-[min(100dvh-2rem,40rem)] md:rounded-2xl md:shadow-2xl"}>
            <header className="flex h-14 items-center gap-3 bg-[#075e54] px-3 text-white">
              <button type="button" aria-label="Close chat" onClick={() => setMode("menu")} className="grid size-10 place-items-center rounded-full"><X className="size-5" /></button>
              <span className="grid size-9 place-items-center rounded-full bg-white/15"><AgentMark className="size-6" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Sarah</p>
                <p className="text-xs text-white/80">Manage Tech Service</p>
              </div>
            </header>
            <div ref={scroller} className="flex min-h-0 flex-col gap-2 overflow-y-auto px-3 py-3">
              {lines.map((line, index) => (
                <p key={`${line.from}-${index}`} className={line.from === "you" ? "max-w-[80%] self-end rounded-2xl rounded-br-md bg-[#d9fdd3] px-3 py-2 text-sm text-[#111]" : "max-w-[80%] self-start rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-[#111] shadow-sm"}>
                  {line.text}
                </p>
              ))}
            </div>
            {error ? <p className="px-3 text-sm text-bad">{error}</p> : null}
            <form className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }} onSubmit={(event) => { event.preventDefault(); void turn(draft, "chat"); }}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message" aria-label="Message Sarah" className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm" />
              <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#075e54] text-white disabled:opacity-40"><Send className="size-4" /></button>
            </form>
          </section>
        ) : null}
        {open && mode === "call" ? (
          <section className={tour ? "grid w-full grid-rows-[auto_auto] overflow-hidden rounded-2xl bg-[#101418] text-white shadow-2xl" : "grid h-full min-h-0 w-full grid-rows-[1fr_auto] overflow-hidden bg-[#101418] text-white md:h-[min(100dvh-2rem,40rem)] md:rounded-2xl md:shadow-2xl"}>
            <div className="grid content-center justify-items-center gap-3 px-6 text-center">
              <p className="text-xs tracking-[0.2em] text-white/60">MANAGE TECH SERVICE</p>
              <div className="relative grid size-32 place-items-center">
                <span className={talking || hearing ? "absolute inset-0 animate-ping rounded-full bg-white/10" : "absolute inset-2 rounded-full bg-white/5"} />
                <span className="relative grid size-24 place-items-center rounded-full bg-[#1c242b]"><AgentMark className="size-14" /></span>
              </div>
              <h2 className="text-3xl font-semibold">Sarah</h2>
              <p className="text-sm text-white/70">{clock(seconds)}</p>
              <p className="text-sm text-emerald-300">{gate === "ringing" ? "Ringing" : talking ? "Speaking" : hearing ? "Listening" : busy ? "One moment" : muted ? "Muted" : "On the line"}</p>
              <p className="line-clamp-3 max-w-xs text-sm text-white/80">{gate === "ringing" ? "Calling Sarah" : heard ? heard : lines.at(-1)?.text}</p>
            </div>
            <div className="grid gap-3 px-4 pt-2" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              {error ? <p className="text-center text-sm text-red-300">{error}</p> : null}
              <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); unlockAudio(); void turn(draft, "call"); }}>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type if you need to" aria-label="Say this to Sarah" className="h-11 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-sm outline-none" />
                <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="grid size-11 place-items-center rounded-full bg-white/15 disabled:opacity-40"><Send className="size-4" /></button>
              </form>
              <div className="flex items-center justify-center gap-8">
                <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid size-16 place-items-center rounded-full bg-white/10">
                  {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                </button>
                <button type="button" onClick={endCall} aria-label="End call" className="grid size-20 place-items-center rounded-full bg-[#e23b3b]">
                  <PhoneOff className="size-7" />
                </button>
              </div>
            </div>
          </section>
        ) : null}
        {open && mode === "menu" ? (
          <section className="grid w-full gap-3 self-end rounded-2xl border border-line bg-surface p-4 shadow-lg md:w-80">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Sarah</p>
              <button type="button" aria-label="Close support" onClick={close}><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { const hello = [{ from: "sarah" as const, text: "Hello, this is Sarah at Manage Tech Service. Tell me what you need and I will take care of it on your account." }]; linesRef.current = hello; setLines(hello); setMode("chat"); }} className="grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold">
                <Send className="size-5" />
                Chat
              </button>
              <button type="button" onClick={() => void startCall()} className="grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold">
                <Phone className="size-5" />
                Call
              </button>
            </div>
          </section>
        ) : null}
        <button type="button" aria-label="Talk to Sarah" aria-expanded={open} onPointerDown={unlockAudio} onClick={() => (open && mode === "menu" ? close() : setOpen(true))} className={open && mode !== "menu" && !tour ? "hidden" : "grid size-16 place-items-center self-end rounded-full bg-[#f3f3f3] text-[#4a4a4a] shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-4 ring-white"}>
          <AgentMark />
        </button>
      </div>
      {box && tour ? (
        <div className="pointer-events-none fixed z-30 rounded-2xl ring-4 ring-[#127e86]" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
          <span className="absolute -top-8 left-0 rounded-full bg-[#127e86] px-2 py-1 text-xs font-semibold text-white">Sarah is showing {tour.label}</span>
        </div>
      ) : null}
    </div>
  );
}

type Ear = {
  stream: MediaStream;
  ctx: AudioContext;
  analyser: AnalyserNode;
  recorder: MediaRecorder | null;
  chunks: Blob[];
  timer: number;
  speaking: boolean;
  hot: number;
  cool: number;
  floor: number;
  spoken: number;
  closing: boolean;
};

async function openEar() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
  });
  const ctx = new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  return { stream, ctx, analyser, recorder: null, chunks: [], timer: 0, speaking: false, hot: 0, cool: 0, floor: 0.008, spoken: 0, closing: false };
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void;
  onerror: (event: { error?: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  }
}
