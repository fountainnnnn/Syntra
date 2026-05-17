# Syntra QA Report

Date: 2026-05-17

## Current Status

Status: **Demo-ready local build verified.**

Syntra now has a Vite React frontend, separate Express TypeScript API, Telegram long-polling worker, OpenAI structured extraction with deterministic fallback, JSON persistence, seeded demo data, and verified browser flows for all required routes.

## Startup Coverage

- `RUN_ALL.bat` runs `npm run dev:all`.
- `npm run dev:all` starts all three local demo processes: Vite frontend, Express API, and Telegram bot worker.
- Playwright uses `npm run dev:all` as its web server command, so the full frontend/API/bot startup path was exercised during browser verification.

## Verification Results

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | ESLint completed with 0 errors. |
| `npm run build` | PASS | TypeScript passed and Vite built `dist/`; Vite reported only the expected large chunk warning from the dashboard bundle. |
| `npm run test` | PASS | 2 Vitest files, 4 tests passed, including Telegram outbound policy checks. |
| `npm run seed` | PASS | Seeded 7 customers, 7 conversations, 6 tasks, and 3 opportunities. |
| `npm run sweep:endpoints` | PASS | Health, snapshot, conversations, Telegram status, system status, and demo injection endpoints returned JSON success. |
| `npm run verify:real-apis` | PASS | OpenAI real Responses API verified with structured extraction; Telegram real Bot API verified. |
| `npm run design:lint` | PASS | `DESIGN.md` lint completed. |
| `npm run design:spec` | PASS | Design spec command completed. |
| `npm run design:export` | PASS | Design export command completed. |
| `npm run test:e2e` | PASS | 48/48 Playwright tests passed across desktop, tablet, and mobile after the interaction-polish pass. |

## Real API Evidence

OpenAI: **verified_real_api** using model `gpt-4o`; structured extraction mode returned `real`.

Telegram: **verified_real_api** with bot `@FountainCRMBot`, id `8739729891`.

Demo injection pipeline: **verified**. `POST /api/demo/inject` uses the same `processIncomingMessage` pipeline as Telegram ingestion and was verified by endpoint sweep and Playwright UI checks.

## Endpoint Sweep

- `GET /api/health`: PASS (200)
- `GET /api/snapshot`: PASS (200)
- `GET /api/conversations`: PASS (200)
- `GET /api/telegram/status`: PASS (200)
- `GET /api/system/status`: PASS (200)
- `POST /api/demo/inject`: PASS (201)

## Playwright Coverage

Projects:

- Desktop: `1440x900`
- Tablet: `1280x800`
- Mobile: `390x844`

Verified flows:

- `/dashboard`, `/inbox`, `/customers`, `/pipeline`, `/tasks`, `/insights`, `/graph`, and `/settings`
- Light-mode shell checks
- Screenshot capture for all routes
- Inbox conversation selection and AI intelligence panel
- Customer detail drawer
- Pipeline columns and lead evidence
- Task source traceability drawer
- Insights chart and recommendation surfaces
- Operations graph node inspector
- Settings panels and demo controls
- Demo injection reflected on dashboard and inbox
- Pipeline lead detail opens without mutating stage; explicit stage movement is tested separately
- Bounded scrolling for long pipeline/card regions
- Dashboard, inbox, settings, filters, and task status controls give visible feedback or mutate state
- Console-error checks for severe browser errors

Screenshot output: `artifacts/screenshots/`.

Playwright report output:

- `artifacts/playwright-report/`
- `artifacts/playwright-results.json`
- `artifacts/playwright-results.xml`

## Fixes During QA

- Made mobile navigation truly hidden while closed and improved the Playwright helper to select visible text matches.
- Added an explicit insights chart test surface so hidden navigation icons cannot satisfy chart assertions.
- Added TypeScript ESLint support.
- Added focused Vitest coverage for deterministic fallback extraction.
- Relaxed the live OpenAI verifier away from exact model wording while still requiring real structured extraction.
- Fixed `verify:real-apis` process spawning on Windows.
- Allowed both `localhost:5173` and `127.0.0.1:5173` origins for local browser tests.
- Repaired the Pipeline `Open Lead Detail` interaction so it opens a detail drawer instead of moving the lead to another column.
- Added explicit `Move to Negotiation` behavior in the lead detail drawer.
- Added bounded overflow scrolling to the app shell, pages, kanban, columns, tables, activity streams, settings panels, and inbox panes.
- Wired formerly inert dashboard, inbox, settings, filter, and task status controls to feedback or state changes.
- Added `tests/e2e/interaction-polish.spec.ts` for the pipeline regression, scroll bounds, button feedback, filters, and task status controls.
- Removed the Telegram bot worker's automatic test acknowledgement. The bot now ingests customer messages silently; outbound Telegram messages require explicit dashboard reply text.
- Reworked `/pipeline` into a clearer Lead Pipeline with a "How this board works" flow, stage explanations, bottleneck callout, source-aware lead cards, and a drawer that explains why the lead is in its stage and what happens next.
- Reworked `/graph` into an Operations Map with left-to-right workflow steps from Telegram Message through Owner Action, preserving graph node selectors and inspector evidence.
- Added `tests/e2e/workflow-clarity.spec.ts` to lock the new comprehension copy and graph step interactions across desktop, tablet, and mobile.
- Verified the expanded Playwright suite at 54/54 passing and inspected the generated desktop/mobile Pipeline and Operations Map screenshots.
- Applied an Apple-style visual refinement to `/pipeline` and `/graph`: frosted light surfaces, stronger hierarchy, a single desktop Pipeline rail, compact lead-card metric rows, clearer separated evidence/action sections, and a less stretched Operations Map canvas.
- Added a Pipeline rail regression that checks stage columns stay in one row and lead-card buttons remain contained.
- Desktop/tablet are the primary visual target for this product demo. Mobile remains regression-tested by the existing Playwright projects, but this refinement does not optimize the experience specifically for phone use.
- Verified the expanded Playwright suite at 57/57 passing and inspected fresh desktop Pipeline and Operations Map screenshots after refinement.

## Remaining Risk

- The current production bundle has a large JavaScript chunk because the hackathon dashboard is built as one SPA with Recharts. It is acceptable for the local demo, but code-splitting would be a good post-hackathon optimization.
- Live Telegram inbound message evidence depends on a human sending a message while the bot worker is running. The bot token and Bot API verification are real; Playwright uses deterministic demo injection for repeatability.

## Endpoint Sweep - 2026-05-17T06:32:25.621Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)

## OpenAI Verification - 2026-05-17T06:36:40.636Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## Telegram Verification - 2026-05-17T06:36:42.089Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T06:36:42.140Z
- OpenAI: OpenAI: verified_real_api (model=gpt-4o, extraction=real)
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Endpoint Sweep - 2026-05-17T07:16:56.219Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)

## OpenAI Verification - 2026-05-17T07:18:31.094Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## Telegram Verification - 2026-05-17T07:18:32.761Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T07:18:32.828Z
- OpenAI: OpenAI: verified_real_api (model=gpt-4o, extraction=real)
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Endpoint Sweep - 2026-05-17T07:38:45.759Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)

## OpenAI Verification - 2026-05-17T07:38:47.619Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## Telegram Verification - 2026-05-17T07:38:49.893Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T07:38:50.045Z
- OpenAI: OpenAI: verified_real_api (model=gpt-4o, extraction=real)
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)
