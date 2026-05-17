# Syntra Notes

## Verified Demo Build - 2026-05-17

- `RUN_ALL.bat` now clearly starts the Vite frontend, Express API, and Telegram bot worker through `npm run dev:all`.
- Implemented and verified the React-only Vite app, Express TypeScript API, Telegram long-polling worker, OpenAI structured extraction, deterministic fallback extraction, JSON persistence, seed data, endpoint sweep, and full light-mode dashboard.
- Real API status: OpenAI `verified_real_api` with model `gpt-4o` and real structured extraction; Telegram `verified_real_api` with bot `@FountainCRMBot`.
- Verification passed: `npm run lint`, `npm run build`, `npm run test`, `npm run seed`, `npm run sweep:endpoints`, `npm run verify:real-apis`, `npm run design:lint`, `npm run design:spec`, `npm run design:export`, and `npm run test:e2e`.
- Playwright passed 36/36 tests across desktop, tablet, and mobile, covering all required routes, light shell, console checks, screenshots, API contracts, graph inspector, traceability drawers, and demo injection appearing in dashboard and inbox.
- Fixed QA issues found during verification: TypeScript ESLint parsing, OpenAI verifier brittleness, Windows subprocess handling for real API checks, local CORS origin mismatch, mobile nav visibility, hidden text selector collisions, and insights chart selector ambiguity.
- Remaining post-demo optimization: bundle code-splitting would reduce the Vite large chunk warning, but it does not block the hackathon demo.

## 2026-05-17 Bootstrap

- Active goal created from `goal prompt.md`.
- User added requirement: commit and push after each big phase.
- Existing untracked files before Codex edits: `goal prompt.md`, `Inspiration.jpg`, `Inspiration 2.jpg`, `Inspiration 3.jpg`, `logo.png`.
- Current branch: `main`; remote: `origin https://github.com/fountainnnnn/Syntra.git`.
- Phase 1 started with env placeholders, secret-safe gitignore, minimal npm scripts, and progress docs.
- Real API verification is pending until `.env.local` contains non-placeholder `OPENAI_API_KEY` and `TELEGRAM_BOT_TOKEN`.
- `npm install --silent` completed and created `package-lock.json`.
- `npm run wait:env` completed successfully after both OpenAI and Telegram secrets became ready.
- `.env.local` is ignored by `.gitignore`; `git check-ignore -v .env.local` confirmed the ignore rule.

## Impeccable Preflight Fix - 2026-05-17

- User asked to fix the impeccable blockage.
- Added `PRODUCT.md` with a product-register brief for Syntra.
- Added a project-local `.claude/skills/impeccable/scripts/load-context.mjs` wrapper so the exact command required by the skill can resolve project context.
- Verified the loader with `node .claude/skills/impeccable/scripts/load-context.mjs`; it resolves `PRODUCT.md` and `DESIGN.md` from the project root.
- Impeccable preflight status for UI work: context=pass, product=pass, command_reference=pass, shape=not_required, image_gate=skipped, mutation=open.

## Parallel Build Split - 2026-05-17

- User approved sub-agents to speed up the build.
- Backend worker owns `server/**` and integration scripts.
- Frontend worker owns `src/**` and optional `public/**`.
- QA/docs worker owns Playwright config/tests and final demo docs.
- Main thread owns shared root config, package scripts, design CLI evidence, integration review, commits, and pushes.
- After goal recreation, the active worktree still lacked `server/**` and `src/**`; new backend/frontend workers were spawned with stricter disjoint ownership.
- Updated `.gitignore` to keep JSON runtime state and Playwright generated reports/screenshots out of git while preserving source docs and design evidence.

## Env Check - 2026-05-17T04:38:23.008Z
- status: secrets_ready
- secrets_ready=true
- openai_secret_ready=true
- telegram_secret_ready=true

## OpenAI Verification - 2026-05-17T05:47:09.866Z
- OpenAI: failed_real_api (OpenAI response did not include SYNTRA_OPENAI_OK)

## Endpoint Sweep - 2026-05-17T05:47:10.387Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)

## Telegram Verification - 2026-05-17T05:47:14.842Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T05:47:14.882Z
- OpenAI: Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## OpenAI Verification - 2026-05-17T05:47:27.635Z
- OpenAI: failed_real_api (OpenAI response did not include SYNTRA_OPENAI_OK)

## Real API Verification - 2026-05-17T05:48:42.726Z
- OpenAI: undefinedundefined
- Telegram: undefinedundefined

## OpenAI Verification - 2026-05-17T05:48:48.894Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## OpenAI Verification - 2026-05-17T05:51:58.694Z
- OpenAI: failed_real_api (Structured extraction assertion failed)

## Telegram Verification - 2026-05-17T05:52:00.421Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T05:52:00.478Z
- OpenAI: OpenAI: failed_real_api (Structured extraction assertion failed)
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## OpenAI Verification - 2026-05-17T05:52:15.072Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## OpenAI Verification - 2026-05-17T05:52:51.756Z
- OpenAI: verified_real_api (model=gpt-4o, extraction=real)

## Telegram Verification - 2026-05-17T05:52:53.518Z
- Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Real API Verification - 2026-05-17T05:52:53.573Z
- OpenAI: OpenAI: verified_real_api (model=gpt-4o, extraction=real)
- Telegram: Telegram: verified_real_api (bot=@FountainCRMBot, id=8739729891)

## Endpoint Sweep - 2026-05-17T05:56:36.934Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)

## Endpoint Sweep - 2026-05-17T05:57:00.986Z
- GET /api/health: PASS (200)
- GET /api/snapshot: PASS (200)
- GET /api/conversations: PASS (200)
- GET /api/telegram/status: PASS (200)
- GET /api/system/status: PASS (200)
- POST /api/demo/inject: PASS (201)
