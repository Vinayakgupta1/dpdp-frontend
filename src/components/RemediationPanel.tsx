import React, { useState } from "react";
import { Copy, Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface CodeFix {
  code_block: string;
  change_summary: string;
  file_type: "Java" | "Kotlin" | "XML";
  impact: "Low" | "Medium" | "High";
  implementation_effort: "Minimal" | "Low" | "Medium" | "High";
}

interface LegalDisclosure {
  text_en: string;
  text_hi?: string;
  section_reference: string;
  compliance_tags: string[];
}

interface Remediation {
  id: string;
  scan_id: string;
  rule_id: string;
  violation_title: string;
  code_fix: CodeFix;
  legal_disclosure: LegalDisclosure;
  created_at: string;
  generated_by: string;
  confidence: number;
}

interface RemediationPanelProps {
  scanId: string;
  ruleId: string;
  violationTitle: string;
  onClose?: () => void;
}

type TabType = "developer" | "legal";

export const RemediationPanel: React.FC<RemediationPanelProps> = ({
  scanId,
  ruleId,
  violationTitle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("developer");
  const [remediation, setRemediation] = useState<Remediation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedBy, setAppliedBy] = useState("");
  const [appliedNotes, setAppliedNotes] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmittingApplied, setIsSubmittingApplied] = useState(false);

  // Load remediation on mount
  React.useEffect(() => {
    loadRemediation();
  }, [scanId, ruleId]);

  const loadRemediation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reports/${scanId}/remediation/${ruleId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRemediation(data);
      } else if (response.status === 404) {
        // Generate remediation if not found
        await generateRemediation();
      } else {
        setError("Failed to load remediation");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load remediation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateRemediation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reports/${scanId}/remediation/${ruleId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rule_id: ruleId,
            violation_title: violationTitle,
            violation_description: violationTitle,
            dpdp_section: "Section 4",
            severity: "MEDIUM",
            evidence_snippet: "",
            data_type: "user data",
            app_language: "Java",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate remediation");
      const data = await response.json();
      setRemediation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate remediation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleMarkAsApplied = async () => {
    if (!appliedBy.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!remediation) return;

    setIsSubmittingApplied(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reports/${scanId}/remediation/${ruleId}/applied`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applied_by: appliedBy,
            notes: appliedNotes,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark as applied");
      setIsApplied(true);
      setAppliedBy("");
      setAppliedNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark as applied"
      );
    } finally {
      setIsSubmittingApplied(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          <p className="text-slate-400">Generating remediation...</p>
        </div>
      </div>
    );
  }

  if (error && !remediation) {
    return (
      <div className="bg-red-950 border border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!remediation) {
    return null;
  }

  const { code_fix, legal_disclosure } = remediation;

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "Minimal":
        return "bg-green-950 text-green-300";
      case "Low":
        return "bg-emerald-950 text-emerald-300";
      case "Medium":
        return "bg-amber-950 text-amber-300";
      case "High":
        return "bg-red-950 text-red-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Low":
        return "text-green-400";
      case "Medium":
        return "text-amber-400";
      case "High":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-cyan-400 font-heading">
          Remediation Guidance
        </h3>
        <p className="text-sm text-slate-400">{violationTitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-950">
        <button
          data-testid="remediation-dev-tab"
          onClick={() => setActiveTab("developer")}
          className={cn("flex-1 px-4 py-2 text-sm font-medium transition-colors", activeTab === "developer" ? "bg-slate-800 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-slate-300")}
        >
          👨‍💻 Developer Fix
        </button>
        <button
          data-testid="remediation-legal-tab"
          onClick={() => setActiveTab("legal")}
          className={cn("flex-1 px-4 py-2 text-sm font-medium transition-colors", activeTab === "legal" ? "bg-slate-800 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-slate-300")}
        >
          ⚖️ Legal Language
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "developer" && (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Language
                </p>
                <p className="text-sm font-mono text-slate-300">
                  {code_fix.file_type}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Effort
                </p>
                <span
                  className={cn("inline-block px-2 py-1 rounded text-xs font-medium", getEffortColor(
                    code_fix.implementation_effort
                  ))}
                >
                  {code_fix.implementation_effort}
                </span>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Impact
                </p>
                <p className={cn("text-sm font-medium", getImpactColor(code_fix.impact))}>
                  {code_fix.impact} Impact
                </p>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Model
                </p>
                <p className="text-sm font-mono text-slate-300">
                  {remediation.generated_by}
                </p>
              </div>
            </div>

            {/* Code Block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">
                  Patched Code
                </p>
                <button
                  data-testid="remediation-copy-code-btn"
                  onClick={() => copyToClipboard(code_fix.code_block)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 rounded border border-slate-700 p-3 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  {code_fix.code_block}
                </pre>
              </div>
            </div>

            {/* Change Summary */}
            <div className="bg-blue-950 border border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">
                What Changed
              </p>
              <p className="text-sm text-blue-200">{code_fix.change_summary}</p>
            </div>
          </div>
        )}

        {activeTab === "legal" && (
          <div className="space-y-4">
            {/* Section Reference */}
            <div className="bg-slate-800 rounded p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                DPDP Reference
              </p>
              <p className="text-sm font-mono text-slate-300">
                {legal_disclosure.section_reference}
              </p>
            </div>

            {/* Compliance Tags */}
            {legal_disclosure.compliance_tags.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Compliance Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {legal_disclosure.compliance_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">
                  Privacy Disclosure (English)
                </p>
                <button
                  data-testid="remediation-copy-legal-btn"
                  onClick={() => copyToClipboard(legal_disclosure.text_en)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 rounded border border-slate-700 p-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {legal_disclosure.text_en}
                </p>
              </div>
            </div>

            {/* Hindi Version if available */}
            {legal_disclosure.text_hi && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">
                  प्राइवेसी डिस्क्लोजर (हिंदी)
                </p>
                <div className="bg-slate-950 rounded border border-slate-700 p-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {legal_disclosure.text_hi}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Mark as Applied */}
      <div className="bg-slate-950 border-t border-slate-700 p-4 space-y-3">
        {error && activeTab === "developer" && (
          <div className="bg-red-950 border border-red-700 rounded-lg p-2">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        {isApplied && (
          <div className="bg-green-950 border border-green-700 rounded-lg p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-200">
              Remediation marked as applied!
            </span>
          </div>
        )}

        {!isApplied && (
          <>
            <input
              data-testid="remediation-applied-by-input"
              type="text"
              placeholder="Your name (for audit trail)"
              value={appliedBy}
              onChange={(e) => setAppliedBy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              data-testid="remediation-notes-textarea"
              placeholder="Implementation notes (optional)"
              value={appliedNotes}
              onChange={(e) => setAppliedNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              data-testid="remediation-mark-applied-btn"
              onClick={handleMarkAsApplied}
              disabled={!appliedBy.trim() || isSubmittingApplied}
              className={cn("w-full px-4 py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2", appliedBy.trim() && !isSubmittingApplied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed")}
            >
              <Clock className="w-4 h-4" />
              {isSubmittingApplied ? "Marking..." : "Mark as Applied"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RemediationPanel;
