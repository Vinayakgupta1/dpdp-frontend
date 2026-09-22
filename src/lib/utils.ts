import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cx(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export type AnalysisSource = "codebert" | "fallback_rule";

export function analysisSourceLabel(source?: AnalysisSource | string | null): string {
  if (source === "codebert") return "model inference";
  if (source === "fallback_rule" || source == null) return "rule-based estimate";
  return String(source);
}

export function analysisSourceMode(modelEnabled?: boolean): string {
  return modelEnabled ? "model inference enabled" : "rule-based estimate mode";
}
