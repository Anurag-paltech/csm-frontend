import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/adminApi";

export const adminKeys = {
  all: ['admin'],
  users: (params) => [...adminKeys.all, 'users', params ?? {}],
};

/**
 * Paged user list. `keepPreviousData` keeps the current page on screen while the
 * next one loads, so paging/filtering doesn't flash empty.
 *
 * @param {{ limit?: number, offset?: number, role?: string, q?: string }} params
 */
export function useUsers(params, options = {}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}
