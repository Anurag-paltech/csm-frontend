import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiError';

const COLS = ['Claim category', 'Excluded since', ''];
const th =
  'sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-navy text-left';
const td = 'border-b border-line px-3.5 py-3 align-middle';
const codeCell = `${td} whitespace-nowrap font-display font-bold text-navy`;

function StateRow({ children }) {
  return (
    <tr>
      <td
        colSpan={COLS.length}
        className="px-3.5 py-10 text-center text-sm text-ink-3"
      >
        {children}
      </td>
    </tr>
  );
}

export function ClaimCategoryExclusionsTable({
  page,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
  onRemove,
  removingCode,
}) {
  const rows = page?.items ?? [];
  const dimmed = isFetching && !isLoading;

  return (
    <div
      className={`h-full overflow-auto rounded-md border border-line bg-surface transition-opacity ${
        dimmed ? 'opacity-60' : ''
      }`}
    >
      <table className="w-full min-w-125 border-collapse text-sm">
        <thead>
          <tr>
            {COLS.map((c, i) => (
              <th key={i} className={th}>
                {c || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {isLoading ? (
            <StateRow>Loading exclusions…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>{getErrorMessage(error, 'Could not load exclusions.')}</span>
                {onRetry ? (
                  <Button variant="secondary" onClick={onRetry}>
                    Retry
                  </Button>
                ) : null}
              </div>
            </StateRow>
          ) : rows.length === 0 ? (
            <StateRow>
              <span className="font-display font-bold text-navy">
                No exclusions
              </span>
              <div className="mt-1">
                No claim categories are currently excluded from recommendations.
              </div>
            </StateRow>
          ) : (
            rows.map((c) => (
              <tr key={c.claim_category} className="hover:bg-surface-2">
                <td className={codeCell}>{c.claim_category}</td>
                <td className={`${td} whitespace-nowrap tabular-nums text-ink-3`}>
                  {formatDateTime(c.updated_at)}
                </td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    onClick={() => onRemove(c)}
                    disabled={removingCode === c.claim_category}
                    className="rounded-sm px-2 py-1 font-display text-xs font-bold text-ink-3 hover:bg-red-soft hover:text-red disabled:opacity-40"
                  >
                    {removingCode === c.claim_category ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
