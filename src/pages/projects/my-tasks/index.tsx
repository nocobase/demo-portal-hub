import { useGetIdentity, useList, useTranslate } from "@refinedev/core";
import { CalendarClock, ListChecks, User } from "lucide-react";
import { useMemo } from "react";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, formatDate, todayIso } from "../constants";
import { useOpenAbsolute } from "../route-surfaces";
import { PriorityPill, useLocale } from "../shared";
import type { TaskRecord } from "../types";

const COLUMN_ACCENT: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  review: "bg-violet-500",
  done: "bg-emerald-500",
};

type Identity = { id: number | string };

export function MyTasksPage() {
  const locale = useLocale();
  const translate = useTranslate();
  const openAbsolute = useOpenAbsolute();
  const { data: identity, isLoading: identityLoading } = useGetIdentity<Identity>();
  const currentUserId = identity?.id;

  const { result, query } = useList<TaskRecord>({
    resource: "hub_pj_tasks",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    meta: { appends: ["project", "assignee"] },
    filters: [
      {
        field: "hub_pj_task_assignee_id",
        operator: "eq",
        value: currentUserId,
      },
    ],
    errorNotification: false,
    queryOptions: { enabled: Boolean(currentUserId), retry: false },
  });

  const grouped = useMemo(() => {
    const buckets: Record<string, TaskRecord[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of result.data) {
      const status =
        task.status && buckets[task.status] ? task.status : "todo";
      buckets[status].push(task);
    }
    const byDue = (a: TaskRecord, b: TaskRecord) =>
      (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
    Object.values(buckets).forEach((bucket) => bucket.sort(byDue));
    return buckets;
  }, [result.data]);

  const totalCount = result.data.length;
  const isLoading = identityLoading || (Boolean(currentUserId) && query.isLoading);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.035em]">
              <ListChecks className="size-7 text-muted-foreground" />
              {translate("projects.myTasks.title", { ns: "starter" }, "My tasks")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "projects.myTasks.subtitle",
                { ns: "starter" },
                "Everything currently assigned to you, grouped by status."
              )}
            </p>
          </div>
          {totalCount > 0 ? (
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {translate(
                "projects.myTasks.totalCount",
                { ns: "starter", count: totalCount },
                `${totalCount} assigned`
              )}
            </span>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate("projects.myTasks.error.title", { ns: "starter" }, "Unable to load your tasks")}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "projects.myTasks.error.desc",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : totalCount === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
          <ListChecks className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">
            {translate("projects.myTasks.empty.title", { ns: "starter" }, "Nothing assigned to you")}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {translate(
              "projects.myTasks.empty.desc",
              { ns: "starter" },
              "Tasks assigned to you across every project will show up here."
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const tasks = grouped[status.value] ?? [];
            return (
              <div
                key={status.value}
                className="flex min-h-72 flex-col rounded-xl border bg-muted/25"
              >
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        COLUMN_ACCENT[status.value]
                      )}
                    />
                    <span className="text-sm font-semibold">
                      {translate(status.i18nKey, { ns: "starter" }, status.label)}
                    </span>
                  </div>
                  <span className="rounded-md bg-background px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {tasks.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      {translate("projects.myTasks.columnEmpty", { ns: "starter" }, "Nothing here")}
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <MyTaskCard
                        key={String(task.id)}
                        task={task}
                        locale={locale}
                        onOpen={() => openAbsolute(`/tasks/show/${task.id}`)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MyTaskCard({
  task,
  locale,
  onOpen,
}: {
  task: TaskRecord;
  locale: string;
  onOpen: () => void;
}) {
  const translate = useTranslate();
  const isOverdue =
    task.status !== "done" &&
    Boolean(task.due_date) &&
    (task.due_date as string) < todayIso();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-3 text-left shadow-xs transition-shadow hover:shadow-sm"
    >
      <span className="line-clamp-2 text-sm font-medium">
        {task.title || "—"}
      </span>
      {task.project?.name ? (
        <span className="truncate text-xs text-muted-foreground">
          {task.project.name}
        </span>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <PriorityPill value={task.priority} />
        {task.due_date ? (
          <span
            className={cn(
              "flex items-center gap-1 text-xs tabular-nums",
              isOverdue
                ? "font-medium text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            <CalendarClock className="size-3" />
            {formatDate(task.due_date, locale)}
          </span>
        ) : null}
      </div>
      {!task.assignee ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <User className="size-3.5" />
          {translate("projects.board.unassigned", { ns: "starter" }, "Unassigned")}
        </div>
      ) : null}
    </button>
  );
}
