import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROLES, roleLabel } from '@/features/auth/roles';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiError';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'username', label: 'Username' },
  { key: 'roles', label: 'Roles' },
  { key: 'since', label: 'Member since' },
  { key: 'lastActive', label: 'Last active' },
];

function RoleBadges({ roles = [] }) {
  if (roles.length === 0) return <span className="text-ink-3">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <Badge key={r} tone={r === ROLES.ADMIN ? 'navy' : 'neutral'}>
          {roleLabel(r)}
        </Badge>
      ))}
    </span>
  );
}

function StateRow({ children }) {
  return (
    <tr>
      <td
        colSpan={COLUMNS.length}
        className="px-3.5 py-10 text-center text-[13px] text-ink-3"
      >
        {children}
      </td>
    </tr>
  );
}

const cell = 'border-b border-line px-3.5 py-3';
const numCell = `${cell} tabular-nums text-ink-3`;

export function UsersTable({
  page,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
}) {
  const rows = page?.items ?? [];
  const dimmed = isFetching && !isLoading;

  return (
    <div
      className={`h-full overflow-auto rounded-md border border-line bg-surface transition-opacity ${
        dimmed ? 'opacity-60' : ''
      }`}
    >
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-10">
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={`border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.09em] text-navy ${
                  c.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {isLoading ? (
            <StateRow>Loading users…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>
                  {error?.status === 403
                    ? "You don't have access to user management."
                    : getErrorMessage(error, 'Could not load users.')}
                </span>
                {error?.status !== 403 && onRetry ? (
                  <Button variant="secondary" onClick={onRetry}>
                    Retry
                  </Button>
                ) : null}
              </div>
            </StateRow>
          ) : rows.length === 0 ? (
            <StateRow>
              <span className="font-display font-bold text-navy">
                No users match
              </span>
              <div className="mt-1">
                Try adjusting the search or role filter.
              </div>
            </StateRow>
          ) : (
            rows.map((u) => (
              <tr key={u.username} className="hover:bg-surface-2">
                <td className={`${cell} font-bold text-ink`}>
                  {u.display_name}
                </td>
                <td className={`${cell} text-ink-3`}>{u.username}</td>
                <td className={cell}>
                  <RoleBadges roles={u.roles} />
                </td>
                <td className={numCell}>{formatDate(u.user_since)}</td>
                <td className={numCell}>{formatDate(u.last_active_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
