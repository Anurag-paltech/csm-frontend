import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/adminApi';

export const claimCategoryExclusionKeys = {
  all: ['admin', 'claim-categories'],
  list: (params) => [...claimCategoryExclusionKeys.all, params ?? {}],
};

/**
 * Paged claim-category list, for the Data Management → Claim Category
 * screen. Always called with `use_for_rec: false` — this is an exclusion
 * list, not a full browser. Distinct from the SRT query form's
 * `claim_category` field/lookup.
 */
export function useClaimCategoryExclusions(params, options = {}) {
  return useQuery({
    queryKey: claimCategoryExclusionKeys.list(params),
    queryFn: () => adminApi.listClaimCategories(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Flip a claim category's `use_for_rec` flag. `mutateAsync({ claimCategory, useForRec })`. */
export function useUpdateClaimCategoryExclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ claimCategory, useForRec }) =>
      adminApi.updateClaimCategory(claimCategory, useForRec),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimCategoryExclusionKeys.all });
    },
  });
}
