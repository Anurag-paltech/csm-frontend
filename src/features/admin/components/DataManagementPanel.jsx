import { useState } from 'react';
import { DealerCodesPanel } from '@/features/admin/components/DealerCodesPanel';
import { CampaignExclusionsPanel } from '@/features/admin/components/CampaignExclusionsPanel';
import { ClaimCategoryExclusionsPanel } from '@/features/admin/components/ClaimCategoryExclusionsPanel';
import { CrossRefPanel } from '@/features/admin/components/CrossRefPanel';

const SUBTABS = [
  { id: 'dealer', label: 'Dealer' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'claim-category', label: 'Claim Category' },
  { id: 'cross-ref', label: 'Cross Ref' },
];

/** Admin → Data Management. Sub-tabbed: Dealer, Campaign, Claim Category, Cross Ref. */
export function DataManagementPanel() {
  const [subtab, setSubtab] = useState('dealer');

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap gap-3 border-b border-line px-5.5 pt-3">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubtab(t.id)}
            aria-current={t.id === subtab ? 'page' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2 font-display text-[12.5px] font-bold transition-colors ${
              t.id === subtab
                ? 'border-blue text-navy'
                : 'border-transparent text-ink-3 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {subtab === 'dealer' ? (
          <DealerCodesPanel />
        ) : subtab === 'campaign' ? (
          <CampaignExclusionsPanel />
        ) : subtab === 'claim-category' ? (
          <ClaimCategoryExclusionsPanel />
        ) : (
          <CrossRefPanel />
        )}
      </div>
    </div>
  );
}
