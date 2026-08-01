import type { useTranslate } from "@refinedev/core";

// ---------------------------------------------------------------------------
// Enum option sets — labels live here, DB columns store the plain value.
// ---------------------------------------------------------------------------

export const TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "med", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const TICKET_CATEGORIES = [
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
  { value: "account", label: "Account" },
  { value: "other", label: "Other" },
] as const;

/** Statuses rendered as board columns, in order. */
export const BOARD_COLUMNS = TICKET_STATUSES;

// ---------------------------------------------------------------------------
// Badge / pill color tokens — always token-based so light + dark both read.
// ---------------------------------------------------------------------------

const STATUS_CLASSES: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  closed: "bg-muted text-muted-foreground",
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  med: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  urgent: "bg-red-500/15 text-red-700 dark:text-red-300",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-slate-400 dark:bg-slate-500",
  med: "bg-sky-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

const CATEGORY_CLASSES: Record<string, string> = {
  billing: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  technical: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  account: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  other: "bg-muted text-muted-foreground",
};

const FALLBACK = "bg-muted text-muted-foreground";

export const statusClassFor = (value: string | null | undefined) =>
  STATUS_CLASSES[value ?? ""] ?? FALLBACK;

export const priorityClassFor = (value: string | null | undefined) =>
  PRIORITY_CLASSES[value ?? ""] ?? FALLBACK;

export const priorityDotFor = (value: string | null | undefined) =>
  PRIORITY_DOT[value ?? ""] ?? "bg-muted-foreground";

export const categoryClassFor = (value: string | null | undefined) =>
  CATEGORY_CLASSES[value ?? ""] ?? FALLBACK;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
  _translate?: ReturnType<typeof useTranslate>
) => options.find((item) => item.value === value)?.label ?? "—";

export const formatDateTime = (
  value: string | null | undefined,
  locale: string
) =>
  value
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export const relativeTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
};

export const initialsFor = (name: string | null | undefined) => {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
};
