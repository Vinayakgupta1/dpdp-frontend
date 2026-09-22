import React, { useEffect, useState } from "react";
import { SeverityBadge } from "./SeverityBadge";

interface CriticalThreat {
  id: string;
  threat_id: string;
  affected_sdk_id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  evidence_url?: string;
  mitigation?: string;
  reported_at: string;
}

interface ThreatAlertProps {
  scanId?: string;
  customerId?: string;
}

export function ThreatAlert({ scanId, customerId }: ThreatAlertProps): React.JSX.Element | null {
  const [threats, setThreats] = useState<CriticalThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchThreats();
    }
  }, [customerId]);

  const fetchThreats = async () => {
    try {
      const response = await fetch(`/api/customer/threats/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      const data = await response.json();
      setThreats(data.critical_threats || []);
    } catch (error) {
      console.error("Error fetching threats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || threats.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4">
      {/* Red Banner Header */}
      <button
        data-testid="threat-alert-toggle-btn"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="text-lg font-bold text-red-300 font-heading">CRITICAL SECURITY THREATS DETECTED</h3>
              <p className="text-sm text-red-200">
                {threats.length} critical threat{threats.length !== 1 ? "s" : ""} affecting your app
              </p>
            </div>
          </div>
          <span className="text-2xl text-red-300">{expanded ? "▼" : "▶"}</span>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-red-500/30 pt-4">
          {threats.map((threat) => (
            <article key={threat.id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-red-300 font-heading">{threat.title}</h4>
                  <p className="text-xs text-slate-400">
                    Affects: <span className="font-mono">{threat.affected_sdk_id}</span>
                  </p>
                </div>
                <SeverityBadge severity={threat.severity} />
              </div>

              <p className="mb-3 text-sm text-red-200">{threat.description}</p>

              {threat.mitigation && (
                <div className="mb-3 rounded bg-red-500/20 p-2 text-sm text-red-100">
                  <strong>Mitigation:</strong> {threat.mitigation}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {threat.evidence_url && (
                  <a
                    href={threat.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`threat-alert-advisory-link-${threat.id}`}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                  >
                    View Advisory ↗
                  </a>
                )}
                <button
                  data-testid={`threat-alert-rescan-btn-${threat.id}`}
                  onClick={() => {
                    // Trigger rescan
                    console.log("Initiating rescan for threat:", threat.id);
                  }}
                  className="rounded border border-red-500 bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30"
                >
                  Re-scan App
                </button>
              </div>
            </article>
          ))}

          <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">
            <strong>⚠️ Urgent Action Required:</strong> These threats affect SDKs in your app. Please update the affected SDKs or
            re-scan your app after remediation.
          </div>
        </div>
      )}
    </div>
  );
}
