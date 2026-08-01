export const assetsRoutes = {
  // Assets register (signature primary list)
  assets: "/asset-registry",
  assetsCreate: "/asset-registry/create",
  assetsEdit: "/asset-registry/edit/:id",
  assetsShow: "/asset-registry/show/:id",
  // Assignments
  assignments: "/assignments",
  assignmentsCreate: "/assignments/create",
  assignmentsEdit: "/assignments/edit/:id",
} as const;

export const getAssetShowPath = (id: string | number) =>
  `/asset-registry/show/${encodeURIComponent(String(id))}`;

export const getAssetEditPath = (id: string | number) =>
  `/asset-registry/edit/${encodeURIComponent(String(id))}`;
