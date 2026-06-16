# Design Tokens — Reference

Exhaustive token reference for HelpDesk Lite. This is the single source of truth
shared by designers and code.

> ⚠️ **Two files must stay in sync — edit them together:**
>
> - `tailwind.config.js` → the `theme.extend` block (drives all Tailwind classes)
> - `src/core/theme/tokens.ts` → typed values for TS/JS (charts, inline styles)
>
> If you change a value in one, change it in the other **and** update this doc.

---

## Colors

| Token              | Hex       | Tailwind                                                  | `tokens.ts` key           |
| ------------------ | --------- | --------------------------------------------------------- | ------------------------- |
| primary            | `#14213D` | `primary`                                                 | `colors.primary`          |
| primary.hover      | `#0E1730` | `primary-hover`                                           | `colors.primaryHover`     |
| primary.subtle     | `#EEF1F6` | `primary-subtle`                                          | `colors.primarySubtle`    |
| primary.foreground | `#FFFFFF` | `primary-foreground`                                      | —                         |
| accent             | `#C9A86A` | `accent`                                                  | `colors.accent`           |
| accent.hover       | `#B8975A` | `accent-hover`                                            | `colors.accentHover`      |
| accent.subtle      | `#F6F1E7` | `accent-subtle`                                           | `colors.accentSubtle`     |
| accent.foreground  | `#1A1408` | `accent-foreground`                                       | `colors.accentForeground` |
| canvas             | `#F7F8FA` | `canvas`                                                  | `colors.canvas`           |
| surface            | `#FFFFFF` | `surface`                                                 | `colors.surface`          |
| surface.muted      | `#F1F2F5` | `surface-muted`                                           | `colors.surfaceMuted`     |
| surface.border     | `#E6E8EC` | `surface-border`                                          | `colors.surfaceBorder`    |
| content            | `#0B1220` | `content`                                                 | `colors.content`          |
| content.muted      | `#5B6573` | `content-muted`                                           | `colors.contentMuted`     |
| content.subtle     | `#95A0B0` | `content-subtle`                                          | `colors.contentSubtle`    |
| danger             | `#B4232A` | `danger` (+`-subtle` `#FBEFEF`, `-foreground` `#FFFFFF`)  | `colors.danger`           |
| success            | `#2F6E4F` | `success` (+`-subtle` `#EDF4F0`, `-foreground` `#FFFFFF`) | `colors.success`          |
| warning            | `#9A7B3F` | `warning` (+`-subtle` `#F7F1E6`, `-foreground` `#FFFFFF`) | `colors.warning`          |
| info               | `#2C5A7A` | `info` (+`-subtle` `#EAF1F6`, `-foreground` `#FFFFFF`)    | `colors.info`             |

## Typography

| Token             | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| family            | `'Plus Jakarta Sans', system-ui, sans-serif` (`font-sans`) |
| weights           | 300, 400, 500, 600, 700, 800                               |
| size.xs           | `0.75rem` (12px)                                           |
| size.sm           | `0.875rem` (14px)                                          |
| size.base         | `1rem` (16px)                                              |
| size.lg           | `1.125rem` (18px)                                          |
| size.xl           | `1.25rem` (20px)                                           |
| size.2xl          | `1.5rem` (24px)                                            |
| tracking.tightest | `-0.03em` (`tracking-tightest`)                            |
| tracking.tight    | `-0.02em` (`tracking-tight`) — headings                    |
| tracking.label    | `0.10em` (`tracking-label`) — uppercase micro-labels       |

## Spacing

`xs 4px · sm 8px · md 16px · lg 24px · xl 32px` → `spacing` in `tokens.ts`.

## Radius

| Token   | Value             | Tailwind          |
| ------- | ----------------- | ----------------- |
| control | `0.625rem` (10px) | `rounded-control` |
| card    | `1rem` (16px)     | `rounded-card`    |
| pill    | `9999px`          | `rounded-pill`    |

## Shadows

| Token    | Value                                                                  | Tailwind          |
| -------- | ---------------------------------------------------------------------- | ----------------- |
| card     | `0 1px 2px rgb(11 18 32 / 0.04), 0 6px 20px -6px rgb(11 18 32 / 0.08)` | `shadow-card`     |
| elevated | `0 16px 48px -12px rgb(11 18 32 / 0.18)`                               | `shadow-elevated` |
| focus    | `0 0 0 3px rgb(20 33 61 / 0.12)`                                       | `shadow-focus`    |
