import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, Phone, PhoneOff, Send, X } from "lucide-react";
import { askSarah, cancelSarahAction, confirmSarahAction, getSarahQuote, hearSarah, speakSarah } from "@/lib/portal/sarah";
import { useShopToken } from "@/lib/portal/shop-session";
import { addToCart } from "@/lib/portal/store-cart";

type Line = { from: "sarah" | "you"; text: string; cards?: { title: string; detail: string }[] };
type Receipt = { title: string; reference: string; amount: string; note: string };
type Tour = { to: "/portal" | "/portal/tickets" | "/portal/tickets/new" | "/portal/shop" | "/portal/orders" | "/portal/billing" | "/portal/complaints" | "/portal/organization" | "/portal/account" | "/portal/my-services" | "/portal/quotes" | "/portal/notifications"; guide: string; label: string; ticketId?: string };
type Gate = "idle" | "ringing" | "speaking" | "cooldown" | "listening";

const GREETING = "Thank you for calling Manage Tech Service. This is Sarah. How can I help you today?";

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

function sentLine(item: Receipt) {
  return `Sent. ${item.reference} is in at ${item.amount}. ${item.note}`;
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
  const [notice, setNotice] = useState("");
  const [leave, setLeave] = useState<Tour | null>(null);
  const [gate, setGate] = useState<Gate>("idle");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [heard, setHeard] = useState("");
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
  const officeRef = useRef<AudioContext | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<Line[]>([]);
  const speakGen = useRef(0);
  const pendingRef = useRef("");
  const heardDraft = useRef("");
  const heardTimer = useRef(0);
  const actionRef = useRef("");
  const [actionId, setActionId] = useState("");
  const [quote, setQuote] = useState<{ title: string; detail: string; amount: string } | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [spot, setSpot] = useState<{ right: number; bottom: number } | null>(null);
  const [wide, setWide] = useState(false);
  const drag = useRef<{ px: number; py: number; right: number; bottom: number; moved: boolean; spot: { right: number; bottom: number } | null } | null>(null);
  const skipClick = useRef(false);
  const openRef = useRef(false);

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
    if (ear.processor) {
      ear.processor.onaudioprocess = null;
      ear.processor.disconnect();
    }
    if (ear.recorder && ear.recorder.state !== "inactive") {
      ear.recorder.onstop = null;
      try { ear.recorder.stop(); } catch { /* already stopped */ }
    }
    ear.mute?.disconnect();
    ear.source.disconnect();
    ear.stream.getTracks().forEach((track) => track.stop());
    if (ear.ctx.state !== "closed") void ear.ctx.close().catch(() => undefined);
  }

  function stopMic() {
    const rec = recRef.current;
    recRef.current = null;
    try { rec?.abort(); } catch { try { rec?.stop(); } catch { /* already closed */ } }
    const ear = earRef.current;
    if (!ear) return;
    ear.closing = true;
    ear.speaking = false;
    ear.playback = false;
    window.clearTimeout(heardTimer.current);
    heardDraft.current = "";
    ear.stream.getAudioTracks().forEach((track) => { track.enabled = false; });
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

  function stopOffice() {
    const ctx = officeRef.current;
    officeRef.current = null;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => undefined);
  }

  function startOffice() {
    stopOffice();
    const ctx = new AudioContext();
    officeRef.current = ctx;
    const bed = ctx.createGain();
    bed.gain.value = 0.035;
    bed.connect(ctx.destination);
    const seconds = 3;
    const length = Math.floor(ctx.sampleRate * seconds);
    const room = ctx.createBuffer(1, length, ctx.sampleRate);
    const air = room.getChannelData(0);
    let brown = 0;
    for (let index = 0; index < length; index += 1) {
      brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      air[index] = brown * 3.2;
    }
    const roomSrc = ctx.createBufferSource();
    roomSrc.buffer = room;
    roomSrc.loop = true;
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 380;
    roomSrc.connect(low);
    low.connect(bed);
    roomSrc.start();
    const murmur = ctx.createBuffer(1, length, ctx.sampleRate);
    const voices = murmur.getChannelData(0);
    for (let index = 0; index < length; index += 1) voices[index] = Math.random() * 2 - 1;
    const murmurSrc = ctx.createBufferSource();
    murmurSrc.buffer = murmur;
    murmurSrc.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 860;
    band.Q.value = 0.6;
    const murmurGain = ctx.createGain();
    murmurGain.gain.value = 0.01;
    const sway = ctx.createOscillator();
    sway.frequency.value = 0.12;
    const swayGain = ctx.createGain();
    swayGain.gain.value = 0.006;
    sway.connect(swayGain);
    swayGain.connect(murmurGain.gain);
    murmurSrc.connect(band);
    band.connect(murmurGain);
    murmurGain.connect(ctx.destination);
    murmurSrc.start();
    sway.start();
    void ctx.resume();
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
      audio.volume = 1;
      audio.src = src;
      void audio.play().catch(done);
    });
  }

  function speakBrowser(text: string) {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utter = new SpeechSynthesisUtterance(text.replace(/\[[^\]]+\]/g, ""));
      utter.rate = 1;
      utter.pitch = 1;
      const voice = window.speechSynthesis.getVoices().find((item) => /samantha|karen|moira|natural/i.test(item.name) && /en/i.test(item.lang));
      if (voice) utter.voice = voice;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    });
  }

  async function playSarah(text: string, background = false) {
    stopSpeaker();
    spokenRef.current = text;
    const mine = speakGen.current;
    setPhase("speaking");
    const spoken = await speakSarah({ data: { text } }).catch(() => ({ audio: "" }));
    if (speakGen.current !== mine || (!background && !live.current)) {
      if (!live.current) setPhase("idle");
      return;
    }
    if (pendingRef.current) return;
    pauseListen();
    const ear = earRef.current;
    if (ear) ear.playback = true;
    try {
      if (spoken.audio) await playDocked(`data:audio/mpeg;base64,${spoken.audio}`);
      else await speakBrowser(text);
    } finally {
      if (ear) ear.playback = false;
    }
    if (speakGen.current !== mine || !live.current || gateRef.current !== "speaking") {
      if (!live.current) setPhase("idle");
      return;
    }
    setPhase("listening");
    listen();
  }

  function pauseListen() {
    window.clearTimeout(heardTimer.current);
    heardDraft.current = "";
    const rec = recRef.current;
    recRef.current = null;
    try { rec?.abort(); } catch { try { rec?.stop(); } catch { /* already closed */ } }
  }

  function commitHeard(text: string) {
    const said = text.trim();
    heardDraft.current = "";
    window.clearTimeout(heardTimer.current);
    if (!said || !live.current || mutedRef.current || gateRef.current === "speaking") return;
    if (isEcho(said, spokenRef.current)) return;
    setHeard(said);
    if (busyRef.current) {
      pendingRef.current = said;
      return;
    }
    void turn(said, "call");
  }

  function holdHeard(text: string) {
    const said = text.trim();
    if (!said || gateRef.current === "speaking") return;
    heardDraft.current = said;
    setHeard(said);
    window.clearTimeout(heardTimer.current);
    heardTimer.current = window.setTimeout(() => {
      const next = heardDraft.current;
      heardDraft.current = "";
      if (next) commitHeard(next);
    }, 650);
  }

  function listen() {
    if (!live.current || mutedRef.current) return;
    if (gateRef.current === "ringing") return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      void listenWithVad();
      return;
    }
    if (recRef.current) return;
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    recRef.current = rec;
    if (gateRef.current !== "speaking") setPhase("listening");
    rec.onresult = (event) => {
      if (!live.current || mutedRef.current || gateRef.current === "speaking") return;
      let finalText = "";
      let interim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const piece = event.results[index]?.[0]?.transcript || "";
        if (event.results[index]?.isFinal) finalText += piece;
        else interim += piece;
      }
      const said = `${finalText} ${interim}`.replace(/\s+/g, " ").trim();
      if (!said) return;
      if (finalText.trim() && !interim.trim()) commitHeard(finalText);
      else holdHeard(said);
    };
    rec.onerror = (event) => {
      if (!live.current) return;
      if (event.error === "not-allowed") {
        setError("The microphone is blocked. You can still type.");
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") return;
      if (event.error === "audio-capture") {
        recRef.current = null;
        void listenWithVad();
      }
    };
    rec.onend = () => {
      const leftover = heardDraft.current;
      if (recRef.current === rec) recRef.current = null;
      if (leftover && gateRef.current !== "speaking") commitHeard(leftover);
      if (live.current && !mutedRef.current && gateRef.current === "listening") window.setTimeout(() => listen(), 60);
    };
    try { rec.start(); } catch {
      recRef.current = null;
      void listenWithVad();
    }
  }

  async function listenWithVad() {
    try {
      const ear = earRef.current ?? await openEar();
      earRef.current = ear;
      if (!live.current || mutedRef.current) {
        if (!live.current) stopEar();
        return;
      }
      ear.stream.getAudioTracks().forEach((track) => { track.enabled = true; });
      if (ear.ctx.state === "suspended") await ear.ctx.resume();
      ear.closing = false;
      ear.speaking = false;
      ear.hot = 0;
      ear.cool = 0;
      if (gateRef.current !== "speaking") setPhase("listening");
      if (ear.processor) return;
      const processor = ear.ctx.createScriptProcessor(2048, 1, 1);
      const mute = ear.ctx.createGain();
      mute.gain.value = 0;
      ear.source.connect(processor);
      processor.connect(mute);
      mute.connect(ear.ctx.destination);
      ear.processor = processor;
      ear.mute = mute;
      processor.onaudioprocess = (event) => {
        const earNow = earRef.current;
        if (!earNow || earNow.closing) return;
        const input = event.inputBuffer.getChannelData(0);
        const ring = earNow.ring;
        for (let index = 0; index < input.length; index += 1) {
          ring[earNow.write] = input[index];
          earNow.write = (earNow.write + 1) % ring.length;
        }
        earNow.filled = Math.min(ring.length, earNow.filled + input.length);
        if (!live.current || mutedRef.current) return;
        const gateNow = gateRef.current;
        if (gateNow !== "listening" && gateNow !== "speaking") return;
        let sum = 0;
        for (let index = 0; index < input.length; index += 1) sum += input[index] * input[index];
        const rms = Math.sqrt(sum / input.length);
        const playing = earNow.playback;
        const trip = playing ? Math.max(0.03, earNow.floor * 3.6) : Math.max(0.009, earNow.floor * 2.1);
        const hot = rms > trip;
        const frame = input.length / earNow.ctx.sampleRate;
        if (!earNow.speaking && !hot && !playing) earNow.floor = earNow.floor * 0.94 + rms * 0.06;
        if (!earNow.speaking) {
          earNow.hot = hot ? earNow.hot + frame : 0;
          if (earNow.hot < (playing ? 0.2 : 0.09)) return;
          earNow.speaking = true;
          earNow.cool = 0;
          const back = Math.min(earNow.filled, Math.floor(earNow.ctx.sampleRate * 0.25));
          earNow.startAt = (earNow.write - back + ring.length) % ring.length;
          earNow.spoken = back / earNow.ctx.sampleRate;
          if (!earNow.recorder || earNow.recorder.state === "inactive") {
            const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
            const rec = mime ? new MediaRecorder(earNow.stream, { mimeType: mime }) : new MediaRecorder(earNow.stream);
            earNow.chunks = [];
            earNow.recorder = rec;
            rec.ondataavailable = (item) => { if (item.data.size) earNow.chunks.push(item.data); };
            rec.start();
          }
          if (playing || gateRef.current === "speaking") {
            speakGen.current += 1;
            earNow.playback = false;
            stopSpeaker();
            setPhase("listening");
          }
          setHeard("Listening");
          return;
        }
        earNow.spoken += frame;
        earNow.cool = hot ? 0 : earNow.cool + frame;
        if (earNow.cool >= 0.32 || earNow.spoken > 15) {
          earNow.closing = true;
          void finishUtterance(earNow);
        }
      };
    } catch {
      listenFallback();
    }
  }

  async function finishUtterance(ear: Ear) {
    const rec = ear.recorder;
    ear.speaking = false;
    ear.hot = 0;
    ear.cool = 0;
    const blob = await new Promise<Blob>((resolve) => {
      if (!rec || rec.state === "inactive") {
        resolve(new Blob(ear.chunks, { type: rec?.mimeType || "audio/webm" }));
        return;
      }
      rec.onstop = () => resolve(new Blob(ear.chunks, { type: rec.mimeType || "audio/webm" }));
      try { rec.stop(); } catch { resolve(new Blob(ear.chunks, { type: rec.mimeType || "audio/webm" })); }
    });
    ear.recorder = null;
    ear.chunks = [];
    if (!live.current || blob.size < 800) {
      ear.closing = false;
      if (live.current && !mutedRef.current) listen();
      return;
    }
    setHeard("");
    let text = "";
    try {
      const audio = await blobToBase64(blob);
      const heard = await hearSarah({ data: { audio, mime: blob.type || "audio/webm" } });
      text = heard.text.trim();
    } catch {
      text = "";
    }
    ear.closing = false;
    if (!live.current || mutedRef.current) return;
    if (!text || isEcho(text, spokenRef.current)) {
      listen();
      return;
    }
    setHeard(text);
    if (busyRef.current) {
      pendingRef.current = text;
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

  function unsavedWork() {
    const fields = document.querySelectorAll("main textarea, main input[name]");
    return [...fields].some((node) => (node as HTMLInputElement).value.trim().length > 0);
  }

  function openTour(show: Tour) {
    setTour(show);
    if (show.ticketId) void navigate({ to: "/portal/tickets/$ticketId", params: { ticketId: show.ticketId } });
    else void navigate({ to: show.to });
  }

  function goTo(show: Tour) {
    if (unsavedWork()) {
      setLeave(show);
      return;
    }
    setLeave(null);
    openTour(show);
  }

  async function decide(decision: "confirm" | "cancel") {
    const id = actionRef.current;
    if (!token || !id || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = decision === "confirm"
        ? await confirmSarahAction({ data: { token, actionId: id } })
        : await cancelSarahAction({ data: { token, actionId: id } });
      actionRef.current = result.actionId;
      setActionId(result.actionId);
      setQuote(null);
      setReceipt(result.receipt);
      if (result.cartSku) addToCart(result.cartSku, 1);
      const text = decision === "confirm" && result.receipt && result.status === "succeeded" ? sentLine(result.receipt) : result.reply;
      const withReply = [...linesRef.current, { from: "sarah" as const, text }];
      linesRef.current = withReply;
      setLines(withReply);
      if (mode === "call" && live.current && result.receipt) void playSarah(text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sarah couldn't reach the desk.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function turn(text: string, channel: "chat" | "call") {
    const said = text.trim();
    if (!said || !token || busyRef.current) return;
    if (channel === "call" && isEcho(said, spokenRef.current)) return;
    const mine = ++speakGen.current;
    busyRef.current = true;
    setBusy(true);
    const history = linesRef.current.slice(-6).map((line) => ({ role: line.from === "sarah" ? "assistant" as const : "user" as const, content: line.text }));
    const nextLines = [...linesRef.current, { from: "you" as const, text: said }];
    linesRef.current = nextLines;
    setLines(nextLines);
    setDraft("");
    setError("");
    try {
      const result = await askSarah({ data: { token, text: said, channel, actionId: actionRef.current, history } });
      actionRef.current = result.actionId;
      setActionId(result.actionId);
      setQuote(result.quote);
      setReceipt(null);
      setNotice(result.notice || "");
      if (result.cartSku) addToCart(result.cartSku, 1);
      const withReply = [...linesRef.current, { from: "sarah" as const, text: result.reply, cards: result.cards }];
      linesRef.current = withReply;
      setLines(withReply);
      if (result.navigate && result.show) goTo(result.show);
      if (speakGen.current !== mine) return;
      if (channel === "call" && live.current) await playSarah(result.reply);
      else if (result.show) void playSarah(result.reply, true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sarah couldn't reach the desk.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      const next = pendingRef.current.trim();
      pendingRef.current = "";
      if (next && live.current && !mutedRef.current) void turn(next, "call");
      else if (channel === "call" && live.current && !mutedRef.current && gateRef.current === "idle") listen();
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
    startOffice();
    setLines([]);
    linesRef.current = [];
    actionRef.current = "";
    setActionId("");
    setQuote(null);
    setReceipt(null);
    await ringTwice();
    if (!live.current) return;
    setPhase("listening");
    listen();
    const greeting = [{ from: "sarah" as const, text: GREETING }];
    setLines(greeting);
    linesRef.current = greeting;
    await playSarah(GREETING);
    if (live.current && !mutedRef.current) listen();
  }

  function endCall() {
    live.current = false;
    stopRing();
    stopOffice();
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
    const toggle = () => { if (openRef.current) close(); else setOpen(true); };
    window.addEventListener("mts-sarah-toggle", toggle);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("mts-sarah-toggle", toggle);
    };
  }, []);

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) stopMic();
    else if (live.current) {
      const ear = earRef.current;
      if (ear) {
        ear.closing = false;
        ear.stream.getAudioTracks().forEach((track) => { track.enabled = true; });
      }
      void listenWithVad();
    }
  }

  useEffect(() => {
    if (!tour) {
      setBox(null);
      return;
    }
    let scrolled = false;
    const measure = () => {
      const nodes = [...document.querySelectorAll(`[data-guide="${tour.guide}"]`)] as HTMLElement[];
      const marked = nodes.find((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return rect.width > 8 && rect.height > 8 && style.display !== "none" && style.visibility !== "hidden";
      });
      const target = marked || (document.querySelector("main h1") as HTMLElement | null);
      if (!target) return;
      if (!scrolled) {
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        scrolled = true;
      }
      const rect = target.getBoundingClientRect();
      setBox({
        top: Math.max(8, rect.top - 6),
        left: Math.max(8, rect.left - 6),
        width: Math.min(rect.width + 12, window.innerWidth - 16),
        height: rect.height + 12,
      });
    };
    const timers = [250, 700, 1400].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [tour]);

  useEffect(() => {
    if (mode !== "call") return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines, mode]);

  useEffect(() => {
    if (!open || !token) return;
    void getSarahQuote({ data: { token } }).then((saved) => {
      if (!saved.actionId) return;
      actionRef.current = saved.actionId;
      setActionId(saved.actionId);
      setQuote(saved.quote);
    }).catch(() => undefined);
  }, [open, token]);

  const talking = gate === "speaking" || gate === "cooldown";
  const hearing = gate === "listening";
  const full = open && mode !== "menu" && !tour;
  const touring = Boolean(tour) && !wide;
  const place = wide && spot && !tour ? { right: spot.right, bottom: spot.bottom } : undefined;

  return (
    <div
      className={touring ? "fixed inset-x-0 top-0 z-50 flex" : full ? "fixed inset-0 z-50 flex md:inset-auto md:right-4 md:bottom-4 md:w-[24rem]" : open ? "fixed inset-x-0 bottom-0 z-50 flex justify-end md:inset-x-auto md:right-4 md:bottom-4 md:w-[24rem]" : "fixed z-50 hidden md:right-4 md:bottom-4 md:flex"}
      style={touring ? { paddingTop: "env(safe-area-inset-top)" } : full && !wide ? undefined : { ...place, paddingBottom: place ? undefined : "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
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
                <div key={`${line.from}-${index}`} className={line.from === "you" ? "max-w-[80%] self-end" : "grid max-w-[80%] gap-2 self-start"}>
                  <p className={line.from === "you" ? "rounded-2xl rounded-br-md bg-[#d9fdd3] px-3 py-2 text-sm text-[#111]" : "rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-[#111] shadow-sm"}>
                    {line.text}
                  </p>
                  {line.cards?.map((card) => (
                    <div key={card.title} className="rounded-xl border border-line bg-white px-3 py-2 text-sm">
                      <p className="font-semibold">{card.title}</p>
                      <p className="text-muted">{card.detail}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {notice ? <p className="bg-[#fff7e8] px-3 py-2 text-xs text-[#6d5105]">{notice}</p> : null}
            {leave ? (
              <div className="grid gap-2 bg-white px-3 py-2">
                <p className="text-sm">You have something typed on this page. Leave it and open {leave.label}?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLeave(null)} className="h-10 flex-1 rounded-full border border-line text-sm font-semibold">Stay</button>
                  <button type="button" onClick={() => { const next = leave; setLeave(null); if (next) openTour(next); }} className="h-10 flex-1 rounded-full bg-[#075e54] text-sm font-semibold text-white">Leave</button>
                </div>
              </div>
            ) : null}
            {actionId ? (
              <div className="grid gap-2 bg-white px-3 py-2">
                {quote ? (
                  <div>
                    <p className="text-sm font-semibold">{quote.title}</p>
                    <p className="text-sm">{quote.amount}</p>
                    <p className="text-xs text-muted">{quote.detail}</p>
                  </div>
                ) : <p className="text-sm">Confirm this before I send it.</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => void decide("confirm")} className="h-10 flex-1 rounded-full bg-[#075e54] text-sm font-semibold text-white">Confirm</button>
                  <button type="button" onClick={() => void decide("cancel")} className="h-10 flex-1 rounded-full border border-line text-sm font-semibold">Cancel</button>
                </div>
              </div>
            ) : null}
            {receipt ? (
              <div className="grid gap-1 bg-[#d6f3e3] px-3 py-2">
                <p className="text-sm font-semibold text-[#16452f]">Sent</p>
                <p className="text-sm text-[#16452f]">{receipt.reference} is in at {receipt.amount}.</p>
                <p className="text-xs text-[#21764f]">{receipt.note}</p>
              </div>
            ) : null}
            {error ? <p className="bg-white px-3 pb-1 text-sm text-bad">{error}</p> : null}
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
              {notice ? <p className="text-center text-sm text-amber-200">{notice}</p> : null}
              {receipt ? (
                <div className="grid gap-1 rounded-xl bg-emerald-900/60 px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-emerald-200">Sent</p>
                  <p className="text-sm">{receipt.reference} is in at {receipt.amount}.</p>
                  <p className="text-xs text-emerald-100/80">{receipt.note}</p>
                </div>
              ) : null}
              <button type="button" onClick={() => { speakGen.current += 1; stopSpeaker(); setPhase("idle"); }} className="mx-auto h-10 rounded-full bg-white/10 px-4 text-sm">Stop speaking</button>
              {actionId ? (
                <div className="grid gap-2">
                  {quote ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold">{quote.title}</p>
                      <p className="text-sm">{quote.amount}</p>
                      <p className="text-xs text-white/70">{quote.detail}</p>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void decide("confirm")} className="h-11 flex-1 rounded-full bg-white text-sm font-semibold text-[#101418]">Confirm</button>
                    <button type="button" onClick={() => void decide("cancel")} className="h-11 flex-1 rounded-full bg-white/10 text-sm font-semibold">Cancel</button>
                  </div>
                </div>
              ) : null}
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
              <button type="button" onClick={() => { const hello = [{ from: "sarah" as const, text: "Hi! I'm Sarah with Manage Tech Service. What can I help you with?" }]; linesRef.current = hello; setLines(hello); setMode("chat"); }} className="grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold">
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
        <button
          type="button"
          aria-label="Talk to Sarah"
          aria-expanded={open}
          onPointerDown={(event) => {
            unlockAudio();
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
            if (open && mode === "menu") close();
            else setOpen(true);
          }}
          className={full ? "hidden" : "grid size-16 cursor-grab place-items-center self-end rounded-full bg-[#f3f3f3] text-[#4a4a4a] shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-4 ring-white active:cursor-grabbing"}
        >
          <AgentMark />
        </button>
      </div>
      {box && tour ? (
        <div className="pointer-events-none fixed z-[80] rounded-2xl ring-4 ring-[#127e86]" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
          <span className="absolute -top-8 left-0 rounded-full bg-[#127e86] px-2 py-1 text-xs font-semibold text-white">Sarah is showing {tour.label}</span>
        </div>
      ) : null}
    </div>
  );
}

export function SarahHeaderButton() {
  return (
    <button type="button" className="grid size-10 place-items-center rounded-xl md:hidden" aria-label="Talk to Sarah" onClick={() => window.dispatchEvent(new Event("mts-sarah-toggle"))}>
      <AgentMark className="size-6" />
    </button>
  );
}

type Ear = {
  stream: MediaStream;
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode | null;
  mute: GainNode | null;
  ring: Float32Array;
  write: number;
  filled: number;
  startAt: number;
  speaking: boolean;
  hot: number;
  cool: number;
  floor: number;
  spoken: number;
  closing: boolean;
  playback: boolean;
  recorder: MediaRecorder | null;
  chunks: Blob[];
};

async function openEar() {
  const audio = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 16000,
    voiceIsolation: true,
    googEchoCancellation: true,
    googNoiseSuppression: true,
    googAutoGainControl: true,
    googHighpassFilter: true,
    googEchoCancellation2: true,
  };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: audio as MediaTrackConstraints });
  const track = stream.getAudioTracks()[0];
  if (track) {
    await track.applyConstraints({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    }).catch(() => undefined);
  }
  const ctx = new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  const rate = ctx.sampleRate;
  return {
    stream,
    ctx,
    source,
    processor: null,
    mute: null,
    ring: new Float32Array(rate * 12),
    write: 0,
    filled: 0,
    startAt: 0,
    speaking: false,
    hot: 0,
    cool: 0,
    floor: 0.008,
    spoken: 0,
    closing: false,
    playback: false,
    recorder: null,
    chunks: [],
  };
}

function takeRing(ear: Ear) {
  const count = Math.min(ear.filled, ear.write >= ear.startAt ? ear.write - ear.startAt : ear.ring.length - ear.startAt + ear.write);
  const out = new Float32Array(count);
  for (let index = 0; index < count; index += 1) out[index] = ear.ring[(ear.startAt + index) % ear.ring.length];
  return out;
}

function downsample(input: Float32Array, from: number, to: number) {
  if (from === to) return input;
  const ratio = from / to;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const out = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const pos = index * ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, input.length - 1);
    const mix = pos - left;
    out[index] = input[left] * (1 - mix) + input[right] * mix;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
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
