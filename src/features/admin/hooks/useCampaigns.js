import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const campaignKeys = {
  all: ["admin", "campaigns"],
  list: (params) => [...campaignKeys.all, params ?? {}],
};

export function useCampaigns(params, options = {}) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => adminApi.listCampaigns(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

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
