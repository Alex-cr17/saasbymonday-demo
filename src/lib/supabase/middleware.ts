import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAuthRoute, isPublicRoute, ROUTES } from '@/lib/helpers/routes';

/**
 * Middleware to sync Supabase session cookies and enforce auth rules:
 *
 * Public:
 * - "/"
 * - "/auth/*"
 *
 * Rules:
 * 1) Authenticated users visiting "/auth/*" → redirect to dashboard
 * 2) Unauthenticated users visiting protected routes → redirect to login
 * 3) Marketing pages are always public
 */
export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // API routes are validated at route level (requireUser, webhook signatures, etc).
  // Never redirect API callers to login from middleware.
  if (pathname.startsWith('/api')) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Use getUser() to authenticate against Supabase Auth server
  // getSession() data comes from cookies and may not be authentic
  const { data: { user } } = await supabase.auth.getUser();

  // Public routes
  if (isPublicRoute(pathname)) {
    // Authenticated user should not access auth pages
    if (user && isAuthRoute(pathname)) {
      return NextResponse.redirect(new URL(ROUTES.APP.ROOT, url));
    }

    return response;
  }

  // Protected routes
  if (!user) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, url);
    loginUrl.searchParams.set("redirectTo", pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}