import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pager } from "@/components/ui/Pager";
import { getErrorMessage } from "@/lib/apiError";
import env from "@/config/env";
import { CLAIM_CATEGORY_LABELS } from "@/features/srt/schemas/querySchema";
import { useUpdateSelection } from "@/features/srt/hooks/useSrtRecommendation";

const BAND_TONE = { high: "green", medium: "blue", low: "neutral" };
const BAND_LABEL = { high: "High", medium: "Medium", low: "Low" };

const hoursOf = (item) => Number(item.hours) || 0;
const confidencePct = (item) => Math.round((item.confidence_score ?? 0) * 100);
const bandKey = (item) => item.confidence_band?.toLowerCase();

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function Chip({ k, children, title }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] shadow-card">
      <span className="font-display text-[9.5px] font-bold uppercase tracking-[0.09em] text-ink-3">
        {k}
      </span>
      <b
        className="max-w-60 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-ink"
        title={title ?? (typeof children === "string" ? children : undefined)}
      >
        {children}
      </b>
    </span>
  );
}

function QueryChips({ query, onEdit }) {
  if (!query) return null;
  const engine =
    query.engine_make || query.engine_model
      ? `${query.engine_make ?? ""} ${query.engine_model ?? ""}`.trim()
      : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip k="Category">
        {CLAIM_CATEGORY_LABELS[query.claim_category] ?? query.claim_category}
      </Chip>
      <Chip k="Truck model">{query.truck_model}</Chip>
      {engine ? <Chip k="Engine">{engine}</Chip> : null}
      <Chip k="VIN">{query.vin}</Chip>
      <Chip k="Causal part">{query.causal_part_number}</Chip>
      <Chip
        k="Dealer / RO"
        title={`${query.dealer_code} · ${query.repair_order_number}`}
      >
        {query.dealer_code} · {query.repair_order_number}
      </Chip>
      {onEdit ? (
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit query
        </Button>
      ) : null}
    </div>
  );
}

function ChevronIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SourceMultiSelect({ options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const label = selected.size === 0 ? "Source" : `Source (${selected.size})`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-sm border px-2 py-1.5 text-[12.5px] transition-colors ${
          selected.size > 0
            ? "border-blue-border bg-blue-soft text-blue"
            : "border-line-2 bg-surface text-ink-2 hover:border-ink-3"
        }`}
      >
        {label}
        <ChevronIcon
          className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-40 rounded-md border border-line bg-surface p-1.5 shadow-pop">
          {options.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-ink hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={selected.has(s)}
                onChange={() => onToggle(s)}
                className="h-3.5 w-3.5 accent-blue"
              />
              {s}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DEFAULT_PAGE_SIZE = 10;

const COLS = [
  "",
  "SRT Code",
  "Description",
  "STD hours",
  "Confidence",
  "Source",
  "",
];
const th =
  "sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.09em] text-navy text-left";
const td = "border-b border-line px-3.5 py-3 align-middle";

export function RecommendationsResult({
  recommendation,
  onEditQuery,
  onBack,
  backLabel = "Back to query",
  onContinue,
}) {
  const items = useMemo(
    () => recommendation.items ?? [],
    [recommendation.items],
  );
  const noMatch = items.length === 0;

  const [selected, setSelected] = useState(
    () => new Set(items.filter((i) => i.selected).map((i) => i.srt_code)),
  );
  const [filter, setFilter] = useState("");
  const [minConfidence, setMinConfidence] = useState(env.defaultMinConfidence);
  const [minHours, setMinHours] = useState(env.defaultMinHours);
  const [selectedSources, setSelectedSources] = useState(() => new Set());
  const [expanded, setExpanded] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const onFilterChange = (e) => {
    setFilter(e.target.value);
    setOffset(0);
  };
  const onMinConfidenceChange = (e) => {
    const raw = Number(e.target.value);
    setMinConfidence(
      Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0,
    );
    setOffset(0);
  };
  const onMinHoursChange = (e) => {
    setMinHours(e.target.value);
    setOffset(0);
  };
  const toggleSource = (source) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
    setOffset(0);
  };

  const updateSelection = useUpdateSelection(recommendation.recommendation_id);

  const sourceOptions = useMemo(() => {
    const set = new Set();
    items.forEach((i) => (i.sources ?? []).forEach((s) => set.add(s)));
    return [...set].sort();
  }, [items]);

  const hasActiveFilters =
    Boolean(filter) ||
    minConfidence !== env.defaultMinConfidence ||
    minHours !== env.defaultMinHours ||
    selectedSources.size > 0;

  const clearFilters = () => {
    setFilter("");
    setMinConfidence(env.defaultMinConfidence);
    setMinHours(env.defaultMinHours);
    setSelectedSources(new Set());
    setOffset(0);
  };

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const minHoursNum = minHours === "" ? null : Number(minHours);
    const filtered = items.filter((i) => {
      if (q && !`${i.srt_code} ${i.description}`.toLowerCase().includes(q)) {
        return false;
      }
      if (confidencePct(i) < minConfidence) return false;
      if (
        selectedSources.size > 0 &&
        !(i.sources ?? []).some((s) => selectedSources.has(s))
      ) {
        return false;
      }
      if (minHoursNum != null && minHoursNum > 0) {
        if (i.hours == null || Number(i.hours) < minHoursNum) return false;
      }
      return true;
    });
    return [...filtered].sort(
      (a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0),
    );
  }, [items, filter, minConfidence, minHours, selectedSources]);

  const paged = useMemo(
    () => visible.slice(offset, offset + pageSize),
    [visible, offset, pageSize],
  );

  const selectedItems = items.filter((i) => selected.has(i.srt_code));
  const totalHours = selectedItems.reduce((sum, i) => sum + hoursOf(i), 0);

  const toggle = (code) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const handleContinue = async () => {
    const codes = items
      .filter((i) => selected.has(i.srt_code))
      .map((i) => i.srt_code);
    try {
      const updated = await updateSelection.mutateAsync(codes);
      onContinue(updated);
    } catch {
      // shown below
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <QueryChips query={recommendation.query} onEdit={onEditQuery} />

      {noMatch ? (
        <div className="flex items-center gap-3 rounded-md border border-navy-border border-l-4 border-l-navy bg-navy-soft px-5 py-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 flex-none text-blue"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v5h1" />
          </svg>
          <div>
            <p className="font-display text-[14px] font-bold text-navy">
              No confident match found
            </p>
            <p className="text-[12.5px] text-ink-2">
              {recommendation.clarification_needed ||
                "Add detail to the repair story or check the causal part, then resubmit."}
            </p>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onBack}>
            {backLabel}
          </Button>
        </div>
      ) : (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-line px-5.5 py-1.75">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                value={filter}
                onChange={onFilterChange}
                placeholder="Filter by code or description"
                aria-label="Filter recommendations"
                className="w-56 rounded-sm border border-line-2 bg-surface py-1.5 pl-7 pr-2 text-[12.5px] text-ink focus:border-light-blue focus:outline-none focus:ring focus:ring-light-blue-soft"
              />
            </div>

            <div className="flex items-center gap-1 rounded-sm border border-line-2 bg-surface px-2 py-1.5 focus-within:border-light-blue focus-within:ring focus-within:ring-light-blue-soft">
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.07em] text-ink-3">
                Min confidence
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={minConfidence}
                onChange={onMinConfidenceChange}
                aria-label="Minimum confidence percent"
                className="w-8 border-0 bg-transparent p-0 text-[12.5px] text-ink [appearance:textfield] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-ink-3">%</span>
            </div>

            <div className="flex items-center gap-1 rounded-sm border border-line-2 bg-surface px-2 py-1.5 focus-within:border-light-blue focus-within:ring focus-within:ring-light-blue-soft">
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.07em] text-ink-3">
                Min hours
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={minHours}
                onChange={onMinHoursChange}
                placeholder="0.0"
                aria-label="Minimum standard hours"
                className="w-10 border-0 bg-transparent p-0 text-[12.5px] text-ink [appearance:textfield] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-ink-3">hrs</span>
            </div>

            {sourceOptions.length > 0 ? (
              <SourceMultiSelect
                options={sourceOptions}
                selected={selectedSources}
                onToggle={toggleSource}
              />
            ) : null}

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {COLS.map((c, i) => (
                    <th key={i} className={th}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS.length}
                      className="px-3.5 py-10 text-center text-[13px] text-ink-3"
                    >
                      No codes match that filter.
                    </td>
                  </tr>
                ) : (
                  paged.map((item) => {
                    const isOpen = expanded === item.srt_code;
                    return (
                      <FragmentRow
                        key={item.srt_code}
                        item={item}
                        checked={selected.has(item.srt_code)}
                        onToggle={() => toggle(item.srt_code)}
                        open={isOpen}
                        onWhy={() => setExpanded(isOpen ? null : item.srt_code)}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {visible.length > 0 ? (
            <div className="shrink-0 border-t border-line px-5.5 pb-2.5">
              <Pager
                total={visible.length}
                pageSize={pageSize}
                offset={offset}
                hasMore={offset + pageSize < visible.length}
                onOffsetChange={setOffset}
                onPageSizeChange={(n) => {
                  setPageSize(n);
                  setOffset(0);
                }}
              />
            </div>
          ) : null}

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-5.5 py-3">
            <span className="text-[13px] text-ink-2">
              {selected.size === 0 ? (
                "No codes selected"
              ) : (
                <>
                  <b className="font-bold text-navy">{selected.size}</b> of{" "}
                  {items.length} selected ·{" "}
                  <b className="font-bold text-navy">
                    {totalHours.toFixed(1)} hrs
                  </b>
                </>
              )}
            </span>
            <div className="flex items-center gap-2.5">
              {updateSelection.isError ? (
                <span className="text-[12px] font-bold text-red">
                  {getErrorMessage(
                    updateSelection.error,
                    "Could not save selection.",
                  )}
                </span>
              ) : null}
              <Button variant="secondary" onClick={onBack}>
                {backLabel}
              </Button>
              <Button
                onClick={handleContinue}
                disabled={selected.size === 0 || updateSelection.isPending}
              >
                {updateSelection.isPending
                  ? "Saving…"
                  : "Continue with selected"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function FragmentRow({ item, checked, onToggle, open, onWhy }) {
  return (
    <>
      <tr className="hover:bg-surface-2">
        <td className={`${td} text-center`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            aria-label={`Select ${item.srt_code}`}
            className="h-4 w-4 accent-blue"
          />
        </td>
        <td
          className={`${td} whitespace-nowrap font-display font-bold text-navy`}
        >
          {item.srt_code}
        </td>
        <td className={td}>{item.description}</td>
        <td className={`${td} whitespace-nowrap tabular-nums font-bold`}>
          {item.hours == null ? "—" : `${hoursOf(item).toFixed(1)} hrs`}
        </td>
        <td className={td}>
          <Badge tone={BAND_TONE[bandKey(item)] ?? "neutral"}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {BAND_LABEL[bandKey(item)] ?? item.confidence_band} ·{" "}
            {confidencePct(item)}%
          </Badge>
        </td>
        <td className={td}>
          <span className="whitespace-nowrap rounded-sm border border-line bg-surface-2 px-2 py-1 text-[11px] text-ink-2">
            {(item.sources ?? []).join(", ") || "—"}
          </span>
        </td>
        <td className={`${td} text-right`}>
          <button
            type="button"
            onClick={onWhy}
            aria-expanded={open}
            className="inline-flex items-center gap-1 rounded-sm px-2 py-1 font-display text-[12px] font-bold text-ink-3 hover:bg-blue-soft hover:text-blue"
          >
            Why
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </td>
      </tr>
      {open ? (
        <tr>
          <td
            colSpan={7}
            className="border-b border-blue-border bg-blue-soft px-12 py-3.5"
          >
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-blue">
              Why this code
            </div>
            <p className="mt-1 max-w-225 text-[13px] leading-[1.6] text-ink">
              {item.explanation}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
