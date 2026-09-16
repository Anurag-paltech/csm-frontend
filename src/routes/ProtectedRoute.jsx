import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '@/routes/paths';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { ServerErrorPage } from '@/components/pages/ServerErrorPage';

/**
 * Gate for any route that requires an authenticated session.
 *
 * - `loading`        → spinner while `GET /me` resolves.
 * - `authenticated`  → render the route.
 * - `unauthenticated`→ redirect to the in-app sign-in gate (`/login`), carrying
 *   the attempted location so it can bounce back after sign-in.
 * - `error`          → "can't reach server" screen with retry (no redirect loop
 *   against a possibly-down backend).
 */
export function ProtectedRoute() {
  const { status, reload } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    return <Outlet />;
  }
  if (status === 'error') {
    return <ServerErrorPage onRetry={reload} />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }
  return <FullPageSpinner />;
}
