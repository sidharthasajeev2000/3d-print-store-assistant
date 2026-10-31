# Silverwolf · Customer desk assistant

Static GitHub Pages site with a **client-side chat bot** for [Silverwolf](https://silverwolf.in) (Sidhartha Mandampilly’s 3D print shop). Customers get FAQ answers and can leave a quote/order request while the owner is busy with someone else.

## What the bot does

- Friendly greeting + quick-reply chips (services, materials, pricing, turnaround, file formats, delivery, contact)
- Keyword-matched FAQ answers from `config.js`
- Guided quote intake: name, phone/WhatsApp, what to print, size, material, quantity, deadline, file link
- Ends with **Send via WhatsApp** and/or **Send via Email** (prefilled) so Sidhartha gets the request
- “Human will reply soon” handoff message
- Structured so an AI API can replace the local brain later (`config.ai.mode = "api"` + `StoreBot.getBotReply`)

## Edit store details

**Only edit `config.js`.** Marked `[PLACEHOLDER]` fields need your real values:

| Field | Status |
|-------|--------|
| `shopName`, `email`, `siteUrl`, services, materials, lead times | Filled from Silverwolf store config |
| `whatsappNumber` | **PLACEHOLDER — set digits with country code** |
| `phoneDisplay`, `instagram`, `locationNote` | **PLACEHOLDER — optional** |
| Pricing rates | Copied from shop quote config; final invoices may differ — edit if outdated |

Never invent prices or phone numbers outside this file.

## Local preview

```bash
cd 3d-print-store-assistant
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Pushes to `main` deploy via GitHub Actions → GitHub Pages.

Live URL (after Pages is enabled):  
`https://sidharthasajeev2000.github.io/3d-print-store-assistant/`

## Future AI backend

1. Set `ai.mode` to `"api"` and `ai.apiEndpoint` in `config.js`
2. Implement your endpoint to accept `{ message, context, shop }` and return `{ reply }`
3. Keep `StoreBot.getBotReply` as the single swap point (already routes to `fetchApiReply`)
