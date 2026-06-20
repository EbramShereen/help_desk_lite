---
name: helpdesk-feature
description: Index/dispatcher for building a HelpDesk Lite feature from a Jira ticket. Use FIRST whenever a ticket arrives for any epic (ui/ux, backend, frontend) to pick the right layer skill and respect the build order.
---

# HelpDesk Lite — Feature Dispatcher

Start here for ANY feature ticket. This skill routes you to the correct layer
skill and enforces the vertical build order. Read `.claude/CLAUDE.md` rules — they
are binding.

## Vertical build order (never skip, never reorder)

```
enums -> models (response/request) -> datasource (core) -> repo (interface + impl in one repo/)
  -> injector (register token) -> logic (useXxxController) -> ui (views + widgets)
```

## Route the ticket by epic label

| Epic label   | Layers touched                                                                                             | Load skill          |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| **backend**  | enums, models (response/request), datasource ext, repo (interface + impl), DI token, new Firebase handlers | `helpdesk-backend`  |
| **frontend** | logic hooks (`useXxxController`), routing, page wiring, store slices                                       | `helpdesk-frontend` |
| **ui/ux**    | views, shared widgets, theme tokens, responsive                                                            | `helpdesk-uiux`     |

A full vertical feature usually spans all three — build backend -> frontend -> ui/ux.

## Per-ticket procedure

1. Restate the ticket's goal + acceptance criteria in one line.
2. Identify which layers it touches; load the matching layer skill(s).
3. Build layer by layer in the order above. Each layer depends only on the
   abstraction below it (repo depends on `AppDataSource`, hook depends on repo
   interface via `useInjected`, UI depends on the hook).
4. Keep each abstraction swappable (interface + impl pair, registered by token).
5. **Definition of done:** `npm run build` && `npm run lint` && `npm run test`
   all pass, and the layer flow is intact. Run them before declaring done.

## Existing core foundation (already built — reuse, don't recreate)

- DI: `src/core/di/{tokens.ts,injector.ts,DependencyProvider.tsx}` — `useInjected(TOKENS.X)`.
- Datasource: `src/core/data/datasource/AppDataSource` (the ONLY Firebase gateway).
- Handlers: `src/core/data/firebase/{AuthHandler,FirestoreHandler}` (+ Impls).
- Errors: `src/core/errors/{AppError,FirebaseErrorMapper}`.
- Theme: `src/core/theme/{tokens.ts,AppThemeProvider.tsx}` + `tailwind.config.js`.
- Widgets: `src/core/widgets/` (AppButton, AppTextField, AppDropdown, AppCard, AppBadge).
- Responsive: `src/core/responsive/` (useBreakpoint, Show).
- Helpers: `src/lib/cn.ts` (Tailwind class merge), `src/lib/queryClient.ts`.

## Anti-patterns (reject on sight)

- Per-feature Firebase calls or per-feature datasources.
- Business logic in components.
- Raw Firebase errors reaching the UI.
- Hardcoded hex/spacing/radius in className.
- `@injectable` decorators (breaks Vite build).
