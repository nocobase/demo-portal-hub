import { useList, useTranslate } from "@refinedev/core";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PROJECT_STATUSES, formatDate, todayIso } from "../constants";
import { useLocale } from "../shared";
import { useOpenContextualChild } from "../route-surfaces";
import type { ProjectRecord } from "../types";

const STATUS_BAR: Record<string, string> = {
  planning: "bg-slate-400",
  active: "bg-blue-500",
  on_hold: "bg-amber-500",
  done: "bg-emerald-500",
};

/** A lightweight gantt-style strip: one horizontal bar per project across a shared date axis. */
export function ProjectTimeline() {
  const locale = useLocale();
  const translate = useTranslate();
  const openChild = useOpenContextualChild();

  const { result } = useList<ProjectRecord>({
    resource: "hub_pj_projects",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    filters: [{ field: "start_date", operator: "ne", value: null }],
    sorters: [{ field: "start_date", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const projects = useMemo(
    () => result.data.filter((project) => project.start_date && project.due_date),
    [result.data]
  );

  const range = useMemo(() => {
    if (projects.length === 0) return null;
    const starts = projects.map((p) => new Date(p.start_date as string).getTime());
    const ends = projects.map((p) => new Date(p.due_date as string).getTime());
    const min = Math.min(...starts);
    const max = Math.max(...ends, new Date(todayIso()).getTime());
    return { min, max: max > min ? max : min + 86400000 };
  }, [projects]);

  if (!range || projects.length === 0) return null;

  const todayPct =
    ((new Date(todayIso()).getTime() - range.min) / (range.max - range.min)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {translate("projects.timeline.title", { ns: "starter" }, "Project timeline")}
        </CardTitle>
        <CardDescription>
          {translate(
            "projects.timeline.desc",
            { ns: "starter" },
            "Start-to-due span for every scheduled project."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-2.5">
          <div
            className="absolute top-0 bottom-0 w-px bg-primary/40"
            style={{ left: `${Math.min(Math.max(todayPct, 0), 100)}%` }}
          />
          {projects.map((project) => {
            const start = new Date(project.start_date as string).getTime();
            const end = new Date(project.due_date as string).getTime();
            const left = ((start - range.min) / (range.max - range.min)) * 100;
            const width = Math.max(
              ((end - start) / (range.max - range.min)) * 100,
              1.5
            );
            return (
              <button
                key={String(project.id)}
                type="button"
                onClick={() => openChild(`show/${project.id}`)}
                className="group flex w-full items-center gap-3 text-left"
              >
                <span className="w-32 shrink-0 truncate text-xs font-medium group-hover:underline">
                  {project.name || "—"}
                </span>
                <span className="relative h-2.5 flex-1 rounded-full bg-muted/60">
                  <span
                    className={cn(
                      "absolute top-0 h-2.5 rounded-full transition-opacity group-hover:opacity-80",
                      STATUS_BAR[project.status ?? "planning"]
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${formatDate(project.start_date, locale)} - ${formatDate(project.due_date, locale)}`}
                  />
                </span>
                <span className="w-24 shrink-0 text-right text-[11px] text-muted-foreground">
                  {formatDate(project.due_date, locale)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {PROJECT_STATUSES.map((status) => (
            <span key={status.value} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", STATUS_BAR[status.value])} />
              {translate(status.i18nKey, { ns: "starter" }, status.label)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
