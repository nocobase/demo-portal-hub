import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouteSurfaceClose } from "@nocobase/portal-sdk/routing";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
} from "@/extensions/nocobase-route-surfaces";
import { useContextualCloseTo } from "../route-surfaces";
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

type ArticleSurfaceProps = { presetCategoryId?: string };

export const ArticleCreate = ({ presetCategoryId }: ArticleSurfaceProps) => {
  const translate = useTranslate();
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title={translate("knowledge.articles.drawer.create.title", { ns: "starter" }, "New article")}
        description={translate(
          "knowledge.articles.drawer.create.description",
          { ns: "starter" },
          "Draft a knowledge base article."
        )}
        closeTo={closeTo}
        closeLabel={translate("knowledge.common.close", { ns: "starter" }, "Close")}
        beforeClose={beforeClose}
      >
        <ArticleCreateForm presetCategoryId={presetCategoryId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ArticleCreateForm({ presetCategoryId }: ArticleSurfaceProps) {
  const translate = useTranslate();
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
      category_id: presetCategoryId ? String(presetCategoryId) : null,
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
          <ArticleFormFields form={form} presetCategoryId={presetCategoryId} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            {translate("knowledge.common.cancel", { ns: "starter" }, "Cancel")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? translate("knowledge.articles.form.publishing", { ns: "starter" }, "Publishing...")
              : translate("knowledge.articles.form.save", { ns: "starter" }, "Save article")}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const ArticleEdit = ({
  presetCategoryId,
  idParam = "id",
}: ArticleSurfaceProps & { idParam?: string }) => {
  const translate = useTranslate();
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title={translate("knowledge.articles.drawer.edit.title", { ns: "starter" }, "Edit article")}
        description={translate(
          "knowledge.articles.drawer.edit.description",
          { ns: "starter" },
          "Update this article's content or status."
        )}
        closeTo={closeTo}
        closeLabel={translate("knowledge.common.close", { ns: "starter" }, "Close")}
        beforeClose={beforeClose}
      >
        <ArticleEditForm id={recordId} presetCategoryId={presetCategoryId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ArticleEditForm({
  id,
  presetCategoryId,
}: ArticleSurfaceProps & { id?: string }) {
  const translate = useTranslate();
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
          <ArticleFormFields form={form} presetCategoryId={presetCategoryId} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            {translate("knowledge.common.cancel", { ns: "starter" }, "Cancel")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? translate("knowledge.common.saving", { ns: "starter" }, "Saving...")
              : translate("knowledge.common.save", { ns: "starter" }, "Save changes")}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
