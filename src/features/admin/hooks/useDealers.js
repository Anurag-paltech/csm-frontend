import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/adminApi';
import { lookupKeys } from '@/features/srt/hooks/useLookups';
import { lookupsApi } from '@/features/srt/api/lookupsApi';

export const dealerKeys = {
  all: ['admin', 'dealers'],
  list: (params) => [...dealerKeys.all, params ?? {}],
};

/**
 * Paged dealer list, for the Data Management → Dealer screen. There's no
 * separate `GET /admin/dealers` yet — this reuses the existing
 * `GET /lookups/dealer-codes`, whose items already carry the full record
 * (dealer_id, dealer_family_code, branch, branch_code, region), not just
 * the code the SRT dropdown picks out. Kept as a distinct cache entry from
 * `useDealerCodes()` (different params: paged/search here vs. `all: true`
 * there) — mutations invalidate both so each refetches independently.
 */
export function useDealers(params, options = {}) {
  return useQuery({
    queryKey: dealerKeys.list(params),
    queryFn: () => lookupsApi.dealerCodes(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

// Dealer codes also back the SRT query form's dealer dropdown — invalidate
// that lookup too so an edit here shows up there without a page reload.
function invalidateDealers(queryClient) {
  queryClient.invalidateQueries({ queryKey: dealerKeys.all });
  queryClient.invalidateQueries({ queryKey: lookupKeys.dealerCodes() });
}

export function useCreateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createDealer,
    onSuccess: () => invalidateDealers(queryClient),
  });
}

export function useUpdateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dealerId, body }) => adminApi.updateDealer(dealerId, body),
    onSuccess: () => invalidateDealers(queryClient),
  });
}
