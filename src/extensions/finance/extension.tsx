import { CreditCard, PieChart, Receipt } from "lucide-react";
import { Route } from "react-router";

import type { AppExtension } from "@/app/extension";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { FinanceDashboard } from "./dashboard";
import { ExpenseCreate, ExpenseEdit } from "./expenses/form";
import { ExpenseListPage } from "./expenses/list";
import { InvoiceCreate, InvoiceEdit } from "./invoices/form";
import { InvoiceListPage } from "./invoices/list";
import { financeRoutes } from "./routes";

// Finance module — accounts receivable (invoices) + employee expense claims,
// plus a spend/AR dashboard. Nav group priority ≥10. The primary list is
// mounted at /invoices (the Home quick-link target).
const financeExtension: AppExtension = {
  id: "finance",
  priority: 10,
  resources: [
    {
      name: "finance-dashboard",
      list: financeRoutes.dashboard,
      meta: {
        label: "Finance",
        priority: 10,
        icon: <PieChart />,
        acl: false,
      },
    },
    {
      name: "hub_fin_invoices",
      list: financeRoutes.invoices,
      create: financeRoutes.invoiceCreate,
      edit: financeRoutes.invoiceEdit,
      meta: {
        label: "Invoices",
        singularLabel: "Invoice",
        priority: 11,
        icon: <Receipt />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_fin_expenses",
      list: financeRoutes.expenses,
      create: financeRoutes.expenseCreate,
      edit: financeRoutes.expenseEdit,
      meta: {
        label: "Expenses",
        singularLabel: "Expense",
        priority: 12,
        icon: <CreditCard />,
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path="/finance" element={<FinanceDashboard />} />

      <Route path="/invoices" element={<InvoiceListPage />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_fin_invoices"
              action="create"
              fallback={<AccessDenied />}
            >
              <InvoiceCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_fin_invoices"
              action="edit"
              fallback={<AccessDenied />}
            >
              <InvoiceEdit />
            </CanAccess>
          }
        />
      </Route>

      <Route path="/expenses" element={<ExpenseListPage />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_fin_expenses"
              action="create"
              fallback={<AccessDenied />}
            >
              <ExpenseCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_fin_expenses"
              action="edit"
              fallback={<AccessDenied />}
            >
              <ExpenseEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default financeExtension;
