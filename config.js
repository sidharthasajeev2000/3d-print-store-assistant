/**
 * STORE CONFIG — edit this one file to update the bot & site.
 * Fields marked [PLACEHOLDER] must be filled by the owner before go-live.
 * Never invent prices or contact numbers outside this file.
 */
window.STORE_CONFIG = {
  shopName: "Silverwolf",
  tagline: "3D-printed figurines, cosplay props & custom prints",
  ownerName: "Sidhartha Mandampilly",
  botName: "Silver",
  botIntro:
    "Hi! I'm Silver, the Silverwolf desk assistant. Sidhartha may be with another customer — I can answer common questions or take your quote/order details and pass them on.",

  // Contact — email is from the live Silverwolf store config
  email: "admin@silverwolf.in",
  siteUrl: "https://silverwolf.in",
  // [PLACEHOLDER] WhatsApp digits only, country code included (e.g. 919876543210). Leave empty to hide WhatsApp send.
  whatsappNumber: "917034959462",
  // [PLACEHOLDER] Optional public phone display string
  phoneDisplay: "+91 70349 59462",
  // [PLACEHOLDER] Optional Instagram handle without @
  instagram: "" /* [PLACEHOLDER] */,
  // [PLACEHOLDER] Stall / studio location line if you want it shown
  locationNote: "" /* [PLACEHOLDER] e.g. "Stall weekends · Kochi area — ask for exact spot" */,

  leadTimeReadyMade: "5–10 business days",
  leadTimeCustom: "7–21 business days (depends on size & queue)",
  shippingNote:
    "Ships worldwide. Shipping cost is calculated when invoiced. Local pickup / stall handover available when arranged.",

  services: [
    {
      title: "Ready-made catalog",
      blurb: "Figurines, cosplay accessories, and display props from the shop catalog.",
    },
    {
      title: "Custom STL prints",
      blurb: "Print from your model — STL preferred. We confirm feasibility, then invoice.",
    },
    {
      title: "Cosplay / display props",
      blurb: "Replica props for cosplay and display only — never functional weapons.",
    },
    {
      title: "Paint & finishing (on request)",
      blurb: "Basic filament colour included; hand painting or weathering quoted separately when we can take it on.",
    },
  ],

  materials: [
    { name: "PLA", note: "Great for figurines & indoor props" },
    { name: "PETG", note: "Tougher; good for outdoor / harder wear" },
    { name: "ABS", note: "Durable; suitable designs only" },
    { name: "Resin", note: "Fine detail (minis, sharp features)" },
    { name: "TPU", note: "Flexible parts (masks, soft accents)" },
  ],

  fileFormats:
    "STL is preferred for custom orders. Google Drive / Dropbox / WeTransfer links are fine. ASCII STL and other formats work via a link + notes.",

  // Pricing guidance — rates mirrored from Silverwolf shop quote config; final invoice may differ.
  // Marked clearly so the owner can edit. Do not treat as a binding price list.
  pricing: {
    currency: "INR",
    note:
      "Quotes are approximate. Final invoice may adjust for supports, orientation, finishing, or shipping. No card payment on this assistant site.",
    filamentPerGramInr: 3.2 /* editable rate used only for rough guidance copy */,
    markup: 3.5,
    minimumInr: 999,
    summary:
      "Custom prints are quoted from volume/material (rough in-shop formula: max(minimum, grams × filament ₹/g × markup). Minimum shown in config: ₹999). Catalog pieces have listed prices on silverwolf.in. Stall / painted jobs are quoted case-by-case.",
  },

  faq: [
    {
      keys: ["service", "services", "what do you", "offer", "make", "print", "shop", "catalog", "custom"],
      answer:
        "We do ready-made figurines & cosplay/display props, plus custom prints from your STL. Cosplay replicas are display props only — never functional weapons. Paint/finishing can be requested in notes.",
    },
    {
      keys: ["material", "materials", "filament", "pla", "petg", "abs", "resin", "tpu"],
      answer:
        "Materials: PLA, PETG, ABS, Resin, and TPU. PLA/PETG cover most props and figurines; resin for fine detail; TPU for flexible parts. Tell me your use case and I’ll suggest which fits.",
    },
    {
      keys: ["price", "pricing", "cost", "quote", "how much", "₹", "rupee"],
      answer:
        "Pricing depends on size, material, quantity, and finish. Custom work uses a rough volume-based estimate (minimum around ₹999 in the shop config) — final invoice may change. Catalog prices live on silverwolf.in. Want me to take a quote request for Sidhartha?",
    },
    {
      keys: ["time", "turnaround", "lead", "how long", "days", "when"],
      answer:
        "Ready-made: usually 5–10 business days. Custom: typically 7–21 business days depending on size and queue. You’ll get a clearer timeline when invoiced.",
    },
    {
      keys: ["file", "format", "stl", "upload", "model", "3mf", "obj"],
      answer:
        "STL is preferred. Share a Drive/Dropbox/WeTransfer link, or note the file in your quote request. Binary STL is best for quick volume estimates on the main shop.",
    },
    {
      keys: ["deliver", "delivery", "ship", "shipping", "pickup", "courier"],
      answer:
        "We ship worldwide; shipping is calculated at invoice. Local pickup / stall handover can be arranged. Include your city or shipping country in the request.",
    },
    {
      keys: ["contact", "email", "whatsapp", "phone", "reach", "call", "human"],
      answer:
        "Email: admin@silverwolf.in · Main shop: silverwolf.in. I can also collect your details and open a prefilled WhatsApp or email for Sidhartha when he’s free.",
    },
    {
      keys: ["weapon", "katana", "blade", "sword", "sharp", "real"],
      answer:
        "All blades and similar items are cosplay / display prop replicas made of plastic — blunt and decorative only, never functional weapons.",
    },
    {
      keys: ["paint", "painted", "colour", "color", "finish"],
      answer:
        "Basic filament colour is included. Hand painting or weathering can be requested — we’ll quote finishing separately if we can take it on.",
    },
    {
      keys: ["hello", "hi", "hey", "namaste"],
      answer:
        "Hey! Ask about services, materials, pricing, turnaround, file formats, delivery, or tap Get a quote — I’ll take your details for Sidhartha.",
    },
  ],

  quickReplies: [
    { id: "services", label: "Services" },
    { id: "materials", label: "Materials" },
    { id: "pricing", label: "Pricing / quote" },
    { id: "turnaround", label: "Turnaround" },
    { id: "formats", label: "File formats" },
    { id: "delivery", label: "Delivery" },
    { id: "contact", label: "Contact" },
    { id: "quote", label: "Get a quote" },
    { id: "human", label: "Talk to Sidhartha" },
  ],

  quoteSteps: [
    { key: "name", prompt: "What’s your name?", placeholder: "Your name" },
    { key: "phone", prompt: "Best phone / WhatsApp number?", placeholder: "+91 …" },
    {
      key: "what",
      prompt: "What should we print? (item / description)",
      placeholder: "e.g. articulated figure, cosplay mask…",
    },
    { key: "size", prompt: "Approx size or scale?", placeholder: "e.g. 15 cm / 28 mm mini" },
    {
      key: "material",
      prompt: "Preferred material? (PLA, PETG, ABS, Resin, TPU, or unsure)",
      placeholder: "PLA / unsure",
    },
    { key: "quantity", prompt: "Quantity?", placeholder: "1" },
    { key: "deadline", prompt: "Needed by? (date or flexible)", placeholder: "Flexible / by …" },
    {
      key: "fileLink",
      prompt: "File link if you have one (Drive/Dropbox/WeTransfer), or type none",
      placeholder: "https://… or none",
    },
  ],

  handoffMessage:
    "Got it — a human (Sidhartha) will reply when he’s free. Use the buttons below to send this request now via WhatsApp or email so it lands in his inbox.",

  /**
   * Future AI backend: set mode to "api" and implement fetchReply in bot.js
   * against your endpoint. Keep mode "local" for the client-side FAQ bot.
   */
  ai: {
    mode: "local", // "local" | "api"
    apiEndpoint: "" /* [PLACEHOLDER] e.g. https://your-api.example.com/chat */,
  },
};
