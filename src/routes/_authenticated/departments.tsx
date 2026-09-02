import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({
    meta: [
      { title: "Departments — StockFlow Africa" },
      { name: "description", content: "Define the departments that requisition and consume stock." },
      { property: "og:title", content: "Departments — StockFlow Africa" },
      { property: "og:description", content: "Kitchen, poultry, maintenance, finance — cost centres for consumption." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { can } = useAuth();
  return (
    <CrudPage
      title="Departments"
      description="Departments are the cost centres that request stock and answer for consumption."
      entityLabel="Department"
      tableName="departments"
      searchKeys={["name", "code", "description"]}
      canManage={can("departments.manage")}
      emptyDescription="Add units such as Kitchen, Poultry, Maintenance, Boarding or Finance."
      columns={[
        { key: "code", header: "Code", sortable: true, className: "w-32" },
        { key: "name", header: "Department", sortable: true },
        { key: "description", header: "Description", render: (row) => String(row.description ?? "—") },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.status)} />,
        },
      ]}
      fields={[
        { name: "code", label: "Department code", required: true, placeholder: "KITCHEN" },
        { name: "name", label: "Department name", required: true, placeholder: "Kitchen" },
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
