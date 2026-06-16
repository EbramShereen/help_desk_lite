import type { QueryConstraint } from 'firebase/firestore';

/** A plain document with its id, decoupled from Firestore snapshot types. */
export interface DocData {
  id: string;
  [key: string]: unknown;
}

/** Abstraction over Firestore CRUD — the only gateway to the database. */
export interface FirestoreHandler {
  getById(collectionPath: string, id: string): Promise<DocData | null>;
  getCollection(collectionPath: string, constraints?: QueryConstraint[]): Promise<DocData[]>;
  add(collectionPath: string, data: Record<string, unknown>): Promise<string>;
  set(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void>;
  update(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void>;
  remove(collectionPath: string, id: string): Promise<void>;
}
