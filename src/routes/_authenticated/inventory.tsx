import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney, formatQty } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({
    meta: [
      { title: "Items — StockFlow Africa" },
      { name: "description", content: "The master item catalogue behind every stock movement in your organization." },
      { property: "og:title", content: "Items — StockFlow Africa" },
      { property: "og:description", content: "Codes, units, categories, reorder levels and costing for every item." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ItemsPage,
});

function ItemsPage() {
  const { can, organization } = useAuth();
  const currency = organization?.currency ?? "USD";

  return (
    <CrudPage
      title="Items"
      description="The master catalogue. Every receipt, issue and count references an item defined here."
      entityLabel="Item"
      tableName="items"
      searchKeys={["name", "item_code", "sku", "barcode", "description"]}
      canManage={can("inventory.manage")}
      emptyDescription="Add the goods you stock — provisions, consumables, fuel, equipment and spares."
      columns={[
        { key: "item_code", header: "Code", sortable: true, className: "w-32" },
        { key: "name", header: "Item", sortable: true },
        {
          key: "minimum_stock_level",
          header: "Min level",
          sortable: true,
          render: (row) => <span className="numeric">{formatQty(row.minimum_stock_level as number)}</span>,
        },
        {
          key: "reorder_level",
          header: "Reorder at",
          sortable: true,
          render: (row) => <span className="numeric">{formatQty(row.reorder_level as number)}</span>,
        },
        {
          key: "default_unit_cost",
          header: "Unit cost",
          sortable: true,
          render: (row) => <span className="numeric">{formatMoney(row.default_unit_cost as number, currency)}</span>,
        },
        {
          key: "active",
          header: "Status",
          sortable: true,
          render: (row) => <StatusBadge value={row.active ? "active" : "inactive"} />,
        },
      ]}
      fields={[
        { name: "item_code", label: "Item code", required: true, placeholder: "ITM-0001" },
        { name: "name", label: "Item name", required: true, placeholder: "Rice, long grain" },
        {
          name: "category_id",
          label: "Category",
          type: "select",
          optionsFrom: { table: "categories", labelKey: "name", activeOnly: true },
        },
        {
          name: "unit_of_measure_id",
          label: "Unit of measure",
          type: "select",
          optionsFrom: { table: "units_of_measure", labelKey: "name", activeOnly: true },
        },
        { name: "sku", label: "SKU" },
        { name: "barcode", label: "Barcode" },
        { name: "minimum_stock_level", label: "Minimum stock level", type: "number", defaultValue: 0 },
        { name: "reorder_level", label: "Reorder level", type: "number", defaultValue: 0 },
        { name: "maximum_stock_level", label: "Maximum stock level", type: "number" },
        {
          name: "default_unit_cost",
          label: `Default unit cost (${currency})`,
          type: "number",
          defaultValue: 0,
        },
        { name: "track_batch", label: "Track batch numbers", type: "switch", defaultValue: false },
        { name: "track_expiry", label: "Track expiry dates", type: "switch", defaultValue: false },
        { name: "track_serial_number", label: "Track serial numbers", type: "switch", defaultValue: false },
        { name: "active", label: "Active", type: "switch", defaultValue: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
