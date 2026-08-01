import { BookOpen, FolderTree, LibraryBig } from "lucide-react";
import { Route } from "react-router";
import type { AppExtension } from "@/app/extension";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { ArticlesLayout } from "./articles/list";
import { ArticleCreate, ArticleEdit } from "./articles/form";
import { ArticleShow } from "./articles/show";
import { CategoriesLayout } from "./categories/list";
import { CategoryCreate, CategoryEdit } from "./categories/form";
import { KnowledgeOverview } from "./dashboard";
import { knowledgeRoutes } from "./routes";

const knowledgeExtension: AppExtension = {
  id: "knowledge",
  priority: 0,
  resources: [
    {
      name: "hub_kb_articles",
      list: knowledgeRoutes.articles,
      create: knowledgeRoutes.articlesCreate,
      edit: knowledgeRoutes.articlesEdit,
      show: knowledgeRoutes.articlesShow,
      meta: {
        label: "Articles",
        singularLabel: "Article",
        priority: 10,
        icon: <BookOpen />,
        description: "Browse and search the knowledge base by category.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_kb_categories",
      list: knowledgeRoutes.categories,
      create: knowledgeRoutes.categoriesCreate,
      edit: knowledgeRoutes.categoriesEdit,
      meta: {
        label: "Categories",
        singularLabel: "Category",
        priority: 20,
        icon: <FolderTree />,
        description: "The topic tree that organizes every article.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "knowledge_overview",
      list: knowledgeRoutes.overview,
      meta: {
        label: "KB Overview",
        priority: 30,
        icon: <LibraryBig />,
        acl: false,
      },
    },
  ],
  routes: (
    <>
      <Route path="/kb-overview" element={<KnowledgeOverview />} />

      <Route path="/articles" element={<ArticlesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_kb_articles"
              action="create"
              fallback={<AccessDenied />}
            >
              <ArticleCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_kb_articles"
              action="edit"
              fallback={<AccessDenied />}
            >
              <ArticleEdit />
            </CanAccess>
          }
        />
      </Route>

      <Route
        path="/articles/show/:id"
        element={
          <CanAccess
            resource="hub_kb_articles"
            action="show"
            fallback={<AccessDenied />}
          >
            <ArticleShow />
          </CanAccess>
        }
      >
        <Route
          path="edit"
          element={
            <CanAccess
              resource="hub_kb_articles"
              action="edit"
              fallback={<AccessDenied />}
            >
              <ArticleEdit returnTo="show" />
            </CanAccess>
          }
        />
      </Route>

      <Route path="/categories" element={<CategoriesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_kb_categories"
              action="create"
              fallback={<AccessDenied />}
            >
              <CategoryCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_kb_categories"
              action="edit"
              fallback={<AccessDenied />}
            >
              <CategoryEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default knowledgeExtension;
