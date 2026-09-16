import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-2 bg-page p-6 text-center">
      <p className="font-display text-3xl font-bold text-navy">404</p>
      <p className="text-sm text-ink-3">This page could not be found.</p>
      <Link
        to={paths.dashboard}
        className="mt-2 text-sm font-bold text-blue hover:text-navy"
      >
        Back to SRT Recommendation
      </Link>
    </div>
  );
}
