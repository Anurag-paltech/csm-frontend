import { Button } from '@/components/ui/Button';

/**
 * Shown when the app can't reach the backend to resolve the session (network
 * or 5xx). Distinct from 401 (→ redirect to login) and 403 (→ /403).
 */
export function ServerErrorPage({ onRetry }) {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-3 bg-page p-6 text-center">
      <p className="font-display text-lg font-bold text-navy">
        Can&apos;t reach the server
      </p>
      <p className="max-w-sm text-sm text-ink-3">
        We couldn&apos;t verify your session. Check your connection and try
        again.
      </p>
      {onRetry ? (
        <Button onClick={onRetry} className="mt-1">
          Retry
        </Button>
      ) : null}
    </div>
  );
}
