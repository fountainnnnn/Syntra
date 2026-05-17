---
version: alpha
name: Syntra
description: "A premium light-mode customer operations command center for Telegram-first service teams. The system adapts Vercel's light surface discipline and shadow-as-border precision, with Linear-style product density and a scarce lavender-blue intelligence accent."
colors:
  primary: "#5E6AD2"
  primary-hover: "#4F5BC4"
  primary-soft: "#ECEEFF"
  telegram: "#229ED9"
  canvas: "#F7F4EE"
  canvas-alt: "#F2EFE7"
  surface: "#FCFBF7"
  surface-raised: "#FFFEFA"
  surface-muted: "#EEEAE0"
  ink: "#151617"
  ink-muted: "#4B5563"
  ink-subtle: "#7A7F87"
  hairline: "#DDD7CC"
  hairline-strong: "#C8C0B3"
  success: "#16833A"
  success-soft: "#E7F6EA"
  warning: "#A46110"
  warning-soft: "#FFF1D6"
  danger: "#B42318"
  danger-soft: "#FDE7E5"
  info: "#176B87"
  info-soft: "#E4F4FA"
typography:
  display:
    fontFamily: "Geist Sans"
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: 0
  page-title:
    fontFamily: "Geist Sans"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: 0
  section-title:
    fontFamily: "Geist Sans"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  panel-title:
    fontFamily: "Geist Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  body:
    fontFamily: "Geist Sans"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-strong:
    fontFamily: "Geist Sans"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0
  body-sm:
    fontFamily: "Geist Sans"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  label:
    fontFamily: "Geist Sans"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0
  mono:
    fontFamily: "Geist Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
rounded:
  xs: 3px
  sm: 5px
  md: 7px
  lg: 8px
  xl: 10px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  app-shell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  side-rail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.lg}"
    padding: 12px
  command-bar:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  primary-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-raised}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  primary-button-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface-raised}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  secondary-button:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  status-pill:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-hover}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  severity-high:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 3px 7px
  severity-medium:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 3px 7px
  severity-low:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 3px 7px
  data-row:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  inspector-panel:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 16px
  graph-canvas:
    backgroundColor: "{colors.canvas-alt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 16px
---

## Overview

Syntra is a light-mode operations workbench, not a marketing page. The visual system uses a warm limestone canvas, off-white raised surfaces, narrow separators, compact controls, and dense operational rows. The dashboard should feel like Telegram conversations have been converted into a living business control surface.

The primary reference is Vercel: light surface discipline, Geist-like type, compact controls, and shadow-as-border precision. The secondary reference is Linear: product UI is the protagonist, color is scarce, and hierarchy comes from information density rather than decoration.

## Colors

The base canvas is warm ivory (`{colors.canvas}`), never pure white. Raised surfaces use `{colors.surface}` and `{colors.surface-raised}` with hairline separation. Primary text uses near-black `{colors.ink}` rather than true black.

The primary accent is Linear-inspired lavender-blue (`{colors.primary}`), reserved for AI extraction, focus states, active navigation, and primary actions. Telegram blue is used only to identify the Telegram channel. Severity colors are semantic: red for revenue or churn risk, amber for waiting or blocked work, green for resolved or healthy states, and blue for informational system status.

## Typography

Use Geist Sans when available, then Inter and system sans fallbacks. Use Geist Mono for IDs, timestamps, endpoint labels, and verification logs. Letter spacing stays at `0` across the system to preserve crisp UI text and avoid unstable layout.

Headings are compact and workbench-sized. Do not use oversized landing-page hero type inside app routes. Numbers should use tabular numerals in CSS.

## Layout

Use a product shell: left rail, top command bar, primary canvas, split panes, inspector panels, dense rows, charts, and graph surfaces. Cards are allowed for individual repeated objects, metrics, modals, and popovers, but page structure should be built from bands, panes, separators, and aligned data surfaces.

Dashboard pages should prioritize scanability:
- Command Center: metric strip, urgent queue, activity stream, pipeline and workload panels.
- Inbox: conversation list, message thread, AI intelligence inspector.
- Customers and Tasks: dense tables with drawers instead of marketing-style cards.
- Graph: one strong operations graph canvas with a right inspector.

## Elevation & Depth

Use Vercel-style shadow-as-border for raised surfaces:

`0 0 0 1px rgba(21, 22, 23, 0.08), 0 8px 22px rgba(35, 31, 24, 0.05)`

Avoid heavy drop shadows. Most hierarchy should come from surface shifts, hairlines, alignment, and typography.

## Shapes

Corners stay restrained. Buttons and rows use 5 to 8px radii. Do not use large rounded cards as the dominant layout material. Pills are reserved for status indicators and filters.

## Components

Buttons are compact and command-like. Data rows use one-line summaries with a small secondary line when needed. Status pills must carry operational meaning, not decoration. Inspector panels contain source evidence, extracted fields, confidence, suggested next actions, and linked tasks.

Charts should be calm and readable with limited color. Use semantic color only when a line or bar represents a real operational state.

## Do's and Don'ts

Do:
- Keep the app fully light mode.
- Use warm off-white surfaces instead of pure white everywhere.
- Make dense product data the protagonist.
- Use lavender-blue sparingly for intelligence and active state.
- Show source evidence for AI conclusions.
- Prefer rows, tables, split panes, rails, and inspectors over card farms.
- Keep all controls reachable and readable on mobile.

Don't:
- Do not add dark page backgrounds or dark sidebars.
- Do not use purple/blue gradients, glassmorphism, decorative orbs, or generic AI SaaS decoration.
- Do not use nested cards.
- Do not make dashboard routes look like landing pages.
- Do not use emoji as UI icons.
- Do not claim real Telegram or OpenAI verification without real API evidence.
