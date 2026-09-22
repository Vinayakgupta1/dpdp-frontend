import React, { useMemo, useState } from "react";
import { HIDE_TOOL_NAMES } from "../config";

import { cn, analysisSourceLabel } from "../lib/utils";
import { ClassifiedFinding, FindingNarrative } from "../types";
import { SeverityBadge } from "./SeverityBadge";

interface FindingCardProps {
  finding: ClassifiedFinding;
  narrative?: FindingNarrative;
}

export function FindingCard({ finding, narrative }: FindingCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const isFalsePositive = finding.verdict === "FALSE_POSITIVE";
  const filteringMode = analysisSourceLabel(finding.bert_classification?.analysis_source);

  const verdictClass = useMemo(() => {
    if (finding.verdict === "TRUE_POSITIVE") {
      return "bg-red-500/20 text-red-300 border-red-500/40";
    }
    if (finding.verdict === "CONTEXT_DEPENDENT") {
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    }
    return "bg-gray-500/20 text-gray-300 border-gray-500/40";
  }, [finding.verdict]);

  return (
    <article
      className={cn("rounded-xl border border-navy-600 bg-navy-700 p-4 transition", isFalsePositive ? "opacity-50" : "opacity-100")}
    >
      <button data-testid="finding-card-toggle-btn" className="w-full text-left" onClick={() => setExpanded((prev: boolean) => !prev)}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <span className={cn("rounded-full border px-2.5 py-1 text-xs", verdictClass)}>{finding.verdict}</span>
          {isFalsePositive && (
            <span className="rounded-full bg-gray-500/20 px-2.5 py-1 text-xs text-gray-300">Filtered by Evidence Triage</span>
          )}
          <span className="ml-auto font-mono text-xs text-slate-300">
            {Math.round(finding.confidence * 100)}%
          </span>
        </div>
        <h3 className={cn("text-base font-semibold text-slate-100 font-heading", isFalsePositive && "line-through")}>
          {finding.title}
        </h3>
        <p className="mt-1 text-sm text-slate-300">{finding.reason}</p>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-navy-600 pt-4">
          <p className="text-sm text-slate-300">{finding.description}</p>
          <p className="text-sm text-slate-200">{narrative?.plain_english_summary || finding.plain_english_summary}</p>
          <p className="text-sm text-teal-400">{narrative?.why_it_matters || finding.why_it_matters}</p>

          {finding.bert_classification ? (
            <div className="space-y-2 rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/5 p-3">
              {!HIDE_TOOL_NAMES && (
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Evidence Triage</p>
              )}
              <div className="grid gap-2 md:grid-cols-2">
                <p className="text-sm text-slate-200">
                  Exploitability: <span className="font-semibold text-slate-100">{finding.bert_classification.exploitability}</span>
                </p>
                <p className="text-sm text-slate-200">
                  Attack Vector: <span className="font-semibold text-slate-100">{finding.bert_classification.attack_vector}</span>
                </p>
                <p className="text-sm text-slate-200">
                  Filtering Mode: <span className="font-semibold text-slate-100">{filteringMode}</span>
                </p>
                <p className="text-sm text-slate-200">
                  Secret Detected: <span className="font-semibold text-slate-100">{finding.bert_classification.hardcoded_secret_detected ? "Yes" : "No"}</span>
                </p>
              </div>
              <p className="text-sm text-slate-200">Suggested fix: {finding.bert_classification.fix_suggestion}</p>
              <pre className="overflow-x-auto rounded-lg border border-[var(--ds-border-default)] bg-navy-900 p-3 font-mono text-xs text-slate-200">
                <code>{finding.bert_classification.code_analyzed || "No code context captured."}</code>
              </pre>
            </div>
          ) : null}

          <pre className="overflow-x-auto rounded-lg border border-navy-600 bg-navy-900 p-3 font-mono text-xs text-slate-200">
            <code>{narrative?.remediation_code || finding.remediation_code || "No remediation code provided."}</code>
          </pre>
        </div>
      )}
    </article>
  );
}
