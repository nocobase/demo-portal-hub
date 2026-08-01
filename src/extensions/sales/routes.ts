// Path constants for the Sales module. The pipeline board is the primary
// surface and is mounted at /deals (Home quick-links target this).
export const salesRoutes = {
  // Pipeline (primary)
  pipeline: "/deals",
  dealCreate: "/deals/create",
  dealEdit: "/deals/edit/:id",
  // Accounts
  accounts: "/accounts",
  accountCreate: "/accounts/create",
  accountEdit: "/accounts/edit/:id",
  accountShow: "/accounts/show/:id",
  // Leads
  leads: "/leads",
  leadCreate: "/leads/create",
  leadEdit: "/leads/edit/:id",
  // Activities
  activities: "/activities",
  activityCreate: "/activities/create",
  activityEdit: "/activities/edit/:id",
} as const;

export const getAccountShowPath = (id: string | number) =>
  `/accounts/show/${encodeURIComponent(id)}`;
