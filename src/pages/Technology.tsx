import React from "react";
import { Shield, Filter, Code, Cpu, Radio, BarChart3, Sparkles } from "lucide-react";
import { GlassPanel } from "../components/shared/GlassPanel";

interface Props {
  language?: string;
}

const features = [
  {
    title: "DPDP Rule Engine",
    icon: Shield,
    description:
      "Deterministic, YAML-driven rules map validated findings to DPDP Act 2023 sections. The engine produces section-level verdicts, scores, and penalty exposure in business language for auditors and release managers.",
  },
  {
    title: "Evidence Triage",
    icon: Filter,
    description:
      "Filters noisy findings from underlying scanners so teams focus on actionable issues. Presented as a customer-facing label that explains why an item was deprioritised.",
  },
  {
    title: "Code Exploitability Check",
    icon: Code,
    description:
      "Scoped code-level analysis that verifies whether flagged issues map to real, exploitable code paths\u2014presented as clear exploitability guidance (High/Medium/Low) to developers.",
  },
  {
    title: "Indian SDK Intelligence",
    icon: Cpu,
    description:
      "Automatically detects Indian fintech SDKs and maps common SDK behaviours to DPDP risk categories. Includes registry-based detections and version intelligence for known SDK vulnerabilities.",
  },
  {
    title: "Runtime Monitoring (Enterprise)",
    icon: Radio,
    description:
      "Enterprise-only live permission audits paired with behavioural scoring to detect runtime permission abuse and data exfiltration. Shown in the UI as \u201CLive Permission Audit\u201D and \u201CBehavioral Risk Score\u201D for clarity.",
  },
  {
    title: "Verified Claims",
    icon: BarChart3,
    description: "",
    bullets: [
      "47% reduction in noisy findings vs raw MobSF",
      "97.4% deterministic precision on rule-based classification",
      "0 critical false positives in benchmark testing",
      "Maps to all relevant DPDP Act 2023 sections",
      "30+ Indian fintech SDKs detected automatically",
    ],
  },
  {
    title: "Customer-driven labeling loop",
    icon: Sparkles,
    description:
      "DPDP Sentinel learns from every Indian fintech app scanned. Each customer confirmation makes the model more accurate for Indian apps, Indian SDKs, and Indian regulatory patterns. International tools cannot replicate this dataset.",
    extra: "Future work: publish the State of DPDP Compliance in Indian Fintech 2027.",
  },
];

export default function Technology({ language }: Props): React.JSX.Element {
  return (
    <div className="animate-fade-in space-y-6">
      <GlassPanel className="rounded-xl p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            Platform
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100 font-heading">
            How DPDP Sentinel Works
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            A concise, compliance-focused overview of DPDP Sentinel capabilities.
          </p>
        </div>
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <section
              key={feature.title}
              className="group rounded-xl border border-[var(--ds-border-default)] bg-navy-700/40 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ds-border-hover)] hover:shadow-card-hover"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Icon className="h-4 w-4 text-cyan-400" />
                </div>
                <h2 className="text-sm font-semibold text-slate-100 font-heading">
                  {feature.title}
                </h2>
              </div>
              {feature.description && (
                <p className="text-xs leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              )}
              {feature.bullets && (
                <ul className="mt-3 space-y-1.5">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-xs text-slate-400"
                    >
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan-400/60" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
              {feature.extra && (
                <p className="mt-3 text-xs italic text-slate-500">
                  {feature.extra}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
