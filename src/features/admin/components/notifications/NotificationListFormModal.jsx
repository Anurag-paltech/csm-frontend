import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { getErrorMessage } from "@/lib/apiError";
import {
  notificationListSchema,
  notificationListDefaultValues,
  notificationListToFormValues,
} from "@/features/admin/schemas/notificationListSchema";
import { useUpdateNotificationList } from "@/features/admin/hooks/useNotificationLists";

/**
 * Edit a notification list's recipients. `title` is fixed — there's no
 * create/delete for these, only editing the `email_list` on an existing row.
 */
export function NotificationListFormModal({ open, list, onClose }) {
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notificationListSchema),
    values: notificationListToFormValues(list),
    defaultValues: notificationListDefaultValues,
  });

  const updateList = useUpdateNotificationList();

  const close = () => {
    reset(notificationListDefaultValues);
    setFormError(null);
    onClose();
  };

  const submit = async ({ email_list }) => {
    setFormError(null);
    try {
      await updateList.mutateAsync({ id: list.id, emailList: email_list });
      close();
    } catch (err) {
      setFormError(
        getErrorMessage(err, "Could not save the notification list."),
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={list ? `Edit "${list.title}"` : "Edit notification list"}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="Recipients"
          htmlFor="email_list"
          required
          error={errors.email_list?.message}
          hint="Comma-separated email addresses"
        >
          <Textarea
            id="email_list"
            className="min-h-30"
            invalid={Boolean(errors.email_list)}
            {...register("email_list")}
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
            disabled={updateList.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateList.isPending}>
            {updateList.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
