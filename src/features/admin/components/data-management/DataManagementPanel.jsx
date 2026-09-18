import { useState } from "react";
import { DealerCodesPanel } from "@/features/admin/components/data-management/dealer/DealerCodesPanel";
import { CampaignExclusionsPanel } from "@/features/admin/components/data-management/campaign/CampaignExclusionsPanel";
import { ClaimCategoryExclusionsPanel } from "@/features/admin/components/data-management/claim-category/ClaimCategoryExclusionsPanel";
import { CrossRefPanel } from "@/features/admin/components/data-management/cross-ref/CrossRefPanel";

const SUBTABS = [
  { id: "dealer", label: "Dealer" },
  { id: "campaign", label: "Campaign Exclusion" },
  { id: "claim-category", label: "Claim Category Exclusion" },
  { id: "cross-ref", label: "SRT Cross Ref" },
];

/** Admin → Data Management. Sub-tabbed: Dealer, Campaign, Claim Category, Cross Ref. */
export function DataManagementPanel() {
  const [subtab, setSubtab] = useState("dealer");

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap gap-2 border-b border-line px-5.5 py-3">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubtab(t.id)}
            aria-current={t.id === subtab ? "page" : undefined}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 font-display text-[12.5px] font-bold transition-colors ${
              t.id === subtab
                ? "border-blue bg-blue-soft text-blue"
                : "border-line-2 bg-surface text-ink-3 hover:border-ink-3 hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {subtab === "dealer" ? (
          <DealerCodesPanel />
        ) : subtab === "campaign" ? (
          <CampaignExclusionsPanel />
        ) : subtab === "claim-category" ? (
          <ClaimCategoryExclusionsPanel />
        ) : (
          <CrossRefPanel />
        )}
      </div>
    </div>
  );
}
