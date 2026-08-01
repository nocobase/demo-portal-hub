import { useList, useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterDropdownText } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ListView } from "@/components/resources/views/list-view";
import { signedQty } from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
import type { StockMoveRecord, WarehouseRecord } from "../types";

export function WarehousesLayout() {
  return (
    <CanAccess
      resource="hub_inv_warehouses"
      action="list"
      fallback={<AccessDenied />}
    >
      <WarehouseList />
    </CanAccess>
  );
}

function WarehouseList() {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();

  // Units currently held per warehouse, summed across all products.
  const { result: moves } = useList<StockMoveRecord>({
    resource: "hub_inv_stock_moves",
    pagination: { mode: "server", currentPage: 1, pageSize: 1000 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const unitsByWarehouse = useMemo(() => {
    const map = new Map<string, number>();
    for (const move of moves.data) {
      if (move.warehouse_id === null || move.warehouse_id === undefined)
        continue;
      const key = String(move.warehouse_id);
      map.set(key, (map.get(key) ?? 0) + signedQty(move.type, move.qty));
    }
    return map;
  }, [moves.data]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<WarehouseRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("inventory.warehouses.fields.name", { ns: "starter" }, "Name")}</span>
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
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("code", {
        id: "code",
        header: translate("inventory.warehouses.fields.code", { ns: "starter" }, "Code"),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("location", {
        id: "location",
        header: translate("inventory.warehouses.fields.location", { ns: "starter" }, "Location"),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.display({
        id: "units",
        header: translate("inventory.warehouses.fields.unitsOnHand", { ns: "starter" }, "Units on hand"),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">
            {unitsByWarehouse.get(String(row.original.id)) ?? 0}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("inventory.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 112,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <EditButton
              resource="hub_inv_warehouses"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_inv_warehouses"
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
  }, [openChild, translate, unitsByWarehouse]);

  const table = useTable<WarehouseRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_inv_warehouses",
      syncWithLocation: false,
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_inv_warehouses">
      <DataTable table={table} />
    </ListView>
  );
}
