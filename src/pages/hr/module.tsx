import { CalendarCheck, Network, Users } from "lucide-react";

import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import {
  DepartmentCreate,
  DepartmentEdit,
} from "@/pages/hr/departments/create-edit";
import { DepartmentsLayout } from "@/pages/hr/departments/tree";
import { EmployeeCreate, EmployeeEdit } from "@/pages/hr/employees/create-edit";
import { EmployeesLayout } from "@/pages/hr/employees/list";
import { EmployeeShow } from "@/pages/hr/employees/show";
import { LeaveCreate, LeaveEdit } from "@/pages/hr/leave/create-edit";
import { LeaveLayout } from "@/pages/hr/leave/list";
import { hrRoutes } from "@/pages/hr/routes";

const denied = <AccessDenied />;

const routes: AppRouteDefinition[] = defineAppRoutes([
  {
    name: "hub_hr_employees",
    path: hrRoutes.employees,
    element: <EmployeesLayout />,
    resource: {
      meta: {
        label: "Employees",
        singularLabel: "Employee",
        i18nKey: "hr.resources.employees",
        i18nSingularKey: "hr.resources.employee",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "hr.resources.employees.description",
        priority: 10,
        icon: <Users />,
        description:
          "The people directory — profiles, reporting lines and leave.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_hr_employees.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_hr_employees" action="create" fallback={denied}>
            <EmployeeCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_hr_employees.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_hr_employees" action="edit" fallback={denied}>
            <EmployeeEdit />
          </CanAccess>
        ),
      },
      {
        name: "hub_hr_employees.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource="hub_hr_employees" action="show" fallback={denied}>
            <EmployeeShow />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_hr_departments",
    path: hrRoutes.departments,
    element: <DepartmentsLayout />,
    resource: {
      meta: {
        label: "Departments",
        singularLabel: "Department",
        i18nKey: "hr.resources.departments",
        i18nSingularKey: "hr.resources.department",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "hr.resources.departments.description",
        priority: 11,
        icon: <Network />,
        description: "The org structure as a team tree.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_hr_departments.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_hr_departments" action="create" fallback={denied}>
            <DepartmentCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_hr_departments.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_hr_departments" action="edit" fallback={denied}>
            <DepartmentEdit />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_hr_leave_requests",
    path: hrRoutes.leave,
    element: <LeaveLayout />,
    resource: {
      meta: {
        label: "Leave approvals",
        singularLabel: "Leave request",
        i18nKey: "hr.resources.leave",
        i18nSingularKey: "hr.resources.leaveRequest",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "hr.resources.leave.description",
        priority: 12,
        icon: <CalendarCheck />,
        description: "Review time-off requests and approve or reject them.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_hr_leave_requests.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_hr_leave_requests" action="create" fallback={denied}>
            <LeaveCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_hr_leave_requests.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_hr_leave_requests" action="edit" fallback={denied}>
            <LeaveEdit />
          </CanAccess>
        ),
      },
    ],
  },
]);

export const hrModule = { routes };
