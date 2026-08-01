import { format } from "date-fns";

export const CURRENCY = "USD";

export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "office", label: "Office" },
  { value: "parts", label: "Parts" },
  { value: "other", label: "Other" },
] as const;

export const PRODUCT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "discontinued", label: "Discontinued" },
] as const;

export const MOVE_TYPES = [
  { value: "in", label: "In" },
  { value: "out", label: "Out" },
  { value: "adjust", label: "Adjust" },
] as const;

const BADGE_CLASSES: Record<string, string> = {
  // categories
  electronics: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  office: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  parts: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  other: "bg-muted text-muted-foreground",
  // product status
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  discontinued: "bg-muted text-muted-foreground",
  // move types
  in: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  out: "bg-red-500/15 text-red-700 dark:text-red-300",
  adjust: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export const badgeClassFor = (value: string | null | undefined) =>
  BADGE_CLASSES[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined
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

export const formatNumber = (value: number | null | undefined, locale: string) =>
  new Intl.NumberFormat(locale).format(Number(value ?? 0));

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

export const toDateTimeInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : format(parsed, "yyyy-MM-dd'T'HH:mm");
};

/** Signed contribution of a stock move to on-hand quantity. */
export const signedQty = (
  type: string | null | undefined,
  qty: number | null | undefined
) => {
  const value = Number(qty ?? 0);
  return type === "out" ? -value : value;
};
