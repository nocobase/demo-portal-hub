import { useTranslate, useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle2, Circle, Eye, Flag, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterDropdownText } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { formatDate, todayIso } from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
import { EnumBadge, useLocale } from "../shared";
import type { MilestoneRecord } from "../types";

export function MilestonesLayout() {
  return (
    <CanAccess
      resource="hub_pj_milestones"
      action="list"
      fallback={<AccessDenied />}
    >
      <MilestoneList />
    </CanAccess>
  );
}

function MilestoneList() {
  const locale = useLocale();
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const { mutate: updateMilestone } = useUpdate<MilestoneRecord>();
  const today = todayIso();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<MilestoneRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("projects.milestones.columns.milestone", { ns: "starter" }, "Milestone")}
            </span>
            <DataTableSorter column={column} />
            <DataTableFilterDropdownText
              column={column}
              table={table}
              defaultOperator="contains"
              operators={["contains", "eq", "startswith"]}
            />
          </div>
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openChild(`show/${row.original.id}`)}
            className="flex items-center gap-2 text-left font-medium underline-offset-2 hover:underline"
          >
            <Flag
              className={
                "size-3.5 " +
                (row.original.done
                  ? "text-emerald-500"
                  : "text-muted-foreground/50")
              }
            />
            {row.original.name || "—"}
          </button>
        ),
      }),
      columnHelper.accessor("project", {
        id: "project",
        header: translate("projects.milestones.columns.project", { ns: "starter" }, "Project"),
        enableSorting: false,
        cell: ({ getValue }) => getValue()?.name || "—",
      }),
      columnHelper.accessor("due_date", {
        id: "due_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("projects.milestones.columns.target", { ns: "starter" }, "Target")}
            </span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const isOverdue =
            !row.original.done && (row.original.due_date ?? "") < today;
          return (
            <span
              className={
                "whitespace-nowrap " +
                (isOverdue ? "text-red-600 dark:text-red-400" : "")
              }
            >
              {formatDate(row.original.due_date, locale)}
            </span>
          );
        },
      }),
      columnHelper.accessor("done", {
        id: "done",
        header: translate("projects.milestones.columns.status", { ns: "starter" }, "Status"),
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() ? (
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
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("projects.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.done ? (
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
                    id: row.original.id,
                    values: { done: true },
                  })
                }
              >
                <CheckCircle2 />
              </Button>
            )}
            <ShowButton
              resource="hub_pj_milestones"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_pj_milestones"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_pj_milestones"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </DeleteButton>
          </div>
        ),
      }),
    ];
  }, [locale, openChild, today, translate, updateMilestone]);

  const table = useTable<MilestoneRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_pj_milestones",
      syncWithLocation: false,
      meta: { appends: ["project"] },
      sorters: { initial: [{ field: "due_date", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_pj_milestones">
      <DataTable table={table} />
      <Outlet />
    </ListView>
  );
}
