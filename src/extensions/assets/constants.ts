// Enum vocab + formatting helpers for the Assets module.
// Pills/badges use the unified blue-forward tone set; every lookup has a
// fallback for unknown enum values (per the hub design contract).

export const CURRENCY = "USD";

export const ASSET_CATEGORIES = [
  { value: "laptop", label: "Laptop" },
  { value: "monitor", label: "Monitor" },
  { value: "phone", label: "Phone" },
  { value: "peripheral", label: "Peripheral" },
  { value: "other", label: "Other" },
] as const;

export const ASSET_STATUSES = [
  { value: "in_stock", label: "In stock" },
  { value: "assigned", label: "Assigned" },
  { value: "repair", label: "Repair" },
  { value: "retired", label: "Retired" },
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

export const statusBadgeClass = (value: string | null | undefined) =>
  STATUS_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const categoryBadgeClass = (value: string | null | undefined) =>
  CATEGORY_BADGE[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined
) => options.find((item) => item.value === value)?.label ?? (value || "—");

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
