import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/stores")({
  head: () => ({
    meta: [
      { title: "Stores — StockFlow Africa" },
      { name: "description", content: "Manage central and departmental stores holding your organization's stock." },
      { property: "og:title", content: "Stores — StockFlow Africa" },
      { property: "og:description", content: "Central store, departmental stores and warehouses in one register." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  const { can } = useAuth();
  return (
    <CrudPage
      title="Stores"
      description="Every stock balance belongs to a store. Central stores receive; departmental stores consume."
      entityLabel="Store"
      tableName="stores"
      searchKeys={["name", "code", "location"]}
      canManage={can("stores.manage")}
      emptyDescription="Create your central store first, then add departmental stores that draw from it."
      columns={[
        { key: "code", header: "Code", sortable: true, className: "w-32" },
        { key: "name", header: "Store", sortable: true },
        {
          key: "store_type",
          header: "Type",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.store_type)} tone="info" />,
        },
        { key: "location", header: "Location", render: (row) => String(row.location ?? "—") },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.status)} />,
        },
      ]}
      fields={[
        { name: "code", label: "Store code", required: true, placeholder: "CS-01" },
        { name: "name", label: "Store name", required: true, placeholder: "Central Store" },
        {
          name: "store_type",
          label: "Store type",
          type: "select",
          required: true,
          defaultValue: "departmental",
          options: [
            { value: "central", label: "Central store" },
            { value: "departmental", label: "Departmental store" },
            { value: "warehouse", label: "Warehouse" },
            { value: "transit", label: "Transit" },
          ],
        },
        {
          name: "department_id",
          label: "Linked department",
          type: "select",
          optionsFrom: { table: "departments", labelKey: "name", activeOnly: true },
          helper: "Leave empty for a central store or shared warehouse.",
        },
        { name: "location", label: "Location", placeholder: "Main campus, block B" },
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
