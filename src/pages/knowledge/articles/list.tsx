import { useList, useTranslate } from "@refinedev/core";
import { Eye, FileText, Pencil, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CategoryTreeFilter,
  descendantIdsOf,
  useCategoryTree,
} from "../category-tree";
import { ARTICLE_STATUSES, formatDate, formatNumber, labelFor } from "../constants";
import {
  getArticleEditPath,
  getArticleShowPath,
  knowledgeRoutes,
} from "../routes";
import { StatusPill, useLocale } from "../shared";
import type { ArticleRecord } from "../types";

export function ArticlesLayout() {
  return (
    <>
      <CanAccess
        resource="hub_kb_articles"
        action="list"
        fallback={<AccessDenied />}
      >
        <ArticlesBrowser />
      </CanAccess>
      <Outlet />
    </>
  );
}

type StatusFilter = "all" | "published" | "draft";

function ArticlesBrowser() {
  const translate = useTranslate();
  const locale = useLocale();
  const { tree, total, isLoading: treeLoading } = useCategoryTree();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const categoryIds = useMemo(
    () => (categoryId ? descendantIdsOf(tree, categoryId) : null),
    [tree, categoryId]
  );

  const filters = useMemo(() => {
    const out: Array<{ field: string; operator: any; value: any }> = [];
    if (categoryIds) {
      out.push({ field: "category_id", operator: "in", value: categoryIds });
    }
    if (status !== "all") {
      out.push({ field: "status", operator: "eq", value: status });
    }
    const term = search.trim();
    if (term) {
      out.push({ field: "title", operator: "contains", value: term });
    }
    return out;
  }, [categoryIds, status, search]);

  const { result, query } = useList<ArticleRecord>({
    resource: "hub_kb_articles",
    pagination: { mode: "server", currentPage: 1, pageSize: 60 },
    sorters: [{ field: "updatedAt", order: "desc" }],
    filters,
    meta: { appends: ["category", "author"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const articles = result.data ?? [];

  const statusLabels: Record<StatusFilter, string> = {
    all: translate("knowledge.articles.filter.all", { ns: "starter" }, "All"),
    published: translate("knowledge.articles.filter.published", { ns: "starter" }, "Published"),
    draft: translate("knowledge.articles.filter.draft", { ns: "starter" }, "Draft"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">
              {translate("knowledge.articles.title", { ns: "starter" }, "Articles")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "knowledge.articles.subtitle",
                { ns: "starter" },
                "Browse the knowledge base by category, or search across every article."
              )}
            </p>
          </div>
          <Button nativeButton={false} render={<Link to={knowledgeRoutes.articlesCreate} />}>
            <Plus />
            {translate("knowledge.articles.new", { ns: "starter" }, "New article")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="p-3">
            <p className="px-2.5 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {translate("knowledge.tree.title", { ns: "starter" }, "Categories")}
            </p>
            <CategoryTreeFilter
              tree={tree}
              total={total}
              isLoading={treeLoading}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </Card>
        </aside>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder={translate("knowledge.articles.search", { ns: "starter" }, "Search articles...")}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border/70 p-0.5">
              {(["all", "published", "draft"] as StatusFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                    status === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {statusLabels[value]}
                </button>
              ))}
            </div>
          </div>

          {query.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FileText className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {translate("knowledge.articles.empty.title", { ns: "starter" }, "No articles found")}
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {translate(
                  "knowledge.articles.empty.description",
                  { ns: "starter" },
                  "Try a different category or search term, or write a new article."
                )}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={String(article.id)} article={article} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  locale,
}: {
  article: ArticleRecord;
  locale: string;
}) {
  const translate = useTranslate();
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
  const unknown = translate("knowledge.common.unknown", { ns: "starter" }, "Unknown");

  return (
    <Card className="group relative flex flex-col gap-3 p-5 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex w-fit items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
          {article.category?.name ?? uncategorized}
        </span>
        <StatusPill
          value={article.status ?? "draft"}
          label={labelFor(ARTICLE_STATUSES, article.status ?? "draft", translate)}
        />
      </div>

      <Link to={getArticleShowPath(article.id)} className="min-w-0">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
          {article.title || untitled}
        </h3>
        {article.summary ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {article.summary}
          </p>
        ) : null}
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
        <span className="truncate">
          {article.author?.nickname ?? unknown} · {formatDate(article.updatedAt, locale)}
        </span>
        <span className="flex shrink-0 items-center gap-1 tabular-nums">
          <Eye className="size-3.5" />
          {formatNumber(article.views, locale)}
        </span>
      </div>

      <div className="flex items-center gap-1 border-t border-border/60 pt-3">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to={getArticleShowPath(article.id)} />}
        >
          <Eye />
          {translate("knowledge.articles.card.read", { ns: "starter" }, "Read")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to={getArticleEditPath(article.id)} />}
        >
          <Pencil />
          {translate("knowledge.articles.card.edit", { ns: "starter" }, "Edit")}
        </Button>
      </div>
    </Card>
  );
}
