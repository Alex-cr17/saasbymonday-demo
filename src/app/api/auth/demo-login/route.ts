import { fail, ok } from "@/lib/api/responses";
import { ROUTES } from "@/lib/helpers/routes";
import { createClient } from "@/lib/supabase/server";

function getSafeRelativePath(path: string | null, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export async function POST(req: Request) {
  let nextPath: string = ROUTES.APP.DASHBOARD;

  try {
    const body = (await req.json()) as { nextPath?: string };
    nextPath = getSafeRelativePath(body.nextPath ?? null, ROUTES.APP.DASHBOARD);
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const demoEmail = process.env.DEMO_USER_EMAIL;
  const demoPassword = process.env.DEMO_USER_PASSWORD;

  if (!demoEmail || !demoPassword) {
    return fail(
      "FEATURE_DISABLED",
      "Demo login is not configured. Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD.",
      503,
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error || !data.user) {
    return fail("UNAUTHENTICATED", "Demo login failed.", 401, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  console.info("[demo-start]", { userId: data.user.id });

  return ok(
    { redirectTo: nextPath },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
