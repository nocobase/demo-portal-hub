import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { getPurchaseOrderShowPath } from "../routes";
import type { PoItemFormValues, PoItemRecord } from "../types";

function ItemFields({ form }: { form: UseFormReturn<PoItemFormValues> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="product_name"
        rules={{ required: "Product name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Steel brackets"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="qty"
          rules={{
            required: "Quantity is required",
            min: { value: 0, message: "Quantity cannot be negative" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="10"
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? null
                          : Number(event.target.value)
                      )
                    }
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_price"
          rules={{
            required: "Unit price is required",
            min: { value: 0, message: "Unit price cannot be negative" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit price</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="8.50"
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? null
                          : Number(event.target.value)
                      )
                    }
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

export const PoItemCreate = () => {
  const { id: purchaseOrderId } = useParams<{ id: string }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Add line item"
        description="Add a product line to this purchase order."
        closeTo={
          purchaseOrderId ? getPurchaseOrderShowPath(purchaseOrderId) : ".."
        }
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <PoItemCreateForm purchaseOrderId={purchaseOrderId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function PoItemCreateForm({ purchaseOrderId }: { purchaseOrderId?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<PoItemRecord, HttpError, PoItemFormValues>({
    refineCoreProps: {
      resource: "hub_po_items",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: { product_name: "", qty: 1, unit_price: null },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onFinish({
            ...values,
            purchase_order: purchaseOrderId,
          } as unknown as PoItemFormValues)
        )}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ItemFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add item"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const PoItemEdit = () => {
  const { id: purchaseOrderId, itemId } = useParams<{
    id: string;
    itemId: string;
  }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit line item"
        description="Update this product line."
        closeTo={
          purchaseOrderId ? getPurchaseOrderShowPath(purchaseOrderId) : ".."
        }
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <PoItemEditForm id={itemId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function PoItemEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<PoItemRecord, HttpError, PoItemFormValues>({
    refineCoreProps: {
      resource: "hub_po_items",
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
          <ItemFields form={form} />
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
