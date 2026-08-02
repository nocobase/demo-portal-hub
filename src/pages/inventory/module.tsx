import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  PackageX,
  Warehouse,
} from "lucide-react";
import { useParams } from "react-router";

import type { AppRouteDefinition } from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { InventoryDashboard } from "./dashboard";
import { InventoryReorder } from "./reorder";
import { inventoryRoutes } from "./routes";
import { ProductCreate, ProductEdit } from "./products/form";
import { ProductsLayout } from "./products/list";
import { ProductShow } from "./products/show";
import { WarehouseCreate, WarehouseEdit } from "./warehouses/form";
import { WarehousesLayout } from "./warehouses/list";
import { StockMoveCreate, StockMoveEdit } from "./stock-moves/form";
import { StockMovesLayout } from "./stock-moves/list";

const denied = <AccessDenied />;

// Surfaces opened from inside a product drawer inherit the product they were
// opened from; close-to is resolved from the route-surface navigation state.
function ProductNestedMoveCreate() {
  const { id } = useParams<{ id: string }>();
  return <StockMoveCreate presetProductId={id} />;
}

function ProductNestedMoveEdit() {
  const { id } = useParams<{ id: string }>();
  return <StockMoveEdit presetProductId={id} idParam="moveId" />;
}

const productContextChildren: AppRouteDefinition[] = [
  {
    name: "hub_inv_products.show.edit",
    path: "edit",
    element: (
      <CanAccess resource="hub_inv_products" action="edit" fallback={denied}>
        <ProductEdit />
      </CanAccess>
    ),
  },
  {
    name: "hub_inv_products.show.moves.create",
    path: "moves/create",
    element: (
      <CanAccess resource="hub_inv_stock_moves" action="create" fallback={denied}>
        <ProductNestedMoveCreate />
      </CanAccess>
    ),
  },
  {
    name: "hub_inv_products.show.moves.edit",
    path: "moves/edit/:moveId",
    element: (
      <CanAccess resource="hub_inv_stock_moves" action="edit" fallback={denied}>
        <ProductNestedMoveEdit />
      </CanAccess>
    ),
  },
];

// Inventory module — products, warehouses and stock moves, plus a stock-level
// dashboard. Nav group priority ≥10. The primary list is mounted at /products
// (the Home quick-link target).
export const inventoryModule = {
  routes: [
    {
      name: "inventory-dashboard",
      path: inventoryRoutes.dashboard,
      element: <InventoryDashboard />,
      resource: {
        meta: {
          label: "Inventory",
          i18nKey: "inventory.resources.dashboard",
          i18nOptions: { ns: "starter" },
          descriptionI18nKey: "inventory.resources.dashboard.description",
          priority: 10,
          icon: <LayoutDashboard />,
          description: "On-hand stock, low-stock alerts and movement trends.",
          acl: false,
        },
      },
    },
    {
      name: "hub_inv_products",
      path: inventoryRoutes.products,
      element: <ProductsLayout />,
      resource: {
        meta: {
          label: "Products",
          singularLabel: "Product",
          i18nKey: "inventory.resources.products",
          i18nSingularKey: "inventory.resources.product",
          i18nOptions: { ns: "starter" },
          descriptionI18nKey: "inventory.resources.products.description",
          priority: 11,
          icon: <Package />,
          description: "The catalog with on-hand levels and reorder points.",
          canCreate: true,
          canDelete: true,
          acl: { type: "collection" },
        },
      },
      children: [
        {
          name: "hub_inv_products.create",
          path: "create",
          resourceAction: "create",
          element: (
            <CanAccess resource="hub_inv_products" action="create" fallback={denied}>
              <ProductCreate />
            </CanAccess>
          ),
        },
        {
          name: "hub_inv_products.edit",
          path: "edit/:id",
          resourceAction: "edit",
          element: (
            <CanAccess resource="hub_inv_products" action="edit" fallback={denied}>
              <ProductEdit />
            </CanAccess>
          ),
        },
        {
          name: "hub_inv_products.show",
          path: "show/:id",
          resourceAction: "show",
          element: (
            <CanAccess resource="hub_inv_products" action="show" fallback={denied}>
              <ProductShow />
            </CanAccess>
          ),
          children: productContextChildren,
        },
      ],
    },
    {
      name: "hub_inv_warehouses",
      path: inventoryRoutes.warehouses,
      element: <WarehousesLayout />,
      resource: {
        meta: {
          label: "Warehouses",
          singularLabel: "Warehouse",
          i18nKey: "inventory.resources.warehouses",
          i18nSingularKey: "inventory.resources.warehouse",
          i18nOptions: { ns: "starter" },
          descriptionI18nKey: "inventory.resources.warehouses.description",
          priority: 12,
          icon: <Warehouse />,
          description: "Stocking locations and units held at each.",
          canCreate: true,
          canDelete: true,
          acl: { type: "collection" },
        },
      },
      children: [
        {
          name: "hub_inv_warehouses.create",
          path: "create",
          resourceAction: "create",
          element: (
            <CanAccess resource="hub_inv_warehouses" action="create" fallback={denied}>
              <WarehouseCreate />
            </CanAccess>
          ),
        },
        {
          name: "hub_inv_warehouses.edit",
          path: "edit/:id",
          resourceAction: "edit",
          element: (
            <CanAccess resource="hub_inv_warehouses" action="edit" fallback={denied}>
              <WarehouseEdit />
            </CanAccess>
          ),
        },
      ],
    },
    {
      name: "hub_inv_stock_moves",
      path: inventoryRoutes.stockMoves,
      element: <StockMovesLayout />,
      resource: {
        meta: {
          label: "Stock moves",
          singularLabel: "Stock move",
          i18nKey: "inventory.resources.stockMoves",
          i18nSingularKey: "inventory.resources.stockMove",
          i18nOptions: { ns: "starter" },
          descriptionI18nKey: "inventory.resources.stockMoves.description",
          priority: 13,
          icon: <ArrowLeftRight />,
          description: "Every receipt, issue and adjustment across warehouses.",
          canCreate: true,
          canDelete: true,
          acl: { type: "collection" },
        },
      },
      children: [
        {
          name: "hub_inv_stock_moves.create",
          path: "create",
          resourceAction: "create",
          element: (
            <CanAccess resource="hub_inv_stock_moves" action="create" fallback={denied}>
              <StockMoveCreate />
            </CanAccess>
          ),
        },
        {
          name: "hub_inv_stock_moves.edit",
          path: "edit/:id",
          resourceAction: "edit",
          element: (
            <CanAccess resource="hub_inv_stock_moves" action="edit" fallback={denied}>
              <StockMoveEdit />
            </CanAccess>
          ),
        },
      ],
    },
    {
      name: "inv-reorder",
      path: inventoryRoutes.reorder,
      element: <InventoryReorder />,
      resource: {
        meta: {
          label: "Reorder",
          i18nKey: "inventory.resources.reorder",
          i18nOptions: { ns: "starter" },
          descriptionI18nKey: "inventory.resources.reorder.description",
          priority: 50,
          icon: <PackageX />,
          description: "Products at or below their reorder level with a suggested reorder quantity.",
          acl: false,
        },
      },
    },
  ] satisfies AppRouteDefinition[],
};
