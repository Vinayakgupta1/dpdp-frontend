import React from "react";

import { TrackCSmaliResult } from "../types";
import { HIDE_TOOL_NAMES } from "../config";

interface SmaliFindingsPanelProps {
  smali?: TrackCSmaliResult;
}

export function SmaliFindingsPanel({ smali }: SmaliFindingsPanelProps): React.JSX.Element {
  if (!smali || !smali.enabled) {
    return (
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Evidence Triage</p>
        <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Evidence triage output not available</h3>
      </section>
    );
  }

  const findings = Array.isArray(smali.findings) ? smali.findings : [];

  return (
    <section className="rounded-xl border border-[var(--ds-border-default)] bg-slate-900/70 p-4 shadow-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          {!HIDE_TOOL_NAMES && (
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Evidence Triage</p>
          )}
          <h3 className="mt-1 text-base font-semibold text-slate-100 font-heading">Behavioral signal fallback</h3>
        </div>
        <span className="rounded-full border border-[var(--ds-border-default)] bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
          Findings {smali.finding_count}
        </span>
      </div>

      {findings.length === 0 ? (
        <p className="text-sm text-slate-300">
          No suspicious bytecode sequences were detected for this scan. This is normal when the APK has no matching
          opcode patterns or the behavior is not present in the bytecode.
        </p>
      ) : (
        <div className="space-y-2">
          {findings.map((item) => (
            <div key={item.finding_id} className="rounded-lg border border-navy-600 bg-navy-800/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-slate-300">{item.finding_id}</p>
                <span className="text-xs text-slate-300">{Math.round(item.confidence * 100)}%</span>
              </div>
              <p className="mt-1 text-sm text-slate-200">
                Patterns: {item.suspicious_patterns.join(", ") || "None"}
              </p>
              <p className="mt-1 text-sm text-slate-200">
                Behaviors: {item.behavior_labels.join(", ") || "None"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
