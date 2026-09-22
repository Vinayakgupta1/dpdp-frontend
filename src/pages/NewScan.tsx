import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cn } from "../lib/utils";
import { getScanStatus, uploadScan } from "../services/api";
import { ManifestSignalPanel } from "../components/ManifestSignalPanel";

const steps: Array<{ key: string; label: string }> = [
  { key: "upload", label: "Upload" },
  { key: "mobsf", label: "Static Analysis" },
  { key: "rules", label: "Manifest Intelligence" },
  { key: "ai", label: "Evidence Triage" },
  { key: "report", label: "Report Ready" }
];

export default function NewScan(): React.JSX.Element {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.localStorage.getItem("sentinel_api_key") || "";
  });
  const [scanId, setScanId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("sentinel_api_key", apiKey);
  }, [apiKey]);

  const uploadMutation = useMutation({
    mutationFn: uploadScan,
    onSuccess: (result: { scan_id: string }) => {
      setScanId(result.scan_id);
      setIsPolling(true);
    }
  });

  const uploadErrorMessage =
    uploadMutation.error instanceof Error
      ? uploadMutation.error.message
      : "Upload failed. Check backend logs and ensure the analysis service is reachable.";

  const { data: statusData } = useQuery({
    queryKey: ["scan-status", scanId],
    queryFn: () => getScanStatus(scanId as string),
    enabled: Boolean(scanId) && isPolling,
    refetchInterval: 3000
  });

  useEffect(() => {
    if (statusData?.status === "completed" && scanId) {
      setIsPolling(false);
      navigate(`/report/${scanId}`);
    }
    if (statusData?.status === "failed") {
      setIsPolling(false);
    }
  }, [navigate, scanId, statusData?.status]);

  const activeStep = statusData?.stage || (scanId ? "upload" : "");

  const activeIndex = useMemo(
    () => Math.max(steps.findIndex((step) => step.key === activeStep), 0),
    [activeStep]
  );
  const progressPct = Math.round(((activeIndex + 1) / steps.length) * 100);

  const handleFile = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }
    if (!selected.name.toLowerCase().endsWith(".apk")) {
      return;
    }
    setFile(selected);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-[var(--ds-border-default)] bg-navy-700/95 p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.12),transparent_45%)]" />
        <div className="relative">
        <h2 className="mb-2 text-xl font-semibold text-slate-100 font-heading">New APK Scan</h2>
        <p className="mb-4 text-slate-400">
          Catches what MobSF misses. Generates the compliance evidence your legal team needs. Blocks non-compliant
          releases before they hit the Play Store.
        </p>

        <label
          htmlFor="apk-upload"
          data-testid="scan-upload-label"
          className={cn("group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center transition", dragging ? "border-cyan-300 bg-cyan-400/10" : "border-[var(--ds-border-default)] bg-navy-800 hover:border-cyan-300 hover:bg-cyan-400/5")}
          onDragOver={(event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setDragging(false);
            handleFile(event.dataTransfer.files?.[0] || null);
          }}
        >
          <span className="mb-2 text-lg font-semibold text-cyan-300 transition group-hover:text-cyan-200">Drag and drop APK or click to browse</span>
          <span className="text-sm text-slate-400">Only .apk files are accepted</span>
          <input
            id="apk-upload"
            data-testid="scan-upload-input"
            type="file"
            accept=".apk"
            className="hidden"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleFile(event.target.files?.[0] || null);
            }}
          />
        </label>

        <div className="mt-4">
          <label htmlFor="sentinel-api-key" className="mb-2 block text-sm font-medium text-slate-300">
            Sentinel API key
          </label>
          <input
            id="sentinel-api-key"
            data-testid="scan-api-key-input"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste X-Sentinel-Key here"
            className="w-full rounded-lg border border-[var(--ds-border-default)] bg-navy-800 px-4 py-2 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          />
          <p className="mt-1 text-xs text-slate-500">
            Stored locally in your browser and sent as <span className="font-mono">X-Sentinel-Key</span>.
          </p>
        </div>

        {file && (
          <div className="mt-4 rounded-lg border border-[var(--ds-border-default)] bg-navy-800 p-3 text-sm text-slate-300">
            <p className="font-semibold">{file.name}</p>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <button
          data-testid="scan-run-btn"
          disabled={!file || !apiKey.trim() || uploadMutation.isPending}
          onClick={() => file && uploadMutation.mutate(file)}
          className="mt-5 rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-navy-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Running..." : "Run Compliance Check"}
        </button>

        {!apiKey.trim() && (
          <p className="mt-2 text-sm text-amber-300">
            Enter a valid Sentinel API key before uploading, otherwise the backend will reject the scan request.
          </p>
        )}

        {uploadMutation.isError && (
          <p className="mt-3 text-sm text-red-300">
            {uploadErrorMessage}
          </p>
        )}
        </div>
      </div>

      {(scanId || uploadMutation.isSuccess) && (
        <div className="space-y-4 rounded-xl border border-[var(--ds-border-default)] bg-navy-700 p-6 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold font-heading">Scan Progress</h3>
            <span className="font-mono text-sm text-cyan-300">{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <ManifestSignalPanel result={statusData?.manifest_result} compact />

          <div className="space-y-3">
            {steps.map((step, index) => {
              const done = index <= activeIndex;
              const current = index === activeIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={cn("h-3 w-3 rounded-full", done ? "bg-cyan-300" : "bg-navy-600", current ? "animate-pulse" : undefined)}
                  />
                  <span className={cn(done ? "text-slate-100" : "text-slate-500")}>{step.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-slate-400">Status: {statusData?.status || "queued"}</p>
          {statusData?.status === "failed" && (
            <p className="mt-2 text-sm text-red-300">
              Scan failed in backend processing. Check the analysis service and backend logs for details.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
