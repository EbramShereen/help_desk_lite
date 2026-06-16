import type { QueryConstraint } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { DocData } from '../firebase/FirestoreHandler';
import type { AuthCredentials } from '../firebase/AuthHandler';

/**
 * THE single gateway between the app and Firebase. Every feature repo talks to
 * this interface — never to Firebase or the handlers directly. There are NO
 * per-feature datasources; this is the one core datasource for the whole app.
 */
export interface AppDataSource {
  // Auth
  signIn(credentials: AuthCredentials): Promise<User>;
  signUp(credentials: AuthCredentials): Promise<User>;
  createUserWithoutSignIn(credentials: AuthCredentials): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): User | null;
  onAuthStateChanged(listener: (user: User | null) => void): () => void;
  sendPasswordReset(email: string): Promise<void>;
  verifyResetCode(oobCode: string): Promise<string>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;

  // Firestore
  getDocument(collectionPath: string, id: string): Promise<DocData | null>;
  getCollection(collectionPath: string, constraints?: QueryConstraint[]): Promise<DocData[]>;
  addDocument(collectionPath: string, data: Record<string, unknown>): Promise<string>;
  setDocument(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void>;
  updateDocument(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void>;
  deleteDocument(collectionPath: string, id: string): Promise<void>;
}
