import { Gauge, LifeBuoy } from "lucide-react";

import {
  defineAppRoutes,
  type AppRouteDefinition,
} from "@nocobase/portal-sdk/routing";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { HelpdeskDashboard } from "./dashboard";
import { helpdeskRoutes } from "./routes";
import { TicketCreate, TicketEdit } from "./tickets/create-edit";
import { TicketsLayout } from "./tickets/list";
import { TicketShow } from "./tickets/show";
import { TicketStatusChange } from "./tickets/status-change";

const RESOURCE = "hub_hd_tickets";
const denied = <AccessDenied />;

const routes: AppRouteDefinition[] = defineAppRoutes([
  {
    name: "helpdesk-dashboard",
    path: helpdeskRoutes.dashboard,
    element: <HelpdeskDashboard />,
    resource: {
      meta: {
        label: "Workload",
        i18nKey: "helpdesk.resources.dashboard",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "helpdesk.resources.dashboard.description",
        priority: 61,
        icon: <Gauge />,
        description: "SLA health, queue workload and the priority mix.",
        acl: false,
      },
    },
  },
  {
    name: RESOURCE,
    path: helpdeskRoutes.tickets,
    element: <TicketsLayout />,
    resource: {
      meta: {
        label: "Helpdesk",
        singularLabel: "Ticket",
        i18nKey: "helpdesk.resources.tickets",
        i18nSingularKey: "helpdesk.resources.ticket",
        i18nOptions: { ns: "starter" },
        descriptionI18nKey: "helpdesk.resources.tickets.description",
        priority: 60,
        icon: <LifeBuoy />,
        description: "Support tickets, priorities and the reply thread.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    children: [
      {
        name: `${RESOURCE}.create`,
        path: "create",
        resourceAction: "create",
        element: (
          <CanAccess resource={RESOURCE} action="create" fallback={denied}>
            <TicketCreate />
          </CanAccess>
        ),
      },
      {
        name: `${RESOURCE}.edit`,
        path: "edit/:id",
        resourceAction: "edit",
        element: (
          <CanAccess resource={RESOURCE} action="edit" fallback={denied}>
            <TicketEdit />
          </CanAccess>
        ),
      },
      {
        name: `${RESOURCE}.show`,
        path: "show/:id",
        resourceAction: "show",
        element: (
          <CanAccess resource={RESOURCE} action="show" fallback={denied}>
            <TicketShow />
          </CanAccess>
        ),
        children: [
          {
            name: `${RESOURCE}.show.edit`,
            path: "edit",
            element: (
              <CanAccess resource={RESOURCE} action="edit" fallback={denied}>
                <TicketEdit returnTo="show" />
              </CanAccess>
            ),
          },
          {
            name: `${RESOURCE}.show.status`,
            path: "status",
            element: (
              <CanAccess resource={RESOURCE} action="edit" fallback={denied}>
                <TicketStatusChange />
              </CanAccess>
            ),
          },
        ],
      },
    ],
  },
]);

export const helpdeskModule = { routes };
