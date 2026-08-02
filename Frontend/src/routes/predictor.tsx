import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { assessRisk, tripsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { MOCK_TRIPS } from "@/lib/mock-data";
import type { RiskLevel, RiskPredictionResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "AI Predictor — RouteLedger" },
      {
        name: "description",
        content:
          "Assess delivery risk for any active RouteLedger trip with an AI-generated risk score, level, and factor breakdown.",
      },
      { property: "og:title", content: "AI Predictor — RouteLedger" },
      {
        property: "og:description",
        content: "AI-generated risk score, level, and factor breakdown for any active trip.",
      },
    ],
  }),
  component: PredictorPage,
});

const LEVEL_STYLES: Record<RiskLevel, string> = {
  LOW: "bg-success/10 text-success border-success/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HIGH: "bg-danger/10 text-danger border-danger/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
};

function PredictorPage() {
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });
  const [tripId, setTripId] = useState(MOCK_TRIPS[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskPredictionResponse | null>(null);

  const assess = async () => {
    setLoading(true);
    try {
      // Hits POST /api/v1/predictions/risk; falls back to a modelled
      // assessment when the endpoint is unavailable.
      const tripCode = trips.find((t) => t.id === tripId)?.tripCode ?? tripId;
      setResult(await assessRisk(tripId, tripCode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Predictor"
        description="Model-driven delivery risk assessment for active trips."
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="trip" className="text-sm font-medium">
              Active trip
            </label>
            <select
              id="trip"
              value={tripId}
              onChange={(e) => {
                setTripId(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripCode} · {t.originName} → {t.destName} ({t.driverName})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={assess} disabled={loading}>
            <Sparkles className="size-4" />
            {loading ? "Assessing…" : "Assess Risk"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Risk Score · {result.tripCode}</p>
              <p className="mt-2 font-display text-6xl font-semibold tracking-tight">
                {result.riskScore}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">out of 100</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
                LEVEL_STYLES[result.riskLevel] ?? LEVEL_STYLES.LOW,
              )}
            >
              {result.riskLevel}
            </span>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-semibold">Risk factors</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {result.riskFactors}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Evaluated {formatDateTime(result.evaluatedAt)}
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
