import { apiClient } from "@/lib/apiClient";

export const adminApi = {
  /** GET user list — `/admin/users` */
  async listUsers({ limit = 50, offset = 0, role, q } = {}) {
    const params = { limit, offset };
    if (role) params.role = role;
    if (q) params.q = q;
    const { data } = await apiClient.get("/admin/users", { params });
    return data;
  },

  /** POST create dealer `/admin/dealers` */
  async createDealer(body) {
    const { data } = await apiClient.post("/admin/dealers", body);
    return data;
  },

  /** PUT update dealer details `/admin/dealers/{dealer_id}` */
  async updateDealer(dealerId, body) {
    const { data } = await apiClient.put(`/admin/dealers/${dealerId}`, body);
    return data;
  },

  /** GET campaign list — `/admin/campaigns` */
  async listCampaigns({ limit = 50, offset = 0, use_for_rec, q } = {}) {
    const params = { limit, offset };
    if (use_for_rec !== undefined) params.use_for_rec = use_for_rec;
    if (q) params.q = q;
    const { data } = await apiClient.get("/admin/campaigns", { params });
    return data;
  },

  /** PUT `/admin/campaigns/{campaign_code}` */
  async updateCampaign(campaignCode, useForRec) {
    const { data } = await apiClient.put(
      `/admin/campaigns/${encodeURIComponent(campaignCode)}`,
      { use_for_rec: useForRec },
    );
    return data;
  },

  /** Claim-category list — `GET /admin/claim-categories` */
  async listClaimCategories({ limit = 50, offset = 0, use_for_rec, q } = {}) {
    const params = {};
    if (use_for_rec !== undefined) params.use_for_rec = use_for_rec;
    if (q) params.q = q;
    const { data } = await apiClient.get("/admin/claim-categories", { params });
    let items = Array.isArray(data) ? data : (data?.items ?? []);
    if (use_for_rec !== undefined) {
      items = items.filter((i) => i.use_for_rec === use_for_rec);
    }
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter((i) =>
        i.claim_category?.toLowerCase().includes(needle),
      );
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

  /** `PUT /admin/claim-categories/{claim_category}` */
  async updateClaimCategory(claimCategory, useForRec) {
    const { data } = await apiClient.put(
      `/admin/claim-categories/${encodeURIComponent(claimCategory)}`,
      { use_for_rec: useForRec },
    );
    return data;
  },

  /** `POST /admin/srt-cross-ref` */
  async uploadSrtCrossRef(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post("/admin/srt-cross-ref", formData);
    return data;
  },

  /** GET notification lists — `/admin/notification-lists` */
  async listNotificationLists({ limit = 50, offset = 0, q } = {}) {
    const params = { limit, offset };
    if (q) params.q = q;
    const { data } = await apiClient.get("/admin/notification-lists", {
      params,
    });
    return data;
  },

  /** `PUT /admin/notification-lists/{id}` — body `{ email_list }` only. */
  async updateNotificationList(id, emailList) {
    const { data } = await apiClient.put(`/admin/notification-lists/${id}`, {
      email_list: emailList,
    });
    return data;
  },

  /**
   * `POST /admin/claims-sync` — queues a full claims sync. No body. Returns
   * 202 as soon as the job is queued, not the finished result — see
   * `getSyncLogs` for progress/outcome.
   */
  async runClaimsSync() {
    const { data } = await apiClient.post("/admin/claims-sync");
    return data;
  },

  /**
   * `POST /admin/srt-sync` — queues a full SRT operation codes refresh. No
   * body. Also returns 202 (queued), same as claims sync.
   */
  async runSrtSync() {
    const { data } = await apiClient.post("/admin/srt-sync");
    return data;
  },

  /** GET `/admin/sync-logs?start_date=&end_date=` — both `YYYYMMDD`, optional. */
  async getSyncLogs({ start_date, end_date } = {}) {
    const params = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const { data } = await apiClient.get("/admin/sync-logs", { params });
    return data;
  },
};
