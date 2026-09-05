import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Boxes, Building2, Package, Store, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { friendlyError } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/platform")({
  head: () => ({
    meta: [
      { title: "Platform overview — StockFlow Africa" },
      { name: "description", content: "Platform-wide statistics across every organization on StockFlow Africa." },
      { property: "og:title", content: "Platform overview — StockFlow Africa" },
      { property: "og:description", content: "Organizations, users, stores and daily transaction volume." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const { isSupremeAdmin } = useAuth();

  const query = useQuery({
    queryKey: ["platform-stats"],
    enabled: isSupremeAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_stats");
      if (error) throw error;
      return data as unknown as Record<string, number>;
    },
  });

  if (!isSupremeAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform overview" description="Restricted area." />
        <p className="panel p-6 text-sm text-muted-foreground">
          This area is reserved for the platform owner. Organization accounts cannot view platform-wide information.
        </p>
      </div>
    );
  }

  const stats = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Live totals across every organization on this deployment."
        actions={
          <Button asChild variant="outline">
            <Link to="/organizations">Manage organizations</Link>
          </Button>
        }
      />

      {query.isError ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {friendlyError(query.error, "We couldn't load platform statistics.")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Organizations" value={stats?.["organizations"] ?? 0} icon={Building2} loading={query.isLoading} />
        <StatCard label="Active organizations" value={stats?.["active_organizations"] ?? 0} icon={Building2} loading={query.isLoading} />
        <StatCard label="Users" value={stats?.["users"] ?? 0} icon={Users} loading={query.isLoading} />
        <StatCard label="Stores" value={stats?.["stores"] ?? 0} icon={Store} loading={query.isLoading} />
        <StatCard label="Inventory items" value={stats?.["items"] ?? 0} icon={Package} loading={query.isLoading} />
        <StatCard label="Transactions today" value={stats?.["transactions_today"] ?? 0} icon={Activity} loading={query.isLoading} />
      </div>

      <section className="panel p-5">
        <div className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">Platform role</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in as the platform owner. This account manages organizations and platform-level information
          only — it is deliberately kept separate from day-to-day organization operations.
        </p>
      </section>
    </div>
  );
}
