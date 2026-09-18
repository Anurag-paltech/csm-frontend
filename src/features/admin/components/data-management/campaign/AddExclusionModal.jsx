import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { getErrorMessage } from '@/lib/apiError';
import {
  addExclusionSchema,
  addExclusionDefaultValues,
} from '@/features/admin/schemas/campaignSchema';
import { useUpdateCampaign } from '@/features/admin/hooks/useCampaigns';

/**
 * Excludes an existing campaign from recommendations (`use_for_rec: false`).
 * There's no "create campaign" endpoint — the code must already exist, so a
 * typo or unknown code surfaces the backend's 404 as a form error.
 */
export function AddExclusionModal({ open, onClose }) {
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addExclusionSchema),
    defaultValues: addExclusionDefaultValues,
  });

  const updateCampaign = useUpdateCampaign();

  const close = () => {
    reset(addExclusionDefaultValues);
    setFormError(null);
    onClose();
  };

  const submit = async ({ campaign_code }) => {
    setFormError(null);
    try {
      await updateCampaign.mutateAsync({
        campaignCode: campaign_code,
        useForRec: false,
      });
      close();
    } catch (err) {
      setFormError(
        err?.status === 404
          ? 'No campaign with that code exists.'
          : getErrorMessage(err, 'Could not add the exclusion.'),
      );
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add exclusion">
      <form onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="Campaign code"
          htmlFor="campaign_code"
          required
          error={errors.campaign_code?.message}
        >
          <Input
            id="campaign_code"
            maxLength={100}
            invalid={Boolean(errors.campaign_code)}
            {...register('campaign_code')}
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
            disabled={updateCampaign.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateCampaign.isPending}>
            {updateCampaign.isPending ? 'Adding…' : 'Add exclusion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
