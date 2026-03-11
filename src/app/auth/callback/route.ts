import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/helpers/routes";
import { createClient } from "@/lib/supabase/server";
import { withBasePath } from "@/lib/helpers/basePath";

function getSafeRelativePath(path: string | null, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

function buildLoginRedirectUrl(
  request: NextRequest,
  options?: { redirectTo?: string; oauthError?: string },
) {
  const loginUrl = new URL(withBasePath(ROUTES.AUTH.LOGIN), request.url);

  if (options?.redirectTo) {
    loginUrl.searchParams.set("redirectTo", options.redirectTo);
  }

  if (options?.oauthError) {
    loginUrl.searchParams.set("oauthError", options.oauthError);
  }

  return loginUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const nextPath = getSafeRelativePath(next, ROUTES.APP.DASHBOARD);
  const providerError = requestUrl.searchParams.get("error");

  if (!code) {
    const oauthError = providerError
      ? "GOOGLE_AUTH_CANCELED_OR_FAILED"
      : "GOOGLE_AUTH_CODE_MISSING";
    return NextResponse.redirect(
      buildLoginRedirectUrl(request, {
        redirectTo: nextPath,
        oauthError,
      }),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildLoginRedirectUrl(request, {
        redirectTo: nextPath,
        oauthError: "GOOGLE_AUTH_EXCHANGE_FAILED",
      }),
    );
  }

  return NextResponse.redirect(new URL(withBasePath(nextPath), request.url));
}
