import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const adminKeys = {
  all: ["admin"],
  users: (params) => [...adminKeys.all, "users", params ?? {}],
};

export function useUsers(params, options = {}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}
