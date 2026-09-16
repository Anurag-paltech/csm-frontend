import { z } from 'zod';

export const dealerSchema = z.object({
  dealer_code: z.string().trim().min(1, 'Dealer code is required'),
  dealer_family_code: z.string().trim(),
  branch: z.string().trim().min(1, 'Branch is required'),
  branch_code: z.string().trim().min(1, 'Branch code is required'),
  region: z.string().trim().min(1, 'Region is required'),
});

export const dealerDefaultValues = {
  dealer_code: '',
  dealer_family_code: '',
  branch: '',
  branch_code: '',
  region: '',
};

/** Map a dealer row to form values (for editing an existing dealer). */
export function dealerToFormValues(dealer) {
  if (!dealer) return dealerDefaultValues;
  return {
    dealer_code: dealer.dealer_code ?? '',
    dealer_family_code: dealer.dealer_family_code ?? '',
    branch: dealer.branch ?? '',
    branch_code: dealer.branch_code ?? '',
    region: dealer.region ?? '',
  };
}
