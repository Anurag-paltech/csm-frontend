import { useEffect, useState } from "react";
import { CLAIM_CATEGORY_LABELS } from "@/features/srt/schemas/querySchema";

const STEPS = [
  { text: "Processing the repair story", duration: 2000 },
  { text: "Checking input criteria", duration: 2000 },
  { text: "Fetching historical records", duration: 5000 },
  { text: "Searching for SRTs", duration: 5000 },
  { text: "Curating the final list of recommendations", duration: null },
];

function BotIcon(props) {
  return (
    <svg viewBox="0 0 64 56" {...props}>
      <g className="animate-bot-bob">
        <line
          x1="32"
          y1="4"
          x2="32"
          y2="12"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle cx="32" cy="3" r="2.6" fill="currentColor" />
        <circle cx="8" cy="24" r="2.4" fill="currentColor" />
        <circle cx="56" cy="24" r="2.4" fill="currentColor" />
        <rect
          x="10"
          y="12"
          width="44"
          height="32"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <g
          className="animate-bot-blink"
          style={{ transformOrigin: "24px 28px" }}
        >
          <circle cx="24" cy="28" r="3.4" fill="currentColor" />
        </g>
        <g
          className="animate-bot-blink"
          style={{ transformOrigin: "40px 28px" }}
        >
          <circle cx="40" cy="28" r="3.4" fill="currentColor" />
        </g>
        <path
          d="M24 34q8 6 16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function SummaryChip({ label, value }) {
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-2 shadow-card">
      <span className="mr-1 font-display text-[9px] font-bold uppercase tracking-[0.08em] text-ink-3">
        {label}
      </span>
      {value}
    </span>
  );
}

// A quick reminder of what's actually being searched for, so the loader
// doesn't feel disconnected from the form the user just filled in.
function QuerySummary({ query }) {
  if (!query) return null;
  const chips = [
    query.vin?.trim()
      ? { label: "VIN", value: query.vin.trim().slice(-8).toUpperCase() }
      : null,
    query.category
      ? {
          label: "Category",
          value: CLAIM_CATEGORY_LABELS[query.category] ?? query.category,
        }
      : null,
    query.truckModel
      ? { label: query.isEngine ? "Model" : "Truck", value: query.truckModel }
      : null,
    query.isEngine && query.engineModel
      ? {
          label: "Engine",
          value: `${query.engineMake ?? ""} ${query.engineModel}`.trim(),
        }
      : null,
    query.causalPart ? { label: "Part", value: query.causalPart } : null,
    query.dealerCode ? { label: "Dealer", value: query.dealerCode } : null,
    query.repairOrder ? { label: "RO", value: query.repairOrder } : null,
  ].filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="flex max-w-80 flex-wrap items-center justify-center gap-1.5">
      {chips.map((c) => (
        <SummaryChip key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 pb-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-dot-bounce h-1 w-1 rounded-full bg-navy"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/**
 * Shown over the query form while waiting on `POST /srt/recommendations`,
 * which usually takes around 17s. See `STEPS` for the pacing rationale.
 */
export function RecommendationLoadingOverlay({ query }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    let timeoutId;
    const advance = (i) => {
      const duration = STEPS[i]?.duration;
      if (duration == null) return; // last step — hold here
      timeoutId = setTimeout(() => {
        setStepIndex(i + 1);
        advance(i + 1);
      }, duration);
    };
    advance(0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-surface">
      <BotIcon className="h-12 w-14 text-blue" />
      <QuerySummary query={query} />
      <p
        key={stepIndex}
        className="animate-step-in inline-flex items-baseline gap-1 font-display text-[13px] font-bold text-navy"
      >
        {STEPS[stepIndex].text}
        <ThinkingDots />
      </p>
    </div>
  );
}
