// Enum vocab + formatting helpers for the Assets module.
// Pills/badges use the unified blue-forward tone set; every lookup has a
// fallback for unknown enum values (per the hub design contract).
import type { useTranslate } from "@refinedev/core";

export const CURRENCY = "USD";

export const ASSET_CATEGORIES = [
  { value: "laptop", label: "Laptop", i18nKey: "assets.enums.category.laptop" },
  { value: "monitor", label: "Monitor", i18nKey: "assets.enums.category.monitor" },
  { value: "phone", label: "Phone", i18nKey: "assets.enums.category.phone" },
  { value: "peripheral", label: "Peripheral", i18nKey: "assets.enums.category.peripheral" },
  { value: "other", label: "Other", i18nKey: "assets.enums.category.other" },
] as const;

export const ASSET_STATUSES = [
  { value: "in_stock", label: "In stock", i18nKey: "assets.enums.status.in_stock" },
  { value: "assigned", label: "Assigned", i18nKey: "assets.enums.status.assigned" },
  { value: "repair", label: "Repair", i18nKey: "assets.enums.status.repair" },
  { value: "retired", label: "Retired", i18nKey: "assets.enums.status.retired" },
] as const;

// Maintenance vocab. Enum values are stored as their display strings in the
// backend (e.g. "Preventive", "In progress"), so the option value doubles as
// the stored value and i18n only swaps the visible label.
export const MAINTENANCE_TYPES = [
  { value: "Preventive", label: "Preventive", i18nKey: "assets.maintenance.enums.type.preventive" },
  { value: "Corrective", label: "Corrective", i18nKey: "assets.maintenance.enums.type.corrective" },
  { value: "Inspection", label: "Inspection", i18nKey: "assets.maintenance.enums.type.inspection" },
] as const;

export const MAINTENANCE_STATUSES = [
  { value: "Scheduled", label: "Scheduled", i18nKey: "assets.maintenance.enums.status.scheduled" },
  { value: "In progress", label: "In progress", i18nKey: "assets.maintenance.enums.status.in_progress" },
  { value: "Done", label: "Done", i18nKey: "assets.maintenance.enums.status.done" },
] as const;

// Tone per status — blue for the "assigned" active state, neutral/amber/red
// for the rest. Never black.
const STATUS_BADGE: Record<string, string> = {
  in_stock: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  assigned: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  repair: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  retired: "bg-muted text-muted-foreground",
};

const CATEGORY_BADGE: Record<string, string> = {
  laptop: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  monitor: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  phone: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  peripheral: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  other: "bg-muted text-muted-foreground",
};

const MAINTENANCE_STATUS_BADGE: Record<string, string> = {
  Scheduled: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "In progress": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

const MAINTENANCE_TYPE_BADGE: Record<string, string> = {
  Preventive: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Corrective: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Inspection: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};

export const statusBadgeClass = (value: string | null | undefined) =>
  STATUS_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const categoryBadgeClass = (value: string | null | undefined) =>
  CATEGORY_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const maintenanceStatusBadgeClass = (value: string | null | undefined) =>
  MAINTENANCE_STATUS_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const maintenanceTypeBadgeClass = (value: string | null | undefined) =>
  MAINTENANCE_TYPE_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string; i18nKey?: string }>,
  value: string | null | undefined,
  translate?: ReturnType<typeof useTranslate>
) => {
  const option = options.find((item) => item.value === value);
  if (!option) return value || "—";
  return option.i18nKey && translate
    ? translate(option.i18nKey, { ns: "starter" }, option.label)
    : option.label;
};

export const formatCurrency = (
  value: number | null | undefined,
  locale: string
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatDate = (value: string | null | undefined, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";

export const toDateInputValue = (value: string | null | undefined) =>
  value ? String(value).slice(0, 10) : "";

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const assigneeName = (
  assignee:
    | { nickname?: string | null; username?: string | null; email?: string | null }
    | null
    | undefined
) => assignee?.nickname || assignee?.username || assignee?.email || "—";
