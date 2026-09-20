import { createBrowserRouter } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotFoundPage } from '@/components/pages/NotFoundPage';
import { ForbiddenPage } from '@/components/pages/ForbiddenPage';

import { ROLES, LoginPage } from '@/features/auth';
import { SrtRecommendationPage } from '@/features/srt/pages/SrtRecommendationPage';

/**
 * Route tree.
 *
 *   /login                       public sign-in gate (button → BFF /auth/login)
 *   <ProtectedRoute>             resolves GET /me; redirects to /login otherwise
 *     <AppLayout>                sidebar + topbar chrome
 *       /                        SRT recommendation (query form) — eager, it's
 *                                 the landing page almost everyone hits first
 *       /history                 history — code-split, not needed on first paint
 *       <RoleRoute admin>        requires the admin role
 *         /admin                 admin — code-split; most users never load it
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
          {
            path: paths.history,
            lazy: () =>
              import('@/features/srt/pages/HistoryPage').then((m) => ({
                Component: m.HistoryPage,
              })),
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN]} />,
            children: [
              {
                path: paths.admin.root,
                lazy: () =>
                  import('@/features/admin/pages/AdminPage').then((m) => ({
                    Component: m.AdminPage,
                  })),
              },
            ],
          },
        ],
      },
    ],
  },

  { path: paths.forbidden, element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
