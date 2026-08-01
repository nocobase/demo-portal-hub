import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterCombobox,
  DataTableFilterDropdownText,
} from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  PRODUCT_STATUSES,
  formatCurrency,
  labelFor,
  signedQty,
} from "../constants";
import { EnumBadge, useLocale } from "../shared";
import type { ProductRecord, StockMoveRecord } from "../types";

export function ProductsLayout() {
  return (
    <>
      <CanAccess
        resource="hub_inv_products"
        action="list"
        fallback={<AccessDenied />}
      >
        <ProductList />
      </CanAccess>
      <Outlet />
    </>
  );
}

/** Aggregate on-hand quantity per product from every stock move. */
export function useOnHandByProduct() {
  const { result } = useList<StockMoveRecord>({
    resource: "hub_inv_stock_moves",
    pagination: { mode: "server", currentPage: 1, pageSize: 1000 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  return useMemo(() => {
    const map = new Map<string, number>();
    for (const move of result.data) {
      if (move.product_id === null || move.product_id === undefined) continue;
      const key = String(move.product_id);
      map.set(key, (map.get(key) ?? 0) + signedQty(move.type, move.qty));
    }
    return map;
  }, [result.data]);
}

function ProductList() {
  const locale = useLocale();
  const onHand = useOnHandByProduct();

  const categoryOptions = useMemo(
    () => CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
    []
  );
  const statusOptions = useMemo(
    () => PRODUCT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ProductRecord>();
    return [
      columnHelper.accessor("sku", {
        id: "sku",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>SKU</span>
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
          <span className="font-mono text-xs">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Name</span>
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
      columnHelper.accessor("category", {
        id: "category",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Category</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={categoryOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <EnumBadge value={value} label={labelFor(CATEGORIES, value)} />
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("unit_price", {
        id: "unit_price",
        header: "Unit price",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {formatCurrency(getValue(), locale)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "on_hand",
        header: "On hand",
        enableSorting: false,
        cell: ({ row }) => {
          const qty = onHand.get(String(row.original.id)) ?? 0;
          const reorder = Number(row.original.reorder_level ?? 0);
          const low = qty <= reorder;
          return (
            <span
              className={cn(
                "tabular-nums font-medium",
                low && "text-red-600 dark:text-red-400"
              )}
            >
              {qty}
              {low ? (
                <span className="ml-1 text-xs font-normal">· low</span>
              ) : null}
            </span>
          );
        },
      }),
      columnHelper.accessor("reorder_level", {
        id: "reorder_level",
        header: "Reorder at",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Status</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={statusOptions}
              defaultOperator="eq"
              operators={["eq"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() ?? "active";
          return (
            <EnumBadge value={value} label={labelFor(PRODUCT_STATUSES, value)} />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_inv_products"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_inv_products"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_inv_products"
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
  }, [categoryOptions, locale, onHand, statusOptions]);

  const table = useTable<ProductRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_inv_products",
      syncWithLocation: false,
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_inv_products">
      <DataTable table={table} />
    </ListView>
  );
}
