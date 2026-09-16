import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/adminApi';

export const campaignKeys = {
  all: ['admin', 'campaigns'],
  list: (params) => [...campaignKeys.all, params ?? {}],
};

/**
 * Paged campaign list, for the Data Management → Campaign screen. Always
 * called with `use_for_rec: false` — this is an exclusion list, not a full
 * campaign browser.
 */
export function useCampaigns(params, options = {}) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => adminApi.listCampaigns(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Flip a campaign's `use_for_rec` flag. `mutateAsync({ campaignCode, useForRec })`. */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignCode, useForRec }) =>
      adminApi.updateCampaign(campaignCode, useForRec),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}
