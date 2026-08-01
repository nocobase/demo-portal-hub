import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { inventoryRoutes } from "../routes";
import type { WarehouseFormValues, WarehouseRecord } from "../types";
import { WarehouseFormFields } from "./fields";

export const WarehouseCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New warehouse"
        description="Add a stocking location."
        closeTo={inventoryRoutes.warehouses}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <WarehouseForm mode="create" />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

export const WarehouseEdit = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit warehouse"
        description="Update this stocking location."
        closeTo={inventoryRoutes.warehouses}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <WarehouseForm mode="edit" />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function WarehouseForm({ mode }: { mode: "create" | "edit" }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<WarehouseRecord, HttpError, WarehouseFormValues>({
    refineCoreProps: {
      resource: "hub_inv_warehouses",
      action: mode,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: { name: "", code: "", location: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [&_[data-slot=input]]:h-10">
          <WarehouseFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Add warehouse"
                : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
