import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { srtApi } from "@/features/srt/api/srtApi";

export const recommendationKeys = {
  all: ["srt-recommendations"],
  detail: (id) => [...recommendationKeys.all, id],
};

export const historyKeys = {
  all: ["srt-history"],
  list: (params) => [...historyKeys.all, params ?? {}],
};

/** POST the query form. `mutateAsync(payload)`. Invalidates history on success. */
export function useCreateRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: srtApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

/**
 * PATCH the selection for `id`. `mutateAsync(selectedSrtCodes)` → the updated
 * recommendation, written into the detail cache; history is invalidated.
 */
export function useUpdateSelection(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedSrtCodes) =>
      srtApi.updateSelection(id, selectedSrtCodes),
    onSuccess: (updated) => {
      queryClient.setQueryData(recommendationKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

/** GET a recommendation by id (`GET /srt/recommendations/${id}`) */
export function useRecommendation(id, options = {}) {
  return useQuery({
    queryKey: recommendationKeys.detail(id),
    queryFn: () => srtApi.get(id),
    enabled: id != null,
    ...options,
  });
}

/** Paged recommendation history (`GET /srt/recommendations`)
 * param {{
      limit?: number, offset?: number, q?: string, status?: string
      created_after?: string, created_before?: string }}
 * dates are `YYYY-MM-DD`, both inclusive; either may be sent alone.
 */
export function useRecommendationHistory(params, options = {}) {
  return useQuery({
    queryKey: historyKeys.list(params),
    queryFn: () => srtApi.list(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}
