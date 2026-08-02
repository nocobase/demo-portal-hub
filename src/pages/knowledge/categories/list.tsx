import { useTranslate } from "@refinedev/core";
import { Eye, Folder, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCategoryTree } from "../category-tree";
import {
  getCategoryEditPath,
  getCategoryShowPath,
  knowledgeRoutes,
} from "../routes";
import type { CategoryNode } from "../types";

export function CategoriesLayout() {
  return (
    <>
      <CanAccess
        resource="hub_kb_categories"
        action="list"
        fallback={<AccessDenied />}
      >
        <CategoriesTree />
      </CanAccess>
      <Outlet />
    </>
  );
}

function CategoriesTree() {
  const translate = useTranslate();
  const { tree, total, isLoading } = useCategoryTree();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">
              {translate("knowledge.categories.title", { ns: "starter" }, "Categories")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "knowledge.categories.subtitle",
                { ns: "starter", count: total },
                `The topic tree that organizes ${total} articles. Nest categories to build up to two levels.`
              )}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link to={knowledgeRoutes.categoriesCreate} />}
          >
            <Plus />
            {translate("knowledge.categories.new", { ns: "starter" }, "New category")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Folder className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            {translate("knowledge.categories.empty.title", { ns: "starter" }, "No categories yet")}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {translate(
              "knowledge.categories.empty.description",
              { ns: "starter" },
              "Create your first category to start organizing articles."
            )}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {tree.map((node) => (
            <TopCategoryCard key={String(node.id)} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopCategoryCard({ node }: { node: CategoryNode }) {
  const translate = useTranslate();
  const untitled = translate("knowledge.common.untitled", { ns: "starter" }, "Untitled");
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300">
            <FolderOpen className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight">
              {node.name || untitled}
            </h3>
            {node.description ? (
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                {node.description}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {translate(
                "knowledge.categories.card.articles",
                { ns: "starter", count: node.articleCount },
                `${node.articleCount} articles`
              )}{" "}
              ·{" "}
              {translate(
                "knowledge.categories.card.subcategories",
                { ns: "starter", count: node.children.length },
                `${node.children.length} sub-categories`
              )}
            </p>
          </div>
        </div>
        <CategoryRowActions id={node.id} />
      </div>

      {node.children.length > 0 ? (
        <div className="divide-y divide-border/60 border-t border-border/60">
          {node.children.map((child) => (
            <div
              key={String(child.id)}
              className={cn(
                "flex items-center justify-between gap-3 px-5 py-3 pl-14",
                "hover:bg-accent/40"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Folder className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">
                  {child.name || untitled}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {translate(
                    "knowledge.categories.card.articles",
                    { ns: "starter", count: child.articleCount },
                    `${child.articleCount} articles`
                  )}
                </span>
              </div>
              <CategoryRowActions id={child.id} />
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function CategoryRowActions({ id }: { id: string | number }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={<Link to={getCategoryShowPath(id)} />}
      >
        <Eye />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={<Link to={getCategoryEditPath(id)} />}
      >
        <Pencil />
      </Button>
      <DeleteButton
        resource="hub_kb_categories"
        recordItemId={id}
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
      </DeleteButton>
    </div>
  );
}
