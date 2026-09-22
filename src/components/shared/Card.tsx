import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  hover?: boolean;
  gradient?: boolean;
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
  hover = false,
  gradient = false,
}: CardProps): React.JSX.Element {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-[var(--ds-border-default)] p-5 shadow-card",
        gradient && "card-gradient",
        hover && "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </Tag>
  );
}
