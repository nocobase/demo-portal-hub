import type { PurchaseOrderStatus, SupplierStatus } from "./types";

export const CURRENCY = "USD";

export const PO_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
] as const;

/** Statuses that still represent committed / in-flight spend. */
export const OPEN_PO_STATUSES: PurchaseOrderStatus[] = ["draft", "sent"];

export const SUPPLIER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const BADGE_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  received: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  inactive: "bg-muted text-muted-foreground",
};

export const badgeClassFor = (value: string | null | undefined) =>
  BADGE_CLASSES[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined
) => options.find((item) => item.value === value)?.label ?? "—";

export const statusLabel = (value: PurchaseOrderStatus | null | undefined) =>
  labelFor(PO_STATUSES, value);

export const supplierStatusLabel = (value: SupplierStatus | null | undefined) =>
  labelFor(SUPPLIER_STATUSES, value);

export const formatCurrency = (
  value: number | null | undefined,
  locale = "en-US"
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatDate = (
  value: string | null | undefined,
  locale = "en-US"
) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";

export const toDateInputValue = (value: string | null | undefined) =>
  value ? String(value).slice(0, 10) : "";

/** qty * unit_price for one line, tolerating nulls. */
export const lineTotal = (
  qty: number | null | undefined,
  unitPrice: number | null | undefined
) => Number(qty ?? 0) * Number(unitPrice ?? 0);
