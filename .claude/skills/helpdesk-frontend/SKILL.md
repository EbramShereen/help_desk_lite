---
name: helpdesk-frontend
description: Build the logic layer of a HelpDesk Lite feature — useXxxController custom hooks wrapping React Query over a repo resolved via DI, plus routing, page wiring, and Redux UI-state slices. Use for frontend-epic tickets.
---

# HelpDesk Lite — Frontend / Logic Layer

ALL business logic lives in `useXxxController` hooks. Components are dumb. The
hook resolves the repo by token (`useInjected`) and exposes typed React Query
state + mutations. UI state (modals, filters) is local `useState` or a Redux slice.

## 1. Controller hook — `src/features/<feature>/logic/use<Entity>Controller.ts`

- Resolve the repo via `useInjected(TOKENS.X)` — depend on the interface, never new it up.
- Wrap reads in `useQuery`, writes in `useMutation`; invalidate query keys on success.
- Stable query keys: `['tickets']`, `['tickets', id]`.
- Return a typed object. No JSX. Errors stay as `AppError` (already mapped) so the
  UI can branch on `error.kind`.

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import type { TicketInput } from '../models/Ticket';

export function useTicketController() {
  const repo = useInjected(TOKENS.Ticket);
  const qc = useQueryClient();

  const ticketsQuery = useQuery({ queryKey: ['tickets'], queryFn: () => repo.list() });

  const createTicket = useMutation({
    mutationFn: (input: TicketInput) => repo.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const removeTicket = useMutation({
    mutationFn: (id: string) => repo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });

  return {
    tickets: ticketsQuery.data ?? [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    createTicket,
    removeTicket,
  };
}
```

Add `TOKENS.Ticket` to `tokens.ts` first (backend skill) so the type resolves.

## 2. Forms

Use react-hook-form + the model's zod schema via `zodResolver(ticketInputSchema)`.
The form's `onSubmit` calls a controller mutation. Keep validation in the schema,
not scattered in the component.

## 3. Routing & wiring — `src/routes/AppRoutes.tsx`

- Add lazy routes for the feature's views. Keep routes declarative; guards/redirects
  driven by auth state from a controller (e.g. `useAuthController`).
- Pages in `src/pages/` compose feature views; views come from `features/.../ui/views`.

## 4. UI state (Redux) — only when shared across components

Add a slice under `src/features/<feature>/<feature>Slice.ts` (mirror `counterSlice.ts`),
register it in `src/app/store.ts`, access via typed hooks in `src/app/hooks.ts`.
Server data is React Query's job — do NOT mirror it into Redux.

## Providers already mounted

`DependencyProvider`, `QueryClientProvider` (`src/lib/queryClient.ts`),
`AppThemeProvider`, Redux `Provider` wrap the app. Hooks can assume they exist.

## Done check

`npm run build && npm run lint && npm run test`. Test hooks with a custom
container (pass a fake repo) via `DependencyProvider` + React Query wrapper.
