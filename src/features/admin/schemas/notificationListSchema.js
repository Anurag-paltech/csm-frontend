import { z } from "zod";

function splitEmails(value) {
  return value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export const notificationListSchema = z.object({
  email_list: z
    .string()
    .trim()
    .min(1, "At least one email is required")
    .superRefine((value, ctx) => {
      const emails = splitEmails(value);
      if (emails.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one email is required",
        });
        return;
      }
      const invalid = emails.filter(
        (e) => !z.string().email().safeParse(e).success,
      );
      if (invalid.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid email${invalid.length > 1 ? "s" : ""}: ${invalid.join(", ")}`,
        });
      }
    }),
});

export const notificationListDefaultValues = {
  email_list: "",
};

/** Map a notification list row to form values */
export function notificationListToFormValues(list) {
  if (!list) return notificationListDefaultValues;
  return { email_list: list.email_list ?? "" };
}
