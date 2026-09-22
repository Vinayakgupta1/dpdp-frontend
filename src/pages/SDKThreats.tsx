import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Loader, ShieldOff, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../lib/utils";
import { GlassPanel } from "../components/shared/GlassPanel";
import axios from "axios";
import { AffectedAppsModal } from "../components/AffectedAppsModal";

interface AffectedApp {
  app_name: string;
  package_name: string;
  version?: string;
  severity: string;
  status: string;
}

interface SDKThreat {
  sdk_id: string;
  sdk_name: string;
  version: string;
  severity: string;
  risk_score: number;
  affected_apps: AffectedApp[];
  threat_count: number;
}

export default function SDKThreats(): React.JSX.Element {
  const [selectedThreat, setSelectedThreat] = useState<SDKThreat | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const apiKey = localStorage.getItem("sentinel_api_key");
  const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8001";

  const { data: sdkThreats = [], isLoading, error } = useQuery({
    queryKey: ["sdk-threats"],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error("API key not found. Please visit /scan to authenticate.");
      }
      const response = await axios.get(
        `${baseURL}/api/customer/threats/portfolio/sdk-threats`,
        {
          headers: {
            "X-Sentinel-Key": apiKey,
          },
        }
      );
      return response.data as SDKThreat[];
    },
    enabled: !!apiKey,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleViewAffectedApps = (threat: SDKThreat) => {
    setSelectedThreat(threat);
    setModalOpen(true);
  };

  const severityTheme = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/10 text-red-300";
      case "HIGH":
        return "border-orange-500/30 bg-orange-500/10 text-orange-300";
      case "MEDIUM":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <HeaderSection icon={<ShieldOff className="h-7 w-7 text-red-400" />} />
        <div className="flex items-center justify-center rounded-xl border border-[var(--ds-border-default)] bg-navy-700/60 p-12">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
            <p className="mt-3 text-sm text-slate-400">Loading SDK threat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load SDK threat data";
    return (
      <div className="animate-fade-in space-y-6">
        <HeaderSection icon={<AlertTriangle className="h-7 w-7 text-red-400" />} />
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Unable to load SDK threats</p>
              <p className="mt-1 text-sm text-red-400/80">{errorMessage}</p>
              <p className="mt-2 text-xs text-red-400/60">
                If you haven&apos;t authenticated, visit{" "}
                <a href="/scan" className="underline">
                  /scan
                </a>{" "}
                first.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!sdkThreats || sdkThreats.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <HeaderSection icon={<AlertTriangle className="h-7 w-7 text-emerald-400" />} />
        <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <ShieldOff className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="font-semibold text-emerald-300">No SDK threats detected</p>
          <p className="mt-1 text-sm text-emerald-400/70">
            You haven&apos;t scanned any apps yet, or all scanned apps are free of detected SDK threats.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <HeaderSection icon={<AlertTriangle className="h-7 w-7 text-red-400" />} />

      {/* THREATS GRID */}
      <div className="grid gap-4 md:grid-cols-2">
        {sdkThreats.map((threat) => {
          const theme = severityTheme(threat.severity);
          return (
            <div
              key={threat.sdk_id}
              className={cn("group rounded-xl border p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover", theme)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100 font-heading">
                    {threat.sdk_name}
                    <span className="ml-2 font-mono text-xs text-slate-500">
                      v{threat.version}
                    </span>
                  </h3>
                </div>
                <span
                  className={cn("ml-2 shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-semibold", theme)}
                >
                  {threat.severity}
                </span>
              </div>

              <div className="mb-4 space-y-2.5 border-t border-current/10 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Affected Apps:</span>
                  <span className="font-semibold text-slate-200">
                    {threat.affected_apps.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Risk Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-navy-600/50">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", threat.risk_score >= 80 ? "bg-red-500" : threat.risk_score >= 60 ? "bg-orange-500" : "bg-amber-500")}
                        style={{ width: `${threat.risk_score}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-200">
                      {Math.round(threat.risk_score)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                data-testid={`sdk-threat-view-${threat.sdk_id}-btn`}
                onClick={() => handleViewAffectedApps(threat)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-current/30 bg-current/5 px-3 py-2 text-xs font-semibold transition hover:bg-current/15"
              >
                <ExternalLink className="h-3 w-3" />
                View Affected Apps
              </button>
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <GlassPanel className="rounded-xl p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-100 font-heading">
          Portfolio Summary
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--ds-border-default)] bg-navy-800/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Total Threat SDKs
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {sdkThreats.length}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Critical Issues
            </p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {sdkThreats.filter((t) => t.severity === "CRITICAL").length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--ds-border-default)] bg-navy-800/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Avg Risk Score
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {Math.round(
                sdkThreats.reduce((sum, t) => sum + t.risk_score, 0) /
                  sdkThreats.length
              )}
            </p>
          </div>
        </div>
      </GlassPanel>

      {selectedThreat && (
        <AffectedAppsModal
          isOpen={modalOpen}
          sdkName={`${selectedThreat.sdk_name} v${selectedThreat.version}`}
          affectedApps={selectedThreat.affected_apps}
          onClose={() => {
            setModalOpen(false);
            setSelectedThreat(null);
          }}
        />
      )}
    </div>
  );
}

function HeaderSection({ icon }: { icon: React.ReactNode }): React.JSX.Element {
  return (
    <GlassPanel className="rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            Security
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100 font-heading">
            SDK Threats
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Third-party SDK vulnerabilities and DPDP violations across your portfolio
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
          {icon}
        </div>
      </div>
    </GlassPanel>
  );
}
