import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { getErrorMessage } from "@/lib/apiError";
import {
  dealerSchema,
  dealerDefaultValues,
  dealerToFormValues,
} from "@/features/admin/schemas/dealerSchema";
import {
  useCreateDealer,
  useUpdateDealer,
} from "@/features/admin/hooks/useDealers";

/**
 * Add/edit a dealer. Pass `dealer` to edit an existing row, or omit it to
 * create a new one. `onClose` is called after a successful save.
 */
export function DealerFormModal({ open, dealer, onClose }) {
  const isEdit = Boolean(dealer);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dealerSchema),
    values: dealerToFormValues(dealer),
    defaultValues: dealerDefaultValues,
  });

  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const isPending = createDealer.isPending || updateDealer.isPending;

  const close = () => {
    reset(dealerDefaultValues);
    setFormError(null);
    onClose();
  };

  const submit = async (values) => {
    setFormError(null);
    try {
      if (isEdit) {
        // dealer_code / dealer_family_code are fixed at creation — never sent on update.
        const { branch, branch_code, region } = values;
        await updateDealer.mutateAsync({
          dealerId: dealer.dealer_id,
          body: { branch, branch_code, region },
        });
      } else {
        await createDealer.mutateAsync(values);
      }
      close();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the dealer."));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? "Edit dealer" : "Add dealer"}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Dealer code"
            htmlFor="dealer_code"
            required
            error={errors.dealer_code?.message}
            hint={isEdit ? "Can't be changed" : undefined}
          >
            <Input
              id="dealer_code"
              maxLength={100}
              disabled={isEdit}
              invalid={Boolean(errors.dealer_code)}
              {...register("dealer_code")}
            />
          </FormField>

          <FormField
            label="Dealer family code"
            htmlFor="dealer_family_code"
            required
            error={errors.dealer_family_code?.message}
            hint={isEdit ? "Can't be changed" : undefined}
          >
            <Input
              id="dealer_family_code"
              maxLength={50}
              disabled={isEdit}
              invalid={Boolean(errors.dealer_family_code)}
              {...register("dealer_family_code")}
            />
          </FormField>

          <FormField
            label="Branch"
            htmlFor="branch"
            error={errors.branch?.message}
          >
            <Input
              id="branch"
              maxLength={50}
              invalid={Boolean(errors.branch)}
              {...register("branch")}
            />
          </FormField>

          <FormField
            label="Branch code"
            htmlFor="branch_code"
            error={errors.branch_code?.message}
          >
            <Input
              id="branch_code"
              maxLength={10}
              invalid={Boolean(errors.branch_code)}
              {...register("branch_code")}
            />
          </FormField>

          <FormField
            label="Region"
            htmlFor="region"
            className="col-span-full"
            error={errors.region?.message}
          >
            <Input
              id="region"
              maxLength={50}
              invalid={Boolean(errors.region)}
              {...register("region")}
            />
          </FormField>
        </div>

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
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add dealer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
