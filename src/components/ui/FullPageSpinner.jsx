import { Spinner } from '@/components/ui/Spinner';

/** Full-viewport loading state, e.g. while the session is being resolved. */
export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-page text-ink-3">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
