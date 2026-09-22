import React, { useState, useEffect } from "react";
import { AlertTriangle, Check, Copy, Loader } from "lucide-react";
import { cn } from "../lib/utils";

interface PlayStoreDeclaration {
  package_name: string;
  app_name: string;
  available: boolean;
  data_collected: string[];
  data_shared: string[];
  encryption_in_transit: boolean;
  security_practices: Record<string, unknown>;
  play_store_url?: string;
  scraped_at: string;
}

interface Contradiction {
  data_type: string;
  sentinel_finding: string;
  play_store_claim: string;
  contradiction_type: string;
  dpdp_section: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  evidence: Record<string, unknown>;
  remediation: string;
}

interface ContradictionResponse {
  scan_id: string;
  package_name: string;
  declaration_status: "AVAILABLE" | "NOT_FOUND" | "ERROR" | "NO_DATA_SAFETY_SECTION";
  play_store_declaration: PlayStoreDeclaration | null;
  contradictions: Contradiction[];
  contradiction_count: number;
  critical_count: number;
  high_count: number;
  generated_at: string;
}

interface PolicyAuditPanelProps {
  scanId: string;
  className?: string;
}

export const PolicyAuditPanel: React.FC<PolicyAuditPanelProps> = ({
  scanId,
  className = "",
}) => {
  const [data, setData] = useState<ContradictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedContradiction, setExpandedContradiction] = useState<
    number | null
  >(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchContradictions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/reports/${scanId}/contradictions`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(
              "DPDP report not found. Run compliance scan first."
            );
          } else {
            setError(`Failed to fetch contradictions: ${response.statusText}`);
          }
          setData(null);
          return;
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch contradictions"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContradictions();
  }, [scanId]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-12", className)}>
        <Loader className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-400">Checking Play Store claims...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-yellow-950 border border-yellow-700 rounded-lg p-6", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-200 font-heading">Unable to Check Play Store</h3>
            <p className="text-yellow-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.declaration_status === "NOT_FOUND") {
    return (
      <div className={cn("bg-slate-900 border border-slate-700 rounded-lg p-6", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-300 font-heading">App Not Found on Play Store</h3>
            <p className="text-slate-400 text-sm mt-1">
              Could not locate this app on Google Play Store. Manual verification may be needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasCritical = data.critical_count > 0;
  const hasHigh = data.high_count > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      {data.contradictions.length === 0 ? (
        <div className="bg-emerald-950 border border-emerald-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-emerald-200 font-heading">No Contradictions Found</h3>
              <p className="text-emerald-300 text-sm mt-1">
                Play Store declaration matches DPDP Sentinel findings.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-200 font-heading">Policy Contradictions Detected</h3>
              <p className="text-slate-400 text-sm mt-1">
                {data.contradiction_count} contradiction{data.contradiction_count !== 1 ? "s" : ""} between
                Play Store claims and actual behavior
              </p>
            </div>
            <div className="flex gap-4">
              {hasCritical && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{data.critical_count}</div>
                  <div className="text-xs text-slate-400">CRITICAL</div>
                </div>
              )}
              {hasHigh && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{data.high_count}</div>
                  <div className="text-xs text-slate-400">HIGH</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contradictions List */}
      {data.contradictions.length > 0 && (
        <div className="space-y-3">
          {data.contradictions.map((contradiction, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition"
            >
              {/* Header */}
              <button
                data-testid={`policy-contradiction-${index}-btn`}
                onClick={() =>
                  setExpandedContradiction(
                    expandedContradiction === index ? null : index
                  )
                }
                className="w-full px-6 py-4 flex items-start gap-3 hover:bg-slate-800 transition"
              >
                {/* Severity Badge */}
                <div
                  className={cn("flex-shrink-0 px-2.5 py-1.5 rounded font-semibold text-xs mt-0.5", contradiction.severity === "CRITICAL" ? "bg-red-950 text-red-300 border border-red-800" : "bg-orange-950 text-orange-300 border border-orange-800")}
                >
                  {contradiction.severity}
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-slate-200 font-heading">
                    {contradiction.data_type}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {contradiction.play_store_claim}
                  </p>
                </div>

                {/* Expand Icon */}
                <div
                  className={cn("text-slate-400 flex-shrink-0 transition", expandedContradiction === index && "rotate-180")}
                >
                  ▼
                </div>
              </button>

              {/* Details */}
              {expandedContradiction === index && (
                <div className="border-t border-slate-700 bg-slate-950 px-6 py-4 space-y-4">
                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Play Store Claim */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 font-heading">
                        Play Store Claims
                      </h5>
                      <div className="bg-slate-900 border border-slate-700 rounded p-3">
                        <p className="text-sm text-slate-300">
                          {contradiction.play_store_claim}
                        </p>
                      </div>
                    </div>

                    {/* Sentinel Finding */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 font-heading">
                        DPDP Sentinel Found
                      </h5>
                <div
                  className={cn("flex-shrink-0 px-2.5 py-1.5 rounded font-semibold text-xs mt-0.5", contradiction.severity === "CRITICAL" ? "bg-red-950 text-red-300 border border-red-800" : "bg-orange-950 text-orange-300 border border-orange-800")}
                      >
                        <p className="text-sm text-slate-300">
                          {contradiction.sentinel_finding}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <h6 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 font-heading">
                        Contradiction Type
                      </h6>
                      <p className="text-slate-300">
                        {contradiction.contradiction_type.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div>
                      <h6 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 font-heading">
                        DPDP Section
                      </h6>
                      <p className="text-slate-300">{contradiction.dpdp_section}</p>
                    </div>

                    <div>
                      <h6 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 font-heading">
                        Remediation
                      </h6>
                      <p className="text-slate-300 italic">
                        {contradiction.remediation}
                      </p>
                    </div>

                    {/* Evidence */}
                    {Object.keys(contradiction.evidence).length > 0 && (
                      <div>
                        <h6 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 font-heading">
                          Evidence
                        </h6>
                        <div className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs text-slate-400 max-h-32 overflow-auto">
                          <pre>
                            {JSON.stringify(contradiction.evidence, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    data-testid={`policy-copy-${index}-btn`}
                    onClick={() => {
                      const text = `${contradiction.data_type}:\n${contradiction.play_store_claim}\nvs\n${contradiction.sentinel_finding}`;
                      navigator.clipboard.writeText(text);
                      setCopiedIndex(index);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 text-sm font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedIndex === index ? "Copied!" : "Copy Details"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Play Store Declaration Info */}
      {data.play_store_declaration && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h4 className="font-semibold text-slate-200 mb-3 font-heading">Play Store Declaration</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">App</p>
              <p className="text-slate-200">{data.play_store_declaration.app_name}</p>
            </div>
            <div>
              <p className="text-slate-400">Package</p>
              <p className="text-slate-200 font-mono text-xs">
                {data.play_store_declaration.package_name}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Encryption in Transit</p>
              <p className="text-slate-200">
                {data.play_store_declaration.encryption_in_transit ? "✓ Yes" : "✗ No"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Data Collected</p>
              <p className="text-slate-200">
                {data.play_store_declaration.data_collected.length} types
              </p>
            </div>
          </div>
          {data.play_store_declaration.play_store_url && (
            <a
              href={data.play_store_declaration.play_store_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="policy-play-store-link"
              className="mt-4 inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              View on Play Store →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default PolicyAuditPanel;
