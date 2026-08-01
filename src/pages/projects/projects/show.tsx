import { useList, useShow, useTranslate, useUpdate } from "@refinedev/core";
import { CheckCircle2, Circle, Flag, Pencil, Plus, Trash2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  PROJECT_STATUSES,
  TASK_STATUSES,
  formatDate,
  labelFor,
  todayIso,
  userLabel,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  EnumBadge,
  PriorityPill,
  SimpleTable,
  useLocale,
} from "../shared";
import type {
  MilestoneRecord,
  ProjectRecord,
  TaskRecord,
} from "../types";

export function ProjectShow() {
  const locale = useLocale();
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<ProjectRecord>({
    resource: "hub_pj_projects",
    id,
    meta: { appends: ["owner"] },
  });

  const displayName =
    record?.name ||
    translate("projects.projects.show.title.untitled", { ns: "starter" }, "Untitled project");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description={translate(
        "projects.projects.show.desc",
        { ns: "starter" },
        "Tasks and milestones for this project."
      )}
      closeLabel={translate("projects.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_pj_projects"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            onClick={() => openChild("edit")}
          >
            <Pencil />
          </EditButton>
        ) : null
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {translate(
                "projects.projects.show.error.title",
                { ns: "starter" },
                "Unable to load project"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "projects.projects.show.error.desc",
                { ns: "starter" },
                "The project may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("projects.projects.show.overview", { ns: "starter" }, "Overview")}
              items={[
                [
                  translate("projects.projects.show.fields.code", { ns: "starter" }, "Code"),
                  record?.code || "—",
                ],
                [
                  translate("projects.projects.show.fields.status", { ns: "starter" }, "Status"),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "planning"}
                    label={labelFor(PROJECT_STATUSES, record?.status ?? "planning", translate)}
                  />,
                ],
                [
                  translate("projects.projects.show.fields.owner", { ns: "starter" }, "Owner"),
                  userLabel(record?.owner),
                ],
                [
                  translate("projects.projects.show.fields.startDate", { ns: "starter" }, "Start date"),
                  formatDate(record?.start_date, locale),
                ],
                [
                  translate("projects.projects.show.fields.dueDate", { ns: "starter" }, "Due date"),
                  formatDate(record?.due_date, locale),
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <TasksSection projectId={id} locale={locale} />
                <Separator />
                <MilestonesSection projectId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function AddLink({ to, label }: { to: string; label: string }) {
  const openChild = useOpenContextualChild();
  return (
    <Button variant="outline" size="sm" onClick={() => openChild(to)}>
      <Plus />
      {label}
    </Button>
  );
}

function RowEditLink({ to }: { to: string }) {
  const openChild = useOpenContextualChild();
  return (
    <Button variant="ghost" size="icon" onClick={() => openChild(to)}>
      <Pencil />
    </Button>
  );
}

function TasksSection({
  projectId,
  locale,
}: {
  projectId: string;
  locale: string;
}) {
  const translate = useTranslate();
  const { result } = useList<TaskRecord>({
    resource: "hub_pj_tasks",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "due_date", order: "asc" }],
    filters: [
      { field: "hub_pj_task_project_id", operator: "eq", value: projectId },
    ],
    meta: { appends: ["assignee"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const today = todayIso();

  return (
    <DrawerSection
      title={translate("projects.projects.show.tasks", { ns: "starter" }, "Tasks")}
      action={
        <AddLink
          to="tasks/create"
          label={translate("projects.projects.show.addTask", { ns: "starter" }, "Add task")}
        />
      }
    >
      <SimpleTable
        headers={[
          translate("projects.tasks.columns.task", { ns: "starter" }, "Task"),
          translate("projects.tasks.columns.status", { ns: "starter" }, "Status"),
          translate("projects.tasks.columns.priority", { ns: "starter" }, "Priority"),
          translate("projects.tasks.columns.assignee", { ns: "starter" }, "Assignee"),
          translate("projects.tasks.columns.due", { ns: "starter" }, "Due"),
          translate("projects.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={6}
            text={translate(
              "projects.projects.show.tasks.empty",
              { ns: "starter" },
              "No tasks yet. Add the first one."
            )}
          />
        ) : (
          result.data.map((task) => {
            const isOverdue =
              task.status !== "done" &&
              Boolean(task.due_date) &&
              (task.due_date as string) < today;
            return (
              <tr key={String(task.id)}>
                <td className="px-3 py-2 font-medium">{task.title || "—"}</td>
                <td className="px-3 py-2">
                  <EnumBadge
                    value={task.status ?? "todo"}
                    label={labelFor(TASK_STATUSES, task.status ?? "todo", translate)}
                  />
                </td>
                <td className="px-3 py-2">
                  <PriorityPill value={task.priority} />
                </td>
                <td className="px-3 py-2">{userLabel(task.assignee)}</td>
                <td
                  className={
                    "px-3 py-2 whitespace-nowrap " +
                    (isOverdue ? "text-red-600 dark:text-red-400" : "")
                  }
                >
                  {formatDate(task.due_date, locale)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <RowEditLink
                      to={`tasks/edit/${encodeURIComponent(String(task.id))}`}
                    />
                    <DeleteButton
                      resource="hub_pj_tasks"
                      recordItemId={task.id}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 />
                    </DeleteButton>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </SimpleTable>
    </DrawerSection>
  );
}

function MilestonesSection({
  projectId,
  locale,
}: {
  projectId: string;
  locale: string;
}) {
  const translate = useTranslate();
  const { mutate: updateMilestone } = useUpdate<MilestoneRecord>();
  const { result } = useList<MilestoneRecord>({
    resource: "hub_pj_milestones",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "due_date", order: "asc" }],
    filters: [
      { field: "hub_pj_ms_project_id", operator: "eq", value: projectId },
    ],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const today = todayIso();

  return (
    <DrawerSection
      title={translate("projects.projects.show.milestones", { ns: "starter" }, "Milestones")}
      action={
        <AddLink
          to="milestones/create"
          label={translate(
            "projects.projects.show.addMilestone",
            { ns: "starter" },
            "Add milestone"
          )}
        />
      }
    >
      <SimpleTable
        headers={[
          translate("projects.milestones.columns.milestone", { ns: "starter" }, "Milestone"),
          translate("projects.milestones.columns.target", { ns: "starter" }, "Target"),
          translate("projects.milestones.columns.status", { ns: "starter" }, "Status"),
          translate("projects.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={4}
            text={translate(
              "projects.projects.show.milestones.empty",
              { ns: "starter" },
              "No milestones scheduled yet."
            )}
          />
        ) : (
          result.data.map((milestone) => {
            const isDone = Boolean(milestone.done);
            const isOverdue =
              !isDone && (milestone.due_date ?? "") < today;
            return (
              <tr key={String(milestone.id)}>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2 font-medium">
                    <Flag
                      className={
                        "size-3.5 " +
                        (isDone
                          ? "text-emerald-500"
                          : "text-muted-foreground/50")
                      }
                    />
                    {milestone.name || "—"}
                  </span>
                </td>
                <td
                  className={
                    "px-3 py-2 whitespace-nowrap " +
                    (isOverdue ? "text-red-600 dark:text-red-400" : "")
                  }
                >
                  {formatDate(milestone.due_date, locale)}
                </td>
                <td className="px-3 py-2">
                  {isDone ? (
                    <EnumBadge
                      value="done"
                      label={translate(
                        "projects.milestones.status.completed",
                        { ns: "starter" },
                        "Completed"
                      )}
                    />
                  ) : (
                    <EnumBadge
                      value="planning"
                      label={translate(
                        "projects.milestones.status.pending",
                        { ns: "starter" },
                        "Pending"
                      )}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {isDone ? (
                      <Circle className="size-4 text-muted-foreground/40" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={translate(
                          "projects.milestones.markCompleted",
                          { ns: "starter" },
                          "Mark completed"
                        )}
                        onClick={() =>
                          updateMilestone({
                            resource: "hub_pj_milestones",
                            id: milestone.id,
                            values: { done: true },
                          })
                        }
                      >
                        <CheckCircle2 />
                      </Button>
                    )}
                    <RowEditLink
                      to={`milestones/edit/${encodeURIComponent(
                        String(milestone.id)
                      )}`}
                    />
                    <DeleteButton
                      resource="hub_pj_milestones"
                      recordItemId={milestone.id}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 />
                    </DeleteButton>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
