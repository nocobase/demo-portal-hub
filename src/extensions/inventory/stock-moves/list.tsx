import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ListView } from "@/components/resources/views/list-view";
import { MOVE_TYPES, formatDateTime, labelFor, signedQty } from "../constants";
import { EnumBadge, useLocale } from "../shared";
import type { StockMoveRecord } from "../types";

export function StockMovesLayout() {
  return (
    <>
      <CanAccess
        resource="hub_inv_stock_moves"
        action="list"
        fallback={<AccessDenied />}
      >
        <StockMoveList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function StockMoveList() {
  const locale = useLocale();

  const typeOptions = useMemo(
    () => MOVE_TYPES.map((t) => ({ value: t.value, label: t.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<StockMoveRecord>();
    return [
      columnHelper.accessor("moved_at", {
        id: "moved_at",
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
      columnHelper.display({
        id: "product",
        header: "Product",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.product?.name || "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "warehouse",
        header: "Warehouse",
        enableSorting: false,
        cell: ({ row }) => row.original.warehouse?.name || "—",
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
          const value = getValue() ?? "in";
          return <EnumBadge value={value} label={labelFor(MOVE_TYPES, value)} />;
        },
      }),
      columnHelper.accessor("qty", {
        id: "qty",
        header: "Qty",
        enableSorting: false,
        cell: ({ row }) => {
          const signed = signedQty(row.original.type, row.original.qty);
          return (
            <span
              className={
                "tabular-nums font-medium " +
                (signed < 0 ? "text-red-600 dark:text-red-400" : "")
              }
            >
              {signed > 0 ? "+" : ""}
              {signed}
            </span>
          );
        },
      }),
      columnHelper.accessor("note", {
        id: "note",
        header: "Note",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 112,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <EditButton
              resource="hub_inv_stock_moves"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_inv_stock_moves"
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

  const table = useTable<StockMoveRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_inv_stock_moves",
      syncWithLocation: false,
      meta: { appends: ["product", "warehouse"] },
      sorters: { initial: [{ field: "moved_at", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_inv_stock_moves">
      <DataTable table={table} />
    </ListView>
  );
}
