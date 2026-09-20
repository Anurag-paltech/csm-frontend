import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Combobox } from "@/components/ui/Combobox";
import { Select } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormField } from "@/components/ui/FormField";
import { getErrorMessage } from "@/lib/apiError";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useTruckModels,
  useDealerCodes,
  useCausalParts,
  useEngineMakes,
  useEngineModels,
} from "@/features/srt/hooks/useLookups";
import { useCreateRecommendation } from "@/features/srt/hooks/useSrtRecommendation";
import {
  querySchema,
  queryDefaultValues,
  toRecommendationPayload,
  STORY_CHAR_LIMIT,
  REPAIR_ORDER_MAX_LENGTH,
  CLAIM_CATEGORY,
  CLAIM_CATEGORY_LABELS,
} from "@/features/srt/schemas/querySchema";

const FIELD_NAMES = new Set(Object.keys(queryDefaultValues));
const EMPTY_LIST = [];
const VIN_DIVISIONS = { K: "Kenworth", P: "Peterbilt" };
const ArrowRight = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    {...props}
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function categoryLabel(value) {
  return (
    CLAIM_CATEGORY_LABELS[value] ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}

function vinDivision(vin) {
  const char = vin.trim().toUpperCase().charAt(2);
  if (!char) return null;
  return { char, make: VIN_DIVISIONS[char] ?? "Unknown" };
}

function DerivedChip({ children, title, className = "" }) {
  return (
    <span
      title={title}
      className={`rounded-sm border border-blue-border bg-blue-soft px-2 py-0.75 text-[11px] text-blue ${className}`}
    >
      {children}
    </span>
  );
}

function applyServerFieldErrors(err, setError) {
  const detail = err?.data?.detail;
  if (err?.status !== 422 || !Array.isArray(detail)) return false;
  let applied = false;
  for (const entry of detail) {
    const field = Array.isArray(entry.loc)
      ? entry.loc[entry.loc.length - 1]
      : null;
    if (field && FIELD_NAMES.has(field)) {
      setError(field, { type: "server", message: entry.msg });
      applied = true;
    }
  }
  return applied;
}

export function QueryForm({ onSuccess, initialValues = null }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(querySchema),
    defaultValues: initialValues ?? queryDefaultValues,
  });

  const [formError, setFormError] = useState(null);
  const recommend = useCreateRecommendation();

  // VIN
  const vin = watch("vin");
  const division = vinDivision(vin);
  const divisionFilter =
    division && division.make !== "Unknown" ? division.char : undefined;
  const prevDivisionRef = useRef(divisionFilter);

  // Claim Category
  const category = watch("claim_category");
  const categoryOptions = Object.values(CLAIM_CATEGORY).map((value) => ({
    value,
    label: categoryLabel(value),
  }));
  const isEngine = category === CLAIM_CATEGORY.ENGINE;
  const onCategoryChange = (value) => {
    // Switching back to Truck drops any engine input.
    if (value !== CLAIM_CATEGORY.ENGINE) {
      setValue("engine_make", "");
      setValue("engine_model", "");
      clearErrors(["engine_make", "engine_model"]);
    }
  };

  // Truck Model
  const truckModels = useTruckModels(divisionFilter);
  useEffect(() => {
    if (prevDivisionRef.current !== divisionFilter) {
      setValue("truck_model", "");
      clearErrors("truck_model");
    }
    prevDivisionRef.current = divisionFilter;
  }, [divisionFilter, setValue, clearErrors]);

  // Engine Manufacturer
  const engineMakes = useEngineMakes({ enabled: isEngine });
  const engineMake = watch("engine_make");

  // Engine Model
  const engineModels = useEngineModels(divisionFilter, { enabled: isEngine });
  useEffect(() => {
    if (isEngine && !engineMake && engineMakes.data?.length) {
      setValue("engine_make", engineMakes.data[0].value);
    }
  }, [isEngine, engineMake, engineMakes.data, setValue]);

  // Causal Part
  const [partQuery, setPartQuery] = useState(
    initialValues?.causal_part_number ?? "",
  );
  const [partDesc, setPartDesc] = useState(
    initialValues?.causal_part_description || null,
  );
  const debouncedPartQuery = useDebouncedValue(partQuery, 300);
  const causalParts = useCausalParts(debouncedPartQuery);
  const causalPartItems = causalParts.data?.items ?? EMPTY_LIST;
  const partOptions = useMemo(
    () => [
      ...causalPartItems,
      { value: "Other", label: "Other", hint: "Other" },
    ],
    [causalPartItems],
  );
  const causalPartsFooter =
    causalParts.data?.hasMore && causalPartItems.length > 0
      ? `Showing ${causalPartItems.length} of ${causalParts.data.total} — keep typing to narrow it down`
      : undefined;

  // Dealer Code
  const dealerCodes = useDealerCodes();

  // Repair Story
  const story = watch("repair_story");
  const charCount = story.length;
  const overLimit = charCount > STORY_CHAR_LIMIT;

  const submit = async (values) => {
    setFormError(null);
    try {
      const payload = toRecommendationPayload({
        ...values,
        causal_part_description: partDesc,
        division_code: division?.char,
      });
      const rec = await recommend.mutateAsync(payload);
      onSuccess(rec);
    } catch (err) {
      if (!applyServerFieldErrors(err, setError)) {
        setFormError(getErrorMessage(err, "Could not get recommendations."));
      }
    }
  };

  const clearForm = () => {
    reset(queryDefaultValues);
    setPartQuery("");
    setPartDesc(null);
    setFormError(null);
  };

  return (
    <Card
      as="form"
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-5.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <FormField
            label="VIN"
            htmlFor="vin"
            required
            error={errors.vin?.message}
          >
            <Input
              id="vin"
              maxLength={17}
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="17-character VIN"
              invalid={Boolean(errors.vin)}
              {...register("vin")}
            />
            <div className="flex min-h-5 flex-wrap gap-1.5">
              {vin.trim().length >= 6 ? (
                <DerivedChip>
                  Chassis{" "}
                  <b className="font-bold">
                    {vin.trim().slice(-8).toUpperCase()}
                  </b>
                </DerivedChip>
              ) : null}
            </div>
          </FormField>

          <FormField
            label="Claim category"
            htmlFor="claim_category"
            required
            error={errors.claim_category?.message}
          >
            <Controller
              name="claim_category"
              control={control}
              render={({ field }) => (
                <Select
                  id="claim_category"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onCategoryChange(e.target.value);
                  }}
                  invalid={Boolean(errors.claim_category)}
                  placeholder={field.value === ""}
                  className="w-full"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Truck model number"
            htmlFor="truck_model"
            required
            error={errors.truck_model?.message}
            hint={
              truckModels.isError ? "Could not load truck models" : undefined
            }
          >
            <Controller
              name="truck_model"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="truck_model"
                  value={field.value}
                  onChange={field.onChange}
                  options={truckModels.data ?? []}
                  loading={truckModels.isLoading}
                  disabled={truckModels.isLoading}
                  placeholder="Search or select a model"
                  error={Boolean(errors.truck_model)}
                />
              )}
            />
            <div className="flex min-h-5 flex-wrap gap-1.5">
              {division ? (
                <DerivedChip>
                  Division <b className="font-bold">{division.char}</b> ·{" "}
                  {division.make}
                </DerivedChip>
              ) : null}
            </div>
          </FormField>

          {isEngine ? (
            <>
              <FormField
                label="Engine manufacturer"
                htmlFor="engine_make"
                required
                error={errors.engine_make?.message}
                hint={
                  engineMakes.isError
                    ? "Could not load manufacturers"
                    : undefined
                }
              >
                <Controller
                  name="engine_make"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="engine_make"
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        setValue("engine_model", "");
                      }}
                      options={engineMakes.data ?? []}
                      loading={engineMakes.isLoading}
                      disabled={
                        engineMakes.isLoading ||
                        (engineMakes.data?.length ?? 0) <= 1
                      }
                      placeholder="Search or select a manufacturer"
                      error={Boolean(errors.engine_make)}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Engine model number"
                htmlFor="engine_model"
                required
                error={errors.engine_model?.message}
                hint={
                  engineModels.isError
                    ? "Could not load engine models"
                    : undefined
                }
              >
                <Controller
                  name="engine_model"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="engine_model"
                      value={field.value}
                      onChange={field.onChange}
                      options={engineModels.data ?? []}
                      loading={engineModels.isLoading}
                      disabled={engineModels.isLoading}
                      placeholder="Search or select a model"
                      error={Boolean(errors.engine_model)}
                    />
                  )}
                />
              </FormField>
            </>
          ) : null}

          <FormField
            label="Causal part number"
            htmlFor="causal-part"
            required
            error={errors.causal_part_number?.message}
          >
            <Controller
              name="causal_part_number"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="causal-part"
                  inputValue={partQuery}
                  onInputChange={(v) => {
                    setPartQuery(v);
                    if (field.value) {
                      field.onChange("");
                      setPartDesc(null);
                    }
                  }}
                  options={partOptions}
                  loading={causalParts.isFetching}
                  onSelect={(opt) => {
                    field.onChange(opt.value);
                    setPartDesc(opt.hint);
                    setPartQuery(opt.value);
                  }}
                  placeholder="Search part number or description"
                  emptyText="No matching parts"
                  error={Boolean(errors.causal_part_number)}
                  footer={causalPartsFooter}
                />
              )}
            />
            <div className="flex min-h-5 flex-wrap gap-1.5">
              {partDesc ? (
                <DerivedChip
                  title={partDesc}
                  className="max-w-60 overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {partDesc}
                </DerivedChip>
              ) : null}
            </div>
          </FormField>

          <FormField
            label="Dealer code"
            htmlFor="dealer_code"
            required
            error={errors.dealer_code?.message}
            hint={
              dealerCodes.isError ? "Could not load dealer codes" : undefined
            }
          >
            <Controller
              name="dealer_code"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="dealer_code"
                  value={field.value}
                  onChange={field.onChange}
                  options={dealerCodes.data ?? []}
                  loading={dealerCodes.isLoading}
                  disabled={dealerCodes.isLoading}
                  placeholder="Search or select a dealer"
                  error={Boolean(errors.dealer_code)}
                />
              )}
            />
          </FormField>

          <FormField
            label="Repair order number"
            htmlFor="repair_order_number"
            required
            error={errors.repair_order_number?.message}
          >
            <Input
              id="repair_order_number"
              maxLength={REPAIR_ORDER_MAX_LENGTH}
              placeholder="e.g. RO-88213"
              invalid={Boolean(errors.repair_order_number)}
              {...register("repair_order_number")}
            />
          </FormField>

          <FormField
            label="Repair story"
            htmlFor="repair_story"
            required
            className="col-span-full"
            error={errors.repair_story?.message}
          >
            <Textarea
              id="repair_story"
              maxLength={STORY_CHAR_LIMIT}
              placeholder="Describe the symptoms, diagnosis, and repair performed…"
              invalid={Boolean(errors.repair_story)}
              {...register("repair_story")}
            />
            <p
              className={`text-right text-[11px] ${
                overLimit ? "font-bold text-red" : "text-ink-3"
              }`}
            >
              {charCount.toLocaleString("en-US")} /{" "}
              {STORY_CHAR_LIMIT.toLocaleString("en-US")} characters
            </p>
          </FormField>
        </div>

        {formError ? (
          <p className="mt-4 text-[13px] font-bold text-red">{formError}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line px-5.5 py-3.5">
        <Button
          type="button"
          variant="ghost"
          onClick={clearForm}
          disabled={recommend.isPending}
          className={
            recommend.isPending ? "cursor-not-allowed" : "cursor-pointer"
          }
        >
          Clear form
        </Button>
        <Button
          type="submit"
          disabled={recommend.isPending}
          className={
            recommend.isPending ? "cursor-not-allowed" : "cursor-pointer"
          }
        >
          {recommend.isPending
            ? "Getting recommendations…"
            : "Get recommendations"}
          {recommend.isPending ? null : <ArrowRight className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </Card>
  );
}
