import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StockFlow Africa" },
      { name: "description", content: "Review your profile, organization details and assigned roles." },
      { property: "og:title", content: "Settings — StockFlow Africa" },
      { property: "og:description", content: "Profile, organization and role information for your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, organization, roles } = useAuth();

  const rows: { label: string; value: string }[] = [
    { label: "Full name", value: profile?.full_name ?? "—" },
    { label: "Email", value: profile?.email ?? "—" },
    { label: "Organization", value: organization?.name ?? "—" },
    { label: "Organization code", value: organization?.code ?? "—" },
    { label: "Currency", value: organization?.currency ?? "—" },
    { label: "Roles", value: roles.join(", ") || "No role assigned" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile and organization details." />
      <div className="panel divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
