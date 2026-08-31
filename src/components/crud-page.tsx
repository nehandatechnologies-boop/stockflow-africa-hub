import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { friendlyError, table as db, writeAudit, type TableName } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "switch" | "email";
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: { value: string; label: string }[];
  optionsFrom?: { table: TableName; labelKey: string; orderBy?: string; activeOnly?: boolean };
  defaultValue?: string | number | boolean | null;
  createOnly?: boolean;
  full?: boolean;
}

type Row = Record<string, unknown>;

interface CrudPageProps {
  title: string;
  description: string;
  entityLabel: string;
  tableName: TableName;
  select?: string;
  orderBy?: string;
  columns: Column<Row>[];
  fields: FieldDef[];
  searchKeys: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  canManage: boolean;
  canDelete?: boolean;
}

export function CrudPage({
  title,
  description,
  entityLabel,
  tableName,
  select = "*",
  orderBy = "created_at",
  columns,
  fields,
  searchKeys,
  emptyTitle,
  emptyDescription,
  canManage,
  canDelete = true,
}: CrudPageProps) {
  const { organization, user } = useAuth();
  const orgId = organization?.id ?? null;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [tableName, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await db(tableName)
        .select(select)
        .eq("organization_id", orgId)
        .order(orderBy, { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const lookupTables = useMemo(
    () => [...new Set(fields.filter((f) => f.optionsFrom).map((f) => f.optionsFrom!.table))],
    [fields],
  );

  const lookupsQuery = useQuery({
    queryKey: ["lookups", tableName, orgId, lookupTables.join(",")],
    enabled: !!orgId && lookupTables.length > 0,
    queryFn: async () => {
      const result: Record<string, Row[]> = {};
      for (const name of lookupTables) {
        const { data, error } = await db(name).select("*").eq("organization_id", orgId);
        if (error) throw error;
        result[name] = (data ?? []) as Row[];
      }
      return result;
    },
  });

  const optionsFor = (field: FieldDef): { value: string; label: string }[] => {
    if (field.options) return field.options;
    if (!field.optionsFrom) return [];
    const rows = lookupsQuery.data?.[field.optionsFrom.table] ?? [];
    return rows
      .filter((r) => (field.optionsFrom!.activeOnly ? r.status !== "inactive" : true))
      .map((r) => ({ value: String(r.id), label: String(r[field.optionsFrom!.labelKey] ?? "Untitled") }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setForm(Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? (f.type === "switch" ? false : "")])));
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setFormError(null);
    setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? (f.type === "switch" ? false : "")])));
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        if (editing && field.createOnly) continue;
        const value = form[field.name];
        if (field.type === "number") {
          payload[field.name] = value === "" || value === null ? null : Number(value);
        } else if (field.type === "switch") {
          payload[field.name] = Boolean(value);
        } else {
          payload[field.name] = value === "" ? null : value;
        }
      }
      if (editing) {
        const { error } = await db(tableName).update(payload).eq("id", editing.id as string);
        if (error) throw error;
        await writeAudit({
          organizationId: orgId,
          userId: user?.id ?? null,
          action: "UPDATE",
          entityType: tableName,
          entityId: editing.id as string,
          before: editing,
          after: payload,
        });
        return;
      }
      const { data, error } = await db(tableName)
        .insert({ ...payload, organization_id: orgId })
        .select("id")
        .single();
      if (error) throw error;
      await writeAudit({
        organizationId: orgId,
        userId: user?.id ?? null,
        action: "CREATE",
        entityType: tableName,
        entityId: data?.id ?? null,
        after: payload,
      });
    },
    onSuccess: () => {
      toast.success(editing ? `${entityLabel} updated` : `${entityLabel} created`);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: [tableName, orgId] });
      void queryClient.invalidateQueries({ queryKey: ["lookups"] });
    },
    onError: (error) => {
      setFormError(
        friendlyError(error, `Unable to save this ${entityLabel.toLowerCase()}. Please check the required fields and try again.`),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await db(tableName).delete().eq("id", row.id as string);
      if (error) throw error;
      await writeAudit({
        organizationId: orgId,
        userId: user?.id ?? null,
        action: "DELETE_ATTEMPT",
        entityType: tableName,
        entityId: row.id as string,
        before: row,
      });
    },
    onSuccess: () => {
      toast.success(`${entityLabel} removed`);
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: [tableName, orgId] });
    },
    onError: (error) => {
      toast.error(friendlyError(error, `Unable to remove this ${entityLabel.toLowerCase()}.`));
      setDeleteTarget(null);
    },
  });

  const filtered = useMemo(() => {
    const rows = listQuery.data ?? [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)));
  }, [listQuery.data, search, searchKeys]);

  const missingRequired = fields.some(
    (f) => f.required && !(editing && f.createOnly) && (form[f.name] === "" || form[f.name] === null || form[f.name] === undefined),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> New {entityLabel.toLowerCase()}
            </Button>
          ) : null
        }
      />

      <DataTable<Row>
        columns={columns}
        rows={filtered}
        loading={listQuery.isLoading}
        error={listQuery.isError ? friendlyError(listQuery.error, "Please try again in a moment.") : null}
        onRetry={() => void listQuery.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        getRowKey={(row) => String(row.id)}
        emptyTitle={emptyTitle ?? `No ${title.toLowerCase()} yet`}
        emptyDescription={emptyDescription}
        emptyAction={
          canManage ? (
            <Button variant="outline" onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> Add your first {entityLabel.toLowerCase()}
            </Button>
          ) : null
        }
        rowActions={
          canManage
            ? (row) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${entityLabel}`} onClick={() => openEdit(row)}>
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${entityLabel}`}
                      onClick={() => setDeleteTarget(row)}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              )
            : undefined
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${entityLabel.toLowerCase()}` : `New ${entityLabel.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details below. Changes are recorded in the audit trail."
                : `Add a new ${entityLabel.toLowerCase()} to your organization.`}
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
          >
            {fields.map((field) => {
              const disabled = Boolean(editing && field.createOnly);
              const value = form[field.name];
              return (
                <div key={field.name} className={field.full || field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={`field-${field.name}`} className="mb-1.5 block">
                    {field.label}
                    {field.required ? <span className="text-destructive"> *</span> : null}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`field-${field.name}`}
                      value={String(value ?? "")}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                    />
                  ) : field.type === "switch" ? (
                    <div className="flex h-9 items-center">
                      <Switch
                        id={`field-${field.name}`}
                        checked={Boolean(value)}
                        disabled={disabled}
                        onCheckedChange={(checked) => setForm((f) => ({ ...f, [field.name]: checked }))}
                      />
                    </div>
                  ) : field.type === "select" ? (
                    <Select
                      value={value ? String(value) : undefined}
                      disabled={disabled}
                      onValueChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
                    >
                      <SelectTrigger id={`field-${field.name}`}>
                        <SelectValue placeholder={field.placeholder ?? "Select…"} />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsFor(field).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`field-${field.name}`}
                      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                      step={field.type === "number" ? "any" : undefined}
                      value={value === null || value === undefined ? "" : String(value)}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                    />
                  )}
                  {field.helper ? <p className="mt-1 text-xs text-muted-foreground">{field.helper}</p> : null}
                </div>
              );
            })}

            {formError ? (
              <p role="alert" className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || missingRequired}>
                {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : `Create ${entityLabel.toLowerCase()}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this {entityLabel.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is recorded in the audit trail. Records linked to stock history cannot be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
