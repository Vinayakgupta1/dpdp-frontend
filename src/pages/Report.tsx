import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Shield, FileText, Package, AlertCircle, Clock, Settings, Download, ExternalLink } from "lucide-react";

import { DPDPPanel } from "../components/DPDPPanel";
import { DifferentialPanel } from "../components/DifferentialPanel";
import { FindingCard } from "../components/FindingCard";
import { GradeBadge } from "../components/GradeBadge";
import { ManifestSignalPanel } from "../components/ManifestSignalPanel";
import { CostTrackingWidget } from "../components/CostTrackingWidget";
import { AuditExportButton } from "../components/AuditExportButton";
import { RuntimeGNNPanel } from "../components/RuntimeGNNPanel";
import { TrackCStaticPanel } from "../components/TrackCStaticPanel";
import { cn } from "../lib/utils";
import { ScoreGauge } from "../components/shared/ScoreGauge";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { GlassPanel } from "../components/shared/GlassPanel";
import { getDifferentialAnalysis, getReport, getScanStatus } from "../services/api";
import { ClassifiedFinding, FindingNarrative } from "../types";

type TabType = "compliance" | "privacy" | "sdk" | "violations" | "history" | "technical";

const TABS: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: "compliance", label: "Compliance", icon: <Shield className="h-4 w-4" /> },
  { id: "privacy", label: "Privacy Policy vs Reality", icon: <FileText className="h-4 w-4" /> },
  { id: "sdk", label: "SDK Inventory", icon: <Package className="h-4 w-4" /> },
  { id: "violations", label: "Violations", icon: <AlertCircle className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <Clock className="h-4 w-4" /> },
  { id: "technical", label: "Technical Details", icon: <Settings className="h-4 w-4" /> },
];

export default function Report(): React.JSX.Element {
  const { scanId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("compliance");
  const [sortBy, setSortBy] = useState<"severity" | "confidence">("severity");
  const [filterType, setFilterType] = useState<string>("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: ["report", scanId],
    queryFn: () => getReport(scanId),
    enabled: Boolean(scanId),
    retry: false,
  });

  const { data: scanStatusData } = useQuery({
    queryKey: ["scan-status-report", scanId],
    queryFn: () => getScanStatus(scanId),
    enabled: Boolean(scanId),
    refetchInterval: data ? false : 3000,
  });

  const { data: differentialData } = useQuery({
    queryKey: ["differential-report", scanId],
    queryFn: () => getDifferentialAnalysis(scanId),
    enabled: Boolean(scanId),
    refetchInterval: (query: { state: { data?: { status?: string } } }) =>
      query.state.data?.status === "completed" ? false : 5000,
  });

  const mergedFindings = useMemo(() => {
    if (!data) return [];
    return data.findings.map((finding: ClassifiedFinding) => {
      const narrative = data.narratives.find(
        (item: FindingNarrative) => item.finding_id === finding.id
      );
      return { finding, narrative };
    });
  }, [data]);

  const displayed = useMemo(() => {
    const severityOrder: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
      FP: 4,
    };
    const filtered = mergedFindings.filter(
      ({ finding }: { finding: ClassifiedFinding }) =>
        filterType === "ALL" || finding.type === filterType
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "confidence") {
        return b.finding.confidence - a.finding.confidence;
      }
      return severityOrder[a.finding.severity] - severityOrder[b.finding.severity];
    });
  }, [mergedFindings, filterType, sortBy]);

  if (isLoading || !data) {
    if (error instanceof Error) {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          {error.message.includes("404")
            ? "Report is not available yet for this scan. It may still be processing or may have failed."
            : error.message}
        </div>
      );
    }
    return <LoadingSpinner text="Loading report..." />;
  }

  const uniqueTypes = Array.from(new Set(data.findings.map((f: ClassifiedFinding) => f.type)));

  return (
    <div className="animate-fade-in space-y-6">
      {/* HEADER */}
      <GlassPanel className="rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-slate-100 font-heading">{data.app_name}</h1>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
            </div>
            <p className="font-mono text-xs text-slate-500">{data.package_name}</p>
            <p className="text-xs text-slate-500">Version {data.version || "N/A"}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{data.executive_summary}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <GradeBadge grade={data.grade} />
            <ScoreGauge score={data.score} style={{ "--gauge-color": data.score >= 80 ? "#34D399" : data.score >= 60 ? "#F59E0B" : "#EF4444" } as React.CSSProperties} />
          </div>
        </div>
      </GlassPanel>

      {/* TABS */}
      <GlassPanel as="div" className="rounded-xl overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-[var(--ds-border-default)] bg-navy-800/50 px-4 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              data-testid={`report-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-cyan-500/15 text-cyan-300 shadow-sm"
                  : "text-slate-500 hover:bg-navy-700/50 hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* COMPLIANCE TAB */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <DPDPPanel dpdpReport={data.dpdp_report} scanId={data.scan_id} />
              <ManifestSignalPanel result={scanStatusData?.manifest_result} />
            </div>
          )}

          {/* PRIVACY POLICY VS REALITY TAB */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 font-heading">
                Privacy Policy Analysis
              </h3>
              <div className="rounded-xl border border-[var(--ds-border-default)] bg-navy-800/50 p-4">
                <p className="text-sm text-slate-400">
                  Privacy policy analysis compares the declared privacy practices against detected app behaviors.
                </p>
              </div>
              <DifferentialPanel result={differentialData?.result || undefined} />
            </div>
          )}

          {/* SDK INVENTORY TAB */}
          {activeTab === "sdk" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 font-heading">SDK Inventory</h3>
              <div className="rounded-xl border border-[var(--ds-border-default)] bg-navy-800/50 p-4">
                <p className="text-sm text-slate-400">
                  Third-party libraries and SDKs detected in this application.
                </p>
              </div>
              <ManifestSignalPanel result={scanStatusData?.manifest_result} />
            </div>
          )}

          {/* VIOLATIONS TAB */}
          {activeTab === "violations" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-100 font-heading">Violations</h3>
                <div className="flex gap-2">
                  <select
                    data-testid="report-sort-select"
                    className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-xs text-slate-300 outline-none transition focus:border-cyan-400"
                    value={sortBy}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setSortBy(event.target.value as "severity" | "confidence")
                    }
                  >
                    <option value="severity">Sort by Severity</option>
                    <option value="confidence">Sort by Confidence</option>
                  </select>
                  <select
                    data-testid="report-filter-select"
                    className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-3 py-2 text-xs text-slate-300 outline-none transition focus:border-cyan-400"
                    value={filterType}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setFilterType(event.target.value)
                    }
                  >
                    <option value="ALL">All Types</option>
                    {uniqueTypes.map((type: string) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {displayed.length > 0
                  ? displayed.map(
                      ({
                        finding,
                        narrative,
                      }: {
                        finding: ClassifiedFinding;
                        narrative?: FindingNarrative;
                      }) => (
                        <FindingCard
                          key={finding.id}
                          finding={finding as ClassifiedFinding}
                          narrative={narrative}
                        />
                      )
                    )
                  : (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                      No violations found.
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 font-heading">Scan History</h3>
              <div className="rounded-xl border border-[var(--ds-border-default)] bg-navy-800/50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--ds-border-default)] pb-2">
                    <span className="text-xs text-slate-500">Scan Date:</span>
                    <span className="font-mono text-xs font-medium text-slate-300">
                      {new Date(data.generated_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--ds-border-default)] pb-2">
                    <span className="text-xs text-slate-500">Scan ID:</span>
                    <span className="font-mono text-xs font-medium text-slate-300">
                      {data.scan_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Version:</span>
                    <span className="text-xs font-medium text-slate-300">
                      {data.version || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TECHNICAL DETAILS TAB */}
          {activeTab === "technical" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 font-heading">
                Technical Analysis
              </h3>
              <TrackCStaticPanel result={data.track_c} />
              <RuntimeGNNPanel result={data.phase5} />
              <CostTrackingWidget
                data={
                  data.cost_tracking
                    ? {
                        generated_at: data.generated_at,
                        pricing: { llm_cost_per_call_usd: 0.003 },
                        aggregate: {
                          scan_count: 1,
                          total_findings: data.cost_tracking.total_findings,
                          rule_engine_calls: data.cost_tracking.rule_engine_calls,
                          distilbert_calls: data.cost_tracking.distilbert_calls,
                          llm_api_calls: data.cost_tracking.llm_api_calls,
                          estimated_total_llm_cost_usd:
                            data.cost_tracking.estimated_total_llm_cost_usd,
                          actual_llm_cost_usd: data.cost_tracking.actual_llm_cost_usd,
                          cost_saved_usd: data.cost_tracking.cost_saved_usd,
                        },
                        per_scan: [],
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </GlassPanel>

      {/* EXPORT BUTTONS */}
      <GlassPanel as="div" className="rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <AuditExportButton scanId={data.scan_id} appName={data.app_name} />
          <button
            data-testid="report-export-json-btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `report-${data.scan_id}.json`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ds-border-default)] bg-navy-800/50 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}


