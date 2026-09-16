import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { paths } from '@/routes/paths';
import csmLogoSrc from '@/assets/csm-logo.png';

function MicrosoftGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] flex-none" aria-hidden="true">
      <path fill="#F25022" d="M1 1h8.5v8.5H1z" />
      <path fill="#7FBA00" d="M10.5 1H19v8.5h-8.5z" />
      <path fill="#00A4EF" d="M1 10.5h8.5V19H1z" />
      <path fill="#FFB900" d="M10.5 10.5H19V19h-8.5z" />
    </svg>
  );
}

/**
 * Public sign-in gate. No credentials form — the button hands off to the BFF's
 * OAuth flow (`useAuth().login` → `/auth/login`). See AUTH.md.
 */
export function LoginPage() {
  const { status, isAuthenticated, login } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const stateFrom = location.state?.from;
  const returnTo =
    (stateFrom && `${stateFrom.pathname}${stateFrom.search ?? ''}`) ||
    params.get('return_to') ||
    paths.dashboard;
  const signedOut = params.get('signed_out') === '1';

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }
  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page p-4">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-red" />

      <Card className="w-full max-w-[380px] p-7 text-center">
        <img
          src={csmLogoSrc}
          alt="CSM Truck"
          className="mx-auto mb-4 block h-[26px]"
        />
        <h1 className="font-display text-[18px] font-bold text-navy">
          Warranty Claims Assistant
        </h1>
        <p className="mb-6 mt-1.5 text-[13px] text-ink-3">
          {signedOut ? 'You have been signed out.' : 'Sign in to continue.'}
        </p>

        <Button className="w-full" onClick={() => login(returnTo)}>
          <MicrosoftGlyph />
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
}
