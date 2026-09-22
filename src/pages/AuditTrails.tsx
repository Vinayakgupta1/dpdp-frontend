import React from "react";
import { Calendar, FileText, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";
import { GlassPanel } from "../components/shared/GlassPanel";

export default function AuditTrails(): React.JSX.Element {
  const auditTrails = [
    {
      id: 1,
      date: "2026-05-08",
      action: "Scan Completed",
      app: "MyApp",
      user: "admin@company.com",
      status: "success",
    },
    {
      id: 2,
      date: "2026-05-07",
      action: "Report Exported",
      app: "PaymentSDK",
      user: "compliance@company.com",
      status: "success",
    },
    {
      id: 3,
      date: "2026-05-06",
      action: "Compliance Status Changed",
      app: "Analytics",
      user: "admin@company.com",
      status: "warning",
    },
    {
      id: 4,
      date: "2026-05-05",
      action: "Violation Remediated",
      app: "Ads Manager",
      user: "security@company.com",
      status: "success",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* HEADER */}
      <GlassPanel className="rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
              Audit
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-100 font-heading">
              Audit Trails
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track all compliance-related activities and changes
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10">
            <FileText className="h-7 w-7 text-cyan-400" />
          </div>
        </div>
      </GlassPanel>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--ds-border-default)] bg-navy-700/60 p-4">
        {["All Activities", "Scans", "Reports", "Compliance Changes"].map(
          (filter) => (
            <button
              key={filter}
              data-testid={`audit-filter-${filter.toLowerCase().replace(/\s+/g, "-")}-btn`}
              className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-[var(--ds-border-hover)] hover:bg-cyan-500/5 hover:text-slate-200"
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* AUDIT TABLE */}
      <GlassPanel className="rounded-xl p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-100 font-heading">
          Recent Activities
        </h2>
        <div className="space-y-2">
          {auditTrails.map((trail) => (
            <div
              key={trail.id}
              className="group flex items-center justify-between rounded-xl border border-[var(--ds-border-default)] bg-navy-800/40 p-4 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800/70"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700/70">
                  {trail.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {trail.action}
                  </p>
                  <p className="text-xs text-slate-500">
                    {trail.app} &middot; by {trail.user}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{trail.date}</span>
                <span
                  className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", trail.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}
                >
                  {trail.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* EXPORT */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-[var(--ds-border-default)] bg-navy-700/60 p-4">
        <button data-testid="audit-export-csv-btn" className="inline-flex items-center gap-2 rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800">
          <Download className="h-4 w-4" />
          Export as CSV
        </button>
        <button data-testid="audit-export-pdf-btn" className="inline-flex items-center gap-2 rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800">
          <Download className="h-4 w-4" />
          Export as PDF
        </button>
      </div>
    </div>
  );
}
