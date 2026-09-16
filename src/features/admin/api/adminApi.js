import { apiClient } from '@/lib/apiClient';

/**
 * Admin endpoints. Admin app-role only — the backend returns 403 otherwise,
 * which surfaces as an `ApiError` with `isForbidden === true`.
 */
export const adminApi = {
  /**
   * Paged user list — `GET /admin/users`.
   *
   * @param {object}  [params]
   * @param {number}  [params.limit=50]  1–200
   * @param {number}  [params.offset=0]  >= 0; page N → offset = N * limit
   * @param {string}  [params.role]      exact role value: 'admin' | 'user_business'
   * @param {string}  [params.q]         case-insensitive substring of display name OR username
   * @returns {Promise<{
   *   items: Array<{
   *     username: string, display_name: string, roles: string[],
   *     user_since: string, last_active_at: string|null
   *   }>,
   *   total: number, limit: number, offset: number, has_more: boolean
   * }>}
   */
  async listUsers({ limit = 50, offset = 0, role, q } = {}) {
    const params = { limit, offset };
    if (role) params.role = role;
    if (q) params.q = q;
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  // Listing dealers reuses `GET /lookups/dealer-codes` (see
  // features/admin/hooks/useDealers.js) — there's no separate
  // `GET /admin/dealers` since the lookup already returns the full record.

  /** `POST /admin/dealers` — body omits `dealer_id` (server-assigned). */
  async createDealer(body) {
    const { data } = await apiClient.post('/admin/dealers', body);
    return data;
  },

  /**
   * `PUT /admin/dealers/{dealer_id}`. `dealer_code` and `dealer_family_code`
   * are set at creation and never sent here — only `branch`, `branch_code`,
   * and `region` are editable.
   */
  async updateDealer(dealerId, body) {
    const { data } = await apiClient.put(`/admin/dealers/${dealerId}`, body);
    return data;
  },

  /**
   * Paged campaign list — `GET /admin/campaigns`. The Data Management →
   * Campaign screen only ever passes `use_for_rec: false` (it's an
   * exclusion list — only campaigns *not* used for recommendations).
   *
   * @param {object}  [params]
   * @param {number}  [params.limit=50]
   * @param {number}  [params.offset=0]
   * @param {boolean} [params.use_for_rec]
   * @param {string}  [params.q]  matches campaign_code
   * @returns {Promise<{
   *   items: Array<{ campaign_code: string, use_for_rec: boolean, updated_at: string }>,
   *   total: number, limit: number, offset: number, has_more: boolean
   * }>}
   */
  async listCampaigns({ limit = 50, offset = 0, use_for_rec, q } = {}) {
    const params = { limit, offset };
    if (use_for_rec !== undefined) params.use_for_rec = use_for_rec;
    if (q) params.q = q;
    const { data } = await apiClient.get('/admin/campaigns', { params });
    return data;
  },

  /**
   * `PUT /admin/campaigns/{campaign_code}` — body `{ use_for_rec }`. 404 if
   * the campaign code doesn't already exist (there's no create endpoint;
   * "adding an exclusion" means flipping an existing campaign's flag to
   * `false`, "removing" one means flipping it back to `true`).
   */
  async updateCampaign(campaignCode, useForRec) {
    const { data } = await apiClient.put(
      `/admin/campaigns/${encodeURIComponent(campaignCode)}`,
      { use_for_rec: useForRec },
    );
    return data;
  },

  /**
   * Claim-category list — `GET /admin/claim-categories`. Confirmed live:
   * returns a flat array (no `Page` envelope, no real pagination), e.g.
   * `[{ claim_category, use_for_rec, updated_at }, ...]`. Note: this "claim
   * category" is a distinct admin entity from the SRT query form's
   * `claim_category` field (truck/engine) — same name, different thing.
   *
   * Paginated and (defensively) filtered client-side here so the rest of the
   * app can treat it like every other list screen's `Page` response.
   *
   * @param {object}  [params]
   * @param {number}  [params.limit=50]
   * @param {number}  [params.offset=0]
   * @param {boolean} [params.use_for_rec]
   * @param {string}  [params.q]  matches claim_category
   * @returns {Promise<{
   *   items: Array<{ claim_category: string, use_for_rec: boolean, updated_at: string }>,
   *   total: number, limit: number, offset: number, has_more: boolean
   * }>}
   */
  async listClaimCategories({ limit = 50, offset = 0, use_for_rec, q } = {}) {
    const params = {};
    if (use_for_rec !== undefined) params.use_for_rec = use_for_rec;
    if (q) params.q = q;
    const { data } = await apiClient.get('/admin/claim-categories', { params });
    let items = Array.isArray(data) ? data : (data?.items ?? []);
    if (use_for_rec !== undefined) {
      items = items.filter((i) => i.use_for_rec === use_for_rec);
    }
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter((i) => i.claim_category?.toLowerCase().includes(needle));
    }
    const total = items.length;
    return {
      items: items.slice(offset, offset + limit),
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    };
  },

  /**
   * `PUT /admin/claim-categories/{claim_category}` — body `{ use_for_rec }`.
   * 404 if unknown; no create endpoint.
   */
  async updateClaimCategory(claimCategory, useForRec) {
    const { data } = await apiClient.put(
      `/admin/claim-categories/${encodeURIComponent(claimCategory)}`,
      { use_for_rec: useForRec },
    );
    return data;
  },

  /**
   * `POST /admin/srt-cross-ref` — multipart upload of an Excel file with
   * columns "Old SRT Code", "New SRT Code", and optional "Reason". 422 (with
   * no rows written) if a required column is missing.
   *
   * @param {File} file
   * @returns {Promise<{
   *   processed: number, updated: number, skipped_unchanged: number,
   *   created_old_code_stubs: number, created_new_code_stubs: number
   * }>}
   */
  async uploadSrtCrossRef(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/admin/srt-cross-ref', formData);
    return data;
  },
};
