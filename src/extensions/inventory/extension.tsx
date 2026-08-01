import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  Warehouse,
} from "lucide-react";
import { Route, useParams } from "react-router";
import type { AppExtension } from "@/app/extension";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { InventoryDashboard } from "./dashboard";
import { inventoryRoutes } from "./routes";
import { ProductCreate, ProductEdit } from "./products/form";
import { ProductsLayout } from "./products/list";
import { ProductShow } from "./products/show";
import { WarehouseCreate, WarehouseEdit } from "./warehouses/form";
import { WarehousesLayout } from "./warehouses/list";
import { StockMoveCreate, StockMoveEdit } from "./stock-moves/form";
import { StockMovesLayout } from "./stock-moves/list";

const denied = <AccessDenied />;

const showPath = (id?: string) => `${inventoryRoutes.products}/show/${id ?? ""}`;

// Surfaces opened from inside a product drawer close back to that product and,
// for stock moves, inherit the product they were opened from.
function ProductNestedEdit() {
  const { id } = useParams<{ id: string }>();
  return <ProductEdit closeTo={showPath(id)} />;
}

function ProductNestedMoveCreate() {
  const { id } = useParams<{ id: string }>();
  return <StockMoveCreate presetProductId={id} closeTo={showPath(id)} />;
}

function ProductNestedMoveEdit() {
  const { id } = useParams<{ id: string }>();
  return (
    <StockMoveEdit presetProductId={id} idParam="moveId" closeTo={showPath(id)} />
  );
}

const productContextChildren = (
  <>
    <Route
      path="edit"
      element={
        <CanAccess resource="hub_inv_products" action="edit" fallback={denied}>
          <ProductNestedEdit />
        </CanAccess>
      }
    />
    <Route
      path="moves/create"
      element={
        <CanAccess
          resource="hub_inv_stock_moves"
          action="create"
          fallback={denied}
        >
          <ProductNestedMoveCreate />
        </CanAccess>
      }
    />
    <Route
      path="moves/edit/:moveId"
      element={
        <CanAccess
          resource="hub_inv_stock_moves"
          action="edit"
          fallback={denied}
        >
          <ProductNestedMoveEdit />
        </CanAccess>
      }
    />
  </>
);

// Inventory module — products, warehouses and stock moves, plus a stock-level
// dashboard. Nav group priority ≥10. The primary list is mounted at /products
// (the Home quick-link target).
const inventoryExtension: AppExtension = {
  id: "inventory",
  priority: 40,
  resources: [
    {
      name: "inventory-dashboard",
      list: inventoryRoutes.dashboard,
      meta: {
        label: "Inventory",
        priority: 10,
        icon: <LayoutDashboard />,
        acl: false,
      },
    },
    {
      name: "hub_inv_products",
      list: inventoryRoutes.products,
      create: inventoryRoutes.productsCreate,
      edit: inventoryRoutes.productsEdit,
      show: inventoryRoutes.productsShow,
      meta: {
        label: "Products",
        singularLabel: "Product",
        priority: 11,
        icon: <Package />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_inv_warehouses",
      list: inventoryRoutes.warehouses,
      create: inventoryRoutes.warehousesCreate,
      edit: inventoryRoutes.warehousesEdit,
      meta: {
        label: "Warehouses",
        singularLabel: "Warehouse",
        priority: 12,
        icon: <Warehouse />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_inv_stock_moves",
      list: inventoryRoutes.stockMoves,
      create: inventoryRoutes.stockMovesCreate,
      edit: inventoryRoutes.stockMovesEdit,
      meta: {
        label: "Stock moves",
        singularLabel: "Stock move",
        priority: 13,
        icon: <ArrowLeftRight />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path={inventoryRoutes.dashboard} element={<InventoryDashboard />} />

      <Route path={inventoryRoutes.products} element={<ProductsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_inv_products"
              action="create"
              fallback={denied}
            >
              <ProductCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_inv_products"
              action="edit"
              fallback={denied}
            >
              <ProductEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess
              resource="hub_inv_products"
              action="show"
              fallback={denied}
            >
              <ProductShow />
            </CanAccess>
          }
        >
          {productContextChildren}
        </Route>
      </Route>

      <Route path={inventoryRoutes.warehouses} element={<WarehousesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_inv_warehouses"
              action="create"
              fallback={denied}
            >
              <WarehouseCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_inv_warehouses"
              action="edit"
              fallback={denied}
            >
              <WarehouseEdit />
            </CanAccess>
          }
        />
      </Route>

      <Route path={inventoryRoutes.stockMoves} element={<StockMovesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_inv_stock_moves"
              action="create"
              fallback={denied}
            >
              <StockMoveCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_inv_stock_moves"
              action="edit"
              fallback={denied}
            >
              <StockMoveEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default inventoryExtension;
