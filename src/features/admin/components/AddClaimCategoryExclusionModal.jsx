import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { getErrorMessage } from '@/lib/apiError';
import {
  addClaimCategoryExclusionSchema,
  addClaimCategoryExclusionDefaultValues,
} from '@/features/admin/schemas/claimCategorySchema';
import { useUpdateClaimCategoryExclusion } from '@/features/admin/hooks/useClaimCategoryExclusions';

/**
 * Excludes an existing claim category from recommendations
 * (`use_for_rec: false`). There's no "create" endpoint — the code must
 * already exist, so a typo or unknown code surfaces the backend's 404 as a
 * form error.
 */
export function AddClaimCategoryExclusionModal({ open, onClose }) {
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addClaimCategoryExclusionSchema),
    defaultValues: addClaimCategoryExclusionDefaultValues,
  });

  const updateExclusion = useUpdateClaimCategoryExclusion();

  const close = () => {
    reset(addClaimCategoryExclusionDefaultValues);
    setFormError(null);
    onClose();
  };

  const submit = async ({ claim_category }) => {
    setFormError(null);
    try {
      await updateExclusion.mutateAsync({
        claimCategory: claim_category,
        useForRec: false,
      });
      close();
    } catch (err) {
      setFormError(
        err?.status === 404
          ? 'No claim category with that name exists.'
          : getErrorMessage(err, 'Could not add the exclusion.'),
      );
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add exclusion">
      <form onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="Claim category"
          htmlFor="claim_category"
          required
          error={errors.claim_category?.message}
        >
          <Input
            id="claim_category"
            invalid={Boolean(errors.claim_category)}
            {...register('claim_category')}
          />
        </FormField>

        {formError ? (
          <p className="mt-3 text-[13px] font-bold text-red">{formError}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={close}
            disabled={updateExclusion.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateExclusion.isPending}>
            {updateExclusion.isPending ? 'Adding…' : 'Add exclusion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
