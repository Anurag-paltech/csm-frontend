import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";
import { lookupsApi } from "@/features/srt/api/lookupsApi";

export const srtCrossRefKeys = {
  all: ["admin", "srt-cross-ref"],
  list: (params) => [...srtCrossRefKeys.all, params ?? {}],
};

export function useSrtChanges(params, options = {}) {
  return useQuery({
    queryKey: srtCrossRefKeys.list(params),
    queryFn: () => lookupsApi.srtChanges(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useUploadSrtCrossRef() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => adminApi.uploadSrtCrossRef(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: srtCrossRefKeys.all });
    },
  });
}
