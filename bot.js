/**
 * Chat brain. Swap getBotReply() body (or set config.ai.mode = "api")
 * to plug in a real LLM backend later without rewriting the UI.
 */
(function (global) {
  const cfg = () => global.STORE_CONFIG;

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s₹+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchFaq(text) {
    const n = normalize(text);
    if (!n) return null;
    let best = null;
    let bestScore = 0;
    for (const item of cfg().faq) {
      let score = 0;
      for (const key of item.keys) {
        if (n.includes(key.toLowerCase())) score += key.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    return bestScore > 0 ? best.answer : null;
  }

  function servicesBlurb() {
    return (
      "Here’s what we offer:\n" +
      cfg()
        .services.map((s) => `• ${s.title} — ${s.blurb}`)
        .join("\n")
    );
  }

  function materialsBlurb() {
    return (
      "Materials we print in:\n" +
      cfg()
        .materials.map((m) => `• ${m.name} — ${m.note}`)
        .join("\n")
    );
  }

  function pricingBlurb() {
    return cfg().pricing.summary + "\n\n" + cfg().pricing.note;
  }

  function contactBlurb() {
    const c = cfg();
    const lines = [`Email: ${c.email}`, `Shop: ${c.siteUrl}`];
    if (c.phoneDisplay) lines.push(`Phone: ${c.phoneDisplay}`);
    if (c.whatsappNumber) lines.push(`WhatsApp: +${c.whatsappNumber}`);
    if (c.instagram) lines.push(`Instagram: @${c.instagram}`);
    if (c.locationNote) lines.push(c.locationNote);
    if (!c.whatsappNumber) {
      lines.push(
        "(WhatsApp number is not set yet — fill whatsappNumber in config.js, or use email.)"
      );
    }
    return lines.join("\n");
  }

  function quickReplyAnswer(id) {
    switch (id) {
      case "services":
        return servicesBlurb();
      case "materials":
        return materialsBlurb();
      case "pricing":
        return pricingBlurb();
      case "turnaround":
        return `Ready-made: ${cfg().leadTimeReadyMade}.\nCustom: ${cfg().leadTimeCustom}.`;
      case "formats":
        return cfg().fileFormats;
      case "delivery":
        return cfg().shippingNote;
      case "contact":
        return contactBlurb();
      case "human":
        return cfg().handoffMessage;
      default:
        return null;
    }
  }

  /**
   * PRIMARY EXTENSION POINT
   * Return a Promise<string> reply. Local FAQ today; API tomorrow.
   */
  async function getBotReply(userText, context) {
    const c = cfg();
    if (c.ai && c.ai.mode === "api" && c.ai.apiEndpoint) {
      return fetchApiReply(userText, context);
    }
    return localReply(userText, context);
  }

  async function fetchApiReply(userText, context) {
    const c = cfg();
    const res = await fetch(c.ai.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        context: context || {},
        shop: c.shopName,
      }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    return data.reply || data.message || String(data);
  }

  function localReply(userText, context) {
    if (context && context.quickId) {
      const qr = quickReplyAnswer(context.quickId);
      if (qr) return Promise.resolve(qr);
    }
    const n = normalize(userText);
    if (/\b(quote|order|request|buy|purchase)\b/.test(n)) {
      return Promise.resolve(
        "I can take a quote/order request step by step. Tap “Get a quote” or say “start quote”."
      );
    }
    const faq = matchFaq(userText);
    if (faq) return Promise.resolve(faq);
    return Promise.resolve(
      "I’m not sure on that one. Try the quick buttons (services, materials, pricing, turnaround, formats, delivery, contact), or tap Get a quote / Talk to Sidhartha and I’ll hand you off."
    );
  }

  function buildQuoteSummary(data) {
    const lines = [
      `New quote/order request — ${cfg().shopName}`,
      `Name: ${data.name || "—"}`,
      `Phone/WhatsApp: ${data.phone || "—"}`,
      `What to print: ${data.what || "—"}`,
      `Size: ${data.size || "—"}`,
      `Material: ${data.material || "—"}`,
      `Quantity: ${data.quantity || "—"}`,
      `Deadline: ${data.deadline || "—"}`,
      `File link: ${data.fileLink || "—"}`,
      "",
      "(Sent via the customer chat assistant)",
    ];
    return lines.join("\n");
  }

  function whatsappLink(summary) {
    const num = (cfg().whatsappNumber || "").replace(/\D/g, "");
    if (!num) return null;
    return `https://wa.me/${num}?text=${encodeURIComponent(summary)}`;
  }

  function mailtoLink(summary) {
    const sub = encodeURIComponent(`${cfg().shopName} quote request`);
    const body = encodeURIComponent(summary);
    return `mailto:${cfg().email}?subject=${sub}&body=${body}`;
  }

  global.StoreBot = {
    getBotReply,
    quickReplyAnswer,
    buildQuoteSummary,
    whatsappLink,
    mailtoLink,
    matchFaq,
    /* exposed for tests / future swap */
    localReply,
    fetchApiReply,
  };
})(window);
