import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterCombobox,
  DataTableFilterDropdownText,
} from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { LEAD_SOURCES, LEAD_STATUSES, labelFor } from "../constants";
import { ListView } from "@/components/resources/views/list-view";
import { EnumBadge } from "../shared";
import type { LeadRecord } from "../types";

export function LeadsLayout() {
  return (
    <>
      <CanAccess
        resource="hub_sales_leads"
        action="list"
        fallback={<AccessDenied />}
      >
        <LeadList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function LeadList() {
  const statusOptions = useMemo(
    () => LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    []
  );
  const sourceOptions = useMemo(
    () => LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<LeadRecord>();
    return [
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
      columnHelper.accessor("company", {
        id: "company",
        header: "Company",
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Email",
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("source", {
        id: "source",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Source</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={sourceOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <EnumBadge value={value} label={labelFor(LEAD_SOURCES, value)} />
          ) : (
            "—"
          );
        },
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
          const value = getValue() ?? "new";
          return (
            <EnumBadge value={value} label={labelFor(LEAD_STATUSES, value)} />
          );
        },
      }),
      columnHelper.accessor((record) => record.owner, {
        id: "owner",
        header: "Owner",
        enableSorting: false,
        cell: ({ getValue }) => {
          const owner = getValue();
          return owner ? owner.nickname || owner.username || "—" : "—";
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 112,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <EditButton
              resource="hub_sales_leads"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_sales_leads"
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
  }, [sourceOptions, statusOptions]);

  const table = useTable<LeadRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_sales_leads",
      syncWithLocation: false,
      meta: { appends: ["owner"] },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_sales_leads">
      <DataTable table={table} />
    </ListView>
  );
}
