/**
 * Centralized route definitions.
 * Used across middleware, server logic and client navigation.
 */

export const ROUTES = {
  HOME: "/",

  AUTH: {
    ROOT: "/auth",
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },

  APP: {
    ROOT: "/dashboard",
    DASHBOARD: "/dashboard",
  },
} as const;

export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith(ROUTES.AUTH.ROOT);
}

export function isPublicRoute(pathname: string): boolean {
  return (
    pathname === ROUTES.HOME ||
    isAuthRoute(pathname)
  );
}