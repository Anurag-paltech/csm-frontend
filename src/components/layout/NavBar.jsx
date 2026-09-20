import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { paths } from "@/routes/paths";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES, roleLabel } from "@/features/auth/roles";
import csmLogoSrc from "@/assets/csm-logo.png";

/* -------------------------------------------------------------------------- */
/* Shared nav content                                                          */
/* -------------------------------------------------------------------------- */

function initials(nameOrEmail = "") {
  const source = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0].replace(/[._-]+/g, " ")
    : nameOrEmail;
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const linkClass = ({ isActive }) =>
  [
    "flex items-center gap-2.75 rounded-sm border-l-[3px] px-3.25 py-2.75",
    "font-display text-[13.5px] font-bold transition-colors",
    isActive
      ? "border-l-red bg-blue-soft text-blue"
      : "border-l-transparent text-ink-2 hover:bg-surface-2 hover:text-navy",
  ].join(" ");

const iconClass = (isActive) =>
  `h-[17px] w-[17px] flex-none ${isActive ? "text-blue" : "text-ink-3"}`;

const ClipboardCheckIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    {...props}
  >
    <path d="M9 11l3 3 5-5" />
    <rect x="3" y="4" width="18" height="16" rx="2" />
  </svg>
);

const HistoryIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    {...props}
  >
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </svg>
);

const SettingsIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const NAV_ITEMS = [
  {
    to: paths.dashboard,
    end: true,
    label: "SRT Recommendation",
    Icon: ClipboardCheckIcon,
  },
  { to: paths.history, label: "History", Icon: HistoryIcon },
];

const ADMIN_ITEM = {
  to: paths.admin.root,
  label: "Admin Console",
  Icon: SettingsIcon,
};

/**
 * Brand, links, and the user/logout foot. Rendered by both <DesktopNav> and the
 * <MobileNav> drawer. Expects a `flex flex-col` parent that supplies the
 * surface + padding; `onNavigate` closes the mobile drawer.
 */
function NavContent({ onNavigate }) {
  const { user, hasRole, logout } = useAuth();

  const items = hasRole(ROLES.ADMIN) ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  const name = user?.name ?? user?.username ?? "Account";
  const role = user?.roles?.[0];
  const roleText = role ? roleLabel(role) : "";

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  return (
    <>
      <div className="mb-4 border-b border-line px-4.5 pb-4">
        <img src={csmLogoSrc} alt="CSM Truck" className="mb-3 block h-6" />
        <div className="font-display text-[13px] font-bold leading-[1.35] text-navy">
          Warranty Claims Assistant
        </div>
      </div>

      <nav className="flex flex-col gap-0.75 px-2.5">
        {items.map(({ to, end, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                <Icon className={iconClass(isActive)} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.75 border-t border-line px-4 pt-3.5">
        <span className="flex h-8.25 w-8.25 flex-none items-center justify-center rounded-full bg-navy font-display text-[11.5px] font-bold tracking-[0.04em] text-white">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-bold leading-tight text-ink">
            {name}
          </div>
          {roleText ? (
            <div className="text-[11px] text-ink-3">{roleText}</div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="ml-auto rounded-sm p-1.5 text-ink-3 hover:bg-surface-2 hover:text-navy"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            className="block h-4 w-4"
          >
            <path d="M16 17l5-5-5-5M21 12H9M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h7" />
          </svg>
        </button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop: fixed 236px column (>= 900px)                                      */
/* -------------------------------------------------------------------------- */

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col overflow-y-auto border-r border-line bg-surface pb-4 pt-5 nav:flex">
      <NavContent />
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile: top bar + slide-in drawer (< 900px)                                */
/* -------------------------------------------------------------------------- */

function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // While open: Escape closes, body scroll is locked.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="shrink-0 nav:hidden">
      <div className="h-0.75 bg-red" />
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-surface px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-ml-1.5 rounded-sm p-1.5 text-ink-2 hover:bg-surface-2 hover:text-navy"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src={csmLogoSrc} alt="CSM Truck" className="h-5" />
        <span className="font-display text-[13px] font-bold text-navy">
          Warranty Claims Assistant
        </span>
      </header>

      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={close}
          className={`absolute inset-0 bg-navy/50 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`absolute inset-y-0 left-0 flex w-sidebar flex-col overflow-y-auto bg-surface pb-4 pt-5 shadow-pop transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-sm p-1.5 text-ink-3 hover:bg-surface-2 hover:text-navy"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <NavContent onNavigate={close} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Public: the one thing AppLayout renders                                     */
/* -------------------------------------------------------------------------- */

/**
 * App navigation. Renders both halves; CSS shows exactly one per the `nav`
 * breakpoint (900px). `main` reserves space for <DesktopNav> via `nav:pl-sidebar`.
 */
export function NavBar() {
  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
}
