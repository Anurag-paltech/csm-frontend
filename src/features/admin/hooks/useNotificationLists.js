import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const notificationListKeys = {
  all: ["admin", "notification-lists"],
  list: (params) => [...notificationListKeys.all, params ?? {}],
};

export function useNotificationLists(params, options = {}) {
  return useQuery({
    queryKey: notificationListKeys.list(params),
    queryFn: () => adminApi.listNotificationLists(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useUpdateNotificationList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, emailList }) =>
      adminApi.updateNotificationList(id, emailList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationListKeys.all });
    },
  });
}
