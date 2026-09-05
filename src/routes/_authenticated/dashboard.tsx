import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Building2, Coins, Package, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { formatMoney, formatQty, formatDateTime } from "@/lib/format";
import { friendlyError } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockFlow Africa" },
      { name: "description", content: "Live inventory, stock value and recent stock movements for your organization." },
      { property: "og:title", content: "Dashboard — StockFlow Africa" },
      { property: "og:description", content: "Real-time overview of items, stores, stock value and recent activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { organization, profile } = useAuth();
  const orgId = organization?.id ?? null;
  const currency = organization?.currency ?? "USD";

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [items, stores, departments, suppliers, balances] = await Promise.all([
        supabase.from("items").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("stores").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("departments").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("suppliers").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase
          .from("stock_balances")
          .select("quantity, total_value, items(reorder_level, minimum_stock_level)")
          .eq("organization_id", orgId!),
      ]);

      const firstError = items.error ?? stores.error ?? departments.error ?? suppliers.error ?? balances.error;
      if (firstError) throw firstError;

      const rows = balances.data ?? [];
      let value = 0;
      let low = 0;
      let out = 0;
      for (const row of rows) {
        const qty = Number(row.quantity ?? 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item = row.items as any;
        value += Number(row.total_value ?? 0);
        if (qty <= 0) out += 1;
        else if (qty <= Number(item?.reorder_level ?? 0)) low += 1;
      }

      return {
        items: items.count ?? 0,
        stores: stores.count ?? 0,
        departments: departments.count ?? 0,
        suppliers: suppliers.count ?? 0,
        stockLines: rows.length,
        value,
        low,
        out,
      };
    },
  });

  const activityQuery = useQuery({
    queryKey: ["dashboard-activity", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_ledger")
        .select("id, transaction_reference, transaction_type, quantity, transaction_date, items(name), stores(name)")
        .eq("organization_id", orgId!)
        .order("transaction_date", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = statsQuery.data;
  const loading = statsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={organization?.name ? `${organization.name} overview` : "Overview"}
        description={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}. Every figure below is read live from your stock ledger.`}
        actions={
          <Button asChild variant="outline">
            <Link to="/stock">Stock on hand</Link>
          </Button>
        }
      />

      {statsQuery.isError ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {friendlyError(statsQuery.error, "We couldn't load your dashboard figures.")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stock value" value={formatMoney(stats?.value ?? 0, currency)} icon={Coins} loading={loading} />
        <StatCard label="Inventory items" value={stats?.items ?? 0} icon={Package} loading={loading} />
        <StatCard label="Stock lines" value={stats?.stockLines ?? 0} icon={Boxes} loading={loading} />
        <StatCard
          label="Low stock"
          value={stats?.low ?? 0}
          hint={`${stats?.out ?? 0} out of stock`}
          icon={AlertTriangle}
          tone={(stats?.low ?? 0) > 0 ? "warning" : "default"}
          loading={loading}
        />
        <StatCard label="Stores" value={stats?.stores ?? 0} icon={Store} loading={loading} />
        <StatCard label="Departments" value={stats?.departments ?? 0} icon={Building2} loading={loading} />
        <StatCard label="Suppliers" value={stats?.suppliers ?? 0} icon={Building2} loading={loading} />
      </div>

      <section className="panel">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Recent stock activity</h2>
          <p className="text-xs text-muted-foreground">The eight most recent ledger transactions.</p>
        </div>
        {activityQuery.isLoading ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Loading activity…</p>
        ) : (activityQuery.data ?? []).length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No stock movements recorded yet. Transactions appear here as soon as stock is received or issued.
          </p>
        ) : (
          <ul className="divide-y">
            {(activityQuery.data ?? []).map((row) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const r = row as any;
              const qty = Number(r.quantity ?? 0);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.transaction_type.replaceAll("_", " ")} · {r.items?.name ?? "Item"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.transaction_reference} · {r.stores?.name ?? "—"} · {formatDateTime(r.transaction_date)}
                    </p>
                  </div>
                  <span className={qty < 0 ? "text-sm font-medium text-destructive" : "text-sm font-medium text-success"}>
                    {qty > 0 ? "+" : ""}
                    {formatQty(qty)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
