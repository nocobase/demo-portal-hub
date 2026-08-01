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
import { getSupplierShowPath, procurementRoutes } from "../routes";
import type { SupplierFormValues, SupplierRecord } from "../types";
import { SupplierFormFields } from "./fields";

export const SupplierCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Add supplier"
        description="Add a vendor you buy goods or services from."
        closeTo={procurementRoutes.suppliers}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <SupplierCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function SupplierCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<SupplierRecord, HttpError, SupplierFormValues>({
    refineCoreProps: {
      resource: "hub_po_suppliers",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      rating: null,
      status: "active",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <SupplierFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add supplier"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const SupplierEdit = ({
  returnTo = "list",
}: {
  returnTo?: "show" | "list";
}) => {
  const { id } = useParams<{ id: string }>();
  const closeTo =
    returnTo === "show" && id
      ? getSupplierShowPath(id)
      : procurementRoutes.suppliers;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit supplier"
        description="Update this vendor's profile."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <SupplierEditForm id={id} returnTo={returnTo} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function SupplierEditForm({
  id,
}: {
  id?: string;
  returnTo?: "show" | "list";
}) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<SupplierRecord, HttpError, SupplierFormValues>({
    refineCoreProps: {
      resource: "hub_po_suppliers",
      action: "edit",
      id,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <SupplierFormFields form={form} />
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
