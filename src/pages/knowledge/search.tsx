import { useList, useTranslate } from "@refinedev/core";
import { Eye, FileText, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ARTICLE_STATUSES, formatDate, formatNumber, labelFor } from "./constants";
import { getArticleShowPath } from "./routes";
import { StatusPill, useLocale } from "./shared";
import type { ArticleRecord } from "./types";

/** Client-side, case-insensitive "contains" match across title/summary/body. */
function matches(article: ArticleRecord, term: string): boolean {
  const needle = term.toLowerCase();
  return (
    (article.title ?? "").toLowerCase().includes(needle) ||
    (article.summary ?? "").toLowerCase().includes(needle) ||
    (article.body ?? "").toLowerCase().includes(needle)
  );
}

export function KnowledgeSearch() {
  const translate = useTranslate();
  const locale = useLocale();
  const [search, setSearch] = useState("");

  // Fetch the full corpus once; filtering happens client-side so the search
  // box can match title, summary, and body in a single pass.
  const { result, query } = useList<ArticleRecord>({
    resource: "hub_kb_articles",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    sorters: [{ field: "updatedAt", order: "desc" }],
    meta: { appends: ["category"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const articles = result.data ?? [];
  const term = search.trim();

  const matched = useMemo(() => {
    if (!term) return [];
    return articles.filter((article) => matches(article, term));
  }, [articles, term]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            {translate("knowledge.search.title", { ns: "starter" }, "Search")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {translate(
              "knowledge.search.subtitle",
              { ns: "starter" },
              "Search across every article's title, summary, and body."
            )}
          </p>
        </div>
      </div>

      <Card className="p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={translate(
              "knowledge.search.placeholder",
              { ns: "starter" },
              "Search articles by title, summary, or body..."
            )}
            className="h-11 pl-9 text-base"
          />
        </div>
      </Card>

      {!term ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <SearchIcon className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            {translate("knowledge.search.empty.prompt.title", { ns: "starter" }, "Start typing to search")}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {translate(
              "knowledge.search.empty.prompt.description",
              { ns: "starter" },
              "Search matches article titles, summaries, and body text."
            )}
          </p>
        </Card>
      ) : query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : matched.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <FileText className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            {translate("knowledge.search.empty.noResults.title", { ns: "starter" }, "No matches found")}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {translate(
              "knowledge.search.empty.noResults.description",
              { ns: "starter" },
              "Try a shorter or different search term."
            )}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {translate(
              "knowledge.search.resultsCount",
              { ns: "starter", count: matched.length },
              `${matched.length} result${matched.length === 1 ? "" : "s"}`
            )}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matched.map((article) => (
              <ResultCard key={String(article.id)} article={article} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
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
  const untitled = translate("knowledge.common.untitled", { ns: "starter" }, "Untitled");

  return (
    <Link to={getArticleShowPath(article.id)} className="min-w-0">
      <Card className="group flex h-full flex-col gap-2 p-4 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex w-fit items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
            {article.category?.name ?? uncategorized}
          </span>
          <StatusPill
            value={article.status ?? "draft"}
            label={labelFor(ARTICLE_STATUSES, article.status ?? "draft", translate)}
          />
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
          {article.title || untitled}
        </h3>
        {article.summary ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <span>{formatDate(article.updatedAt, locale)}</span>
          <span className="flex shrink-0 items-center gap-1 tabular-nums">
            <Eye className="size-3.5" />
            {formatNumber(article.views, locale)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
