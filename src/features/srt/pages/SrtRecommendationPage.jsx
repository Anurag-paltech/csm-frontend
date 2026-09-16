/**
 * Primary screen at route `/`. Renders one of three views — query form,
 * recommendations, or selected codes — swapping between them as state
 * rather than as separate routes.
 *
 * A past search opened from History (`?rec=<id>`) starts on the results
 * view; from there, "Edit query" seeds the form with its original query.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/apiError";
import { paths } from "@/routes/paths";
import { QueryForm } from "@/features/srt/components/QueryForm";
import { RecommendationsResult } from "@/features/srt/components/RecommendationsResult";
import { SelectedSrtSummary } from "@/features/srt/components/SelectedSrtSummary";
import { useRecommendation } from "@/features/srt/hooks/useSrtRecommendation";
import { queryToFormValues } from "@/features/srt/schemas/querySchema";

const TITLES = {
  form: "New Query",
  results: "Recommendations",
  selected: "Selected SRT codes",
};

const selectionFrom = (recommendation) => {
  const items = (recommendation?.items ?? []).filter((i) => i.selected);
  const totalHours = items.reduce((sum, i) => sum + (Number(i.hours) || 0), 0);
  return { items, totalHours };
};

export function SrtRecommendationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const recIdParam = searchParams.get("rec");
  const recId =
    recIdParam && /^\d+$/.test(recIdParam) ? Number(recIdParam) : null;
  const invalidRecId = Boolean(recIdParam) && recId === null;
  const fromHistory = Boolean(recIdParam);

  const [view, setView] = useState(() => (recIdParam ? "results" : "form"));
  const [formKey, setFormKey] = useState(0);
  const [formSeed, setFormSeed] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [selection, setSelection] = useState({ items: [], totalHours: 0 });

  const openQuery = useRecommendation(recId ?? undefined, {
    enabled: recId !== null,
  });

  useEffect(() => {
    const data = openQuery.data;
    if (recId && data && data.recommendation_id === recId) {
      setRecommendation(data);
      setView("results");
    }
  }, [recId, openQuery.data]);

  const onRecommended = (rec) => {
    setRecommendation(rec);
    setView("results");
  };

  const onContinue = (updated) => {
    setRecommendation(updated);
    setSelection(selectionFrom(updated));
    setView("selected");
  };

  const onSelectionChange = (updated) => {
    setRecommendation(updated);
    setSelection(selectionFrom(updated));
  };

  const editQuery = () => {
    if (fromHistory) {
      setFormSeed(queryToFormValues(recommendation?.query));
      setFormKey((k) => k + 1);
      setSearchParams({}, { replace: true });
    }
    setView("form");
  };

  const newQuery = () => {
    if (fromHistory) setSearchParams({}, { replace: true });
    setFormSeed(null);
    setFormKey((k) => k + 1);
    setRecommendation(null);
    setSelection({ items: [], totalHours: 0 });
    setView("form");
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader eyebrow="SRT Recommendation" title={TITLES[view]} />

      {/* ============================= Query view ========================================*/}
      <div
        className={view === "form" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
      >
        <QueryForm
          key={formKey}
          initialValues={formSeed}
          onSuccess={onRecommended}
        />
      </div>

      {/* ========================= Recommendation view ===================================*/}
      {recId !== null && openQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center text-ink-3">
          <Spinner className="h-8 w-8" />
        </div>
      ) : null}

      {invalidRecId || (recId !== null && openQuery.isError) ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-[15px] font-bold text-navy">
            Couldn&apos;t open that recommendation
          </p>
          <p className="text-[13px] text-ink-3">
            {invalidRecId
              ? "Invalid or unsupported URL"
              : getErrorMessage(openQuery.error, "It may have been removed.")}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate(paths.history)}
            className="mt-1"
          >
            Back to History
          </Button>
        </div>
      ) : null}

      {view === "results" && recommendation ? (
        <RecommendationsResult
          recommendation={recommendation}
          onEditQuery={editQuery}
          onBack={fromHistory ? () => navigate(paths.history) : editQuery}
          backLabel={fromHistory ? "Back to History" : "Back to query"}
          onContinue={onContinue}
        />
      ) : null}

      {/* ============================= Selected view ========================================*/}
      {view === "selected" ? (
        <SelectedSrtSummary
          items={selection.items}
          totalHours={selection.totalHours}
          recommendationId={recommendation?.recommendation_id}
          onSelectionChange={onSelectionChange}
          onBack={() => setView("results")}
          onNewQuery={newQuery}
        />
      ) : null}
    </div>
  );
}
