# Syntra

Syntra is a local customer operations dashboard for Telegram-first service teams. It turns inbound customer messages into structured operational work: customer memory, inbox triage, tasks, buying-intent pipeline stages, revenue risk, and an operations map that keeps every AI conclusion tied back to source evidence.

The app is built for a hackathon demo, but it is wired like a real product slice:

- Vite, React, TypeScript, and React Router on the frontend.
- A separate Express TypeScript API.
- Telegram ingestion through a bot worker or webhook endpoint.
- OpenAI structured extraction when a real key is configured.
- Deterministic fallback extraction when secrets are missing, so the demo still runs.
- JSON persistence under `data/` for local state.
- Google Design.MD, Playwright, Vitest, ESLint, and endpoint sweeps for verification.

## What Syntra Does

Syntra listens for customer-service style Telegram messages and converts them into an operations workspace:

- **Dashboard**: live metrics, urgent queue, pipeline health, support load, team performance, and recent Telegram activity.
- **Inbox**: conversation list, source messages, AI summary, extracted fields, generated reply draft, task creation, escalation, and resolution actions.
- **Customers**: customer memory built from Telegram history.
- **Pipeline**: buying-intent leads grouped by operational stage, with source conversation, risk, next action, and lead detail drawer.
- **Tasks**: owner work queue with source-message traceability.
- **Insights**: recurring issue clusters, sentiment trend, response delay, revenue risk, and recommendations.
- **Operations Graph**: a left-to-right map from Telegram message to AI extraction, customer record, task, pipeline impact, and owner action.
- **Settings**: real API status, demo controls, verification console, and setup guidance.

## Important Behavior

Telegram is treated as a customer-service channel. The bot worker ingests customer messages only; it does not send automatic acknowledgement messages to customers. Outbound Telegram replies are sent only when an operator uses the dashboard reply action and provides explicit reply text.

OpenAI is used for message extraction and verification when `OPENAI_API_KEY` is configured. If the key is missing or placeholder-only, Syntra falls back to deterministic local extraction and labels the API status accordingly.

Demo injection uses the same processing pipeline as Telegram ingestion, so fallback demos and live Telegram demos exercise the same backend flow.

## Requirements

- Node.js 20+ recommended.
- npm.
- Optional: a real OpenAI API key.
- Optional: a real Telegram bot token from `@BotFather`.
- For E2E tests: Playwright browsers via `npx playwright install`.

## Setup

Install dependencies:

```powershell
npm install
```

Create local environment config:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` locally. Do not commit real secrets.

Required variables:

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

Check whether local secrets are configured without printing them:

```powershell
npm run wait:env
```

## Run the App

Start the full local stack:

```powershell
.\RUN_ALL.bat
```

Equivalent npm command:

```powershell
npm run dev:all
```

This starts:

- Frontend: `http://localhost:5173/dashboard`
- API: `http://localhost:8787`
- Telegram bot worker: `scripts/telegram-bot.ts`

You can also run processes separately:

```powershell
npm run server
npm run dev
npm run bot
```

## Demo Flow

1. Start the full stack with `.\RUN_ALL.bat`.
2. Open `http://localhost:5173/dashboard`.
3. Seed or reset demo data from Settings, or run `npm run seed`.
4. Inject a demo message from the Dashboard or Settings page.
5. Walk through Dashboard, Inbox, Pipeline, Tasks, Insights, and Operations Graph.
6. If Telegram is configured, send a real customer-style message to the bot and watch the same pipeline update.

Useful demo message:

```text
Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we'll find another vendor.
```

Manual API injection:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8787/api/demo/inject `
  -ContentType "application/json" `
  -Body '{"name":"Demo Judge","text":"Hi, we need the invoice for our corporate event booking today or we may switch vendors."}'
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend on port 5173. |
| `npm run server` | Start the Express API on port 8787. |
| `npm run bot` | Start the Telegram polling worker. |
| `npm run dev:all` | Start frontend, API, and bot together. |
| `npm run wait:env` | Check local env readiness without printing secrets. |
| `npm run seed` | Reset deterministic demo state. |
| `npm run sweep:endpoints` | Check required API endpoints. |
| `npm run verify:openai` | Verify OpenAI configuration and real extraction. |
| `npm run verify:telegram` | Verify Telegram bot credentials. |
| `npm run verify:real-apis` | Run OpenAI and Telegram verification together. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run Vitest unit tests. |
| `npm run test:e2e` | Run Playwright E2E tests. |
| `npm run build` | Type-check and build the frontend. |
| `npm run design:lint` | Validate `DESIGN.md`. |
| `npm run design:spec` | Print the Design.MD spec. |
| `npm run design:export` | Export Design.MD tokens. |

## API Endpoints

Core read endpoints:

- `GET /api/health`
- `GET /api/snapshot`
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `GET /api/telegram/status`
- `GET /api/system/status`

Core write and demo endpoints:

- `POST /api/demo/inject`
- `POST /api/conversations/:id/status`
- `POST /api/tasks`
- `POST /api/tasks/:id/status`
- `POST /api/opportunities/:id/stage`
- `POST /api/telegram/send-reply`
- `POST /api/telegram/webhook`
- `POST /api/system/seed`
- `POST /api/system/verify-openai`
- `POST /api/system/verify-telegram`

## Verification

Run these before calling the demo ready:

```powershell
npm run build
npm run lint
npm run test
npm run design:lint
npm run design:spec
npm run design:export
npm run seed
npm run sweep:endpoints
npm run verify:real-apis
npm run test:e2e
```

Latest verified local status:

- `npm run build`: pass.
- `npm run lint`: pass.
- `npm run test`: pass, 4 Vitest tests.
- `npm run design:lint`, `npm run design:spec`, `npm run design:export`: pass.
- `npm run sweep:endpoints`: pass, 6 endpoint checks.
- `npm run verify:real-apis`: pass with real OpenAI and Telegram checks when configured.
- `npm run test:e2e`: pass, 57/57 Playwright tests across desktop, tablet, and mobile.

Playwright artifacts are written under:

```text
artifacts/screenshots
artifacts/playwright-report
artifacts/playwright-results.json
artifacts/playwright-results.xml
```

## Project Structure

```text
src/                  React frontend
server/               Express API, services, state, config
scripts/              Telegram bot worker and verification scripts
tests/e2e/            Playwright E2E tests
data/                 Local JSON persistence, ignored by git
artifacts/            Generated test reports and screenshots, ignored by git
DESIGN.md             Google Design.MD system contract
PRODUCT.md            Product brief for Syntra
DEMO_README.md        Hackathon runbook
QA_REPORT.md          Verification history
plan.md / notes.md    Working project plan and implementation notes
RUN_ALL.bat           Windows launcher for the full local stack
```

## Design System

Syntra is full light mode. The current visual system uses the canonical `logo.png` brand asset, Apple-style frosted glass surfaces, Linear-style product density, and Vercel-style shadow-as-border restraint. `DESIGN.md` is the source of truth for tokens, spacing, colors, surfaces, and component rules.

Run the Design.MD checks after UI changes:

```powershell
npm run design:lint
npm run design:spec
npm run design:export
```

## Security Notes

- Never commit `.env.local`, `.env`, `.env.*`, logs, generated data, or secret-bearing artifacts.
- `.env.local` is ignored by git.
- Verification scripts should report status without printing secret values.
- Telegram outbound replies require explicit dashboard reply text.
- The app remains usable without real secrets through deterministic fallback extraction.

## More Docs

- [DEMO_README.md](DEMO_README.md): detailed demo setup and judging runbook.
- [QA_REPORT.md](QA_REPORT.md): verification history.
- [DESIGN.md](DESIGN.md): design system contract.
- [PRODUCT.md](PRODUCT.md): product framing and scope.
