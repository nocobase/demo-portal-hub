export const helpdeskRoutes = {
  tickets: "/tickets",
  ticketsCreate: "/tickets/create",
  ticketsEdit: "/tickets/edit/:id",
  ticketsShow: "/tickets/show/:id",
} as const;

export const getTicketShowPath = (id: string | number) =>
  `/tickets/show/${encodeURIComponent(id)}`;

export const getTicketEditPath = (id: string | number) =>
  `/tickets/edit/${encodeURIComponent(id)}`;
