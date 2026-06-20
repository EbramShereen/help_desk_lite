import type { User } from 'firebase/auth';

export interface AuthCredentials {
  email: string;
  password: string;
}

/** Abstraction over Firebase Auth — features depend on this, never the SDK. */
export interface AuthHandler {
  signIn(credentials: AuthCredentials): Promise<User>;
  signUp(credentials: AuthCredentials): Promise<User>;
  createUserWithoutSignIn(credentials: AuthCredentials): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): User | null;
  onAuthStateChanged(listener: (user: User | null) => void): () => void;
  sendPasswordReset(email: string): Promise<void>;
  verifyResetCode(oobCode: string): Promise<string>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
}
