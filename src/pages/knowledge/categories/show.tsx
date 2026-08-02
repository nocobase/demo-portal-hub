import { useList, useShow, useTranslate } from "@refinedev/core";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { ARTICLE_STATUSES, formatDate, formatNumber, labelFor } from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  SimpleTable,
  StatusPill,
  useLocale,
} from "../shared";
import type { ArticleRecord, CategoryRecord } from "../types";

export function CategoryShow({ idParam = "id" }: { idParam?: string }) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams<Record<string, string>>();
  const id = params[idParam];
  const nested = useOutlet();

  const { result: record, query } = useShow<CategoryRecord>({
    resource: "hub_kb_categories",
    id,
    meta: { appends: ["parent"] },
  });

  const displayName =
    record?.name ||
    translate("knowledge.common.untitled", { ns: "starter" }, "Untitled");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? <Skeleton className="h-6 w-40" /> : displayName
      }
      description={translate(
        "knowledge.categories.drawer.show.description",
        { ns: "starter" },
        "Category details and the articles filed under it."
      )}
      closeLabel={translate("knowledge.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_kb_categories"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            onClick={() => openChild("edit")}
          >
            <Pencil />
          </EditButton>
        ) : null
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {translate(
                "knowledge.categories.show.error.title",
                { ns: "starter" },
                "Unable to load category"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "knowledge.categories.show.error.description",
                { ns: "starter" },
                "The category may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("knowledge.categories.show.overview", { ns: "starter" }, "Overview")}
              items={[
                [
                  translate("knowledge.categories.fields.parent", { ns: "starter" }, "Parent category"),
                  record?.parent?.name ??
                    translate("knowledge.categories.show.noParent", { ns: "starter" }, "Top level"),
                ],
                [
                  translate("knowledge.categories.fields.description", { ns: "starter" }, "Description"),
                  record?.description || "—",
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <CategoryArticlesSection
                  categoryId={id}
                  locale={locale}
                  openChild={openChild}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function CategoryArticlesSection({
  categoryId,
  locale,
  openChild,
}: {
  categoryId: string;
  locale: string;
  openChild: (to: string) => void;
}) {
  const translate = useTranslate();
  const { result, query } = useList<ArticleRecord>({
    resource: "hub_kb_articles",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "updatedAt", order: "desc" }],
    filters: [{ field: "category_id", operator: "eq", value: categoryId }],
    meta: { appends: ["author"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const articles = result.data ?? [];

  return (
    <DrawerSection
      title={translate(
        "knowledge.categories.show.articles",
        { ns: "starter", count: articles.length },
        `Articles (${articles.length})`
      )}
      action={
        <Button variant="outline" size="sm" onClick={() => openChild("articles/create")}>
          <Plus />
          {translate("knowledge.categories.show.addArticle", { ns: "starter" }, "Add article")}
        </Button>
      }
    >
      <SimpleTable
        headers={[
          translate("knowledge.categories.show.columns.title", { ns: "starter" }, "Title"),
          translate("knowledge.categories.show.columns.status", { ns: "starter" }, "Status"),
          translate("knowledge.categories.show.columns.views", { ns: "starter" }, "Views"),
          translate("knowledge.categories.show.columns.updated", { ns: "starter" }, "Updated"),
          translate("knowledge.categories.show.columns.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {query.isLoading ? (
          <EmptyRow
            colSpan={5}
            text={translate("knowledge.common.saving", { ns: "starter" }, "Loading...")}
          />
        ) : articles.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text={translate(
              "knowledge.categories.show.articles.empty",
              { ns: "starter" },
              "No articles in this category yet."
            )}
          />
        ) : (
          articles.map((article) => (
            <tr key={String(article.id)}>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    openChild(`articles/show/${encodeURIComponent(String(article.id))}`)
                  }
                  className="text-left font-medium hover:text-primary hover:underline"
                >
                  {article.title ||
                    translate("knowledge.common.untitled", { ns: "starter" }, "Untitled")}
                </button>
              </td>
              <td className="px-3 py-2">
                <StatusPill
                  value={article.status ?? "draft"}
                  label={labelFor(ARTICLE_STATUSES, article.status ?? "draft", translate)}
                />
              </td>
              <td className="px-3 py-2 tabular-nums">
                {formatNumber(article.views, locale)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {formatDate(article.updatedAt, locale)}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      openChild(`articles/show/${encodeURIComponent(String(article.id))}`)
                    }
                  >
                    <Eye />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      openChild(`articles/edit/${encodeURIComponent(String(article.id))}`)
                    }
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    resource="hub_kb_articles"
                    recordItemId={article.id}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
