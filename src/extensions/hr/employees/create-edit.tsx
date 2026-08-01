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
import { toDateInputValue } from "../constants";
import { hrRoutes } from "../routes";
import type { EmployeeFormValues, EmployeeRecord } from "../types";
import { EmployeeFormFields } from "./fields";

export const EmployeeCreate = () => {
  const closeTo = hrRoutes.employees;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Add employee"
        description="Add someone to the team directory."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <EmployeeCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function EmployeeCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<EmployeeRecord, HttpError, EmployeeFormValues>({
    refineCoreProps: {
      resource: "hub_hr_employees",
      action: "create",
      redirect: false,
      onMutationSuccess: () => {
        close({ skipBeforeClose: true });
      },
    },
    defaultValues: {
      name: "",
      email: "",
      job_title: "",
      status: "active",
      hire_date: null,
      department_id: null,
      manager_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <EmployeeFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add employee"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const EmployeeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const closeTo = hrRoutes.employees;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit employee"
        description="Update this person's profile."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <EmployeeEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function EmployeeEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<EmployeeRecord, HttpError, EmployeeFormValues>({
    refineCoreProps: {
      resource: "hub_hr_employees",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["department", "manager"] },
      onMutationSuccess: () => {
        close({ skipBeforeClose: true });
      },
    },
  });

  const record = query?.data?.data;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onFinish({ ...values, hire_date: values.hire_date || null })
        )}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <EmployeeFormFields form={form} employeeId={id} />
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
