import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/apiError";

const COLS = ["Title", "Recipients", ""];
const th =
  "sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-navy text-left";
const td = "border-b border-line px-3.5 py-3 align-middle";
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

export function NotificationListsTable({
  page,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
  onEdit,
}) {
  const rows = page?.items ?? [];
  const dimmed = isFetching && !isLoading;

  return (
    <div
      className={`h-full overflow-auto rounded-md border border-line bg-surface transition-opacity ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <table className="w-full min-w-150 border-collapse text-sm">
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
            <StateRow>Loading notification lists…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>
                  {getErrorMessage(error, "Could not load notification lists.")}
                </span>
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
                No notification lists match
              </span>
              <div className="mt-1">Try adjusting the search.</div>
            </StateRow>
          ) : (
            rows.map((l) => (
              <tr key={l.id} className="hover:bg-surface-2">
                <td className={codeCell}>{l.title}</td>
                <td className={td}>
                  <span className="line-clamp-2 text-ink-2">
                    {l.emails?.join(", ") || "—"}
                  </span>
                </td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    onClick={() => onEdit(l)}
                    className="rounded-sm px-2 py-1 font-display text-xs font-bold text-ink-3 hover:bg-blue-soft hover:text-blue"
                  >
                    Edit
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
