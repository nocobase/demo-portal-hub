import { useList, useShow, useTranslate, useUpdate } from "@refinedev/core";
import {
  ArrowLeft,
  Calendar,
  Eye,
  MessageSquareText,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, Outlet, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ARTICLE_STATUSES,
  formatDate,
  formatNumber,
  labelFor,
  toParagraphs,
} from "../constants";
import { getArticleShowPath, knowledgeRoutes } from "../routes";
import { StatusPill, useLocale } from "../shared";
import type { ArticleRecord, FeedbackRecord } from "../types";

export function ArticleShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<ArticleRecord>({
    resource: "hub_kb_articles",
    id,
    meta: { appends: ["category", "author"] },
  });

  // Count a view once per mount.
  const { mutate: update } = useUpdate();
  const counted = useRef(false);
  useEffect(() => {
    if (record && id && !counted.current) {
      counted.current = true;
      update({
        resource: "hub_kb_articles",
        id,
        values: { views: Number(record.views ?? 0) + 1 },
        successNotification: false,
        errorNotification: false,
        mutationMode: "optimistic",
      });
    }
  }, [record, id, update]);

  const paragraphs = useMemo(() => toParagraphs(record?.body), [record?.body]);

  const feedback = useList<FeedbackRecord>({
    resource: "hub_kb_article_feedback",
    pagination: { mode: "server", currentPage: 1, pageSize: 20 },
    sorters: [{ field: "createdAt", order: "desc" }],
    filters: id ? [{ field: "article_id", operator: "eq", value: id }] : [],
    meta: { appends: ["author"] },
    errorNotification: false,
    queryOptions: { enabled: Boolean(id), retry: false },
  });
  const feedbackRows = feedback.result.data ?? [];
  const helpfulCount = feedbackRows.filter((row) => row.rating === "helpful").length;
  const notHelpfulCount = feedbackRows.filter((row) => row.rating === "not_helpful").length;

  const related = useList<ArticleRecord>({
    resource: "hub_kb_articles",
    pagination: { mode: "server", currentPage: 1, pageSize: 4 },
    sorters: [{ field: "views", order: "desc" }],
    filters: record?.category_id
      ? [
          { field: "category_id", operator: "eq", value: record.category_id },
          { field: "id", operator: "ne", value: record.id },
        ]
      : [],
    meta: { appends: ["category"] },
    errorNotification: false,
    queryOptions: { enabled: Boolean(record?.category_id), retry: false },
  });
  const relatedRows = related.result.data ?? [];

  const uncategorized = translate(
    "knowledge.common.uncategorized",
    { ns: "starter" },
    "Uncategorized"
  );
  const untitled = translate(
    "knowledge.common.untitled",
    { ns: "starter" },
    "Untitled"
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to={knowledgeRoutes.articles} />}
        >
          <ArrowLeft />
          {translate("knowledge.reader.back", { ns: "starter" }, "Back to articles")}
        </Button>
        {record ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="feedback" />}
            >
              <MessageSquareText />
              {translate("knowledge.reader.giveFeedback", { ns: "starter" }, "Give feedback")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="edit" />}
            >
              <Pencil />
              {translate("knowledge.reader.edit", { ns: "starter" }, "Edit")}
            </Button>
          </div>
        ) : null}
      </div>

      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError || !record ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate("knowledge.reader.error.title", { ns: "starter" }, "Unable to load article")}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "knowledge.reader.error.description",
              { ns: "starter" },
              "The article may no longer exist, or you may not have permission to view it."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <article className="flex flex-col gap-5">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                {record.category?.name ?? uncategorized}
              </span>
              <StatusPill
                value={record.status ?? "draft"}
                label={labelFor(ARTICLE_STATUSES, record.status ?? "draft", translate)}
              />
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em]">
              {record.title || untitled}
            </h1>
            {record.summary ? (
              <p className="text-lg leading-7 text-muted-foreground">
                {record.summary}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {record.author?.nickname ??
                  translate("knowledge.reader.author.unknown", { ns: "starter" }, "Unknown author")}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {translate("knowledge.reader.updatedPrefix", { ns: "starter" }, "Updated")}{" "}
                {formatDate(record.updatedAt, locale)}
              </span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Eye className="size-4" />
                {formatNumber(record.views, locale)}{" "}
                {translate("knowledge.reader.views", { ns: "starter" }, "views")}
              </span>
            </div>
          </header>

          <Separator />

          <div className="flex flex-col gap-4 text-[15px] leading-7 text-foreground/90">
            {paragraphs.length === 0 ? (
              <p className="text-muted-foreground">
                {translate("knowledge.reader.empty", { ns: "starter" }, "This article has no content yet.")}
              </p>
            ) : (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))
            )}
          </div>

          <Separator />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base">
                {translate("knowledge.feedback.panel.title", { ns: "starter" }, "Feedback")}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 tabular-nums">
                  <ThumbsUp className="size-3.5 text-blue-600 dark:text-blue-300" />
                  {formatNumber(helpfulCount, locale)}
                </span>
                <span className="flex items-center gap-1.5 tabular-nums">
                  <ThumbsDown className="size-3.5" />
                  {formatNumber(notHelpfulCount, locale)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {feedback.query.isLoading ? (
                <LoadingState className="min-h-24" />
              ) : feedbackRows.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {translate("knowledge.feedback.panel.empty", { ns: "starter" }, "No feedback yet. Be the first to weigh in.")}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {feedbackRows.map((row) => (
                    <li key={String(row.id)} className="flex gap-3 border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                      <span
                        className={
                          row.rating === "helpful"
                            ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300"
                            : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        }
                      >
                        {row.rating === "helpful" ? (
                          <ThumbsUp className="size-3.5" />
                        ) : (
                          <ThumbsDown className="size-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {row.author?.nickname ??
                            translate("knowledge.reader.author.unknown", { ns: "starter" }, "Unknown author")}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {formatDate(row.createdAt, locale)}
                          </span>
                        </p>
                        {row.comment ? (
                          <p className="mt-0.5 text-sm text-muted-foreground">{row.comment}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {relatedRows.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {translate("knowledge.reader.related.title", { ns: "starter" }, "Related articles")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {relatedRows.map((item) => (
                  <Link
                    key={String(item.id)}
                    to={getArticleShowPath(item.id)}
                    className="flex flex-col gap-1 rounded-lg border border-border/60 p-3 transition-colors hover:bg-accent"
                  >
                    <span className="line-clamp-1 text-sm font-medium">
                      {item.title || untitled}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="size-3.5" />
                      {formatNumber(item.views, locale)}{" "}
                      {translate("knowledge.reader.views", { ns: "starter" }, "views")}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </article>
      )}

      {nested ? <Outlet /> : null}
    </div>
  );
}

// Re-export for the edit-from-show route wiring.
export { getArticleShowPath };
