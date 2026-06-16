# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **SOURCE OF TRUTH:** This file documents the _shipped_ system. The implementation
> lives in `tailwind.config.js` and `src/core/theme/tokens.ts` — edit those two
> **together** with this doc. The exhaustive token reference is in `tokens.md`;
> per-widget specs are in `components.md`.

---

**Project:** HelpDesk Lite — internal support ticketing
**Updated:** 2026-06-13
**Category:** Productivity Tool
**Aesthetic:** Minimal + Luxury — restrained, editorial, premium

---

## Design Language

Deep navy as the brand anchor, champagne gold as a sparing premium accent, cool
off-white surfaces, generous whitespace, and **Plus Jakarta Sans** throughout.
Luxury here means _restraint_: muted semantic colors (never neon), soft diffuse
shadows, hairline borders, and crisp type with tight heading tracking and
wide-tracked uppercase micro-labels.

**Gold is an accent, not a workhorse.** Use it for links, focus moments, the brand
rule, and the admin badge — not for primary buttons (those stay navy).

---

## Global Rules

### Color Palette

| Role                    | Hex       | Tailwind class              | Notes                          |
| ----------------------- | --------- | --------------------------- | ------------------------------ |
| Primary (navy)          | `#14213D` | `bg-primary` `text-primary` | Brand, primary buttons         |
| Primary hover           | `#0E1730` | `hover:bg-primary-hover`    |                                |
| Primary subtle          | `#EEF1F6` | `bg-primary-subtle`         | Tints, selected rows           |
| On primary              | `#FFFFFF` | `text-primary-foreground`   |                                |
| Accent (champagne gold) | `#C9A86A` | `bg-accent` `text-accent`   | Links, highlights, admin badge |
| Accent hover            | `#B8975A` | `hover:bg-accent-hover`     |                                |
| Accent subtle           | `#F6F1E7` | `bg-accent-subtle`          | Gold badge background          |
| On accent               | `#1A1408` | `text-accent-foreground`    | Dark ink on gold               |
| Canvas (app bg)         | `#F7F8FA` | `bg-canvas`                 | Page background ("mist")       |
| Surface                 | `#FFFFFF` | `bg-surface`                | Cards, inputs                  |
| Surface muted           | `#F1F2F5` | `bg-surface-muted`          | Hover rows, fills              |
| Surface border          | `#E6E8EC` | `border-surface-border`     | Hairline dividers              |
| Content                 | `#0B1220` | `text-content`              | Primary text                   |
| Content muted           | `#5B6573` | `text-content-muted`        | Secondary text                 |
| Content subtle          | `#95A0B0` | `text-content-subtle`       | Labels, placeholders           |
| Danger                  | `#B4232A` | `text-danger` `bg-danger`   | Muted, desaturated             |
| Success                 | `#2F6E4F` | `text-success`              | Muted emerald                  |
| Warning                 | `#9A7B3F` | `text-warning`              | Muted ochre                    |
| Info                    | `#2C5A7A` | `text-info`                 | Muted steel-blue               |

Each semantic color also has `-subtle` (tinted background) and `-foreground` (text on solid).

### Typography

- **Family (all text):** Plus Jakarta Sans → `font-sans`. System-ui fallback.
- **Loaded via** Google Fonts `<link>` in `index.html` (weights 300–800).
- **Headings:** `font-bold tracking-tight` (`-0.02em`). Page titles `text-2xl`.
- **Body:** weight 400–500, `text-sm`/`text-base`.
- **Micro-labels** (field labels, table headers, eyebrows): `text-xs font-semibold
uppercase tracking-label` (`0.10em`), in `text-content-muted` / `text-content-subtle`.
- **Eyebrows** above titles use `text-accent-hover` for a gold cue.

### Spacing

| Token | Value  | Usage                |
| ----- | ------ | -------------------- |
| `xs`  | `4px`  | Tight gaps           |
| `sm`  | `8px`  | Inline spacing       |
| `md`  | `16px` | Standard padding     |
| `lg`  | `24px` | Card padding (`p-6`) |
| `xl`  | `32px` | Section gaps         |

Form field rhythm: `gap-5` (20px). Section headers: `mb-8`.

### Radius

| Token   | Value    | Tailwind          | Usage                    |
| ------- | -------- | ----------------- | ------------------------ |
| control | `10px`   | `rounded-control` | Buttons, inputs, selects |
| card    | `16px`   | `rounded-card`    | Cards, modals            |
| pill    | `9999px` | `rounded-pill`    | Badges, rules, dots      |

### Shadows

| Token             | Value                                                                | Usage             |
| ----------------- | -------------------------------------------------------------------- | ----------------- |
| `shadow-card`     | `0 1px 2px rgb(11 18 32 / .04), 0 6px 20px -6px rgb(11 18 32 / .08)` | Cards             |
| `shadow-elevated` | `0 16px 48px -12px rgb(11 18 32 / .18)`                              | Modals, dropdowns |
| `shadow-focus`    | `0 0 0 3px rgb(20 33 61 / .12)`                                      | Focus ring (navy) |

Shadows are soft and diffuse — depth without weight. Hovers shift **color/shadow**,
never layout (no translate/scale that reflows).

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — use SVG icons (Lucide/Heroicons). (Transient ✓/! status
  glyphs inside tinted dots are tolerated as placeholders.)
- ❌ **Bright/neon semantic colors** — always use the muted palette above.
- ❌ **Gold primary buttons** — primary CTAs are navy; gold is an accent.
- ❌ **Layout-shifting hovers** — animate color/shadow only.
- ❌ **Hardcoded hex / px radius in className** — extend the tokens instead.
- ❌ **Low contrast text** — maintain 4.5:1 minimum.
- ❌ **Instant state changes** — transitions 150–300ms.
- ❌ **Invisible focus states** — every interactive element shows `shadow-focus`.

---

## Pre-Delivery Checklist

- [ ] Tokens only — no hardcoded hex/radius/shadow in components.
- [ ] Plus Jakarta Sans actually rendering (not system fallback).
- [ ] `cursor-pointer` on all clickable elements.
- [ ] Hover states animate color/shadow with 150–300ms transitions.
- [ ] Text contrast ≥ 4.5:1 (verify gold-on-navy and gold-text uses).
- [ ] Keyboard focus rings visible (`shadow-focus`).
- [ ] `prefers-reduced-motion` respected (handled globally in `index.css`).
- [ ] Responsive at 375px, 768px, 1024px, 1280px.
- [ ] No horizontal scroll on mobile; no content under fixed bars.
