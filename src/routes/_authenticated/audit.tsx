import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { friendlyError } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — StockFlow Africa" },
      { name: "description", content: "Immutable record of every change made across your organization." },
      { property: "og:title", content: "Audit trail — StockFlow Africa" },
      { property: "og:description", content: "Who changed what, when and where — permanently recorded." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuditRow = any;

function AuditPage() {
  const { can, organization } = useAuth();
  const [search, setSearch] = useState("");
  const allowed = can("audit.view");

  const query = useQuery({
    queryKey: ["audit-logs", organization?.id],
    enabled: allowed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at, user_id, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as AuditRow[];
    },
  });

  const rows = useMemo(() => {
    const all = (query.data ?? []).map((r: AuditRow) => ({
      ...r,
      actor: String(r.profiles?.full_name ?? r.profiles?.email ?? "System"),
    }));
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((r: AuditRow) =>
      [r.action, r.entity_type, r.actor].some((v: unknown) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [query.data, search]);

  const columns: Column<AuditRow>[] = [
    { key: "created_at", header: "When", sortable: true, render: (r) => formatDateTime(r.created_at) },
    { key: "action", header: "Action", sortable: true, render: (r) => String(r.action).replaceAll("_", " ") },
    { key: "entity_type", header: "Record type", sortable: true, render: (r) => r.entity_type ?? "—" },
    { key: "actor", header: "Performed by", sortable: true },
  ];

  if (!allowed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit trail" description="Restricted area." />
        <p className="panel p-6 text-sm text-muted-foreground">
          You do not have permission to view the audit trail. Ask an organization administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit trail"
        description="Every create, change and stock movement is recorded permanently and cannot be edited or deleted."
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        error={query.isError ? friendlyError(query.error, "We couldn't load the audit trail.") : null}
        onRetry={() => void query.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search actions, record types or people…"
        emptyTitle="No audit records yet"
        emptyDescription="Actions performed in your organization will be listed here."
        getRowKey={(r) => String(r.id)}
        pageSize={20}
      />
    </div>
  );
}
