import { useList, useTranslate } from "@refinedev/core";
import { ChevronLeft, ChevronRight, Mail, Phone, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { ListView } from "@/components/resources/views/list-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVITY_TYPES, labelFor } from "../constants";
import { EnumBadge, useLocale } from "../shared";
import type { ActivityRecord } from "../types";

function activityIcon(type: string | null | undefined) {
  switch (type) {
    case "email":
      return Mail;
    case "meeting":
      return Users;
    default:
      return Phone;
  }
}

// Local-date key (YYYY-MM-DD) — deliberately not toISOString(), which shifts
// across timezones and can bucket an activity onto the wrong day.
const dateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function SalesCalendarPage() {
  const translate = useTranslate();
  const locale = useLocale();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthStart = cursor;
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  // Widen the fetch window slightly so the leading/trailing days of the grid
  // (from adjacent months) also show their activities.
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  // Fetched unfiltered (like the forecast/pipeline pages) and bucketed by day
  // client-side — the activities collection is small, and avoids relying on
  // date-range filter operators against a mixed date/datetime field.
  const { result, query } = useList<ActivityRecord>({
    resource: "hub_sales_activities",
    pagination: { mode: "server", currentPage: 1, pageSize: 1000 },
    sorters: [{ field: "date", order: "asc" }],
    meta: { appends: ["deal"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const byDay = useMemo(() => {
    const map = new Map<string, ActivityRecord[]>();
    for (const activity of result.data) {
      if (!activity.date) continue;
      const key = dateKey(new Date(activity.date));
      const bucket = map.get(key) ?? [];
      bucket.push(activity);
      map.set(key, bucket);
    }
    return map;
  }, [result.data]);

  const weeks = useMemo(() => {
    const days: Date[] = [];
    const cursorDay = new Date(gridStart);
    while (cursorDay <= gridEnd) {
      days.push(new Date(cursorDay));
      cursorDay.setDate(cursorDay.getDate() + 1);
    }
    const rows: Date[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      rows.push(days.slice(index, index + 7));
    }
    return rows;
  }, [gridStart, gridEnd]);

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(base);
      day.setDate(base.getDate() + index);
      return formatter.format(day);
    });
  }, [locale]);

  const today = dateKey(new Date());

  return (
    <ListView resource="sales-calendar">
      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate(
              "sales.calendar.loadError.title",
              { ns: "starter" },
              "Unable to load activities"
            )}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "sales.calendar.loadError.description",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCursor(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                }}
              >
                {translate("sales.calendar.today", { ns: "starter" }, "Today")}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCursor(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {ACTIVITY_TYPES.map((type) => (
              <span key={type.value} className="flex items-center gap-1.5">
                <EnumBadge value={type.value} label={labelFor(ACTIVITY_TYPES, type.value, translate)} />
              </span>
            ))}
          </div>

          <Card className="overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                {weekdayLabels.map((label) => (
                  <div key={label} className="px-2 py-2">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {weeks.map((week) =>
                  week.map((day) => {
                    const key = dateKey(day);
                    const inMonth = day.getMonth() === cursor.getMonth();
                    const activities = byDay.get(key) ?? [];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "min-h-28 border-r border-b p-1.5 last:border-r-0",
                          !inMonth && "bg-muted/20"
                        )}
                      >
                        <div
                          className={cn(
                            "mb-1 flex size-6 items-center justify-center rounded-full text-xs",
                            key === today
                              ? "bg-primary font-semibold text-primary-foreground"
                              : inMonth
                                ? "text-foreground"
                                : "text-muted-foreground"
                          )}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {activities.slice(0, 3).map((activity) => {
                            const Icon = activityIcon(activity.type);
                            return (
                              <button
                                key={String(activity.id)}
                                type="button"
                                onClick={() =>
                                  navigate(`/activities/show/${activity.id}`)
                                }
                                className={cn(
                                  "flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium hover:opacity-80",
                                  activity.type === "email" &&
                                    "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
                                  activity.type === "meeting" &&
                                    "bg-purple-500/15 text-purple-700 dark:text-purple-300",
                                  (!activity.type || activity.type === "call") &&
                                    "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                )}
                                title={activity.subject ?? undefined}
                              >
                                <Icon className="size-3 shrink-0" />
                                <span className="truncate">
                                  {activity.subject || "—"}
                                </span>
                              </button>
                            );
                          })}
                          {activities.length > 3 ? (
                            <p className="px-1.5 text-[11px] text-muted-foreground">
                              {`+${activities.length - 3} `}
                              {translate("sales.calendar.more", { ns: "starter" }, "more")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ListView>
  );
}
