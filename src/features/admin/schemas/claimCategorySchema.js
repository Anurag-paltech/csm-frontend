import { z } from 'zod';

// `claim_category` here is the Data Management exclusion-list entity —
// unrelated to the SRT query form's `claim_category` field (truck/engine),
// despite sharing a name.
export const addClaimCategoryExclusionSchema = z.object({
  claim_category: z
    .string()
    .trim()
    .min(1, 'Claim category is required')
    .max(50, 'Claim category must be 50 characters or fewer'),
});

export const addClaimCategoryExclusionDefaultValues = {
  claim_category: '',
};
