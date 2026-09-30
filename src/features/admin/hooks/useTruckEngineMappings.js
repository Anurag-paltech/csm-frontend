import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const truckEngineMappingKeys = {
  all: ["admin", "truck-engine-mappings"],
  list: (params) => [...truckEngineMappingKeys.all, params ?? {}],
};

export function useTruckEngineMappings(params, options = {}) {
  return useQuery({
    queryKey: truckEngineMappingKeys.list(params),
    queryFn: () => adminApi.listTruckEngineMappings(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

function useInvalidatingMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: truckEngineMappingKeys.all }),
  });
}

export function useCreateTruckEngineMapping() {
  return useInvalidatingMutation(adminApi.createTruckEngineMapping);
}

export function useUpdateTruckEngineMapping() {
  return useInvalidatingMutation(({ id, body }) =>
    adminApi.updateTruckEngineMapping(id, body),
  );
}

export function useDeleteTruckEngineMapping() {
  return useInvalidatingMutation(adminApi.deleteTruckEngineMapping);
}
