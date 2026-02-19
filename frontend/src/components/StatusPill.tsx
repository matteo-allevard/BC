import type { ReactNode } from "react";

export const StatusPill = ({
  label,
  tone = "info",
  icon
}: {
  label: string;
  tone?: "good" | "warn" | "bad" | "info";
  icon?: ReactNode;
}) => (
  <span className={`pill pill--${tone}`}>
    {icon}
    <span>{label}</span>
  </span>
);
