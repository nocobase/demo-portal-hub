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
import type { ActivityFormValues, ActivityRecord } from "../types";
import { ActivityFormFields } from "./fields";

const toServerValues = (values: ActivityFormValues) => {
  const { deal_id, ...rest } = values;
  return {
    ...rest,
    deal: deal_id ? Number(deal_id) : null,
  } as unknown as ActivityFormValues;
};

export const ActivityCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Log activity"
        description="Record a call, email or meeting against a deal."
        closeTo={salesRoutes.activities}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ActivityCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ActivityCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ActivityRecord, HttpError, ActivityFormValues>({
    refineCoreProps: {
      resource: "hub_sales_activities",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      type: "call",
      subject: "",
      notes: "",
      date: null,
      deal_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ActivityFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Logging..." : "Log activity"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const ActivityEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit activity"
        description="Update this logged activity."
        closeTo={salesRoutes.activities}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ActivityEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ActivityEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<ActivityRecord, HttpError, ActivityFormValues>({
    refineCoreProps: {
      resource: "hub_sales_activities",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["deal"] },
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
          <ActivityFormFields form={form} record={query?.data?.data} />
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
