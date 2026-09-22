import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import { Card } from "./shared/Card";
import { FilterBar } from "./shared/FilterBar";

export type ThreatSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ThreatSource = "CERT-IN" | "NVD" | "GitHub" | "CVE" | "MANUAL";

export interface Threat {
  id: string;
  threat_id: string;
  affected_sdk_id: string;
  affected_versions: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  evidence_url?: string;
  mitigation?: string;
  cvss_score?: number;
  source: ThreatSource;
  is_verified: boolean;
  reported_at: string;
  verified_at?: string;
  created_at: string;
}

interface ThreatAdminPanelProps {
  isLoading: boolean;
  threats: Threat[];
  onRefresh: () => void;
  onAddThreat: (threat: Partial<Threat>) => void;
}

interface ThreatFormData {
  threat_id: string;
  affected_sdk_id: string;
  affected_versions: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  evidence_url: string;
  mitigation: string;
  source: ThreatSource;
}

export function ThreatAdminPanel({ isLoading, threats, onRefresh, onAddThreat }: ThreatAdminPanelProps): React.JSX.Element {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<ThreatSeverity | "ALL">("ALL");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [formData, setFormData] = useState<Partial<ThreatFormData>>({
    severity: "HIGH",
    source: "MANUAL",
  });

  const filteredThreats = threats.filter((threat) => {
    const severityMatch = filterSeverity === "ALL" || threat.severity === filterSeverity;
    const verifyMatch =
      filterVerified === "all" ||
      (filterVerified === "verified" && threat.is_verified) ||
      (filterVerified === "unverified" && !threat.is_verified);
    return severityMatch && verifyMatch;
  });

  const handleSubmitThreat = (e: React.FormEvent) => {
    e.preventDefault();
    onAddThreat(formData);
    setFormData({ severity: "HIGH", source: "MANUAL" });
    setShowAddForm(false);
  };

  const getSeverityColor = (severity: ThreatSeverity): string => {
    const colors: Record<ThreatSeverity, string> = {
      CRITICAL: "bg-red-500/20 text-red-300 border-red-500/50",
      HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: ThreatSeverity): string => {
    const icons: Record<ThreatSeverity, string> = {
      CRITICAL: "🔴",
      HIGH: "🟠",
      MEDIUM: "🟡",
      LOW: "🟢",
    };
    return icons[severity];
  };

  return (
    <Card as="section">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-heading">🛡️ SDK Threat Management</h2>
          <p className="mt-1 text-sm text-slate-400">Monitor and manage security threats affecting Indian SDKs</p>
        </div>
        <div className="flex gap-3">
          <button
            data-testid="threat-admin-check-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isLoading ? "Checking..." : "Check Now"}
          </button>
          <button
            data-testid="threat-admin-add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            + Add Threat
          </button>
        </div>
      </div>

      {/* Add Threat Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitThreat} className="mb-6 rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/5 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              data-testid="threat-admin-threat-id-input"
              type="text"
              placeholder="Threat ID (CVE-2024-1234)"
              value={formData.threat_id || ""}
              onChange={(e) => setFormData({ ...formData, threat_id: e.target.value })}
              className="rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              required
            />
            <input
              data-testid="threat-admin-sdk-id-input"
              type="text"
              placeholder="Affected SDK ID"
              value={formData.affected_sdk_id || ""}
              onChange={(e) => setFormData({ ...formData, affected_sdk_id: e.target.value })}
              className="rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              required
            />
            <input
              data-testid="threat-admin-versions-input"
              type="text"
              placeholder="Affected Versions (1.0.0-2.0.0)"
              value={formData.affected_versions || ""}
              onChange={(e) => setFormData({ ...formData, affected_versions: e.target.value })}
              className="col-span-2 rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              required
            />
            <input
              data-testid="threat-admin-title-input"
              type="text"
              placeholder="Title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="col-span-2 rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              required
            />
            <textarea
              data-testid="threat-admin-description-textarea"
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-2 rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              rows={3}
              required
            />
            <select
              data-testid="threat-admin-severity-select"
              value={formData.severity || "HIGH"}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as ThreatSeverity })}
              className="rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <input
              data-testid="threat-admin-evidence-url-input"
              type="url"
              placeholder="Evidence URL (optional)"
              value={formData.evidence_url || ""}
              onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
              className="rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
            />
            <textarea
              data-testid="threat-admin-mitigation-textarea"
              placeholder="Mitigation Steps (optional)"
              value={formData.mitigation || ""}
              onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
              className="col-span-2 rounded-lg border border-navy-500 bg-navy-800 px-3 py-2 text-slate-100 placeholder-slate-400"
              rows={2}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              data-testid="threat-admin-create-btn"
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create Threat
            </button>
            <button
              data-testid="threat-admin-form-cancel-btn"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-navy-500 bg-navy-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-navy-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <FilterBar
          label="Severity"
          options={["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => ({ label: s, value: s }))}
          active={filterSeverity}
          onChange={(value) => setFilterSeverity(value as ThreatSeverity | "ALL")}
        />

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-300">Verification Status</label>
          <div className="flex gap-2">
            {["all", "verified", "unverified"].map((status) => (
              <button
                key={status}
                data-testid={`threat-admin-verify-${status}-btn`}
                onClick={() => setFilterVerified(status as any)}
                className={cn("rounded-lg px-3 py-1 text-xs font-semibold transition capitalize", filterVerified === status ? "bg-cyan-600 text-white" : "border border-navy-500 bg-navy-800 text-slate-300 hover:bg-navy-700")}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600">
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Threat ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">SDK</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Title</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Severity</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Source</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Verified</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Reported</th>
            </tr>
          </thead>
          <tbody>
            {filteredThreats.map((threat) => (
              <tr key={threat.id} className={cn("border-b border-navy-600", getSeverityColor(threat.severity))}>
                <td className="px-4 py-3 font-mono text-xs">{threat.threat_id}</td>
                <td className="px-4 py-3">{threat.affected_sdk_id}</td>
                <td className="px-4 py-3 max-w-xs truncate">{threat.title}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{getSeverityIcon(threat.severity)}</span>
                    <span className="font-semibold">{threat.severity}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs font-semibold">{threat.source}</td>
                <td className="px-4 py-3 text-center">
                  {threat.is_verified ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">✓ Verified</span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">⏳ Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(threat.reported_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredThreats.length === 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-300">
          No threats found matching current filters
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <div className="text-2xl font-bold text-red-400">{threats.filter((t) => t.severity === "CRITICAL").length}</div>
          <div className="text-xs text-slate-400">Critical</div>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
          <div className="text-2xl font-bold text-orange-400">{threats.filter((t) => t.severity === "HIGH").length}</div>
          <div className="text-xs text-slate-400">High Risk</div>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="text-2xl font-bold text-emerald-400">{threats.filter((t) => t.is_verified).length}</div>
          <div className="text-xs text-slate-400">Verified</div>
        </div>
        <div className="rounded-lg border border-[var(--ds-border-default)] bg-cyan-500/10 p-3">
          <div className="text-2xl font-bold text-cyan-400">{threats.length}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
      </div>
    </Card>
  );
}
