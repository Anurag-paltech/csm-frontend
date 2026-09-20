import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { paths } from "@/routes/paths";
import csmLogoSrc from "@/assets/csm-logo.png";

function ForbiddenIcon(props) {
  return (
    <svg viewBox="-2 0 24 24" fill="currentColor" {...props}>
      <path d="m3.5 6.5v3.5h-1.5c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2v-10c0-1.105-.895-2-2-2h-1.5v-3.5c0-3.59-2.91-6.5-6.5-6.5s-6.5 2.91-6.5 6.5zm2.5 3.5v-3.5c0-2.209 1.791-4 4-4s4 1.791 4 4v3.5zm2 5.5c0-1.105.895-2 2-2s2 .895 2 2c0 .701-.361 1.319-.908 1.676l-.008.005s.195 1.18.415 2.57v.001c0 .414-.335.749-.749.749-.001 0-.001 0-.002 0h-1.499-.001c-.414 0-.749-.335-.749-.749v-.001l.415-2.57c-.554-.361-.916-.979-.916-1.68z" />
    </svg>
  );
}

export function ForbiddenPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page p-4">
      <div className="absolute inset-x-0 top-0 h-0.75 bg-red" />

      <Card className="w-full max-w-95 p-7 text-center">
        <img
          src={csmLogoSrc}
          alt="CSM Truck"
          className="mx-auto mb-4 block h-6.5"
        />
        <ForbiddenIcon className="mx-auto mb-3 h-11 w-11 text-navy" />
        <p className="font-display text-lg font-bold text-navy">
          Access denied
        </p>
        <p className="mt-2 text-sm text-ink-3">
          You don&apos;t have permission to view this page. If you think this is
          a mistake, contact your administrator.
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
