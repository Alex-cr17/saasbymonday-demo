import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function HeroSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          AI-Optimized SaaS Starter
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Launch your product together with AI without breaking the codebase.
          A ready Next.js + Supabase starter, designed for Cursor, with
          multi-tenancy and a clear architecture.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login?demo=1"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
              >
                Try demo
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 w-full max-w-md rounded-xl border bg-card p-4 shadow-sm md:mt-0">
        <p className="text-sm font-medium text-muted-foreground">
          What you get:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Next.js 14 App Router + Supabase Auth</li>
          <li>• Tailwind CSS + shadcn/ui components</li>
          <li>• Dashboard and Projects example</li>
          <li>• AI-friendly docs and .cursorrules</li>
        </ul>
      </div>
    </section>
  );
}