import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { DepartmentPicker } from "../pickers";
import { hrRoutes } from "../routes";
import type { DepartmentFormValues, DepartmentRecord } from "../types";

function DepartmentFormFields({
  form,
}: {
  form: UseFormReturn<DepartmentFormValues>;
  selfId?: string;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{ required: "Department name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department name</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Backend Engineering"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. BE"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent department</FormLabel>
            <FormControl
              render={
                <DepartmentPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Top level (no parent)"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export const DepartmentCreate = () => {
  const closeTo = hrRoutes.departments;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Add department"
        description="Create a team and optionally nest it under a parent."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <DepartmentCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function DepartmentCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<DepartmentRecord, HttpError, DepartmentFormValues>({
    refineCoreProps: {
      resource: "hub_hr_departments",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: { name: "", code: "", parentId: null },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(values))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <DepartmentFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add department"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const DepartmentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const closeTo = hrRoutes.departments;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit department"
        description="Rename or re-parent this team."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <DepartmentEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function DepartmentEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<DepartmentRecord, HttpError, DepartmentFormValues>({
    refineCoreProps: {
      resource: "hub_hr_departments",
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
          <DepartmentFormFields form={form} selfId={id} />
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
