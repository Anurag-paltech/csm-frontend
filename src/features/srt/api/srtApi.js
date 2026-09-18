import { apiClient } from "@/lib/apiClient";

export const srtApi = {
  /** POST the query form → 201 with the recommendation. */
  async create(body) {
    const { data } = await apiClient.post("/srt/recommendations", body);
    return data;
  },

  /** Update the selection */
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

  /** GET user's recommendation history */
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
