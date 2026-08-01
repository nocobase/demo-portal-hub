import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { assetsRoutes, getAssetShowPath } from "../routes";
import { toDateInputValue } from "../constants";
import type { AssetFormValues, AssetRecord } from "../types";
import { AssetFormFields } from "./fields";

export const AssetCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Add asset"
        description="Register a new device in the asset register."
        closeLabel="Close"
        closeTo={assetsRoutes.assets}
        beforeClose={beforeClose}
      >
        <AssetCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function AssetCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<AssetRecord, HttpError, AssetFormValues>({
    refineCoreProps: {
      resource: "hub_as_assets",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      tag: "",
      name: "",
      category: null,
      status: "in_stock",
      purchase_date: null,
      value: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <AssetFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add asset"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const AssetEdit = ({
  returnTo = "list",
}: {
  returnTo?: "list" | "show";
}) => {
  const { id } = useParams<{ id: string }>();
  const closeTo =
    returnTo === "show" && id ? getAssetShowPath(id) : assetsRoutes.assets;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit asset"
        description="Update this device's details."
        closeLabel="Close"
        closeTo={closeTo}
        beforeClose={beforeClose}
      >
        <AssetEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function AssetEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<AssetRecord, HttpError, AssetFormValues>({
    refineCoreProps: {
      resource: "hub_as_assets",
      action: "edit",
      id,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  // Normalize the loaded ISO date into the yyyy-MM-dd the native input expects.
  const purchaseValue = form.watch("purchase_date");
  useEffect(() => {
    if (purchaseValue && purchaseValue.length > 10) {
      form.setValue("purchase_date", toDateInputValue(purchaseValue));
    }
  }, [form, purchaseValue]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <AssetFormFields form={form} />
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
