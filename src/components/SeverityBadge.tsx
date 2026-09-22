import React from "react";

import { cn } from "../lib/utils";
import { Severity } from "../types";

interface SeverityBadgeProps {
  severity: Severity;
}

const severityClass: Record<Severity, string> = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  MEDIUM: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
  LOW: "bg-blue-400/20 text-blue-300 border-blue-400/40",
  FP: "bg-gray-500/20 text-gray-300 border-gray-500/40"
};

export function SeverityBadge({ severity }: SeverityBadgeProps): React.JSX.Element {
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", severityClass[severity])}>
      {severity}
    </span>
  );
}
