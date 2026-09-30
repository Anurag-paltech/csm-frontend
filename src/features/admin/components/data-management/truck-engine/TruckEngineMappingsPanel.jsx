import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pager } from "@/components/ui/Pager";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTruckEngineMappings } from "@/features/admin/hooks/useTruckEngineMappings";
import { MODEL_NAME_LABELS } from "@/features/admin/schemas/truckEngineMappingSchema";
import { TruckEngineMappingsTable } from "@/features/admin/components/data-management/truck-engine/TruckEngineMappingsTable";
import { TruckEngineMappingFormModal } from "@/features/admin/components/data-management/truck-engine/TruckEngineMappingFormModal";
import { DeleteTruckEngineMappingModal } from "@/features/admin/components/data-management/truck-engine/DeleteTruckEngineMappingModal";

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
 * Admin → Data Management → Truck/Engine Mapping. Maps claim-history model
 * names to SRT list model names. Full CRUD.
 */
export function TruckEngineMappingsPanel() {
  const [search, setSearch] = useState("");
  const [modelName, setModelName] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [formTarget, setFormTarget] = useState(null); // { mapping } | { mapping: null } | null
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const q = debouncedSearch.length >= MIN_SEARCH_CHARS ? debouncedSearch : "";

  const { data, isLoading, isError, error, isFetching, refetch } =
    useTruckEngineMappings({
      limit: pageSize,
      offset,
      model_name: modelName || undefined,
      q: q || undefined,
    });

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
  };
  const onModelNameChange = (e) => {
    setModelName(e.target.value);
    setOffset(0);
  };
  const onPageSizeChange = (n) => {
    setPageSize(n);
    setOffset(0);
  };

  return (
    <div className="flex h-full flex-col p-5.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input
              type="search"
              value={search}
              onChange={onSearchChange}
              placeholder="Search models"
              aria-label="Search model mappings"
              className="w-64 pl-8"
            />
          </div>

          <Select
            value={modelName}
            onChange={onModelNameChange}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {Object.entries(MODEL_NAME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={() => setFormTarget({ mapping: null })}>
          Add mapping
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <TruckEngineMappingsTable
          page={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isFetching={isFetching}
          onEdit={(mapping) => setFormTarget({ mapping })}
          onDelete={setDeleteTarget}
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

      <TruckEngineMappingFormModal
        open={formTarget !== null}
        mapping={formTarget?.mapping ?? null}
        onClose={() => setFormTarget(null)}
      />

      <DeleteTruckEngineMappingModal
        mapping={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
