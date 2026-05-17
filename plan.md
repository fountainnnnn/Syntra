# Syntra Execution Plan

## Current Stage

Phase 1: Bootstrap env, docs, secret waiting, and first git checkpoint is complete.

Next phase: Research, design-system evidence, and React/Express scaffold.

## Success Criteria

- `.env.example` and `.env.local` exist with placeholder values.
- Secret files are ignored by git.
- `npm run wait:env` checks `.env.local` without printing secrets. Completed: both OpenAI and Telegram secrets became ready.
- `plan.md`, `notes.md`, and `AGENTS.md` are accurate.
- Phase changes are committed and pushed after verification.

## Phase Plan

1. Bootstrap env/docs/git safety and run `wait:env`.
2. Research UI, CRM operations, Telegram Bot API, OpenAI Responses API, and Google Labs DESIGN.md.
3. Create the React-only Vite frontend and Express backend scaffold.
4. Implement persistence, APIs, OpenAI extraction/fallback, Telegram polling, and verification scripts.
5. Build the premium light-mode dashboard pages and live data flow.
6. Run endpoint sweeps, Playwright tests, responsive screenshots, build/lint/design checks, and real API verification where secrets exist.
7. Finalize `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md`.

## Next Action

Commit and push Phase 1, then begin research and scaffold planning.
