import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { lookupsApi } from "@/features/srt/api/lookupsApi";

export const lookupKeys = {
  all: ["lookups"],
  claimCategories: () => [...lookupKeys.all, "claim-categories"],
  truckModels: (division) => [
    ...lookupKeys.all,
    "truck-models",
    division ?? "",
  ],
  engineMakes: () => [...lookupKeys.all, "engine-makes"],
  engineModels: (make, division) => [
    ...lookupKeys.all,
    "engine-models",
    make ?? "",
    division ?? "",
  ],
  causalParts: (q) => [...lookupKeys.all, "causal-parts", q],
  dealerCodes: () => [...lookupKeys.all, "dealer-codes"],
};

const HOUR = 60 * 60 * 1000;

export function useClaimCategories() {
  return useQuery({
    queryKey: lookupKeys.claimCategories(),
    queryFn: () => lookupsApi.claimCategories({ all: true }),
    staleTime: HOUR,
    select: (page) => page.items.map((i) => i.claim_category),
  });
}

export function useTruckModels(division) {
  return useQuery({
    queryKey: lookupKeys.truckModels(division),
    queryFn: () => lookupsApi.truckModels({ all: true, division }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.truck_model, label: i.truck_model })),
  });
}

export function useEngineMakes() {
  return useQuery({
    queryKey: lookupKeys.engineMakes(),
    queryFn: () => lookupsApi.engineMakes({ all: true }),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.engine_make, label: i.engine_make })),
  });
}

export function useEngineModels(make, division) {
  return useQuery({
    queryKey: lookupKeys.engineModels(make, division),
    queryFn: () => lookupsApi.engineModels({ make, division, all: true }),
    enabled: Boolean(make),
    staleTime: HOUR,
    select: (page) =>
      page.items.map((i) => ({ value: i.engine_model, label: i.engine_model })),
  });
}

export function useCausalParts(q, { limit = 50 } = {}) {
  const query = q.trim();
  return useQuery({
    queryKey: lookupKeys.causalParts(query),
    queryFn: () => lookupsApi.causalParts({ q: query, limit }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    select: (page) =>
      page.items.map((i) => ({
        value: i.causal_part_number,
        label: i.causal_part_number,
        hint: i.causal_part_description ?? null,
      })),
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
