# AGENTS.md

## Project Rules

- Preserve and continuously update `plan.md` and `notes.md`; do not let them go stale.
- Keep `goal prompt.md` as the canonical product brief for Syntra.
- Build React only: Vite, React, TypeScript, React Router, and a separate Express TypeScript backend. Do not add Next.js files or conventions.
- Keep the app full light mode. No dark mode and no dark main page shells.
- Never expose secrets. Do not commit `.env.local`, `.env`, `.env.*`, `.envrc`, database files, logs, or secret-bearing artifacts.
- Real Telegram and OpenAI checks must use real network calls when non-placeholder secrets exist, and must clearly report pending or failed status otherwise.
- Use deterministic fallbacks when secrets are absent so the hackathon demo remains usable.
- Demo injection must use the same processing pipeline as Telegram ingestion.
- Verify before claiming completion: build, endpoint sweep, Playwright/browser checks, console checks, design checks, and real API checks when configured.
- Commit and push after each big phase, staging only intentional project changes and keeping pre-existing unrelated user files untouched unless they become part of the implementation.
