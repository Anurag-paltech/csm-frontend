import { z } from "zod";

export const addExclusionSchema = z.object({
  campaign_code: z
    .string()
    .trim()
    .min(1, "Campaign code is required")
    .max(100, "Campaign code must be 100 characters or fewer"),
});

export const addExclusionDefaultValues = {
  campaign_code: "",
};
