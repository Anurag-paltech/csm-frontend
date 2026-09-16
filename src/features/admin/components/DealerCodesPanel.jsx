import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pager } from '@/components/ui/Pager';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDealers } from '@/features/admin/hooks/useDealers';
import { DealerCodesTable } from '@/features/admin/components/DealerCodesTable';
import { DealerFormModal } from '@/features/admin/components/DealerFormModal';

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
 * Admin → Data Management → Dealer. Add/edit dealer rows — no delete;
 * `dealer_code` and `dealer_family_code` are fixed once created (see
 * DealerFormModal).
 */
export function DealerCodesPanel() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [formTarget, setFormTarget] = useState(null); // { dealer } | { dealer: null } | null

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : '';

  const { data, isLoading, isError, error, isFetching, refetch } = useDealers({
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <Input
            type="search"
            value={search}
            onChange={onSearchChange}
            placeholder="Search dealers"
            aria-label="Search dealers"
            className="w-64 pl-8"
          />
        </div>

        <Button onClick={() => setFormTarget({ dealer: null })}>
          Add dealer
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <DealerCodesTable
          page={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isFetching={isFetching}
          onEdit={(dealer) => setFormTarget({ dealer })}
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

      <DealerFormModal
        open={formTarget !== null}
        dealer={formTarget?.dealer ?? null}
        onClose={() => setFormTarget(null)}
      />
    </div>
  );
}
