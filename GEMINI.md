# HelpDesk Lite — Architecture Rules (do not violate)

HelpDesk Lite is a lightweight internal support ticketing web app. These rules keep the codebase consistent.

## Stack

- React 19 + TypeScript + Vite.
- **Server state:** TanStack React Query. **UI state:** Redux Toolkit / local `useState`.
- **DI:** tsyringe, token-based `useFactory` registration (NO `@injectable` decorators). Tokens live in `src/core/di/tokens.ts`.
- **Backend:** Firebase JS SDK (Auth + Firestore). No axios / REST.
- **Styling:** Tailwind only; colors/spacing/radius come from theme tokens, never hardcoded hex.
- **Forms:** react-hook-form + zod via `@hookform/resolvers`.

## Folder structure (Feature-Sliced Design)

- `src/core/` — shared foundation.
- `src/features/<feature>/` — per feature.
- `src/app/`, `src/lib/`, `src/routes/` — store, helpers, routing.

## Feature flow

`models → datasource → repo (interface) → repo_impl → injector (register token) → logic (custom hook) → ui (views + widgets)`

## Key Architecture Rules

1.  **Abstract + impl pair:** Interface (`Foo.ts`) and implementation (`FooImpl.ts`). Depend on the interface.
2.  **Single core datasource:** All Firebase calls go through `src/core/datasource/AppDataSource`.
3.  **Handlers:** Use `src/core/firebase/` handlers (interface + impl).
4.  **Logic:** Custom hook `useXxxController` wrapping React Query.
5.  **UI:** One component per file, props-driven, theme-based.
6.  **DI:** Register impls in `src/core/di/injector.ts`; resolve with `useInjected(TOKENS.X)`.
