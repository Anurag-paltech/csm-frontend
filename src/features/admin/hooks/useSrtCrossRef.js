import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/adminApi';
import { lookupsApi } from '@/features/srt/api/lookupsApi';

export const srtCrossRefKeys = {
  all: ['admin', 'srt-cross-ref'],
  list: (params) => [...srtCrossRefKeys.all, params ?? {}],
};

/**
 * Paged SRT code change history — `GET /lookups/srt-changes`, for the Data
 * Management → Cross Ref screen. Read-only; the only way to change this list
 * is uploading a mapping file (`useUploadSrtCrossRef`).
 */
export function useSrtChanges(params, options = {}) {
  return useQuery({
    queryKey: srtCrossRefKeys.list(params),
    queryFn: () => lookupsApi.srtChanges(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Upload an Excel mapping file. `mutateAsync(file)` → the processing summary. */
export function useUploadSrtCrossRef() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => adminApi.uploadSrtCrossRef(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: srtCrossRefKeys.all });
    },
  });
}
