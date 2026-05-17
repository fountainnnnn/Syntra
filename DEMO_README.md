# Syntra Demo README

Syntra is a React-only Vite frontend with a separate Express TypeScript backend. The hackathon demo should run locally with seeded fallback data, then upgrade to real Telegram and OpenAI behavior when non-placeholder secrets are present.

## Environment Setup

```powershell
npm install
Copy-Item .env.example .env.local
```

Edit `.env.local` locally. Do not commit real secrets.

Required values:

```dotenv
OPENAI_API_KEY=PASTE_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4.1-mini

TELEGRAM_BOT_TOKEN=PASTE_TELEGRAM_BOT_TOKEN_HERE
TELEGRAM_ENABLE_OUTBOUND_REPLIES=true

FRONTEND_PORT=5173
SERVER_PORT=8787
VITE_API_BASE_URL=http://localhost:8787
CLIENT_URL=http://localhost:5173

SYNTRA_DB_PATH=./data/syntra.db
SYNTRA_BUSINESS_NAME=ApertureOne Events
```

Check whether secrets are configured without printing them:

```powershell
npm run wait:env
```

## Run Locally

Start the full local demo stack:

```powershell
npm run dev:all
```

Or double-click/run:

```powershell
.\RUN_ALL.bat
```

Both commands start the Vite frontend, Express API, and Telegram bot worker.

Open:

- Frontend: `http://localhost:5173/dashboard`
- API health: `http://localhost:8787/api/health`

If a separate terminal is preferred:

```powershell
npm run server
npm run dev
npm run bot
```

## Telegram Setup

1. In Telegram, message `@BotFather`.
2. Create a bot with `/newbot`.
3. Put the token in `.env.local` as `TELEGRAM_BOT_TOKEN`.
4. Run `npm run verify:telegram`.
5. Start `npm run bot` or `npm run dev:all`.
6. Send a customer-service message to the bot.

Recommended demo message:

```text
Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we'll find another vendor.
```

Expected behavior: the backend processes the inbound message through the same pipeline as demo injection, updates the dashboard snapshot, and records source evidence. The bot worker does not send automatic acknowledgements; Telegram outbound messages are sent only when an operator uses the dashboard reply action.

## OpenAI Setup

1. Put a real key in `.env.local` as `OPENAI_API_KEY`.
2. Keep `OPENAI_MODEL=gpt-4.1-mini` unless the team changes the supported model.
3. Run:

```powershell
npm run verify:openai
npm run verify:real-apis
```

If OpenAI is not configured, Syntra should use deterministic fallback extraction and clearly label the status as fallback or pending.

## Verification Commands

Run these before claiming the demo is ready:

```powershell
npm run build
npm run lint
npm run test
npm run sweep:endpoints
npm run verify:real-apis
npx playwright install
npm run test:e2e
```

Playwright screenshots are written to:

```text
artifacts/screenshots
```

Playwright reports are written to:

```text
artifacts/playwright-report
artifacts/playwright-results.json
artifacts/playwright-results.xml
```

Latest verified local run:

- `npm run lint`: pass.
- `npm run build`: pass.
- `npm run test`: pass.
- `npm run sweep:endpoints`: pass.
- `npm run verify:real-apis`: pass with real OpenAI and Telegram checks.
- `npm run test:e2e`: pass, 57/57 tests across desktop, tablet, and mobile.

## Backup Demo Injection

If Telegram is unavailable during judging, use the Settings page **Inject Demo Message** control or call:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8787/api/demo/inject `
  -ContentType "application/json" `
  -Body '{"name":"Demo Judge","text":"Hi, we need the invoice for our corporate event booking today or we may switch vendors."}'
```

The injection must use the same processing pipeline as Telegram ingestion. Verify the message appears on `/dashboard`, `/inbox`, `/pipeline`, `/tasks`, and `/graph`.
