import { LifeBuoy } from "lucide-react";
import { Route } from "react-router";

import type { AppExtension } from "@/app/extension";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { helpdeskRoutes } from "./routes";
import { TicketCreate, TicketEdit } from "./tickets/create-edit";
import { TicketsLayout } from "./tickets/list";
import { TicketShow } from "./tickets/show";

const RESOURCE = "hub_hd_tickets";

const helpdeskExtension: AppExtension = {
  id: "helpdesk",
  priority: 10,
  resources: [
    {
      name: RESOURCE,
      list: helpdeskRoutes.tickets,
      create: helpdeskRoutes.ticketsCreate,
      edit: helpdeskRoutes.ticketsEdit,
      show: helpdeskRoutes.ticketsShow,
      meta: {
        label: "Helpdesk",
        singularLabel: "Ticket",
        priority: 60,
        icon: <LifeBuoy />,
        description: "Support tickets, priorities and the reply thread.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <Route path={helpdeskRoutes.tickets} element={<TicketsLayout />}>
      <Route
        path="create"
        element={
          <CanAccess resource={RESOURCE} action="create" fallback={<AccessDenied />}>
            <TicketCreate />
          </CanAccess>
        }
      />
      <Route
        path="edit/:id"
        element={
          <CanAccess resource={RESOURCE} action="edit" fallback={<AccessDenied />}>
            <TicketEdit />
          </CanAccess>
        }
      />
      <Route
        path="show/:id"
        element={
          <CanAccess resource={RESOURCE} action="show" fallback={<AccessDenied />}>
            <TicketShow />
          </CanAccess>
        }
      >
        <Route
          path="edit"
          element={
            <CanAccess resource={RESOURCE} action="edit" fallback={<AccessDenied />}>
              <TicketEdit returnTo="show" />
            </CanAccess>
          }
        />
      </Route>
    </Route>
  ),
};

export default helpdeskExtension;
