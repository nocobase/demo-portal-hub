import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRouteSurfaceClose } from "@nocobase/portal-sdk/routing";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
} from "@/extensions/nocobase-route-surfaces";
import { cn } from "@/lib/utils";
import { getArticleShowPath, knowledgeRoutes } from "../routes";
import type { FeedbackFormValues, FeedbackRecord } from "../types";

/** Nested (2nd-level) drawer: leave feedback on an article, reached from the reader. */
export const ArticleFeedback = () => {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title={translate("knowledge.feedback.drawer.title", { ns: "starter" }, "Leave feedback")}
        description={translate(
          "knowledge.feedback.drawer.description",
          { ns: "starter" },
          "Tell the author whether this article was helpful."
        )}
        closeTo={id ? getArticleShowPath(id) : knowledgeRoutes.articles}
        closeLabel={translate("knowledge.common.close", { ns: "starter" }, "Close")}
        beforeClose={beforeClose}
      >
        <ArticleFeedbackForm articleId={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

const toServerValues = (values: FeedbackFormValues, articleId?: string) =>
  ({
    ...values,
    article: articleId ? Number(articleId) : null,
  }) as unknown as FeedbackFormValues;

function ArticleFeedbackForm({ articleId }: { articleId?: string }) {
  const translate = useTranslate();
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<FeedbackRecord, HttpError, FeedbackFormValues>({
    refineCoreProps: {
      resource: "hub_kb_article_feedback",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      rating: "helpful",
      comment: "",
    },
  });

  const rating = form.watch("rating");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values, articleId)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <FormField
            control={form.control}
            name="rating"
            render={() => (
              <FormItem>
                <FormLabel>
                  {translate("knowledge.feedback.fields.rating", { ns: "starter" }, "Was this article helpful?")}
                </FormLabel>
                <FormControl
                  render={
                    <div className="flex gap-2">
                      {(["helpful", "not_helpful"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => form.setValue("rating", value, { shouldDirty: true })}
                          className={cn(
                            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                            rating === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/70 text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {value === "helpful"
                            ? translate("knowledge.feedback.rating.helpful", { ns: "starter" }, "Helpful")
                            : translate("knowledge.feedback.rating.notHelpful", { ns: "starter" }, "Not helpful")}
                        </button>
                      ))}
                    </div>
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {translate("knowledge.feedback.fields.comment", { ns: "starter" }, "Comment (optional)")}
                </FormLabel>
                <FormControl
                  render={
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={4}
                      placeholder={translate(
                        "knowledge.feedback.fields.comment.placeholder",
                        { ns: "starter" },
                        "What worked, or what's missing?"
                      )}
                    />
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            {translate("knowledge.common.cancel", { ns: "starter" }, "Cancel")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? translate("knowledge.common.saving", { ns: "starter" }, "Saving...")
              : translate("knowledge.feedback.submit", { ns: "starter" }, "Submit feedback")}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
