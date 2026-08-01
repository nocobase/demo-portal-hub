import { BookOpen, FolderTree, LibraryBig } from "lucide-react";
import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { ArticleCreate, ArticleEdit } from "@/pages/knowledge/articles/form";
import { ArticlesLayout } from "@/pages/knowledge/articles/list";
import { ArticleShow } from "@/pages/knowledge/articles/show";
import { CategoryCreate, CategoryEdit } from "@/pages/knowledge/categories/form";
import { CategoriesLayout } from "@/pages/knowledge/categories/list";
import { KnowledgeOverview } from "@/pages/knowledge/dashboard";
import { knowledgeRoutes } from "@/pages/knowledge/routes";

const denied = <AccessDenied />;

const routes: AppRouteDefinition[] = defineAppRoutes([
  {
    name: "knowledge_overview",
    path: knowledgeRoutes.overview,
    element: <KnowledgeOverview />,
    resource: {
      meta: {
        label: "KB Overview",
        i18nKey: "knowledge.resources.overview",
        i18nOptions: { ns: "starter" },
        priority: 30,
        icon: <LibraryBig />,
        acl: false,
      },
    },
  },
  {
    name: "hub_kb_articles",
    path: knowledgeRoutes.articles,
    element: <ArticlesLayout />,
    resource: {
      meta: {
        label: "Articles",
        singularLabel: "Article",
        i18nKey: "knowledge.resources.articles",
        i18nSingularKey: "knowledge.resources.article",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "knowledge.resources.articles.description",
        priority: 10,
        icon: <BookOpen />,
        description: "Browse and search the knowledge base by category.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_kb_articles.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_kb_articles" action="create" fallback={denied}>
            <ArticleCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_kb_articles.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_kb_articles" action="edit" fallback={denied}>
            <ArticleEdit />
          </CanAccess>
        ),
      },
    ],
  },
  {
    // Reader (show) page — a standalone route, not a nav item.
    name: "hub_kb_articles.show",
    path: knowledgeRoutes.articlesShow,
    element: (
      <CanAccess resource="hub_kb_articles" action="show" fallback={denied}>
        <ArticleShow />
      </CanAccess>
    ),
    children: [
      {
        name: "hub_kb_articles.show.edit",
        path: "edit",
        element: (
          <CanAccess resource="hub_kb_articles" action="edit" fallback={denied}>
            <ArticleEdit returnTo="show" />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_kb_categories",
    path: knowledgeRoutes.categories,
    element: <CategoriesLayout />,
    resource: {
      meta: {
        label: "Categories",
        singularLabel: "Category",
        i18nKey: "knowledge.resources.categories",
        i18nSingularKey: "knowledge.resources.category",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "knowledge.resources.categories.description",
        priority: 20,
        icon: <FolderTree />,
        description: "The topic tree that organizes every article.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_kb_categories.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_kb_categories" action="create" fallback={denied}>
            <CategoryCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_kb_categories.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_kb_categories" action="edit" fallback={denied}>
            <CategoryEdit />
          </CanAccess>
        ),
      },
    ],
  },
]);

export const knowledgeModule = { routes };
