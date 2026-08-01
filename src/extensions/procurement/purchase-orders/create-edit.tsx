import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { getPurchaseOrderShowPath, procurementRoutes } from "../routes";
import type { PurchaseOrderFormValues, PurchaseOrderRecord } from "../types";
import { PurchaseOrderFormFields } from "./fields";

/** Map foreign-key form fields onto the association names NocoBase writes through. */
const toServerValues = (values: PurchaseOrderFormValues) => {
  const { supplier_id, owner_id, ...rest } = values;
  return {
    ...rest,
    supplier: supplier_id,
    owner: owner_id,
  } as unknown as PurchaseOrderFormValues;
};

export const PurchaseOrderCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New purchase order"
        description="Raise a purchase order against a supplier."
        closeTo={procurementRoutes.purchaseOrders}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <PurchaseOrderCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function PurchaseOrderCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<PurchaseOrderRecord, HttpError, PurchaseOrderFormValues>({
    refineCoreProps: {
      resource: "hub_po_purchase_orders",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      po_number: "",
      supplier_id: null,
      owner_id: null,
      status: "draft",
      order_date: new Date().toISOString().slice(0, 10),
      total: 0,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <PurchaseOrderFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create order"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const PurchaseOrderEdit = ({
  returnTo = "list",
}: {
  returnTo?: "show" | "list";
}) => {
  const { id } = useParams<{ id: string }>();
  const closeTo =
    returnTo === "show" && id
      ? getPurchaseOrderShowPath(id)
      : procurementRoutes.purchaseOrders;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit purchase order"
        description="Update this order's details."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <PurchaseOrderEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function PurchaseOrderEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<PurchaseOrderRecord, HttpError, PurchaseOrderFormValues>({
    refineCoreProps: {
      resource: "hub_po_purchase_orders",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["supplier", "owner"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  const record = query?.data?.data as PurchaseOrderRecord | undefined;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <PurchaseOrderFormFields form={form} record={record} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
