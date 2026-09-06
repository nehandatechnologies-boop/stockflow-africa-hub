import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — StockFlow Africa" },
      { name: "description", content: "Maintain the suppliers your organization receives goods from." },
      { property: "og:title", content: "Suppliers — StockFlow Africa" },
      { property: "og:description", content: "Contacts, payment terms and tax details for every supplier." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { can } = useAuth();
  return (
    <CrudPage
      title="Suppliers"
      description="Every goods receipt is traced back to a supplier record held here."
      entityLabel="Supplier"
      tableName="suppliers"
      searchKeys={["name", "supplier_code", "contact_person", "email", "phone"]}
      canManage={can("inventory.create")}
      emptyDescription="Add the vendors you buy provisions, fuel, cleaning and consumables from."
      columns={[
        { key: "supplier_code", header: "Code", sortable: true, className: "w-32" },
        { key: "name", header: "Supplier", sortable: true },
        { key: "contact_person", header: "Contact", render: (row) => String(row.contact_person ?? "—") },
        { key: "phone", header: "Phone", render: (row) => String(row.phone ?? "—") },
        { key: "payment_terms", header: "Terms", render: (row) => String(row.payment_terms ?? "—") },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={String(row.status)} />,
        },
      ]}
      fields={[
        { name: "supplier_code", label: "Supplier code", required: true, placeholder: "SUP-001" },
        { name: "name", label: "Supplier name", required: true },
        { name: "contact_person", label: "Contact person" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email", type: "email" },
        { name: "tax_number", label: "Tax number" },
        { name: "payment_terms", label: "Payment terms", placeholder: "30 days" },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "active",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
          ],
        },
        { name: "address", label: "Address", type: "textarea" },
      ]}
    />
  );
}
