import { ClipboardList, Package } from "lucide-react";
import { Route } from "react-router";
import type { AppExtension } from "@/app/extension";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { AssetCreate, AssetEdit } from "./assets/create-edit";
import { AssetsLayout } from "./assets/layout";
import { AssetShow } from "./assets/show";
import {
  AssetNestedAssign,
  AssignmentCreate,
  AssignmentEdit,
} from "./assignments/create-edit";
import { AssignmentsLayout } from "./assignments/layout";
import { assetsRoutes } from "./routes";

const denied = <AccessDenied />;

const assetsExtension: AppExtension = {
  id: "assets",
  priority: 10,
  resources: [
    {
      name: "hub_as_assets",
      list: assetsRoutes.assets,
      create: assetsRoutes.assetsCreate,
      edit: assetsRoutes.assetsEdit,
      show: assetsRoutes.assetsShow,
      meta: {
        label: "Assets",
        singularLabel: "Asset",
        priority: 10,
        icon: <Package />,
        description:
          "The company asset register — every device, its category, status and value.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_as_assignments",
      list: assetsRoutes.assignments,
      create: assetsRoutes.assignmentsCreate,
      edit: assetsRoutes.assignmentsEdit,
      meta: {
        label: "Assignments",
        singularLabel: "Assignment",
        priority: 11,
        icon: <ClipboardList />,
        description:
          "Who has what — active and returned device assignments across the company.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path={assetsRoutes.assets} element={<AssetsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess resource="hub_as_assets" action="create" fallback={denied}>
              <AssetCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess resource="hub_as_assets" action="edit" fallback={denied}>
              <AssetEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess resource="hub_as_assets" action="show" fallback={denied}>
              <AssetShow />
            </CanAccess>
          }
        >
          <Route
            path="edit"
            element={
              <CanAccess resource="hub_as_assets" action="edit" fallback={denied}>
                <AssetEdit returnTo="show" />
              </CanAccess>
            }
          />
          <Route
            path="assign"
            element={
              <CanAccess
                resource="hub_as_assignments"
                action="create"
                fallback={denied}
              >
                <AssetNestedAssign />
              </CanAccess>
            }
          />
        </Route>
      </Route>

      <Route path={assetsRoutes.assignments} element={<AssignmentsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_as_assignments"
              action="create"
              fallback={denied}
            >
              <AssignmentCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_as_assignments"
              action="edit"
              fallback={denied}
            >
              <AssignmentEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default assetsExtension;
