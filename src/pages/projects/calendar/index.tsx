import { useList, useTranslate } from "@refinedev/core";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useMemo, useState } from "react";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, todayIso } from "../constants";
import { useOpenAbsolute } from "../route-surfaces";
import { useLocale } from "../shared";
import type { MilestoneRecord, TaskRecord } from "../types";

const TASK_DOT: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  review: "bg-violet-500",
  done: "bg-emerald-500",
};

type CalendarTaskEvent = {
  kind: "task";
  id: string | number;
  date: string;
  title: string;
  status: string;
};

type CalendarMilestoneEvent = {
  kind: "milestone";
  id: string | number;
  date: string;
  title: string;
  done: boolean;
};

type CalendarEvent = CalendarTaskEvent | CalendarMilestoneEvent;

export function ProjectCalendarPage() {
  const locale = useLocale();
  const translate = useTranslate();
  const openAbsolute = useOpenAbsolute();
  const [cursor, setCursor] = useState(() => new Date());
  const dateFnsLocale = locale?.startsWith("zh") ? zhCN : enUS;

  const { result: taskResult, query: taskQuery } = useList<TaskRecord>({
    resource: "hub_pj_tasks",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const { result: msResult, query: msQuery } = useList<MilestoneRecord>({
    resource: "hub_pj_milestones",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    meta: { appends: ["project"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const isLoading = taskQuery.isLoading || msQuery.isLoading;
  const isError = taskQuery.isError || msQuery.isError;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const push = (key: string, event: CalendarEvent) => {
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    };
    for (const task of taskResult.data) {
      if (!task.due_date) continue;
      push(task.due_date, {
        kind: "task",
        id: task.id,
        date: task.due_date,
        title: task.title || "—",
        status: task.status || "todo",
      });
    }
    for (const milestone of msResult.data) {
      if (!milestone.due_date) continue;
      push(milestone.due_date, {
        kind: "milestone",
        id: milestone.id,
        date: milestone.due_date,
        title: milestone.name || "—",
        done: Boolean(milestone.done),
      });
    }
    return map;
  }, [taskResult.data, msResult.data]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayLabels = eachDayOfInterval({
    start: gridStart,
    end: endOfWeek(gridStart, { weekStartsOn: 1 }),
  });
  const today = todayIso();

  const openEvent = (event: CalendarEvent) => {
    openAbsolute(
      event.kind === "task"
        ? `/tasks/show/${event.id}`
        : `/milestones/show/${event.id}`
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.035em]">
              <CalendarDays className="size-7 text-muted-foreground" />
              {translate("projects.calendar.title", { ns: "starter" }, "Project calendar")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "projects.calendar.subtitle",
                { ns: "starter" },
                "Task due dates and milestones across every project."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))}>
              <ChevronLeft />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium tabular-nums">
              {format(cursor, "MMMM yyyy", { locale: dateFnsLocale })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))}>
              <ChevronRight />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
              {translate("projects.calendar.today", { ns: "starter" }, "Today")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {TASK_STATUSES.map((status) => (
          <span key={status.value} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", TASK_DOT[status.value])} />
            {translate(status.i18nKey, { ns: "starter" }, status.label)}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <Flag className="size-3 text-amber-500" />
          {translate("projects.resources.milestone", { ns: "starter" }, "Milestone")}
        </span>
      </div>

      {isLoading ? (
        <LoadingState className="min-h-64" />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate("projects.calendar.error.title", { ns: "starter" }, "Unable to load the calendar")}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "projects.calendar.error.desc",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {weekdayLabels.map((day) => (
              <div
                key={day.toISOString()}
                className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {format(day, "EEE", { locale: dateFnsLocale })}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const events = eventsByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const isToday = key === today;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex min-h-28 flex-col gap-1 border-b border-r p-1.5 last:border-r-0",
                    !inMonth && "bg-muted/20"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground/40"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    {events.map((event) => (
                      <button
                        key={`${event.kind}-${String(event.id)}`}
                        type="button"
                        onClick={() => openEvent(event)}
                        title={event.title}
                        className={cn(
                          "flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] font-medium hover:opacity-80",
                          event.kind === "task"
                            ? "bg-muted"
                            : event.done
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        {event.kind === "task" ? (
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              TASK_DOT[event.status]
                            )}
                          />
                        ) : (
                          <Flag className="size-2.5 shrink-0" />
                        )}
                        <span className="truncate">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
