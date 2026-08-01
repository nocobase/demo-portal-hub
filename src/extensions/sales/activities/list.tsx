import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ListView } from "@/components/resources/views/list-view";
import { ACTIVITY_TYPES, formatDateTime, labelFor } from "../constants";
import { EnumBadge, useLocale } from "../shared";
import type { ActivityRecord } from "../types";

export function ActivitiesLayout() {
  return (
    <>
      <CanAccess
        resource="hub_sales_activities"
        action="list"
        fallback={<AccessDenied />}
      >
        <ActivityList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function ActivityList() {
  const locale = useLocale();
  const typeOptions = useMemo(
    () => ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ActivityRecord>();
    return [
      columnHelper.accessor("date", {
        id: "date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>Date</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">
            {formatDateTime(getValue(), locale)}
          </span>
        ),
      }),
      columnHelper.accessor("type", {
        id: "type",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Type</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={typeOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() ?? "call";
          return (
            <EnumBadge value={value} label={labelFor(ACTIVITY_TYPES, value)} />
          );
        },
      }),
      columnHelper.accessor("subject", {
        id: "subject",
        header: "Subject",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor((record) => record.deal, {
        id: "deal",
        header: "Deal",
        enableSorting: false,
        cell: ({ getValue }) => getValue()?.title || "—",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 112,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <EditButton
              resource="hub_sales_activities"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_sales_activities"
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
  }, [locale, typeOptions]);

  const table = useTable<ActivityRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_sales_activities",
      syncWithLocation: false,
      meta: { appends: ["deal"] },
      sorters: { initial: [{ field: "date", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_sales_activities">
      <DataTable table={table} />
    </ListView>
  );
}
