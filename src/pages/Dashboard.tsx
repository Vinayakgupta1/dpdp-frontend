import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Download,
  Shield,
  Zap,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Activity,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { cn } from "../lib/utils";
import { GradeBadge } from "../components/GradeBadge";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { MetricCard } from "../components/shared/MetricCard";
import { GlassPanel } from "../components/shared/GlassPanel";
import { ScoreGauge } from "../components/shared/ScoreGauge";
import { getAllScans, getCustomerThreatDashboard, getReport } from "../services/api";
import { CustomerThreatDashboardResponse, FullReport, ScanSummary } from "../types";

const DPDP_SECTIONS = ["4", "5", "6", "8", "9", "10", "16"];

function AnimatedValue({ value, suffix = "" }: { value: string; suffix?: string }): React.JSX.Element {
  return (
    <span className="tabular-nums">
      {value}{suffix}
    </span>
  );
}

export default function Dashboard(): React.JSX.Element {
  const { data: scans = [], isLoading: scansLoading } = useQuery({
    queryKey: ["scans"],
    queryFn: getAllScans,
  });

  const { data: threatDashboard, isLoading: threatsLoading } = useQuery({
    queryKey: ["customer-threat-dashboard"],
    queryFn: getCustomerThreatDashboard,
    retry: false,
  });

  const reportQueries = useQueries({
    queries: scans.map((scan) => ({
      queryKey: ["report", scan.scan_id],
      queryFn: () => getReport(scan.scan_id),
      enabled: Boolean(scan.scan_id),
    })),
  });

  const [heatmapExpanded, setHeatmapExpanded] = useState(false);

  const reportMap = useMemo(() => {
    return reportQueries.reduce<Record<string, FullReport>>((acc, query, index) => {
      const scan = scans[index];
      if (scan && query.data) {
        acc[scan.scan_id] = query.data;
      }
      return acc;
    }, {});
  }, [reportQueries, scans]);

  const isLoading =
    scansLoading ||
    threatsLoading ||
    (scans.length > 0 && reportQueries.some((query) => query.isLoading));

  const portfolioEntries = useMemo(
    () => scans.map((scan) => ({ scan, report: reportMap[scan.scan_id] })),
    [reportMap, scans]
  );
  const visiblePortfolio = heatmapExpanded
    ? portfolioEntries
    : portfolioEntries.slice(0, 8);

  const metrics = useMemo(() => {
    const totalApps = scans.length;
    const avgScore = totalApps
      ? scans.reduce((sum, scan) => sum + scan.score, 0) / totalApps
      : 0;
    const appsNeedingAction = scans.filter((scan) => scan.score < 70).length;
    const recentWindowStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const newViolationsThisWeek = portfolioEntries.reduce((sum, entry) => {
      if (
        !entry.scan.created_at ||
        new Date(entry.scan.created_at).getTime() < recentWindowStart
      ) {
        return sum;
      }
      return sum +
        (entry.report?.dpdp_report?.total_violations ||
          entry.scan.critical_count + entry.scan.high_count);
    }, 0);

    const penaltyExposure = portfolioEntries.reduce((sum, entry) => {
      return sum + Number(entry.report?.dpdp_report?.total_penalty_exposure_crore || 0);
    }, 0);

    return {
      totalApps,
      avgScore: avgScore.toFixed(1),
      appsNeedingAction,
      newViolationsThisWeek,
      penaltyExposure: penaltyExposure.toFixed(2),
      trendArrow: avgScore >= 75 ? ("up" as const) : ("down" as const),
    };
  }, [portfolioEntries, scans]);

  if (isLoading) {
    return <LoadingSpinner text="Loading compliance dashboard..." />;
  }

  if (scans.length === 0) {
    return (
      <GlassPanel className="animate-scale-in rounded-xl p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-700/50">
          <Shield className="h-8 w-8 text-cyan-400/60" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-100 font-heading">
          No apps scanned yet
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          Upload your first APK to run a DPDP compliance check.
        </p>
        <Link
          to="/scan"
          data-testid="dashboard-empty-scan-link"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 px-6 py-2.5 font-semibold text-navy-900 shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/40"
        >
          <ArrowUpRight className="h-4 w-4" />
          Run Compliance Check
        </Link>
      </GlassPanel>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-heading">Compliance Dashboard</h2>
          <p className="text-sm text-slate-400">Real-time DPDP compliance overview for your app portfolio</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--ds-border-default)] bg-navy-800/40 px-3 py-2 text-xs text-slate-400">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>Live</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio DPDP Score"
          value={metrics.avgScore}
          unit="/100"
          icon={<Shield className="h-5 w-5" />}
          trend={metrics.trendArrow}
          color="cyan"
        />
        <MetricCard
          title="Apps Needing Action"
          value={String(metrics.appsNeedingAction)}
          subtitle="Score below 70"
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
        />
        <MetricCard
          title="New Violations This Week"
          value={String(metrics.newViolationsThisWeek)}
          icon={<Zap className="h-5 w-5" />}
          color="amber"
        />
        <MetricCard
          title="Penalty Exposure"
          value={`\u20B9${metrics.penaltyExposure}`}
          unit="Cr"
          subtitle="Estimated from current portfolio"
          icon={<ShieldAlert className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AppPortfolioGrid entries={portfolioEntries} />
          <ComplianceHeatmap
            entries={visiblePortfolio}
            expanded={heatmapExpanded}
            onToggleExpand={() => setHeatmapExpanded((value) => !value)}
          />
        </div>

        <div className="space-y-4">
          <RecentAuditsPDFWidget scans={scans} />
          <SDKThreatsWidget dashboard={threatDashboard} />
          <DPDPRemindersWidget
            metrics={metrics}
            dashboard={threatDashboard}
            scans={scans}
          />
        </div>
      </div>
    </div>
  );
}



function AppPortfolioGrid({
  entries,
}: {
  entries: Array<{ scan: ScanSummary; report?: FullReport }>;
}): React.JSX.Element {
  return (
    <GlassPanel className="rounded-xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 font-heading">
              App Portfolio
            </h2>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
              {entries.length} apps
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Decision-maker view
          </p>
        </div>
        <Link
          to="/reports"
          data-testid="dashboard-view-all-btn"
          className="rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/5 px-3 py-1.5 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-500/10"
        >
          View All Apps
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ scan, report }, index) => (
          <div key={scan.scan_id} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
            <AppCard scan={scan} report={report} />
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function AppCard({
  scan,
  report,
}: {
  scan: ScanSummary;
  report?: FullReport;
}): React.JSX.Element {
  const scoreColorClass =
    scan.score >= 80
      ? "text-emerald-400"
      : scan.score >= 60
        ? "text-amber-400"
        : "text-red-400";

  const scoreBarColor =
    scan.score >= 80
      ? "bg-emerald-500"
      : scan.score >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  const scoreGlow =
    scan.score >= 80
      ? "shadow-[0_0_12px_rgba(52,211,153,0.15)]"
      : scan.score >= 60
        ? "shadow-[0_0_12px_rgba(251,191,36,0.15)]"
        : "shadow-[0_0_12px_rgba(239,68,68,0.15)]";

  const topViolation = report?.dpdp_report?.violations?.[0]
    ? `${report.dpdp_report.violations[0].section} \u2022 ${report.dpdp_report.violations[0].violation_description}`
    : scan.critical_count > 0
      ? `${scan.critical_count} Critical`
      : scan.high_count > 0
        ? `${scan.high_count} High`
        : scan.medium_count > 0
          ? `${scan.medium_count} Medium`
          : "Compliant";

  const initials = (scan.app_name || scan.package_name)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  return (
    <Link
      to={`/report/${scan.scan_id}`}
      data-testid={`dashboard-app-card-${scan.scan_id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-gradient-to-br from-navy-750/80 to-navy-800/60 p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ds-border-hover)] hover:shadow-card-hover",
        scoreGlow
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: scan.score >= 80
            ? "radial-gradient(circle, rgba(52,211,153,0.08), transparent 70%)"
            : scan.score >= 60
              ? "radial-gradient(circle, rgba(251,191,36,0.08), transparent 70%)"
              : "radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)"
        }}
      />
      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-sm font-semibold text-cyan-300 ring-1 ring-cyan-400/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-100 font-heading">{scan.app_name}</h3>
            <p className="truncate font-mono text-[11px] text-slate-500">{scan.package_name}</p>
          </div>
          <GradeBadge grade={scan.grade} />
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex items-baseline gap-2">
            <p className={cn("text-3xl font-bold tracking-tight transition-colors", scoreColorClass)}>
              {scan.score}
            </p>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-navy-600/50">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", scoreBarColor)}
              style={{ width: `${Math.max(0, Math.min(100, scan.score))}%` }}
            />
          </div>
        </div>

        <div className="mb-4 space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {new Date(scan.scan_time).toLocaleDateString()}
          </div>
          <div className="truncate">
            <span className="text-slate-500">Issue: </span>
            <span className="text-slate-400">{topViolation}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--ds-border-default)] bg-navy-900/60 px-3 py-2 text-xs font-medium text-cyan-300 transition-all group-hover:border-[var(--ds-border-hover)] group-hover:bg-cyan-500/5">
          View Report
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

function ComplianceHeatmap({
  entries,
  expanded,
  onToggleExpand,
}: {
  entries: Array<{ scan: ScanSummary; report?: FullReport }>;
  expanded: boolean;
  onToggleExpand: () => void;
}): React.JSX.Element {
  const getSectionScore = (
    report: FullReport | undefined,
    section: string
  ): number | undefined => {
    const sectionScore = report?.dpdp_report?.section_scores?.[section];
    return sectionScore?.section_score;
  };

  const getComplianceStatus = (
    report: FullReport | undefined,
    section: string
  ): "compliant" | "partial" | "non-compliant" => {
    const sectionScore = getSectionScore(report, section);
    if (typeof sectionScore === "number") {
      if (sectionScore >= 80) return "compliant";
      if (sectionScore >= 60) return "partial";
      return "non-compliant";
    }
    if (report?.dpdp_report?.sections_violated?.includes(section)) {
      return "non-compliant";
    }
    if (report?.dpdp_report?.compliant) {
      return "compliant";
    }
    return "partial";
  };

  const getComplianceDot = (
    status: "compliant" | "partial" | "non-compliant"
  ): string => {
    switch (status) {
      case "compliant":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]";
      case "partial":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
      case "non-compliant":
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    }
  };

  const displayEntries = expanded ? entries : entries.slice(0, 5);

  return (
    <GlassPanel className="rounded-xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100 font-heading">
            DPDP Compliance Heatmap
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Section-level compliance across apps
          </p>
        </div>
        <button
          data-testid="dashboard-heatmap-toggle-btn"
          onClick={onToggleExpand}
          className="rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/5 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/10"
        >
          {expanded ? "Show Less" : "Show All"}
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-block min-w-full">
          <div className="flex items-center border-b border-[var(--ds-border-default)] pb-2">
            <div className="w-36 shrink-0 text-xs font-semibold text-slate-400">
              App Name
            </div>
            {DPDP_SECTIONS.map((section) => (
              <div
                key={section}
                className="w-14 shrink-0 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Sec {section}
              </div>
            ))}
          </div>

          {displayEntries.map(({ scan, report }, rowIndex) => (
            <div
              key={scan.scan_id}
              className="flex items-center border-b border-[var(--ds-border-default)] py-2.5 transition hover:bg-cyan-500/3"
              style={{ animationDelay: `${rowIndex * 50}ms` }}
            >
              <div className="w-36 shrink-0 truncate pr-2 text-sm font-medium text-slate-300">
                {scan.app_name}
              </div>
              {DPDP_SECTIONS.map((section) => {
                const status = getComplianceStatus(report, section);
                return (
                  <div
                    key={`${scan.scan_id}-${section}`}
                    className="flex w-14 shrink-0 items-center justify-center"
                  >
                    <div
                      className={cn("h-6 w-6 rounded-md transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-white/20", getComplianceDot(status))}
                      title={`Section ${section}: ${status}`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

function RecentAuditsPDFWidget({ scans }: { scans: ScanSummary[] }): React.JSX.Element {
  const recentAudits = scans
    .filter((scan) => scan.has_report !== false)
    .sort(
      (a, b) =>
        new Date(b.created_at || b.scan_time).getTime() -
        new Date(a.created_at || a.scan_time).getTime()
    )
    .slice(0, 5);

  return (
    <GlassPanel light as="div" className="rounded-xl p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200 font-heading">
        <Download className="h-4 w-4 text-cyan-400" />
        Recent Audit PDFs
      </h3>
      <div className="space-y-2.5">
        {recentAudits.map((audit) => (
          <div
            key={audit.scan_id}
            className="group flex items-center justify-between rounded-lg border border-[var(--ds-border-default)] bg-navy-800/40 px-3 py-2 transition hover:border-[var(--ds-border-hover)] hover:bg-navy-800/60"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-300">
                {audit.app_name}
              </p>
              <p className="text-[10px] text-slate-600">
                {new Date(audit.created_at || audit.scan_time).toLocaleDateString()}
              </p>
            </div>
            <a
              data-testid={`dashboard-pdf-link-${audit.scan_id}`}
              className="ml-2 shrink-0 rounded-md bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 opacity-0 transition hover:bg-cyan-500/20 group-hover:opacity-100"
              href={`/api/reports/${audit.scan_id}/audit-trail.pdf?auditor_name=CERT-In%20Auditor`}
              target="_blank"
              rel="noreferrer"
            >
              PDF
            </a>
          </div>
        ))}
        {recentAudits.length === 0 && (
          <div className="rounded-lg border border-[var(--ds-border-default)] bg-navy-800/40 p-3 text-center text-xs text-slate-500">
            No audit PDFs available yet
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

function SDKThreatsWidget({
  dashboard,
}: {
  dashboard?: CustomerThreatDashboardResponse;
}): React.JSX.Element {
  const threats = dashboard?.recent_threats || [];

  return (
    <GlassPanel light as="div" className="rounded-xl p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200 font-heading">
        <Zap className="h-4 w-4 text-amber-400" />
        SDK Threats
      </h3>
      <div className="space-y-2">
        {threats.length > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {threats.length} active threat{threats.length > 1 ? "s" : ""} detected
          </div>
        )}
        {threats.map((threat) => (
          <div
            key={threat.id}
            className="rounded-lg border border-red-500/15 bg-red-500/5 p-2.5 transition hover:border-red-500/30"
          >
            <p className="text-xs font-semibold text-red-300">{threat.title}</p>
            <p className="text-[10px] text-red-400/70">
              {threat.affected_sdk_id} \u2022 {threat.severity} \u2022{" "}
              {threat.reported_at
                ? new Date(threat.reported_at).toLocaleDateString()
                : "Recent"}
            </p>
          </div>
        ))}
        {threats.length === 0 && (
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5 text-xs text-emerald-400">
            No verified SDK threats affecting this portfolio.
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

function DPDPRemindersWidget({
  metrics,
  dashboard,
  scans,
}: {
  metrics: {
    appsNeedingAction: number;
    newViolationsThisWeek: number;
  };
  dashboard?: CustomerThreatDashboardResponse;
  scans: ScanSummary[];
}): React.JSX.Element {
  const reminders = [
    {
      text: metrics.appsNeedingAction > 0
        ? `Review ${metrics.appsNeedingAction} app${metrics.appsNeedingAction === 1 ? "" : "s"} below the 70-point action threshold`
        : "All apps are currently above the action threshold",
      urgent: metrics.appsNeedingAction > 0,
    },
    {
      text: (dashboard?.critical_threat_count || 0) > 0
        ? `Mitigate ${dashboard?.critical_threat_count} verified critical SDK threat${dashboard?.critical_threat_count === 1 ? "" : "s"}`
        : "No verified critical SDK threats require immediate action",
      urgent: (dashboard?.critical_threat_count || 0) > 0,
    },
    {
      text: scans.some((scan) => scan.has_report !== false)
        ? "Generate or refresh audit trail PDFs for recent compliance evidence"
        : "Run a new scan to generate audit trail evidence",
      urgent: false,
    },
  ];

  return (
    <GlassPanel light as="div" className="rounded-xl p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-200 font-heading">
        DPDP Compliance Reminders
      </h3>
      <div className="space-y-2">
        {reminders.map((reminder, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-2.5 transition hover:border-opacity-50",
              reminder.urgent
                ? "border-amber-500/15 bg-amber-500/5"
                : "border-[var(--ds-border-default)] bg-navy-800/30"
            )}
          >
            <p className={cn(
              "text-xs",
              reminder.urgent ? "text-amber-300/90" : "text-slate-400"
            )}>
              {reminder.text}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
