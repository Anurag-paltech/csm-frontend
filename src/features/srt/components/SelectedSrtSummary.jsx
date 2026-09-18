import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/apiError';
import { useUpdateSelection } from '@/features/srt/hooks/useSrtRecommendation';

const BAND_TONE = { high: 'green', medium: 'blue', low: 'neutral' };
const BAND_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
const hoursOf = (item) => Number(item.hours) || 0;
const confidencePct = (item) => Math.round((item.confidence_score ?? 0) * 100);
const bandKey = (item) => item.confidence_band?.toLowerCase();

const th =
  'sticky top-0 z-10 border-b border-line bg-surface-2 px-3.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.09em] text-navy text-left';
const td = 'border-b border-line px-3.5 py-3 align-middle';

function TrashIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" />
    </svg>
  );
}

export function SelectedSrtSummary({
  items,
  totalHours,
  recommendationId,
  onSelectionChange,
  onBack,
  onNewQuery,
}) {
  const [copied, setCopied] = useState(false);
  const updateSelection = useUpdateSelection(recommendationId);

  const copyForClaim = async () => {
    const lines = items.map(
      (i) => `${i.srt_code}\t${i.description}\t${hoursOf(i).toFixed(1)}`,
    );
    lines.push(`\tTotal\t${totalHours.toFixed(1)}`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const remove = async (code) => {
    const remaining = items
      .filter((i) => i.srt_code !== code)
      .map((i) => i.srt_code);
    try {
      const updated = await updateSelection.mutateAsync(remaining);
      onSelectionChange(updated);
    } catch {
      // shown below
    }
  };

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-5.5 py-3.25">
        <span className="font-display text-[13.5px] font-bold text-navy">
          {items.length} selected {items.length === 1 ? 'code' : 'codes'}
        </span>
        <Button variant="secondary" onClick={onBack}>
          Back to recommendations
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
          <p className="font-display text-[13.5px] font-bold text-navy">
            No codes selected
          </p>
          <p className="text-[13px] text-ink-3">
            Go back to the recommendations to pick SRT codes.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className={th}>SRT code</th>
                <th className={th}>Description</th>
                <th className={th}>Confidence</th>
                <th className={th}>Std hours</th>
                <th className={th} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.srt_code} className="hover:bg-surface-2">
                  <td className={`${td} whitespace-nowrap font-display font-bold text-navy`}>
                    {item.srt_code}
                  </td>
                  <td className={td}>{item.description}</td>
                  <td className={td}>
                    <Badge tone={BAND_TONE[bandKey(item)] ?? 'neutral'}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {BAND_LABEL[bandKey(item)] ?? item.confidence_band} ·{' '}
                      {confidencePct(item)}%
                    </Badge>
                  </td>
                  <td className={`${td} whitespace-nowrap tabular-nums font-bold`}>
                    {item.hours == null ? '—' : `${hoursOf(item).toFixed(1)} hrs`}
                  </td>
                  <td className={`${td} text-right`}>
                    <button
                      type="button"
                      onClick={() => remove(item.srt_code)}
                      disabled={updateSelection.isPending}
                      aria-label={`Remove ${item.srt_code}`}
                      className="rounded-sm p-1.5 text-ink-3 hover:bg-red-soft hover:text-red disabled:opacity-40"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="shrink-0 border-t border-line p-5.5">
        {updateSelection.isError ? (
          <p className="mb-3 text-[12px] font-bold text-red">
            {getErrorMessage(updateSelection.error, 'Could not update selection.')}
          </p>
        ) : null}

        <div className="flex items-center justify-between rounded-md bg-navy px-4.5 py-3.25 text-white">
          <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy-border">
            Total standard hours
          </span>
          <span className="font-display text-[18px] font-bold">
            {totalHours.toFixed(1)} hrs
          </span>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onNewQuery}>
            Start a new query
          </Button>
          <Button onClick={copyForClaim} disabled={items.length === 0}>
            {copied ? 'Copied' : 'Copy for claim system'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
