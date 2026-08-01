import { CreditCard, PieChart, Receipt } from "lucide-react";

import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { FinanceDashboard } from "@/pages/finance/dashboard";
import { ExpenseCreate, ExpenseEdit } from "@/pages/finance/expenses/form";
import { ExpenseListPage } from "@/pages/finance/expenses/list";
import { InvoiceCreate, InvoiceEdit } from "@/pages/finance/invoices/form";
import { InvoiceListPage } from "@/pages/finance/invoices/list";
import { financeRoutes } from "@/pages/finance/routes";

const denied = <AccessDenied />;

// Finance module — accounts receivable (invoices) + employee expense claims,
// plus a spend/AR dashboard. Nav group priority ≥10. The primary list is
// mounted at /invoices (the Home quick-link target).
const routes: AppRouteDefinition[] = defineAppRoutes([
  {
    name: "finance-dashboard",
    path: financeRoutes.dashboard,
    element: <FinanceDashboard />,
    resource: {
      meta: {
        label: "Finance",
        i18nKey: "finance.resources.dashboard",
        i18nOptions: { ns: "starter" },
        priority: 10,
        icon: <PieChart />,
        acl: false,
      },
    },
  },
  {
    name: "hub_fin_invoices",
    path: financeRoutes.invoices,
    element: <InvoiceListPage />,
    resource: {
      meta: {
        label: "Invoices",
        singularLabel: "Invoice",
        i18nKey: "finance.resources.invoices",
        i18nSingularKey: "finance.resources.invoice",
        i18nOptions: { ns: "starter" },
        priority: 11,
        icon: <Receipt />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_fin_invoices.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_fin_invoices" action="create" fallback={denied}>
            <InvoiceCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_fin_invoices.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_fin_invoices" action="edit" fallback={denied}>
            <InvoiceEdit />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_fin_expenses",
    path: financeRoutes.expenses,
    element: <ExpenseListPage />,
    resource: {
      meta: {
        label: "Expenses",
        singularLabel: "Expense",
        i18nKey: "finance.resources.expenses",
        i18nSingularKey: "finance.resources.expense",
        i18nOptions: { ns: "starter" },
        priority: 12,
        icon: <CreditCard />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_fin_expenses.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_fin_expenses" action="create" fallback={denied}>
            <ExpenseCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_fin_expenses.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_fin_expenses" action="edit" fallback={denied}>
            <ExpenseEdit />
          </CanAccess>
        ),
      },
    ],
  },
]);

export const financeModule = { routes };
