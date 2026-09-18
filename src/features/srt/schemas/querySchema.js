import { z } from "zod";

export const STORY_CHAR_LIMIT = 5000;
export const REPAIR_ORDER_MAX_LENGTH = 100;

export const CLAIM_CATEGORY = {
  TRUCK: "truck",
  ENGINE: "engine",
};

export const CLAIM_CATEGORY_LABELS = {
  [CLAIM_CATEGORY.TRUCK]: "Truck",
  [CLAIM_CATEGORY.ENGINE]: "Engine",
};

export const querySchema = z
  .object({
    vin: z
      .string()
      .trim()
      .min(1, "VIN is required")
      .length(17, "VIN must be 17 characters"),
    claim_category: z
      .string()
      .min(1, "Select a claim category")
      .refine(
        (v) => v === CLAIM_CATEGORY.TRUCK || v === CLAIM_CATEGORY.ENGINE,
        "Select a claim category",
      ),
    truck_model: z.string().trim().min(1, "Truck model is required"),
    engine_make: z.string().trim(),
    engine_model: z.string().trim(),
    causal_part_number: z.string().trim().min(1, "Causal part is required"),
    dealer_code: z.string().trim().min(1, "Dealer code is required"),
    repair_order_number: z
      .string()
      .trim()
      .min(1, "Repair order number is required")
      .max(
        REPAIR_ORDER_MAX_LENGTH,
        `Repair order number must be ${REPAIR_ORDER_MAX_LENGTH} characters or fewer`,
      ),
    repair_story: z
      .string()
      .trim()
      .min(1, "Repair story is required")
      .max(
        STORY_CHAR_LIMIT,
        `Repair story must be ${STORY_CHAR_LIMIT.toLocaleString("en-US")} characters or fewer`,
      ),
  })
  .superRefine((val, ctx) => {
    if (val.claim_category === CLAIM_CATEGORY.ENGINE) {
      if (!val.engine_make) {
        ctx.addIssue({
          path: ["engine_make"],
          code: "custom",
          message: "Engine manufacturer is required",
        });
      }
      if (!val.engine_model) {
        ctx.addIssue({
          path: ["engine_model"],
          code: "custom",
          message: "Engine model is required",
        });
      }
    }
  });

export const queryDefaultValues = {
  vin: "",
  claim_category: "",
  truck_model: "",
  engine_make: "",
  engine_model: "",
  causal_part_number: "",
  dealer_code: "",
  repair_order_number: "",
  repair_story: "",
};

export function queryToFormValues(query) {
  if (!query) return null;
  return {
    vin: query.vin ?? "",
    claim_category: query.claim_category ?? CLAIM_CATEGORY.TRUCK,
    truck_model: query.truck_model ?? "",
    engine_make: query.engine_make ?? "",
    engine_model: query.engine_model ?? "",
    causal_part_number: query.causal_part_number ?? "",
    causal_part_description: query.causal_part_description ?? "",
    dealer_code: query.dealer_code ?? "",
    repair_order_number: query.repair_order_number ?? "",
    repair_story: query.repair_story ?? "",
  };
}

export function toRecommendationPayload(values) {
  const base = {
    vin: values.vin.trim().toUpperCase(),
    claim_category: values.claim_category,
    truck_model: values.truck_model,
    causal_part_number: values.causal_part_number,
    dealer_code: values.dealer_code,
    repair_order_number: values.repair_order_number.trim(),
    repair_story: values.repair_story.trim(),
  };
  if (values.claim_category === CLAIM_CATEGORY.ENGINE) {
    base.engine_make = values.engine_make.trim();
    base.engine_model = values.engine_model.trim();
  }
  if (values.causal_part_description) {
    base.causal_part_description = values.causal_part_description;
  }
  if (values.division_code) base.division_code = values.division_code;
  return base;
}
