import React, { useMemo } from "react";

import { cn } from "../lib/utils";
import { ManifestRiskResult } from "../types";

interface ManifestSignalPanelProps {
  result?: ManifestRiskResult;
  compact?: boolean;
}

const labelTitleMap: Record<string, string> = {
  spyware_risk: "Spyware Risk",
  surveillance_risk: "Surveillance Risk",
  data_theft_risk: "Data Theft Risk",
  stalkerware_risk: "Stalkerware Risk",
  adware_risk: "Adware Risk",
  review_required: "Review Required",
  clean: "Clean"
};

const scoreTone = (score: number): string => {
  if (score >= 85) return "text-red-300 border-red-500/40 bg-red-500/10";
  if (score >= 60) return "text-orange-300 border-orange-500/40 bg-orange-500/10";
  if (score >= 40) return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
};

export function ManifestSignalPanel({ result, compact = false }: ManifestSignalPanelProps): React.JSX.Element | null {
  const tone = useMemo(() => scoreTone(result?.risk_score || 0), [result?.risk_score]);

  if (!result) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Manifest Configuration Risk</p>
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Waiting for instant risk signal...</h3>
          </div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
        </div>
      </section>
    );
  }

  const label = labelTitleMap[result.risk_label] || result.risk_label;
  const confidencePct = Math.round((result.confidence || 0) * 100);

  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.12),transparent_50%)]" />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Manifest Configuration Risk</p>
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Instant Risk Signal</h3>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", tone)}>{label}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Manifest Risk Score" value={`${result.risk_score}/100`} />
          <Metric label="Confidence" value={`${confidencePct}%`} />
          <Metric label="Latency" value={`${result.processing_time_ms} ms`} />
        </div>

        <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-cyan-200">Note:</span> this score reflects configuration risk
            derived from the manifest alone. It is separate from the overall security grade, which also factors
            in code-level, behavioral, and privacy findings. A lower manifest risk score means a cleaner manifest
            (opposite direction from the overall grade, where a higher score is better).
          </p>
        </div>

        {!compact && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Dangerous Combinations</p>
              {result.dangerous_combinations.length ? (
                <ul className="space-y-2 text-sm text-slate-200">
                  {result.dangerous_combinations.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded border border-red-500/20 bg-red-500/5 px-2 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No dangerous combinations detected.</p>
              )}
            </div>

            <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">DPDP Pre-Flags</p>
              {result.dpdp_pre_flags.length ? (
                <ul className="space-y-2 text-sm text-slate-200">
                  {result.dpdp_pre_flags.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded border border-orange-500/20 bg-orange-500/5 px-2 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No DPDP pre-flags generated.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800/50 px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
