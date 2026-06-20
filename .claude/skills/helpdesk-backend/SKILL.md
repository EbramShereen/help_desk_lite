---
name: helpdesk-backend
description: Build the data/domain layers of a HelpDesk Lite feature — enums, models (+zod, response/request split), repo interface + impl over AppDataSource, DI token registration, and new Firebase handlers. Use for backend-epic tickets.
---

# HelpDesk Lite — Backend Layer

Builds everything from the model down to the datasource. UI/logic never call
Firebase directly — they go through the repo, which goes through `AppDataSource`.

## Order

`enums (core/enums) -> models (core/data/models response+request) -> (extend AppDataSource if a new op is needed) -> repo interface + impl (one repo/ folder) -> register DI token`

## 1a. Enums — `src/core/enums/<feature>/<enum_name>.ts` (ONE per file)

Extract any domain enum/union first. snake_case file, single `as const` array +
derived type (or single string-union). Example `core/enums/tickets/ticket_status.ts`:

```ts
export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
```

## 1b. Models — split by direction under `src/core/data/models`

- Response: `response/<feature>/<entity>_response.ts` — domain `interface` +
  `fromDoc(doc: DocData): Entity` + parse/label helpers.
- Request: `request/<feature>/<entity>_request.ts` — `zod` schema + `z.infer` input
  type + `toDoc(input): Record<string, unknown>`.
- Never leak Firestore types upward; map from/to `DocData`
  (`src/core/data/firebase/FirestoreHandler.ts`). Import enum types from `core/enums`.

```ts
// core/data/models/response/tickets/ticket_response.ts
import type { DocData } from '../../../firebase/FirestoreHandler';
import type { TicketStatus } from '../../../../enums/tickets/ticket_status';

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  createdAt: number;
}

export function ticketFromDoc(doc: DocData): Ticket {
  return {
    id: doc.id,
    title: String(doc.title ?? ''),
    status: (doc.status as TicketStatus) ?? 'open',
    createdAt: Number(doc.createdAt ?? 0),
  };
}
```

```ts
// core/data/models/request/tickets/ticket_request.ts
import { z } from 'zod';
import { TICKET_STATUSES } from '../../../../enums/tickets/ticket_status';

export const ticketInputSchema = z.object({
  title: z.string().min(3),
  status: z.enum(TICKET_STATUSES).default('open'),
});
export type TicketInput = z.infer<typeof ticketInputSchema>;

export function ticketToDoc(input: TicketInput): Record<string, unknown> {
  return { ...input, createdAt: Date.now() };
}
```

## 2. Extend AppDataSource ONLY if a generic op is missing

`AppDataSource` already exposes generic CRUD (`getDocument`, `getCollection`,
`addDocument`, `setDocument`, `updateDocument`, `deleteDocument`) + auth. Reuse
them with a `collectionPath`. Add a method only for a genuinely new capability,
and add it to BOTH `AppDataSource.ts` and `AppDataSourceImpl.ts` (delegating to a
handler). For a brand-new Firebase service (e.g. Storage), add a new handler pair
in `src/core/data/firebase/` (interface + impl) wired through the datasource — never
call the SDK from a feature.

## 3. Repo interface — `src/features/<feature>/repo/<Entity>Repo.ts`

Domain-shaped API the logic layer consumes. Returns domain models, not DocData.

```ts
import type { Ticket } from '../../../core/data/models/response/tickets/ticket_response';
import type { TicketInput } from '../../../core/data/models/request/tickets/ticket_request';

export interface TicketRepo {
  list(): Promise<Ticket[]>;
  getById(id: string): Promise<Ticket | null>;
  create(input: TicketInput): Promise<Ticket>;
  update(id: string, patch: Partial<TicketInput>): Promise<void>;
  remove(id: string): Promise<void>;
}
```

## 4. Repo impl — `src/features/<feature>/repo/<Entity>RepoImpl.ts` (same folder as the interface)

Constructor takes `AppDataSource`. Maps DocData<->domain via the model mappers.
Errors are already normalized to `AppError` inside the datasource/handlers — do
NOT catch-and-swallow; let `AppError` propagate to React Query.

```ts
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { TicketRepo } from './TicketRepo';
import {
  ticketFromDoc,
  type Ticket,
} from '../../../core/data/models/response/tickets/ticket_response';
import {
  ticketToDoc,
  type TicketInput,
} from '../../../core/data/models/request/tickets/ticket_request';

const PATH = 'tickets';

export class TicketRepoImpl implements TicketRepo {
  constructor(private readonly ds: AppDataSource) {}

  async list(): Promise<Ticket[]> {
    return (await this.ds.getCollection(PATH)).map(ticketFromDoc);
  }
  async getById(id: string): Promise<Ticket | null> {
    const doc = await this.ds.getDocument(PATH, id);
    return doc ? ticketFromDoc(doc) : null;
  }
  async create(input: TicketInput): Promise<Ticket> {
    const data = ticketToDoc(input);
    const id = await this.ds.addDocument(PATH, data);
    return ticketFromDoc({ id, ...data });
  }
  update(id: string, patch: Partial<TicketInput>): Promise<void> {
    return this.ds.updateDocument(PATH, id, patch);
  }
  remove(id: string): Promise<void> {
    return this.ds.deleteDocument(PATH, id);
  }
}
```

## 5. Register the DI token

- Add to `TOKENS` in `src/core/di/tokens.ts`:
  `Ticket: 'TicketRepo' as InjectionToken<TicketRepo>` (import the interface type).
- Register in `src/core/di/injector.ts` inside `configureInjector()`:
  `container.register(TOKENS.Ticket, { useFactory: (c) => new TicketRepoImpl(c.resolve(TOKENS.AppDataSource)) });`

## Done check

`npm run build && npm run lint && npm run test`. Add a unit test for the repo
impl with a fake `AppDataSource` (mirror `AppDataSourceImpl.test.ts`).
