# Component Specs

Per-widget reference for the core widget library (`src/core/widgets/`) and the
auth shell. All widgets are **presentation-only** (props in, no business logic)
and consume semantic Tailwind tokens — never hardcoded values.

---

## AppButton

`src/core/widgets/AppButton.tsx`

- **Variants:** `primary` (navy, default) · `accent` (champagne gold) · `secondary`
  (outline) · `danger` (muted red) · `ghost` (transparent).
- **Sizes:** `sm` (h-9) · `md` (h-11, default) · `lg` (h-12).
- **Props:** `isLoading` (shows spinner, disables) · `fullWidth` · all native button attrs.
- **Type:** `font-semibold tracking-tight`.
- **States:** hover shifts background only; `focus-visible:shadow-focus`; disabled
  `opacity-60 cursor-not-allowed`. Transition 200ms on background/shadow/color/opacity.
- **Usage:** primary CTA = navy `primary`. Reserve `accent` (gold) for rare hero
  moments; for everyday links prefer a gold text-link, not a gold button.

## AppTextField

`src/core/widgets/AppTextField.tsx`

- **Props:** `label` · `error` · `hint` · `leading` · `trailing` · native input attrs.
  Forwards `ref` → plugs into react-hook-form `register`.
- **Label:** uppercase micro-label (`text-xs font-semibold uppercase tracking-label
text-content-muted`).
- **Field:** `h-11 rounded-control border-surface-border`. Focus →
  `border-primary` + `shadow-focus`. Error → `border-danger`, message in `text-danger`.

## AppDropdown

`src/core/widgets/AppDropdown.tsx`

- Native `<select>` styled to match AppTextField (height, radius, label, focus).
- **Props:** `label` · `error` · `placeholder` · `options: {label,value,disabled}[]` · ref.

## AppCard

`src/core/widgets/AppCard.tsx`

- `rounded-card border-surface-border bg-surface p-6 shadow-card`.
- Static surface (no hover lift). Pass `className` to extend.

## AppBadge

`src/core/widgets/AppBadge.tsx`

- **Tones:** `neutral` · `primary` · `accent` (gold) · `success` · `warning` · `danger` · `info`.
- `rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-tight`, tinted
  `-subtle` background + matching text.

---

## Auth shell

### AuthLayout — `src/features/auth/ui/widgets/AuthLayout.tsx`

Split-screen. Desktop (`lg:`): navy brand panel (gold rule + wordmark + tagline,
subtle navy gradient) beside a white form panel (`max-w-md`, centered). Mobile:
single centered column on `bg-canvas` with a gold-underlined wordmark above the form.

### View pattern (Login / ForgotPassword / ResetPassword)

Header block: gold uppercase eyebrow (`text-accent-hover`) → `text-2xl font-bold
tracking-tight` title → muted helper line. Form fields at `gap-5`. Errors render in
a `bg-danger-subtle` rounded notice, not bare red text. Secondary links are gold
text-links (`text-accent hover:text-accent-hover`).

### RoleBadge — `src/features/auth/ui/widgets/RoleBadge.tsx`

Maps role → AppBadge tone: `member→neutral`, `team_leader→info`, `manager→warning`,
`admin→accent` (gold = premium).

### RoleAssignmentModal — `src/features/auth/ui/widgets/RoleAssignmentModal.tsx`

Backdrop `bg-primary/30 backdrop-blur-sm`; panel `rounded-card shadow-elevated`.
Confirm = navy primary; Cancel = ghost.

### AdminUsersView table

Header row = uppercase micro-labels (`tracking-label text-content-subtle`); rows
`py-4` with hairline dividers and `hover:bg-surface-muted`; role shown via RoleBadge.
