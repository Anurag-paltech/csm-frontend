import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getErrorMessage } from "@/lib/apiError";

const STATUS_TONE = {
  running: "blue",
  success: "green",
  failure: "red",
  unknown: "neutral",
};
const STATUS_LABEL = {
  running: "Running",
  success: "Success",
  failure: "Failed",
  unknown: "Unknown",
};

// A run stuck on "running" way longer than a normal sync usually means the
// Function App host died mid-run and the placeholder never got finalized.
const STALE_RUNNING_MS = 30 * 60 * 1000;

function humanizeKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Splits on "_" and title-cases each word, but leaves an already-all-caps
// word (like "SRT") alone instead of mangling it to "Srt".
function humanizeJobName(name) {
  return name
    .split("_")
    .map((word) =>
      word === word.toUpperCase()
        ? word
        : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

// `stats` shape varies by job (claims vs. SRT), so this reads it generically
// rather than hardcoding either job's fields.
function formatStats(stats) {
  if (!stats || typeof stats !== "object") return "—";
  const parts = Object.entries(stats)
    .filter(([, value]) => !Array.isArray(value) || value.length > 0)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${humanizeKey(key)}: ${value.length}`
        : `${humanizeKey(key)}: ${
            typeof value === "number" ? formatNumber(value) : value
          }`,
    );
  return parts.length > 0 ? parts.join(" · ") : "—";
}

const COLS = ["Job", "Started", "Status", "Result", "Log file"];
const th =
  "sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-navy text-left";
const td = "border-b border-line px-3.5 py-3 align-middle";

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

export function SyncLogsTable({
  rows,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
}) {
  const dimmed = isFetching && !isLoading;
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div
      className={`h-full overflow-auto rounded-md border border-line bg-surface transition-opacity ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <table className="w-full min-w-200 border-collapse text-sm">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th key={c} className={th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {isLoading ? (
            <StateRow>Loading sync logs…</StateRow>
          ) : isError ? (
            <StateRow>
              <div className="flex flex-col items-center gap-2">
                <span>
                  {getErrorMessage(error, "Could not load sync logs.")}
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
                No runs in this range
              </span>
              <div className="mt-1">Try widening the date range.</div>
            </StateRow>
          ) : (
            rows.map((r) => {
              const key = `${r.job_name}-${r.date_time}`;
              const isOpen = expanded.has(key);
              const isStale =
                r.status === "running" &&
                Date.now() - new Date(r.date_time).getTime() >
                  STALE_RUNNING_MS;
              return (
                <Fragment key={key}>
                  <tr className="hover:bg-surface-2">
                    <td
                      className={`${td} whitespace-nowrap font-display font-bold text-navy`}
                    >
                      {humanizeJobName(r.job_name)}
                    </td>
                    <td
                      className={`${td} whitespace-nowrap tabular-nums text-ink-3`}
                    >
                      {formatDateTime(r.date_time)}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                        {isStale ? (
                          <Badge tone="red">Possibly stuck</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className={td}>
                      {r.stats ? (
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="font-display text-xs font-bold text-blue hover:underline"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      ) : (
                        <span className="text-ink-3">—</span>
                      )}
                    </td>
                    <td
                      className={`${td} max-w-60 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-ink-3`}
                      title={r.log_file_path}
                    >
                      {r.log_file_path}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="bg-surface-2">
                      <td
                        colSpan={COLS.length}
                        className={`${td} text-[12.5px] text-ink-2`}
                      >
                        {formatStats(r.stats)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
