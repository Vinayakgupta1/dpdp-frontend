import React from "react";

import { CostTrackingResponse } from "../types";
import { HIDE_TOOL_NAMES } from "../config";
import { Metric } from "./shared/Metric";

interface CostTrackingWidgetProps {
  data?: CostTrackingResponse;
  loading?: boolean;
}

export function CostTrackingWidget({ data, loading = false }: CostTrackingWidgetProps): React.JSX.Element {
  if (loading) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-5 shadow-panel">
        <h3 className="text-lg font-semibold font-heading">Evidence Triage Cost Tracking</h3>
        <p className="mt-2 text-slate-300">Loading cost metrics...</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-5 shadow-panel">
        <h3 className="text-lg font-semibold font-heading">Evidence Triage Cost Tracking</h3>
        <p className="mt-2 text-slate-300">No cost metrics available yet.</p>
      </section>
    );
  }

  const aggregate = data.aggregate;
  const baseline = aggregate.estimated_total_llm_cost_usd;
  const actual = aggregate.actual_llm_cost_usd;
  const savedPct = baseline > 0 ? ((baseline - actual) / baseline) * 100 : 0;
  const formatUsd = (value: number): string => {
    if (value === 0) return "0.00";
    if (Math.abs(value) < 1) return value.toFixed(3);
    return value.toFixed(2);
  };

  return (
    <section className="rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-5 shadow-panel">
      <h3 className="text-lg font-semibold font-heading">Evidence Triage Cost Tracking</h3>
      {!HIDE_TOOL_NAMES && (
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">Rule Engine + Evidence Triage + Assistive Summary</p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Scans" value={String(aggregate.scan_count)} />
        <Metric label="LLM Calls" value={String(aggregate.llm_api_calls)} />
        <Metric label="Saved (USD)" value={`$${formatUsd(aggregate.cost_saved_usd)}`} />
        <Metric label="Savings" value={`${savedPct.toFixed(0)}%`} />
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <p>Baseline cost: ${formatUsd(baseline)}</p>
        <p>Actual cost: ${formatUsd(actual)}</p>
        <p>Price per LLM call: ${data.pricing.llm_cost_per_call_usd.toFixed(3)}</p>
      </div>
    </section>
  );
}


