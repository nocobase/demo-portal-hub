import { useCallback } from "react";
import { useNavigate } from "react-router";

/**
 * Open a contextual child route (create/edit/show drawer) relative to the
 * current list or drawer. Hub-native: plain relative navigation, the
 * RouteDrawer handles the overlay + `closeTo` return path.
 */
export function useOpenContextualChild() {
  const navigate = useNavigate();
  return useCallback((to: string) => navigate(to), [navigate]);
}
