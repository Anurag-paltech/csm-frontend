import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { paths } from "@/routes/paths";
import csmLogoSrc from "@/assets/csm-logo.png";

function NotFoundIcon(props) {
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
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L21 21" />
      <path d="M8.5 9.5a2 2 0 1 1 3.2 1.6c-.7.55-1.2 1-1.2 1.9" />
      <path d="M10.5 14.75h.01" />
    </svg>
  );
}

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page p-4">
      <div className="absolute inset-x-0 top-0 h-0.75 bg-red" />

      <Card className="w-full max-w-95 p-7 text-center">
        <img
          src={csmLogoSrc}
          alt="CSM Truck"
          className="mx-auto mb-4 block h-6.5"
        />
        <NotFoundIcon className="mx-auto mb-3 h-11 w-11 text-navy" />
        <p className="font-display text-lg font-bold text-navy">
          Page Not Found
        </p>
        <p className="mt-2 text-sm text-ink-3">
          The page you&apos;re looking for doesn&apos;t exist, or may have been
          moved.
        </p>
        <Link
          to={paths.dashboard}
          className="mt-4 inline-block text-sm font-bold text-blue hover:text-navy"
        >
          Back to SRT Recommendation
        </Link>
      </Card>
    </div>
  );
}
