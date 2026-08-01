import { CalendarCheck, Network, Users } from "lucide-react";
import { Route } from "react-router";
import type { AppExtension } from "@/app/extension";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DepartmentCreate, DepartmentEdit } from "./departments/create-edit";
import { DepartmentsLayout } from "./departments/tree";
import { EmployeeCreate, EmployeeEdit } from "./employees/create-edit";
import { EmployeesLayout } from "./employees/list";
import { EmployeeShow } from "./employees/show";
import { LeaveCreate, LeaveEdit } from "./leave/create-edit";
import { LeaveLayout } from "./leave/list";
import { hrRoutes } from "./routes";

const denied = <AccessDenied />;

const hrExtension: AppExtension = {
  id: "hr",
  priority: 10,
  resources: [
    {
      name: "hub_hr_employees",
      list: hrRoutes.employees,
      create: hrRoutes.employeesCreate,
      edit: hrRoutes.employeesEdit,
      show: hrRoutes.employeesShow,
      meta: {
        label: "Employees",
        singularLabel: "Employee",
        priority: 10,
        icon: <Users />,
        description:
          "The people directory — profiles, reporting lines and leave.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_hr_departments",
      list: hrRoutes.departments,
      create: hrRoutes.departmentsCreate,
      edit: hrRoutes.departmentsEdit,
      meta: {
        label: "Departments",
        singularLabel: "Department",
        priority: 11,
        icon: <Network />,
        description: "The org structure as a team tree.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_hr_leave_requests",
      list: hrRoutes.leave,
      create: hrRoutes.leaveCreate,
      edit: hrRoutes.leaveEdit,
      meta: {
        label: "Leave approvals",
        singularLabel: "Leave request",
        priority: 12,
        icon: <CalendarCheck />,
        description: "Review time-off requests and approve or reject them.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path="/employees" element={<EmployeesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_hr_employees"
              action="create"
              fallback={denied}
            >
              <EmployeeCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_hr_employees"
              action="edit"
              fallback={denied}
            >
              <EmployeeEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess
              resource="hub_hr_employees"
              action="show"
              fallback={denied}
            >
              <EmployeeShow />
            </CanAccess>
          }
        />
      </Route>

      <Route path="/departments" element={<DepartmentsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_hr_departments"
              action="create"
              fallback={denied}
            >
              <DepartmentCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_hr_departments"
              action="edit"
              fallback={denied}
            >
              <DepartmentEdit />
            </CanAccess>
          }
        />
      </Route>

      <Route path="/leave" element={<LeaveLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_hr_leave_requests"
              action="create"
              fallback={denied}
            >
              <LeaveCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_hr_leave_requests"
              action="edit"
              fallback={denied}
            >
              <LeaveEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default hrExtension;
