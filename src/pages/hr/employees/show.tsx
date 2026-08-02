import { useList, useShow, useTranslate } from "@refinedev/core";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
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
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<EmployeeRecord>({
    resource: "hub_hr_employees",
    id,
    meta: { appends: ["department", "manager"] },
  });

  const displayName =
    record?.name ||
    translate("hr.employees.detail.unnamed", { ns: "starter" }, "Employee");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description={translate(
        "hr.employees.drawer.show.description",
        { ns: "starter" },
        "Profile, reporting line and leave history."
      )}
      closeLabel={translate("hr.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_hr_employees"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            onClick={() => openChild("edit")}
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
            <AlertTitle>
              {translate(
                "hr.employees.detail.loadError.title",
                { ns: "starter" },
                "Unable to load employee"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "hr.employees.detail.loadError.description",
                { ns: "starter" },
                "The record may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("hr.employees.detail.profile", { ns: "starter" }, "Profile")}
              items={[
                [
                  translate("hr.employees.fields.title", { ns: "starter" }, "Title"),
                  record?.job_title || "—",
                ],
                [
                  translate("hr.employees.fields.status", { ns: "starter" }, "Status"),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "active"}
                    label={labelFor(EMPLOYEE_STATUSES, record?.status ?? "active", translate)}
                  />,
                ],
                [
                  translate("hr.employees.fields.department", { ns: "starter" }, "Department"),
                  record?.department?.name || "—",
                ],
                [
                  translate("hr.employees.fields.manager", { ns: "starter" }, "Manager"),
                  record?.manager?.name || "—",
                ],
                [
                  translate("hr.employees.fields.email", { ns: "starter" }, "Email"),
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
                [
                  translate("hr.employees.fields.hireDate", { ns: "starter" }, "Hire date"),
                  formatDate(record?.hire_date, locale),
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <ReportsSection managerId={id} />
                <Separator />
                <LeaveHistorySection
                  employeeId={id}
                  locale={locale}
                  openChild={openChild}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

type OpenChild = (to: string) => void;

function ReportsSection({ managerId }: { managerId: string }) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { result } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "name", order: "asc" }],
    filters: [{ field: "manager_id", operator: "eq", value: managerId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate("hr.employees.detail.reports", { ns: "starter" }, "Direct reports")}
    >
      <SimpleTable
        headers={[
          translate("hr.employees.fields.name", { ns: "starter" }, "Name"),
          translate("hr.employees.fields.title", { ns: "starter" }, "Title"),
          translate("hr.employees.fields.status", { ns: "starter" }, "Status"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={3}
            text={translate(
              "hr.employees.detail.reportsEmpty",
              { ns: "starter" },
              "No one reports to this person."
            )}
          />
        ) : (
          result.data.map((report) => (
            <tr
              key={String(report.id)}
              className="cursor-pointer hover:bg-accent/40"
              onClick={() => navigate(`/employees/show/${report.id}`)}
            >
              <td className="px-3 py-2 font-medium text-primary underline-offset-2 hover:underline">
                {report.name || "—"}
              </td>
              <td className="px-3 py-2">{report.job_title || "—"}</td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={report.status ?? "active"}
                  label={labelFor(EMPLOYEE_STATUSES, report.status ?? "active", translate)}
                />
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}

function LeaveHistorySection({
  employeeId,
  locale,
  openChild,
}: {
  employeeId: string;
  locale: string;
  openChild: OpenChild;
}) {
  const translate = useTranslate();
  const { result } = useList<LeaveRequestRecord>({
    resource: "hub_hr_leave_requests",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "start_date", order: "desc" }],
    filters: [{ field: "employee_id", operator: "eq", value: employeeId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate("hr.employees.detail.leaveHistory", { ns: "starter" }, "Leave history")}
      action={
        <Button variant="outline" size="sm" onClick={() => openChild("leave/create")}>
          <Plus />
          {translate("hr.employees.actions.logLeave", { ns: "starter" }, "Log leave")}
        </Button>
      }
    >
      <SimpleTable
        headers={[
          translate("hr.leave.fields.type", { ns: "starter" }, "Type"),
          translate("hr.leave.fields.dates", { ns: "starter" }, "Dates"),
          translate("hr.leave.fields.days", { ns: "starter" }, "Days"),
          translate("hr.leave.fields.status", { ns: "starter" }, "Status"),
          translate("hr.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text={translate(
              "hr.employees.detail.leaveEmpty",
              { ns: "starter" },
              "No leave requests on record."
            )}
          />
        ) : (
          result.data.map((leave) => (
            <tr
              key={String(leave.id)}
              className="cursor-pointer hover:bg-accent/40"
              onClick={() => openChild(`leave/edit/${encodeURIComponent(String(leave.id))}`)}
            >
              <td className="px-3 py-2">
                <EnumBadge
                  value={leave.type ?? "annual"}
                  label={labelFor(LEAVE_TYPES, leave.type ?? "annual", translate)}
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
                  label={labelFor(LEAVE_STATUSES, leave.status ?? "pending", translate)}
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      openChild(`leave/edit/${encodeURIComponent(String(leave.id))}`)
                    }
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    resource="hub_hr_leave_requests"
                    recordItemId={leave.id}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
