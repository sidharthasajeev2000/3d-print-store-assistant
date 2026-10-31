(function () {
  const cfg = window.STORE_CONFIG;
  const bot = window.StoreBot;
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const els = {
    mascot: document.getElementById("mascot"),
    stack: document.getElementById("bubbleStack"),
    form: document.getElementById("composer"),
    input: document.getElementById("userInput"),
    mute: document.getElementById("muteToggle"),
    mic: document.getElementById("micBtn"),
    name: document.getElementById("botNameLabel"),
  };

  const state = {
    muted: localStorage.getItem("silver.muted") === "1",
    quoteMode: false,
    quoteStep: 0,
    quoteData: {},
    speaking: false,
    busy: false,
    recognition: null,
    listening: false,
  };

  els.name.textContent = cfg.botName || "Silver";
  applyMuteUI();

  function setMascotState(s) {
    els.mascot.dataset.state = s;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatLines(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function scrollBubbles() {
    els.stack.scrollTop = els.stack.scrollHeight;
  }

  function addUserBubble(text) {
    const div = document.createElement("div");
    div.className = "bubble user done";
    div.innerHTML = formatLines(text);
    els.stack.appendChild(div);
    scrollBubbles();
  }

  function sendActionsHtml(summary) {
    const wa = bot.whatsappLink(summary);
    const mail = bot.mailtoLink(summary);
    let html = '<div class="handoff-actions">';
    if (wa) {
      html += `<a class="btn-send" data-testid="send-whatsapp" href="${escapeHtml(wa)}" target="_blank" rel="noopener">Send via WhatsApp</a>`;
    } else {
      html +=
        '<span class="hint">WhatsApp not configured — set whatsappNumber in config.js</span>';
    }
    html += `<a class="btn-send secondary" data-testid="send-email" href="${escapeHtml(mail)}">Send via Email</a>`;
    html += "</div>";
    return html;
  }

  function speak(text) {
    return new Promise((resolve) => {
      if (state.muted || !window.speechSynthesis || reduced) {
        resolve();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/\n+/g, ". "));
        u.rate = 1.02;
        u.pitch = 1.15;
        u.lang = "en-IN";
        const voices = window.speechSynthesis.getVoices();
        const prefer =
          voices.find((v) => /en-IN/i.test(v.lang) && /female|woman|samantha|google/i.test(v.name)) ||
          voices.find((v) => /en-IN/i.test(v.lang)) ||
          voices.find((v) => /^en/i.test(v.lang) && /female|woman|samantha/i.test(v.name)) ||
          voices.find((v) => /^en/i.test(v.lang));
        if (prefer) u.voice = prefer;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      } catch (_) {
        resolve();
      }
    });
  }

  async function typewriterBubble(text, extraHtml) {
    const div = document.createElement("div");
    div.className = "bubble";
    const typed = document.createElement("span");
    typed.className = "typed";
    div.appendChild(typed);
    els.stack.appendChild(div);
    scrollBubbles();

    setMascotState("talking");
    state.speaking = true;
    const speakPromise = speak(text);

    const full = String(text);
    if (reduced) {
      typed.innerHTML = formatLines(full);
    } else {
      let i = 0;
      const step = Math.max(1, Math.floor(full.length / 180));
      await new Promise((resolve) => {
        const tick = () => {
          i = Math.min(full.length, i + step);
          typed.innerHTML = formatLines(full.slice(0, i));
          scrollBubbles();
          if (i >= full.length) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    if (extraHtml) {
      const wrap = document.createElement("div");
      wrap.innerHTML = extraHtml;
      div.appendChild(wrap);
    }
    div.classList.add("done");
    await speakPromise;
    state.speaking = false;
    setMascotState(state.listening ? "listening" : "idle");
    scrollBubbles();
    return div;
  }

  function cancelQuote() {
    state.quoteMode = false;
    state.quoteStep = 0;
    state.quoteData = {};
  }

  function startQuotePrompt() {
    state.quoteMode = true;
    state.quoteStep = 0;
    state.quoteData = {};
    const step = cfg.quoteSteps[0];
    return (
      "Sure — I’ll collect a few details, then you can send them to Sidhartha.\n\n" +
      step.prompt
    );
  }

  async function handleQuoteAnswer(text) {
    const step = cfg.quoteSteps[state.quoteStep];
    state.quoteData[step.key] = text.trim();
    state.quoteStep += 1;
    if (state.quoteStep >= cfg.quoteSteps.length) {
      const summary = bot.buildQuoteSummary(state.quoteData);
      cancelQuote();
      await typewriterBubble(
        "Here’s your request summary:\n\n" + summary + "\n\n" + cfg.handoffMessage,
        sendActionsHtml(summary)
      );
      return;
    }
    const next = cfg.quoteSteps[state.quoteStep];
    await typewriterBubble(next.prompt);
  }

  function detectIntent(text) {
    const n = String(text || "").toLowerCase();
    if (/^(start quote|get a quote|quote|order|i want a quote)$/i.test(n.trim())) return "quote";
    if (/\b(talk to|human|sidhartha|owner|person)\b/.test(n)) return "human";
    if (/\b(quote|order request|place an order)\b/.test(n)) return "quote-hint";
    return null;
  }

  async function replyTo(text) {
    if (state.busy) return;
    state.busy = true;
    try {
      if (/^(cancel|stop|nevermind|never mind)$/i.test(text.trim()) && state.quoteMode) {
        cancelQuote();
        await typewriterBubble("Quote cancelled. What else can I help with?");
        return;
      }
      if (state.quoteMode) {
        await handleQuoteAnswer(text);
        return;
      }

      const intent = detectIntent(text);
      if (intent === "quote") {
        await typewriterBubble(startQuotePrompt());
        return;
      }
      if (intent === "human") {
        const stub = bot.buildQuoteSummary({
          name: "(customer will fill)",
          phone: "",
          what: "General enquiry — please message me back",
          size: "",
          material: "",
          quantity: "",
          deadline: "",
          fileLink: "",
        });
        await typewriterBubble(cfg.handoffMessage, sendActionsHtml(stub));
        return;
      }
      if (intent === "quote-hint") {
        await typewriterBubble(
          "I can take a quote step by step — just say “quote” when you’re ready. Or ask me about materials, pricing, turnaround, delivery…"
        );
        return;
      }

      // Map common short asks to quick-reply ids so FAQ stays conversational
      const map = [
        [/material|filament|pla|petg|abs|resin|tpu/, "materials"],
        [/service|what do you|offer|make|print/, "services"],
        [/price|pricing|cost|how much|₹|rupee/, "pricing"],
        [/turnaround|how long|lead time|days/, "turnaround"],
        [/file|format|stl|3mf|obj/, "formats"],
        [/deliver|ship|shipping|pickup|courier/, "delivery"],
        [/contact|email|whatsapp|phone/, "contact"],
      ];
      let quickId = null;
      const lower = text.toLowerCase();
      for (const [re, id] of map) {
        if (re.test(lower)) {
          quickId = id;
          break;
        }
      }
      const reply = await bot.getBotReply(text, quickId ? { quickId } : {});
      await typewriterBubble(reply);
    } finally {
      state.busy = false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const text = els.input.value.trim();
    if (!text) return;
    els.input.value = "";
    addUserBubble(text);
    await replyTo(text);
  }

  function applyMuteUI() {
    els.mute.setAttribute("aria-pressed", state.muted ? "true" : "false");
    els.mute.querySelector(".mute-icon").textContent = state.muted ? "🔇" : "🔊";
    els.mute.setAttribute("aria-label", state.muted ? "Unmute voice" : "Mute voice");
    if (state.muted && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  els.mute.addEventListener("click", () => {
    state.muted = !state.muted;
    localStorage.setItem("silver.muted", state.muted ? "1" : "0");
    applyMuteUI();
  });

  els.form.addEventListener("submit", onSubmit);

  // Speech recognition (optional)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    els.mic.hidden = false;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;
    state.recognition = rec;
    rec.onstart = () => {
      state.listening = true;
      setMascotState("listening");
      els.mic.setAttribute("aria-pressed", "true");
    };
    rec.onend = () => {
      state.listening = false;
      els.mic.setAttribute("aria-pressed", "false");
      if (!state.speaking) setMascotState("idle");
    };
    rec.onerror = () => {
      state.listening = false;
      els.mic.setAttribute("aria-pressed", "false");
      if (!state.speaking) setMascotState("idle");
    };
    rec.onresult = async (ev) => {
      const text = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || "";
      if (!text.trim()) return;
      els.input.value = "";
      addUserBubble(text.trim());
      await replyTo(text.trim());
    };
    els.mic.addEventListener("click", () => {
      if (state.busy) return;
      try {
        if (state.listening) {
          rec.stop();
          return;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        rec.start();
      } catch (_) {}
    });
  }

  // Chrome loads voices async
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // Intro
  (async function boot() {
    setMascotState("idle");
    await typewriterBubble(cfg.botIntro);
    els.input.focus();
  })();
})();
