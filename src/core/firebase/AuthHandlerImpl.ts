import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  verifyPasswordResetCode,
  setPersistence,
  inMemoryPersistence,
  type Auth,
  type User,
} from 'firebase/auth';
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import type { AuthHandler, AuthCredentials } from './AuthHandler';
import { FirebaseErrorMapper } from '../errors/FirebaseErrorMapper';

/** Firebase-backed AuthHandler. All errors normalized to AppError. */
export class AuthHandlerImpl implements AuthHandler {
  private readonly auth: Auth;
  private readonly app: FirebaseApp;

  constructor(auth: Auth, app: FirebaseApp) {
    this.auth = auth;
    this.app = app;
  }

  async signIn({ email, password }: AuthCredentials): Promise<User> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      return cred.user;
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async signUp({ email, password }: AuthCredentials): Promise<User> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      return cred.user;
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async createUserWithoutSignIn({ email, password }: AuthCredentials): Promise<User> {
    let secondaryApp: FirebaseApp | null = null;
    try {
      secondaryApp = initializeApp(this.app.options, `_create_user_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      return cred.user;
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    } finally {
      if (secondaryApp) await deleteApp(secondaryApp);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  currentUser(): User | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, listener);
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async verifyResetCode(oobCode: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(this.auth, oobCode);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword);
    } catch (e) {
      throw FirebaseErrorMapper.toAppError(e);
    }
  }
}
