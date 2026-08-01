import { useCallback } from "react";
import { useNavigate, useResolvedPath } from "react-router";

/**
 * Navigate to a URL-backed child surface (drawer) relative to the current
 * route — e.g. `openChild("edit/12")` from the list opens the edit drawer.
 */
export function useOpenContextualChild() {
  const navigate = useNavigate();
  return useCallback((to: string) => navigate(to), [navigate]);
}

/** Where a drawer returns to when it closes: the parent route. */
export function useContextualCloseTo(): string {
  return useResolvedPath("..").pathname;
}
