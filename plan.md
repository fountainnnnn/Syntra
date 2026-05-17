# Syntra Execution Plan

## Current Stage

Phase 7: Top-level README documentation refresh is complete.

Next phase: Commit and push the README checkpoint, then continue only if a new issue appears.

## Success Criteria

- `.env.example` and `.env.local` exist with placeholder values.
- Secret files are ignored by git.
- `npm run wait:env` checks `.env.local` without printing secrets. Completed: both OpenAI and Telegram secrets became ready.
- `plan.md`, `notes.md`, `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md` are accurate for the verified local demo.
- Phase changes are committed and pushed after verification.
- Pipeline explains how Telegram buying-intent messages move through stages.
- Operations Graph is readable as a left-to-right message-to-workflow map.
- Pipeline and Operations Map avoid card overlap, preserve hierarchy, and use restrained frosted Apple-style surfaces for the desktop/tablet demo target.
- The sidebar uses the canonical `logo.png` Syntra logo asset instead of a generic placeholder icon.
- Pipeline lanes stay compact on wide desktop screens, avoid double vertical scrollbars, and keep the board as a horizontal rail with stage-owned vertical scrolling.
- `README.md` explains what Syntra does, how to run it, key scripts, API endpoints, verification, design system, and security notes.
- `DEMO_README.md` uses the current 57/57 Playwright verification count.

## Phase Plan

1. Bootstrap env/docs/git safety and run `wait:env`.
2. Research UI, CRM operations, Telegram Bot API, OpenAI Responses API, and Google Labs DESIGN.md.
3. Create the React-only Vite frontend and Express backend scaffold.
4. Implement persistence, APIs, OpenAI extraction/fallback, Telegram polling, and verification scripts.
5. Build the premium light-mode dashboard pages and live data flow.
6. Run endpoint sweeps, Playwright tests, responsive screenshots, build/lint/design checks, and real API verification where secrets exist.
7. Finalize `QA_REPORT.md`, `DEMO_README.md`, and `demo-script.md`.
8. Improve Pipeline and Operations Graph comprehension without breaking existing route/data contracts.
9. Refine Pipeline and Operations Map visual hierarchy, spacing, responsive behavior, and glass-style surface treatment using `impeccable layout` and `impeccable polish` references.
10. Apply Syntra logo-based branding and correct the Pipeline rail spacing/scroll behavior against the user's wide screenshot.
11. Replace the short top-level README with a proper project guide and keep demo docs aligned.

## Latest Verification

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run test`: PASS, 4 Vitest tests.
- `npm run seed`: PASS.
- `npm run sweep:endpoints`: PASS, 6 endpoint checks.
- `npm run verify:real-apis`: PASS, OpenAI and Telegram real APIs verified.
- `npm run design:lint`, `npm run design:spec`, `npm run design:export`: PASS.
- `npm run test:e2e`: PASS, 57/57 Playwright tests across desktop, tablet, and mobile.
- Desktop Pipeline and Operations Map screenshots were inspected after the visual refinement pass. Mobile remains covered by the existing regression suite, but it is not the visual optimization target.
- Desktop Pipeline screenshot at 1440px and a manual 2048px wide screenshot were inspected after the logo/rail correction pass.
- Final Pipeline screenshot confirms compact lanes, no double vertical board scrollbar, visible lead actions, and the `logo.png` brand mark in the sidebar.
- Documentation phase verification passed: `git diff --check`, `npm run lint`, `npm run test`, and linked-doc existence checks.

## Next Action

Stage intentional documentation files, commit this README phase, and push `main`.
