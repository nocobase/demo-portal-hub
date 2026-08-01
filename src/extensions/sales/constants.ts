import type { useTranslate } from "@refinedev/core";

export const CURRENCY = "USD";

// Pipeline stages, in board order.
export const DEAL_STAGES = [
  { value: "inquiry", label: "Inquiry" },
  { value: "quote", label: "Quote" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

// Open stages contribute to "pipeline value".
export const OPEN_DEAL_STAGES = ["inquiry", "quote", "negotiation"];

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "unqualified", label: "Unqualified" },
] as const;

export const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "event", label: "Event" },
  { value: "cold_call", label: "Cold Call" },
  { value: "partner", label: "Partner" },
] as const;

export const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;

export const ACTIVITY_TYPES = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
] as const;

// Tailwind token classes for status pills — theme-aware, with a fallback for
// unknown enum values (per the design contract).
const BADGE_CLASSES: Record<string, string> = {
  // deal stages
  inquiry: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  quote: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  negotiation: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  lost: "bg-red-500/15 text-red-700 dark:text-red-300",
  // lead statuses
  new: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  qualified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  unqualified: "bg-muted text-muted-foreground",
  // lead sources
  website: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  referral: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  event: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  cold_call: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  partner: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  // activity types
  call: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  email: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  meeting: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  // industries
  technology: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  manufacturing: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  retail: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  finance: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  healthcare: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  education: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
};

export const badgeClassFor = (value: string | null | undefined) =>
  BADGE_CLASSES[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
  _translate?: ReturnType<typeof useTranslate>
) => options.find((item) => item.value === value)?.label ?? "—";

export const formatCurrency = (
  value: number | null | undefined,
  locale: string
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

// Compact currency for board totals, e.g. $156K.
export const formatCurrencyCompact = (
  value: number | null | undefined,
  locale: string
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0));

export const formatDate = (value: string | null | undefined, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";

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

export const toDateInputValue = (value: string | null | undefined) =>
  value ? String(value).slice(0, 10) : "";
