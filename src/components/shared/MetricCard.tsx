import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  color?: string;
}

const accentMap: Record<string, string> = {
  cyan: "text-cyan-400",
  red: "text-red-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  violet: "text-violet-300",
};

const borderMap: Record<string, string> = {
  cyan: "border-[var(--ds-border-default)] hover:border-cyan-500/30",
  red: "border-red-500/20 hover:border-red-400/40",
  amber: "border-amber-500/20 hover:border-amber-400/40",
  emerald: "border-emerald-500/20 hover:border-emerald-400/40",
  violet: "border-violet-500/20 hover:border-violet-400/40",
};

const glowMap: Record<string, string> = {
  cyan: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]",
  red: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.08)]",
  amber: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]",
  emerald: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.08)]",
  violet: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
};

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  color = "cyan",
}: MetricCardProps): React.JSX.Element {
  const accentClass = accentMap[color] || "text-cyan-400";
  const borderClass = borderMap[color] || "border-[var(--ds-border-default)] hover:border-[var(--ds-border-hover)]";
  const glowClass = glowMap[color] || "";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-gradient-to-br from-navy-700/80 to-navy-800/60 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        borderClass,
        glowClass
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: color === "cyan" ? "radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)" :
                     color === "red" ? "radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)" :
                     color === "amber" ? "radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)" :
                     color === "emerald" ? "radial-gradient(circle, rgba(52,211,153,0.08), transparent 70%)" :
                     "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)"
        }}
      />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 font-heading">
            {title}
          </h3>
          <div
            className={cn(accentClass, "opacity-60 transition group-hover:opacity-100")}
          >
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-3xl font-bold tracking-tight", accentClass)}>
            {value}
          </p>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {trend === "up" ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Improving</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-400">Needs attention</span>
              </>
            )}
          </div>
        )}
        {subtitle && (
          <p className="mt-2 text-[11px] text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
