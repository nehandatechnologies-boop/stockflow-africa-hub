import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Coins, PackageSearch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { friendlyError } from "@/lib/db";
import { formatMoney, formatQty } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({
    meta: [
      { title: "Stock on hand — StockFlow Africa" },
      { name: "description", content: "Live stock balances and valuation across every store in your organization." },
      { property: "og:title", content: "Stock on hand — StockFlow Africa" },
      { property: "og:description", content: "Quantities, average cost and stock value per item and store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StockPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BalanceRow = any;

function StockPage() {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;
  const currency = organization?.currency ?? "USD";
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  const storesQuery = useQuery({
    queryKey: ["stores-list", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name")
        .eq("organization_id", orgId!)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const balancesQuery = useQuery({
    queryKey: ["stock-balances", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_balances")
        .select(
          "id, quantity, reserved_quantity, average_cost, total_value, store_id, item_id, stores(name), items(name, item_code, reorder_level, minimum_stock_level, units_of_measure(abbreviation))",
        )
        .eq("organization_id", orgId!);
      if (error) throw error;
      return (data ?? []) as unknown as BalanceRow[];
    },
  });

  const rows = useMemo(() => {
    const all = balancesQuery.data ?? [];
    return all
      .filter((r) => storeFilter === "all" || r.store_id === storeFilter)
      .map((r) => {
        const item = r.items as Record<string, unknown> | null;
        const store = r.stores as Record<string, unknown> | null;
        const qty = Number(r.quantity ?? 0);
        const reorder = Number(item?.reorder_level ?? 0);
        const minimum = Number(item?.minimum_stock_level ?? 0);
        return {
          ...r,
          item_name: String(item?.name ?? "Unknown item"),
          item_code: String(item?.item_code ?? "—"),
          unit: String((item?.units_of_measure as Record<string, unknown> | null)?.abbreviation ?? ""),
          store_name: String(store?.name ?? "—"),
          level: qty <= 0 ? "out of stock" : qty <= minimum ? "critical" : qty <= reorder ? "reorder" : "healthy",
        };
      });
  }, [balancesQuery.data, storeFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      [r.item_name, r.item_code, r.store_name].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const totalValue = rows.reduce((sum, r) => sum + Number(r.total_value ?? 0), 0);
  const lowCount = rows.filter((r) => r.level === "reorder" || r.level === "critical").length;
  const outCount = rows.filter((r) => r.level === "out of stock").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock on hand"
        description="Live balances derived from the immutable stock ledger. Values use weighted average cost."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stock lines" value={rows.length} icon={Boxes} loading={balancesQuery.isLoading} />
        <StatCard
          label="Stock value"
          value={formatMoney(totalValue, currency)}
          icon={Coins}
          loading={balancesQuery.isLoading}
        />
        <StatCard
          label="At or below reorder"
          value={lowCount}
          icon={AlertTriangle}
          tone="warning"
          loading={balancesQuery.isLoading}
        />
        <StatCard
          label="Out of stock"
          value={outCount}
          icon={PackageSearch}
          tone="danger"
          loading={balancesQuery.isLoading}
        />
      </div>

      <DataTable
        rows={filtered}
        loading={balancesQuery.isLoading}
        error={balancesQuery.isError ? friendlyError(balancesQuery.error, "Please try again in a moment.") : null}
        onRetry={() => void balancesQuery.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search items or stores…"
        getRowKey={(row) => String(row.id)}
        emptyTitle="No stock balances yet"
        emptyDescription="Balances appear once goods are received into a store."
        filters={
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-56" aria-label="Filter by store">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {(storesQuery.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        columns={[
          { key: "item_code", header: "Code", sortable: true, className: "w-32" },
          { key: "item_name", header: "Item", sortable: true },
          { key: "store_name", header: "Store", sortable: true },
          {
            key: "quantity",
            header: "Quantity",
            sortable: true,
            sortValue: (row) => Number(row.quantity ?? 0),
            render: (row) => (
              <span className="numeric">
                {formatQty(row.quantity as number)} {String(row.unit ?? "")}
              </span>
            ),
          },
          {
            key: "average_cost",
            header: "Avg cost",
            sortable: true,
            sortValue: (row) => Number(row.average_cost ?? 0),
            render: (row) => <span className="numeric">{formatMoney(row.average_cost as number, currency)}</span>,
          },
          {
            key: "total_value",
            header: "Value",
            sortable: true,
            sortValue: (row) => Number(row.total_value ?? 0),
            render: (row) => <span className="numeric">{formatMoney(row.total_value as number, currency)}</span>,
          },
          {
            key: "level",
            header: "Level",
            sortable: true,
            render: (row) => (
              <StatusBadge
                value={String(row.level)}
                tone={
                  row.level === "healthy"
                    ? "success"
                    : row.level === "reorder"
                      ? "warning"
                      : row.level === "critical"
                        ? "warning"
                        : "danger"
                }
              />
            ),
          },
        ]}
      />
    </div>
  );
}
