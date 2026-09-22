import React, { useMemo } from "react";

import { cn } from "../lib/utils";
import { DriftAnalysis } from "../types";
import { HIDE_TOOL_NAMES } from "../config";
import { Metric } from "./shared/Metric";

interface DifferentialPanelProps {
  result?: DriftAnalysis;
  compact?: boolean;
}

const verdictTone: Record<DriftAnalysis["verdict"], string> = {
  CLEAN: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  BEHAVIORAL_DRIFT: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  MALWARE_ACTIVATION: "text-red-300 border-red-500/40 bg-red-500/10"
};

export function DifferentialPanel({ result, compact = false }: DifferentialPanelProps): React.JSX.Element | null {
  const tone = useMemo(() => (result ? verdictTone[result.verdict] : verdictTone.CLEAN), [result]);

  if (!result) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Evidence Triage</p>
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Waiting for baseline comparison...</h3>
          </div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.10),transparent_50%)]" />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
              {!HIDE_TOOL_NAMES && (
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Evidence Triage</p>
              )}
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Behavioral Drift Detection</h3>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", tone)}>{result.verdict}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Drift Score" value={result.drift_score.toFixed(3)} mono />
          <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
          <Metric label="New Endpoints" value={String(result.new_endpoints_contacted.length)} />
          <Metric label="New Loads" value={String(result.new_dynamic_loads.length)} />
        </div>

        {!compact && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Baseline</p>
              <p className="text-sm text-slate-300">Captured at the first observation window before later behavior drifted.</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="rounded border border-navy-600 bg-navy-900/40 px-2 py-1">Foreground ratio inferred from baseline capture</li>
                <li className="rounded border border-navy-600 bg-navy-900/40 px-2 py-1">Pre-drift permissions, endpoints, reflection, and loader activity</li>
              </ul>
            </div>

            <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Later Observation</p>
              {result.changed_behaviors.length ? (
                <ul className="space-y-2 text-sm text-slate-200">
                  {result.changed_behaviors.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No drift deltas were recorded. Zero values here are expected when the app does not expose a later runtime observation or Frida is unavailable.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


