import { useEffect } from 'react';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppDispatch } from '../../../app/hooks';
import { setUser, clearUser, setLoading } from './authSlice';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const repo = useInjected(TOKENS.AuthRepo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading());
    const unsubscribe = repo.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(setUser(authUser));
      } else {
        dispatch(clearUser());
      }
    });
    return unsubscribe;
  }, [repo, dispatch]);

  return <>{children}</>;
}
