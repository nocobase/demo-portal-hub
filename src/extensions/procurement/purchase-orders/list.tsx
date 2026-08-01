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
import { PO_STATUSES, formatCurrency, formatDate, statusLabel } from "../constants";
import { useSupplierOptions } from "../pickers";
import { EnumBadge, useLocale } from "../shared";
import type { PurchaseOrderRecord } from "../types";
import { useOpenContextualChild } from "../route-surfaces";
import { SpendPanel } from "./spend";

export function PurchaseOrdersLayout() {
  return (
    <CanAccess
      resource="hub_po_purchase_orders"
      action="list"
      fallback={<AccessDenied />}
    >
      <PurchaseOrderList />
    </CanAccess>
  );
}

function PurchaseOrderList() {
  const openChild = useOpenContextualChild();
  const locale = useLocale();
  const { options: supplierOptions } = useSupplierOptions();

  const statusOptions = useMemo(
    () => PO_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<PurchaseOrderRecord>();
    return [
      columnHelper.accessor("po_number", {
        id: "po_number",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>PO number</span>
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
      columnHelper.accessor((record) => record.supplier?.name, {
        id: "supplier.id",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Supplier</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={supplierOptions}
              defaultOperator="eq"
              operators={["eq"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ row }) => row.original.supplier?.name || "—",
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
          const value = getValue() ?? "draft";
          return <EnumBadge value={value} label={statusLabel(value)} />;
        },
      }),
      columnHelper.accessor("order_date", {
        id: "order_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>Order date</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">
            {formatDate(getValue(), locale)}
          </span>
        ),
      }),
      columnHelper.accessor("total", {
        id: "total",
        header: ({ column }) => (
          <div className="flex items-center justify-end gap-1">
            <span>Total</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(getValue(), locale)}
          </div>
        ),
      }),
      columnHelper.accessor((record) => record.owner?.nickname, {
        id: "owner",
        header: "Owner",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.owner?.nickname || row.original.owner?.username || "—",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_po_purchase_orders"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_po_purchase_orders"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_po_purchase_orders"
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
  }, [locale, openChild, statusOptions, supplierOptions]);

  const table = useTable<PurchaseOrderRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_po_purchase_orders",
      syncWithLocation: false,
      meta: { appends: ["supplier", "owner"] },
      sorters: { initial: [{ field: "order_date", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_po_purchase_orders">
      <SpendPanel />
      <DataTable table={table} />
    </ListView>
  );
}
