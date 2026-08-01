import { useGetLocale } from "@refinedev/core";
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
import { EMPLOYEE_STATUSES, labelFor } from "../constants";
import { EnumBadge } from "../shared";
import { HrStats } from "../stats";
import type { EmployeeRecord } from "../types";

export function EmployeesLayout() {
  return (
    <>
      <CanAccess
        resource="hub_hr_employees"
        action="list"
        fallback={<AccessDenied />}
      >
        <EmployeeList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function EmployeeList() {
  const getLocale = useGetLocale();
  const locale = getLocale();

  const statusOptions = useMemo(
    () => EMPLOYEE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<EmployeeRecord>();
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
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("job_title", {
        id: "job_title",
        header: "Title",
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((record) => record.department?.name, {
        id: "department",
        header: "Department",
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((record) => record.manager?.name, {
        id: "manager",
        header: "Manager",
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
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
            <EnumBadge value={value} label={labelFor(EMPLOYEE_STATUSES, value)} />
          );
        },
      }),
      columnHelper.accessor("hire_date", {
        id: "hire_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>Hire date</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue();
          return value
            ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                new Date(value)
              )
            : "—";
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
              resource="hub_hr_employees"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_hr_employees"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_hr_employees"
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
  }, [locale, statusOptions]);

  const table = useTable<EmployeeRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_hr_employees",
      syncWithLocation: false,
      meta: { appends: ["department", "manager"] },
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_hr_employees">
      <HrStats />
      <DataTable table={table} />
    </ListView>
  );
}
