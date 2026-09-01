import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Boxes, Building2, Loader2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { friendlyError } from "@/lib/db";
import { homeForRoles, ROLE_LABELS, useAuth, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set up your workspace — StockFlow Africa" },
      { name: "description", content: "Create your organization or join the StockFlow demo workspace." },
      { property: "og:title", content: "Set up your workspace — StockFlow Africa" },
      { property: "og:description", content: "Create an organization to start managing stores and stock." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Onboarding,
});

const COUNTRIES = ["Zimbabwe", "Zambia", "South Africa", "Botswana", "Kenya", "Nigeria", "Ghana", "Tanzania", "Malawi", "Namibia"];
const CURRENCIES = ["USD", "ZAR", "ZMW", "BWP", "KES", "NGN", "GHS", "TZS", "MWK", "NAD"];
const JOIN_ROLES: AppRole[] = [
  "org_admin",
  "central_store_manager",
  "store_clerk",
  "department_head",
  "finance",
  "auditor",
];

function Onboarding() {
  const navigate = useNavigate();
  const { session, loading, roles, profile, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("Zimbabwe");
  const [currency, setCurrency] = useState("USD");

  const [demoRole, setDemoRole] = useState<AppRole>("org_admin");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    if (roles.length && (profile?.organization_id || roles.includes("supreme_admin"))) {
      void navigate({ to: homeForRoles(roles), replace: true });
    }
  }, [loading, session, roles, profile, navigate]);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
      await refresh();
      toast.success("Workspace ready");
    } catch (err) {
      setError(friendlyError(err, "We couldn't complete that step. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="size-4.5" aria-hidden />
          </span>
          <span className="font-semibold">StockFlow Africa</span>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Set up your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {profile?.email ?? session?.user.email}. Choose how you want to start.
        </p>

        {error ? (
          <p role="alert" className="mt-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" aria-hidden />
              <h2 className="font-semibold">Create a new organization</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              You become the organization administrator with full configuration control.
            </p>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void run("create", async () => {
                  const { error: err } = await supabase.rpc("create_organization", {
                    _name: name,
                    _code: code,
                    _country: country,
                    _currency: currency,
                  });
                  if (err) throw err;
                });
              }}
            >
              <div>
                <Label htmlFor="orgName" className="mb-1.5 block">
                  Organization name
                </Label>
                <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="orgCode" className="mb-1.5 block">
                  Organization code
                </Label>
                <Input
                  id="orgCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. STMARYS"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <Label htmlFor="country" className="mb-1.5 block">
                  Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency" className="mb-1.5 block">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy !== null}>
                  {busy === "create" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Create organization
                </Button>
              </div>
            </form>
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" aria-hidden />
              <h2 className="font-semibold">Explore the demo organization</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Join <span className="font-medium text-foreground">StockFlow Demo Organization</span> with sample
              departments, stores, categories, units and items. All demo records are clearly marked.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-xs">
                <Label htmlFor="demoRole" className="mb-1.5 block">
                  Join as
                </Label>
                <Select value={demoRole} onValueChange={(v) => setDemoRole(v as AppRole)}>
                  <SelectTrigger id="demoRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOIN_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  void run("demo", async () => {
                    const { error: err } = await supabase.rpc("join_organization", {
                      _code: "DEMO",
                      _role: demoRole,
                    });
                    if (err) throw err;
                  })
                }
              >
                {busy === "demo" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Join demo organization
              </Button>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              <h2 className="font-semibold">Claim platform ownership</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              One-time bootstrap for the StockFlow platform owner (Supreme Admin). Only available while no platform
              owner exists on this deployment.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              disabled={busy !== null}
              onClick={() =>
                void run("claim", async () => {
                  const { error: err } = await supabase.rpc("claim_supreme_admin");
                  if (err) throw err;
                })
              }
            >
              {busy === "claim" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Become platform owner
            </Button>
          </section>
        </div>

        <button
          type="button"
          className="mt-8 text-sm text-muted-foreground underline hover:text-foreground"
          onClick={() => void signOut().then(() => navigate({ to: "/auth", replace: true }))}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
