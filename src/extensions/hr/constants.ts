export const EMPLOYEE_STATUSES = [
  { value: "active", label: "Active" },
  { value: "onleave", label: "On leave" },
  { value: "terminated", label: "Terminated" },
] as const;

export const LEAVE_TYPES = [
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "unpaid", label: "Unpaid" },
] as const;

export const LEAVE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

const BADGE_CLASSES: Record<string, string> = {
  // employee status
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  onleave: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  terminated: "bg-red-500/15 text-red-700 dark:text-red-300",
  // leave type
  annual: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  sick: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  unpaid: "bg-muted text-muted-foreground",
  // leave status
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export const badgeClassFor = (value: string | null | undefined) =>
  BADGE_CLASSES[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined
) => options.find((item) => item.value === value)?.label ?? "—";

export const formatDate = (value: string | null | undefined, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";

export const toDateInputValue = (value: string | null | undefined) =>
  value ? String(value).slice(0, 10) : "";
