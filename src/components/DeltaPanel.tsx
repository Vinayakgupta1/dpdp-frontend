import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { cn } from "../lib/utils";
import { getScanStatus } from "../services/api";

interface DeltaReport {
  delta_id: string;
  old_scan_id: string;
  new_scan_id: string;
  old_score: number;
  new_score: number;
  score_delta: number;
  score_delta_pct: number;
  old_penalty_crore: number;
  new_penalty_crore: number;
  penalty_delta_crore: number;
  new_violations: DeltaViolation[];
  fixed_violations: DeltaViolation[];
  persisting_violations: DeltaViolation[];
  recommendation: "APPROVE" | "REVIEW" | "BLOCK";
  recommendation_reason: string;
  summary: string;
}

interface DeltaViolation {
  rule_id: string;
  section: string;
  severity: string;
  description: string;
  penalty_crore: number;
  status: "new" | "fixed" | "persisting";
}

interface ScanOption {
  scan_id: string;
  package_name: string;
  grade: string;
  score: number;
  created_at: string;
}

export function DeltaPanel(): React.JSX.Element {
  const [oldScanId, setOldScanId] = useState<string | null>(null);
  const [newScanId, setNewScanId] = useState<string | null>(null);
  const [deltaReport, setDeltaReport] = useState<DeltaReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get list of available scans for dropdowns
  const { data: scans = [] } = useQuery({
    queryKey: ["scans"],
    queryFn: async () => {
      const response = await fetch("/api/reports?limit=50");
      const data = await response.json();
      return data as ScanOption[];
    },
  });

  // Create delta comparison
  const createDelta = async () => {
    if (!oldScanId || !newScanId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/reports/dpdp/delta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scan_id_old: oldScanId,
          scan_id_new: newScanId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create delta report");

      const created = await response.json();

      // Fetch full report
      const reportResponse = await fetch(`/api/reports/dpdp/delta/${created.delta_id}`);
      const report = await reportResponse.json();
      setDeltaReport(report as DeltaReport);
    } catch (error) {
      console.error("Delta comparison failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = deltaReport
    ? deltaReport.score_delta > 0
      ? "text-emerald-300"
      : deltaReport.score_delta < 0
      ? "text-red-300"
      : "text-slate-300"
    : "";

  const penaltyColor = deltaReport
    ? deltaReport.penalty_delta_crore < 0
      ? "text-emerald-300"
      : deltaReport.penalty_delta_crore > 0
      ? "text-red-300"
      : "text-slate-300"
    : "";

  const recommendationColor = {
    APPROVE: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    REVIEW: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
    BLOCK: "bg-red-500/20 border-red-500/40 text-red-300",
  };

  const recommendationText = {
    APPROVE: "✅ APPROVE",
    REVIEW: "⚠️ REVIEW",
    BLOCK: "🚫 BLOCK",
  };

  const handleExportPDF = async () => {
    if (!deltaReport) return;
    try {
      const response = await fetch(`/api/reports/dpdp/delta/${deltaReport.delta_id}/export/pdf`);
      if (!response.ok) throw new Error("Failed to export PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dpdp-delta-${deltaReport.delta_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const handleCopySummary = () => {
    if (!deltaReport) return;
    const scoreDeltaFormatted = deltaReport.score_delta >= 0 ? `+${deltaReport.score_delta.toFixed(1)}` : deltaReport.score_delta.toFixed(1);
    const penaltyDeltaFormatted = deltaReport.penalty_delta_crore >= 0 ? `+${deltaReport.penalty_delta_crore.toFixed(0)}` : deltaReport.penalty_delta_crore.toFixed(0);
    const text = `
DPDP Delta Report
Recommendation: ${deltaReport.recommendation}
Score: ${deltaReport.old_score} → ${deltaReport.new_score} (${scoreDeltaFormatted})
Penalty: ₹${deltaReport.old_penalty_crore}Cr → ₹${deltaReport.new_penalty_crore}Cr (${penaltyDeltaFormatted}Cr)

${deltaReport.summary}
    `.trim();
    
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Selector Section */}
      <section className="rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-6 shadow-panel">
        <h2 className="mb-4 text-xl font-semibold text-slate-100 font-heading">DPDP Compliance Delta</h2>
        <p className="mb-6 text-slate-400">
          Compare two scans to see how compliance changed. Perfect for release gate decisions.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Old Scan Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Baseline Scan</label>
            <select
              data-testid="delta-baseline-select"
              value={oldScanId || ""}
              onChange={(e) => setOldScanId(e.target.value || null)}
              className="w-full rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-slate-100"
            >
              <option value="">Select baseline scan...</option>
              {scans.map((scan) => (
                <option key={scan.scan_id} value={scan.scan_id}>
                  {scan.package_name} ({scan.grade} - {scan.score.toFixed(1)})
                </option>
              ))}
            </select>
          </div>

          {/* New Scan Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Scan</label>
            <select
              data-testid="delta-new-scan-select"
              value={newScanId || ""}
              onChange={(e) => setNewScanId(e.target.value || null)}
              className="w-full rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-slate-100"
            >
              <option value="">Select new scan...</option>
              {scans.map((scan) => (
                <option key={scan.scan_id} value={scan.scan_id}>
                  {scan.package_name} ({scan.grade} - {scan.score.toFixed(1)})
                </option>
              ))}
            </select>
          </div>

          {/* Compare Button */}
          <div className="flex items-end">
            <button
              data-testid="delta-compare-btn"
              onClick={createDelta}
              disabled={!oldScanId || !newScanId || isLoading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-navy-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Comparing..." : "Compare"}
            </button>
          </div>
        </div>
      </section>

      {/* Delta Report Section */}
      {deltaReport && (
        <>
          {/* Score Delta Banner */}
          <section className="rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-6 shadow-panel">
            <div className="mb-4 flex items-baseline gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Compliance Score</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-100">{deltaReport.old_score}</span>
                  <span className="text-xl text-slate-400">→</span>
                  <span className="text-3xl font-bold text-slate-100">{deltaReport.new_score}</span>
                  <span className={cn("text-2xl font-bold", scoreColor)}>
                    {deltaReport.score_delta > 0 ? "+" : ""}{deltaReport.score_delta.toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Penalty Exposure</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-slate-100">₹{deltaReport.old_penalty_crore.toFixed(0)}Cr</span>
                  <span className="text-sm text-slate-400">→</span>
                  <span className="text-sm font-semibold text-slate-100">₹{deltaReport.new_penalty_crore.toFixed(0)}Cr</span>
                  <span className={cn("text-sm font-bold", penaltyColor)}>
                    {deltaReport.penalty_delta_crore > 0 ? "+" : ""}{deltaReport.penalty_delta_crore.toFixed(0)}Cr
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Recommendation Banner */}
          <section
            className={cn("rounded-xl border p-6 shadow-panel", recommendationColor[deltaReport.recommendation])}
          >
            <h3 className="text-2xl font-bold font-heading">{recommendationText[deltaReport.recommendation]}</h3>
            <p className="mt-2 text-sm">{deltaReport.recommendation_reason}</p>
          </section>

          {/* Violations Tables */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* New Violations */}
            {deltaReport.new_violations.length > 0 && (
              <section className="rounded-xl border border-red-500/20 bg-navy-700 p-4 shadow-panel">
                <h3 className="mb-3 text-lg font-semibold text-red-300 font-heading">
                  🔴 New Violations ({deltaReport.new_violations.length})
                </h3>
                <div className="space-y-2">
                  {deltaReport.new_violations.map((v) => (
                    <div key={v.rule_id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-2">
                      <p className="text-xs font-semibold text-red-300">{v.severity}</p>
                      <p className="text-sm text-slate-200">{v.description}</p>
                      <p className="text-xs text-slate-400">₹{v.penalty_crore}Cr penalty</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Fixed Violations */}
            {deltaReport.fixed_violations.length > 0 && (
              <section className="rounded-xl border border-emerald-500/20 bg-navy-700 p-4 shadow-panel">
                <h3 className="mb-3 text-lg font-semibold text-emerald-300 font-heading">
                  ✅ Fixed ({deltaReport.fixed_violations.length})
                </h3>
                <div className="space-y-2">
                  {deltaReport.fixed_violations.map((v) => (
                    <div key={v.rule_id} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2">
                      <p className="text-xs font-semibold text-emerald-300">{v.severity}</p>
                      <p className="text-sm text-slate-200">{v.description}</p>
                      <p className="text-xs text-slate-400">Saved ₹{v.penalty_crore}Cr</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Persisting Violations */}
            {deltaReport.persisting_violations.length > 0 && (
              <section className="rounded-xl border border-yellow-500/20 bg-navy-700 p-4 shadow-panel">
                <h3 className="mb-3 text-lg font-semibold text-yellow-300 font-heading">
                  ⚠️ Persisting ({deltaReport.persisting_violations.length})
                </h3>
                <div className="space-y-2">
                  {deltaReport.persisting_violations.map((v) => (
                    <div key={v.rule_id} className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2">
                      <p className="text-xs font-semibold text-yellow-300">{v.severity}</p>
                      <p className="text-sm text-slate-200">{v.description}</p>
                      <p className="text-xs text-slate-400">₹{v.penalty_crore}Cr penalty</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Export Button */}
          <section className="flex justify-center gap-4">
            <button
              data-testid="delta-export-pdf-btn"
              onClick={handleExportPDF}
              className="rounded-lg border border-[var(--ds-border-default)] px-6 py-2 font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
            >
              📥 Export Delta Report PDF
            </button>
            <button
              data-testid="delta-copy-summary-btn"
              onClick={handleCopySummary}
              className="rounded-lg border border-slate-400/50 px-6 py-2 font-semibold text-slate-300 transition hover:bg-slate-400/10"
            >
              📋 Copy Summary
            </button>
          </section>
        </>
      )}
    </div>
  );
}
