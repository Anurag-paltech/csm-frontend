import { Select } from '@/components/ui/Select';

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

/** 1-indexed page numbers with ellipses, mirroring the mockup pager. */
function pageList(current, count) {
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const nums = [1];
  if (current > 3) nums.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(count - 1, current + 1); i += 1) {
    nums.push(i);
  }
  if (current < count - 2) nums.push('…');
  nums.push(count);
  return nums;
}

const pgBase =
  'font-display h-[30px] min-w-[30px] rounded-sm border px-2.25 text-[12.5px] font-bold transition-colors';
const pgIdle =
  'border-line-2 bg-surface text-ink-2 hover:border-blue-border hover:bg-blue-soft hover:text-blue';
const pgCurrent = 'border-blue bg-blue text-white';
const pgDisabled = 'border-line-2 bg-surface text-ink-2 opacity-40 cursor-not-allowed';

/**
 * Offset-based pager. Drive it with `offset` / `pageSize` state; `total` and
 * `hasMore` come from the server's `Page` envelope.
 */
export function Pager({
  total,
  pageSize,
  offset,
  hasMore,
  onOffsetChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.floor(offset / pageSize) + 1;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(total, offset + pageSize);

  const goToPage = (n) => onOffsetChange((n - 1) * pageSize);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3.5">
      <div className="text-[12.5px] text-ink-3">
        Showing <b className="font-bold text-ink">{from}–{to}</b> of{' '}
        <b className="font-bold text-ink">{total}</b>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.75 text-[12.5px] text-ink-3">
          Rows
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-1.75 py-1.25 text-[12.5px]"
          >
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => onOffsetChange(Math.max(0, offset - pageSize))}
            disabled={offset === 0}
            className={`${pgBase} ${offset === 0 ? pgDisabled : pgIdle}`}
          >
            ‹
          </button>

          {pageList(current, pageCount).map((n, i) =>
            n === '…' ? (
              <span key={`gap-${i}`} className="px-0.75 text-[12.5px] text-ink-3">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === current ? 'page' : undefined}
                onClick={() => goToPage(n)}
                className={`${pgBase} ${n === current ? pgCurrent : pgIdle}`}
              >
                {n}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            onClick={() => onOffsetChange(offset + pageSize)}
            disabled={!hasMore}
            className={`${pgBase} ${!hasMore ? pgDisabled : pgIdle}`}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
