import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pager } from "@/components/ui/Pager";
import { paths } from "@/routes/paths";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecommendationHistory } from "@/features/srt/hooks/useSrtRecommendation";
import { HistoryTable } from "@/features/srt/components/HistoryTable";

const MIN_SEARCH_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 25;

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

const dateInput =
  "rounded-sm border border-line-2 bg-surface px-2.75 py-2.25 text-sm text-ink focus:border-light-blue focus:outline-none focus:ring focus:ring-light-blue-soft";

/** User SRT Recommendation History. */
export function HistoryPage() {
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : "";

  const filterKey = `${q}|${dateFrom}|${dateTo}|${pageSize}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  let effectiveOffset = offset;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    effectiveOffset = 0;
    setOffset(0);
  }

  const { data, isLoading, isError, error, isFetching, refetch } =
    useRecommendationHistory({
      limit: pageSize,
      offset: effectiveOffset,
      q: q || undefined,
      created_after: dateFrom || undefined,
      created_before: dateTo || undefined,
    });

  useEffect(() => {
    if (!data || data.total === 0 || data.items.length > 0 || offset === 0) {
      return;
    }
    const lastPageOffset = Math.max(
      0,
      Math.floor((data.total - 1) / pageSize) * pageSize,
    );
    if (lastPageOffset !== offset) setOffset(lastPageOffset);
  }, [data, offset, pageSize]);

  const onSearchChange = (e) => setSearch(e.target.value);

  const onFromChange = (e) => {
    const value = e.target.value;
    if (value && dateTo && value > dateTo) {
      setDateFrom(dateTo);
      setDateTo(value);
    } else {
      setDateFrom(value);
    }
  };
  const onToChange = (e) => {
    const value = e.target.value;
    if (value && dateFrom && value < dateFrom) {
      setDateTo(dateFrom);
      setDateFrom(value);
    } else {
      setDateTo(value);
    }
  };
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };
  const hasRawFilters = Boolean(search || dateFrom || dateTo);
  const hasFilters = Boolean(q || dateFrom || dateTo);

  const openRecommendation = (id) =>
    navigate(`${paths.dashboard}?${new URLSearchParams({ rec: String(id) })}`);

  return (
    <div className="flex h-full flex-col">
      <PageHeader eyebrow="SRT Recommendation" title="History" />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-5.5">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input
              type="search"
              value={search}
              onChange={onSearchChange}
              placeholder="Filter by RO or part"
              aria-label="Filter history"
              className="w-64 pl-8"
            />
          </div>

          <div className="flex items-center gap-1.75">
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={onFromChange}
              aria-label="From date"
              className={dateInput}
            />
            <span className="text-xs text-ink-3">to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={onToChange}
              aria-label="To date"
              className={dateInput}
            />
          </div>

          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={!hasRawFilters}
            className="ml-auto cursor-pointer"
          >
            Clear
          </Button>
        </div>

        <div className="min-h-0 flex-1">
          <HistoryTable
            page={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            isFetching={isFetching}
            onOpen={openRecommendation}
            hasFilters={hasFilters}
            onNewQuery={() => navigate(paths.dashboard)}
          />
        </div>

        {data && data.total > 0 ? (
          <Pager
            total={data.total}
            pageSize={pageSize}
            offset={offset}
            hasMore={data.has_more}
            onOffsetChange={setOffset}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </Card>
    </div>
  );
}
