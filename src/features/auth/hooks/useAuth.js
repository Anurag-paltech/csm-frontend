import { useContext } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';

/**
 * Access the current auth state and actions. Must be called from inside
 * <AuthProvider> (wired up in `src/app/providers.jsx`).
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}
