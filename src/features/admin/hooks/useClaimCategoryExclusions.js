import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const claimCategoryExclusionKeys = {
  all: ["admin", "claim-categories"],
  list: (params) => [...claimCategoryExclusionKeys.all, params ?? {}],
};

export function useClaimCategoryExclusions(params, options = {}) {
  return useQuery({
    queryKey: claimCategoryExclusionKeys.list(params),
    queryFn: () => adminApi.listClaimCategories(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useUpdateClaimCategoryExclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ claimCategory, useForRec }) =>
      adminApi.updateClaimCategory(claimCategory, useForRec),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: claimCategoryExclusionKeys.all,
      });
    },
  });
}
