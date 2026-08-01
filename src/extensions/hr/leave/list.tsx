import { useGetLocale, useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ListView } from "@/components/resources/views/list-view";
import { Button } from "@/components/ui/button";
import {
  LEAVE_STATUSES,
  LEAVE_TYPES,
  formatDate,
  labelFor,
} from "../constants";
import { EnumBadge } from "../shared";
import type { LeaveRequestRecord } from "../types";

export function LeaveLayout() {
  return (
    <>
      <CanAccess
        resource="hub_hr_leave_requests"
        action="list"
        fallback={<AccessDenied />}
      >
        <LeaveList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function LeaveList() {
  const getLocale = useGetLocale();
  const locale = getLocale();
  const { mutate: updateLeave } = useUpdate<LeaveRequestRecord>();

  const setStatus = (id: string | number, status: string) =>
    updateLeave({
      resource: "hub_hr_leave_requests",
      id,
      values: { status },
      successNotification: {
        type: "success",
        message: `Request ${status}`,
      },
    });

  const typeOptions = useMemo(
    () => LEAVE_TYPES.map((t) => ({ value: t.value, label: t.label })),
    []
  );
  const statusOptions = useMemo(
    () => LEAVE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<LeaveRequestRecord>();
    return [
      columnHelper.accessor((record) => record.employee?.name, {
        id: "employee",
        header: "Employee",
        enableSorting: false,
        cell: ({ row, getValue }) => (
          <div className="flex flex-col">
            <span className="font-medium">{getValue() || "—"}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.employee?.job_title || ""}
            </span>
          </div>
        ),
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
              operators={["eq"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() ?? "annual";
          return <EnumBadge value={value} label={labelFor(LEAVE_TYPES, value)} />;
        },
      }),
      columnHelper.display({
        id: "dates",
        header: "Dates",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDate(row.original.start_date, locale)} –{" "}
            {formatDate(row.original.end_date, locale)}
          </span>
        ),
      }),
      columnHelper.accessor("days", {
        id: "days",
        header: "Days",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() ?? "—"}</span>
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
          const value = getValue() ?? "pending";
          return (
            <EnumBadge value={value} label={labelFor(LEAVE_STATUSES, value)} />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        size: 200,
        cell: ({ row }) => {
          const isPending = (row.original.status ?? "pending") === "pending";
          return (
            <div className="flex items-center gap-1">
              {isPending ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                    onClick={() => setStatus(row.original.id, "approved")}
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-red-500/40 text-red-700 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                    onClick={() => setStatus(row.original.id, "rejected")}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground"
                  onClick={() => setStatus(row.original.id, "pending")}
                >
                  Reopen
                </Button>
              )}
              <EditButton
                resource="hub_hr_leave_requests"
                recordItemId={row.original.id}
                variant="ghost"
                size="icon"
              >
                <Pencil />
              </EditButton>
              <DeleteButton
                resource="hub_hr_leave_requests"
                recordItemId={row.original.id}
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
              </DeleteButton>
            </div>
          );
        },
      }),
    ];
  }, [locale, setStatus, statusOptions, typeOptions]);

  const table = useTable<LeaveRequestRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_hr_leave_requests",
      syncWithLocation: false,
      meta: { appends: ["employee"] },
      sorters: { initial: [{ field: "start_date", order: "desc" }] },
    },
  });

  return (
    <ListView resource="hub_hr_leave_requests">
      <DataTable table={table} />
    </ListView>
  );
}
