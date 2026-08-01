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
import { getArticleShowPath, knowledgeRoutes } from "../routes";
import type { ArticleFormValues, ArticleRecord } from "../types";
import { ArticleFormFields } from "./fields";

const toServerValues = (values: ArticleFormValues) => {
  const { category_id, author_id, ...rest } = values;
  return {
    ...rest,
    category: category_id,
    author: author_id,
  } as unknown as ArticleFormValues;
};

export const ArticleCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New article"
        description="Draft a knowledge base article."
        closeTo={knowledgeRoutes.articles}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ArticleCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ArticleCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ArticleRecord, HttpError, ArticleFormValues>({
    refineCoreProps: {
      resource: "hub_kb_articles",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      title: "",
      summary: "",
      body: "",
      status: "draft",
      category_id: null,
      author_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ArticleFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Publishing..." : "Save article"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const ArticleEdit = ({
  returnTo = "list",
}: {
  returnTo?: "list" | "show";
}) => {
  const { id } = useParams<{ id: string }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  const closeTo =
    returnTo === "show" && id ? getArticleShowPath(id) : knowledgeRoutes.articles;
  return (
    <>
      <RouteDrawer
        title="Edit article"
        description="Update this article's content or status."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ArticleEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ArticleEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ArticleRecord, HttpError, ArticleFormValues>({
    refineCoreProps: {
      resource: "hub_kb_articles",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["category", "author"] },
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
          <ArticleFormFields form={form} />
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
