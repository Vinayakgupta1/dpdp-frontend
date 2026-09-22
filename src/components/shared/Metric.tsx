import React from "react";
import { cn } from "../../lib/utils";

interface MetricProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function Metric({ label, value, mono }: MetricProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800/50 px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-1 font-mono text-lg font-semibold text-slate-100", mono && "font-mono")}>{value}</p>
    </div>
  );
}
