import React, { useMemo } from "react";

import { cn } from "../lib/utils";
import { HIDE_TOOL_NAMES } from "../config";
import { Phase5Result } from "../types";

interface RuntimeGNNPanelProps {
  result?: Phase5Result;
}

const statusTone = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === "available") return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (normalized === "degraded") return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  return "text-slate-300 border-slate-500/40 bg-slate-500/10";
};

export function RuntimeGNNPanel({ result }: RuntimeGNNPanelProps): React.JSX.Element {
  const hasRuntime = Boolean(result?.runtime_profile);
  const hasGNN = Boolean(result?.gnn_result);
  const hasLlama = Boolean(result?.llama_result || result?.llama_behavior);
  const hasOperationalStatus = Boolean(result?.operational || result?.ebpf_runtime || result?.gnn_behavior);

  const normalizedFallbackReason = useMemo(() => {
    const raw = String(result?.fallback_reason || "").trim();
    if (!raw) return "Runtime telemetry was not collected for this scan.";

    const parts = raw
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    const cleaned = parts.join("; ").replaceAll("eBPF source missing", "Live Permission Audit source missing");
    if (result?.ebpf_runtime?.source_exists) {
      return cleaned.replaceAll("Live Permission Audit source missing", "").trim() || "No runtime data collected";
    }

    return cleaned;
  }, [result?.fallback_reason, result?.ebpf_runtime?.source_exists]);

  const badgeTone = useMemo(() => statusTone(result?.status || "unavailable"), [result?.status]);

  if (!result) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Runtime Monitor</p>
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">
              {HIDE_TOOL_NAMES ? "Behavioral Risk Score unavailable for this scan" : "Behavioral Risk Score unavailable for this scan"}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Live Permission Audit or behavioral scoring did not run, or the environment does not support this
              enterprise feature.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!hasRuntime && !hasGNN) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.10),transparent_50%)]" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Runtime Monitor</p>
              <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">
                {HIDE_TOOL_NAMES ? "Behavioral Risk Score" : "Live Permission Audit + Behavioral Risk Score"}
              </h3>
            </div>
            <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", badgeTone)}>
              {(result.status || "unavailable").toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-slate-300">{normalizedFallbackReason}</p>

          {hasOperationalStatus ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Metric label="Live Permission Audit" value={result.operational?.ebpf_ready ? "YES" : "NO"} />
              <Metric label="Behavioral Scoring Ready" value={result.operational?.gnn_ready ? "YES" : "NO"} />
              <Metric label="Explanation Support Ready" value={result.operational?.llama_ready ? "YES" : "NO"} />
              <Metric label="Operational" value={result.operational?.overall_operational ? "YES" : "NO"} />
            </div>
          ) : null}

          {result.operational?.missing_requirements && result.operational.missing_requirements.length > 0 ? (
            <div className="mt-4 rounded-lg border border-navy-600 bg-navy-800/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Missing Requirements</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {result.operational.missing_requirements.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const runtime = result.runtime_profile;
  const gnn = result.gnn_result;
  const threatPct = Math.round((gnn?.threat_score || 0) * 100);
  const topAttention = Object.entries(gnn?.attention_weights || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.10),transparent_50%)]" />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Runtime Monitor</p>
            <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">
              Live Permission Audit + Behavioral Risk Score
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[var(--ds-border-subtle)] bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Enterprise only
            </span>
            <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", badgeTone)}>
              {(result.status || "unavailable").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Duration" value={`${runtime?.duration_seconds || 0}s`} />
          <Metric label="Total Events" value={String(runtime?.total_events || 0)} />
          <Metric label="High-Risk Events" value={String(runtime?.high_risk_count || 0)} />
          <Metric label="Behavioral Risk Score" value={`${threatPct}%`} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Detected Patterns</p>
            {gnn?.detected_patterns && gnn.detected_patterns.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-200">
                {gnn.detected_patterns.map((pattern, index) => (
                  <li key={`${pattern}-${index}`} className="rounded border border-red-500/20 bg-red-500/5 px-2 py-1">
                    {pattern}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No high-confidence runtime behavior pattern was detected.</p>
            )}
          </div>

          <div className="rounded-lg border border-navy-600 bg-navy-800/60 p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Attention Weights (Top Resources)</p>
            {topAttention.length > 0 ? (
              <div className="space-y-2">
                {topAttention.map(([resource, weight]) => (
                  <div key={resource} className="rounded border border-navy-600 bg-navy-900/40 px-2 py-1">
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-200">
                      <span>{resource}</span>
                      <span className="font-mono">{weight.toFixed(2)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-700">
                      <div
                        className="h-full rounded bg-cyan-400"
                        style={{ width: `${Math.max(0, Math.min(100, weight * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No attention weights are available for this run.</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-navy-600 bg-navy-800/60 p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Interpretability</p>
          <p className="text-sm text-slate-200">
            {gnn?.interpretability_report || normalizedFallbackReason || "No interpretability report available for this scan."}
          </p>
          {runtime?.source ? (
            <p className="mt-2 text-xs text-slate-400">
              Audit source: {runtime.source === "ebpf" ? "Live Permission Audit" : runtime.source}
            </p>
          ) : null}
        </div>

        {hasLlama ? (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-emerald-300">Explanation Summary</p>
            <p className="text-sm text-slate-200">{result.llama_result?.summary || "No explanation summary generated for this scan."}</p>
            {result.llama_result?.recommendation ? (
              <p className="mt-2 text-sm text-slate-300">Recommendation: {result.llama_result.recommendation}</p>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Metric label="Support Status" value={(result.llama_result?.status || "unavailable").toUpperCase()} />
              <Metric label="Risk Posture" value={(result.llama_result?.risk_posture || "unknown").toUpperCase()} />
              <Metric label="Source" value={result.llama_result?.source || "fallback"} />
            </div>
          </div>
        ) : null}
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
