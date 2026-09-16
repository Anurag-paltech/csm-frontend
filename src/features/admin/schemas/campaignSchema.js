import { z } from 'zod';

export const addExclusionSchema = z.object({
  campaign_code: z.string().trim().min(1, 'Campaign code is required'),
});

export const addExclusionDefaultValues = {
  campaign_code: '',
};
