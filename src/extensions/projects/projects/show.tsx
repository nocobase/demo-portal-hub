import { useList, useShow, useUpdate } from "@refinedev/core";
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
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<ProjectRecord>({
    resource: "hub_pj_projects",
    id,
    meta: { appends: ["owner"] },
  });

  const displayName = record?.name || "Untitled project";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Tasks and milestones for this project."
      closeLabel="Close"
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
            <AlertTitle>Unable to load project</AlertTitle>
            <AlertDescription>
              The project may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Overview"
              items={[
                ["Code", record?.code || "—"],
                [
                  "Status",
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "planning"}
                    label={labelFor(PROJECT_STATUSES, record?.status ?? "planning")}
                  />,
                ],
                ["Owner", userLabel(record?.owner)],
                ["Start date", formatDate(record?.start_date, locale)],
                ["Due date", formatDate(record?.due_date, locale)],
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
      title="Tasks"
      action={<AddLink to="tasks/create" label="Add task" />}
    >
      <SimpleTable
        headers={["Task", "Status", "Priority", "Assignee", "Due", "Actions"]}
      >
        {result.data.length === 0 ? (
          <EmptyRow colSpan={6} text="No tasks yet. Add the first one." />
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
                    label={labelFor(TASK_STATUSES, task.status ?? "todo")}
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
      title="Milestones"
      action={<AddLink to="milestones/create" label="Add milestone" />}
    >
      <SimpleTable headers={["Milestone", "Target", "Status", "Actions"]}>
        {result.data.length === 0 ? (
          <EmptyRow colSpan={4} text="No milestones scheduled yet." />
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
                    <EnumBadge value="done" label="Completed" />
                  ) : (
                    <EnumBadge value="planning" label="Pending" />
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
                        title="Mark completed"
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
