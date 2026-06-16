import { useMutation } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from './authSlice';
import type {
  LoginInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../models/schemas';

export function useAuthController() {
  const repo = useInjected(TOKENS.AuthRepo);
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);

  const login = useMutation({
    mutationFn: ({ email, password }: LoginInput) => repo.signIn(email, password),
    onSuccess: (authUser) => dispatch(setUser(authUser)),
  });

  const signup = useMutation({
    mutationFn: ({ displayName, email, password }: SignUpInput) =>
      repo.signUp({ displayName, email, password }),
    onSuccess: (authUser) => dispatch(setUser(authUser)),
  });

  const logout = useMutation({
    mutationFn: () => repo.signOut(),
  });

  const sendReset = useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => repo.sendPasswordReset(email),
  });

  const verifyCode = useMutation({
    mutationFn: (oobCode: string) => repo.verifyResetCode(oobCode),
  });

  const confirmReset = useMutation({
    mutationFn: ({ oobCode, password }: ResetPasswordInput & { oobCode: string }) =>
      repo.confirmPasswordReset(oobCode, password),
  });

  return { user, status, login, signup, logout, sendReset, verifyCode, confirmReset };
}
