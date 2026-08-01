import { useList, useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
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
import { useOpenContextualChild } from "../route-surfaces";
import type { ProductRecord, StockMoveRecord } from "../types";

export function ProductsLayout() {
  return (
    <CanAccess
      resource="hub_inv_products"
      action="list"
      fallback={<AccessDenied />}
    >
      <ProductList />
    </CanAccess>
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
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const onHand = useOnHandByProduct();

  const categoryOptions = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        value: c.value,
        label: labelFor(CATEGORIES, c.value, translate),
      })),
    [translate]
  );
  const statusOptions = useMemo(
    () =>
      PRODUCT_STATUSES.map((s) => ({
        value: s.value,
        label: labelFor(PRODUCT_STATUSES, s.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ProductRecord>();
    return [
      columnHelper.accessor("sku", {
        id: "sku",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("inventory.products.fields.sku", { ns: "starter" }, "SKU")}</span>
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
            <span>{translate("inventory.products.fields.name", { ns: "starter" }, "Name")}</span>
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
            <span>{translate("inventory.products.fields.category", { ns: "starter" }, "Category")}</span>
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
            <EnumBadge value={value} label={labelFor(CATEGORIES, value, translate)} />
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("unit_price", {
        id: "unit_price",
        header: translate("inventory.products.fields.unitPrice", { ns: "starter" }, "Unit price"),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {formatCurrency(getValue(), locale)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "on_hand",
        header: translate("inventory.products.fields.onHand", { ns: "starter" }, "On hand"),
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
                <span className="ml-1 text-xs font-normal">
                  · {translate("inventory.products.lowFlag", { ns: "starter" }, "low")}
                </span>
              ) : null}
            </span>
          );
        },
      }),
      columnHelper.accessor("reorder_level", {
        id: "reorder_level",
        header: translate("inventory.products.fields.reorderAt", { ns: "starter" }, "Reorder at"),
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
            <span>{translate("inventory.products.fields.status", { ns: "starter" }, "Status")}</span>
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
            <EnumBadge value={value} label={labelFor(PRODUCT_STATUSES, value, translate)} />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: translate("inventory.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_inv_products"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_inv_products"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
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
  }, [categoryOptions, locale, onHand, openChild, statusOptions, translate]);

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
