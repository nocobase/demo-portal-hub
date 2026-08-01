import { Activity, Building2, UserPlus, Workflow } from "lucide-react";
import { Route, useParams } from "react-router";

import type { AppExtension } from "@/app/extension";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { ActivityCreate, ActivityEdit } from "./activities/form";
import { ActivitiesLayout } from "./activities/list";
import { AccountCreate, AccountEdit } from "./accounts/form";
import { AccountsLayout } from "./accounts/list";
import { AccountShow } from "./accounts/show";
import { ContactCreate, ContactEdit } from "./contacts/form";
import { DealCreate, DealEdit } from "./deals/form";
import { PipelinePage } from "./deals/pipeline";
import { LeadCreate, LeadEdit } from "./leads/form";
import { LeadsLayout } from "./leads/list";
import { getAccountShowPath, salesRoutes } from "./routes";

const denied = <AccessDenied />;

// Deals opened from inside an account drawer: preset the account and return to
// that account's detail drawer on close.
function AccountNestedDealCreate() {
  const { id } = useParams<{ id: string }>();
  return (
    <DealCreate
      presetAccountId={id}
      closeTo={id ? getAccountShowPath(id) : salesRoutes.accounts}
    />
  );
}

function AccountNestedDealEdit() {
  const { id } = useParams<{ id: string }>();
  return (
    <DealEdit
      presetAccountId={id}
      idParam="dealId"
      closeTo={id ? getAccountShowPath(id) : salesRoutes.accounts}
    />
  );
}

const salesExtension: AppExtension = {
  id: "sales",
  priority: 10,
  resources: [
    {
      name: "hub_sales_deals",
      list: salesRoutes.pipeline,
      create: salesRoutes.dealCreate,
      edit: salesRoutes.dealEdit,
      meta: {
        label: "Pipeline",
        singularLabel: "Deal",
        priority: 10,
        icon: <Workflow />,
        description: "Every deal from inquiry to won or lost.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_sales_accounts",
      list: salesRoutes.accounts,
      create: salesRoutes.accountCreate,
      edit: salesRoutes.accountEdit,
      show: salesRoutes.accountShow,
      meta: {
        label: "Accounts",
        singularLabel: "Account",
        priority: 11,
        icon: <Building2 />,
        description: "Client companies, their contacts and deals.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_sales_leads",
      list: salesRoutes.leads,
      create: salesRoutes.leadCreate,
      edit: salesRoutes.leadEdit,
      meta: {
        label: "Leads",
        singularLabel: "Lead",
        priority: 12,
        icon: <UserPlus />,
        description: "Inbound and prospected leads to qualify.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_sales_activities",
      list: salesRoutes.activities,
      create: salesRoutes.activityCreate,
      edit: salesRoutes.activityEdit,
      meta: {
        label: "Activities",
        singularLabel: "Activity",
        priority: 13,
        icon: <Activity />,
        description: "Calls, emails and meetings logged against deals.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    // Sub-entity used by the account drawer — no nav entry, registered so
    // refine data hooks and delete actions resolve the resource.
    {
      name: "hub_sales_contacts",
      meta: { acl: { type: "collection" } },
    },
  ],
  routes: (
    <>
      {/* Pipeline board (primary, mounted at /deals) */}
      <Route
        path={salesRoutes.pipeline}
        element={
          <CanAccess
            resource="hub_sales_deals"
            action="list"
            fallback={denied}
          >
            <PipelinePage />
          </CanAccess>
        }
      >
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_sales_deals"
              action="create"
              fallback={denied}
            >
              <DealCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_sales_deals"
              action="edit"
              fallback={denied}
            >
              <DealEdit />
            </CanAccess>
          }
        />
      </Route>

      {/* Accounts */}
      <Route path={salesRoutes.accounts} element={<AccountsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_sales_accounts"
              action="create"
              fallback={denied}
            >
              <AccountCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_sales_accounts"
              action="edit"
              fallback={denied}
            >
              <AccountEdit />
            </CanAccess>
          }
        />
        <Route
          path="show/:id"
          element={
            <CanAccess
              resource="hub_sales_accounts"
              action="show"
              fallback={denied}
            >
              <AccountShow />
            </CanAccess>
          }
        >
          <Route
            path="edit"
            element={
              <CanAccess
                resource="hub_sales_accounts"
                action="edit"
                fallback={denied}
              >
                <AccountEdit returnTo="show" />
              </CanAccess>
            }
          />
          <Route
            path="contacts/create"
            element={
              <CanAccess
                resource="hub_sales_contacts"
                action="create"
                fallback={denied}
              >
                <ContactCreate />
              </CanAccess>
            }
          />
          <Route
            path="contacts/edit/:contactId"
            element={
              <CanAccess
                resource="hub_sales_contacts"
                action="edit"
                fallback={denied}
              >
                <ContactEdit />
              </CanAccess>
            }
          />
          <Route
            path="deals/create"
            element={
              <CanAccess
                resource="hub_sales_deals"
                action="create"
                fallback={denied}
              >
                <AccountNestedDealCreate />
              </CanAccess>
            }
          />
          <Route
            path="deals/edit/:dealId"
            element={
              <CanAccess
                resource="hub_sales_deals"
                action="edit"
                fallback={denied}
              >
                <AccountNestedDealEdit />
              </CanAccess>
            }
          />
        </Route>
      </Route>

      {/* Leads */}
      <Route path={salesRoutes.leads} element={<LeadsLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_sales_leads"
              action="create"
              fallback={denied}
            >
              <LeadCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_sales_leads"
              action="edit"
              fallback={denied}
            >
              <LeadEdit />
            </CanAccess>
          }
        />
      </Route>

      {/* Activities */}
      <Route path={salesRoutes.activities} element={<ActivitiesLayout />}>
        <Route
          path="create"
          element={
            <CanAccess
              resource="hub_sales_activities"
              action="create"
              fallback={denied}
            >
              <ActivityCreate />
            </CanAccess>
          }
        />
        <Route
          path="edit/:id"
          element={
            <CanAccess
              resource="hub_sales_activities"
              action="edit"
              fallback={denied}
            >
              <ActivityEdit />
            </CanAccess>
          }
        />
      </Route>
    </>
  ),
};

export default salesExtension;
