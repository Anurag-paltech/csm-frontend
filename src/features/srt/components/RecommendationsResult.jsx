import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pager } from '@/components/ui/Pager';
import { getErrorMessage } from '@/lib/apiError';
import { CLAIM_CATEGORY_LABELS } from '@/features/srt/schemas/querySchema';
import { useUpdateSelection } from '@/features/srt/hooks/useSrtRecommendation';

const BAND_TONE = { high: 'green', medium: 'blue', low: 'neutral' };
const BAND_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };

const hoursOf = (item) => Number(item.hours) || 0;
const confidencePct = (item) => Math.round((item.confidence_score ?? 0) * 100);
const bandKey = (item) => item.confidence_band?.toLowerCase();

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function Chip({ k, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] shadow-card">
      <span className="font-display text-[9.5px] font-bold uppercase tracking-[0.09em] text-ink-3">
        {k}
      </span>
      <b className="font-bold text-ink">{children}</b>
    </span>
  );
}

function QueryChips({ query, onEdit }) {
  if (!query) return null;
  const engine =
    query.engine_make || query.engine_model
      ? `${query.engine_make ?? ''} ${query.engine_model ?? ''}`.trim()
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
      <Chip k="Dealer / RO">
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

const DEFAULT_PAGE_SIZE = 10;

const COLS = ['', 'SRT code', 'Description', 'Std hours', 'Confidence', 'Source', ''];
const th =
  'sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.09em] text-navy text-left';
const td = 'border-b border-line px-3.5 py-3 align-middle';

/**
 * Recommendations screen — filterable table with checkbox selection and an
 * expandable "why". "Continue with selected" PATCHes the selection, then hands
 * the updated recommendation up via `onContinue`.
 */
export function RecommendationsResult({
  recommendation,
  onEditQuery,
  onBack,
  backLabel = 'Back to query',
  onContinue,
}) {
  const items = useMemo(
    () => recommendation.items ?? [],
    [recommendation.items],
  );
  // Keyed off having no items rather than a specific `status` string, so this
  // shows for any "nothing to review" response — the backend's exact status
  // value for that case has changed before and may again.
  const noMatch = items.length === 0;

  const [selected, setSelected] = useState(
    () => new Set(items.filter((i) => i.selected).map((i) => i.srt_code)),
  );
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const onFilterChange = (e) => {
    setFilter(e.target.value);
    setOffset(0);
  };

  const updateSelection = useUpdateSelection(recommendation.recommendation_id);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? items.filter((i) =>
          `${i.srt_code} ${i.description}`.toLowerCase().includes(q),
        )
      : items;
    return [...filtered].sort(
      (a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0),
    );
  }, [items, filter]);

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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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
                'Add detail to the repair story or check the causal part, then resubmit.'}
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
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line px-5.5 py-3">
            <span className="font-display text-[13.5px] font-bold text-navy">
              {items.length} recommended {items.length === 1 ? 'code' : 'codes'}
            </span>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
              <Input
                type="search"
                value={filter}
                onChange={onFilterChange}
                placeholder="Filter by code or description"
                aria-label="Filter recommendations"
                className="w-64 pl-8"
              />
            </div>
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
                        onWhy={() =>
                          setExpanded(isOpen ? null : item.srt_code)
                        }
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {visible.length > 0 ? (
            <div className="shrink-0 border-t border-line px-5.5 py-2.5">
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
                'No codes selected'
              ) : (
                <>
                  <b className="font-bold text-navy">{selected.size}</b> of{' '}
                  {items.length} selected ·{' '}
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
                    'Could not save selection.',
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
                  ? 'Saving…'
                  : 'Continue with selected'}
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
        <td className={`${td} whitespace-nowrap font-display font-bold text-navy`}>
          {item.srt_code}
        </td>
        <td className={td}>{item.description}</td>
        <td className={`${td} whitespace-nowrap tabular-nums font-bold`}>
          {item.hours == null ? '—' : `${hoursOf(item).toFixed(1)} hrs`}
        </td>
        <td className={td}>
          <Badge tone={BAND_TONE[bandKey(item)] ?? 'neutral'}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {BAND_LABEL[bandKey(item)] ?? item.confidence_band} ·{' '}
            {confidencePct(item)}%
          </Badge>
        </td>
        <td className={td}>
          <span className="whitespace-nowrap rounded-sm border border-line bg-surface-2 px-2 py-1 text-[11px] text-ink-2">
            {(item.sources ?? []).join(', ') || '—'}
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
              className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
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
            <p className="mt-1 max-w-[900px] text-[13px] leading-[1.6] text-ink">
              {item.explanation}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
