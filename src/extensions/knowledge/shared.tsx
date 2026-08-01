import { useGetLocale } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { badgeClassFor } from "./constants";

export function useLocale(): string {
  const getLocale = useGetLocale();
  return getLocale();
}

export function StatusPill({
  value,
  label,
}: {
  value: string | null | undefined;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        badgeClassFor(value)
      )}
    >
      {label}
    </span>
  );
}
