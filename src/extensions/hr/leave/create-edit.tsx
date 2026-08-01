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
import { hrRoutes } from "../routes";
import type { LeaveRequestFormValues, LeaveRequestRecord } from "../types";
import { LeaveFormFields } from "./fields";

const normalize = (values: LeaveRequestFormValues) => ({
  ...values,
  start_date: values.start_date || null,
  end_date: values.end_date || null,
});

export const LeaveCreate = () => {
  const closeTo = hrRoutes.leave;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New leave request"
        description="Log time off for a team member."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <LeaveCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function LeaveCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<LeaveRequestRecord, HttpError, LeaveRequestFormValues>({
    refineCoreProps: {
      resource: "hub_hr_leave_requests",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      employee_id: null,
      type: "annual",
      start_date: null,
      end_date: null,
      days: null,
      reason: "",
      status: "pending",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(normalize(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <LeaveFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Create request"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const LeaveEdit = () => {
  const { id } = useParams<{ id: string }>();
  const closeTo = hrRoutes.leave;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit leave request"
        description="Update the details of this request."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <LeaveEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function LeaveEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<LeaveRequestRecord, HttpError, LeaveRequestFormValues>({
    refineCoreProps: {
      resource: "hub_hr_leave_requests",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["employee"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(normalize(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <LeaveFormFields form={form} />
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
