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
import type { ProductFormValues, ProductRecord } from "../types";
import { ProductFormFields } from "./fields";

export const ProductCreate = ({
  closeTo = inventoryRoutes.products,
}: {
  closeTo?: string;
}) => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New product"
        description="Add a product to the catalog."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ProductForm mode="create" />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

export const ProductEdit = ({
  closeTo = inventoryRoutes.products,
}: {
  closeTo?: string;
}) => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit product"
        description="Update catalog details and reorder level."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ProductForm mode="edit" />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ProductForm({ mode }: { mode: "create" | "edit" }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ProductRecord, HttpError, ProductFormValues>({
    refineCoreProps: {
      resource: "hub_inv_products",
      action: mode,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      sku: "",
      name: "",
      category: "other",
      unit_price: null,
      reorder_level: null,
      status: "active",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [&_[data-slot=input]]:h-10 [&_[data-slot=select-trigger]]:h-10">
          <ProductFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Add product"
                : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
