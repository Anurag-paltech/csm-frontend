import { apiClient } from "@/lib/apiClient";

/**
 * `GET /lookups/*` — dropdown / typeahead data. All share the `Page` envelope:
 * `{ items, total, limit, offset, has_more }`.
 *
 * @param {string} path
 * @param {{ q?: string, limit?: number, offset?: number, all?: boolean, [key: string]: unknown }} [opts]
 *   `all: true` returns the whole list (server cap 5000) and ignores limit/offset.
 *   Any other keys (e.g. `make`) pass straight through as query params.
 */
async function getLookupPage(
  path,
  { q, limit = 50, offset = 0, all = false, ...rest } = {},
) {
  const params = all ? { all: true } : { limit, offset };
  if (q) params.q = q;
  Object.assign(params, rest);
  const { data } = await apiClient.get(path, { params });
  return data;
}

export const lookupsApi = {
  claimCategories: (opts) => getLookupPage("/lookups/claim-categories", opts),
  truckModels: ({ division, ...opts } = {}) =>
    getLookupPage("/lookups/truck-models", {
      ...opts,
      ...(division ? { division } : {}),
    }),
  engineMakes: (opts) => getLookupPage("/lookups/engine-makes", opts),
  engineModels: ({ division, ...opts } = {}) =>
    getLookupPage("/lookups/engine-models", {
      ...opts,
      ...(division ? { division } : {}),
    }),
  causalParts: (opts) => getLookupPage("/lookups/causal-parts", opts),
  dealerCodes: (opts) => getLookupPage("/lookups/dealer-codes", opts),
  /** `{ prev_srt, new_srt, reason }`, most recently changed first. */
  srtChanges: (opts) => getLookupPage("/lookups/srt-changes", opts),
};
