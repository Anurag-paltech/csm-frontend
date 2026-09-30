import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/apiError";
import { MODEL_NAME_LABELS } from "@/features/admin/schemas/truckEngineMappingSchema";
import { useDeleteTruckEngineMapping } from "@/features/admin/hooks/useTruckEngineMappings";

/** Confirm-then-delete for a truck/engine mapping. Open while `mapping` is set. */
export function DeleteTruckEngineMappingModal({ mapping, onClose }) {
  const [error, setError] = useState(null);
  const deleteMapping = useDeleteTruckEngineMapping();

  const close = () => {
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setError(null);
    try {
      await deleteMapping.mutateAsync(mapping.id);
      close();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the mapping."));
    }
  };

  return (
    <Modal open={Boolean(mapping)} onClose={close} title="Delete model mapping">
      {mapping ? (
        <p className="text-sm text-ink-2">
          Delete the {MODEL_NAME_LABELS[mapping.model_name]?.toLowerCase()}{" "}
          mapping{" "}
          <span className="font-display font-bold text-navy">
            {mapping.claim_history_model}
          </span>{" "}
          →{" "}
          <span className="font-display font-bold text-navy">
            {mapping.srt_list_model}
          </span>
          ? This can't be undone.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-[13px] font-bold text-red">{error}</p>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={close}
          disabled={deleteMapping.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={confirm}
          disabled={deleteMapping.isPending}
        >
          {deleteMapping.isPending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
