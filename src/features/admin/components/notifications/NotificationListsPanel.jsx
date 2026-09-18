import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Pager } from "@/components/ui/Pager";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useNotificationLists } from "@/features/admin/hooks/useNotificationLists";
import { NotificationListsTable } from "@/features/admin/components/notifications/NotificationListsTable";
import { NotificationListFormModal } from "@/features/admin/components/notifications/NotificationListFormModal";

const MIN_SEARCH_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 10;

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

/**
 * Admin → Data Management → Notifications. Edit-only — each row's recipient
 * list can be changed, but titles are fixed and there's no create/delete.
 */
export function NotificationListsPanel() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState(null);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : "";

  const { data, isLoading, isError, error, isFetching, refetch } =
    useNotificationLists({
      limit: pageSize,
      offset,
      q: q || undefined,
    });

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
  };
  const onPageSizeChange = (n) => {
    setPageSize(n);
    setOffset(0);
  };

  return (
    <div className="flex h-full flex-col p-5.5">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <Input
            type="search"
            value={search}
            onChange={onSearchChange}
            placeholder="Search notification lists"
            aria-label="Search notification lists"
            className="w-64 pl-8"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <NotificationListsTable
          page={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isFetching={isFetching}
          onEdit={setEditing}
        />
      </div>

      {data && data.total > 0 ? (
        <Pager
          total={data.total}
          pageSize={pageSize}
          offset={offset}
          hasMore={data.has_more}
          onOffsetChange={setOffset}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}

      <NotificationListFormModal
        open={editing !== null}
        list={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
