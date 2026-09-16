import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/format";
import { getErrorMessage } from "@/lib/apiError";

const COLS = [
  "Repair order",
  "Dealer",
  "Model",
  "Causal part",
  "Result",
  "Selected",
  "Searched on",
  "",
];
const th =
  "sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-navy text-left";
const td = "border-b border-line px-3.5 py-3 align-middle";
const codeCell = `${td} whitespace-nowrap font-display font-bold text-navy`;

function StateRow({ children }) {
  return (
    <tr className="h-full">
      <td
        colSpan={COLS.length}
        className="h-full px-3.5 py-10 text-center align-middle text-sm text-ink-3"
      >
        <div className="flex h-full flex-col items-center justify-center gap-2">
          {children}
        </div>
      </td>
    </tr>
  );
}

export function HistoryTable({
  page,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
  onOpen,
  hasFilters = false,
  onNewQuery,
}) {
  const rows = page?.items ?? [];
  const dimmed = isFetching && !isLoading;

  const showFullError = isError && !page;
  const showStaleErrorBanner = isError && Boolean(page);
  const showStateRow = isLoading || showFullError || rows.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface">
      {showStaleErrorBanner ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-red-border bg-red-soft px-3.5 py-2 text-xs text-red">
          <span>
            Couldn&apos;t refresh ·{" "}
            {getErrorMessage(error, "Showing the last loaded results.")}
          </span>
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}
      <div
        className={`min-h-0 flex-1 overflow-auto transition-opacity ${
          dimmed ? "opacity-60" : ""
        }`}
      >
        <table
          className={`w-full min-w-225 border-collapse text-sm ${showStateRow ? "h-full" : ""}`}
        >
          <thead>
            <tr>
              {COLS.map((c, i) => (
                <th key={i} className={th}>
                  {c || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`[&>tr:last-child>td]:border-b-0 ${showStateRow ? "h-full" : ""}`}
          >
            {isLoading ? (
              <StateRow>
                <Spinner className="h-5 w-5" />
                <span>Loading history…</span>
              </StateRow>
            ) : showFullError ? (
              <StateRow>
                <span className="font-display font-bold text-navy">
                  Couldn&apos;t load history
                </span>
                <span>
                  {getErrorMessage(
                    error,
                    "Something went wrong. Please try again.",
                  )}
                </span>
                {onRetry ? (
                  <Button variant="secondary" onClick={onRetry}>
                    Retry
                  </Button>
                ) : null}
              </StateRow>
            ) : rows.length === 0 ? (
              <StateRow>
                <span className="font-display font-bold text-navy">
                  {hasFilters
                    ? "No matching searches"
                    : "Let's get you started"}
                </span>
                <span>
                  {hasFilters
                    ? "Try adjusting your search or date range."
                    : "Run a query to get SRT recommendations - it'll show up here."}
                </span>
                {!hasFilters && onNewQuery ? (
                  <Button onClick={onNewQuery} className="mt-1">
                    New Query
                  </Button>
                ) : null}
              </StateRow>
            ) : (
              rows.map((rec) => {
                const q = rec.query ?? {};
                const items = rec.items ?? [];
                const itemCount = items.length;
                const codes = items.map((i) => i.srt_code);
                const selectedCodes = items
                  .filter((i) => i.selected)
                  .map((i) => i.srt_code);
                const engineLabel = [q.engine_make, q.engine_model]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr
                    key={rec.recommendation_id}
                    className="hover:bg-surface-2"
                  >
                    <td
                      className={`${codeCell} max-w-40 overflow-hidden text-ellipsis`}
                      title={q.repair_order_number}
                    >
                      {q.repair_order_number}
                    </td>
                    <td className={td}>{q.dealer_code}</td>
                    <td className={td}>
                      {q.truck_model}
                      {engineLabel ? (
                        <div className="mt-0.5 text-xs text-ink-3">
                          {engineLabel}
                        </div>
                      ) : null}
                    </td>
                    <td className={codeCell}>{q.causal_part_number}</td>
                    <td
                      className={td}
                      title={codes.length ? codes.join(", ") : undefined}
                    >
                      {rec.status === "ok" ? (
                        <span className="tabular-nums font-bold">
                          {itemCount} {itemCount === 1 ? "code" : "codes"}
                        </span>
                      ) : (
                        <Badge tone="neutral">No confident match</Badge>
                      )}
                    </td>
                    <td
                      className={td}
                      title={
                        selectedCodes.length
                          ? selectedCodes.join(", ")
                          : undefined
                      }
                    >
                      {rec.status === "ok" ? (
                        <span className="tabular-nums font-bold">
                          {selectedCodes.length}{" "}
                          {selectedCodes.length === 1 ? "code" : "codes"}
                        </span>
                      ) : (
                        <span className="text-ink-3">—</span>
                      )}
                    </td>
                    <td
                      className={`${td} whitespace-nowrap tabular-nums text-ink-3`}
                    >
                      {formatDateTime(rec.created_at)}
                    </td>
                    <td className={`${td} text-right`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(rec.recommendation_id);
                        }}
                        aria-label={`Open ${q.repair_order_number}`}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-sm px-2 py-1 font-display text-xs font-bold text-ink-3 hover:bg-blue-soft hover:text-blue"
                      >
                        Open
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          aria-hidden="true"
                          className="h-3 w-3"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
