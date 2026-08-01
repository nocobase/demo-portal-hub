import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { INDUSTRIES, labelFor } from "../constants";
import { EnumBadge } from "../shared";
import type { AccountRecord } from "../types";

export function AccountsLayout() {
  return (
    <>
      <CanAccess
        resource="hub_sales_accounts"
        action="list"
        fallback={<AccessDenied />}
      >
        <AccountList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function AccountList() {
  const industryOptions = useMemo(
    () =>
      INDUSTRIES.map((industry) => ({
        value: industry.value,
        label: industry.label,
      })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AccountRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Account</span>
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
      columnHelper.accessor("industry", {
        id: "industry",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>Industry</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={industryOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <EnumBadge value={value} label={labelFor(INDUSTRIES, value)} />
          ) : (
            "—"
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
      columnHelper.accessor("website", {
        id: "website",
        header: "Website",
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {value.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            "—"
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
              resource="hub_sales_accounts"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_sales_accounts"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_sales_accounts"
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
  }, [industryOptions]);

  const table = useTable<AccountRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_sales_accounts",
      syncWithLocation: false,
      meta: { appends: ["owner"] },
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_sales_accounts">
      <DataTable table={table} />
    </ListView>
  );
}
