import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSyncLogs } from "@/features/admin/hooks/useJobs";
import { SyncLogsTable } from "@/features/admin/components/jobs/SyncLogsTable";

const dateInput =
  "rounded-sm border border-line-2 bg-surface px-2.5 py-1.75 text-[12.5px] text-ink focus:border-light-blue focus:outline-none focus:ring focus:ring-light-blue-soft";

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoUTC(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
// The API wants `YYYYMMDD`; native date inputs give `YYYY-MM-DD`.
const toCompactDate = (isoDate) => isoDate.replaceAll("-", "");

/**
 * Admin → Job Management → Sync Logs. Shows recent claims/SRT sync runs
 * (manual and scheduled), most recent first, over a date range that
 * defaults to the same last-7-days window the backend itself defaults to.
 */
export function SyncLogsPanel() {
  const [dateFrom, setDateFrom] = useState(() => daysAgoUTC(7));
  const [dateTo, setDateTo] = useState(() => todayUTC());

  const onFromChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    if (dateTo && value > dateTo) {
      setDateFrom(dateTo);
      setDateTo(value);
    } else {
      setDateFrom(value);
    }
  };
  const onToChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    if (dateFrom && value < dateFrom) {
      setDateTo(dateFrom);
      setDateFrom(value);
    } else {
      setDateTo(value);
    }
  };

  const { data, isLoading, isError, error, isFetching, refetch } =
    useSyncLogs({
      start_date: toCompactDate(dateFrom),
      end_date: toCompactDate(dateTo),
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
          Sync Logs
        </span>
        <div className="flex items-center gap-1.75">
          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={onFromChange}
            aria-label="From date"
            className={dateInput}
          />
          <span className="text-xs text-ink-3">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={onToChange}
            aria-label="To date"
            className={dateInput}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <SyncLogsTable
          rows={data ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      </div>
    </div>
  );
}
