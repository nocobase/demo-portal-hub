import { useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Button } from "@/components/ui/button";
import { ListView } from "@/components/resources/views/list-view";
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  formatDate,
  labelFor,
  maintenanceStatusBadgeClass,
  maintenanceTypeBadgeClass,
} from "../constants";
import { Pill, useLocale } from "../shared";
import type { MaintenanceRecord } from "../types";
import { useOpenContextualChild } from "../route-surfaces";

export function MaintenanceList() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<MaintenanceRecord>();
    return [
      columnHelper.accessor("title", {
        id: "title",
        header: translate("assets.maintenance.columns.title", { ns: "starter" }, "Title"),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title || "—"}</span>
        ),
      }),
      columnHelper.accessor((row) => row.asset?.name, {
        id: "asset",
        header: translate("assets.maintenance.columns.asset", { ns: "starter" }, "Asset"),
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
      columnHelper.accessor("type", {
        id: "type",
        header: translate("assets.maintenance.columns.type", { ns: "starter" }, "Type"),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <Pill
              label={labelFor(MAINTENANCE_TYPES, value, translate)}
              className={maintenanceTypeBadgeClass(value)}
            />
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: translate("assets.maintenance.columns.status", { ns: "starter" }, "Status"),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <Pill
              label={labelFor(MAINTENANCE_STATUSES, value, translate)}
              className={maintenanceStatusBadgeClass(value)}
            />
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("scheduled_date", {
        id: "scheduled_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.maintenance.columns.scheduled", { ns: "starter" }, "Scheduled")}</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{formatDate(getValue(), locale)}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("assets.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title={translate("assets.common.view", { ns: "starter" }, "View")}
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </Button>
            <EditButton
              resource="hub_as_maintenance"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_as_maintenance"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, openChild, translate]);

  const table = useTable<MaintenanceRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_as_maintenance",
      syncWithLocation: false,
      meta: { appends: ["asset"] },
      sorters: { initial: [{ field: "scheduled_date", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_as_maintenance">
      <DataTable table={table} />
    </ListView>
  );
}
