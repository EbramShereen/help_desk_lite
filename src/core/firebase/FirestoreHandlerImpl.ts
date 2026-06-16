import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import type { DocData, FirestoreHandler } from './FirestoreHandler';
import { FirebaseErrorMapper } from '../errors/FirebaseErrorMapper';

/** Firestore-backed handler. Normalizes snapshots to DocData and errors to AppError. */
export class FirestoreHandlerImpl implements FirestoreHandler {
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getById(collectionPath: string, id: string): Promise<DocData | null> {
    try {
      const snap = await getDoc(doc(this.db, collectionPath, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async getCollection(
    collectionPath: string,
    constraints: QueryConstraint[] = [],
  ): Promise<DocData[]> {
    try {
      const q = query(collection(this.db, collectionPath), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async add(collectionPath: string, data: Record<string, unknown>): Promise<string> {
    try {
      const ref = await addDoc(collection(this.db, collectionPath), data);
      return ref.id;
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async set(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void> {
    try {
      await setDoc(doc(this.db, collectionPath, id), data);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async update(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void> {
    try {
      await updateDoc(doc(this.db, collectionPath, id), data);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async remove(collectionPath: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, collectionPath, id));
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }
}
