import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { friendlyError } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — StockFlow Africa" },
      { name: "description", content: "Every organization registered on this StockFlow Africa deployment." },
      { property: "og:title", content: "Organizations — StockFlow Africa" },
      { property: "og:description", content: "Platform owner view of registered organizations and their status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrganizationsPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrgRow = any;

function OrganizationsPage() {
  const { isSupremeAdmin } = useAuth();
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["platform-organizations"],
    enabled: isSupremeAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, organization_code, country, currency, status, is_demo, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrgRow[];
    },
  });

  const rows = useMemo<OrgRow[]>(() => {
    const all = query.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((r: OrgRow) =>
      [r.name, r.organization_code, r.country].some((v: unknown) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [query.data, search]);

  const columns: Column<OrgRow>[] = [
    { key: "name", header: "Organization", sortable: true },
    { key: "organization_code", header: "Code", sortable: true },
    { key: "country", header: "Country", sortable: true },
    { key: "currency", header: "Currency" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
    { key: "created_at", header: "Registered", sortable: true, render: (r) => formatDate(r.created_at) },
  ];

  if (!isSupremeAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organizations" description="Restricted area." />
        <p className="panel p-6 text-sm text-muted-foreground">
          Only the platform owner can view the list of organizations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations" description="Every organization registered on this deployment." />
      <DataTable
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        error={query.isError ? friendlyError(query.error, "We couldn't load organizations.") : null}
        onRetry={() => void query.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations…"
        emptyTitle="No organizations yet"
        emptyDescription="Organizations appear here as soon as they register."
        getRowKey={(r) => String(r.id)}
      />
    </div>
  );
}
