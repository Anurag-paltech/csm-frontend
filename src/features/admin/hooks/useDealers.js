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

export function useDealers(params, options = {}) {
  return useQuery({
    queryKey: dealerKeys.list(params),
    queryFn: () => lookupsApi.dealerCodes(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

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
