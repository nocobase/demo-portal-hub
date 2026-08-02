import { type HttpError, useShow, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { formatDate } from "../constants";
import { getArticleShowPath, knowledgeRoutes } from "../routes";
import { useContextualCloseTo } from "../route-surfaces";
import { DetailItems, useLocale } from "../shared";
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

/**
 * Nested (deeper) read-only drawer: view a single feedback entry, reached by
 * clicking a row in the reader's feedback panel.
 * Route: /articles/show/:id/feedback/view/:feedbackId
 */
export const FeedbackShow = ({ idParam = "feedbackId" }: { idParam?: string }) => {
  const translate = useTranslate();
  const locale = useLocale();
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const closeTo = useContextualCloseTo();
  const { result: record, query } = useShow<FeedbackRecord>({
    resource: "hub_kb_article_feedback",
    id: recordId,
    meta: { appends: ["author"] },
    queryOptions: { enabled: Boolean(recordId), retry: false },
  });

  const isHelpful = record?.rating === "helpful";
  const ratingLabel = isHelpful
    ? translate("knowledge.feedback.rating.helpful", { ns: "starter" }, "Helpful")
    : translate("knowledge.feedback.rating.notHelpful", { ns: "starter" }, "Not helpful");

  return (
    <RouteDrawer
      title={translate("knowledge.feedback.show.title", { ns: "starter" }, "Feedback")}
      description={translate(
        "knowledge.feedback.show.description",
        { ns: "starter" },
        "A reader's response to this article."
      )}
      closeTo={closeTo}
      closeLabel={translate("knowledge.common.close", { ns: "starter" }, "Close")}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-48" />
        ) : query.isError || !record ? (
          <Alert variant="destructive">
            <AlertTitle>
              {translate("knowledge.feedback.show.error.title", { ns: "starter" }, "Unable to load feedback")}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "knowledge.feedback.show.error.description",
                { ns: "starter" },
                "This feedback may no longer exist."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("knowledge.feedback.show.overview", { ns: "starter" }, "Overview")}
              items={[
                [
                  translate("knowledge.feedback.show.rating", { ns: "starter" }, "Rating"),
                  <span
                    key="rating"
                    className={cn(
                      "inline-flex w-fit items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
                      isHelpful
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isHelpful ? (
                      <ThumbsUp className="size-3.5" />
                    ) : (
                      <ThumbsDown className="size-3.5" />
                    )}
                    {ratingLabel}
                  </span>,
                ],
                [
                  translate("knowledge.feedback.show.author", { ns: "starter" }, "Reader"),
                  record.author?.nickname ??
                    translate("knowledge.reader.author.unknown", { ns: "starter" }, "Unknown author"),
                ],
                [
                  translate("knowledge.feedback.show.submitted", { ns: "starter" }, "Submitted"),
                  formatDate(record.createdAt, locale),
                ],
              ]}
            />
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium">
                {translate("knowledge.feedback.show.comment", { ns: "starter" }, "Comment")}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">
                {record.comment
                  ? record.comment
                  : translate("knowledge.feedback.show.noComment", { ns: "starter" }, "No comment left.")}
              </p>
            </div>
          </div>
        )}
      </div>
    </RouteDrawer>
  );
};
