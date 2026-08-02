import { useList, useTranslate, useUpdate } from "@refinedev/core";
import { CalendarClock, Plus, User } from "lucide-react";
import { useMemo, useState } from "react";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, formatDate, todayIso } from "../constants";
import { PriorityPill, useLocale } from "../shared";
import { useOpenContextualChild } from "../route-surfaces";
import type { TaskRecord } from "../types";

const COLUMN_ACCENT: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  review: "bg-violet-500",
  done: "bg-emerald-500",
};

export function TaskBoardPage() {
  const locale = useLocale();
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const { mutate: updateTask } = useUpdate<TaskRecord>();

  const { result, query } = useList<TaskRecord>({
    resource: "hub_pj_tasks",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    meta: { appends: ["project", "assignee"] },
    errorNotification: false,
    queryOptions: { retry: false },
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

  const moveTask = (task: TaskRecord, status: string) => {
    if (task.status === status) return;
    updateTask({ resource: "hub_pj_tasks", id: task.id, values: { status } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">
              {translate("projects.board.title", { ns: "starter" }, "Task board")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "projects.board.subtitle",
                { ns: "starter" },
                "Drag a card between columns to move it through the workflow."
              )}
            </p>
          </div>
          <Button onClick={() => openChild("create")}>
            <Plus />
            {translate("projects.board.newTask", { ns: "starter" }, "New task")}
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate("projects.board.error.title", { ns: "starter" }, "Unable to load tasks")}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "projects.board.error.desc",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const tasks = grouped[status.value] ?? [];
            return (
              <div
                key={status.value}
                className={cn(
                  "flex min-h-72 flex-col rounded-xl border bg-muted/25 transition-colors",
                  dragOver === status.value && "border-primary/60 bg-primary/5"
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(status.value);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(null);
                  const id = event.dataTransfer.getData("text/plain");
                  const task = result.data.find(
                    (item) => String(item.id) === id
                  );
                  if (task) moveTask(task, status.value);
                }}
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
                      {translate("projects.board.dropHere", { ns: "starter" }, "Drop a task here")}
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <TaskCard
                        key={String(task.id)}
                        task={task}
                        locale={locale}
                        onOpen={() => openChild(`show/${task.id}`)}
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

function TaskCard({
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
      draggable
      onDragStart={(event) =>
        event.dataTransfer.setData("text/plain", String(task.id))
      }
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
      {task.assignee ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {initials(task.assignee.nickname || task.assignee.username)}
          </span>
          <span className="truncate">
            {task.assignee.nickname || task.assignee.username}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <User className="size-3.5" />
          {translate("projects.board.unassigned", { ns: "starter" }, "Unassigned")}
        </div>
      )}
    </button>
  );
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "?";
}
