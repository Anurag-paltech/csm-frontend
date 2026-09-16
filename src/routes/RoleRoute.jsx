import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '@/routes/paths';

/**
 * Gate for routes that require one of a set of roles. Must be nested inside a
 * <ProtectedRoute> (it assumes the user is already authenticated).
 *
 *   <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 *
 * This is a UX guard only — the backend must still enforce authorization on
 * every request.
 */
export function RoleRoute({ roles }) {
  const { hasAnyRole } = useAuth();

  if (!hasAnyRole(roles)) {
    return <Navigate to={paths.forbidden} replace />;
  }

  return <Outlet />;
}
