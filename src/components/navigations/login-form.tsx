"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from '@/lib/helpers/routes';

function getSafeRelativePath(path: string | null, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

function getOAuthErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case "GOOGLE_AUTH_CANCELED_OR_FAILED":
      return "Google login was canceled or failed. Please try again.";
    case "GOOGLE_AUTH_CODE_MISSING":
      return "Could not complete Google login. Please try again.";
    case "GOOGLE_AUTH_EXCHANGE_FAILED":
      return "Could not complete Google login. Please try again.";
    default:
      return "Google login failed. Please try again.";
  }
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectToParam = searchParams.get("redirectTo");
  const nextPath = getSafeRelativePath(redirectToParam, ROUTES.APP.DASHBOARD);

  useEffect(() => {
    const oauthErrorParam = searchParams.get("oauthError");
    setOauthError(getOAuthErrorMessage(oauthErrorParam));
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setOauthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push(nextPath);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);
    setOauthError(null);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isGoogleLoading || isLoading}
                onClick={handleGoogleLogin}
              >
                {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
              </Button>
              <div className="relative text-center text-sm">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
                <div className="absolute inset-0 top-1/2 -z-0 border-t" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {(oauthError || error) && (
                <p className="text-sm text-red-500">{oauthError ?? error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}