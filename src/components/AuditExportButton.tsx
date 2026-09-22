import React, { useState } from "react";
import { FileText, Loader } from "lucide-react";
import { cn } from "../lib/utils";

interface AuditExportButtonProps {
  scanId: string;
  appName: string;
  auditorName?: string;
  className?: string;
}

export const AuditExportButton: React.FC<AuditExportButtonProps> = ({
  scanId,
  appName,
  auditorName = "CERT-In Auditor",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      try {
        const stored = window?.localStorage?.getItem("sentinel_api_key") || "";
        if (stored.trim()) headers["X-Sentinel-Key"] = stored.trim();
      } catch {
        // ignore storage errors
      }

      const response = await fetch(
        `/api/reports/${scanId}/audit-trail.pdf?auditor_name=${encodeURIComponent(auditorName)}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "audit-trail.pdf";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename=([^;]+)/);
        if (matches && matches[1]) {
          filename = matches[1].replace(/"/g, "");
        }
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export audit trail"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        data-testid="audit-export-download-btn"
        onClick={handleExport}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all",
          isLoading
            ? "bg-slate-600 text-slate-300 cursor-not-allowed"
            : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
        )}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Download CERT-In Report
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-950 border border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Generates professional audit trail PDF for regulatory filing
      </p>
    </div>
  );
};

export default AuditExportButton;
