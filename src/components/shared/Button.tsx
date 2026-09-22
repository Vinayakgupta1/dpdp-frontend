import React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-400 to-teal-400 text-navy-900 font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40",
  secondary:
    "border border-[var(--ds-border-default)] bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10",
  ghost:
    "text-slate-400 hover:text-slate-300 hover:bg-navy-700/50",
  link:
    "text-cyan-300 hover:text-cyan-200 underline underline-offset-2",
  danger:
    "bg-red-600 text-white hover:bg-red-500",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn("inline-flex items-center gap-2 rounded-lg transition-all duration-200", variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
