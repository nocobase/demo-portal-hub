export const helpdeskRoutes = {
  tickets: "/tickets",
  ticketsCreate: "/tickets/create",
  ticketsEdit: "/tickets/edit/:id",
  ticketsShow: "/tickets/show/:id",
  ticketsShowStatus: "/tickets/show/:id/status",
  dashboard: "/helpdesk/dashboard",
  slaPolicies: "/sla-policies",
  slaPoliciesShow: "/sla-policies/show/:id",
  faq: "/faq",
} as const;

export const getTicketShowPath = (id: string | number) =>
  `/tickets/show/${encodeURIComponent(id)}`;

export const getTicketEditPath = (id: string | number) =>
  `/tickets/edit/${encodeURIComponent(id)}`;

export const getTicketStatusPath = (id: string | number) =>
  `/tickets/show/${encodeURIComponent(id)}/status`;

export const getSlaPolicyShowPath = (id: string | number) =>
  `/sla-policies/show/${encodeURIComponent(id)}`;
