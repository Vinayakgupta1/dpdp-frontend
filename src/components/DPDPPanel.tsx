import React, { useState } from "react";

import { cn } from "../lib/utils";
import { submitViolationFeedback } from "../services/api";
import { DPDPComplianceReport } from "../types";
import { SeverityBadge } from "./SeverityBadge";
import { Card } from "./shared/Card";

interface DPDPPanelProps {
  dpdpReport: DPDPComplianceReport;
  scanId: string;
}

export function DPDPPanel({ dpdpReport, scanId }: DPDPPanelProps): React.JSX.Element {
  const compliant = dpdpReport.compliant;

  return (
    <Card as="section">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={cn("rounded-full px-4 py-2 text-sm font-bold", compliant ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300")}
        >
          {compliant ? "COMPLIANT" : "NON-COMPLIANT"}
        </span>
        <span className="text-sm text-slate-300">Risk Level</span>
        <SeverityBadge severity={dpdpReport.risk_level} />
      </div>

      {dpdpReport.violations.length === 0 ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          No DPDP Act 2023 violations detected
        </div>
      ) : (
        <div className="space-y-3">
          {dpdpReport.violations.map((violation) => (
            <ViolationFeedbackCard key={violation.rule_id} scanId={scanId} violation={violation} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ViolationFeedbackCard({
  scanId,
  violation
}: {
  scanId: string;
  violation: DPDPComplianceReport["violations"][number];
}): React.JSX.Element {
  const [reason, setReason] = useState("");
  const [remediated, setRemediated] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<"TP" | "FP" | "UNSURE" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (label: "TP" | "FP" | "UNSURE") => {
    setSelectedLabel(label);
    setSubmitting(true);
    setStatus(null);
    setError(null);

    try {
      await submitViolationFeedback(scanId, violation.rule_id, {
        label,
        reason: reason.trim() || undefined,
        remediated: label === "TP" ? remediated : false
      });
      setStatus("Saved");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="rounded-lg border border-navy-600 bg-navy-800 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-100 font-heading">
            Section {violation.section}: {violation.section_title}
          </h3>
          <p className="text-xs text-slate-400">Rule {violation.rule_id}</p>
        </div>
        <SeverityBadge severity={violation.severity} />
      </div>
      <p className="mb-2 text-sm text-slate-300">{violation.violation_description}</p>
      <p className="mb-3 text-sm text-teal-400">Requirement: {violation.requirement}</p>
      <p className="mb-3 text-xs text-slate-400">Triggered by: {violation.triggered_by_finding}</p>

      <div className="space-y-3 rounded-lg border border-navy-600 bg-navy-900/70 p-3">
        <div className="grid gap-2 md:grid-cols-3">
          <button
            type="button"
            data-testid="dpdp-confirmed-btn"
            onClick={() => handleSubmit("TP")}
            disabled={submitting}
            className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60", selectedLabel === "TP" ? "bg-emerald-500 text-white" : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20")}
          >
            👍 Confirmed
          </button>
          <button
            type="button"
            data-testid="dpdp-false-positive-btn"
            onClick={() => handleSubmit("FP")}
            disabled={submitting}
            className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60", selectedLabel === "FP" ? "bg-red-500 text-white" : "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20")}
          >
            👎 False Positive
          </button>
          <button
            type="button"
            data-testid="dpdp-unsure-btn"
            onClick={() => handleSubmit("UNSURE")}
            disabled={submitting}
            className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60", selectedLabel === "UNSURE" ? "bg-slate-500 text-white" : "border border-slate-500/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20")}
          >
            ❓ Unsure
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Why? (optional)</label>
          <textarea
            data-testid="dpdp-reason-textarea"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-navy-600 bg-navy-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder={
              selectedLabel === "FP"
                ? "Help us improve: What makes this not a real issue?"
                : "Add a short note for reviewers and retraining."
            }
          />
        </div>

        {selectedLabel === "FP" && (
          <p className="text-xs text-red-300">Help us improve: What makes this not a real issue?</p>
        )}

        {selectedLabel === "TP" && (
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              data-testid="dpdp-remediated-checkbox"
              checked={remediated}
              onChange={(event) => setRemediated(event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-navy-900"
            />
            Add this as evidence in audit report?
          </label>
        )}

        {status && <p className="text-xs text-emerald-300">{status}</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </article>
  );
}
