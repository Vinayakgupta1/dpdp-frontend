import type {
  ClassifiedFinding,
  CustomerThreatDashboardResponse,
  DifferentialResponse,
  DPDPComplianceReport,
  DPDPSectionScore,
  DPDPViolation,
  DriftAnalysis,
  FeedbackStatsResponse,
  FindingNarrative,
  FullReport,
  ManifestRiskResult,
  Phase5Result,
  ScanSummary,
  TrackCResult,
  ViolationFeedbackRecord,
} from "../types";

/**
 * Deterministic demo data for the frontend showcase.
 *
 * The showcase runs entirely in the browser — every service call is resolved
 * from this module so the whole UI can be explored without a backend.
 */

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

interface AppProfile {
  scanId: string;
  appName: string;
  packageName: string;
  version: string;
  score: number;
  grade: "A" | "B" | "C" | "D";
  dpdpCompliant: boolean;
  scannedDaysAgo: number;
  riskLabel: string;
  riskScore: number;
  createdAt: string;
}

const PROFILES: AppProfile[] = [
  {
    scanId: "demo-payprove",
    appName: "PayProve UPI",
    packageName: "com.example.payprove",
    version: "4.2.1",
    score: 38,
    grade: "D",
    dpdpCompliant: false,
    scannedDaysAgo: 1,
    riskLabel: "data_theft_risk",
    riskScore: 91,
    createdAt: daysAgo(1),
  },
  {
    scanId: "demo-rupifast",
    appName: "Rupifast Lending",
    packageName: "com.example.rupifast",
    version: "2.8.0",
    score: 44,
    grade: "C",
    dpdpCompliant: false,
    scannedDaysAgo: 2,
    riskLabel: "spyware_risk",
    riskScore: 84,
    createdAt: daysAgo(2),
  },
  {
    scanId: "demo-growfin",
    appName: "GrowFin Bank",
    packageName: "com.example.growfin",
    version: "3.1.4",
    score: 61,
    grade: "C",
    dpdpCompliant: true,
    scannedDaysAgo: 3,
    riskLabel: "adware_risk",
    riskScore: 58,
    createdAt: daysAgo(3),
  },
  {
    scanId: "demo-sikhepay",
    appName: "SikhePay Wallet",
    packageName: "com.example.sikhepay",
    version: "5.0.2",
    score: 72,
    grade: "B",
    dpdpCompliant: true,
    scannedDaysAgo: 5,
    riskLabel: "review_required",
    riskScore: 41,
    createdAt: daysAgo(5),
  },
  {
    scanId: "demo-loanjini",
    appName: "LoanJini",
    packageName: "com.example.loanjini",
    version: "1.9.3",
    score: 85,
    grade: "A",
    dpdpCompliant: true,
    scannedDaysAgo: 7,
    riskLabel: "clean",
    riskScore: 18,
    createdAt: daysAgo(7),
  },
  {
    scanId: "demo-kosmos",
    appName: "Kosmos Credit",
    packageName: "com.example.kosmoscredit",
    version: "2.3.7",
    score: 27,
    grade: "D",
    dpdpCompliant: false,
    scannedDaysAgo: 9,
    riskLabel: "surveillance_risk",
    riskScore: 96,
    createdAt: daysAgo(9),
  },
];

function profileToSummary(p: AppProfile): ScanSummary {
  const critical = p.dpdpCompliant ? 0 : 2;
  const high = p.dpdpCompliant ? 0 : 1;
  const medium = p.dpdpCompliant ? 1 : 2;
  const low = p.dpdpCompliant ? 5 : 7;
  return {
    scan_id: p.scanId,
    app_name: p.appName,
    package_name: p.packageName,
    grade: p.grade,
    score: p.score,
    status: "completed",
    scan_time: p.createdAt,
    critical_count: critical,
    high_count: high,
    medium_count: medium,
    low_count: low,
    dpdp_compliant: p.dpdpCompliant,
    has_report: true,
    created_at: p.createdAt,
    updated_at: p.createdAt,
  };
}

export function getDemoScans(): ScanSummary[] {
  return PROFILES.map(profileToSummary);
}

/* ───────────────────────── Findings & narratives ───────────────────────── */

interface FindingSpec {
  key: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  type: string;
  summary: string;
  why: string;
  code: string;
  attackVector: string;
  codeSample: string;
  secretDetected?: boolean;
}

const FINDING_SPECS: FindingSpec[] = [
  {
    key: "consent",
    title: "Contacts data collected without explicit consent",
    severity: "CRITICAL",
    type: "Privacy",
    summary: "Your contacts are read before you can consent.",
    why: "Section 4 of the DPDP Act 2023 requires free and informed consent before processing personal data.",
    code: "gatedConsent() {\n  const ok = await requestConsent(READ_CONTACTS);\n  if (ok) uploadContacts();\n}",
    attackVector: "Network exfiltration",
    codeSample: "readContacts();\nuploadContacts();",
  },
  {
    key: "location",
    title: "Precise location shared with third-party SDKs",
    severity: "CRITICAL",
    type: "Privacy",
    summary: "Your location is told to companies you were never informed about.",
    why: "Disclosure of third-party recipients is required under Section 8 of the DPDP Act 2023.",
    code: "adsSdk.init({ location: consented ? location : null });",
    attackVector: "Third-party disclosure",
    codeSample: "adsSdk.init({ location: preciseLocation });",
  },
  {
    key: "cleartext",
    title: "Cleartext HTTP traffic permitted",
    severity: "HIGH",
    type: "MobSF",
    summary: "App traffic can travel without encryption.",
    why: "Personal data in transit must be protected against interception.",
    code: 'android:usesCleartextTraffic="false"',
    attackVector: "Man-in-the-middle",
    codeSample: "fetch('http://api.example.com/v2/');",
  },
  {
    key: "exported",
    title: "Exportable component exposing login intents",
    severity: "HIGH",
    type: "Mobile",
    summary: "Another app on your device could reach your login flow.",
    why: "Exported components widen the attack surface for session theft.",
    code: 'android:exported="false"',
    attackVector: "Intent redirection",
    codeSample: '<activity android:name=".OAuthRedirect" android:exported="true" />',
  },
  {
    key: "hardcoded-key",
    title: "Hardcoded API key shipped in resources",
    severity: "CRITICAL",
    type: "Code Quality",
    summary: "A real secret ships inside the APK and can be extracted by anyone.",
    why: "Extracted keys let attackers call your backend with the app's identity.",
    code: "// rotate the key server-side; never ship secrets in the APK",
    attackVector: "Hardcoded secret",
    codeSample: 'String API_KEY = "pay_live_xxxxxxxxxxxxxxxxxxxxxxxx";',
    secretDetected: true,
  },
  {
    key: "retention",
    title: "Data retention policy not documented",
    severity: "MEDIUM",
    type: "Privacy",
    summary: "It is not clear when your data is deleted.",
    why: "Section 6 requires transparency about how long personal data is kept.",
    code: "// publish a retention window and delete-on-demand flow",
    attackVector: "Compliance gap",
    codeSample: "retentionPolicy = undefined;",
  },
  {
    key: "ipa",
    title: "Weak cryptographic algorithm used for stored data",
    severity: "MEDIUM",
    type: "Mobile App",
    summary: "Stored data may not use the strongest available protection.",
    why: "Weak crypto reduces the cost of subverting the trust chain.",
    code: "key_derivation = PBKDF2(password, salt, iterations);",
    attackVector: "Weak cryptography",
    codeSample: "hash = md5(secret);",
  },
];

function makeFindings(p: AppProfile): ClassifiedFinding[] {
  return FINDING_SPECS.map((spec) => {
    const id = `${p.scanId}-${spec.key}`;
    const isIpa = spec.key === "ipa";
    return {
      id,
      title: spec.title,
      description: `${spec.title}. Behaviour detected during the demo analysis of ${p.appName}.`,
      reason: `${spec.title} in ${p.packageName}`,
      confidence: isIpa ? 0.62 : spec.severity === "CRITICAL" ? 0.92 : 0.81,
      severity: spec.severity,
      verdict: isIpa ? "FALSE_POSITIVE" : "TRUE_POSITIVE",
      type: spec.type,
      plain_english_summary: spec.summary,
      why_it_matters: spec.why,
      remediation_code: spec.code,
      bert_classification: isIpa
        ? undefined
        : {
            finding_id: id,
            exploitability: spec.severity === "MEDIUM" ? "MEDIUM" : "HIGH",
            attack_vector: spec.attackVector,
            hardcoded_secret_detected: Boolean(spec.secretDetected),
            fix_suggestion: spec.code,
            confidence: 0.9,
            analysis_source: "codebert",
            code_analyzed: spec.codeSample,
          },
    };
  });
}

function makeNarratives(findings: ClassifiedFinding[]): FindingNarrative[] {
  return findings.map((f) => ({
    finding_id: f.id,
    title: f.title,
    plain_english_summary: f.plain_english_summary || f.reason,
    why_it_matters: f.why_it_matters || "Ensures continuous DPDP compliance.",
    remediation_code: f.remediation_code || "// review this code path",
    severity: f.severity,
  }));
}

/* ───────────────────────────── DPDP compliance ───────────────────────────── */

function makeSectionScores(p: AppProfile): Record<string, DPDPSectionScore> {
  const c = p.dpdpCompliant;
  return {
    "4(11)": {
      section: "4(11)",
      section_title: "Consent",
      violations_count: c ? 0 : 2,
      total_penalty_points: c ? 0 : 28,
      section_score: c ? 94 : 28,
    },
    "6": {
      section: "6",
      section_title: "Transparency and fairness",
      violations_count: c ? 0 : 1,
      total_penalty_points: c ? 0 : 10,
      section_score: c ? 91 : 44,
    },
    "8": {
      section: "8",
      section_title: "Rights of the Principal",
      violations_count: c ? 0 : 1,
      total_penalty_points: c ? 0 : 14,
      section_score: c ? 95 : 30,
    },
  };
}

function makeViolations(p: AppProfile): DPDPViolation[] {
  if (p.dpdpCompliant) {
    return [];
  }
  return [
    {
      rule_id: `${p.scanId}-dpdp-4-1`,
      section: "4(11)",
      section_title: "Consent",
      obligation: "Free and informed consent before processing personal data.",
      violation_description: "Personal data is processed before explicit consent is collected.",
      requirement: "Show a consent screen and collect an explicit opt-in.",
      triggered_by_finding: `${p.scanId}-consent`,
      severity: "CRITICAL",
    },
    {
      rule_id: `${p.scanId}-dpdp-8-1`,
      section: "8",
      section_title: "Rights of User",
      obligation: "Disclose third-party recipients of personal data.",
      violation_description: "Location data is shared with SDKs not disclosed in the policy.",
      requirement: "List each recipient category and purpose.",
      triggered_by_finding: `${p.scanId}-location`,
      severity: "CRITICAL",
    },
    {
      rule_id: `${p.scanId}-dpdp-6-1`,
      section: "6",
      section_title: "Transparency",
      obligation: "Document the purpose and duration of storage.",
      violation_description: "Retention window is not documented.",
      requirement: "State how long personal data is kept.",
      triggered_by_finding: `${p.scanId}-retention`,
      severity: "HIGH",
    },
  ];
}

function makeDpdp(p: AppProfile): DPDPComplianceReport {
  const violations = makeViolations(p);
  const c = p.dpdpCompliant;
  return {
    compliant: c,
    risk_level: c ? "LOW" : p.score >= 60 ? "HIGH" : "CRITICAL" as const,
    violations,
    total_violations: c ? 0 : violations.length,
    critical_count: c ? 0 : 2,
    high_count: c ? 0 : 1,
    sections_violated: c ? [] : ["4(11)", "8", "6"],
    section_scores: makeSectionScores(p),
    total_penalty_exposure_crore: c ? 0 : p.score >= 60 ? 6.4 : 14.8,
    summary: c
      ? "The app meets the evaluated DPDP Act 2023 obligations; no violations were raised."
      : `${p.appName} has ${violations.length} mapped violations, with consent and disclosure gaps flagged as critical.`,
    generated_at: p.createdAt,
  };
}

/* ───────────────────────────── Track-C / Track-E ───────────────────────────── */

function makeTrackC(p: AppProfile): TrackCResult {
  const findings = makeFindings(p);
  return {
    status: "completed",
    reason: "Static code-depth analysis mapped findings to code paths and exploitability scores.",
    decompiled_methods: 128_400 - p.score * 1_000,
    code_depth: {
      overall_score: p.score,
      results: findings
        .filter((f) => f.bert_classification)
        .slice(0, 3)
        .map((f) => f.bert_classification!),
      high_exploit_count: p.dpdpCompliant ? 0 : 2,
      secrets_found: p.riskLabel === "data_theft_risk" ? 1 : 0,
    },
  };
}

function makePhase5(p: AppProfile): Phase5Result {
  if (p.dpdpCompliant && p.score >= 80) {
    return {
      status: "available",
      runtime_profile: {
        duration_seconds: p.scanId === "demo-loanjini" ? 87 : 66,
        total_events: p.scanId === "demo-loanjini" ? 1_420 : 2_380,
        high_risk_count: 1,
        source: "ebpf",
        syscall_counts: { openat: 41, read: 220, write: 40, connect: 9 },
      },
      gnn_result: {
        threat_score: 0.08,
        attention_weights: { bind: 0.42, network: 0.31, storage: 0.27 },
        detected_patterns: [],
        interpretability_report: "No high-confidence runtime behaviour pattern was detected.",
      },
      llama_result: {
        status: "available",
        summary: "Runtime profile indicates healthy behaviour with no exfiltration patterns.",
        recommendation: "Continue to ship with existing monitoring.",
        risk_posture: "low",
        source: "llama_lora",
      },
      ebpf_runtime: { ready: true, source_exists: true, bcc_available: true },
      gnn_behavior: {
        ready: true,
        model_exists: true,
        engine_available: true,
        torch_available: true,
        torch_geometric_available: true,
      },
      generated_at: p.createdAt,
    };
  }

  if (p.riskLabel === "surveillance_risk") {
    return {
      status: "available",
      runtime_profile: {
        duration_seconds: 540,
        total_events: 8_212,
        high_risk_count: 22,
        source: "ebpf",
        syscall_counts: { openat: 130, access: 214, connect: 89, sendto: 212, write: 66, execve: 4 },
      },
      gnn_result: {
        threat_score: 0.87,
        attention_weights: { clipboard: 0.52, location: 0.31, contacts: 0.17 },
        detected_patterns: [
          "clipboard scrape loop",
          "high-frequency location sampling",
          "periodic IMEI read",
        ],
        interpretability_report: "Behavioural risk score 87 — high confidence that data-harvesting patterns are active during use.",
      },
      llama_result: {
        status: "available",
        summary: "Runtime collection reveals contact and clipboard harvesting under the consent surface.",
        recommendation: "Block the release until data-minimisation controls are applied.",
        risk_posture: "critical",
        source: "llama_lora",
      },
      ebpf_runtime: { ready: true, source_exists: true, bcc_available: true },
      gnn_behavior: {
        ready: true,
        model_exists: true,
        engine_available: true,
        torch_available: true,
        torch_geometric_available: true,
      },
      llama_behavior: {
        model_source: "meta-llama/Llama-3.1-8B",
        model_configured: true,
        model_exists: true,
        adapter_path: "/models/dpdp-adapter",
        adapter_configured: true,
        adapter_exists: true,
        torch_available: true,
        transformers_available: true,
        peft_available: true,
        engine_available: true,
        ready: true,
      },
      generated_at: p.createdAt,
    };
  }

  return {
    status: "unavailable",
    fallback_reason: "Runtime telemetry was not collected for this scan.",
    operational: {
      ebpf_ready: false,
      gnn_ready: false,
      llama_ready: false,
      overall_operational: false,
      missing_requirements: ["Live Permission Audit source (eBPF)", "Behavioural model (GNN)"],
    },
  };
}

/* ───────────────────────────── Reports ───────────────────────────── */

function buildReport(p: AppProfile): FullReport {
  const findings = makeFindings(p);
  const violCount = p.dpdpCompliant ? 0 : 3;
  return {
    scan_id: p.scanId,
    app_name: p.appName,
    package_name: p.packageName,
    version: p.version,
    grade: p.grade,
    score: p.score,
    executive_summary: p.dpdpCompliant
      ? `${p.appName} passed the evaluated DPDP Act 2023 obligations with a compliance score of ${p.score}/100.`
      : `${p.appName} shows significant DPDP compliance gaps. ${p.score}/100 compliance score and ${violCount} mapped violations need to be resolved before release.`,
    findings,
    narratives: makeNarratives(findings),
    dpdp_report: makeDpdp(p),
    track_c: makeTrackC(p),
    phase5: makePhase5(p),
    cost_tracking: {
      generated_at: p.createdAt,
      total_findings: findings.length,
      rule_engine_calls: findings.length * 2,
      distilbert_calls: findings.length,
      llm_api_calls: 0,
      estimated_total_llm_cost_usd: 0,
      actual_llm_cost_usd: 0,
      cost_saved_usd: findings.length * 0.006,
    },
    generated_at: p.createdAt,
  };
}

function byScanId(scanId: string): AppProfile {
  const found = PROFILES.find((p) => p.scanId === scanId);
  if (found) {
    return found;
  }
  return {
    scanId,
    appName: `New Scan ${scanId.slice(-5)}`,
    packageName: `com.example.${scanId}`,
    version: "1.0.0",
    score: 64,
    grade: "C",
    dpdpCompliant: false,
    scannedDaysAgo: 0,
    riskLabel: "review_required",
    riskScore: 52,
    createdAt: new Date().toISOString(),
  };
}

/* ───────────────────────────── Public API ───────────────────────────── */

export function getDemoReport(scanId: string): FullReport {
  return buildReport(byScanId(scanId));
}

export function getDemoManifestRisk(scanId: string): ManifestRiskResult {
  const p = byScanId(scanId);
  return {
    risk_label: p.riskLabel,
    risk_score: p.riskScore,
    confidence: 0.93,
    dangerous_combinations:
      p.riskLabel === "clean"
        ? []
        : [
            "high-risk permission pair (contacts + network)",
            "background sensor sampling enabled",
          ],
    dpdp_pre_flags:
      p.riskLabel === "clean"
        ? []
        : ["Section 4(11) consent gap", "Section 8 third-party sharing"],
    processing_time_ms: 384,
  };
}

export function getDemoReportDifferential(scanId: string): DifferentialResponse {
  const byCompliant = byScanId(scanId);
  const drift: DriftAnalysis = byCompliant.dpdpCompliant
    ? {
        verdict: "CLEAN",
        drift_score: 0.02,
        confidence: 0.93,
        changed_behaviors: [],
        new_permissions_accessed: [],
        new_endpoints_contacted: [],
        new_dynamic_loads: [],
      }
    : {
        verdict: "MALWARE_ACTIVATION",
        drift_score: 0.79,
        confidence: 0.82,
        changed_behaviors: ["started uploading contacts at runtime", "enabled location sampling"],
        new_permissions_accessed: ["READ_CONTACTS", "ACCESS_FINE_LOCATION"],
        new_endpoints_contacted: ["post-api.example.com/ingest"],
        new_dynamic_loads: ["dex-downloader/classes2.dex"],
      };
  return { scan_id: scanId, status: "completed", result: drift };
}

export function getDemoThreatDashboard(): CustomerThreatDashboardResponse {
  const threat = {
    id: "thr-1001",
    threat_id: "sdklib101",
    affected_sdk_id: "com.adnetwork.pulse",
    affected_versions: ">=3.0.0 <3.4.1",
    title: "Pulse SDK collects location without user consent",
    description: "Pulse advertising SDK turns on location collection when the app is backgrounding.",
    severity: "CRITICAL" as const,
    evidence_url: null,
    mitigation: "Ship >= 3.4.1 or drop the SDK from the base manifest.",
    cvss_score: 8.6,
    source: "sentinel-registry",
    is_verified: true,
    reported_at: hoursAgo(20),
    verified_at: hoursAgo(6),
    created_at: daysAgo(2),
  };
  const recent = [
    {
      id: "thr-1002",
      threat_id: "sdklib202",
      affected_sdk_id: "io.presage",
      affected_versions: "<2.9.0",
      title: "Presage analytics receives notification texts",
      description: "Notification-content collection reported in Presage SDK versions below 2.9.0.",
      severity: "HIGH" as const,
      evidence_url: null,
      mitigation: "Upgrade to 2.9.0+.",
      cvss_score: 7.1,
      source: "sentinel-alpha",
      is_verified: true,
      reported_at: daysAgo(3),
      created_at: daysAgo(3),
    },
  ];
  return {
    has_critical_threats: true,
    critical_threat_count: 1,
    critical_threats: [threat],
    recent_threats: [threat, recent[0]],
    affected_scans_count: 2,
  };
}

export interface DemoThreat {
  sdk_id: string;
  sdk_name: string;
  version: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  risk_score: number;
  threat_count: number;
  affected_apps: Array<{
    app_name: string;
    package_name: string;
    version?: string;
    severity: string;
    status: string;
  }>;
}

export function getDemoThreats(): DemoThreat[] {
  const app = (p: AppProfile) => ({
    app_name: p.appName,
    package_name: p.packageName,
    version: p.version,
    severity: p.dpdpCompliant ? "MEDIUM" : "CRITICAL",
    status: p.dpdpCompliant ? "monitoring" : "action_required",
  });
  return [
    {
      sdk_id: "com.adobe.pulse",
      sdk_name: "Adobe Pulse Ads",
      version: "3.2.1",
      severity: "CRITICAL",
      risk_score: 92,
      threat_count: 2,
      affected_apps: PROFILES.slice(0, 4).map(appProfile),
    },
    {
      sdk_id: "io.presage",
      sdk_name: "Presage Analytics",
      version: "2.8.3",
      severity: "CRITICAL",
      risk_score: 86,
      threat_count: 2,
      affected_apps: PROFILES.slice(1, 3).map(appProfile),
    },
    {
      sdk_id: "com.squad.inappcards",
      sdk_name: "SquadCards SDK",
      version: "1.4.0",
      severity: "HIGH",
      risk_score: 71,
      threat_count: 1,
      affected_apps: PROFILES.filter((p) => !p.dpdpCompliant).map(appProfile),
    },
  ];
}

export function getDemoLabels(): FeedbackStatsResponse {
  return {
    total_labeled: 612,
    tp_count: 512,
    fp_count: 36,
    precision_estimate: 0.94,
  };
}

export function getDemoFeedbackRecords(): ViolationFeedbackRecord[] {
  const records: ViolationFeedbackRecord[] = [
    {
      id: "fb-1",
      scan_id: "demo-payprove",
      violation_id: "demo-payprove-dpdp-4-1",
      user_label: "TP",
      reason: "Confirmed on device B.",
      remediated: false,
      customer_id: "cust_a1",
      created_at: hoursAgo(3),
      app_name: "PayProve UPI",
      package_name: "com.example.payprove",
    },
    {
      id: "fb-2",
      scan_id: "demo-payprove",
      violation_id: "demo-payprove-dpdp-8-1",
      user_label: "TP",
      reason: "Location breadcrumbs matched.",
      remediated: true,
      customer_id: "cust_a1b2",
      created_at: hoursAgo(5),
      app_name: "PayProve UPI",
      package_name: "com.example.payprove",
    },
    {
      id: "fb-3",
      scan_id: "demo-growfin",
      violation_id: "demo-growfin-dpdp-6-1",
      user_label: "FP",
      reason: "Retention already documented in the legal page.",
      remediated: false,
      customer_id: "cust_c3d4",
      created_at: daysAgo(1),
      app_name: "GrowFin Bank",
      package_name: "com.example.growfin",
    },
  ];
  return records;
}

export function getDemoAuditTrailText(scanId: string): string {
  const p = byScanId(scanId);
  const lines = [
    "DPDP Sentinel — Audit Trail (demo)",
    "================================",
    "",
    `Scan ID : ${p.scanId}`,
    `App     : ${p.appName} (${p.packageName})`,
    `Version : ${p.version}`,
    `Score   : ${p.score}/100`,
    `Grade   : ${p.grade}`,
    `Findings: ${p.dpdpCompliant ? 0 : 3} DPDP violations mapped`,
    "",
    "This file was generated in offline demo mode by",
    "the frontend showcase and is not a real audit record.",
  ];
  return lines.join("\n");
}