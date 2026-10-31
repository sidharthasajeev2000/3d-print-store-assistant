# Silver · Silverwolf talking mascot

A single-screen GitHub Pages site: **Silver**, a cute animated wolf mascot, chats with customers while Sidhartha is busy.

## Experience

- Full-screen animated mascot (idle breathe / blink / ear wiggle; mouth moves while talking)
- Speech bubbles with typewriter text
- Speaks aloud via Web Speech API (`speechSynthesis`) — one mute toggle only
- Customer types in a single bottom input (optional mic via `SpeechRecognition` when supported)
- Behind the scenes: same FAQ + quote intake brain in `config.js` / `bot.js`
- Quote flow ends with WhatsApp / email handoff links inside the bubble

## Edit store details

Only edit **`config.js`** (WhatsApp, email, FAQ, pricing notes, etc.).

## Local preview

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Live

https://sidharthasajeev2000.github.io/3d-print-store-assistant/

## Future AI backend

Set `ai.mode` to `"api"` and `ai.apiEndpoint` in `config.js`. `StoreBot.getBotReply` is the swap point.
