import axios from "axios";

import {
  ClassifiedFinding,
  CustomerThreatDashboardResponse,
  CostTrackingResponse,
  DPDPComplianceReport,
  DifferentialResponse,
  FullReport,
  FeedbackStatsResponse,
  ManifestRiskResult,
  Phase5Result,
  ScanStatus,
  ScanSummary,
  FeedbackLabel,
  ViolationFeedbackRecord,
  ViolationFeedbackRequest,
  Severity
} from "../types";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "",
  timeout: 20000
});

const SENTINEL_API_KEY_STORAGE = "sentinel_api_key";

const getSentinelApiKey = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedKey = window.localStorage.getItem(SENTINEL_API_KEY_STORAGE) || "";
  return storedKey.trim() || undefined;
};

api.interceptors.request.use((config: any) => {
  const apiKey = getSentinelApiKey();
  if (apiKey) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)["X-Sentinel-Key"] = apiKey;
  }
  return config;
});

const defaultDpdpReport: DPDPComplianceReport = {
  compliant: true,
  risk_level: "LOW",
  violations: [],
  total_violations: 0,
  critical_count: 0,
  high_count: 0,
  sections_violated: [],
  summary: "DPDP mapping not available for this scan output.",
  generated_at: new Date().toISOString()
};

const normalizeSeverity = (value: unknown): Severity => {
  const raw = String(value || "").toUpperCase();
  if (raw === "CRITICAL" || raw === "HIGH" || raw === "MEDIUM" || raw === "LOW") {
    return raw;
  }
  return "LOW";
};

const normalizeStage = (status: unknown): ScanStatus["stage"] => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "queued") return "upload";
  if (normalized === "running") return "mobsf";
  if (normalized === "completed") return "report";
  return "upload";
};

const toClassifiedFinding = (finding: any, index: number): ClassifiedFinding => {
  const severity = normalizeSeverity(finding?.severity);
  return {
    id: String(finding?.id || `finding-${index + 1}`),
    title: String(finding?.title || finding?.name || `Finding ${index + 1}`),
    description: String(finding?.description || finding?.details || "No description provided."),
    reason: String(finding?.reason || finding?.description || "Detected by MobSF static analysis."),
    confidence: Number(finding?.confidence ?? 0.6),
    severity,
    verdict: (String(finding?.verdict || "").toUpperCase() as ClassifiedFinding["verdict"]) || "CONTEXT_DEPENDENT",
    type: String(finding?.type || "MobSF"),
    plain_english_summary: finding?.plain_english_summary,
    why_it_matters: finding?.why_it_matters,
    remediation_code: finding?.remediation_code,
    bert_classification: finding?.bert_classification
  };
};

const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizePhase5 = (data: any): Phase5Result | undefined => {
  const phase5Container = data?.phase5 || data?.track_e || data?.runtime_intelligence;

  const runtimeRaw =
    phase5Container?.runtime_profile ||
    data?.runtime_profile ||
    data?.runtime_behavior ||
    data?.ebpf_profile;

  const gnnRaw =
    phase5Container?.gnn_result ||
    data?.gnn_result ||
    data?.behavior_gnn;

  const ebpfRuntimeRaw =
    phase5Container?.ebpf_runtime ||
    data?.ebpf_runtime;

  const gnnBehaviorRaw =
    phase5Container?.gnn_behavior ||
    data?.gnn_behavior;

  const llamaResultRaw =
    phase5Container?.llama_result ||
    data?.llama_result;

  const llamaBehaviorRaw =
    phase5Container?.llama_behavior ||
    data?.llama_behavior;

  const operationalRaw =
    phase5Container?.operational ||
    data?.operational;

  const hasRuntime = Boolean(runtimeRaw && typeof runtimeRaw === "object");
  const hasGnn = Boolean(gnnRaw && typeof gnnRaw === "object");
  const hasEbpfRuntime = Boolean(ebpfRuntimeRaw && typeof ebpfRuntimeRaw === "object");
  const hasGnnBehavior = Boolean(gnnBehaviorRaw && typeof gnnBehaviorRaw === "object");
  const hasLlamaResult = Boolean(llamaResultRaw && typeof llamaResultRaw === "object");
  const hasLlamaBehavior = Boolean(llamaBehaviorRaw && typeof llamaBehaviorRaw === "object");
  const hasOperational = Boolean(operationalRaw && typeof operationalRaw === "object");

  const fallbackReason = String(
    phase5Container?.fallback_reason ||
    data?.phase5_fallback_reason ||
    ""
  ) || undefined;

  const statusRaw = String(
    phase5Container?.status ||
    data?.phase5_status ||
    data?.track_e_status ||
    (hasRuntime || hasGnn ? "available" : "unavailable")
  ).toLowerCase();

  if (!hasRuntime && !hasGnn && !hasLlamaResult && !hasEbpfRuntime && !hasGnnBehavior && !hasLlamaBehavior && !hasOperational && !fallbackReason && !statusRaw) {
    return undefined;
  }

  const syscallCountsRaw = runtimeRaw?.syscall_counts;
  const syscallCounts: Record<string, number> | undefined = syscallCountsRaw && typeof syscallCountsRaw === "object"
    ? Object.entries(syscallCountsRaw).reduce<Record<string, number>>((acc, [key, value]) => {
      acc[String(key)] = toNumber(value, 0);
      return acc;
    }, {})
    : undefined;

  return {
    status: statusRaw,
    runtime_profile: hasRuntime
      ? {
          target_pid: runtimeRaw.target_pid != null ? toNumber(runtimeRaw.target_pid, 0) : undefined,
          duration_seconds: toNumber(runtimeRaw.duration_seconds ?? runtimeRaw.duration, 0),
          total_events: toNumber(runtimeRaw.total_events, 0),
          high_risk_count: toNumber(runtimeRaw.high_risk_count, 0),
          source: runtimeRaw.source,
          syscall_counts: syscallCounts
        }
      : undefined,
    gnn_result: hasGnn
      ? {
          threat_score: toNumber(gnnRaw.threat_score, 0),
          attention_weights:
            gnnRaw.attention_weights && typeof gnnRaw.attention_weights === "object"
              ? Object.entries(gnnRaw.attention_weights).reduce<Record<string, number>>((acc, [key, value]) => {
                  acc[String(key)] = toNumber(value, 0);
                  return acc;
                }, {})
              : {},
          detected_patterns: Array.isArray(gnnRaw.detected_patterns)
            ? gnnRaw.detected_patterns.map((item: unknown) => String(item))
            : [],
          interpretability_report: String(gnnRaw.interpretability_report || "")
        }
      : undefined,
    llama_result: hasLlamaResult
      ? {
          status: String(llamaResultRaw.status || "unavailable"),
          summary: String(llamaResultRaw.summary || ""),
          recommendation: String(llamaResultRaw.recommendation || ""),
          risk_posture: String(llamaResultRaw.risk_posture || "unknown"),
          source: String(llamaResultRaw.source || "fallback"),
          fallback_reason: llamaResultRaw.fallback_reason ? String(llamaResultRaw.fallback_reason) : undefined,
          generated_at: llamaResultRaw.generated_at ? String(llamaResultRaw.generated_at) : undefined
        }
      : undefined,
    ebpf_runtime: hasEbpfRuntime
      ? {
          ready: Boolean(ebpfRuntimeRaw.ready),
          source_exists: Boolean(ebpfRuntimeRaw.source_exists),
          bcc_available: Boolean(ebpfRuntimeRaw.bcc_available),
          bcc_error: ebpfRuntimeRaw.bcc_error ? String(ebpfRuntimeRaw.bcc_error) : undefined
        }
      : undefined,
    gnn_behavior: hasGnnBehavior
      ? {
          ready: Boolean(gnnBehaviorRaw.ready),
          model_exists: Boolean(gnnBehaviorRaw.model_exists),
          engine_available: Boolean(gnnBehaviorRaw.engine_available),
          torch_available: Boolean(gnnBehaviorRaw.torch_available),
          torch_geometric_available: Boolean(gnnBehaviorRaw.torch_geometric_available),
          engine_error: gnnBehaviorRaw.engine_error ? String(gnnBehaviorRaw.engine_error) : undefined
        }
      : undefined,
    llama_behavior: hasLlamaBehavior
      ? {
          model_source: String(llamaBehaviorRaw.model_source || ""),
          model_configured: Boolean(llamaBehaviorRaw.model_configured),
          model_exists: Boolean(llamaBehaviorRaw.model_exists),
          adapter_path: String(llamaBehaviorRaw.adapter_path || ""),
          adapter_configured: Boolean(llamaBehaviorRaw.adapter_configured),
          adapter_exists: Boolean(llamaBehaviorRaw.adapter_exists),
          torch_available: Boolean(llamaBehaviorRaw.torch_available),
          transformers_available: Boolean(llamaBehaviorRaw.transformers_available),
          peft_available: Boolean(llamaBehaviorRaw.peft_available),
          engine_available: Boolean(llamaBehaviorRaw.engine_available),
          engine_error: llamaBehaviorRaw.engine_error ? String(llamaBehaviorRaw.engine_error) : undefined,
          ready: Boolean(llamaBehaviorRaw.ready)
        }
      : undefined,
    operational: hasOperational
      ? {
          ebpf_ready: Boolean(operationalRaw.ebpf_ready),
          gnn_ready: Boolean(operationalRaw.gnn_ready),
          llama_ready: Boolean(operationalRaw.llama_ready),
          overall_operational: Boolean(operationalRaw.overall_operational),
          missing_requirements: Array.isArray(operationalRaw.missing_requirements)
            ? operationalRaw.missing_requirements.map((item: unknown) => String(item))
            : []
        }
      : undefined,
    fallback_reason: fallbackReason,
    generated_at: phase5Container?.generated_at || data?.phase5_generated_at || undefined
  };
};

const normalizeReport = (data: any, scanId: string): FullReport => {
  if (data && Array.isArray(data.findings) && typeof data.executive_summary === "string") {
    return {
      ...data,
      scan_id: String(data.scan_id || scanId),
      app_name: String(data.app_name || data.package_name || "Unknown App"),
      package_name: String(data.package_name || "unknown.package"),
      findings: data.findings.map((item: unknown, index: number) => toClassifiedFinding(item, index)),
      narratives: Array.isArray(data.narratives) ? data.narratives : [],
      dpdp_report: data.dpdp_report || defaultDpdpReport,
      track_c: data.track_c,
      phase5: normalizePhase5(data),
      generated_at: data.generated_at || new Date().toISOString()
    };
  }

  const rawFindings = Array.isArray(data?.findings) ? data.findings : [];
  const findings = rawFindings.map((item: unknown, index: number) => toClassifiedFinding(item, index));

  return {
    scan_id: scanId,
    app_name: String(data?.app_name || data?.package_name || "Unknown App"),
    package_name: String(data?.package_name || "unknown.package"),
    version: String(data?.version_name || data?.version || "N/A"),
    grade: (["A", "B", "C", "D"] as const).includes(data?.grade) ? data.grade : "D",
    score: Number(data?.score || 0),
    executive_summary:
      "MobSF scan completed. This report shows raw static analysis findings. AI narratives and DPDP mapping are not yet included for this result.",
    findings,
    narratives: [],
    dpdp_report: defaultDpdpReport,
    track_c: data?.track_c,
    phase5: normalizePhase5(data),
    generated_at: new Date().toISOString()
  };
};

export const uploadScan = async (file: File): Promise<{ scan_id: string }> => {
  const form = new FormData();
  form.append("apk_file", file);
  try {
    const { data } = (await api.post("/api/scan", form, {
      // Do not set Content-Type manually. Let the browser include the multipart boundary.
      timeout: 0
    })) as { data: { scan_id: string } };
    return {
      scan_id: String((data as any)?.scan_id || (data as any)?.id || "")
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const detail = (error.response?.data as any)?.error?.message || (error.response?.data as any)?.detail || error.message;
      throw new Error(detail || "Upload failed");
    }
    throw error;
  }
};

export const getScanStatus = async (scanId: string): Promise<ScanStatus> => {
  const { data } = await api.get(`/api/scan/${scanId}`);
  const normalizedStatus = String(data?.status || "queued").toLowerCase() as ScanStatus["status"];

  return {
    scan_id: String(data?.scan_id || data?.id || scanId),
    status: ["queued", "running", "completed", "failed"].includes(normalizedStatus)
      ? normalizedStatus
      : "queued",
    stage: data?.stage || normalizeStage(normalizedStatus),
    app_name: data?.app_name,
    package_name: data?.package_name,
    manifest_result: data?.manifest_result as ManifestRiskResult | undefined,
    differential_result: data?.differential_result
  };
};

export const getReport = async (scanId: string): Promise<FullReport> => {
  const { data } = await api.get(`/api/reports/${scanId}`);
  return normalizeReport(data, scanId);
};

export const getDPDPReport = async (scanId: string): Promise<DPDPComplianceReport> => {
  const { data } = await api.get(`/api/reports/${scanId}/dpdp`);
  return data;
};

export const getAllScans = async (): Promise<ScanSummary[]> => {
  const { data } = await api.get("/api/reports", {
    params: { limit: 20, offset: 0 }
  });

  return (data || []).map((scan: any) => ({
    scan_id: scan.scan_id,
    app_name: scan.app_name || scan.package_name || "Unknown App",
    package_name: scan.package_name,
    grade: String(scan.grade || "N/A"),
    score: Number(scan.score || 0),
    status: scan.status,
    scan_time: scan.created_at || new Date().toISOString(),
    critical_count: Number(scan.critical_count || 0),
    high_count: Number(scan.high_count || 0),
    medium_count: Number(scan.medium_count || 0),
    low_count: Number(scan.low_count || 0),
    dpdp_compliant: Boolean(scan.dpdp_compliant),
    has_report: Boolean(scan.has_report),
    created_at: scan.created_at,
    updated_at: scan.updated_at
  }));
};

export const getCustomerThreatDashboard = async (): Promise<CustomerThreatDashboardResponse> => {
  const { data } = await api.get("/api/customer/threats/dashboard");
  return data;
};

export const startDifferentialAnalysis = async (scanId: string, duration = 60): Promise<DifferentialResponse> => {
  const { data } = await api.post(`/api/scan/${scanId}/differential`, { duration });
  return data;
};

export const getDifferentialAnalysis = async (scanId: string): Promise<DifferentialResponse> => {
  const { data } = await api.get(`/api/scan/${scanId}/differential`);
  return data;
};

export const getCostTracking = async (): Promise<CostTrackingResponse> => {
  const { data } = await api.get("/api/admin/cost-tracking");
  return data;
};

export const submitViolationFeedback = async (
  scanId: string,
  ruleId: string,
  payload: ViolationFeedbackRequest
): Promise<ViolationFeedbackRecord> => {
  const { data } = await api.post(`/api/scan/${scanId}/violations/${ruleId}/feedback`, payload);
  return data;
};

export const getAdminFeedbackStats = async (): Promise<FeedbackStatsResponse> => {
  const { data } = await api.get("/api/admin/feedback-stats");
  return data;
};

export const getAdminFeedback = async (limit = 200, offset = 0): Promise<ViolationFeedbackRecord[]> => {
  const { data } = await api.get("/api/admin/feedback", {
    params: { limit, offset }
  });
  return data;
};

export const exportAdminFeedbackJsonl = async (limit = 10000): Promise<Blob> => {
  const response = await api.get(`/api/admin/feedback/export/jsonl`, {
    params: { limit },
    responseType: "blob"
  });
  return response.data;
};
