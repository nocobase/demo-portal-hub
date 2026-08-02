import { useList, useShow, useTranslate } from "@refinedev/core";
import { Pencil, Users } from "lucide-react";
import { useNavigate, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { EMPLOYEE_STATUSES, labelFor } from "../constants";
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
} from "../shared";
import type { DepartmentRecord, EmployeeRecord } from "../types";

export function DepartmentShow() {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<DepartmentRecord>({
    resource: "hub_hr_departments",
    id,
  });

  const displayName =
    record?.name ||
    translate("hr.departments.detail.unnamed", { ns: "starter" }, "Department");

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
        "hr.departments.drawer.show.description",
        { ns: "starter" },
        "Team headcount and current members."
      )}
      closeLabel={translate("hr.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_hr_departments"
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
                "hr.departments.detail.loadError.title",
                { ns: "starter" },
                "Unable to load department"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "hr.departments.detail.loadError.description",
                { ns: "starter" },
                "The department may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("hr.departments.detail.info", { ns: "starter" }, "Info")}
              items={[
                [
                  translate("hr.departments.fields.code", { ns: "starter" }, "Code"),
                  record?.code || "—",
                ],
                [
                  translate("hr.departments.fields.parent", { ns: "starter" }, "Parent department"),
                  record?.parent?.name || "—",
                ],
              ]}
            />
            {id ? <DepartmentMembersSection departmentId={id} /> : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function DepartmentMembersSection({ departmentId }: { departmentId: string }) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { result } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 200 },
    sorters: [{ field: "name", order: "asc" }],
    filters: [{ field: "department_id", operator: "eq", value: departmentId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate("hr.departments.detail.members", { ns: "starter" }, "Members")}
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
              "hr.departments.detail.membersEmpty",
              { ns: "starter" },
              "No one is assigned to this department yet."
            )}
          />
        ) : (
          result.data.map((emp) => (
            <tr
              key={String(emp.id)}
              className="cursor-pointer hover:bg-accent/40"
              onClick={() => navigate(`/employees/show/${emp.id}`)}
            >
              <td className="px-3 py-2 font-medium">
                <span className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline">
                  <Users className="size-3.5" />
                  {emp.name || "—"}
                </span>
              </td>
              <td className="px-3 py-2">{emp.job_title || "—"}</td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={emp.status ?? "active"}
                  label={labelFor(EMPLOYEE_STATUSES, emp.status ?? "active", translate)}
                />
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
