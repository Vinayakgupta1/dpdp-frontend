import React from "react";
import { cn } from "../../lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  light?: boolean;
  hover?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  as: Tag = "section",
  light = false,
  hover = true,
  ...rest
}: GlassPanelProps & React.HTMLAttributes<HTMLElement>): React.JSX.Element {
  return (
    <Tag
      className={cn(
        light ? "glass-panel-light" : "glass-panel",
        hover && "cursor-default",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
