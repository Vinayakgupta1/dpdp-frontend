import React from "react";
import { cn } from "../lib/utils";

type Grade = "A" | "B" | "C" | "D" | "N/A";

interface GradeBadgeProps {
  grade: Grade | string;
  large?: boolean;
}

const gradeColorMap: Record<Grade, string> = {
  A: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  B: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
  C: "bg-orange-500/20 text-orange-300 border-orange-400/40",
  D: "bg-red-500/20 text-red-300 border-red-400/40",
  "N/A": "bg-slate-500/20 text-slate-300 border-slate-400/40"
};

export function GradeBadge({ grade, large = false }: GradeBadgeProps): React.JSX.Element {
  const gradeKey = ["A", "B", "C", "D", "N/A"].includes(grade) ? (grade as Grade) : "N/A";

  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-3 py-1 font-mono font-semibold", large ? "text-xl px-5 py-2" : "text-sm", gradeColorMap[gradeKey])}
    >
      Grade {grade}
    </span>
  );
}
