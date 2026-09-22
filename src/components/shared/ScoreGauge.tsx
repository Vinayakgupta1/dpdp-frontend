import React from "react";
import { cn } from "../../lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export function ScoreGauge({
  score,
  size = 140,
  className = "",
  style,
  showLabel = true,
}: ScoreGaugeProps): React.JSX.Element {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (safeScore / 100) * circumference;

  const gaugeColor =
    safeScore >= 80
      ? "#34D399"
      : safeScore >= 60
        ? "#FBBF24"
        : "#EF4444";

  const glowColor =
    safeScore >= 80
      ? "rgba(52,211,153,0.3)"
      : safeScore >= 60
        ? "rgba(251,191,36,0.3)"
        : "rgba(239,68,68,0.3)";

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size, ...style }}
    >
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <defs>
          <filter id={`glow-${safeScore}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={gaugeColor}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {showLabel && (
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Score
          </p>
        )}
        <p className="font-mono text-3xl font-bold tracking-tight text-slate-100">
          {safeScore}
        </p>
      </div>
    </div>
  );
}
