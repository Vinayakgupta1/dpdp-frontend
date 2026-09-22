import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { SeverityBadge } from "../components/SeverityBadge";

interface PublicThreat {
  id: string;
  threat_id: string;
  affected_sdk_id: string;
  affected_versions: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  evidence_url?: string;
  mitigation?: string;
  cvss_score?: number;
  source: string;
  reported_at: string;
}

export function ThreatsPage(): React.JSX.Element {
  const [threats, setThreats] = useState<PublicThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<PublicThreat | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "CRITICAL" | "HIGH">("ALL");

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const response = await fetch("/api/threats");
      const data = await response.json();
      setThreats(data);
    } catch (error) {
      console.error("Error fetching threats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreats = threats.filter((threat) => {
    if (filterSeverity === "ALL") return true;
    return threat.severity === filterSeverity;
  });

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      CRITICAL: "bg-red-500/20 text-red-300 border-red-500/50",
      HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    };
    return colors[severity] || colors.MEDIUM;
  };

  const getSeverityIcon = (severity: string): string => {
    const icons: Record<string, string> = {
      CRITICAL: "🔴",
      HIGH: "🟠",
      MEDIUM: "🟡",
      LOW: "🟢",
    };
    return icons[severity] || "⚠️";
  };

  const getCVSSBadgeColor = (score?: number): string => {
    if (!score) return "bg-slate-600 text-slate-200";
    if (score >= 9.0) return "bg-red-600 text-white";
    if (score >= 7.0) return "bg-orange-600 text-white";
    if (score >= 4.0) return "bg-yellow-600 text-white";
    return "bg-emerald-600 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-800 to-navy-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-navy-600 bg-navy-700/50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold font-heading">🛡️ SDK Security Threats</h1>
          <p className="mt-2 text-slate-400">Monitor vulnerabilities affecting Indian SDKs and fintech solutions</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="text-3xl font-bold text-red-400">
              {threats.filter((t) => t.severity === "CRITICAL").length}
            </div>
            <p className="text-sm text-slate-400">Critical Threats</p>
          </div>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="text-3xl font-bold text-orange-400">{threats.filter((t) => t.severity === "HIGH").length}</div>
            <p className="text-sm text-slate-400">High Severity</p>
          </div>
          <div className="rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/10 p-4">
            <div className="text-3xl font-bold text-cyan-400">{threats.length}</div>
            <p className="text-sm text-slate-400">Total Verified</p>
          </div>
          <div className="rounded-lg border border-slate-500/30 bg-slate-500/10 p-4">
            <div className="text-3xl font-bold text-slate-300">
              {Math.max(...threats.map((t) => (t.cvss_score || 0))) || 0}
            </div>
            <p className="text-sm text-slate-400">Highest CVSS</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-300">Filter by Severity</label>
          <div className="flex flex-wrap gap-2">
            {["ALL", "CRITICAL", "HIGH"].map((severity) => (
              <button
                key={severity}
                data-testid={`threats-filter-${severity.toLowerCase()}-btn`}
                onClick={() => setFilterSeverity(severity as any)}
                className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", filterSeverity === severity ? "bg-cyan-600 text-white" : "border border-navy-500 bg-navy-700 text-slate-300 hover:bg-navy-600")}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-lg border border-navy-600 bg-navy-700/50 p-8 text-center">
            <p className="text-slate-400">Loading threats...</p>
          </div>
        )}

        {/* Threat Grid */}
        {!loading && filteredThreats.length > 0 && (
          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                onClick={() => setSelectedThreat(threat)}
                className={`cursor-pointer rounded-lg border transition hover:border-[var(--ds-border-hover)] hover:shadow-panel ${getSeverityColor(
                  threat.severity
                )}`}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSeverityIcon(threat.severity)}</span>
                        <div>
                          <h3 className="text-lg font-bold font-heading">{threat.title}</h3>
                          <p className="text-sm text-slate-300">
                            Affects <span className="font-mono font-semibold">{threat.affected_sdk_id}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <SeverityBadge severity={threat.severity} />
                      {threat.cvss_score && (
                        <span className={cn("rounded px-2 py-1 text-xs font-bold", getCVSSBadgeColor(threat.cvss_score))}>
                          CVSS {threat.cvss_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-slate-200">{threat.description}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-block rounded-full bg-slate-600 px-2 py-1 text-xs font-semibold text-slate-200">
                      {threat.source}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported {new Date(threat.reported_at).toLocaleDateString()}
                    </span>
                    {threat.evidence_url && (
                      <a
                        href={threat.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`threats-advisory-link-${threat.id}`}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        View Advisory ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredThreats.length === 0 && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-300">
            {threats.length === 0 ? (
              <>
                <p className="text-lg font-semibold font-heading">✓ No known threats</p>
                <p className="text-sm">Your SDK infrastructure is currently secure</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold font-heading">No {filterSeverity} severity threats</p>
                <p className="text-sm">Change filters to see other threat levels</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedThreat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedThreat(null)}
        >
          <article
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-navy-600 bg-navy-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 font-heading">{selectedThreat.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  ID: <span className="font-mono">{selectedThreat.threat_id}</span>
                </p>
              </div>
              <button
                data-testid="threats-modal-close-btn"
                onClick={() => setSelectedThreat(null)}
                className="text-2xl text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <SeverityBadge severity={selectedThreat.severity} />
              {selectedThreat.cvss_score && (
                <span className={cn("rounded px-3 py-1 text-sm font-bold", getCVSSBadgeColor(selectedThreat.cvss_score))}>
                  CVSS {selectedThreat.cvss_score.toFixed(1)}
                </span>
              )}
              <span className="rounded-lg bg-slate-600 px-3 py-1 text-sm font-semibold text-slate-200">
                {selectedThreat.source}
              </span>
            </div>

            <div className="mb-6 border-b border-navy-600 pb-6">
              <h3 className="mb-2 font-semibold text-slate-300 font-heading">Description</h3>
              <p className="text-slate-200">{selectedThreat.description}</p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-300 font-heading">Affected SDK</h4>
                <p className="rounded bg-navy-800 p-2 font-mono text-sm text-cyan-300">{selectedThreat.affected_sdk_id}</p>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-300 font-heading">Affected Versions</h4>
                <p className="rounded bg-navy-800 p-2 font-mono text-sm text-yellow-300">{selectedThreat.affected_versions}</p>
              </div>
            </div>

            {selectedThreat.mitigation && (
              <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h4 className="mb-2 font-semibold text-emerald-300 font-heading">Mitigation</h4>
                <p className="text-emerald-200">{selectedThreat.mitigation}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {selectedThreat.evidence_url && (
                <a
                  href={selectedThreat.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="threats-modal-advisory-link"
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  View Full Advisory ↗
                </a>
              )}
              <button
                data-testid="threats-modal-close-bottom-btn"
                onClick={() => setSelectedThreat(null)}
                className="rounded-lg border border-navy-500 bg-navy-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-navy-700"
              >
                Close
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
