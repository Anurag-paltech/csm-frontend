import { z } from "zod";
import {
  CLAIM_CATEGORY,
  CLAIM_CATEGORY_LABELS,
} from "@/features/srt/schemas/querySchema";

/** `model_name` uses the same "trk" / "eng" codes as claim category. */
export const MODEL_NAME_LABELS = CLAIM_CATEGORY_LABELS;

export const truckEngineMappingSchema = z.object({
  model_name: z.enum([CLAIM_CATEGORY.TRUCK, CLAIM_CATEGORY.ENGINE], {
    error: "Choose Truck or Engine",
  }),
  claim_history_model: z
    .string()
    .trim()
    .min(1, "Claim history model is required")
    .max(100, "Claim history model must be 100 characters or fewer"),
  srt_list_model: z
    .string()
    .trim()
    .min(1, "SRT list model is required")
    .max(255, "SRT list model must be 255 characters or fewer"),
});

export const truckEngineMappingDefaultValues = {
  model_name: CLAIM_CATEGORY.TRUCK,
  claim_history_model: "",
  srt_list_model: "",
};

/** Map a mapping row to form values */
export function truckEngineMappingToFormValues(mapping) {
  if (!mapping) return truckEngineMappingDefaultValues;
  return {
    model_name: mapping.model_name ?? CLAIM_CATEGORY.TRUCK,
    claim_history_model: mapping.claim_history_model ?? "",
    srt_list_model: mapping.srt_list_model ?? "",
  };
}
