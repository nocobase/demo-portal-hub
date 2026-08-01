import { useList, useTranslate, useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2, Undo2 } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Button } from "@/components/ui/button";
import { ListView } from "@/components/resources/views/list-view";
import { assigneeName, formatDate, todayIso } from "../constants";
import { Pill, useLocale } from "../shared";
import type { AssetRecord, AssignmentRecord } from "../types";
import { useOpenContextualChild } from "../route-surfaces";

export function AssignmentList() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const { mutate: updateAssignment } = useUpdate<AssignmentRecord>();
  const { mutate: updateAsset } = useUpdate<AssetRecord>();

  const returnAssignment = (assignment: AssignmentRecord) => {
    updateAssignment(
      {
        resource: "hub_as_assignments",
        id: assignment.id,
        values: { returned_date: todayIso() },
      },
      {
        onSuccess: () => {
          if (assignment.asset_id != null) {
            updateAsset({
              resource: "hub_as_assets",
              id: assignment.asset_id,
              values: { status: "in_stock" },
            });
          }
        },
      }
    );
  };

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AssignmentRecord>();
    return [
      columnHelper.accessor((row) => row.asset?.name, {
        id: "asset",
        header: translate("assets.assignments.columns.asset", { ns: "starter" }, "Asset"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.asset?.name || "—"}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.asset?.tag || ""}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.assignee, {
        id: "assignee",
        header: translate("assets.assignments.columns.assignee", { ns: "starter" }, "Assignee"),
        enableSorting: false,
        cell: ({ row }) => assigneeName(row.original.assignee),
      }),
      columnHelper.accessor("assigned_date", {
        id: "assigned_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assignments.columns.assigned", { ns: "starter" }, "Assigned")}</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{formatDate(getValue(), locale)}</span>
        ),
      }),
      columnHelper.accessor("returned_date", {
        id: "returned_date",
        header: translate("assets.assignments.columns.status", { ns: "starter" }, "Status"),
        enableSorting: false,
        cell: ({ getValue }) => {
          const returned = getValue();
          return returned ? (
            <span className="whitespace-nowrap text-muted-foreground">
              {translate("assets.assignments.returnedPrefix", { ns: "starter" }, "Returned")}{" "}
              {formatDate(returned, locale)}
            </span>
          ) : (
            <Pill
              label={translate("assets.assignments.active", { ns: "starter" }, "Active")}
              className="bg-blue-500/15 text-blue-700 dark:text-blue-300"
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: translate("assets.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 200,
        cell: ({ row }) => {
          const active = !row.original.returned_date;
          return (
            <div className="flex items-center gap-1">
              {active ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => returnAssignment(row.original)}
                >
                  <Undo2 />
                  {translate("assets.assignments.actions.return", { ns: "starter" }, "Return")}
                </Button>
              ) : null}
              <EditButton
                resource="hub_as_assignments"
                recordItemId={row.original.id}
                variant="ghost"
                size="icon"
                onClick={() => openChild(`edit/${row.original.id}`)}
              >
                <Pencil />
              </EditButton>
              <DeleteButton
                resource="hub_as_assignments"
                recordItemId={row.original.id}
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
              </DeleteButton>
            </div>
          );
        },
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, openChild, translate]);

  const table = useTable<AssignmentRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_as_assignments",
      syncWithLocation: false,
      meta: { appends: ["asset", "assignee"] },
      sorters: { initial: [{ field: "assigned_date", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_as_assignments">
      <DataTable table={table} />
    </ListView>
  );
}
