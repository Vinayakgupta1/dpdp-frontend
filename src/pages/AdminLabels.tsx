import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ShieldAlert, Sigma } from "lucide-react";

import { cn } from "../lib/utils";
import { exportAdminFeedbackJsonl, getAdminFeedback, getAdminFeedbackStats } from "../services/api";

export default function AdminLabels(): React.JSX.Element {
  const { data: stats } = useQuery({
    queryKey: ["admin-feedback-stats"],
    queryFn: getAdminFeedbackStats
  });

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => getAdminFeedback(250, 0)
  });

  const unsureCount = useMemo(() => feedback.filter((row) => row.user_label === "UNSURE").length, [feedback]);

  const handleExport = async () => {
    const blob = await exportAdminFeedbackJsonl(10000);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `customer-feedback-${new Date().toISOString().slice(0, 10)}.jsonl`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--ds-border-default)] bg-navy-700 p-6 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Admin Labels</p>
            <h1 className="text-2xl font-semibold text-slate-100 font-heading">Customer-driven labeling loop</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Review customer confirmations, false positives, and unsure labels. Every scan adds training data to the DPDP dataset moat.
            </p>
          </div>
          <button
            type="button"
            data-testid="admin-labels-export-btn"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-cyan-200"
          >
            <Download className="h-4 w-4" />
            Export JSONL
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total labeled" value={String(stats?.total_labeled ?? feedback.length)} icon={<Sigma className="h-5 w-5" />} />
        <MetricCard title="Precision estimate" value={`${((stats?.precision_estimate ?? 0) * 100).toFixed(1)}%`} icon={<ShieldAlert className="h-5 w-5" />} />
        <MetricCard title="Unsure labels" value={String(unsureCount)} icon={<Sigma className="h-5 w-5" />} />
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 font-heading">Labeled findings</h2>
          <p className="text-sm text-slate-500">{feedback.length} records</p>
        </div>

        {isLoading ? (
          <div className="text-slate-600">Loading labels...</div>
        ) : feedback.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No customer labels yet. Feedback submitted from violation cards will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3">When</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">App</th>
                  <th className="pb-3">Violation</th>
                  <th className="pb-3">Label</th>
                  <th className="pb-3">Remediated</th>
                  <th className="pb-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 align-top transition hover:bg-slate-50">
                    <td className="py-3 whitespace-nowrap text-slate-600">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-3 font-mono text-xs text-slate-700">{row.customer_id}</td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{row.app_name || row.package_name || "Unknown App"}</div>
                      <div className="font-mono text-xs text-slate-500">{row.package_name || row.scan_id}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-mono text-xs text-slate-500">{row.violation_id}</div>
                      <div className="max-w-xl text-sm text-slate-700">
                        {typeof row.violation?.section_title === "string" ? `Section ${row.violation.section}: ${row.violation.section_title}` : "Violation details unavailable"}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", row.user_label === "TP" ? "bg-emerald-100 text-emerald-700" : row.user_label === "FP" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700")}
                      >
                        {row.user_label}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">{row.remediated ? "Yes" : "No"}</td>
                    <td className="py-3 max-w-lg text-slate-600">{row.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 font-heading">{title}</p>
        <div className="text-cyan-700">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}