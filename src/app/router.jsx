import { createBrowserRouter } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotFoundPage } from '@/components/pages/NotFoundPage';
import { ForbiddenPage } from '@/components/pages/ForbiddenPage';

import { ROLES, LoginPage } from '@/features/auth';
import { SrtRecommendationPage, HistoryPage } from '@/features/srt';
import { AdminPage } from '@/features/admin';

/**
 * Route tree.
 *
 *   /login                       public sign-in gate (button → BFF /auth/login)
 *   <ProtectedRoute>             resolves GET /me; redirects to /login otherwise
 *     <AppLayout>                sidebar + topbar chrome
 *       /                        SRT recommendation (query form)
 *       /history                 history
 *       <RoleRoute admin>        requires the admin role
 *         /admin                 admin
 *   /403                         forbidden (logged in, wrong role)
 *   *                            not found
 */
export const router = createBrowserRouter([
  { path: paths.login, element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.dashboard, element: <SrtRecommendationPage /> },
          { path: paths.history, element: <HistoryPage /> },
          {
            element: <RoleRoute roles={[ROLES.ADMIN]} />,
            children: [{ path: paths.admin.root, element: <AdminPage /> }],
          },
        ],
      },
    ],
  },

  { path: paths.forbidden, element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
