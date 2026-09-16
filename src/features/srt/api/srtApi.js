import { apiClient } from "@/lib/apiClient";

/**
 * SRT recommendation endpoints. Auth is the usual (cookies + CSRF header on the
 * unsafe methods — Axios adds `X-CSRF-Token` automatically; GET stays bare).
 *
 * Recommendation shape (fields the frontend reads — the actual response has
 * more, e.g. `rank`, `suppressed`, `catalogue_match_strength`,
 * `evidence_strength`, `is_emerging_match`, `supporting_evidence`,
 * `relevant_repair_stories`, `telemetry_id`, `clarification_needed`, which
 * the UI ignores):
 *   {
 *     recommendation_id: number,
 *     status: 'ok' | 'no_confident_match',
 *     query: { vin, claim_category, truck_model, causal_part_number,
 *              causal_part_description, division_code, dealer_code,
 *              repair_order_number, engine_make, engine_model },
 *     items: Array<{
 *       srt_code, description, hours: string|null,  // parse with Number()
 *       confidence_score: number,  // 0–1, display as Math.round(x * 100) + '%'
 *       confidence_band: string,  // case varies ('Medium', 'Low', ...) — compare lowercased
 *       sources: string[], explanation, selected: boolean
 *     }>
 *   }
 */
export const srtApi = {
  /** POST the query form → 201 with the recommendation. */
  async create(body) {
    const { data } = await apiClient.post("/srt/recommendations", body);
    return data;
  },

  /**
   * Replace the selection — exactly `selectedSrtCodes` become selected, all
   * others clear. Send the full checked list every time. Returns the updated
   * recommendation.
   */
  async updateSelection(id, selectedSrtCodes) {
    const { data } = await apiClient.patch(
      `/srt/recommendations/${id}/selection`,
      { selected_srt_codes: selectedSrtCodes },
    );
    return data;
  },

  /** GET recommendation history by Id */
  async get(id) {
    const { data } = await apiClient.get(`/srt/recommendations/${id}`);
    return data;
  },

  /** GET user's recommendation history
   * Does not contain repair story
   */
  async list({
    limit = 50,
    offset = 0,
    q,
    status,
    created_after: createdAfter,
    created_before: createdBefore,
  } = {}) {
    const params = { limit, offset };
    if (q) params.q = q;
    if (status) params.status = status;
    if (createdAfter) params.created_after = createdAfter;
    if (createdBefore) params.created_before = createdBefore;
    const { data } = await apiClient.get("/srt/recommendations", { params });
    return data;
  },
};
