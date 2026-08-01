import { ClipboardList, Package } from "lucide-react";
import type { AppRouteDefinition } from "@nocobase/portal-sdk/routing";
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

const routes: AppRouteDefinition[] = [
  {
    name: "hub_as_assets",
    path: assetsRoutes.assets,
    element: <AssetsLayout />,
    resource: {
      meta: {
        label: "Assets",
        singularLabel: "Asset",
        i18nKey: "assets.resources.assets",
        i18nSingularKey: "assets.resources.asset",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "assets.resources.assets.description",
        priority: 10,
        icon: <Package />,
        description:
          "The company asset register — every device, its category, status and value.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_as_assets.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_as_assets" action="create" fallback={denied}>
            <AssetCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_as_assets.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_as_assets" action="edit" fallback={denied}>
            <AssetEdit />
          </CanAccess>
        ),
      },
      {
        name: "hub_as_assets.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource="hub_as_assets" action="show" fallback={denied}>
            <AssetShow />
          </CanAccess>
        ),
        children: [
          {
            name: "hub_as_assets.show.edit",
            path: "edit",
            element: (
              <CanAccess resource="hub_as_assets" action="edit" fallback={denied}>
                <AssetEdit />
              </CanAccess>
            ),
          },
          {
            name: "hub_as_assets.show.assign",
            path: "assign",
            element: (
              <CanAccess
                resource="hub_as_assignments"
                action="create"
                fallback={denied}
              >
                <AssetNestedAssign />
              </CanAccess>
            ),
          },
        ],
      },
    ],
  },
  {
    name: "hub_as_assignments",
    path: assetsRoutes.assignments,
    element: <AssignmentsLayout />,
    resource: {
      meta: {
        label: "Assignments",
        singularLabel: "Assignment",
        i18nKey: "assets.resources.assignments",
        i18nSingularKey: "assets.resources.assignment",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "assets.resources.assignments.description",
        priority: 11,
        icon: <ClipboardList />,
        description:
          "Who has what — active and returned device assignments across the company.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_as_assignments.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess
            resource="hub_as_assignments"
            action="create"
            fallback={denied}
          >
            <AssignmentCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_as_assignments.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess
            resource="hub_as_assignments"
            action="edit"
            fallback={denied}
          >
            <AssignmentEdit />
          </CanAccess>
        ),
      },
    ],
  },
];

export const assetsModule = { routes };
