export const ARTICLE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

const BADGE_CLASSES: Record<string, string> = {
  published: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  draft: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export const badgeClassFor = (value: string | null | undefined) =>
  BADGE_CLASSES[value ?? ""] ?? "bg-muted text-muted-foreground";

export const labelFor = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined
) => options.find((option) => option.value === value)?.label ?? "—";

export const formatDate = (value: string | null | undefined, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";

export const formatNumber = (value: number | null | undefined, locale: string) =>
  new Intl.NumberFormat(locale).format(Number(value ?? 0));

/** Split a long-text body into paragraphs for reader rendering. */
export const toParagraphs = (body: string | null | undefined): string[] =>
  (body ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
