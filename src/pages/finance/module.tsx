import { BarChart3, CreditCard, PieChart, Receipt } from "lucide-react";

import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { FinanceDashboard } from "@/pages/finance/dashboard";
import { ExpenseDecision } from "@/pages/finance/expenses/decision";
import { ExpenseCreate, ExpenseEdit } from "@/pages/finance/expenses/form";
import { ExpenseListPage } from "@/pages/finance/expenses/list";
import { ExpenseShow } from "@/pages/finance/expenses/show";
import { InvoiceCreate, InvoiceEdit } from "@/pages/finance/invoices/form";
import { InvoiceListPage } from "@/pages/finance/invoices/list";
import { InvoiceShow } from "@/pages/finance/invoices/show";
import { FinanceReports } from "@/pages/finance/reports";
import { financeRoutes } from "@/pages/finance/routes";

const denied = <AccessDenied />;

// Nested children rendered inside the invoice detail drawer (2nd URL level):
// /invoices/show/:id/edit
const invoiceShowChildren: AppRouteDefinition[] = [
  {
    name: "hub_fin_invoices.show.edit",
    path: "edit",
    element: (
      <CanAccess resource="hub_fin_invoices" action="edit" fallback={denied}>
        <InvoiceEdit />
      </CanAccess>
    ),
  },
];

// Nested children rendered inside the expense detail drawer (2nd URL level):
// /expenses/show/:id/edit and /expenses/show/:id/decision/:action
const expenseShowChildren: AppRouteDefinition[] = [
  {
    name: "hub_fin_expenses.show.edit",
    path: "edit",
    element: (
      <CanAccess resource="hub_fin_expenses" action="edit" fallback={denied}>
        <ExpenseEdit />
      </CanAccess>
    ),
  },
  {
    name: "hub_fin_expenses.show.decision",
    path: "decision/:action",
    element: (
      <CanAccess resource="hub_fin_expenses" action="edit" fallback={denied}>
        <ExpenseDecision />
      </CanAccess>
    ),
  },
];

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
      {
        name: "hub_fin_invoices.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource="hub_fin_invoices" action="show" fallback={denied}>
            <InvoiceShow />
          </CanAccess>
        ),
        children: invoiceShowChildren,
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
      {
        name: "hub_fin_expenses.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource="hub_fin_expenses" action="show" fallback={denied}>
            <ExpenseShow />
          </CanAccess>
        ),
        children: expenseShowChildren,
      },
    ],
  },
  {
    name: "finance-reports",
    path: financeRoutes.reports,
    element: <FinanceReports />,
    resource: {
      meta: {
        label: "Reports",
        i18nKey: "finance.resources.reports",
        i18nOptions: { ns: "starter" },
        priority: 13,
        icon: <BarChart3 />,
        acl: false,
      },
    },
  },
]);

export const financeModule = { routes };
