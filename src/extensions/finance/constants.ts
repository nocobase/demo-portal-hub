// Enum options, labels and pill tones for the Finance module.
// Tones follow the suite convention used on the Overview page:
//   soft tinted background + saturated text, brighter text in dark mode.

export type Option = {
  value: string;
  label: string;
  /** Tailwind classes for the status/category pill. */
  tone: string;
};

const AMBER = "bg-amber-500/12 text-amber-700 dark:text-amber-400";
const EMERALD = "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400";
const RED = "bg-red-500/12 text-red-700 dark:text-red-400";
const BLUE = "bg-blue-500/12 text-blue-700 dark:text-blue-400";
const SKY = "bg-sky-500/12 text-sky-700 dark:text-sky-400";
const TEAL = "bg-teal-500/12 text-teal-700 dark:text-teal-400";
const VIOLET = "bg-violet-500/12 text-violet-700 dark:text-violet-400";
const SLATE = "bg-slate-500/12 text-slate-600 dark:text-slate-300";

export const EXPENSE_CATEGORIES: Option[] = [
  { value: "travel", label: "Travel", tone: BLUE },
  { value: "meals", label: "Meals", tone: SKY },
  { value: "software", label: "Software", tone: TEAL },
  { value: "equipment", label: "Equipment", tone: VIOLET },
  { value: "other", label: "Other", tone: SLATE },
];

export const EXPENSE_STATUSES: Option[] = [
  { value: "pending", label: "Pending", tone: AMBER },
  { value: "approved", label: "Approved", tone: EMERALD },
  { value: "rejected", label: "Rejected", tone: RED },
  { value: "reimbursed", label: "Reimbursed", tone: BLUE },
];

export const INVOICE_STATUSES: Option[] = [
  { value: "draft", label: "Draft", tone: SLATE },
  { value: "sent", label: "Sent", tone: BLUE },
  { value: "paid", label: "Paid", tone: EMERALD },
  { value: "overdue", label: "Overdue", tone: RED },
];

/** Look up an option by value, with a graceful fallback for unknown enums. */
export function lookup(options: Option[], value: string | undefined | null): Option {
  const found = options.find((o) => o.value === value);
  if (found) return found;
  return {
    value: value ?? "unknown",
    label: value ? String(value) : "—",
    tone: SLATE,
  };
}
