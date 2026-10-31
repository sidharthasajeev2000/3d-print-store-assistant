(function () {
  const cfg = window.STORE_CONFIG;
  const bot = window.StoreBot;

  const els = {
    shopName: document.getElementById("shopName"),
    tagline: document.getElementById("tagline"),
    ownerLine: document.getElementById("ownerLine"),
    services: document.getElementById("servicesList"),
    materials: document.getElementById("materialsList"),
    leadReady: document.getElementById("leadReady"),
    leadCustom: document.getElementById("leadCustom"),
    shipNote: document.getElementById("shipNote"),
    contactBlock: document.getElementById("contactBlock"),
    year: document.getElementById("year"),
    openChat: document.getElementById("openChat"),
    openChatHero: document.getElementById("openChatHero"),
    chatPanel: document.getElementById("chatPanel"),
    chatClose: document.getElementById("chatClose"),
    chatMessages: document.getElementById("chatMessages"),
    chatForm: document.getElementById("chatForm"),
    chatInput: document.getElementById("chatInput"),
    quickReplies: document.getElementById("quickReplies"),
    fab: document.getElementById("chatFab"),
    botLabel: document.getElementById("botLabel"),
  };

  const state = {
    quoteMode: false,
    quoteStep: 0,
    quoteData: {},
    open: false,
  };

  function fillLanding() {
    els.shopName.textContent = cfg.shopName;
    els.tagline.textContent = cfg.tagline;
    els.ownerLine.textContent = `Run by ${cfg.ownerName}`;
    els.botLabel.textContent = cfg.botName;
    els.year.textContent = String(new Date().getFullYear());
    els.leadReady.textContent = cfg.leadTimeReadyMade;
    els.leadCustom.textContent = cfg.leadTimeCustom;
    els.shipNote.textContent = cfg.shippingNote;

    els.services.innerHTML = cfg.services
      .map(
        (s) =>
          `<li><strong>${escapeHtml(s.title)}</strong><span>${escapeHtml(s.blurb)}</span></li>`
      )
      .join("");

    els.materials.innerHTML = cfg.materials
      .map(
        (m) =>
          `<li><span class="chip">${escapeHtml(m.name)}</span><span>${escapeHtml(m.note)}</span></li>`
      )
      .join("");

    const contactBits = [
      `<a href="mailto:${escapeAttr(cfg.email)}">${escapeHtml(cfg.email)}</a>`,
      `<a href="${escapeAttr(cfg.siteUrl)}" target="_blank" rel="noopener">${escapeHtml(cfg.siteUrl.replace(/^https?:\/\//, ""))}</a>`,
    ];
    if (cfg.phoneDisplay) contactBits.push(escapeHtml(cfg.phoneDisplay));
    if (cfg.instagram)
      contactBits.push(
        `<a href="https://instagram.com/${escapeAttr(cfg.instagram)}" target="_blank" rel="noopener">@${escapeHtml(cfg.instagram)}</a>`
      );
    if (cfg.locationNote) contactBits.push(escapeHtml(cfg.locationNote));
    els.contactBlock.innerHTML = contactBits.map((b) => `<p>${b}</p>`).join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function openChat() {
    state.open = true;
    els.chatPanel.classList.add("open");
    els.chatPanel.setAttribute("aria-hidden", "false");
    els.fab.setAttribute("aria-expanded", "true");
    els.chatInput.focus();
  }
  function closeChat() {
    state.open = false;
    els.chatPanel.classList.remove("open");
    els.chatPanel.setAttribute("aria-hidden", "true");
    els.fab.setAttribute("aria-expanded", "false");
  }

  function addMessage(role, text, extraHtml) {
    const div = document.createElement("div");
    div.className = `msg msg-${role}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = formatText(text) + (extraHtml || "");
    div.appendChild(bubble);
    els.chatMessages.appendChild(div);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    return div;
  }

  function formatText(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function renderQuickReplies() {
    els.quickReplies.innerHTML = "";
    cfg.quickReplies.forEach((q) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-btn";
      btn.textContent = q.label;
      btn.dataset.id = q.id;
      btn.addEventListener("click", () => onQuick(q.id));
      els.quickReplies.appendChild(btn);
    });
  }

  function setTyping(on) {
    let t = els.chatMessages.querySelector(".typing");
    if (on && !t) {
      t = document.createElement("div");
      t.className = "msg msg-bot typing";
      t.innerHTML = '<div class="bubble"><span class="dots"><i></i><i></i><i></i></span></div>';
      els.chatMessages.appendChild(t);
      els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    } else if (!on && t) {
      t.remove();
    }
  }

  async function botSay(text, extraHtml) {
    setTyping(true);
    await wait(350 + Math.min(600, String(text).length * 4));
    setTyping(false);
    addMessage("bot", text, extraHtml);
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function onQuick(id) {
    const label = (cfg.quickReplies.find((q) => q.id === id) || {}).label || id;
    addMessage("user", label);
    if (id === "quote") {
      startQuote();
      return;
    }
    if (id === "human") {
      await botSay(cfg.handoffMessage, handoffActionsHtml());
      return;
    }
    const reply = await bot.getBotReply(label, { quickId: id });
    await botSay(reply);
  }

  function startQuote() {
    state.quoteMode = true;
    state.quoteStep = 0;
    state.quoteData = {};
    const step = cfg.quoteSteps[0];
    els.chatInput.placeholder = step.placeholder || "";
    botSay(
      "Sure — I’ll collect a few details, then you can send them to Sidhartha via WhatsApp or email.\n\n" +
        step.prompt
    );
  }

  function cancelQuote() {
    state.quoteMode = false;
    state.quoteStep = 0;
    els.chatInput.placeholder = "Type a message…";
  }

  async function handleQuoteAnswer(text) {
    const step = cfg.quoteSteps[state.quoteStep];
    state.quoteData[step.key] = text.trim();
    state.quoteStep += 1;
    if (state.quoteStep >= cfg.quoteSteps.length) {
      const summary = bot.buildQuoteSummary(state.quoteData);
      cancelQuote();
      const actions = sendActionsHtml(summary);
      await botSay(
        "Here’s your request summary:\n\n" + summary + "\n\n" + cfg.handoffMessage,
        actions
      );
      return;
    }
    const next = cfg.quoteSteps[state.quoteStep];
    els.chatInput.placeholder = next.placeholder || "";
    await botSay(next.prompt);
  }

  function sendActionsHtml(summary) {
    const wa = bot.whatsappLink(summary);
    const mail = bot.mailtoLink(summary);
    let html = '<div class="handoff-actions">';
    if (wa) {
      html += `<a class="btn-send" data-testid="send-whatsapp" href="${escapeAttr(wa)}" target="_blank" rel="noopener">Send via WhatsApp</a>`;
    } else {
      html +=
        '<span class="hint">WhatsApp not configured — set <code>whatsappNumber</code> in config.js</span>';
    }
    html += `<a class="btn-send secondary" data-testid="send-email" href="${escapeAttr(mail)}">Send via Email</a>`;
    html += "</div>";
    return html;
  }

  function handoffActionsHtml() {
    const stub = bot.buildQuoteSummary({
      name: "(customer will fill)",
      phone: "",
      what: "General enquiry — please call/message me back",
      size: "",
      material: "",
      quantity: "",
      deadline: "",
      fileLink: "",
    });
    return sendActionsHtml(stub);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const text = els.chatInput.value.trim();
    if (!text) return;
    els.chatInput.value = "";
    addMessage("user", text);

    if (/^(cancel|stop|nevermind|never mind)$/i.test(text) && state.quoteMode) {
      cancelQuote();
      await botSay("Quote cancelled. How else can I help?");
      return;
    }

    if (state.quoteMode) {
      await handleQuoteAnswer(text);
      return;
    }

    if (/^(start quote|get a quote|quote|order)$/i.test(text)) {
      startQuote();
      return;
    }

    const reply = await bot.getBotReply(text, {});
    await botSay(reply);
  }

  function greet() {
    addMessage("bot", cfg.botIntro);
    renderQuickReplies();
  }

  // Wire UI
  fillLanding();
  greet();
  els.chatForm.addEventListener("submit", onSubmit);
  els.openChat.addEventListener("click", openChat);
  if (els.openChatHero) els.openChatHero.addEventListener("click", openChat);
  els.fab.addEventListener("click", () => (state.open ? closeChat() : openChat()));
  els.chatClose.addEventListener("click", closeChat);

  // Auto-open on deep link ?chat=1
  if (/[?&]chat=1\b/.test(location.search)) openChat();
})();
