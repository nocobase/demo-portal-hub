import { PackageOpen, Truck } from "lucide-react";
import { Route } from "react-router";
import type { AppExtension } from "@/app/extension";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { procurementRoutes } from "./routes";
import { PurchaseOrdersLayout } from "./purchase-orders/list";
import {
  PurchaseOrderCreate,
  PurchaseOrderEdit,
} from "./purchase-orders/create-edit";
import { PurchaseOrderShow } from "./purchase-orders/show";
import { PoItemCreate, PoItemEdit } from "./purchase-orders/item-form";
import { SuppliersLayout } from "./suppliers/list";
import { SupplierCreate, SupplierEdit } from "./suppliers/create-edit";
import { SupplierShow } from "./suppliers/show";

const procurementExtension: AppExtension = {
  id: "procurement",
  priority: 10,
  resources: [
    {
      name: "hub_po_purchase_orders",
      list: procurementRoutes.purchaseOrders,
      create: procurementRoutes.purchaseOrdersCreate,
      edit: procurementRoutes.purchaseOrdersEdit,
      show: procurementRoutes.purchaseOrdersShow,
      meta: {
        label: "Purchase Orders",
        singularLabel: "Purchase Order",
        priority: 10,
        icon: <Truck />,
        description:
          "Raise and track purchase orders, line items and supplier spend.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_po_suppliers",
      list: procurementRoutes.suppliers,
      create: procurementRoutes.suppliersCreate,
      edit: procurementRoutes.suppliersEdit,
      show: procurementRoutes.suppliersShow,
      meta: {
        label: "Suppliers",
        singularLabel: "Supplier",
        priority: 11,
        icon: <PackageOpen />,
        description: "Vendors you buy from, with ratings and order history.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path="/purchase-orders" element={<PurchaseOrdersLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_po_purchase_orders"
              action="create"
              fallback={<AccessDenied />}
            >
              <PurchaseOrderCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_po_purchase_orders"
              action="edit"
              fallback={<AccessDenied />}
            >
              <PurchaseOrderEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess
              resource="hub_po_purchase_orders"
              action="show"
              fallback={<AccessDenied />}
            >
              <PurchaseOrderShow />
            </CanAccess>
          }
        >
          <Route path="edit" element={<PurchaseOrderEdit returnTo="show" />} />
          <Route path="items/create" element={<PoItemCreate />} />
          <Route path="items/edit/:itemId" element={<PoItemEdit />} />
        </Route>
      </Route>

      <Route path="/suppliers" element={<SuppliersLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_po_suppliers"
              action="create"
              fallback={<AccessDenied />}
            >
              <SupplierCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_po_suppliers"
              action="edit"
              fallback={<AccessDenied />}
            >
              <SupplierEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess
              resource="hub_po_suppliers"
              action="show"
              fallback={<AccessDenied />}
            >
              <SupplierShow />
            </CanAccess>
          }
        >
          <Route path="edit" element={<SupplierEdit returnTo="show" />} />
        </Route>
      </Route>
    </>
  ),
};

export default procurementExtension;
