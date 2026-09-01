import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Boxes, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { friendlyError } from "@/lib/db";
import { homeForRoles, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — StockFlow Africa" },
      { name: "description", content: "Sign in to your StockFlow Africa organization to manage stores and stock." },
      { property: "og:title", content: "Sign in — StockFlow Africa" },
      { property: "og:description", content: "Secure access to your inventory and stores management workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, roles, loading, profile } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !session) return;
    if (!roles.length && !profile?.organization_id) {
      void navigate({ to: "/onboarding", replace: true });
      return;
    }
    void navigate({ to: homeForRoles(roles), replace: true });
  }, [loading, session, roles, profile, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (err) throw err;
        toast.success("If that email is registered, a reset link is on its way.");
        setMode("signin");
      }
    } catch (err) {
      setError(friendlyError(err, "We couldn't complete that request. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setError("Google sign-in is unavailable right now. Please use your email and password.");
      return;
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="size-4.5" aria-hidden />
          </span>
          <span className="font-semibold text-sidebar-accent-foreground">StockFlow Africa</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-sidebar-accent-foreground">
            Central Stores. Departmental Stores. Complete Control.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/75">
            Every receipt, issue, transfer, breakage and loss is recorded against an immutable ledger — who, what,
            when, where, how much, at what cost and why.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">No stock moves without a trace.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-4.5" aria-hidden />
            </span>
            <span className="font-semibold">StockFlow Africa</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "reset" ? "Reset your password" : "Sign in to StockFlow"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "reset"
              ? "We'll email you a secure link to set a new password."
              : "Use your work email to access your organization's stores."}
          </p>

          {mode !== "reset" ? (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" />
              <TabsContent value="signup" />
            </Tabs>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "signup" ? (
              <div>
                <Label htmlFor="fullName" className="mb-1.5 block">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            ) : null}

            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {mode !== "reset" ? (
              <div>
                <Label htmlFor="password" className="mb-1.5 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          {mode !== "reset" ? (
            <>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" onClick={() => void googleSignIn()}>
                Continue with Google
              </Button>
            </>
          ) : null}

          <div className="mt-6 text-sm text-muted-foreground">
            {mode === "reset" ? (
              <button type="button" className="underline hover:text-foreground" onClick={() => setMode("signin")}>
                Back to sign in
              </button>
            ) : (
              <button type="button" className="underline hover:text-foreground" onClick={() => setMode("reset")}>
                Forgot your password?
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
