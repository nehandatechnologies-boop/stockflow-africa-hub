import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { friendlyError } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS, useAuth, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Users — StockFlow Africa" },
      { name: "description", content: "People in your organization and the roles assigned to them." },
      { property: "og:title", content: "Users — StockFlow Africa" },
      { property: "og:description", content: "Organization members, job titles and assigned roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsersPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserRow = any;

function UsersPage() {
  const { can, organization } = useAuth();
  const orgId = organization?.id ?? null;
  const [search, setSearch] = useState("");
  const allowed = can("users.manage");

  const query = useQuery({
    queryKey: ["org-users", orgId],
    enabled: allowed && !!orgId,
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, job_title, status, created_at")
          .eq("organization_id", orgId!)
          .order("created_at"),
        supabase.from("user_roles").select("user_id, role").eq("organization_id", orgId!),
      ]);
      if (profiles.error) throw profiles.error;
      if (roles.error) throw roles.error;

      const byUser = new Map<string, string[]>();
      for (const r of roles.data ?? []) {
        const list = byUser.get(r.user_id) ?? [];
        list.push(ROLE_LABELS[r.role as AppRole] ?? r.role);
        byUser.set(r.user_id, list);
      }
      return (profiles.data ?? []).map((p) => ({
        ...p,
        roles: (byUser.get(p.id) ?? []).join(", ") || "No role assigned",
      }));
    },
  });

  const rows = useMemo<UserRow[]>(() => {
    const all = query.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((r) =>
      [r.full_name, r.email, r.roles].some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [query.data, search]);

  const columns: Column<UserRow>[] = [
    { key: "full_name", header: "Name", sortable: true, render: (r) => r.full_name ?? "—" },
    { key: "email", header: "Email", sortable: true, render: (r) => r.email ?? "—" },
    { key: "job_title", header: "Job title", render: (r) => r.job_title ?? "—" },
    { key: "roles", header: "Roles", sortable: true },
    { key: "created_at", header: "Joined", sortable: true, render: (r) => formatDate(r.created_at) },
  ];

  if (!allowed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Restricted area." />
        <p className="panel p-6 text-sm text-muted-foreground">
          You do not have permission to manage people in this organization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Everyone who belongs to your organization, with the roles that control what they can do."
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        error={query.isError ? friendlyError(query.error, "We couldn't load your team.") : null}
        onRetry={() => void query.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search people or roles…"
        emptyTitle="No members yet"
        emptyDescription="Invite colleagues by sharing your organization code."
        getRowKey={(r) => String(r.id)}
      />
    </div>
  );
}
