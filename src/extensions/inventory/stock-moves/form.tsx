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
import { inventoryRoutes } from "../routes";
import type { StockMoveFormValues, StockMoveRecord } from "../types";
import { StockMoveFormFields } from "./fields";

type StockMoveSurfaceProps = {
  presetProductId?: string;
  closeTo?: string;
};

export const StockMoveCreate = ({
  presetProductId,
  closeTo = inventoryRoutes.stockMoves,
}: StockMoveSurfaceProps) => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New stock move"
        description="Record a receipt, issue or adjustment."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <StockMoveFormBody mode="create" presetProductId={presetProductId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

export const StockMoveEdit = ({
  presetProductId,
  closeTo = inventoryRoutes.stockMoves,
  idParam = "id",
}: StockMoveSurfaceProps & { idParam?: string }) => {
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit stock move"
        description="Update this movement."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <StockMoveFormBody
          mode="edit"
          recordId={recordId}
          presetProductId={presetProductId}
        />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function StockMoveFormBody({
  mode,
  recordId,
  presetProductId,
}: {
  mode: "create" | "edit";
  recordId?: string;
  presetProductId?: string;
}) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<StockMoveRecord, HttpError, StockMoveFormValues>({
    refineCoreProps: {
      resource: "hub_inv_stock_moves",
      action: mode,
      id: recordId,
      redirect: false,
      meta: mode === "edit" ? { appends: ["product", "warehouse"] } : undefined,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      type: "in",
      qty: null,
      moved_at: new Date().toISOString(),
      note: "",
      product_id: presetProductId ? String(presetProductId) : null,
      warehouse_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [&_[data-slot=input]]:h-10 [&_[data-slot=select-trigger]]:h-10">
          <StockMoveFormFields
            form={form}
            presetProductId={presetProductId}
            record={mode === "edit" ? query?.data?.data : undefined}
          />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Record move"
                : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
