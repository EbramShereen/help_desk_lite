---
name: helpdesk-uiux
description: Build HelpDesk Lite UI — views and shared themed widgets using Tailwind theme tokens, the core widget library, responsive helpers, and AppError-aware states. Use for ui/ux-epic tickets and any view/widget/styling work.
---

# HelpDesk Lite — UI / UX Layer

Views compose widgets; widgets are props-driven and reusable. One component per
file. Zero business logic — get data/handlers from a `useXxxController` hook.

## Styling rules (non-negotiable)

- Tailwind theme classes only. Palette (from `tailwind.config.js`):
  - `primary` (+ `-hover`, `-subtle`, `-foreground`), `surface` (+ `-muted`, `-border`),
    `content` (+ `-muted`, `-subtle`), `danger`/`success`/`warning`/`info` (+ `-subtle`, `-foreground`).
  - Radius: `rounded-control` (inputs/buttons), `rounded-card`. Shadow: `shadow-card`.
  - Font: `font-sans` (Inter). Weights: `font-medium`/`font-semibold`/`font-bold`.
- NEVER hardcode hex, px radius, or arbitrary colors. Need a new token? Extend
  `tailwind.config.js` AND `src/core/theme/tokens.ts` together — never inline it.
- Compose conditional classes with `cn()` from `src/lib/cn.ts`.
- Pull JS-side values (charts/inline style) from `useTheme()` / `tokens.ts`, not literals.

## Reuse the core widget library (`src/core/widgets/`)

`AppButton` (variant primary|secondary|danger|ghost, size, isLoading, fullWidth),
`AppTextField`, `AppDropdown`, `AppCard`, `AppBadge`. Import from `../../../core/widgets`.
If a ticket needs a generic element not present, add it to `src/core/widgets/`
(props-driven, theme-based) — NOT a one-off in the feature. Feature-specific
composites (e.g. `TicketCard`) live in `features/<feature>/ui/widgets/`.

### Widget pattern (match AppButton)

- `forwardRef` when it wraps a native element; extend the native props interface.
- Variant/size maps as `Record<Variant, string>`; merge with `cn(base, variants[v], className)`.
- Always pass through `className` last so callers can extend.
- Always include focus-visible ring + disabled styles for interactive widgets.

```tsx
import { cn } from '../../../lib/cn';
import { AppCard, AppBadge } from '../../../core/widgets';
import type { Ticket } from '../../../../core/data/models/response/tickets/ticket_response';

export function TicketCard({ ticket, onOpen }: { ticket: Ticket; onOpen: (id: string) => void }) {
  return (
    <AppCard className="flex items-center justify-between gap-4">
      <button onClick={() => onOpen(ticket.id)} className="text-left">
        <p className="font-semibold text-content">{ticket.title}</p>
        <p className="text-sm text-content-muted">#{ticket.id}</p>
      </button>
      <AppBadge>{ticket.status}</AppBadge>
    </AppCard>
  );
}
```

## Views — `src/features/<feature>/ui/views/<Name>View.tsx`

- Default export. Call the controller hook; render loading / error / empty / data states.
- Error state: branch on `error.kind` (`AppError`) — e.g. `auth` -> redirect prompt,
  `network` -> retry, else inline message. Never print raw error objects.
- Empty state: friendly message + primary action, not a blank screen.
- Compose widgets; no inline Firebase/logic.

```tsx
import { useTicketController } from '../../logic/useTicketController';
import { TicketCard } from '../widgets/TicketCard';
import { AppButton } from '../../../core/widgets';

export default function TicketsView() {
  const { tickets, isLoading, error } = useTicketController();
  if (isLoading) return <p className="text-content-muted">Loading…</p>;
  if (error) return <p className="text-danger">Couldn’t load tickets.</p>;
  if (tickets.length === 0)
    return (
      <div className="text-center">
        <p className="text-content-muted">No tickets yet.</p>
        <AppButton className="mt-4">New ticket</AppButton>
      </div>
    );
  return (
    <div className="flex flex-col gap-3">
      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} onOpen={() => {}} />
      ))}
    </div>
  );
}
```

## Responsive

Use `src/core/responsive/` — `useBreakpoint()` / `useIsAbove()` for logic,
`<Show above="md">` for conditional render, and Tailwind responsive prefixes
(`md:`, `lg:`) for layout. Mobile-first.

## Accessibility

Label inputs, keyboard-focusable interactive elements, visible focus ring (already
in the widgets), meaningful alt text. Don't convey state by color alone — pair with text/icon.

## Done check

`npm run build && npm run lint && npm run test`. Add a `@testing-library/react`
test for new shared widgets (mirror `AppButton.test.tsx`).
