import { useGetLocale, useTranslate, useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Check, Eye, Pencil, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterCombobox } from "@/components/data-table/data-table-filter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
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
    <CanAccess
      resource="hub_hr_leave_requests"
      action="list"
      fallback={<AccessDenied />}
    >
      <LeaveList />
    </CanAccess>
  );
}

function LeaveList() {
  const translate = useTranslate();
  const getLocale = useGetLocale();
  const locale = getLocale();
  const navigate = useNavigate();
  const { mutate: updateLeave } = useUpdate<LeaveRequestRecord>();

  const setStatus = (id: string | number, status: string) =>
    updateLeave({
      resource: "hub_hr_leave_requests",
      id,
      values: { status },
      successNotification: {
        type: "success",
        message: translate(
          `hr.leave.notification.${status}`,
          { ns: "starter" },
          `Request ${status}`
        ),
      },
    });

  const typeOptions = useMemo(
    () =>
      LEAVE_TYPES.map((t) => ({
        value: t.value,
        label: labelFor(LEAVE_TYPES, t.value, translate),
      })),
    [translate]
  );
  const statusOptions = useMemo(
    () =>
      LEAVE_STATUSES.map((s) => ({
        value: s.value,
        label: labelFor(LEAVE_STATUSES, s.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<LeaveRequestRecord>();
    return [
      columnHelper.accessor((record) => record.employee?.name, {
        id: "employee",
        header: translate("hr.leave.fields.employee", { ns: "starter" }, "Employee"),
        enableSorting: false,
        cell: ({ row, getValue }) => (
          <button
            type="button"
            className="flex flex-col text-left"
            onClick={() => navigate(`/leave/show/${row.original.id}`)}
          >
            <span className="font-medium text-primary underline-offset-2 hover:underline">
              {getValue() || "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.employee?.job_title || ""}
            </span>
          </button>
        ),
      }),
      columnHelper.accessor("type", {
        id: "type",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("hr.leave.fields.type", { ns: "starter" }, "Type")}</span>
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
          return <EnumBadge value={value} label={labelFor(LEAVE_TYPES, value, translate)} />;
        },
      }),
      columnHelper.display({
        id: "dates",
        header: translate("hr.leave.fields.dates", { ns: "starter" }, "Dates"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDate(row.original.start_date, locale)} –{" "}
            {formatDate(row.original.end_date, locale)}
          </span>
        ),
      }),
      columnHelper.accessor("days", {
        id: "days",
        header: translate("hr.leave.fields.days", { ns: "starter" }, "Days"),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("hr.leave.fields.status", { ns: "starter" }, "Status")}</span>
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
            <EnumBadge value={value} label={labelFor(LEAVE_STATUSES, value, translate)} />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: translate("hr.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 232,
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
                    {translate("hr.leave.actions.approve", { ns: "starter" }, "Approve")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-red-500/40 text-red-700 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                    onClick={() => setStatus(row.original.id, "rejected")}
                  >
                    <X className="size-4" />
                    {translate("hr.leave.actions.reject", { ns: "starter" }, "Reject")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground"
                  onClick={() => setStatus(row.original.id, "pending")}
                >
                  {translate("hr.leave.actions.reopen", { ns: "starter" }, "Reopen")}
                </Button>
              )}
              <ShowButton
                resource="hub_hr_leave_requests"
                recordItemId={row.original.id}
                variant="ghost"
                size="icon"
              >
                <Eye />
              </ShowButton>
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
  }, [locale, navigate, setStatus, statusOptions, translate, typeOptions]);

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
