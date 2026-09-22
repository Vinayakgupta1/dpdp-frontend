import React from "react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 32, className = "", text }: LoadingSpinnerProps): React.JSX.Element {
  return (
    <div className={cn("flex min-h-[400px] items-center justify-center", className)}>
      <div className="text-center">
        <div
          className="mx-auto mb-4 animate-spin rounded-full border-2 border-[var(--ds-border-default)] border-t-[var(--ds-border-default)]"
          style={{ width: size, height: size }}
        />
        {text && <p className="text-sm text-slate-400">{text}</p>}
      </div>
    </div>
  );
}
