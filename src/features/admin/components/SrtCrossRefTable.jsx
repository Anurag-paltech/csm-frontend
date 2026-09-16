import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/apiError';

const COLS = ['Obsolete SRT', 'Replacement SRT', 'Reason'];
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

/** Read-only — this list only changes via an Excel upload (see CrossRefPanel). */
export function SrtCrossRefTable({
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
      <table className="w-full min-w-125 border-collapse text-sm">
        <thead>
          <tr>
            {COLS.map((c, i) => (
              <th key={i} className={th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {isLoading ? (
            <StateRow>Loading SRT code changes…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>{getErrorMessage(error, 'Could not load SRT code changes.')}</span>
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
                No SRT code changes yet
              </span>
              <div className="mt-1">Upload a mapping file to add some.</div>
            </StateRow>
          ) : (
            rows.map((r, i) => (
              <tr key={`${r.prev_srt}-${r.new_srt}-${i}`} className="hover:bg-surface-2">
                <td className={codeCell}>{r.prev_srt}</td>
                <td className={codeCell}>{r.new_srt}</td>
                <td className={td}>{r.reason || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
