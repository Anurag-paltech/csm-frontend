import { createContext } from 'react';

/**
 * Auth context value shape (for reference):
 *
 *   {
 *     user: { name, username, roles: string[] } | null,
 *     status: 'loading' | 'authenticated' | 'unauthenticated' | 'error',
 *     isAuthenticated: boolean,
 *     isLoading: boolean,
 *     isAuthBypassed: boolean,
 *     roles: string[],
 *     hasRole: (role: string) => boolean,
 *     hasAnyRole: (roles: string[]) => boolean,
 *     login: (returnTo?: string) => void,   // full-page redirect to the BFF
 *     logout: () => Promise<void>,
 *     reload: () => Promise<void>,          // re-fetch GET /me
 *   }
 *
 * Kept in its own file (no component export) so fast-refresh stays happy and
 * `useAuth` can import it without pulling in the provider.
 */
export const AuthContext = createContext(null);
