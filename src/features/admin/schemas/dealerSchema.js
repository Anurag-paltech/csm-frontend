import { z } from "zod";

export const dealerSchema = z.object({
  dealer_code: z
    .string()
    .trim()
    .min(1, "Dealer code is required")
    .max(100, "Dealer code must be 100 characters or fewer"),
  dealer_family_code: z
    .string()
    .trim()
    .min(1, "Dealer family code is required")
    .max(50, "Dealer family code must be 50 characters or fewer"),
  branch: z.string().trim().max(50, "Branch must be 50 characters or fewer"),
  branch_code: z
    .string()
    .trim()
    .max(10, "Branch code must be 10 characters or fewer"),
  region: z.string().trim().max(50, "Region must be 50 characters or fewer"),
});

export const dealerDefaultValues = {
  dealer_code: "",
  dealer_family_code: "M450OG",
  branch: "",
  branch_code: "",
  region: "",
};

/** Map a dealer row to form values */
export function dealerToFormValues(dealer) {
  if (!dealer) return dealerDefaultValues;
  return {
    dealer_code: dealer.dealer_code ?? "",
    dealer_family_code: dealer.dealer_family_code ?? "",
    branch: dealer.branch ?? "",
    branch_code: dealer.branch_code ?? "",
    region: dealer.region ?? "",
  };
}
