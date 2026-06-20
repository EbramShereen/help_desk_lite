# HelpDesk Lite — Architecture Rules (do not violate)

HelpDesk Lite is a lightweight internal support ticketing web app. These rules
keep the codebase consistent. Claude MUST follow them for every change.

## Stack

- React 19 + TypeScript + Vite.
- **Server state:** TanStack React Query. **UI state:** Redux Toolkit / local `useState`.
- **DI:** tsyringe, token-based `useFactory` registration (NO `@injectable` decorators —
  Vite/esbuild has no `emitDecoratorMetadata`). Tokens live in `src/core/di/tokens.ts`.
- **Backend:** Firebase JS SDK (Auth + Firestore). No axios / REST.
- **Styling:** Tailwind only; colors/spacing/radius come from theme tokens, never hardcoded hex.
- **Forms:** react-hook-form + zod via `@hookform/resolvers`.

## Folder structure (Feature-Sliced Design)

- `src/core/` — shared foundation: `theme/ widgets/ responsive/ errors/ di/ enums/ data/`.
  - `src/core/data/` — the data layer: `datasource/` (single `AppDataSource`),
    `firebase/` (Auth/Firestore handlers + config), and `models/`.
  - `src/core/data/models/{response,request}/<feature>/` — models are split by
    direction. `response/` holds the read shape (`interface` + `fromDoc` mapper +
    parse helpers + display-label maps). `request/` holds the write shape (zod
    input/update schemas + `toDoc` mapper). File names are snake_case, e.g.
    `response/tickets/ticket_response.ts`, `request/tickets/ticket_request.ts`.
  - `src/core/enums/<feature>/` — all domain enums/unions, ONE per file
    (`tickets/ticket_status.ts`, `auth/role.ts`, `admin/permission.ts`, …). Infra
    enums stay put (DI `TOKENS`, theme tokens, breakpoints, slice UI-state unions).
- `src/features/<feature>/` — per feature: `repo/ logic/ ui/{views,widgets}`.
  `repo/` holds BOTH the interface (`FooRepo.ts`) and impl (`FooRepoImpl.ts`).
  Features no longer carry their own `models/` — models live in `core/data/models`.
- `src/app/ src/lib/ src/routes/` — store, helpers, routing.

## Feature flow (build in this exact order)

`enums (core/enums) → models (core/data/models/{response,request}) → datasource
 (core/data, shared) → repo (interface + impl in one repo/ folder) → injector
 (register token) → logic (custom hook with React Query) → ui (views + widgets)`

## Hard rules

1. **Abstract + impl pair** for every service/datasource/repo: an interface
   (`Foo.ts`) and an implementation (`FooImpl.ts`). Depend on the interface.
2. **Single core datasource.** All Firebase send/receive goes through
   `src/core/data/datasource/AppDataSource`. NO per-feature datasources. Features call
   the datasource (via their repo), never Firebase SDK or handlers directly.
3. **Firebase only behind handlers** (`AuthHandler`, `FirestoreHandler`). Add a new
   handler (interface + impl) for any new Firebase service.
4. **Errors:** never surface raw Firebase errors. Map via `FirebaseErrorMapper`
   to `AppError` inside handlers/datasource.
5. **Logic layer = custom hook** (`useXxxController`) wrapping React Query. ALL logic
   lives here; UI components contain no business logic.
6. **UI:** one component per file. Extract duplicated/similar UI into ONE
   customizable shared widget (props-driven). Views compose widgets.
7. **Theme inheritance:** use `useTheme()` / Tailwind theme classes. Never hardcode
   colors, font, radius — extend `tailwind.config.js` + `src/core/theme/tokens.ts`.
8. **DI:** register impls against tokens in `src/core/di/injector.ts`; resolve with
   `useInjected(TOKENS.X)` in hooks. Keep abstractions swappable for tests.
9. **SOLID** on every class (esp. Dependency Inversion via tokens).
10. **No secrets in code.** Firebase config via `import.meta.env.VITE_*` (`.env.local`).

## Naming conventions (match the existing core layer)

- Interfaces: `Foo.ts` exporting `interface Foo`. Impl: `FooImpl.ts` exporting
  `class FooImpl implements Foo`. Depend on `Foo`, register `FooImpl`.
- Models: split per direction under `core/data/models`. Response file
  `response/<feature>/<entity>_response.ts` (interface + `fromDoc` + parse/label
  helpers); request file `request/<feature>/<entity>_request.ts` (zod schemas +
  `toDoc`). snake_case file names.
- Enums: one per file under `core/enums/<feature>/<enum_name>.ts` (snake_case),
  each holding a single `as const` array + derived type, or a single string-union.
- Repo: interface `TicketRepo.ts` and impl `TicketRepoImpl.ts` live together in the
  feature's `repo/` folder; impl constructor takes `AppDataSource`. Logic hook:
  `useTicketController.ts` returning typed query/mutations.
- UI: views in `ui/views/TicketsView.tsx`, widgets in `ui/widgets/TicketCard.tsx`.
  One component per file, default-export views, named-export widgets.
- DI tokens: add `Ticket: 'TicketRepo' as InjectionToken<TicketRepo>` to `TOKENS`.
- Styling: Tailwind theme classes only (`bg-primary`, `text-content-muted`,
  `rounded-card`, `shadow-card`). Compose classes with `cn()` from `src/lib/cn.ts`.
  Reach for `tokens.ts` values only when a raw value is needed in TS (charts).

## Skills (load before working a ticket — do NOT pre-read)

Project skills live in `.claude/skills/`. Invoke via the Skill tool by name:

- `helpdesk-feature` — index/dispatcher: the full vertical build order + which
  skill to load for a given epic/ticket. Start here for any feature ticket.
- `helpdesk-backend` — models -> datasource ext -> repo -> repo_impl -> DI token
  (and new Firebase handlers). For **backend** epic tickets.
- `helpdesk-frontend` — `useXxxController` React Query logic hooks + routing/wiring.
  For **frontend** epic tickets.
- `helpdesk-uiux` — views + shared themed widgets using theme tokens. For
  **ui/ux** epic tickets.

## Definition of done for a feature

Build passes (`npm run build`), lint clean (`npm run lint`), tests pass
(`npm run test`), and the layer flow above is respected end to end.
