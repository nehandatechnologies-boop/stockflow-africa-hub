import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Coins, Layers, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DataTable, type Column } from "@/components/data-table";
import { friendlyError } from "@/lib/db";
import { formatMoney, formatQty } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Finance — StockFlow Africa" },
      { name: "description", content: "Stock valuation by store, based on weighted average cost." },
      { property: "og:title", content: "Finance — StockFlow Africa" },
      { property: "og:description", content: "Inventory valuation and stock value per store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinancePage,
});

interface StoreValue extends Record<string, unknown> {
  id: string;
  store_name: string;
  lines: number;
  quantity: number;
  value: number;
}

function FinancePage() {
  const { can, organization } = useAuth();
  const orgId = organization?.id ?? null;
  const currency = organization?.currency ?? "USD";
  const [search, setSearch] = useState("");
  const allowed = can("reports.view");

  const query = useQuery({
    queryKey: ["finance-valuation", orgId],
    enabled: allowed && !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_balances")
        .select("store_id, quantity, total_value, stores(name)")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo<StoreValue[]>(() => {
    const map = new Map<string, StoreValue>();
    for (const row of query.data ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      const key = String(r.store_id);
      const entry = map.get(key) ?? {
        id: key,
        store_name: String(r.stores?.name ?? "Unassigned store"),
        lines: 0,
        quantity: 0,
        value: 0,
      };
      entry.lines += 1;
      entry.quantity += Number(r.quantity ?? 0);
      entry.value += Number(r.total_value ?? 0);
      map.set(key, entry);
    }
    const list = [...map.values()].sort((a, b) => b.value - a.value);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((r) => r.store_name.toLowerCase().includes(q));
  }, [query.data, search]);

  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);

  const columns: Column<StoreValue>[] = [
    { key: "store_name", header: "Store", sortable: true },
    { key: "lines", header: "Stock lines", sortable: true, className: "text-right", render: (r) => formatQty(r.lines) },
    { key: "quantity", header: "Units", sortable: true, className: "text-right", render: (r) => formatQty(r.quantity) },
    {
      key: "value",
      header: "Value",
      sortable: true,
      className: "text-right",
      render: (r) => formatMoney(r.value, currency),
    },
  ];

  if (!allowed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finance" description="Restricted area." />
        <p className="panel p-6 text-sm text-muted-foreground">
          You do not have permission to view financial reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Inventory valuation derived from the ledger using weighted average cost."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total stock value" value={formatMoney(totalValue, currency)} icon={Coins} loading={query.isLoading} />
        <StatCard label="Units on hand" value={formatQty(totalQty)} icon={Layers} loading={query.isLoading} />
        <StatCard label="Stores valued" value={rows.length} icon={Store} loading={query.isLoading} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        error={query.isError ? friendlyError(query.error, "We couldn't load the valuation.") : null}
        onRetry={() => void query.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search stores…"
        emptyTitle="No stock to value"
        emptyDescription="Once stock is received, valuation by store appears here."
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
