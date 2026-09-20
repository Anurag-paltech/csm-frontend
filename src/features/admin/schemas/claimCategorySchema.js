import { z } from "zod";

export const addClaimCategoryExclusionSchema = z.object({
  claim_category: z
    .string()
    .trim()
    .min(1, "Claim category is required")
    .max(50, "Claim category must be 50 characters or fewer"),
});

export const addClaimCategoryExclusionDefaultValues = {
  claim_category: "",
};
