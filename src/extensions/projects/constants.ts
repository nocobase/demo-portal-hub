// Enum options, badge styling and formatters for the Projects module.
// The React UI owns these enums; the backend stores plain strings.

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "done", label: "Done" },
] as const;

export const TASK_STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
] as const;

export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "med", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const BADGE_CLASSES: Record<string, string> = {
  // project + task status
  planning: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  active: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  on_hold: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  todo: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  review: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  // priority
  low: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  med: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  high: "bg-red-500/15 text-red-700 dark:text-red-300",
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

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const userLabel = (
  user: { nickname?: string | null; username?: string | null } | null | undefined
) => user?.nickname || user?.username || "—";
