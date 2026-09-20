import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/apiError";

/**
 * Feedback right after hitting "Trigger". The endpoint returns 202 as soon
 * as the job is queued, not its finished result — so on success this just
 * confirms the queue and points at Sync Logs for progress/outcome.
 */
export function JobResultModal({
  open,
  onClose,
  title,
  isPending,
  isSuccess,
  error,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {isPending ? (
        <div className="flex items-center justify-center gap-2.5 py-6 text-ink-3">
          <Spinner className="h-4 w-4" />
          Queuing…
        </div>
      ) : error ? (
        <p className="text-[13px] font-bold text-red">
          {getErrorMessage(error, "The job failed to queue.")}
        </p>
      ) : isSuccess ? (
        <p className="text-[13px] text-ink-2">
          Job queued. It may take a moment to start — check Sync Logs below for
          progress and results.
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
