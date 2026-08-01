import { useCallback } from "react";
import { useNavigate } from "react-router";

/**
 * Opens a contextual child route (a drawer) relative to the current route.
 * From the list at `/asset-registry`, `openChild("show/1")` lands on `/asset-registry/show/1`;
 * from an open drawer at `/asset-registry/show/1`, `openChild("assign")` stacks a
 * nested drawer at `/asset-registry/show/1/assign`. Relative resolution is handled by
 * react-router against the nearest matched route.
 */
export function useOpenChild() {
  const navigate = useNavigate();
  return useCallback((to: string) => navigate(to), [navigate]);
}
