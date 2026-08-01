import { Activity, Building2, UserPlus, Workflow } from "lucide-react";
import { useParams } from "react-router";

import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { ActivityCreate, ActivityEdit } from "@/pages/sales/activities/form";
import { ActivitiesLayout } from "@/pages/sales/activities/list";
import { AccountCreate, AccountEdit } from "@/pages/sales/accounts/form";
import { AccountsLayout } from "@/pages/sales/accounts/list";
import { AccountShow } from "@/pages/sales/accounts/show";
import { ContactCreate, ContactEdit } from "@/pages/sales/contacts/form";
import { DealCreate, DealEdit } from "@/pages/sales/deals/form";
import { PipelinePage } from "@/pages/sales/deals/pipeline";
import { LeadCreate, LeadEdit } from "@/pages/sales/leads/form";
import { LeadsLayout } from "@/pages/sales/leads/list";

// Path constants for the Sales module. The pipeline board is the primary
// surface and is mounted at /deals (Home quick-links target this).
export const salesRoutes = {
  pipeline: "/deals",
  accounts: "/accounts",
  leads: "/leads",
  activities: "/activities",
} as const;

const denied = <AccessDenied />;

// Deals opened from inside an account drawer: preset the account and return to
// that account's detail drawer on close (via contextual navigation state).
function AccountNestedDealCreate() {
  const { id } = useParams<{ id: string }>();
  return <DealCreate presetAccountId={id} />;
}

function AccountNestedDealEdit() {
  const { id } = useParams<{ id: string }>();
  return <DealEdit presetAccountId={id} idParam="dealId" />;
}

const accountContextChildren = (prefix: string): AppRouteDefinition[] => [
  {
    name: `${prefix}.edit`,
    path: "edit",
    element: (
      <CanAccess resource="hub_sales_accounts" action="edit" fallback={denied}>
        <AccountEdit />
      </CanAccess>
    ),
  },
  {
    name: `${prefix}.contacts.create`,
    path: "contacts/create",
    element: (
      <CanAccess resource="hub_sales_contacts" action="create" fallback={denied}>
        <ContactCreate />
      </CanAccess>
    ),
  },
  {
    name: `${prefix}.contacts.edit`,
    path: "contacts/edit/:contactId",
    element: (
      <CanAccess resource="hub_sales_contacts" action="edit" fallback={denied}>
        <ContactEdit />
      </CanAccess>
    ),
  },
  {
    name: `${prefix}.deals.create`,
    path: "deals/create",
    element: (
      <CanAccess resource="hub_sales_deals" action="create" fallback={denied}>
        <AccountNestedDealCreate />
      </CanAccess>
    ),
  },
  {
    name: `${prefix}.deals.edit`,
    path: "deals/edit/:dealId",
    element: (
      <CanAccess resource="hub_sales_deals" action="edit" fallback={denied}>
        <AccountNestedDealEdit />
      </CanAccess>
    ),
  },
];

const routes = defineAppRoutes([
  {
    // Pipeline board (primary, mounted at /deals)
    name: "hub_sales_deals",
    path: salesRoutes.pipeline,
    element: (
      <CanAccess resource="hub_sales_deals" action="list" fallback={denied}>
        <PipelinePage />
      </CanAccess>
    ),
    resource: {
      meta: {
        label: "Pipeline",
        singularLabel: "Deal",
        i18nKey: "sales.resources.pipeline",
        i18nSingularKey: "sales.resources.deal",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "sales.resources.pipeline.description",
        priority: 10,
        icon: <Workflow />,
        description: "Every deal from inquiry to won or lost.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_sales_deals.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_sales_deals" action="create" fallback={denied}>
            <DealCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_sales_deals.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_sales_deals" action="edit" fallback={denied}>
            <DealEdit />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_sales_accounts",
    path: salesRoutes.accounts,
    element: <AccountsLayout />,
    resource: {
      meta: {
        label: "Accounts",
        singularLabel: "Account",
        i18nKey: "sales.resources.accounts",
        i18nSingularKey: "sales.resources.account",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "sales.resources.accounts.description",
        priority: 11,
        icon: <Building2 />,
        description: "Client companies, their contacts and deals.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_sales_accounts.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess
            resource="hub_sales_accounts"
            action="create"
            fallback={denied}
          >
            <AccountCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_sales_accounts.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_sales_accounts" action="edit" fallback={denied}>
            <AccountEdit />
          </CanAccess>
        ),
      },
      {
        name: "hub_sales_accounts.show",
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource="hub_sales_accounts" action="show" fallback={denied}>
            <AccountShow />
          </CanAccess>
        ),
        children: accountContextChildren("hub_sales_accounts.show"),
      },
    ],
  },
  {
    name: "hub_sales_leads",
    path: salesRoutes.leads,
    element: <LeadsLayout />,
    resource: {
      meta: {
        label: "Leads",
        singularLabel: "Lead",
        i18nKey: "sales.resources.leads",
        i18nSingularKey: "sales.resources.lead",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "sales.resources.leads.description",
        priority: 12,
        icon: <UserPlus />,
        description: "Inbound and prospected leads to qualify.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_sales_leads.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource="hub_sales_leads" action="create" fallback={denied}>
            <LeadCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_sales_leads.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource="hub_sales_leads" action="edit" fallback={denied}>
            <LeadEdit />
          </CanAccess>
        ),
      },
    ],
  },
  {
    name: "hub_sales_activities",
    path: salesRoutes.activities,
    element: <ActivitiesLayout />,
    resource: {
      meta: {
        label: "Activities",
        singularLabel: "Activity",
        i18nKey: "sales.resources.activities",
        i18nSingularKey: "sales.resources.activity",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "sales.resources.activities.description",
        priority: 13,
        icon: <Activity />,
        description: "Calls, emails and meetings logged against deals.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: "hub_sales_activities.create",
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess
            resource="hub_sales_activities"
            action="create"
            fallback={denied}
          >
            <ActivityCreate />
          </CanAccess>
        ),
      },
      {
        name: "hub_sales_activities.edit",
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess
            resource="hub_sales_activities"
            action="edit"
            fallback={denied}
          >
            <ActivityEdit />
          </CanAccess>
        ),
      },
    ],
  },
]);

export const salesModule = { routes };
