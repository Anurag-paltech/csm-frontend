import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pager } from '@/components/ui/Pager';
import { getErrorMessage } from '@/lib/apiError';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useClaimCategoryExclusions,
  useUpdateClaimCategoryExclusion,
} from '@/features/admin/hooks/useClaimCategoryExclusions';
import { ClaimCategoryExclusionsTable } from '@/features/admin/components/ClaimCategoryExclusionsTable';
import { AddClaimCategoryExclusionModal } from '@/features/admin/components/AddClaimCategoryExclusionModal';

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
 * Admin → Data Management → Claim Category. Lists claim categories currently
 * excluded from recommendations (`use_for_rec: false`) — "Add exclusion"
 * flips an existing category's flag to false, "Remove" flips it back to
 * true. This is a distinct admin entity from the SRT query form's
 * `claim_category` field (truck/engine) — same name, different thing.
 */
export function ClaimCategoryExclusionsPanel() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : '';

  const { data, isLoading, isError, error, isFetching, refetch } =
    useClaimCategoryExclusions({
      limit: pageSize,
      offset,
      use_for_rec: false,
      q: q || undefined,
    });

  const updateExclusion = useUpdateClaimCategoryExclusion();

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
  };
  const onPageSizeChange = (n) => {
    setPageSize(n);
    setOffset(0);
  };

  const removeExclusion = async (claimCategory) => {
    setRemoveError(null);
    try {
      await updateExclusion.mutateAsync({
        claimCategory: claimCategory.claim_category,
        useForRec: true,
      });
    } catch (err) {
      setRemoveError(getErrorMessage(err, 'Could not remove the exclusion.'));
    }
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
            placeholder="Search claim category"
            aria-label="Search excluded claim categories"
            className="w-64 pl-8"
          />
        </div>

        <Button onClick={() => setAddOpen(true)}>Add exclusion</Button>
      </div>

      {removeError ? (
        <p className="mb-3 text-[13px] font-bold text-red">{removeError}</p>
      ) : null}

      <div className="min-h-0 flex-1">
        <ClaimCategoryExclusionsTable
          page={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isFetching={isFetching}
          onRemove={removeExclusion}
          removingCode={
            updateExclusion.isPending
              ? updateExclusion.variables?.claimCategory
              : null
          }
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

      <AddClaimCategoryExclusionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}
