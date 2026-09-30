import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/apiError";
import { MODEL_NAME_LABELS } from "@/features/admin/schemas/truckEngineMappingSchema";

const COLS = ["Type", "Claim history model", "SRT list model", ""];
const th =
  "sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-navy text-left";
const td = "border-b border-line px-3.5 py-3 align-middle";
const codeCell = `${td} whitespace-nowrap font-display font-bold text-navy`;
const actionBtn =
  "rounded-sm px-2 py-1 font-display text-xs font-bold text-ink-3 disabled:opacity-40";

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

export function TruckEngineMappingsTable({
  page,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
  onEdit,
  onDelete,
}) {
  const rows = page?.items ?? [];
  const dimmed = isFetching && !isLoading;

  return (
    <div
      className={`h-full overflow-auto rounded-md border border-line bg-surface transition-opacity ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <table className="w-full min-w-175 border-collapse text-sm">
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
            <StateRow>Loading mappings…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>
                  {getErrorMessage(error, "Could not load mappings.")}
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
                No mappings match
              </span>
              <div className="mt-1">Try adjusting the search or filter.</div>
            </StateRow>
          ) : (
            rows.map((m) => (
              <tr key={m.id} className="hover:bg-surface-2">
                <td className={td}>
                  {MODEL_NAME_LABELS[m.model_name] ?? m.model_name}
                </td>
                <td className={codeCell}>{m.claim_history_model}</td>
                <td className={td}>{m.srt_list_model}</td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <button
                    type="button"
                    onClick={() => onEdit(m)}
                    className={`${actionBtn} hover:bg-blue-soft hover:text-blue`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(m)}
                    className={`${actionBtn} hover:bg-red-soft hover:text-red`}
                  >
                    Delete
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
