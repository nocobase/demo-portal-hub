import type { useTranslate } from "@refinedev/core";
import type { PurchaseOrderStatus, SupplierStatus } from "./types";

export const CURRENCY = "USD";

export const PO_STATUSES = [
  { value: "draft", label: "Draft", i18nKey: "procurement.enums.poStatus.draft" },
  { value: "sent", label: "Sent", i18nKey: "procurement.enums.poStatus.sent" },
  {
    value: "received",
    label: "Received",
    i18nKey: "procurement.enums.poStatus.received",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    i18nKey: "procurement.enums.poStatus.cancelled",
  },
] as const;

/** Statuses that still represent committed / in-flight spend. */
export const OPEN_PO_STATUSES: PurchaseOrderStatus[] = ["draft", "sent"];

export const SUPPLIER_STATUSES = [
  {
    value: "active",
    label: "Active",
    i18nKey: "procurement.enums.supplierStatus.active",
  },
  {
    value: "inactive",
    label: "Inactive",
    i18nKey: "procurement.enums.supplierStatus.inactive",
  },
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
  options: ReadonlyArray<{ value: string; label: string; i18nKey?: string }>,
  value: string | null | undefined,
  translate?: ReturnType<typeof useTranslate>
) => {
  const option = options.find((item) => item.value === value);
  if (!option) return "—";
  return option.i18nKey && translate
    ? translate(option.i18nKey, { ns: "starter" }, option.label)
    : option.label;
};

export const statusLabel = (
  value: PurchaseOrderStatus | null | undefined,
  translate?: ReturnType<typeof useTranslate>
) => labelFor(PO_STATUSES, value, translate);

export const supplierStatusLabel = (
  value: SupplierStatus | null | undefined,
  translate?: ReturnType<typeof useTranslate>
) => labelFor(SUPPLIER_STATUSES, value, translate);

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
