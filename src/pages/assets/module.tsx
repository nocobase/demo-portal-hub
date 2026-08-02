import { ClipboardList, Package, Wrench } from "lucide-react";
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
import { AssignmentShow } from "./assignments/show";
import { AssignmentsLayout } from "./assignments/layout";
import { MaintenancePage } from "./maintenance/page";
import { assetsRoutes } from "./routes";

const denied = <AccessDenied />;

// --- Nested asset-scoped assignment surfaces --------------------------------
// Opened from inside the asset detail drawer at
// `/asset-registry/show/:id/assignments/show/:asgId`. The record id comes from
// the `asgId` param so it does not collide with the parent asset `:id`.

function AssetScopedAssignmentShow() {
  return <AssignmentShow idParam="asgId" />;
}

function AssetScopedAssignmentEdit() {
  return <AssignmentEdit idParam="asgId" />;
}

const assetShowChildren: AppRouteDefinition[] = [
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
      <CanAccess resource="hub_as_assignments" action="create" fallback={denied}>
        <AssetNestedAssign />
      </CanAccess>
    ),
  },
  {
    name: "hub_as_assets.show.assignments.show",
    path: "assignments/show/:asgId",
    element: (
      <CanAccess resource="hub_as_assignments" action="show" fallback={denied}>
        <AssetScopedAssignmentShow />
      </CanAccess>
    ),
    children: [
      {
        name: "hub_as_assets.show.assignments.show.edit",
        path: "edit",
        element: (
          <CanAccess resource="hub_as_assignments" action="edit" fallback={denied}>
            <AssetScopedAssignmentEdit />
          </CanAccess>
        ),
      },
    ],
  },
];

const assignmentShowChildren: AppRouteDefinition[] = [
  {
    name: "hub_as_assignments.show.edit",
    path: "edit",
    element: (
      <CanAccess resource="hub_as_assignments" action="edit" fallback={denied}>
        <AssignmentEdit />
      </CanAccess>
    ),
  },
];

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
        children: assetShowChildren,
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
      {
        name: "hub_as_assignments.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess
            resource="hub_as_assignments"
            action="show"
            fallback={denied}
          >
            <AssignmentShow />
          </CanAccess>
        ),
        children: assignmentShowChildren,
      },
    ],
  },
  {
    name: "as-maintenance",
    path: assetsRoutes.maintenance,
    element: (
      <CanAccess resource="hub_as_assets" action="list" fallback={denied}>
        <MaintenancePage />
      </CanAccess>
    ),
    resource: {
      meta: {
        label: "Maintenance",
        singularLabel: "Maintenance",
        i18nKey: "assets.resources.maintenance",
        i18nSingularKey: "assets.resources.maintenance",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "assets.resources.maintenance.description",
        priority: 50,
        icon: <Wrench />,
        description:
          "Devices in repair and aging assets that may need a warranty check.",
        canCreate: false,
        acl: { type: "collection" },
      },
    },
  },
];

export const assetsModule = { routes };
