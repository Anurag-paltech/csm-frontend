import { Outlet } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';

/**
 * Chrome for all authenticated pages. The shell is exactly one viewport tall and
 * does NOT scroll — screens fill `main` and manage their own internal scrolling
 * (e.g. a scroll region around a table). A screen that genuinely needs to scroll
 * its whole content should set `overflow-y-auto` on its own root.
 *
 * At/above 900px <NavBar>'s desktop column is fixed and `main` clears it with
 * `nav:pl-sidebar`; below it, a top bar sits in flow above `main`.
 */
export function AppLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <NavBar />
      <main className="min-h-0 flex-1 overflow-hidden nav:pl-sidebar">
        <div className="mx-auto flex h-full max-w-[1560px] flex-col px-6.5 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
