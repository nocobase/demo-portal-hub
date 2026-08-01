import { useList, useShow } from "@refinedev/core";
import { Pencil } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  EMPLOYEE_STATUSES,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  formatDate,
  labelFor,
} from "../constants";
import { hrRoutes } from "../routes";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  EnumBadge,
  SimpleTable,
  useLocale,
} from "../shared";
import type { EmployeeRecord, LeaveRequestRecord } from "../types";

export function EmployeeShow() {
  const locale = useLocale();
  const closeTo = hrRoutes.employees;
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<EmployeeRecord>({
    resource: "hub_hr_employees",
    id,
    meta: { appends: ["department", "manager"] },
  });

  const displayName = record?.name || "Employee";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Profile, reporting line and leave history."
      closeLabel="Close"
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_hr_employees"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
          >
            <Pencil />
          </EditButton>
        ) : null
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load employee</AlertTitle>
            <AlertDescription>
              The record may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Profile"
              items={[
                ["Title", record?.job_title || "—"],
                [
                  "Status",
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "active"}
                    label={labelFor(EMPLOYEE_STATUSES, record?.status ?? "active")}
                  />,
                ],
                ["Department", record?.department?.name || "—"],
                ["Manager", record?.manager?.name || "—"],
                [
                  "Email",
                  record?.email ? (
                    <a
                      key="email"
                      href={`mailto:${record.email}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {record.email}
                    </a>
                  ) : (
                    "—"
                  ),
                ],
                ["Hire date", formatDate(record?.hire_date, locale)],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <LeaveHistorySection employeeId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function LeaveHistorySection({
  employeeId,
  locale,
}: {
  employeeId: string;
  locale: string;
}) {
  const { result } = useList<LeaveRequestRecord>({
    resource: "hub_hr_leave_requests",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "start_date", order: "desc" }],
    filters: [{ field: "employee_id", operator: "eq", value: employeeId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection title="Leave history">
      <SimpleTable
        headers={["Type", "Dates", "Days", "Status"]}
      >
        {result.data.length === 0 ? (
          <EmptyRow colSpan={4} text="No leave requests on record." />
        ) : (
          result.data.map((leave) => (
            <tr key={String(leave.id)}>
              <td className="px-3 py-2">
                <EnumBadge
                  value={leave.type ?? "annual"}
                  label={labelFor(LEAVE_TYPES, leave.type ?? "annual")}
                />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {formatDate(leave.start_date, locale)} –{" "}
                {formatDate(leave.end_date, locale)}
              </td>
              <td className="px-3 py-2 tabular-nums">{leave.days ?? "—"}</td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={leave.status ?? "pending"}
                  label={labelFor(LEAVE_STATUSES, leave.status ?? "pending")}
                />
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
