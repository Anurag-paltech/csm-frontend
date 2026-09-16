import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ROLE_LABELS } from '@/features/auth/roles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUsers } from '@/features/admin/hooks/useUsers';
import { UsersTable } from '@/features/admin/components/UsersTable';
import { Pager } from '@/components/ui/Pager';

// `q` is an optional filter on a browsable table, so 1 char is treated as
// "no filter" rather than gating the whole list.
const MIN_SEARCH_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 10;

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

/**
 * Admin → Users. Fills its container as a flex column: fixed toolbar, a table
 * that scrolls internally, fixed pager.
 */
export function UsersPanel() {
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : '';

  const { data, isLoading, isError, error, isFetching, refetch } = useUsers({
    limit: pageSize,
    offset,
    role: role || undefined,
    q: q || undefined,
  });

  // Any filter change goes back to the first page.
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
  };
  const onRoleChange = (e) => {
    setRole(e.target.value);
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
            placeholder="Search by name or username"
            aria-label="Search users"
            className="w-64 pl-8"
          />
        </div>

        <Select value={role} onChange={onRoleChange} aria-label="Filter by role">
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="min-h-0 flex-1">
        <UsersTable
          page={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isFetching={isFetching}
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
    </div>
  );
}
