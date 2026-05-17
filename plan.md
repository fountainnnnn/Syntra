# Syntra Execution Plan

## Current Stage

Phase 4: Pipeline and Operations Map UX clarity is complete.

Next phase: Commit and push this UX clarity checkpoint, then continue only if a new issue appears.

## Success Criteria

- `.env.example` and `.env.local` exist with placeholder values.
- Secret files are ignored by git.
- `npm run wait:env` checks `.env.local` without printing secrets. Completed: both OpenAI and Telegram secrets became ready.
- `plan.md`, `notes.md`, `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md` are accurate for the verified local demo.
- Phase changes are committed and pushed after verification.
- Pipeline explains how Telegram buying-intent messages move through stages.
- Operations Graph is readable as a left-to-right message-to-workflow map.

## Phase Plan

1. Bootstrap env/docs/git safety and run `wait:env`.
2. Research UI, CRM operations, Telegram Bot API, OpenAI Responses API, and Google Labs DESIGN.md.
3. Create the React-only Vite frontend and Express backend scaffold.
4. Implement persistence, APIs, OpenAI extraction/fallback, Telegram polling, and verification scripts.
5. Build the premium light-mode dashboard pages and live data flow.
6. Run endpoint sweeps, Playwright tests, responsive screenshots, build/lint/design checks, and real API verification where secrets exist.
7. Finalize `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md`.
8. Improve Pipeline and Operations Graph comprehension without breaking existing route/data contracts.

## Latest Verification

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run test`: PASS, 4 Vitest tests.
- `npm run seed`: PASS.
- `npm run sweep:endpoints`: PASS, 6 endpoint checks.
- `npm run verify:real-apis`: PASS, OpenAI and Telegram real APIs verified.
- `npm run design:lint`, `npm run design:spec`, `npm run design:export`: PASS.
- `npm run test:e2e`: PASS, 54/54 Playwright tests across desktop, tablet, and mobile.
- Desktop and mobile screenshots for `/pipeline` and `/graph` were inspected after the UX clarity pass.

## Next Action

Stage intentional project files, commit this UX clarity phase, and push `main`.
