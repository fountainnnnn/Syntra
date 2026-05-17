# Syntra — One-Shot Codex `/goal` Prompt

Use this as the single `/goal` prompt for Codex. It is written for a one-shot autonomous run where you cannot make follow-up changes after submitting the prompt.


---

```text
/goal Build a hackathon-ready, fully demoable web application called **Syntra**.

Syntra is an AI-native customer operations dashboard that transforms real Telegram customer-service conversations into structured operational insights in realtime. It automatically converts incoming Telegram chats into leads, support tickets, follow-ups, tasks, priorities, risks, customer intelligence, pipeline updates, team workload, customer sentiment, response delays, recurring complaint clusters, and operational bottleneck insights, then visualizes them through a premium light-mode dashboard.

This is a ONE-SHOT autonomous build. You will not get follow-up instructions. Do not stop after merely creating files or checking off tasks. The goal is complete only when the product is genuinely demo-ready for a hackathon: visually premium, functional in a browser, verified with Playwright, able to receive real Telegram messages when `TELEGRAM_BOT_TOKEN` is configured, able to make real OpenAI API calls when `OPENAI_API_KEY` is configured, and able to show those Telegram messages reflected in the dashboard as structured operational state.

Use this working pattern:

Outcome: A polished, demo-ready Syntra app where real Telegram customer messages are ingested, classified, persisted, and reflected in a live customer operations dashboard.
Verification: Evidence from real API checks, build logs, endpoint sweeps, Playwright browser tests, console-error checks, responsive screenshots, design linting, and a final demo runbook.
Constraints: One-shot execution, no human clarification, no exposed secrets, no auth/payments/multitenant production scope, no dark mode, no pure-white boring UI, no placeholder-only pages, no fake “real Telegram” claims, no mock-only API verification when real secrets exist.
Boundaries: Build enough for a reliable hackathon demo, not a full enterprise product. Mock historical data is allowed. New Telegram chat ingestion must be real when token is configured. OpenAI extraction must use real API calls when key is configured, with deterministic fallback when missing.
Iteration policy: Between retries, inspect evidence, update `notes.md`, choose the next highest-impact fix, and continue until the demo is objectively usable and presentable.
Blocked stop: Only stop if blocked by missing external secrets or unavailable tooling/network. If blocked, implement the strongest fallback, document exactly why, and keep the app demoable.

You are not merely an implementer. Work as a coordinated internal team with these roles:

1. Product Lead — preserve the customer-operations command-center concept and demo story.
2. Frontend Design Lead — make the UI premium, full-light-mode, large, readable, polished, and non-generic.
3. Backend Engineer — ensure Telegram ingestion, data persistence, endpoints, and state updates work.
4. AI Systems Engineer — implement real OpenAI extraction, structured JSON, validation, and deterministic fallback.
5. Integration Engineer — implement `.env.local` handling, real Telegram API checks, real OpenAI API checks, bot polling, and secret-safe logs.
6. QA Engineer — run Playwright, endpoint sweeps, build checks, console-error checks, real API verification, and interaction tests.
7. Demo Director — ensure the final product can be presented in 2 minutes without breaking.

Create and continuously maintain these project files:

- `plan.md` — execution plan, current stage, acceptance criteria, and next action.
- `notes.md` — running memory of decisions, bugs, fixes, blockers, current state, and API verification status. Update after every major step.
- `research-notes.md` — online research findings and sources used.
- `DESIGN.md` — formal design system using Google Labs DESIGN.md format.
- `QA_REPORT.md` — final verification evidence, Playwright results, build status, endpoint status, OpenAI status, Telegram status, screenshots.
- `DEMO_README.md` — exact commands, env vars, Telegram setup, OpenAI setup, demo flow, fallback instructions.
- `demo-script.md` — 2-minute hackathon presentation script.
- `AGENTS.md` — project-local instructions telling future agents to preserve plan.md/notes.md, update progress continuously, verify before claiming completion, and never expose secrets.

Keep these documents accurate. Do not let them become stale.


================================================================================
ABSOLUTE STACK LOCK — REACT ONLY, NO NEXT.JS
================================================================================

This project must be built with **React only**, not Next.js.

Do NOT use:
- Next.js
- Next App Router
- Next Pages Router
- React Server Components
- `app/api/.../route.ts`
- `pages/api`
- `next.config.js`
- Next middleware
- `NEXT_PUBLIC_*` env variables
- any Next-specific routing or API conventions

Use this architecture instead:

Frontend:
- Vite
- React
- TypeScript
- React Router DOM
- Tailwind CSS
- shadcn/ui only if compatible with Vite React; otherwise build high-quality custom components
- Recharts
- Lucide React
- Framer Motion if it installs cleanly; otherwise CSS transitions

Backend:
- Node.js
- Express
- TypeScript
- REST API under `/api/*`
- SQLite using `better-sqlite3` if stable; otherwise robust JSON file persistence
- Separate Telegram bot worker, or one Express server process that can also start bot polling

The final app should run as:

- Vite React frontend on `http://localhost:5173`
- Express API backend on `http://localhost:8787`
- Telegram bot long-polling worker connected to the same data store

The frontend must call the backend through `VITE_API_BASE_URL`, defaulting to `http://localhost:8787`.

The React app must be a client-side SPA. Browser routes such as `/dashboard`, `/inbox`, `/customers`, `/pipeline`, `/tasks`, `/insights`, `/graph`, and `/settings` must be implemented with React Router DOM.

Backend API routes must be implemented with Express, not framework-specific API routes.

If Codex accidentally creates Next.js files or folders, delete them and convert the project back to Vite React + Express before continuing.


================================================================================
0. FIRST ACTION — CREATE `.env.local`, WAIT FOR SECRETS, THEN VERIFY REAL APIS
================================================================================

Before research, before scaffolding, before installing UI dependencies, before writing product code, do this first.

A. Create `.env.example` and `.env.local` immediately

1. Create `.env.example` with all required variables.
2. Create `.env.local` if it does not already exist.
3. `.env.local` must contain placeholder lines that I can fill while you are working:

```env
# Fill these immediately. Do not commit real secrets.
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

Do not expose `OPENAI_API_KEY` or `TELEGRAM_BOT_TOKEN` to the Vite frontend. Only `VITE_API_BASE_URL` may be exposed to browser code.

4. Add `.env.local`, `.env`, `.env.*`, `.envrc`, and any secret-containing files to `.gitignore` immediately.
5. Never print the full OpenAI API key or Telegram bot token in logs. If logging status, print only redacted values such as `sk-...abcd` or `1234...wxyz`.
6. Do not invent real secrets. I will paste them into `.env.local` after you create the file.

B. Pause/check for secrets after creating `.env.local`

After creating `.env.local`, print a clear instruction in the terminal/log:

```
ACTION REQUIRED: Fill .env.local now with OPENAI_API_KEY and TELEGRAM_BOT_TOKEN.
Codex will wait/check for the secrets before real API verification.
```

Then implement and run a secret check/wait script before continuing too far:

- Create `scripts/wait-for-env.ts` or equivalent.
- Add script: `npm run wait:env`.
- It should load `.env.local` using `dotenv`.
- It should check `.env.local` every 10–15 seconds for up to 10 minutes.
- It should detect whether `OPENAI_API_KEY` and `TELEGRAM_BOT_TOKEN` are present and not placeholder values.
- Placeholder values include empty strings, `PASTE_OPENAI_API_KEY_HERE`, `PASTE_TELEGRAM_BOT_TOKEN_HERE`, `your_api_key_here`, `your_token_here`, `changeme`, `placeholder`.
- It must not print secrets.
- If both are present, continue and mark `secrets_ready=true` in `notes.md`.
- If one or both are still missing after the wait period, continue building the app anyway, but mark real API verification as pending and retry checks near the end.

Do not block forever. Wait long enough for me to paste the keys, then continue.

C. Add real API verification scripts early

Create these scripts as soon as the package structure exists:

- `npm run wait:env`
- `npm run verify:openai`
- `npm run verify:telegram`
- `npm run verify:real-apis`

`verify:openai` requirements:
- Load `.env.local` using `dotenv`.
- Use the official OpenAI SDK server-side.
- Make a real API call using the Responses API.
- Use `OPENAI_MODEL` from env; default to `gpt-4.1-mini` if not set.
- Test prompt: `Return exactly this text and nothing else: SYNTRA_OPENAI_OK`
- Assert returned text contains `SYNTRA_OPENAI_OK`.
- Then run one real extraction test on this customer-service message:
  `Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we’ll find another vendor.`
- Assert that structured extraction returns high priority, corporate/invoice intent, at least one task, and an opportunity/revenue-risk object.
- If the API key is missing, print a clear pending message and do not falsely pass as verified.
- If the API call fails, capture the error class/message without leaking secrets and keep fallback extraction working.
- Write result to `QA_REPORT.md` and `notes.md` with status `verified_real_api`, `pending_missing_secret`, or `failed_real_api`.

`verify:telegram` requirements:
- Load `.env.local` using `dotenv`.
- Make a real Telegram Bot API call to `getMe` using `TELEGRAM_BOT_TOKEN`.
- Assert Telegram returns `ok: true` and a bot username/id.
- Save the verified bot username into local app status if practical.
- If token is missing, print setup instructions and mark pending.
- If token is invalid, print a clear error without leaking the token.
- If possible, call `deleteWebhook` before long polling to avoid webhook/polling conflicts, but do this carefully and document it.
- Write result to `QA_REPORT.md` and `notes.md` with status `verified_real_api`, `pending_missing_secret`, or `failed_real_api`.

`verify:real-apis` requirements:
- Run both OpenAI and Telegram verification.
- Write combined results into `QA_REPORT.md` and `notes.md`.
- Distinguish these statuses exactly:
  - `verified_real_api`
  - `pending_missing_secret`
  - `failed_real_api`
  - `verified_mock_only`

D. Real Telegram live ingestion test

When `TELEGRAM_BOT_TOKEN` is present:
- Start the Telegram bot worker with real long polling.
- Ask the human through console/log to send a message to the bot if no live message has arrived yet:

```
LIVE TELEGRAM TEST: Send any customer-service style message to the Syntra bot now.
Example: "I paid yesterday but no one confirmed my booking. This is urgent."
```

- The worker must process the real message, persist it, run extraction, and update the dashboard snapshot.
- If at least one live Telegram chat id exists, optionally test outbound reply by sending exactly one controlled message only if `TELEGRAM_ENABLE_OUTBOUND_REPLIES=true`:
  `Syntra test received. Your message is now visible in the operations dashboard.`
- Do not spam. Send at most one outbound test reply.
- Record evidence in `QA_REPORT.md`: bot username, live message received timestamp, dashboard customer/conversation id created, and whether outbound reply was tested.

E. Real API tests are mandatory when secrets exist

If `.env.local` contains valid-looking non-placeholder secrets, real API calls are mandatory. Do not settle for mock-only verification. Mocks are allowed for historical seed data and Playwright stability, but OpenAI and Telegram verification scripts must make real network calls when secrets are present.

================================================================================
1. RESEARCH PHASE — DO THIS BEFORE CODING THE APP
================================================================================

Perform online research before implementation. Do not rely only on generic memory.

Research and save concise findings to `research-notes.md`:

A. Premium full-light dashboard UI patterns
- Research modern premium light-mode dashboards and internal ops tools.
- Use references such as Linear, Vercel, Stripe Dashboard, Retool, Raycast, Palantir-style operational dashboards, high-end B2B analytics products, customer support dashboards, and operations command centers.
- Extract concrete design decisions: spacing, card density, typography, data table hierarchy, side panels, command centers, status badges, navigation, empty states, modals, charts.
- Do not copy brand assets. Use inspiration only.

B. Customer operations / CRM workflows
- Research useful customer-service metrics: response time, unresolved issues, sentiment, SLA risk, recurring complaints, pipeline stages, revenue at risk, team workload, follow-up age, open tickets, escalation load, conversion bottlenecks.
- Identify the best dashboard widgets for a customer operations manager.

C. Telegram Bot API implementation
- Research current Telegram Bot API practices.
- Prefer a reliable local-demo approach: Node/TypeScript Telegram bot worker using long polling, plus optional webhook endpoint.
- Determine how to receive text messages, get chat/user identity, send replies, verify token with `getMe`, and avoid webhook/polling conflicts.
- Document local dev constraints: webhooks need public HTTPS; long polling is easier for hackathon local demos.

D. OpenAI API implementation
- Research current official OpenAI SDK / Responses API usage.
- Implement server-side only.
- Use environment variables.
- Use a real test call in `verify:openai`.
- Use structured JSON extraction if feasible; otherwise use strict prompt + parser + validation + repair/fallback.

E. Google Labs DESIGN.md
- Use this repository: `https://github.com/google-labs-code/design.md`.
- Research its current commands before assuming command names.
- Install/use its CLI if available.
- Run all relevant available commands. Try/specifically look for commands equivalent to: `spec`, `lint`, `export`, and `diff`.
- Save outputs or summaries to `artifacts/design-md/` and `QA_REPORT.md`.
- If the CLI cannot install/run, document why and manually follow its design-system contract approach.

F. Impeccable design skill
- If the Impeccable skill is available in this Codex environment, install/use it.
- Try `npx skills add pbakaus/impeccable` if supported.
- If slash commands are available, use `/impeccable` to inspect available commands and run applicable UI audit/polish commands.
- Use the skill for typography, spacing, visual hierarchy, layout balance, contrast, responsiveness, interaction design, and obvious UI bug detection.
- If slash commands are not available, fetch/read public instructions if internet allows, then manually apply the audit principles.
- Do not fabricate that you ran Impeccable. In `QA_REPORT.md`, clearly state what actually ran and what was manually applied.

If online research is unavailable, write that in `research-notes.md`, then continue using best-effort implementation. Do not stop.

================================================================================
2. PRODUCT DEFINITION
================================================================================

Product name: **Syntra**

One-line pitch:
Syntra turns Telegram customer conversations into a live customer operations dashboard, automatically extracting leads, issues, tasks, risks, follow-ups, and business insights from every chat.

Longer description:
Syntra is an AI-native customer operations dashboard that transforms Telegram customer-service conversations into structured operational insights in realtime. The platform automatically converts customer chats into leads, support tickets, tasks, priorities, follow-ups, risks, pipeline updates, customer intelligence, team workload, recurring complaints, response delays, and operational bottlenecks, then visualizes them through a centralized dashboard. Businesses can monitor customer activity, response times, unresolved issues, pipeline progression, recurring complaints, team performance, and revenue risk without manually maintaining a traditional CRM.

This project must feel like:
- A live command center for customer conversations.
- Customer operations intelligence, not a basic CRM.
- Telegram-first, not email-first.
- Dashboard-first, not chatbot-first.
- AI embedded into workflow, not “chat with GPT.”
- A product that turns communication into operational state.

This project must NOT feel like:
- A generic CRM clone.
- A chatbot wrapper.
- A simple task manager.
- A Streamlit demo.
- A pasted OpenAI prompt UI.
- A dark neon AI SaaS cliché.
- A tiny cramped admin panel.

Core user:
A small business owner / operations manager / customer support lead using Telegram as a customer-service channel.

Recommended demo business:
`ApertureOne Events`, an event photography company that handles booking inquiries, payment confirmations, delivery delays, refund complaints, package upgrades, and corporate event leads through Telegram.

================================================================================
3. NON-NEGOTIABLE REQUIREMENTS
================================================================================

A. Full light mode only
- The entire page must be light mode.
- Do not implement dark mode.
- Do not use dark backgrounds for main pages, sidebars, or large panels.
- Do not use pure white everywhere. Use variants of white/off-white: warm ivory, soft gray, cloud white, pearl, parchment, linen.
- Use high-contrast black/near-black text.
- Keep the design unique and premium through layout, typography, spacing, subtle borders, shadows, data hierarchy, and motion.

B. Telegram real-time ingestion MUST work when configured
- Implement a real Telegram bot integration.
- If `TELEGRAM_BOT_TOKEN` is present, `npm run bot` or `npm run dev:all` must start a Telegram long-polling worker that receives real Telegram messages.
- Incoming Telegram messages must be persisted and reflected in the dashboard without manually editing code.
- The dashboard must automatically update within approximately 1–3 seconds through polling, SSE, or another reliable local mechanism.
- Mock historical/pre-existing data is allowed, but new Telegram messages must be real when the token is set.
- Include a Telegram status panel in Settings showing token configured/not configured, bot username if available, last poll time, and last ingested message time.
- Implement `npm run verify:telegram` to call Telegram `getMe` when a token exists and verify connectivity.
- If no token is present, the app must still run and show explicit setup instructions. Do not claim real Telegram has been verified without a token.

C. OpenAI API real test MUST work when configured
- If `OPENAI_API_KEY` is present, the app and verification script must make real OpenAI API calls.
- Implement `npm run verify:openai`.
- Use OpenAI only server-side.
- Use structured extraction for customer messages.
- If no key is present, deterministic fallback must still work.
- Do not claim real OpenAI was verified without a real key and successful call.

D. App must be demo-ready with no manual code edits after setup
- `npm install` then `npm run dev` should run the web dashboard.
- `npm run dev:all` should run the Vite frontend, Express backend, and Telegram bot worker together if possible.
- `.env.example` must list every required env var.
- `.env.local` must be created first with placeholders for me to fill.
- Never hardcode or expose secrets.
- The dashboard must work with seeded mock data immediately.
- A demo-inject button is allowed for reliability, but must be labeled as demo/mock and must not replace real Telegram ingestion.

E. Premium design is a first-class requirement
- The UI is the most visible part of the project. Treat UI polish as core functionality.
- Use large readable layouts, strong hierarchy, high contrast, aligned spacing, high-quality data tables, smooth interactions, and polished charts.
- Avoid small cramped text.
- Avoid generic AI gradients and cliché glassmorphism.

F. Strict verification is required
- Use Playwright to inspect and interact with the actual app in the browser.
- Do not rely only on build success.
- Verify multiple pages, dashboard updates, demo injection, table interactions, modals/drawers, charts visible, no console errors, and responsive layout at several screen sizes.
- Run backend endpoint sweeps.
- Run design linting.
- Run real OpenAI API verification if key exists.
- Run real Telegram API verification if token exists.
- Run `npm run build` and fix errors.
- Capture screenshots into `artifacts/screenshots/` or similar.
- Write evidence to `QA_REPORT.md`.

G. Finish only when hackathon demo is ready
- Do not stop after first passing compile.
- Continue self-review loops until the demo feels coherent, polished, and usable.
- If you discover missing functionality necessary for the demo, infer and implement it.

# VISUAL REFERENCES, LOGO, AND WIREFRAME REQUIREMENTS

## Reference Assets

The project root contains these visual assets:

- `logo.png` — use this as Syntra’s official logo.
- `inspiration`
- `inspiration1`
- `inspiration2`

The `inspiration`, `inspiration1`, and `inspiration2` files may have any common image extension. Locate them automatically if needed.

Use `logo.png` directly in the app UI. If required, copy it into `/public/logo.png` or the correct static asset folder so it renders reliably in the browser.

Use the three inspiration images only as **visual inspiration** for layout quality, spacing, density, hierarchy, premium feel, card design, charts, typography rhythm, and dashboard polish.

Do **not** copy them directly. Do **not** reproduce their exact layout, exact colors, exact graphics, exact icons, exact charts, exact screenshots, or exact brand identity. Extract design principles, then create an original Syntra interface.

Before implementing the UI, inspect the inspiration images and create/update `DESIGN.md` with:
- observed layout principles
- spacing system
- typography system
- card treatment
- dashboard density
- chart style
- navigation style
- interaction style
- what to emulate
- what not to copy
- final Syntra-specific design decisions

The app must be **full light mode only**. No dark mode. No theme switcher. No dark backgrounds.

Use variants of white, ivory, pearl, pale gray, soft blue-gray, and subtle warm neutrals. Avoid pure flat white everywhere. The page should feel bright, premium, calm, and operational.

Recommended visual direction:

- premium customer-operations dashboard
- light executive command center
- soft layered panels
- large readable sections
- strong information hierarchy
- restrained accent colors
- subtle gradients
- refined shadows
- thin borders
- generous spacing
- rounded cards
- clear tables
- polished charts
- smooth micro-animations
- no clutter
- no generic admin-template look
- no childish SaaS pastel overload

The UI should look demo-ready from first load.

---

# GLOBAL APP SHELL WIREFRAME

All pages should use the same persistent shell.

```txt
┌──────────────────────────────────────────────────────────────────────────────┐
│ Top Bar                                                                      │
│ ┌──────────────┐  Syntra workspace name     Live Telegram Sync ●             │
│ │ logo.png     │                           Search...      Demo Inject  User  │
│ └──────────────┘                                                              │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ Sidebar       │ Main Page Content                                             │
│               │                                                              │
│ Command Center│                                                              │
│ Inbox         │                                                              │
│ Customers     │                                                              │
│ Pipeline      │                                                              │
│ Tasks         │                                                              │
│ Insights      │                                                              │
│ Ops Graph     │                                                              │
│ Settings      │                                                              │
│               │                                                              │
│ Bottom:       │                                                              │
│ Telegram: On  │                                                              │
│ OpenAI: On    │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
Global Shell Requirements

Sidebar:

logo at top using logo.png
app name “Syntra”
clean navigation with icons
active nav item visibly highlighted
integration health badges near bottom:
Telegram: Connected / Waiting / Error
OpenAI: Connected / Waiting / Error

Top bar:

current page title or workspace name
global search
“Inject Demo Message” button
“Telegram Live” indicator
notification bell
user/avatar placeholder

Main content:

max width optimized for 1440px screens but responsive down to laptop widths
use large cards and clear sections
avoid tiny text
no cramped dense enterprise tables unless balanced with spacing

Animation:

cards fade/slide in subtly
live updates should pulse or highlight briefly
new Telegram messages should animate into the dashboard
status badges should feel alive but not distracting
PAGE 1: COMMAND CENTER

This is the primary landing page after startup.

Purpose:
A live customer operations dashboard showing what changed, what is urgent, what is at risk, and what the team should do next.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Command Center                                                               │
│ “Live customer operations from Telegram conversations.”                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Metric Cards Row                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Active Chats │ │ Revenue Risk │ │ Open Issues  │ │ Avg Response │          │
│ │ 48           │ │ $8,420       │ │ 16           │ │ 18 min       │          │
│ │ +12 urgent   │ │ 7 stalled    │ │ 4 high-pri   │ │ -23% faster  │          │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ AI Daily Brief                           │ │ Live Activity Feed          │ │
│ │ Large natural-language operational brief │ │ Telegram events appearing   │ │
│ │ with 3-5 prioritized recommendations.    │ │ in realtime.                │ │
│ │                                          │ │                             │ │
│ │ Buttons: View urgent / Assign / Insights │ │ New msg, task created, etc. │ │
│ └──────────────────────────────────────────┘ └─────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Urgent Queue                             │ │ Pipeline Health             │ │
│ │ Table/list of high priority customers.   │ │ Funnel or stage cards.      │ │
│ │ Customer, intent, sentiment, owner, CTA. │ │ New → Qualified → Waiting.  │ │
│ └──────────────────────────────────────────┘ └─────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ Support Load Chart           │ │ Team Performance                        │ │
│ │ Issue categories             │ │ response time, load, unresolved work    │ │
│ └──────────────────────────────┘ └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Command Center must include:

large KPI cards
AI Daily Brief
urgent customer queue
live activity feed
pipeline health visualization
support issue category chart
team performance section
clear proof that Telegram conversations are being transformed into structured operations

When a real Telegram message arrives, this page must visibly update:

active conversation count
urgent queue if applicable
live activity feed
revenue risk if applicable
open issues/tasks if applicable
PAGE 2: INBOX INTELLIGENCE

Purpose:
A Telegram customer inbox enhanced with AI extraction, not a normal chat clone.

Use a three-column layout.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Inbox Intelligence                                                           │
│ Filters: All | Urgent | Leads | Support | Complaints | Waiting | Unassigned │
├──────────────────────┬─────────────────────────────────┬────────────────────┤
│ Conversation List    │ Chat Thread                      │ AI Intelligence    │
│                      │                                 │ Panel              │
│ ┌──────────────────┐ │ ┌─────────────────────────────┐ │ ┌────────────────┐ │
│ │ Sarah Tan         │ │ │ Customer messages           │ │ │ Summary        │ │
│ │ Refund issue      │ │ │ Team replies                │ │ │ Intent         │ │
│ │ High · Negative   │ │ │ AI inline detections        │ │ │ Priority       │ │
│ │ 12 min ago        │ │ │                             │ │ │ Sentiment      │ │
│ └──────────────────┘ │ │ Message composer             │ │ │ Risk           │ │
│ ┌──────────────────┐ │ │ Suggested reply button       │ │ │ Next action    │ │
│ │ Jason Lim         │ │ └─────────────────────────────┘ │ │ Generated reply│ │
│ │ Enterprise lead   │ │                                 │ │ Linked tasks   │ │
│ └──────────────────┘ │                                 │ └────────────────┘ │
└──────────────────────┴─────────────────────────────────┴────────────────────┘

Conversation List:

customer name
Telegram handle
latest message preview
intent badge
priority badge
sentiment badge
time since last activity
unread indicator
assigned owner if any

Chat Thread:

Telegram-style messages
clean bubbles, not overly playful
AI-detected inline chips:
“Payment issue”
“High urgency”
“Possible churn”
“Lead value: $2,500”
message composer
buttons:
Generate Reply
Create Task
Escalate
Mark Resolved
Assign Owner

AI Intelligence Panel:

conversation summary
extracted intent
priority
sentiment
customer type
estimated customer value
churn/revenue risk
recommended next action
generated reply draft
linked tasks
related issue clusters
source confidence

Important:
A real Telegram message should appear here after polling/webhook ingestion. The message must be visible in the conversation thread and reflected in the AI Intelligence Panel after processing.

PAGE 3: CUSTOMERS

Purpose:
Structured customer intelligence extracted from Telegram conversations.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Customers                                                                    │
│ Search...   Filters: Segment | Status | Sentiment | Owner | Risk             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Customer Table                                                               │
│ ┌────────────┬──────────┬──────────┬───────────┬──────────┬───────────────┐ │
│ │ Customer   │ Status   │ Segment  │ Sentiment │ Value    │ Latest Intent │ │
│ ├────────────┼──────────┼──────────┼───────────┼──────────┼───────────────┤ │
│ │ Sarah Tan  │ At Risk  │ Existing │ Negative  │ $180     │ Refund        │ │
│ │ Jason Lim  │ Lead     │ B2B      │ Positive  │ $2,500   │ Corporate     │ │
│ └────────────┴──────────┴──────────┴───────────┴──────────┴───────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Clicking a customer opens a large right-side drawer.

Customer Detail Drawer:

┌──────────────────────────────────────────────┐
│ Sarah Tan                                    │
│ Existing customer · At Risk · Negative       │
├──────────────────────────────────────────────┤
│ Tabs: Overview | Conversations | Tasks | Timeline | Insights                │
├──────────────────────────────────────────────┤
│ Overview:                                    │
│ - AI customer summary                        │
│ - sentiment trend                            │
│ - open issues                                │
│ - lifetime/estimated value                   │
│ - owner                                      │
│ - recommended next action                    │
│                                              │
│ Timeline:                                    │
│ May 12: Asked about delivery                 │
│ May 13: Payment confirmed                    │
│ May 15: Reported delay                       │
│ May 17: Requested refund                     │
└──────────────────────────────────────────────┘

The customer page should make Syntra feel like a customer-memory system, not just a contact table.

PAGE 4: PIPELINE

Purpose:
Track leads and opportunities extracted from Telegram conversations.

Use a Kanban layout.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Pipeline                                                                     │
│ AI insight: “7 stalled leads represent $8,420 at risk.”                      │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ New Inquiry  │ Qualified    │ Waiting Reply│ Proposal Sent│ Negotiation    │
│              │              │              │              │                │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌────────────┐ │
│ │ Customer │ │ │ Customer │ │ │ Customer │ │ │ Customer │ │ │ Customer   │ │
│ │ Intent   │ │ │ Value    │ │ │ Delay    │ │ │ Proposal │ │ │ Objection  │ │
│ │ Value    │ │ │ Next Act │ │ │ Risk     │ │ │ Next Act │ │ │ Risk       │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └────────────┘ │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘

Each opportunity card:

customer name
source: Telegram
latest intent
estimated value
sentiment
next best action
owner
delay/risk indicator

Click card → lead detail modal:

conversation summary
buying signals
objections
estimated value
generated follow-up
linked tasks
source messages
timeline

Pipeline page should show how customer chats become business opportunities.

PAGE 5: TASKS

Purpose:
Tasks automatically extracted from customer conversations.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Tasks                                                                        │
│ Filters: All | High Priority | Due Today | Unassigned | From Telegram        │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────┬──────────┬────────┬────────────┐ │
│ │ Task         │ Customer     │ Owner    │ Priority │ Status │ Source     │ │
│ ├──────────────┼──────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │ Check refund │ Sarah Tan    │ Finance  │ High     │ Open   │ Telegram   │ │
│ │ Send invoice │ Jason Lim    │ Alex     │ High     │ Open   │ Telegram   │ │
│ └──────────────┴──────────────┴──────────┴──────────┴────────┴────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Required behavior:

every task must link back to its source conversation/message
clicking “View Source” opens the relevant conversation
tasks created from new Telegram messages should appear here
tasks should have clear statuses:
Open
In Progress
Waiting
Done
allow status changes in the UI for demo purposes

Optional but preferred:

board view toggle
priority grouping
due-date grouping
PAGE 6: INSIGHTS

Purpose:
Show operational intelligence across all customer conversations.

This page is critical for avoiding “just CRM” perception.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Insights                                                                     │
│ “Patterns detected across Telegram customer conversations.”                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┐ ┌────────────────────────────┐                │
│ │ Recurring Issues           │ │ Sentiment Trend             │                │
│ │ Refund delay +34%          │ │ line chart                  │                │
│ │ Delivery delay +18%        │ │ Positive/Neutral/Negative   │                │
│ └────────────────────────────┘ └────────────────────────────┘                │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┐ ┌────────────────────────────┐                │
│ │ Response Delay Analysis    │ │ Revenue Risk                │                │
│ │ slowest queues, busiest hr │ │ stalled leads, open issues  │                │
│ └────────────────────────────┘ └────────────────────────────┘                │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ AI Recommendations                                                       │ │
│ │ 1. Assign one person to refund complaints today.                         │ │
│ │ 2. Follow up with top 3 stalled leads.                                   │ │
│ │ 3. Create a saved reply for payment confirmation.                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Insights to include:

recurring issue clusters
customer sentiment trend
response delay analysis
revenue risk summary
team bottlenecks
lead conversion risks
top recommended operational fixes
detected root causes where possible

Charts:

line chart for sentiment trend
bar chart for issue categories
funnel/pipeline chart for lead movement
small trend sparklines in cards
avoid ugly default chart styling
PAGE 7: OPERATIONS GRAPH

Purpose:
Make the product feel original and AI-native.

Show how Telegram conversations become operational company state.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Operations Graph                                                             │
│ “Customer conversations mapped into tasks, risks, owners, and opportunities.”│
├──────────────────────────────────────────────────────────────────────────────┤
│ Graph Canvas                                                                 │
│                                                                              │
│  Sarah Tan ── Refund Complaint ── Check Refund Task ── Finance Owner          │
│      │                  │                         │                          │
│      └── Negative Sentiment             Churn Risk High                       │
│                                                                              │
│  Jason Lim ── Corporate Lead ── Send Invoice Task ── Revenue Risk $2,500      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Right/Bottom Inspector Panel                                                  │
│ Selected node details, source conversation, confidence, next action           │
└──────────────────────────────────────────────────────────────────────────────┘

Graph requirements:

nodes for customers, conversations, tasks, risks, owners, opportunities
edges showing relationships
clicking node opens inspector
new Telegram message can create/update graph nodes
this can be implemented with a lightweight graph library or custom SVG/HTML layout
must be visually polished enough for demo

This page is a key differentiator. It should communicate:
“Syntra transforms communication into operational structure.”

PAGE 8: SETTINGS / INTEGRATIONS

Purpose:
Show real integration status and allow verification.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Settings                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Telegram Integration                                                     │ │
│ │ Status: Connected / Waiting / Error                                      │ │
│ │ Bot Username: @example_bot                                               │ │
│ │ Last Update ID: 123456                                                   │ │
│ │ Button: Test Telegram getMe                                              │ │
│ │ Button: Start/Restart Polling                                            │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ OpenAI Integration                                                       │ │
│ │ Status: Connected / Waiting / Error                                      │ │
│ │ Model: selected model                                                    │ │
│ │ Button: Test OpenAI Extraction                                           │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Demo Controls                                                            │ │
│ │ Button: Inject demo Telegram-style customer message                      │ │
│ │ Button: Reset demo data                                                  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Settings must make it obvious whether the real Telegram and OpenAI integrations are working.

MODALS AND DRAWERS

Use large premium side drawers or modals instead of small cramped popups.

Required modals/drawers:

Customer Detail Drawer
Lead Detail Modal
Task Detail Drawer
Conversation Source Modal
AI Extraction Debug Modal
Demo Message Injection Modal

AI Extraction Debug Modal should show:

raw Telegram message
extracted JSON
created/updated customer
created task
created insight
confidence
processing timestamp

This helps during judging because it proves the system actually works.

DESIGN QUALITY CHECKLIST

Before considering the UI complete, verify:

logo.png is visible and crisp
full light mode only
no dark mode artifacts
no pure blank-white boring UI
no cramped text
no tiny unreadable charts
no generic default dashboard look
all major pages have meaningful content
all pages use consistent typography
all cards have consistent radius, padding, border, and shadow
all badges/status indicators are consistent
charts are polished and readable
sidebar navigation works
top search area does not break layout
responsive layout works at laptop width
real Telegram messages visibly enter the system
Telegram-derived messages affect dashboard state
AI extraction results are visible in the UI
Playwright screenshots show a premium, demo-ready interface

================================================================================
5. TECH STACK
================================================================================

Use a stable, hackathon-safe **Vite React + Express** stack.

Frontend:
- Vite
- React
- TypeScript
- React Router DOM
- Tailwind CSS
- shadcn/ui if it installs cleanly in a Vite React app; otherwise implement high-quality custom components
- Recharts for charts
- Lucide React for icons
- Framer Motion if it installs cleanly; otherwise CSS transitions

Backend:
- Node.js
- Express
- TypeScript
- REST API routes under `/api/*`
- Separate Telegram bot worker for long polling, or a backend process that can start the bot worker
- Local SQLite persistence preferred, using `better-sqlite3` or another stable library
- If SQLite causes issues, fall back to JSON file persistence in `data/`, but prefer SQLite

Architecture:
- Frontend SPA: `http://localhost:5173`
- Backend API: `http://localhost:8787`
- Frontend calls backend using `VITE_API_BASE_URL`
- React Router handles frontend pages
- Express handles backend API endpoints
- Telegram bot worker writes to the same data store used by Express
- Dashboard polls `/api/snapshot` every 1–2 seconds for local realtime updates

AI:
- Use OpenAI API only server-side if `OPENAI_API_KEY` exists.
- Use structured JSON extraction.
- Validate output using Zod or equivalent.
- Provide deterministic fallback extraction if OpenAI API key is absent or API fails.
- The app must remain useful without OpenAI, but more intelligent with it.

Realtime dashboard update:
- Prefer reliable client polling every 1–2 seconds for local hackathon demo.
- SSE/WebSocket is optional if easy, but do not risk instability.

Scripts:
- `npm run dev` — run Vite frontend only
- `npm run server` — run Express backend only
- `npm run bot` — run Telegram bot worker only
- `npm run dev:all` — run frontend + backend + bot worker using `concurrently` or similar
- `npm run build` — build frontend and compile/check backend
- `npm run lint` — lint if configured
- `npm run test:e2e` — Playwright tests
- `npm run wait:env` — wait/check for `.env.local` secrets
- `npm run verify:openai` — make real OpenAI Responses API call if key exists
- `npm run verify:telegram` — make real Telegram `getMe` call if token exists
- `npm run verify:real-apis` — run both real API verifications and write results
- `npm run seed` — seed mock historical data
- `npm run qa` — run build/lint/e2e/endpoint checks where practical

Create:
- `RUN_ALL.bat` for Windows that runs `npm run dev:all`
- `RUN_ALL.sh` for Unix/macOS if practical

If package installation fails for a dependency, replace it with a simpler equivalent rather than stopping.

================================================================================
6. DESIGN SYSTEM — CREATE `DESIGN.md`
================================================================================

Create a `DESIGN.md` file before building UI. Use the Google Labs DESIGN.md format with YAML front matter and prose rationale.

Design direction:
- Full light-mode, premium operational dashboard.
- No dark mode anywhere.
- No pure-white boring surface everywhere. Use off-white layers.
- White/off-white surfaces: ivory, pearl, linen, cloud white.
- High-contrast black typography.
- Minimal monochrome base.
- Controlled status colors only.
- Large cards and generous spacing.
- No tiny cramped UI.
- No cyberpunk dark mode.
- No random neon AI gradients.
- No “purple SaaS slop” aesthetic.

Brand register:
- Product surface first. Clarity and trust matter more than expressive landing-page visuals.
- Use subtle premium details: precise borders, shadows, large numbers, elegant tables, motion, and high-quality charts.

Suggested tokens:

```
---
version: alpha
name: Syntra
description: Premium full-light operational intelligence dashboard for Telegram customer operations.
colors:
  background: "#F5F3EE"
  backgroundAlt: "#F8F7F3"
  surface: "#FFFEFA"
  surfaceRaised: "#FFFFFF"
  surfaceMuted: "#F1F3F5"
  primary: "#0A0A0A"
  secondary: "#525866"
  muted: "#7A808C"
  border: "#E2E6EA"
  borderStrong: "#CDD5DF"
  accent: "#2563EB"
  violet: "#7C3AED"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#EF4444"
  info: "#3B82F6"
typography:
  display:
    fontFamily: Geist, Inter, ui-sans-serif, system-ui
    fontSize: 2.5rem
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  h1:
    fontFamily: Geist, Inter, ui-sans-serif, system-ui
    fontSize: 2rem
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Geist, Inter, ui-sans-serif, system-ui
    fontSize: 1.375rem
    fontWeight: 620
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: Geist, Inter, ui-sans-serif, system-ui
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: Geist, Inter, ui-sans-serif, system-ui
    fontSize: 0.75rem
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.04em"
  mono:
    fontFamily: IBM Plex Mono, ui-monospace, SFMono-Regular
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 18px
  xxl: 24px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  card:
    backgroundColor: "{colors.surfaceRaised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  badge-critical:
    backgroundColor: "#FEF2F2"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
  badge-success:
    backgroundColor: "#ECFDF5"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
---
```

After creating DESIGN.md:
- Research current Google Labs DESIGN.md CLI usage before assuming exact commands.
- Try to run all available relevant commands from `https://github.com/google-labs-code/design.md`.
- Attempt commands equivalent to `spec`, `lint`, `export`, and `diff` if available.
- Save outputs/summaries under `artifacts/design-md/` and include results in `QA_REPORT.md`.
- If CLI cannot run, document why and manually enforce the design tokens in Tailwind/CSS.

================================================================================
7. VISUAL DESIGN REQUIREMENTS
================================================================================

The UI must be substantially better than a default admin template.

Global design:
- Full light mode.
- Main background: warm off-white / linen, not pure white.
- Cards: brighter white/ivory, subtle border, very soft shadow.
- Typography: large, high contrast, not tiny.
- Data tables: readable row height, clear columns, sticky-ish headers if easy.
- Sidebar: light, clean, mostly monochrome.
- Accent color: restrained blue/violet only for selected states and charts.
- Status colors: green/yellow/red/blue only for meaning.
- Use meaningful icons, not decorative clutter.
- Use smooth transitions on cards, drawers, row hover, pipeline cards, graph nodes.
- Use skeleton/loading states when fetching snapshot.
- Avoid excessive nested cards.
- Avoid text over gradients.
- Avoid gray-on-gray low contrast.
- Avoid walls of tiny copy.

Logo:
- Create a simple black-and-white Syntra wordmark in SVG or CSS.
- Include a minimal abstract mark suggesting signal/flow/structure, not a generic sparkle AI icon.
- Use in sidebar/header.

Dashboard density:
- Everything should be bigger and separated by pages or modals/drawers.
- Do not cram all features into one screen.
- Use side drawers for details.
- Use modals for customer/lead/task details.
- Use the dashboard to show high-level metrics and let pages show detail.

Animation:
- Subtle, fast, professional.
- New Telegram message should animate into the urgent queue/inbox.
- Metric cards can gently count/update.
- Pipeline cards can slide/fade.
- Operations Graph nodes can softly pulse for new activity.
- No excessive motion that hurts readability.

Responsive:
- Primary target: laptop/projector 1440x900.
- Also verify 1280x800 and mobile-ish 390x844.
- Mobile can stack layout, but desktop dashboard quality is priority.

================================================================================
8. DATA MODEL
================================================================================

Implement these entities. Use SQLite tables if possible. Use TypeScript types either way.

Customer:
```
Customer {
  id: string
  telegramChatId?: string
  telegramUsername?: string
  name: string
  status: "lead" | "active" | "at_risk" | "resolved" | "vip" | "unknown"
  segment: "new_lead" | "existing_customer" | "corporate" | "support" | "unknown"
  sentiment: "positive" | "neutral" | "negative" | "frustrated"
  estimatedValue: number
  assignedOwner: string
  tags: string[]
  lastContactAt: string
  createdAt: string
  updatedAt: string
}
```

Conversation:
```
Conversation {
  id: string
  customerId: string
  source: "telegram" | "demo_seed" | "demo_inject"
  status: "open" | "waiting_for_team" | "waiting_for_customer" | "resolved" | "escalated"
  intent: string
  priority: "low" | "medium" | "high" | "critical"
  sentiment: "positive" | "neutral" | "negative" | "frustrated"
  summary: string
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}
```

Message:
```
Message {
  id: string
  conversationId: string
  customerId: string
  telegramMessageId?: string
  sender: "customer" | "team" | "system"
  text: string
  timestamp: string
  rawPayload?: string
}
```

Task:
```
Task {
  id: string
  title: string
  description: string
  customerId?: string
  conversationId?: string
  sourceMessageId?: string
  owner: string
  ownerRole: "sales" | "support" | "finance" | "ops" | "unassigned"
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "done" | "blocked"
  dueDate: string
  createdAt: string
  updatedAt: string
}
```

Opportunity:
```
Opportunity {
  id: string
  customerId: string
  conversationId?: string
  stage: "new_inquiry" | "qualified" | "waiting_reply" | "proposal_needed" | "proposal_sent" | "negotiation" | "won" | "lost"
  title: string
  estimatedValue: number
  riskLevel: "low" | "medium" | "high" | "critical"
  nextAction: string
  sourceMessageId?: string
  createdAt: string
  updatedAt: string
}
```

Insight:
```
Insight {
  id: string
  type: "risk" | "opportunity" | "bottleneck" | "sentiment" | "recurring_issue" | "team_load" | "revenue"
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  confidence: number
  relatedCustomerId?: string
  relatedConversationId?: string
  createdAt: string
}
```

SystemStatus:
```
SystemStatus {
  id: string
  openaiConfigured: boolean
  openaiVerifiedAt?: string
  openaiStatus: "verified_real_api" | "pending_missing_secret" | "failed_real_api" | "not_checked"
  telegramConfigured: boolean
  telegramVerifiedAt?: string
  telegramStatus: "verified_real_api" | "pending_missing_secret" | "failed_real_api" | "not_checked"
  telegramBotUsername?: string
  lastTelegramMessageAt?: string
  lastLiveTelegramChatId?: string
  lastApiVerificationAt?: string
}
```

================================================================================
9. AI EXTRACTION LOGIC
================================================================================

Create a server-side extraction module.

Behavior:
- When a new Telegram customer message arrives, analyze the message and recent conversation context.
- Use OpenAI if `OPENAI_API_KEY` exists and passes real verification.
- Use deterministic fallback if OpenAI is unavailable.
- Always return validated structured data.
- If AI output fails validation, repair or fall back.
- Never block message persistence due to AI failure. Store the message first, then analyze.
- UI must display `Extraction source: OpenAI` or `Extraction source: Fallback rules`.

OpenAI implementation:
- Use the official OpenAI SDK.
- Use Responses API.
- Read key from env only.
- Use model from `OPENAI_MODEL`, default `gpt-4.1-mini`.
- Keep extraction prompt compact but strict.
- Ask for JSON only.
- Validate with Zod.
- If model returns malformed JSON, attempt one repair; if still bad, fallback.

Extraction fields:
- intent
- priority
- sentiment
- customer type
- estimated value
- summary
- next action
- suggested reply
- risks
- tasks
- opportunity if commercial
- tags
- confidence
- extraction source

Fallback rules:
- “urgent”, “today”, “asap”, “angry”, “refund”, “cancel”, “bad review”, “complaint” => high/critical priority.
- “corporate”, “company”, “event”, “package”, “quote”, “pricing”, “invoice”, “booking” => opportunity.
- “paid”, “payment”, “invoice”, “transfer” => finance task.
- “delivery”, “photos”, “album”, “not received” => support/ops task.
- Negative sentiment for frustration, delay, refund, complaint, no reply.
- Positive sentiment for interested, excited, want to book, recommend, upgrade.
- Estimated values for demo business:
  - refund/support issue: 100–400
  - standard booking: 800–1600
  - corporate/event lead: 2500–7000
  - package upgrade: 300–1000

================================================================================
10. TELEGRAM INTEGRATION DETAILS
================================================================================

Implement real Telegram ingestion with long polling.

Preferred structure:

Frontend:
- `src/main.tsx` — Vite React entrypoint.
- `src/App.tsx` — React Router shell.
- `src/routes/Dashboard.tsx`.
- `src/routes/Inbox.tsx`.
- `src/routes/Customers.tsx`.
- `src/routes/Pipeline.tsx`.
- `src/routes/Tasks.tsx`.
- `src/routes/Insights.tsx`.
- `src/routes/Graph.tsx`.
- `src/routes/Settings.tsx`.
- `src/components/*` — shared UI components.
- `src/lib/api.ts` — frontend API client using `VITE_API_BASE_URL`.
- `src/lib/types.ts` — shared frontend types if useful.
- `src/styles/*` — Tailwind/global styles.

Backend:
- `server/index.ts` — Express server entrypoint.
- `server/routes/health.ts`.
- `server/routes/snapshot.ts`.
- `server/routes/conversations.ts`.
- `server/routes/demo.ts`.
- `server/routes/tasks.ts`.
- `server/routes/opportunities.ts`.
- `server/routes/telegram.ts`.
- `server/routes/system.ts`.
- `server/services/openai.ts`.
- `server/services/extraction.ts`.
- `server/services/telegram.ts`.
- `server/services/process-message.ts`.
- `server/store/*` — persistence functions shared by API routes and bot worker.
- `server/types.ts` — backend/shared entity types.

Scripts:
- `scripts/telegram-bot.ts` — starts real Telegram long polling.
- `scripts/verify-telegram.ts` — real Telegram `getMe` verification.
- `scripts/verify-openai.ts` — real OpenAI verification and extraction test.
- `scripts/verify-real-apis.ts` — runs both.
- `scripts/wait-for-env.ts` — waits/checks for secrets.
- `scripts/seed.ts` — seed mock historical data.
- `scripts/endpoint-sweep.ts` — calls backend endpoints and verifies JSON.

Do not create `app/api/.../route.ts`. That is a Next.js convention and is forbidden for this project.

Bot behavior:

1. `/start`
- Reply: “Syntra demo bot connected. Send a customer-service style message and it will appear in the Syntra dashboard.”
- Store customer/user if useful.

2. `/demo`
- Send the user instructions and optionally create a sample demo message.

3. Any normal text message:
- Identify customer from `chat.id`, `username`, `first_name`, `last_name`.
- Create or update Customer.
- Create or update open Conversation.
- Save Message.
- Run extraction.
- Update Conversation, Customer, Tasks, Opportunities, Insights.
- Update SystemStatus: last Telegram message timestamp, last chat id, last username, last intent.
- Dashboard should reflect new data automatically.

4. Attachments:
- If photo/document/voice is received, store a placeholder message like `[photo received]` and classify as attachment/customer follow-up. Do not need full media download.

Outbound replies:
- Add a “Send via Telegram” action in the conversation AI panel if `TELEGRAM_ENABLE_OUTBOUND_REPLIES=true` and token exists.
- Endpoint sends a message to the customer chat id.
- If token missing, show disabled state and instructions.
- Do not auto-send AI-generated replies without explicit dashboard user action.
- Real API test may send at most one controlled test reply after live chat id exists.

Local demo:
- Long polling is preferred because Telegram webhooks need public HTTPS.
- `npm run dev:all` should run the Vite frontend, Express backend, and Telegram bot worker together.
- If `TELEGRAM_BOT_TOKEN` is missing, bot worker should exit gracefully with clear instructions and dashboard should still run.
- Make a RUN_ALL.bat file that I can click that runs the Vite frontend, Express backend, and Telegram bot worker.

================================================================================
11. BACKEND/API ENDPOINTS
================================================================================

Implement these endpoints using **Express**.

The Express server must run on `SERVER_PORT`, default `8787`.

Frontend must call these endpoints through `VITE_API_BASE_URL`.

Required Express routes:

GET `/api/health`
- Returns app status, db status, mock/real mode, timestamp.

GET `/api/snapshot`
- Returns complete dashboard snapshot: metrics, customers, conversations, messages, tasks, opportunities, insights, pipeline counts, team metrics, OpenAI status, Telegram status.

POST `/api/demo/inject`
- Creates a demo customer message through the same processing pipeline as Telegram.
- Body can include optional text/name.
- Must be clearly mock/demo.
- Used for Playwright and backup demo.

GET `/api/conversations`
- Returns conversations with customer summaries.

GET `/api/conversations/:id`
- Returns selected conversation and messages.

POST `/api/tasks/:id/status`
- Updates task status.

POST `/api/opportunities/:id/stage`
- Updates pipeline stage.

GET `/api/telegram/status`
- Returns configured status, bot username if known, last poll/message info.

POST `/api/telegram/send-reply`
- Sends a Telegram reply to a customer if token and chat id exist.

POST `/api/telegram/webhook`
- Optional webhook handler for future deployment. Long polling is still preferred for local hackathon demo.

GET `/api/system/status`
- Returns real API verification status.

Optional:
- POST `/api/ai/extract`

Endpoint sweep:
- Create script or Playwright/API test that calls required endpoints and verifies successful JSON.
- Include results in QA.

================================================================================
12. PAGES AND COMPONENT SPEC
================================================================================

Routes:
- `/` — redirect to `/dashboard` or short landing with “Enter Dashboard”.
- `/dashboard` — Command Center.
- `/inbox` — Inbox Intelligence.
- `/customers` — Customers.
- `/pipeline` — Pipeline.
- `/tasks` — Tasks.
- `/insights` — Insights.
- `/graph` — Operations Graph.
- `/settings` — Settings and verification.

Shared layout:
- Light sidebar.
- Top header.
- Main content area.
- Global live indicator.
- Notification/toast area.
- No dark backgrounds.

Page 1: `/dashboard` — Command Center
- Heading: “Command Center”
- Subheading: “Live customer operations from Telegram conversations.”
- Live Telegram sync pill.
- OpenAI extraction status pill.
- Last updated timestamp.
- Metric cards: Active Conversations, Revenue at Risk, Unresolved Issues, Average Response Time.
- AI Daily Brief card with concise operational summary and action buttons.
- Urgent Queue table/list with Customer, Intent, Priority, Sentiment, Last Response, Owner, Suggested Action.
- Pipeline Health chart/funnel.
- Support Load card with issue categories.
- Team Performance card/table.
- Recent Telegram Activity stream.
- “Inject Demo Message” button for fallback demo.

Page 2: `/inbox` — Inbox Intelligence
- Three-column layout.
- Left: conversation list with filters: All, Urgent, Leads, Support, Complaints, Waiting Reply, Unassigned, High Value.
- Middle: Telegram-style chat thread with message bubbles and inline AI highlights.
- Right: AI Intelligence Panel with Customer Summary, Extracted Fields, Suggested Next Action, Generated Reply, Linked Tasks, Related Issues.
- Buttons: Use Reply, Edit Reply, Send via Telegram, Create Task, Escalate, Mark Resolved.
- Show extraction source and confidence.

Page 3: `/customers` — Customers
- Large customer table with Customer, Telegram, Status, Segment, Sentiment, Latest Intent, Value, Open Issues, Last Contact, Owner.
- Filters: All, At Risk, Leads, Corporate, Negative, Unassigned.
- Customer detail drawer with tabs: Overview, Conversations, Tasks, Timeline, Insights.
- Timeline events show Telegram-derived operational memory.

Page 4: `/pipeline` — Pipeline
- Kanban board stages: New Inquiry, Qualified, Waiting Reply, Proposal Needed/Sent, Negotiation, Won, Lost.
- Each lead card shows customer, intent, value, sentiment, last reply, next action, risk, source.
- AI pipeline insight card at top.
- Lead detail modal with conversation summary, buying signals, objections, next action, suggested reply, timeline.

Page 5: `/tasks` — Tasks
- Metric cards: Open, Due Today, Blocked, Done.
- Task table/board with Task, Source Customer, Owner, Priority, Due Date, Status, Source Message.
- Every task has “View Source Conversation”.
- Detail drawer shows original Telegram evidence.

Page 6: `/insights` — Insights
- Recurring Issue Clusters with counts, trend, severity, suggested fix.
- Customer Sentiment Trend line chart.
- Response Delay Analysis chart/card.
- Revenue Risk card.
- AI Recommendations list.
- Evidence links to conversations/tasks/customers.

Page 7: `/graph` — Operations Graph
- Node graph showing how conversations become business operations.
- Node types: customers, conversations, messages, tasks, tickets, team members, blockers, opportunities, insights.
- Example path: Sarah Tan → Refund Complaint → Task: Check refund → Owner: Finance → Risk: Churn.
- Right-side Node Inspector showing evidence, linked objects, next action.
- This page is important for originality. Make it visually clean and impressive.

Page 8: `/settings` — Settings + Verification
- OpenAI API status card.
- Telegram Bot status card.
- Dashboard/Database status card.
- Design QA status card.
- Setup instructions.
- Verification console/log.
- Show `.env.local` presence, redacted values, bot username, last API verification, last live Telegram message.
- Buttons/actions: Verify OpenAI, Verify Telegram, Run Real API Checks, Seed Demo Data, Inject Demo Message.

================================================================================
13. MOCK DATA / SEED DATA
================================================================================

Seed realistic historical data for ApertureOne Events.

Customers:
- Sarah Tan — existing customer, refund request, negative sentiment, $180 risk.
- Jason Lim — corporate event lead, positive/frustrated, $3,000 opportunity.
- Nur Aisyah — delivery delay complaint, frustrated, $400 risk.
- Clara Wong — payment confirmation issue, neutral/frustrated, $900 booking.
- Marcus Ong — package upgrade inquiry, positive, $650 opportunity.
- Wei Studio — corporate partnership inquiry, positive, $5,200 opportunity.
- Nadine Lee — album delivery question, neutral, $120 support.

Conversation examples:
- “Still haven’t received my refund. I’ve asked three times already.”
- “We need a corporate event photographer next Friday. Can you send quotation today?”
- “I paid yesterday but no one confirmed my booking.”
- “Can I upgrade my package to include same-day highlights?”
- “The photos were supposed to arrive yesterday. Any update?”
- “Our company may need coverage for 200 pax. Please send pricing.”

Tasks:
- Check refund status.
- Send corporate invoice.
- Confirm payment transfer.
- Update delivery ETA.
- Prepare quote deck.
- Escalate complaint.

Insights:
- Refund complaints increased this week.
- Corporate leads are waiting for invoice response.
- Payment confirmations are a recurring support issue.
- Slow response correlates with negative sentiment.
- Finance-related tickets need a dedicated owner today.

================================================================================
14. PLAYWRIGHT AND QA REQUIREMENTS
================================================================================

Install and use Playwright. Use it strictly.

Create tests that:
- Start the app.
- Visit `/dashboard`.
- Verify key text is visible.
- Verify light-mode background and no dark page background.
- Verify metric cards exist.
- Verify charts render.
- Click sidebar nav to every route.
- Visit `/inbox`, select a conversation, verify AI panel exists.
- Visit `/customers`, open detail drawer.
- Visit `/pipeline`, verify kanban columns and lead cards.
- Visit `/tasks`, open source conversation drawer.
- Visit `/insights`, verify insight cards and charts.
- Visit `/graph`, verify graph nodes and inspector.
- Visit `/settings`, verify API status panels.
- Click “Inject Demo Message”.
- Verify active conversation count or urgent queue updates.
- Verify new injected message appears in inbox/dashboard.
- Check browser console errors; fail or document if severe.
- Capture screenshots for all pages.
- Test at 1440x900, 1280x800, and 390x844.

Endpoint sweep:
- GET `/api/health`.
- GET `/api/snapshot`.
- GET `/api/conversations`.
- GET `/api/telegram/status`.
- GET `/api/system/status`.
- POST `/api/demo/inject` with a test message.
- Verify JSON shape and success.

Build and quality:
- Run `npm run build`.
- Run `npm run lint` if configured.
- Run `npm run test:e2e`.
- Run `npm run verify:real-apis` near the end.
- Run all design commands that are available.
- Fix any bugs discovered.
- Do not ignore obvious UI bugs.

Real API verification:
- If `OPENAI_API_KEY` is present, real OpenAI Responses API call must pass or be recorded as failed with reason.
- If `TELEGRAM_BOT_TOKEN` is present, real Telegram `getMe` must pass or be recorded as failed with reason.
- If a real Telegram message arrives, verify it appears in `/api/snapshot` and in the dashboard UI.

Write all results to `QA_REPORT.md`.

================================================================================
15. RALPH LOOP SELF-CHECKS
================================================================================

Run internal improvement loops. Do not just build once and stop.

Loop 1 — Product Coherence
- Does the app clearly communicate “Telegram customer conversations become operational intelligence”?
- Is there a clear demo path?
- Can a judge understand it in 10 seconds?
- If not, improve headings, empty states, demo data, and dashboard narrative.

Loop 2 — Visual Polish
- Does every page look premium in light mode?
- Are fonts large and readable?
- Are cards aligned?
- Are charts clean?
- Are status badges meaningful?
- Is there any dark-mode leak?
- If not, fix spacing, color, typography, and hierarchy.

Loop 3 — Integration Reality
- Does `.env.local` exist first?
- Are secrets redacted?
- Does OpenAI verification make real API calls when key exists?
- Does Telegram verification make real API calls when token exists?
- Does bot polling receive live messages?
- Do live messages appear on dashboard?
- If not, fix or document exact blocker and fallback.

Loop 4 — Backend Correctness
- Do Express API routes return correct data?
- Does message processing update customers, conversations, tasks, opportunities, insights?
- Are generated tasks linked to source messages?
- Does demo inject use same pipeline as Telegram?
- If not, fix.

Loop 5 — Playwright Verification
- Does Playwright pass on all pages?
- Are screenshots saved?
- Are console errors absent?
- Are responsive layouts acceptable?
- If not, fix.

Loop 6 — Demo Readiness
- Can the demo be done in 2 minutes?
- Does it have a strong opening, live moment, and proof moment?
- Does it show real Telegram ingestion if token exists?
- Does it show operational graph originality?
- If not, improve demo flow and `demo-script.md`.

================================================================================
16. FINAL ACCEPTANCE CRITERIA
================================================================================

The task is complete only when all feasible criteria below are satisfied:

Files/docs:
- `plan.md` exists and reflects final state.
- `notes.md` exists and reflects final state.
- `AGENTS.md` exists.
- `DESIGN.md` exists.
- `research-notes.md` exists.
- `QA_REPORT.md` exists.
- `DEMO_README.md` exists.
- `demo-script.md` exists.
- `.env.example` exists.
- `.env.local` was created first with placeholders.

Frontend:
- Full light-mode design only.
- No dark mode or dark backgrounds.
- Not pure white everywhere; uses off-white variants.
- Sidebar and all 8 pages exist.
- Dashboard has metrics, brief, urgent queue, pipeline, support load, team performance.
- Inbox has three-column layout and AI panel.
- Customers has table and detail drawer.
- Pipeline has kanban.
- Tasks has task table and source conversation traceability.
- Insights has issue clusters, sentiment, response delay, revenue risk, recommendations.
- Graph has operational node graph and inspector.
- Settings has OpenAI/Telegram verification status.
- Charts and animations exist.
- UI is large, readable, and premium.

Backend:
- Required API endpoints work.
- Persistence works using SQLite or robust JSON fallback.
- Seed data loads.
- Demo injection works through same processing pipeline.
- Snapshot endpoint returns dashboard state.

AI:
- OpenAI server-side integration implemented.
- `verify:openai` exists and makes real API call when key exists.
- Structured extraction works or fallback works.
- Validation and fallback prevent crashes.

Telegram:
- Real Telegram long-polling worker implemented.
- `verify:telegram` exists and calls real `getMe` when token exists.
- Incoming Telegram text messages are processed through the same pipeline and reflected in dashboard.
- Settings page displays Telegram status.
- If token absent, app clearly shows setup instructions and still demos with seed data.

QA:
- `npm run build` attempted and result recorded.
- Playwright tests run and screenshots saved.
- Endpoint sweep run.
- Design checks attempted/run.
- Real API checks run if secrets exist.
- `QA_REPORT.md` records evidence honestly.

Final demo:
- `DEMO_README.md` explains how to run.
- `demo-script.md` gives a 2-minute presentation.
- The app is visually strong enough for a hackathon judge to immediately understand and remember.

================================================================================
17. SUGGESTED DEMO FLOW
================================================================================

1. Open `/dashboard`.
2. Say: “Syntra turns Telegram customer chats into customer operations intelligence.”
3. Show live metrics, revenue at risk, urgent queue, and AI Daily Brief.
4. Send a real Telegram message to the bot:
   `Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we’ll find another vendor.`
5. Wait for dashboard update.
6. Show new urgent conversation appears.
7. Open `/inbox` and show the message, AI summary, extracted intent, task, revenue risk, suggested reply.
8. Show `/pipeline` where the lead appears.
9. Show `/tasks` where the invoice/follow-up task appears and links back to source message.
10. Show `/graph` where the Telegram message becomes Customer → Intent → Task → Revenue Risk.
11. End with: “The product is not another CRM. It converts unstructured customer communication into operational state.”

================================================================================
18. IMPLEMENTATION ORDER
================================================================================

Do this in order:

1. Create `.env.local`, `.env.example`, `.gitignore`, `plan.md`, `notes.md`, `AGENTS.md`.
2. Implement/run `wait:env` check loop.
3. Research and write `research-notes.md`.
4. Create `DESIGN.md` and try Google Labs DESIGN.md CLI.
5. Scaffold a Vite React + TypeScript frontend and a separate Express + TypeScript backend in the same repo. Do not use Next.js.
6. Implement data store and seed data.
7. Implement backend APIs as Express routes under `server/routes/*`.
8. Implement OpenAI extraction + fallback.
9. Implement real API verification scripts.
10. Implement Telegram bot worker and processing pipeline.
11. Implement light-mode shared layout and navigation.
12. Implement pages: dashboard, inbox, customers, pipeline, tasks, insights, graph, settings.
13. Implement charts, animations, modals/drawers, status badges.
14. Implement demo injection through the same processing pipeline.
15. Implement Playwright tests and screenshot capture.
16. Run endpoint sweep.
17. Run build/lint/tests.
18. Run real API verification if secrets exist.
19. Run design/Impeccable audits if available.
20. Fix issues found.
21. Write final `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md`.
22. Stop only when the app is demo-ready or blockers are honestly documented with fallback.

Remember: do not merely complete the listed tasks. The outcome is a hackathon-ready product. Infer missing details if needed, refine aggressively, verify strictly, and make the demo feel premium, clear, and alive.
```
