import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import csmLogoSrc from "@/assets/csm-logo.png";

function ServerOfflineIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M7.5 7h.01M7.5 17h.01" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

/**
 * Shown when the app can't reach the backend to resolve the session (network
 * or 5xx). Distinct from 401 (→ redirect to login) and 403 (→ /403).
 */
export function ServerErrorPage({ onRetry }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page p-4">
      <div className="absolute inset-x-0 top-0 h-0.75 bg-red" />

      <Card className="w-full max-w-95 p-7 text-center">
        <img
          src={csmLogoSrc}
          alt="CSM Truck"
          className="mx-auto mb-4 block h-6.5"
        />
        <ServerOfflineIcon className="mx-auto mb-3 h-11 w-11 text-navy" />
        <p className="font-display text-lg font-bold text-navy">
          Can&apos;t reach the server
        </p>
        <p className="mt-2 text-sm text-ink-3">
          We couldn&apos;t verify your session. Check your connection and try
          again. If the problem persists, the server may be temporarily
          unavailable.
        </p>
        {onRetry ? (
          <Button onClick={onRetry} className="mt-4">
            Retry
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
