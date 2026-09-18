import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { lookupsApi } from "@/features/srt/api/lookupsApi";

export const lookupKeys = {
  all: ["lookups"],
  truckModels: (division) => [
    ...lookupKeys.all,
    "truck-models",
    division ?? "",
  ],
  engineMakes: () => [...lookupKeys.all, "engine-makes"],
  engineModels: (division) => [
    ...lookupKeys.all,
    "engine-models",
    division ?? "",
  ],
  causalParts: (q) => [...lookupKeys.all, "causal-parts", q],
  dealerCodes: () => [...lookupKeys.all, "dealer-codes"],
};

const HOUR = 60 * 60 * 1000;

export function useTruckModels(division) {
  return useQuery({
    queryKey: lookupKeys.truckModels(division),
    queryFn: () => lookupsApi.truckModels({ all: true, division }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.truck_model, label: i.truck_model })),
  });
}

export function useEngineMakes(options = {}) {
  return useQuery({
    queryKey: lookupKeys.engineMakes(),
    queryFn: () => lookupsApi.engineMakes({ all: true }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.engine_make, label: i.engine_make })),
    ...options,
  });
}

export function useEngineModels(division, options = {}) {
  return useQuery({
    queryKey: lookupKeys.engineModels(division),
    queryFn: () => lookupsApi.engineModels({ division, all: true }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.engine_model, label: i.engine_model })),
    ...options,
  });
}

export function useCausalParts(q, { limit = 50 } = {}) {
  const query = q.trim();
  return useQuery({
    queryKey: lookupKeys.causalParts(query),
    queryFn: () => lookupsApi.causalParts({ q: query, limit }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    select: (page) => ({
      items: page.items.map((i) => ({
        value: i.causal_part_number,
        label: i.causal_part_number,
        hint: i.causal_part_description ?? null,
      })),
      total: page.total,
      hasMore: page.has_more,
    }),
  });
}

export function useDealerCodes() {
  return useQuery({
    queryKey: lookupKeys.dealerCodes(),
    queryFn: () => lookupsApi.dealerCodes({ all: true }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.dealer_code, label: i.dealer_code })),
  });
}
