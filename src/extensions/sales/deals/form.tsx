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
import { salesRoutes } from "../routes";
import type { DealFormValues, DealRecord } from "../types";
import { DealFormFields } from "./fields";

type DealSurfaceProps = {
  presetAccountId?: string;
  closeTo?: string;
};

const toServerValues = (values: DealFormValues) => {
  const { account_id, owner_id, ...rest } = values;
  return {
    ...rest,
    account: account_id ? Number(account_id) : null,
    owner: owner_id ? Number(owner_id) : null,
  } as unknown as DealFormValues;
};

export const DealCreate = ({
  presetAccountId,
  closeTo = salesRoutes.pipeline,
}: DealSurfaceProps) => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New deal"
        description="Add a deal to the pipeline."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <DealCreateForm presetAccountId={presetAccountId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function DealCreateForm({ presetAccountId }: DealSurfaceProps) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<DealRecord, HttpError, DealFormValues>({
    refineCoreProps: {
      resource: "hub_sales_deals",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      title: "",
      stage: "inquiry",
      amount: null,
      expected_close_date: null,
      account_id: presetAccountId ? String(presetAccountId) : null,
      owner_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <DealFormFields form={form} presetAccountId={presetAccountId} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add deal"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const DealEdit = ({
  presetAccountId,
  idParam = "id",
  closeTo = salesRoutes.pipeline,
}: DealSurfaceProps & { idParam?: string }) => {
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit deal"
        description="Update stage, value and timing."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <DealEditForm recordId={recordId} presetAccountId={presetAccountId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function DealEditForm({
  recordId,
  presetAccountId,
}: DealSurfaceProps & { recordId?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<DealRecord, HttpError, DealFormValues>({
    refineCoreProps: {
      resource: "hub_sales_deals",
      action: "edit",
      id: recordId,
      redirect: false,
      meta: { appends: ["account", "owner"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <DealFormFields
            form={form}
            presetAccountId={presetAccountId}
            record={query?.data?.data}
          />
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
