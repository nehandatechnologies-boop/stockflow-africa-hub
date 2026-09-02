import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/units")({
  head: () => ({
    meta: [
      { title: "Units of measure — StockFlow Africa" },
      { name: "description", content: "Define the units your organization issues and receives stock in." },
      { property: "og:title", content: "Units of measure — StockFlow Africa" },
      { property: "og:description", content: "Kilograms, litres, boxes, crates — standardise how stock is counted." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnitsPage,
});

function UnitsPage() {
  const { can } = useAuth();
  return (
    <CrudPage
      title="Units of measure"
      description="Standardise how quantities are counted, issued and valued across every store."
      entityLabel="Unit"
      tableName="units_of_measure"
      searchKeys={["name", "abbreviation"]}
      canManage={can("inventory.manage")}
      emptyDescription="Add units such as Kilogram (kg), Litre (L), Box or Crate."
      columns={[
        { key: "abbreviation", header: "Symbol", sortable: true, className: "w-32" },
        { key: "name", header: "Unit", sortable: true },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.status)} />,
        },
      ]}
      fields={[
        { name: "name", label: "Unit name", required: true, placeholder: "Kilogram" },
        { name: "abbreviation", label: "Abbreviation", required: true, placeholder: "kg" },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "active",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        },
      ]}
    />
  );
}
