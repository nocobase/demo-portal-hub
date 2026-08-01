import type { ReactNode } from "react";
import { Link } from "react-router";

import { CreateButton } from "@/components/resources/buttons/create";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Option } from "./constants";

/** USD currency, no cents for the big numbers, cents for line items. */
export function money(value: number | null | undefined, cents = false): string {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
}

/** Compact medium date, e.g. "Jul 12, 2026". */
export function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

/**
 * Colored status / category pill. Pass `label` to render a translated string;
 * otherwise the option's baked-in English label is used.
 */
export function Pill({ option, label }: { option: Option; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        option.tone
      )}
    >
      {label ?? option.label}
    </span>
  );
}

/** Page header shared by every Finance screen. */
export function PageHeader({
  title,
  description,
  createResource,
  createLabel,
  actions,
}: {
  title: string;
  description: string;
  createResource?: string;
  createLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {createResource ? (
          <CreateButton resource={createResource}>{createLabel}</CreateButton>
        ) : null}
      </div>
    </div>
  );
}

/** Compact KPI stat card for the dashboard + list summary rows. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon ? (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                tone ?? "bg-blue-500/12 text-blue-600 dark:text-blue-400"
              )}
            >
              {icon}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** A row-action link styled like the ghost icon buttons in the users module. */
export function IconLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"
    >
      {children}
    </Link>
  );
}
