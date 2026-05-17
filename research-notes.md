# Syntra Research Notes

## Research Status

- Date: 2026-05-17
- Online research completed for Telegram Bot API, OpenAI Responses API, Google Labs DESIGN.md, customer operations metrics, and dashboard reference systems.
- Local reference systems read from `awesome-design-md`: `linear.app`, `vercel`, `stripe`, and `raycast`.
- Primary visual reference selected: Vercel light-mode surface discipline, Geist-style typography, shadow-as-border, compact controls.
- Secondary structural reference selected: Linear product command-center density, scarce lavender accent, surface hierarchy, product UI as protagonist.

## Sources

- Telegram Bot API: https://core.telegram.org/bots/api/
- OpenAI Responses API: https://developers.openai.com/api/reference/resources/responses/methods/create
- OpenAI Structured Outputs guide: https://platform.openai.com/docs/guides/structured-outputs
- Google Labs DESIGN.md repository: https://github.com/google-labs-code/design.md
- Zendesk SLA policy docs: https://support.zendesk.com/hc/en-us/articles/4408829459866-Defining-SLA-policies
- Microsoft Customer Service summary dashboard docs: https://learn.microsoft.com/en-us/dynamics365/customer-service/use/summary-dashboard-cs
- Stripe Dashboard basics: https://docs.stripe.com/dashboard/basics

## Telegram Bot API Findings

- For local hackathon demos, long polling with `getUpdates` is the safest default because Telegram webhooks require a public HTTPS endpoint.
- Official docs state `getUpdates` will not work while an outgoing webhook is set, so the bot should call `deleteWebhook` before polling.
- Offset must be recalculated after each server response to avoid duplicate updates.
- `getMe` is the correct lightweight verification call for a token.
- `sendMessage` can be used for explicit outbound replies, but Syntra should send at most one controlled test reply and never auto-send AI replies without a user action.

## OpenAI API Findings

- The server should use the official OpenAI SDK and the Responses API.
- Current Responses API supports `text.format` with `{ "type": "json_schema" }` for structured outputs.
- Strict JSON schema is preferred over legacy JSON object mode when the selected model supports it.
- Syntra still needs deterministic validation and fallback extraction because network/API failures, missing secrets, or schema drift should not break the dashboard.

## Google Labs DESIGN.md Findings

- `DESIGN.md` combines YAML front matter tokens with markdown rationale.
- CLI package: `@google/design.md`.
- Relevant commands documented by Google:
  - `npx @google/design.md lint DESIGN.md`
  - `npx @google/design.md diff DESIGN.md DESIGN-v2.md`
  - `npx @google/design.md export --format json-tailwind DESIGN.md`
  - `npx @google/design.md export --format css-tailwind DESIGN.md`
  - `npx @google/design.md export --format dtcg DESIGN.md`
  - `npx @google/design.md spec`
- Windows package scripts should use the `designmd` bin alias instead of `design.md`.

## Customer Operations / CRM Workflow Findings

- Zendesk frames first reply time as the time between ticket creation and the first public agent reply, and next reply time as the oldest unanswered customer comment to the next public agent reply.
- Zendesk resolution metrics use ticket status lifecycle, and docs recommend avoiding too many overlapping resolution metrics.
- Microsoft customer service dashboards include incoming cases, active cases, escalated rate, average resolve time, CSAT, survey sentiment, case volume by status, priority breakdown, channel breakdown, and open case age.
- Stripe Dashboard emphasizes resource navigation, searchable/filterable customer/payment lists, status-rich rows, customer detail pages, analytics, and exportable data.
- Syntra should therefore expose: active conversations, urgent queue, first/next reply risk, unresolved issues, open case age, revenue at risk, pipeline stage counts, recurring issue clusters, sentiment trend, team workload, and source-message evidence.

## Reference Evidence Contract

- Primary reference: `C:\Users\Spiral Crust\.codex\skills\awesome-design-md\design-md\vercel\DESIGN.md`
- Secondary reference: `C:\Users\Spiral Crust\.codex\skills\awesome-design-md\design-md\linear.app\DESIGN.md`
- Considered but not primary: Stripe for premium light shadows and Raycast for command-palette density. Stripe's purple/fintech signature risks overpowering Syntra; Raycast and Linear are dark-first, so only their density and product-protagonist ideas carry over.
- Planned font stack: Geist Sans, Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif. Geist Mono for IDs, timestamps, and technical status.
- Accent palette: restrained lavender-blue for focus/AI/primary actions, Telegram blue only for channel identity, amber/red/green for operational severity.
- Layout model: light product shell with a left rail, top command bar, dense table/list rows, split panes, inspector panels, charts, and a graph canvas. Cards are limited to repeated objects, modals, and isolated metric modules.
- AI-slop patterns to avoid: purple/blue gradient hero, nested card farms, badge-heavy chrome, generic bento grids, dark neon AI aesthetic, oversized marketing hero on app routes, decorative orbs, pure-white blandness.

## Impeccable Status

- `impeccable` skill was loaded.
- Formal preflight is blocked because this project does not contain `PRODUCT.md`, does not yet contain `DESIGN.md` at the time of preflight, and does not have `.claude/skills/impeccable/scripts/load-context.mjs`.
- Manual application: use the product-register rules from the skill, avoid lazy cards, use restrained color, cap body line length, keep copy terse, and perform browser visual QA before delivery.
