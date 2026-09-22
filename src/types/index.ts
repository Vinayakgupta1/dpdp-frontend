export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "FP";
export type Verdict = "TRUE_POSITIVE" | "FALSE_POSITIVE" | "CONTEXT_DEPENDENT";

export interface ClassifiedFinding {
  id: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  severity: Severity;
  verdict: Verdict;
  type: string;
  plain_english_summary?: string;
  why_it_matters?: string;
  remediation_code?: string;
  bert_classification?: CodeBERTClassification;
}

export interface CodeBERTClassification {
  finding_id: string;
  exploitability: "HIGH" | "MEDIUM" | "LOW";
  attack_vector: string;
  hardcoded_secret_detected: boolean;
  fix_suggestion: string;
  confidence: number;
  analysis_source: "codebert" | "fallback_rule";
  code_analyzed: string;
}

export interface TrackCCodeDepth {
  overall_score: number;
  results: CodeBERTClassification[];
  high_exploit_count: number;
  secrets_found: number;
}

export interface SmaliAnalysisResult {
  finding_id: string;
  suspicious_patterns: string[];
  behavior_labels: string[];
  confidence: number;
  source: "smali_transformer" | "smali_rules";
}

export interface TrackCSmaliResult {
  enabled: boolean;
  finding_count: number;
  findings: SmaliAnalysisResult[];
}

export interface TrackCResult {
  status: "completed" | "degraded" | "skipped";
  reason?: string;
  decompiled_methods?: number;
  model_enabled?: boolean;
  model_error?: string | null;
  code_depth?: TrackCCodeDepth;
  smali?: TrackCSmaliResult;
}

export interface CostTrackingMetrics {
  total_findings: number;
  rule_engine_calls: number;
  distilbert_calls: number;
  llm_api_calls: number;
  estimated_total_llm_cost_usd: number;
  actual_llm_cost_usd: number;
  cost_saved_usd: number;
}

export interface CostTrackingResponse {
  generated_at: string;
  pricing: {
    llm_cost_per_call_usd: number;
  };
  aggregate: CostTrackingMetrics & {
    scan_count: number;
  };
  per_scan: Array<
    CostTrackingMetrics & {
      scan_id: string;
      package_name: string;
      created_at?: string | null;
    }
  >;
}

export interface DPDPViolation {
  rule_id: string;
  section: string;
  section_title: string;
  obligation: string;
  violation_description: string;
  requirement: string;
  triggered_by_finding: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export type FeedbackLabel = "TP" | "FP" | "UNSURE";

export interface ViolationFeedbackRequest {
  label: FeedbackLabel;
  reason?: string;
  remediated: boolean;
}

export interface ViolationFeedbackRecord {
  id: string;
  scan_id: string;
  violation_id: string;
  user_label: FeedbackLabel;
  reason?: string | null;
  remediated: boolean;
  customer_id: string;
  created_at: string;
  app_name?: string;
  package_name?: string;
  violation?: Record<string, unknown> | null;
}

export interface FeedbackStatsResponse {
  total_labeled: number;
  tp_count: number;
  fp_count: number;
  precision_estimate: number;
}

export interface DPDPSectionScore {
  section: string;
  section_title: string;
  violations_count: number;
  total_penalty_points: number;
  section_score: number;
}

export interface DPDPComplianceReport {
  compliant: boolean;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  violations: DPDPViolation[];
  total_violations: number;
  critical_count: number;
  high_count: number;
  sections_violated: string[];
  section_scores?: Record<string, DPDPSectionScore>;
  total_penalty_exposure_crore?: number;
  summary: string;
  generated_at: string;
}

export interface FindingNarrative {
  finding_id: string;
  title: string;
  plain_english_summary: string;
  why_it_matters: string;
  remediation_code: string;
  severity: string;
}

export interface FullReport {
  scan_id: string;
  app_name: string;
  package_name: string;
  version?: string;
  grade: "A" | "B" | "C" | "D" | string;
  score: number;
  executive_summary: string;
  findings: ClassifiedFinding[];
  narratives: FindingNarrative[];
  dpdp_report: DPDPComplianceReport;
  dpdp_pre_flags?: string[];
  dangerous_combinations?: string[];
  remediation_priorities?: string[];
  degraded_mode?: boolean;
  degraded_reason?: string | null;
  track_b?: {
    risk_label: string;
    risk_score: number;
    confidence: number;
    dangerous_combinations: string[];
    dpdp_pre_flags: string[];
    processing_time_ms: number;
    analysis_mode?: string;
    degraded?: boolean;
  };
  track_c?: TrackCResult;
  track_d?: {
    findings: SmaliAnalysisResult[];
    cost_optimization: {
      scans: number;
      llm_calls: number;
      saved_usd: number;
      savings_percentage: number;
      baseline_cost_usd: number;
      actual_cost_usd: number;
    };
  };
  track_e?: Phase5Result;
  phase5?: Phase5Result; // Alias for track_e
  cost_tracking?: CostTrackingMetrics & {
    generated_at?: string;
  };
  generated_at: string;
}

export interface ScanSummary {
  scan_id: string;
  app_name: string;
  package_name: string;
  grade: "A" | "B" | "C" | "D" | string;
  score: number;
  status: string;
  scan_time: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  dpdp_compliant: boolean;
  has_report?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerThreatDashboardResponse {
  has_critical_threats: boolean;
  critical_threat_count: number;
  critical_threats: Array<{
    id: string;
    threat_id: string;
    affected_sdk_id: string;
    affected_versions: string;
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    evidence_url?: string | null;
    mitigation?: string | null;
    cvss_score?: number | null;
    source: string;
    is_verified: boolean;
    reported_at: string;
    verified_at?: string | null;
    created_at: string;
  }>;
  recent_threats: Array<{
    id: string;
    threat_id: string;
    affected_sdk_id: string;
    affected_versions: string;
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    evidence_url?: string | null;
    mitigation?: string | null;
    cvss_score?: number | null;
    source: string;
    is_verified: boolean;
    reported_at: string;
    verified_at?: string | null;
    created_at: string;
  }>;
  affected_scans_count: number;
}

export interface ScanStatus {
  scan_id: string;
  status: "queued" | "running" | "completed" | "failed";
  stage?: "upload" | "mobsf" | "rules" | "ai" | "report";
  app_name?: string;
  package_name?: string;
  manifest_result?: ManifestRiskResult;
  differential_result?: DriftAnalysis;
}

export interface ManifestRiskResult {
  risk_label:
    | "spyware_risk"
    | "surveillance_risk"
    | "data_theft_risk"
    | "stalkerware_risk"
    | "adware_risk"
    | "review_required"
    | "clean"
    | string;
  risk_score: number;
  confidence: number;
  dangerous_combinations: string[];
  dpdp_pre_flags: string[];
  processing_time_ms: number;
}

export interface DriftAnalysis {
  drift_score: number;
  verdict: "CLEAN" | "BEHAVIORAL_DRIFT" | "MALWARE_ACTIVATION";
  changed_behaviors: string[];
  new_permissions_accessed: string[];
  new_endpoints_contacted: string[];
  new_dynamic_loads: string[];
  confidence: number;
}

export interface RuntimeBehaviorProfile {
  target_pid?: number;
  duration_seconds: number;
  total_events: number;
  high_risk_count: number;
  source?: "ebpf" | "frida" | string;
  syscall_counts?: Record<string, number>;
}

export interface GNNPhase5Result {
  threat_score: number;
  attention_weights: Record<string, number>;
  detected_patterns: string[];
  interpretability_report: string;
}

export interface LlamaLoRAStatus {
  model_source: string;
  model_configured: boolean;
  model_exists: boolean;
  adapter_path: string;
  adapter_configured: boolean;
  adapter_exists: boolean;
  torch_available: boolean;
  transformers_available: boolean;
  peft_available: boolean;
  engine_available: boolean;
  engine_error?: string | null;
  ready: boolean;
}

export interface LlamaLoRAResult {
  status: string;
  summary: string;
  recommendation: string;
  risk_posture: string;
  source: "llama_lora" | "fallback" | string;
  fallback_reason?: string | null;
  generated_at?: string;
}

export interface Phase5Result {
  status: "available" | "degraded" | "unavailable" | string;
  runtime_profile?: RuntimeBehaviorProfile;
  gnn_result?: GNNPhase5Result;
  llama_result?: LlamaLoRAResult;
  ebpf_runtime?: {
    ready?: boolean;
    source_exists?: boolean;
    bcc_available?: boolean;
    bcc_error?: string | null;
  };
  gnn_behavior?: {
    ready?: boolean;
    model_exists?: boolean;
    engine_available?: boolean;
    torch_available?: boolean;
    torch_geometric_available?: boolean;
    engine_error?: string | null;
  };
  llama_behavior?: LlamaLoRAStatus;
  operational?: {
    ebpf_ready?: boolean;
    gnn_ready?: boolean;
    llama_ready?: boolean;
    overall_operational?: boolean;
    missing_requirements?: string[];
  };
  fallback_reason?: string;
  generated_at?: string;
}

export interface DifferentialResponse {
  scan_id: string;
  status: string;
  result?: DriftAnalysis | null;
}
