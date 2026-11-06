import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useNavigate, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as signOut } from "./client-Dl8dG0gA.mjs";
import { h as getSessionHome } from "./api-CEXWu3z6.mjs";
import { t as useCurrentUser } from "./use-current-user-D9YQRpMJ.mjs";
import { B as ClipboardList, C as Mic, D as LogOut, I as House, L as Headphones, T as Menu, _ as Phone, f as Settings, h as Receipt, p as Send, q as Bell, t as X, v as PhoneOff, w as MicOff } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useShopToken, t as setShopToken } from "./shop-session-BlA38aat.mjs";
import { t as usePortalSession } from "./use-portal-session-DNENLyBs.mjs";
import { i as useCart, t as addToCart } from "./store-cart-C_9hSDdQ.mjs";
import { a as speakSarah, n as getSarahQuote, r as hearSarah, t as askSarah } from "./sarah-PMAGRA0B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customer-portal-DM12X9hv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GREETING = "Thank you for calling Manage Tech Service. This is Sarah. How can I help you today?";
function AgentMark({ className = "size-11" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 64 64",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 27a16 16 0 0 1 32 0",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "4.4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "7",
				y: "23",
				width: "10",
				height: "15",
				rx: "3",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "47",
				y: "23",
				width: "10",
				height: "15",
				rx: "3",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 16c8.4 0 15 6.4 15 14.4 0 6.2-3.4 10.4-8.2 13.2L32 54l-6.8-10.4C20.4 40.8 17 36.6 17 30.4 17 22.4 23.6 16 32 16z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "25.5",
				cy: "31",
				r: "1.8",
				fill: "#f4f7f7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "32",
				cy: "31",
				r: "1.8",
				fill: "#f4f7f7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "38.5",
				cy: "31",
				r: "1.8",
				fill: "#f4f7f7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M52 38c5 2 8 6 7 12",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "58",
				cy: "52",
				r: "2.5",
				fill: "currentColor"
			})
		]
	});
}
function words(value) {
	return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function isEcho(heard, spoken) {
	const a = words(heard);
	const b = words(spoken);
	if (a.length < 12 || b.length < 12) return false;
	if (b.includes(a) || a.includes(b)) return true;
	const mine = new Set(a.split(" "));
	const theirs = b.split(" ").filter((word) => word.length > 3);
	if (theirs.length < 4) return false;
	return theirs.filter((word) => mine.has(word)).length / theirs.length > .55;
}
function clock(seconds) {
	return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function SarahWidget() {
	const token = useShopToken();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("menu");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [leave, setLeave] = (0, import_react.useState)(null);
	const [gate, setGate] = (0, import_react.useState)("idle");
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)("");
	const [heard, setHeard] = (0, import_react.useState)("");
	const hearGen = (0, import_react.useRef)(0);
	const [tour, setTour] = (0, import_react.useState)(null);
	const [box, setBox] = (0, import_react.useState)(null);
	const live = (0, import_react.useRef)(false);
	const gateRef = (0, import_react.useRef)("idle");
	const mutedRef = (0, import_react.useRef)(false);
	const busyRef = (0, import_react.useRef)(false);
	const spokenRef = (0, import_react.useRef)("");
	const dockAudio = (0, import_react.useRef)(null);
	const recRef = (0, import_react.useRef)(null);
	const earRef = (0, import_react.useRef)(null);
	const ringRef = (0, import_react.useRef)(null);
	const scroller = (0, import_react.useRef)(null);
	const linesRef = (0, import_react.useRef)([]);
	const speakGen = (0, import_react.useRef)(0);
	const actionRef = (0, import_react.useRef)("");
	const [actionId, setActionId] = (0, import_react.useState)("");
	const [quote, setQuote] = (0, import_react.useState)(null);
	function setPhase(next) {
		gateRef.current = next;
		setGate(next);
	}
	function stopRing() {
		const ctx = ringRef.current;
		ringRef.current = null;
		if (ctx && ctx.state !== "closed") ctx.close().catch(() => void 0);
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
		if (ear.ctx.state !== "closed") ear.ctx.close().catch(() => void 0);
	}
	function stopMic() {
		hearGen.current += 1;
		const rec = recRef.current;
		recRef.current = null;
		try {
			rec?.abort();
		} catch {
			try {
				rec?.stop();
			} catch {}
		}
		const ear = earRef.current;
		if (ear) {
			window.clearInterval(ear.timer);
			ear.timer = 0;
			ear.closing = true;
			if (ear.recorder && ear.recorder.state !== "inactive") {
				ear.recorder.onstop = null;
				try {
					ear.recorder.stop();
				} catch {}
			}
			ear.stream.getAudioTracks().forEach((track) => {
				track.enabled = false;
			});
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
		audio.play().then(() => audio.pause()).catch(() => void 0);
	}
	function playDocked(src) {
		const audio = dockAudio.current;
		if (!audio) return Promise.resolve();
		return new Promise((resolve) => {
			const done = () => {
				audio.onended = null;
				audio.onerror = null;
				resolve();
			};
			audio.onended = done;
			audio.onerror = done;
			audio.src = src;
			audio.play().catch(done);
		});
	}
	function speakBrowser(text) {
		return new Promise((resolve) => {
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
	async function playSarah(text, background = false) {
		stopMic();
		stopSpeaker();
		spokenRef.current = text;
		setPhase("speaking");
		const spoken = await speakSarah({ data: { text } }).catch(() => ({ audio: "" }));
		if (!background && !live.current) {
			setPhase("idle");
			return;
		}
		if (spoken.audio) await playDocked(`data:audio/mpeg;base64,${spoken.audio}`);
		else await speakBrowser(text);
		if (!live.current || gateRef.current !== "speaking") {
			if (!live.current) setPhase("idle");
			return;
		}
		setPhase("cooldown");
		await new Promise((resolve) => window.setTimeout(resolve, 280));
		setPhase("idle");
	}
	function listen() {
		if (!live.current || mutedRef.current || busyRef.current) return;
		if (gateRef.current === "ringing" || gateRef.current === "speaking" || gateRef.current === "cooldown" || gateRef.current === "listening") return;
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Recognition) {
			listenWithVad();
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
			turn(said, "call");
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
		try {
			rec.start();
		} catch {
			setPhase("idle");
			listenWithVad();
		}
	}
	async function listenWithVad() {
		try {
			const ear = earRef.current ?? await openEar();
			earRef.current = ear;
			if (!live.current || mutedRef.current || busyRef.current) {
				if (!live.current) stopEar();
				return;
			}
			ear.stream.getAudioTracks().forEach((track) => {
				track.enabled = true;
			});
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
				const hot = level > Math.max(.008, ear.floor * 1.7);
				if (!ear.speaking && !hot) ear.floor = ear.floor * .92 + level * .08;
				if (!ear.speaking) {
					ear.hot = hot ? ear.hot + 1 : 0;
					if (ear.hot < 3) return;
					ear.speaking = true;
					ear.cool = 0;
					ear.spoken = 0;
					ear.chunks = [];
					const rec = mime ? new MediaRecorder(ear.stream, { mimeType: mime }) : new MediaRecorder(ear.stream);
					ear.recorder = rec;
					rec.ondataavailable = (event) => {
						if (event.data.size) ear.chunks.push(event.data);
					};
					rec.start(250);
					return;
				}
				ear.cool = hot ? 0 : ear.cool + 1;
				ear.spoken += 1;
				if (ear.closing) return;
				if (ear.cool >= 16 || ear.spoken > 200) {
					ear.closing = true;
					finishUtterance(ear);
				}
			}, 50);
		} catch {
			listenFallback();
		}
	}
	async function finishUtterance(ear) {
		if (ear.timer) {
			window.clearInterval(ear.timer);
			ear.timer = 0;
		}
		const rec = ear.recorder;
		ear.speaking = false;
		const blob = await new Promise((resolve) => {
			if (!rec || rec.state === "inactive") {
				resolve(new Blob(ear.chunks, { type: rec?.mimeType || "audio/webm" }));
				return;
			}
			rec.onstop = () => resolve(new Blob(ear.chunks, { type: rec.mimeType || "audio/webm" }));
			rec.stop();
		});
		ear.stream.getAudioTracks().forEach((track) => {
			track.enabled = false;
		});
		setPhase("idle");
		if (!live.current) return;
		if (blob.size < 900) {
			listen();
			return;
		}
		const audio = await blobToBase64(blob);
		const text = (await hearSarah({ data: {
			audio,
			mime: blob.type || "audio/webm"
		} }).catch(() => ({ text: "" }))).text.trim();
		if (!live.current || mutedRef.current) return;
		if (!text || isEcho(text, spokenRef.current)) {
			listen();
			return;
		}
		turn(text, "call");
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
			turn(text, "call");
		};
		rec.onerror = () => {
			if (recRef.current === rec) stopMic();
		};
		rec.onend = () => {
			if (recRef.current !== rec) return;
			recRef.current = null;
			if (gateRef.current === "listening") setPhase("idle");
		};
		try {
			rec.start();
		} catch {
			setPhase("idle");
		}
	}
	async function ringTwice() {
		stopRing();
		const ctx = new AudioContext();
		ringRef.current = ctx;
		const burst = (at) => {
			for (const freq of [440, 480]) {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = freq;
				gain.gain.setValueAtTime(0, at);
				gain.gain.linearRampToValueAtTime(.05, at + .03);
				gain.gain.setValueAtTime(.05, at + .95);
				gain.gain.linearRampToValueAtTime(0, at + 1.05);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(at);
				osc.stop(at + 1.06);
			}
		};
		const now = ctx.currentTime + .05;
		burst(now);
		burst(now + 1.7);
		await new Promise((resolve) => window.setTimeout(resolve, 2900));
		if (ringRef.current === ctx) {
			ringRef.current = null;
			if (ctx.state !== "closed") await ctx.close().catch(() => void 0);
		}
	}
	function unsavedWork() {
		return [...document.querySelectorAll("main textarea, main input[name]")].some((node) => node.value.trim().length > 0);
	}
	function openTour(show) {
		setTour(show);
		if (show.ticketId) navigate({
			to: "/portal/tickets/$ticketId",
			params: { ticketId: show.ticketId }
		});
		else navigate({ to: show.to });
	}
	function goTo(show) {
		if (unsavedWork()) {
			setLeave(show);
			return;
		}
		setLeave(null);
		openTour(show);
	}
	async function turn(text, channel) {
		const said = text.trim();
		if (!said || !token || busyRef.current) return;
		if (channel === "call" && isEcho(said, spokenRef.current)) return;
		const mine = ++speakGen.current;
		stopMic();
		busyRef.current = true;
		setBusy(true);
		const history = linesRef.current.slice(-6).map((line) => ({
			role: line.from === "sarah" ? "assistant" : "user",
			content: line.text
		}));
		const nextLines = [...linesRef.current, {
			from: "you",
			text: said
		}];
		linesRef.current = nextLines;
		setLines(nextLines);
		setDraft("");
		setError("");
		try {
			const result = await askSarah({ data: {
				token,
				text: said,
				channel,
				actionId: actionRef.current,
				history
			} });
			actionRef.current = result.actionId;
			setActionId(result.actionId);
			setQuote(result.quote);
			setNotice(result.notice || "");
			if (result.cartSku) addToCart(result.cartSku, 1);
			const withReply = [...linesRef.current, {
				from: "sarah",
				text: result.reply,
				cards: result.cards
			}];
			linesRef.current = withReply;
			setLines(withReply);
			if (result.navigate && result.show) goTo(result.show);
			if (speakGen.current !== mine) return;
			if (channel === "call" && live.current) await playSarah(result.reply);
			else if (result.show) playSarah(result.reply, true);
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
		actionRef.current = "";
		setActionId("");
		setQuote(null);
		await ringTwice();
		if (!live.current) return;
		const greeting = [{
			from: "sarah",
			text: GREETING
		}];
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
	(0, import_react.useEffect)(() => {
		if (!tour) {
			setBox(null);
			return;
		}
		const timer = window.setTimeout(() => {
			const heading = document.querySelector("main h1, main h2");
			const marked = document.querySelector(`[data-guide="${tour.guide}"]`);
			const target = heading || marked;
			if (!target) return;
			target.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
			const rect = target.getBoundingClientRect();
			setBox({
				top: Math.max(8, rect.top - 6),
				left: Math.max(8, rect.left - 6),
				width: rect.width + 12,
				height: rect.height + 12
			});
		}, 400);
		return () => window.clearTimeout(timer);
	}, [tour]);
	(0, import_react.useEffect)(() => {
		if (mode !== "call") return;
		const id = window.setInterval(() => setSeconds((value) => value + 1), 1e3);
		return () => window.clearInterval(id);
	}, [mode]);
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
	}, [lines, mode]);
	(0, import_react.useEffect)(() => {
		if (!open || !token) return;
		getSarahQuote({ data: { token } }).then((saved) => {
			if (!saved.actionId) return;
			actionRef.current = saved.actionId;
			setActionId(saved.actionId);
			setQuote(saved.quote);
		}).catch(() => void 0);
	}, [open, token]);
	const talking = gate === "speaking" || gate === "cooldown";
	const hearing = gate === "listening";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: open && mode !== "menu" && !tour ? "fixed inset-0 z-40 flex md:inset-auto md:right-4 md:bottom-4 md:w-[24rem]" : "fixed inset-x-0 bottom-0 z-40 flex justify-end md:inset-x-auto md:right-4",
		style: open && mode !== "menu" && !tour ? void 0 : { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: open && mode !== "menu" && !tour ? "flex h-full w-full flex-col" : "flex w-full flex-col items-stretch gap-2 px-3 md:w-[24rem] md:items-end md:px-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
					ref: dockAudio,
					playsInline: true,
					preload: "auto",
					className: "hidden"
				}),
				open && mode === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: tour ? "grid max-h-64 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl bg-[#efeae2] shadow-2xl" : "grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#efeae2] md:h-[min(100dvh-2rem,40rem)] md:rounded-2xl md:shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "flex h-14 items-center gap-3 bg-[#075e54] px-3 text-white",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Close chat",
									onClick: () => setMode("menu"),
									className: "grid size-10 place-items-center rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 place-items-center rounded-full bg-white/15",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMark, { className: "size-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-semibold",
										children: "Sarah"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-white/80",
										children: "Manage Tech Service"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: scroller,
							className: "flex min-h-0 flex-col gap-2 overflow-y-auto px-3 py-3",
							children: lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: line.from === "you" ? "max-w-[80%] self-end" : "grid max-w-[80%] gap-2 self-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: line.from === "you" ? "rounded-2xl rounded-br-md bg-[#d9fdd3] px-3 py-2 text-sm text-[#111]" : "rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-[#111] shadow-sm",
									children: line.text
								}), line.cards?.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-line bg-white px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: card.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted",
										children: card.detail
									})]
								}, card.title))]
							}, `${line.from}-${index}`))
						}),
						notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "bg-[#fff7e8] px-3 py-2 text-xs text-[#6d5105]",
							children: notice
						}) : null,
						leave ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 bg-white px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [
									"You have something typed on this page. Leave it and open ",
									leave.label,
									"?"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLeave(null),
									className: "h-10 flex-1 rounded-full border border-line text-sm font-semibold",
									children: "Stay"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										const next = leave;
										setLeave(null);
										if (next) openTour(next);
									},
									className: "h-10 flex-1 rounded-full bg-[#075e54] text-sm font-semibold text-white",
									children: "Leave"
								})]
							})]
						}) : null,
						actionId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 bg-white px-3 py-2",
							children: [quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: quote.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: quote.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: quote.detail
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: "Confirm this before I send it."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void turn("Yes, I confirm.", "chat"),
									className: "h-10 flex-1 rounded-full bg-[#075e54] text-sm font-semibold text-white",
									children: "Confirm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void turn("No, cancel that.", "chat"),
									className: "h-10 flex-1 rounded-full border border-line text-sm font-semibold",
									children: "Cancel"
								})]
							})]
						}) : null,
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "bg-white px-3 py-1 text-xs text-muted",
							children: "Sarah is sending that through."
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "bg-white px-3 pb-1 text-sm text-bad",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex items-center gap-2 bg-[#f0f2f5] px-3 py-2",
							style: { paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" },
							onSubmit: (event) => {
								event.preventDefault();
								turn(draft, "chat");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft,
								onChange: (event) => setDraft(event.target.value),
								placeholder: "Message",
								"aria-label": "Message Sarah",
								className: "h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy || !draft.trim(),
								"aria-label": "Send",
								className: "grid size-11 shrink-0 place-items-center rounded-full bg-[#075e54] text-white disabled:opacity-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
							})]
						})
					]
				}) : null,
				open && mode === "call" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: tour ? "grid w-full grid-rows-[auto_auto] overflow-hidden rounded-2xl bg-[#101418] text-white shadow-2xl" : "grid h-full min-h-0 w-full grid-rows-[1fr_auto] overflow-hidden bg-[#101418] text-white md:h-[min(100dvh-2rem,40rem)] md:rounded-2xl md:shadow-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid content-center justify-items-center gap-3 px-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.2em] text-white/60",
								children: "MANAGE TECH SERVICE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative grid size-32 place-items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: talking || hearing ? "absolute inset-0 animate-ping rounded-full bg-white/10" : "absolute inset-2 rounded-full bg-white/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "relative grid size-24 place-items-center rounded-full bg-[#1c242b]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMark, { className: "size-14" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl font-semibold",
								children: "Sarah"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-white/70",
								children: clock(seconds)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-emerald-300",
								children: gate === "ringing" ? "Ringing" : talking ? "Speaking" : hearing ? "Listening" : busy ? "One moment" : muted ? "Muted" : "On the line"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "line-clamp-3 max-w-xs text-sm text-white/80",
								children: gate === "ringing" ? "Calling Sarah" : heard ? heard : lines.at(-1)?.text
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 px-4 pt-2",
						style: { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" },
						children: [
							notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-sm text-amber-200",
								children: notice
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									speakGen.current += 1;
									stopSpeaker();
									setPhase("idle");
								},
								className: "mx-auto h-10 rounded-full bg-white/10 px-4 text-sm",
								children: "Stop speaking"
							}),
							actionId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: quote.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm",
											children: quote.amount
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-white/70",
											children: quote.detail
										})
									]
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void turn("Yes, I confirm.", "call"),
										className: "h-11 flex-1 rounded-full bg-white text-sm font-semibold text-[#101418]",
										children: "Confirm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void turn("No, cancel that.", "call"),
										className: "h-11 flex-1 rounded-full bg-white/10 text-sm font-semibold",
										children: "Cancel"
									})]
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex gap-2",
								onSubmit: (event) => {
									event.preventDefault();
									unlockAudio();
									turn(draft, "call");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: draft,
									onChange: (event) => setDraft(event.target.value),
									placeholder: "Type if you need to",
									"aria-label": "Say this to Sarah",
									className: "h-11 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-sm outline-none"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: busy || !draft.trim(),
									"aria-label": "Send",
									className: "grid size-11 place-items-center rounded-full bg-white/15 disabled:opacity-40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: toggleMute,
									"aria-label": muted ? "Unmute" : "Mute",
									className: "grid size-16 place-items-center rounded-full bg-white/10",
									children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-6" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: endCall,
									"aria-label": "End call",
									className: "grid size-20 place-items-center rounded-full bg-[#e23b3b]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, { className: "size-7" })
								})]
							})
						]
					})]
				}) : null,
				open && mode === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid w-full gap-3 self-end rounded-2xl border border-line bg-surface p-4 shadow-lg md:w-80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Sarah"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close support",
							onClick: close,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								const hello = [{
									from: "sarah",
									text: "Hi! I'm Sarah with Manage Tech Service. What can I help you with?"
								}];
								linesRef.current = hello;
								setLines(hello);
								setMode("chat");
							},
							className: "grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-5" }), "Chat"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void startCall(),
							className: "grid h-20 place-items-center gap-1 rounded-xl border border-line text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-5" }), "Call"]
						})]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Talk to Sarah",
					"aria-expanded": open,
					onPointerDown: unlockAudio,
					onClick: () => open && mode === "menu" ? close() : setOpen(true),
					className: open && mode !== "menu" && !tour ? "hidden" : "grid size-16 place-items-center self-end rounded-full bg-[#f3f3f3] text-[#4a4a4a] shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-4 ring-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMark, {})
				})
			]
		}), box && tour ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none fixed z-30 rounded-2xl ring-4 ring-[#127e86]",
			style: {
				top: box.top,
				left: box.left,
				width: box.width,
				height: box.height
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute -top-8 left-0 rounded-full bg-[#127e86] px-2 py-1 text-xs font-semibold text-white",
				children: ["Sarah is showing ", tour.label]
			})
		}) : null]
	});
}
async function openEar() {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: {
		echoCancellation: true,
		noiseSuppression: true,
		autoGainControl: true,
		channelCount: 1
	} });
	const ctx = new AudioContext();
	if (ctx.state === "suspended") await ctx.resume();
	const source = ctx.createMediaStreamSource(stream);
	const analyser = ctx.createAnalyser();
	analyser.fftSize = 1024;
	source.connect(analyser);
	return {
		stream,
		ctx,
		analyser,
		recorder: null,
		chunks: [],
		timer: 0,
		speaking: false,
		hot: 0,
		cool: 0,
		floor: .008,
		spoken: 0,
		closing: false
	};
}
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}
var NAV = [
	{
		to: "/portal",
		label: "Home",
		icon: House,
		exact: true,
		guide: "home"
	},
	{
		to: "/portal/tickets",
		label: "Tickets",
		icon: Headphones,
		guide: "tickets"
	},
	{
		to: "/portal/shop",
		label: "Order",
		icon: ClipboardList,
		guide: "order"
	},
	{
		to: "/portal/orders",
		label: "My orders",
		icon: ClipboardList,
		guide: "orders"
	},
	{
		to: "/portal/billing",
		label: "Billing",
		icon: Receipt,
		guide: "billing"
	},
	{
		to: "/portal/complaints",
		label: "Complaints",
		icon: Headphones,
		guide: "complaints"
	},
	{
		to: "/portal/organization",
		label: "Organization",
		icon: House,
		guide: "organization"
	},
	{
		to: "/portal/account",
		label: "Account",
		icon: Settings,
		guide: "account"
	}
];
function PortalShell({ children }) {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const session = usePortalSession();
	const user = useCurrentUser();
	const home = useQuery({
		queryKey: ["session-home"],
		queryFn: () => getSessionHome()
	});
	const cart = useCart();
	const [menu, setMenu] = (0, import_react.useState)(false);
	const current = NAV.find((item) => "exact" in item && item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`));
	const name = user?.displayName || session.data?.customer.name || "there";
	const count = cart.reduce((sum, line) => sum + line.quantity, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-dvh grid-rows-[auto_minmax(0,1fr)] bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/portal",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-8 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-white",
								children: "MT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm font-semibold sm:inline",
								children: "MTS User Portal"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-1 overflow-x-auto md:flex",
							"aria-label": "Customer",
							children: NAV.map((item) => {
								const active = current?.to === item.to;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									"data-guide": item.guide,
									className: active ? "shrink-0 rounded-lg bg-ink px-3 py-2 text-sm text-white" : "shrink-0 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-2",
									children: item.label
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/portal/shop",
									className: "relative grid size-11 place-items-center rounded-xl",
									"aria-label": "Order",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "size-5" }), count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-1 right-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-semibold leading-4 text-white",
										children: count
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/portal/notifications",
									className: "grid size-11 place-items-center rounded-xl",
									"aria-label": "Notifications",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" })
								}),
								home.data?.destination === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/",
									className: "hidden px-2 text-xs font-semibold text-accent sm:inline",
									children: "Admin"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-xl md:hidden",
									"aria-label": "Open menu",
									onClick: () => setMenu(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hidden size-11 place-items-center rounded-xl md:grid",
									"aria-label": "Sign out",
									onClick: () => {
										setShopToken("");
										signOut("/login");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-5" })
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto hidden w-full max-w-6xl truncate px-4 pb-2 text-xs text-muted md:block",
					children: session.data?.organization || session.data?.business || user?.primaryEmail || name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 px-4 py-5 md:px-6",
				children
			}),
			menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "absolute inset-0 bg-ink/40",
					"aria-label": "Close",
					onClick: () => setMenu(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 top-0 grid gap-1 bg-surface p-4 shadow-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Close menu",
								onClick: () => setMenu(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							"data-guide": item.guide,
							onClick: () => setMenu(false),
							className: "rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface-2",
							children: item.label
						}, item.to)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "rounded-xl px-3 py-3 text-left text-sm font-medium",
							onClick: () => {
								setMenu(false);
								setShopToken("");
								signOut("/login");
							},
							children: "Sign out"
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SarahWidget, {})
		]
	});
}
function Locked({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid max-w-lg gap-2 rounded-2xl border border-line bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-lg font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: body
		})]
	});
}
//#endregion
export { PortalShell as n, Locked as t };
