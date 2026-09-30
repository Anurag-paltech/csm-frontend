import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { getErrorMessage } from "@/lib/apiError";
import { adminApi } from "@/features/admin/api/adminApi";
import {
  MODEL_NAME_LABELS,
  truckEngineMappingSchema,
  truckEngineMappingDefaultValues,
  truckEngineMappingToFormValues,
} from "@/features/admin/schemas/truckEngineMappingSchema";
import {
  useCreateTruckEngineMapping,
  useUpdateTruckEngineMapping,
} from "@/features/admin/hooks/useTruckEngineMappings";

/**
 * The backend allows duplicate (model_name, claim_history_model) pairs, so
 * look one up before saving and let the admin confirm. Returns the existing
 * row, or null.
 */
async function findDuplicate({ model_name, claim_history_model }, selfId) {
  const { items = [] } = await adminApi.listTruckEngineMappings({
    limit: 200,
    model_name,
    q: claim_history_model,
  });
  const needle = claim_history_model.toLowerCase();
  return (
    items.find(
      (m) =>
        m.id !== selfId && m.claim_history_model?.toLowerCase() === needle,
    ) ?? null
  );
}

/**
 * Add/edit a truck/engine model mapping. Pass `mapping` to edit an existing
 * row, or omit it to create one. Update is a full replace, so all three
 * fields are always sent.
 */
export function TruckEngineMappingFormModal({ open, mapping, onClose }) {
  const isEdit = Boolean(mapping);
  const [formError, setFormError] = useState(null);
  // The duplicate row found on the last submit; a second submit saves anyway.
  const [duplicate, setDuplicate] = useState(null);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(truckEngineMappingSchema),
    values: truckEngineMappingToFormValues(mapping),
    defaultValues: truckEngineMappingDefaultValues,
  });

  const createMapping = useCreateTruckEngineMapping();
  const updateMapping = useUpdateTruckEngineMapping();
  const isPending =
    checking || createMapping.isPending || updateMapping.isPending;

  const close = () => {
    reset(truckEngineMappingDefaultValues);
    setFormError(null);
    setDuplicate(null);
    onClose();
  };

  const submit = async (values) => {
    setFormError(null);
    try {
      if (!duplicate) {
        setChecking(true);
        const dup = await findDuplicate(values, mapping?.id).finally(() =>
          setChecking(false),
        );
        if (dup) {
          setDuplicate(dup);
          return;
        }
      }
      if (isEdit) {
        await updateMapping.mutateAsync({ id: mapping.id, body: values });
      } else {
        await createMapping.mutateAsync(values);
      }
      close();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the mapping."));
    }
  };

  // Any edit to the key fields invalidates a previous duplicate warning.
  const clearDuplicate = () => setDuplicate(null);

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? "Edit model mapping" : "Add model mapping"}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            label="Type"
            htmlFor="model_name"
            required
            error={errors.model_name?.message}
          >
            <Select
              id="model_name"
              className="w-full"
              invalid={Boolean(errors.model_name)}
              {...register("model_name", { onChange: clearDuplicate })}
            >
              {Object.entries(MODEL_NAME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Claim history model"
            htmlFor="claim_history_model"
            required
            error={errors.claim_history_model?.message}
          >
            <Input
              id="claim_history_model"
              maxLength={100}
              invalid={Boolean(errors.claim_history_model)}
              {...register("claim_history_model", { onChange: clearDuplicate })}
            />
          </FormField>

          <FormField
            label="SRT list model"
            htmlFor="srt_list_model"
            required
            error={errors.srt_list_model?.message}
          >
            <Input
              id="srt_list_model"
              maxLength={255}
              invalid={Boolean(errors.srt_list_model)}
              {...register("srt_list_model")}
            />
          </FormField>
        </div>

        {duplicate ? (
          <p className="mt-3 rounded-sm border border-blue-border bg-blue-soft px-3 py-2 text-[13px] text-navy">
            A {MODEL_NAME_LABELS[duplicate.model_name]?.toLowerCase()} mapping
            for “{duplicate.claim_history_model}” already exists (→{" "}
            {duplicate.srt_list_model}). Save again to add it anyway.
          </p>
        ) : null}

        {formError ? (
          <p className="mt-3 text-[13px] font-bold text-red">{formError}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={close}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : duplicate
                ? "Save anyway"
                : isEdit
                  ? "Save changes"
                  : "Add mapping"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
