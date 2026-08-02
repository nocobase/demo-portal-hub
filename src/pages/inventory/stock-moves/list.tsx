import { useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { MOVE_TYPES, formatDateTime, labelFor, signedQty } from "../constants";
import { EnumBadge, useLocale } from "../shared";
import { useOpenContextualChild } from "../route-surfaces";
import type { StockMoveRecord } from "../types";

export function StockMovesLayout() {
  return (
    <CanAccess
      resource="hub_inv_stock_moves"
      action="list"
      fallback={<AccessDenied />}
    >
      <StockMoveList />
    </CanAccess>
  );
}

function StockMoveList() {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const locale = useLocale();

  const typeOptions = useMemo(
    () =>
      MOVE_TYPES.map((t) => ({
        value: t.value,
        label: labelFor(MOVE_TYPES, t.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<StockMoveRecord>();
    return [
      columnHelper.accessor("moved_at", {
        id: "moved_at",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("inventory.stockMoves.fields.date", { ns: "starter" }, "Date")}</span>
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
        header: translate("inventory.stockMoves.fields.product", { ns: "starter" }, "Product"),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.product?.name || "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "warehouse",
        header: translate("inventory.stockMoves.fields.warehouse", { ns: "starter" }, "Warehouse"),
        enableSorting: false,
        cell: ({ row }) => row.original.warehouse?.name || "—",
      }),
      columnHelper.accessor("type", {
        id: "type",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("inventory.stockMoves.fields.type", { ns: "starter" }, "Type")}</span>
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
          return <EnumBadge value={value} label={labelFor(MOVE_TYPES, value, translate)} />;
        },
      }),
      columnHelper.accessor("qty", {
        id: "qty",
        header: translate("inventory.stockMoves.fields.qty", { ns: "starter" }, "Qty"),
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
        header: translate("inventory.stockMoves.fields.note", { ns: "starter" }, "Note"),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("inventory.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_inv_stock_moves"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_inv_stock_moves"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
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
  }, [locale, openChild, translate, typeOptions]);

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
