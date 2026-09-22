import React, { useEffect, useState } from "react";
import { SeverityBadge } from "./SeverityBadge";
import { GradeBadge } from "./GradeBadge";
import { LoadingSpinner } from "./shared/LoadingSpinner";
import { Card } from "./shared/Card";
import { FilterBar } from "./shared/FilterBar";

export type DPDPRiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type SDKCategory = "payment_gateway" | "analytics" | "identity" | "lending" | "communication" | "maps" | "government" | "commerce" | "social" | "advertising";

export interface DetectedSDK {
  sdk_id: string;
  name: string;
  category: SDKCategory;
  vendor: string;
  country: string;
  detected_version: string | null;
  latest_safe_version: string;
  is_outdated: boolean;
  dpdp_risk_level: DPDPRiskLevel;
  dpdp_implications: string[];
  known_issues: string[];
  confidence_score: number;
  detection_methods: string[];
}

export interface SDKRiskAssessment {
  scan_id: string;
  detected_sdks: DetectedSDK[];
  critical_sdks: DetectedSDK[];
  high_risk_sdks: DetectedSDK[];
  medium_risk_sdks: DetectedSDK[];
  low_risk_sdks: DetectedSDK[];
  total_sdks_detected: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  outdated_count: number;
  overseas_vendor_count: number;
  data_exfiltration_risk: boolean;
  overall_risk_score: number;
  compliance_grade: string;
  dpdp_violations: string[];
  recommendations: string[];
  urgent_actions: string[];
}

interface SDKInventoryPanelProps {
  scanId: string;
  assessment: SDKRiskAssessment | null;
  isLoading: boolean;
}

export function SDKInventoryPanel({ scanId, assessment, isLoading }: SDKInventoryPanelProps): React.JSX.Element {
  const [filterRiskLevel, setFilterRiskLevel] = useState<DPDPRiskLevel | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<SDKCategory | "ALL">("ALL");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card as="section">
        <h2 className="mb-4 text-xl font-bold text-slate-100 font-heading">SDK Intelligence</h2>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-400 border-t-cyan-400"></div>
        </div>
      </Card>
    );
  }

  if (!assessment || assessment.detected_sdks.length === 0) {
    return (
      <Card as="section">
        <h2 className="mb-4 text-xl font-bold text-slate-100 font-heading">SDK Intelligence</h2>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          No SDKs detected in this scan
        </div>
      </Card>
    );
  }

  // Filter SDKs based on selected filters
  const filteredSDKs = assessment.detected_sdks.filter((sdk) => {
    const riskMatch = filterRiskLevel === "ALL" || sdk.dpdp_risk_level === filterRiskLevel;
    const categoryMatch = filterCategory === "ALL" || sdk.category === filterCategory;
    return riskMatch && categoryMatch;
  });

  // Get unique categories from detected SDKs
  const categories = Array.from(new Set(assessment.detected_sdks.map((sdk) => sdk.category)));

  const getCategoryIcon = (category: SDKCategory): string => {
    const icons: Record<SDKCategory, string> = {
      payment_gateway: "💳",
      analytics: "📊",
      identity: "👤",
      lending: "💰",
      communication: "📞",
      maps: "🗺️",
      government: "🏛️",
      commerce: "🛍️",
      social: "👥",
      advertising: "📢",
    };
    return icons[category] || "📦";
  };

  const getRiskColor = (risk: DPDPRiskLevel): string => {
    const colors: Record<DPDPRiskLevel, string> = {
      CRITICAL: "bg-red-500/20 text-red-300 border-red-500/50",
      HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    };
    return colors[risk];
  };

  return (
    <Card as="section">
      {/* Header with summary */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 font-heading">SDK Intelligence Layer</h2>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-navy-800 px-3 py-1 text-sm text-slate-300">
              <span className="font-semibold text-slate-100">{assessment.total_sdks_detected}</span> SDKs
            </div>
            <GradeBadge grade={assessment.compliance_grade} />
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <div className="text-2xl font-bold text-red-400">{assessment.critical_count}</div>
            <div className="text-xs text-slate-400">Critical</div>
          </div>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <div className="text-2xl font-bold text-orange-400">{assessment.high_count}</div>
            <div className="text-xs text-slate-400">High</div>
          </div>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <div className="text-2xl font-bold text-yellow-400">{assessment.medium_count}</div>
            <div className="text-xs text-slate-400">Medium</div>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="text-2xl font-bold text-emerald-400">{assessment.low_count}</div>
            <div className="text-xs text-slate-400">Low</div>
          </div>
        </div>
      </div>

      {/* Urgent Actions */}
      {assessment.urgent_actions.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <h3 className="mb-2 font-semibold text-red-300 font-heading">⚠️ Urgent Actions Required</h3>
          <ul className="space-y-1">
            {assessment.urgent_actions.map((action, idx) => (
              <li key={idx} className="text-sm text-red-200">
                • {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <FilterBar
          label="Risk Level"
          options={["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => ({ label: level, value: level }))}
          active={filterRiskLevel}
          onChange={(value) => setFilterRiskLevel(value as DPDPRiskLevel | "ALL")}
        />

        <FilterBar
          label="Category"
          options={[{ label: "ALL", value: "ALL" }, ...categories.map((cat) => ({ label: getCategoryIcon(cat) + " " + cat.replace(/_/g, " "), value: cat }))]}
          active={filterCategory}
          onChange={(value) => setFilterCategory(value as SDKCategory | "ALL")}
        />
      </div>

      {/* SDK Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredSDKs.map((sdk) => (
          <article
            key={sdk.sdk_id}
            className={`cursor-pointer rounded-lg border-2 p-4 transition hover:shadow-lg ${getRiskColor(
              sdk.dpdp_risk_level
            )}`}
            onClick={() => setShowDetails(showDetails === sdk.sdk_id ? null : sdk.sdk_id)}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(sdk.category)}</span>
                  <div>
                    <h3 className="font-bold font-heading">{sdk.name}</h3>
                    <p className="text-xs opacity-75">{sdk.vendor}</p>
                  </div>
                </div>
              </div>
              <SeverityBadge severity={sdk.dpdp_risk_level as any} />
            </div>

            {/* Version info */}
            <div className="mb-3 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono">
                  {sdk.detected_version || "Unknown"}
                  {sdk.is_outdated && (
                    <span className="ml-2 rounded bg-orange-500/30 px-2 py-1 text-xs text-orange-300">
                      Update to {sdk.latest_safe_version}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-semibold">{(sdk.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Detection methods */}
            <div className="mb-3">
              <p className="mb-1 text-xs text-slate-400">Detection Methods:</p>
              <div className="flex flex-wrap gap-1">
                {sdk.detection_methods.map((method) => (
                  <span key={method} className="rounded bg-navy-600/50 px-2 py-0.5 text-xs font-mono">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Expandable details */}
            {showDetails === sdk.sdk_id && (
              <div className="border-t border-current pt-3 text-xs">
                {/* DPDP Implications */}
                {sdk.dpdp_implications.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 font-semibold">DPDP Implications:</p>
                    <ul className="space-y-1 pl-3">
                      {sdk.dpdp_implications.map((implication, idx) => (
                        <li key={idx}>• {implication}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Known Issues */}
                {sdk.known_issues.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 font-semibold">Known Issues:</p>
                    <ul className="space-y-1 pl-3">
                      {sdk.known_issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1 text-slate-400">
                  <p>Category: {sdk.category.replace(/_/g, " ")}</p>
                  <p>Vendor Country: {sdk.country}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Recommendations section */}
      {assessment.recommendations.length > 0 && (
        <div className="mt-6 rounded-lg border border-[var(--ds-border-subtle)] bg-cyan-500/10 p-4">
          <h3 className="mb-3 font-semibold text-cyan-300 font-heading">Recommendations</h3>
          <ul className="space-y-2">
            {assessment.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-cyan-200">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DPDP Violations */}
      {assessment.dpdp_violations.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="mb-3 font-semibold text-amber-300 font-heading">DPDP Act Violations</h3>
          <ul className="space-y-2">
            {assessment.dpdp_violations.map((violation, idx) => (
              <li key={idx} className="text-sm text-amber-200">
                • {violation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
