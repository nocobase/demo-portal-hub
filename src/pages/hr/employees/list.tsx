import { useGetLocale, useTranslate } from "@refinedev/core";
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
import { EMPLOYEE_STATUSES, labelFor } from "../constants";
import { EnumBadge } from "../shared";
import { HrStats } from "../stats";
import type { EmployeeRecord } from "../types";

export function EmployeesLayout() {
  return (
    <CanAccess
      resource="hub_hr_employees"
      action="list"
      fallback={<AccessDenied />}
    >
      <EmployeeList />
    </CanAccess>
  );
}

function EmployeeList() {
  const translate = useTranslate();
  const getLocale = useGetLocale();
  const locale = getLocale();

  const statusOptions = useMemo(
    () =>
      EMPLOYEE_STATUSES.map((s) => ({
        value: s.value,
        label: labelFor(EMPLOYEE_STATUSES, s.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<EmployeeRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("hr.employees.fields.name", { ns: "starter" }, "Name")}</span>
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
        header: translate("hr.employees.fields.title", { ns: "starter" }, "Title"),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((record) => record.department?.name, {
        id: "department",
        header: translate("hr.employees.fields.department", { ns: "starter" }, "Department"),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((record) => record.manager?.name, {
        id: "manager",
        header: translate("hr.employees.fields.manager", { ns: "starter" }, "Manager"),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("hr.employees.fields.status", { ns: "starter" }, "Status")}</span>
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
            <EnumBadge
              value={value}
              label={labelFor(EMPLOYEE_STATUSES, value, translate)}
            />
          );
        },
      }),
      columnHelper.accessor("hire_date", {
        id: "hire_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("hr.employees.fields.hireDate", { ns: "starter" }, "Hire date")}</span>
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
        header: translate("hr.common.actions", { ns: "starter" }, "Actions"),
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
  }, [locale, statusOptions, translate]);

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
