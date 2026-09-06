import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/categories")({
  head: () => ({
    meta: [
      { title: "Item categories — StockFlow Africa" },
      { name: "description", content: "Organise inventory items into categories for reporting and control." },
      { property: "og:title", content: "Item categories — StockFlow Africa" },
      { property: "og:description", content: "Manage the category structure behind your inventory." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { can } = useAuth();
  return (
    <CrudPage
      title="Categories"
      description="Group items so reporting, reorder rules and stock reviews stay meaningful."
      entityLabel="Category"
      tableName="categories"
      searchKeys={["name", "code", "description"]}
      canManage={can("inventory.create")}
      emptyDescription="Categories such as Food, Cleaning, Stationery or Fuel keep your item list navigable."
      columns={[
        { key: "code", header: "Code", sortable: true, className: "w-32" },
        { key: "name", header: "Category", sortable: true },
        {
          key: "description",
          header: "Description",
          render: (row) => (row.description ? String(row.description) : "—"),
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.status)} />,
        },
        { key: "created_at", header: "Created", sortable: true, render: (row) => formatDate(row.created_at as string) },
      ]}
      fields={[
        { name: "code", label: "Category code", required: true, placeholder: "FOOD" },
        { name: "name", label: "Category name", required: true, placeholder: "Food & provisions" },
        { name: "description", label: "Description", type: "textarea" },
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
