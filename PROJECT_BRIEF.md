# HelpDesk Lite — Project Brief

### Built with Claude Code | Jun 12–18, 2026 | 7 Days | 37 Sessions | 157 Exchanges

---

## What Is It?

HelpDesk Lite is a **lightweight internal support ticketing web app** — inspired by Jira and Frappe Helpdesk. Built from scratch using Claude Code as an AI pair programmer across 37 conversation sessions over 7 days.

**The problem it solves:** Internal support requests arriving via scattered channels (email, chat, informal messages) — causing delays, duplicates, unclear ownership, and weak manager visibility.

---

## The Journey (Session by Session)

| Date   | What Happened                                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Jun 12 | Saved BRD to memory. Decided architecture together (React vs Flutter mental model).                                                                                                                                            |
| Jun 12 | Defined 4 Jira epics: UI/UX, Backend, Frontend, QA.                                                                                                                                                                            |
| Jun 12 | Architecture Q&A — chose: React Query, Redux Toolkit, tsyringe DI, Firebase, Tailwind, react-hook-form+zod, Feature-Sliced Design.                                                                                             |
| Jun 13 | Created project skills (helpdesk-feature, helpdesk-backend, helpdesk-frontend, helpdesk-uiux).                                                                                                                                 |
| Jun 13 | Started implementation — auth module (login, signup, pending approval, admin users).                                                                                                                                           |
| Jun 13 | Fixed: show "pending approval" view instead of "no access" error after signup.                                                                                                                                                 |
| Jun 13 | Removed signup module, added signout button.                                                                                                                                                                                   |
| Jun 13 | Built full tickets module (~60 SCRUM tickets: backend + frontend + UI/UX).                                                                                                                                                     |
| Jun 13 | Extended with Teams, Epics, Sprints + manager→team_leader→member hierarchy.                                                                                                                                                    |
| Jun 13 | Refined admin: admin creates emails + assigns roles, manager manages team, team leader creates tickets.                                                                                                                        |
| Jun 14 | Fixed: admin-created accounts flow + auth for admin-created emails.                                                                                                                                                            |
| Jun 14 | Rewrote Firestore security rules with role-based read/write permissions.                                                                                                                                                       |
| Jun 14 | Extended Epics: each epic links to many tickets and many teams.                                                                                                                                                                |
| Jun 14 | Debugged: tickets not loading — fixed query/permissions.                                                                                                                                                                       |
| Jun 14 | **Major re-plan:** redesign for Jira-style agile board — dynamic permissions, custom roles, DnD kanban, rich-text tickets, threaded comments, reactions, subtasks, Backlog, Board, Timeline, Summary, i18n (en/ar), dark mode. |
| Jun 14 | Deleted old rigid roles (member/team_leader/manager) — replaced with custom permission-based roles.                                                                                                                            |
| Jun 14 | Added delete user button for admin.                                                                                                                                                                                            |
| Jun 14 | Fixed: team leader dropdown shows only members.                                                                                                                                                                                |
| Jun 14 | Added subtask permissions to permission catalogue.                                                                                                                                                                             |
| Jun 14 | Built AdminRoleDetailView — click role → view/edit permissions.                                                                                                                                                                |
| Jun 14 | Added "own team" permission category (manage own team summary, tickets, sprints).                                                                                                                                              |
| Jun 14 | Fixed: role assignment modal showing only "pending".                                                                                                                                                                           |
| Jun 14 | **Key insight:** all permissions stored locally in code, linked to UI sections/actions.                                                                                                                                        |
| Jun 14 | Permission-driven access control — full end-to-end (4 phases). Fixed "only Profile tab shows" root cause: two mismatched auth systems.                                                                                         |
| Jun 14 | Added team scope permissions (view all teams vs own team only).                                                                                                                                                                |
| Jun 14 | Redesigned Firestore architecture — user doc as hub with teamIds, assignedTicketIds, assignedSprintIds.                                                                                                                        |
| Jun 14 | **SaaS transformation** — landing page, anyone can sign up and become admin of their own workspace.                                                                                                                            |
| Jun 14 | Fixed: admin can create emails (permissions rule bug).                                                                                                                                                                         |
| Jun 15 | Fixed: backlog loading error.                                                                                                                                                                                                  |
| Jun 18 | Documentation session — extracted conversation history into FULL_HISTORY.md.                                                                                                                                                   |

---

## Tech Stack

| Layer        | Choice                            | Why                                     |
| ------------ | --------------------------------- | --------------------------------------- |
| Framework    | React 19 + TypeScript + Vite      | Production standard, fast builds        |
| Server state | TanStack React Query              | Caching, background sync, mutations     |
| UI state     | Redux Toolkit + useState          | Predictable, familiar from Flutter BLoC |
| DI           | tsyringe (token-based useFactory) | No decorators needed — works with Vite  |
| Backend      | Firebase (Auth + Firestore)       | No server, real-time, fast to ship      |
| Styling      | Tailwind CSS + design tokens      | Theme-first, no hardcoded hex           |
| Forms        | react-hook-form + zod             | Type-safe validation                    |
| DnD          | @dnd-kit                          | Accessible, composable                  |
| Rich text    | Tiptap                            | Headless, extensible                    |
| i18n         | react-i18next                     | en/ar + RTL support                     |
| Structure    | Feature-Sliced Design             | Scalable, clean layer separation        |

---

## Architecture Rules (Locked Before Any Feature)

10 steps built in order before touching features:

1. App theme (tokens → tailwind → AppThemeProvider)
2. Common widgets (AppButton, AppTextField, AppDropdown…)
3. Responsive layer (useBreakpoint, Show)
4. Error layer (AppError, FirebaseErrorMapper)
5. Firebase handlers (AuthHandler, FirestoreHandler — interface + impl)
6. Single core datasource (AppDataSource — only file that touches Firebase)
7. DI injector (tsyringe tokens + container)
8. SOLID + design patterns on every class
9. Abstract + impl pair rule enforced
10. Rules file written (.claude/CLAUDE.md)

**Per-feature flow (never broken):**
`models → datasource → repo (interface) → repo_impl → injector → logic hook → ui`

---

## Features Built

- **Auth:** signup, login, forgot/reset password, pending approval, profile
- **Admin:** create user accounts, assign custom roles, manage workflow statuses & labels
- **Custom Roles:** permission catalogue (138 permissions, 22 categories), role builder UI
- **Tickets:** create, list, board (kanban), detail, rich-text description, sub-tickets, activity/comments/replies/reactions, priority, labels, epic/sprint links, scoped filtering
- **Teams:** create team, assign team leader + members, team progress view
- **Epics:** group tickets + teams into epics, epic detail, timeline (Gantt-style)
- **Sprints:** create sprint, backlog drag-and-drop ↔ sprint, sprint board (kanban DnD)
- **Summary:** team stats, completion rates, story-point rollups
- **Permissions:** full scoped enforcement — UI gating + Firestore rules (per user, per entity, per scope)
- **Landing page:** public marketing page with hero, features, how-it-works, stats
- **Dark mode + i18n:** en/ar RTL toggle, theme toggle

---

## Design System

- **Palette:** Deep Navy `#14213D` (primary) + Champagne Gold `#C9A86A` (accent)
- **Typography:** Plus Jakarta Sans (headings 600–700 tracking-tight, body 400–500, micro-labels uppercase tracking-wide)
- **Tokens:** `bg-primary`, `text-content-muted`, `rounded-card`, `shadow-card`, `shadow-elevated`
- **Aesthetic:** Minimal luxury — restrained, premium, no neon

---

## Numbers

| Metric                      | Count |
| --------------------------- | ----- |
| Days to build               | 7     |
| Claude sessions             | 37    |
| Exchanges (prompt→response) | 157   |
| Source files                | ~130  |
| Features                    | 10+   |
| Permissions in catalogue    | 138   |
| Permission categories       | 22    |
| Unit + rules tests          | 34+   |
