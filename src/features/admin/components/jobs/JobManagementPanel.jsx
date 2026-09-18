import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useRunClaimsSync, useRunSrtSync } from "@/features/admin/hooks/useJobs";
import { JobResultModal } from "@/features/admin/components/jobs/JobResultModal";
import { SyncLogsPanel } from "@/features/admin/components/jobs/SyncLogsPanel";

function JobRow({ name, description, run }) {
  const [resultOpen, setResultOpen] = useState(false);

  const trigger = () => {
    setResultOpen(true);
    run.mutate();
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface px-4.5 py-3.5">
      <div>
        <p className="font-display text-[13.5px] font-bold text-navy">
          {name}
        </p>
        <p className="mt-0.5 text-[12.5px] text-ink-3">{description}</p>
      </div>
      <Button onClick={trigger} disabled={run.isPending} className="shrink-0">
        {run.isPending ? (
          <>
            <Spinner className="h-3.5 w-3.5" />
            Queuing…
          </>
        ) : (
          "Trigger"
        )}
      </Button>

      <JobResultModal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title={name}
        isPending={run.isPending}
        isSuccess={run.isSuccess}
        error={run.error}
      />
    </div>
  );
}

/**
 * Admin → Job Management. Each job is a one-shot POST to a Function-app
 * trigger route (202 = queued, not the finished result) — Sync Logs below
 * is where the actual progress/outcome shows up.
 */
export function JobManagementPanel() {
  const claimsSync = useRunClaimsSync();
  const srtSync = useRunSrtSync();

  return (
    <div className="flex h-full flex-col gap-5 p-5.5">
      <div className="flex shrink-0 flex-col gap-3">
        <JobRow
          name="Claims Sync"
          description="Runs a full claims sync on the Function app (default params, no scoping)."
          run={claimsSync}
        />
        <JobRow
          name="SRT Sync"
          description="Runs a full SRT operation codes bulk refresh."
          run={srtSync}
        />
      </div>

      <SyncLogsPanel />
    </div>
  );
}
