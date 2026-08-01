import { useShow, useTranslate, useUpdate } from "@refinedev/core";
import { ArrowLeft, Calendar, Eye, Pencil, User } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, Outlet, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import type { ArticleRecord } from "../types";

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
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="edit" />}
          >
            <Pencil />
            {translate("knowledge.reader.edit", { ns: "starter" }, "Edit")}
          </Button>
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
        </article>
      )}

      {nested ? <Outlet /> : null}
    </div>
  );
}

// Re-export for the edit-from-show route wiring.
export { getArticleShowPath };
