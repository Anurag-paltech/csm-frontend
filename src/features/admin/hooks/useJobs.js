import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const syncLogKeys = {
  all: ["admin", "sync-logs"],
  list: (params) => [...syncLogKeys.all, params ?? {}],
};

// A trigger returns 202 (queued) before the worker has picked the job up —
// refetch once immediately and once again shortly after so the new
// "running" row has a chance to actually exist by the time we ask.
function refreshSyncLogsSoon(queryClient) {
  queryClient.invalidateQueries({ queryKey: syncLogKeys.all });
  setTimeout(
    () => queryClient.invalidateQueries({ queryKey: syncLogKeys.all }),
    1500,
  );
}

export function useRunClaimsSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.runClaimsSync,
    onSuccess: () => refreshSyncLogsSoon(queryClient),
  });
}

export function useRunSrtSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.runSrtSync,
    onSuccess: () => refreshSyncLogsSoon(queryClient),
  });
}

export function useSyncLogs(params, options = {}) {
  return useQuery({
    queryKey: syncLogKeys.list(params),
    queryFn: () => adminApi.getSyncLogs(params),
    ...options,
  });
}
