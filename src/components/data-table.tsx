import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Inbox, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  /** Renders the cell. Falls back to the raw field value. */
  render?: (row: T) => ReactNode;
  /** Value used for client-side sorting when the column is not a plain field. */
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  filters?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  pageSize?: number;
  getRowKey: (row: T) => string;
  onRetry?: () => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  loading,
  error,
  searchPlaceholder = "Search…",
  search,
  onSearchChange,
  filters,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Records you create will appear in this list.",
  emptyAction,
  rowActions,
  pageSize = 10,
  getRowKey,
  onRetry,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = (row: T) => {
      const raw = col?.sortValue ? col.sortValue(row) : (row[sort.key] as string | number | null);
      return raw ?? "";
    };
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((prev) =>
      prev?.key === key ? (prev.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search records"
          />
        </div>
        {filters ? <div className="flex flex-wrap gap-2">{filters}</div> : null}
      </div>

      <div className="panel overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <TriangleAlert className="size-8 text-destructive" aria-hidden />
            <div>
              <p className="font-medium text-foreground">We couldn't load this list</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            ) : null}
          </div>
        ) : loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <div>
              <p className="font-medium text-foreground">{search ? "No matching records" : emptyTitle}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search ? "Try a different search term or clear your filters." : emptyDescription}
              </p>
            </div>
            {!search && emptyAction ? emptyAction : null}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", col.className)}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {col.header}
                          {sort?.key === col.key ? (
                            sort.dir === "asc" ? (
                              <ArrowUp className="size-3" aria-hidden />
                            ) : (
                              <ArrowDown className="size-3" aria-hidden />
                            )
                          ) : null}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                  {rowActions ? <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={getRowKey(row)} className="border-b border-border last:border-0 hover:bg-muted/40">
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                        {col.render ? col.render(row) : ((row[col.key] as ReactNode) ?? "—")}
                      </td>
                    ))}
                    {rowActions ? <td className="px-4 py-3 text-right">{rowActions(row)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            Showing {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Next <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
