import { useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { ACTIVITY_TYPES, formatDateTime, labelFor } from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
import { EnumBadge, useLocale } from "../shared";
import type { ActivityRecord } from "../types";

export function ActivitiesLayout() {
  return (
    <CanAccess
      resource="hub_sales_activities"
      action="list"
      fallback={<AccessDenied />}
    >
      <ActivityList />
    </CanAccess>
  );
}

function ActivityList() {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const locale = useLocale();

  const typeOptions = useMemo(
    () =>
      ACTIVITY_TYPES.map((type) => ({
        value: type.value,
        label: labelFor(ACTIVITY_TYPES, type.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ActivityRecord>();
    return [
      columnHelper.accessor("date", {
        id: "date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate(
                "sales.activities.fields.date",
                { ns: "starter" },
                "Date"
              )}
            </span>
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
            <span>
              {translate(
                "sales.activities.fields.type",
                { ns: "starter" },
                "Type"
              )}
            </span>
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
            <EnumBadge value={value} label={labelFor(ACTIVITY_TYPES, value, translate)} />
          );
        },
      }),
      columnHelper.accessor("subject", {
        id: "subject",
        header: translate(
          "sales.activities.fields.subject",
          { ns: "starter" },
          "Subject"
        ),
        enableSorting: false,
        cell: ({ getValue, row }) => (
          <button
            type="button"
            className="font-medium text-left text-primary underline-offset-2 hover:underline"
            onClick={() => openChild(`show/${row.original.id}`)}
          >
            {getValue() || "—"}
          </button>
        ),
      }),
      columnHelper.accessor((record) => record.deal, {
        id: "deal",
        header: translate(
          "sales.activities.fields.deal",
          { ns: "starter" },
          "Deal"
        ),
        enableSorting: false,
        cell: ({ getValue }) => getValue()?.title || "—",
      }),
      columnHelper.display({
        id: "actions",
        header: translate("sales.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_sales_activities"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_sales_activities"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
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
  }, [locale, openChild, translate, typeOptions]);

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
