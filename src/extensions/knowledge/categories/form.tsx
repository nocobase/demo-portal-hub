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
import { knowledgeRoutes } from "../routes";
import type { CategoryFormValues, CategoryRecord } from "../types";
import { CategoryFormFields } from "./fields";

const toServerValues = (values: CategoryFormValues) => {
  const { parent_id, ...rest } = values;
  return { ...rest, parent: parent_id } as unknown as CategoryFormValues;
};

export const CategoryCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New category"
        description="Group articles under a topic. Nest it under a parent to build a tree."
        closeTo={knowledgeRoutes.categories}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <CategoryCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function CategoryCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<CategoryRecord, HttpError, CategoryFormValues>({
    refineCoreProps: {
      resource: "hub_kb_categories",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: { name: "", description: "", parent_id: null },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <CategoryFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add category"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit category"
        description="Rename this category or move it under a different parent."
        closeTo={knowledgeRoutes.categories}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <CategoryEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function CategoryEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<CategoryRecord, HttpError, CategoryFormValues>({
    refineCoreProps: {
      resource: "hub_kb_categories",
      action: "edit",
      id,
      redirect: false,
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
          <CategoryFormFields form={form} />
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
