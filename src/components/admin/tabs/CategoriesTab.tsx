import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Eye, EyeOff, Layers, Plus, SearchX, Settings, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { CategoryModal } from "../CategoryModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { CategoryRow } from "../admin-types";
import {
  ADMIN_ACTION_BUTTON,
  ADMIN_CHECKBOX_CLASS,
  ADMIN_OUTLINE_BUTTON,
  AdminBulkActionBar,
  AdminFilterSelect,
  AdminSelectAllControl,
  AdminSortSelect,
  AdminTableEmpty,
  AdminTableError,
  AdminTablePagination,
  AdminTableToolbar,
} from "../admin-table-parts";
import { useAdminTable, type SortValue } from "../use-admin-table";

const ALL = "all";

const ID_PREFIX = "admin-categories";

const BADGE = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black";

const CATEGORY_SORTS: Readonly<Record<string, (row: CategoryRow) => SortValue>> = {
  name: (row) => row.name,
  slug: (row) => row.slug,
  order: (row) => row.display_order,
  created: (row) => row.created_at,
};

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "slug", label: "URL slug" },
  { key: "order", label: "Display order" },
  { key: "created", label: "Date created" },
] as const;

function categoryId(row: CategoryRow): string {
  return row.id;
}

function categorySearchText(row: CategoryRow): Array<string | null | undefined> {
  return [row.name, row.slug, row.description];
}

function navState(
  row: CategoryRow,
  byId: ReadonlyMap<string, CategoryRow>,
): { label: string; tone: string; icon: LucideIcon } {
  if (row.show_in_nav === false) {
    return { label: "Hidden from nav", tone: "bg-white/5 text-slate-400", icon: EyeOff };
  }
  if (row.show_in_nav !== true) {
    return {
      label: "Nav flag unset — hidden",
      tone: "bg-amber-500/15 text-amber-300",
      icon: EyeOff,
    };
  }
  if (row.parent_id === null) {
    return { label: "In nav", tone: "bg-emerald-500/15 text-emerald-300", icon: Eye };
  }

  const parent = byId.get(row.parent_id);
  if (parent === undefined || parent.show_in_nav !== true) {
    return {
      label: "Parent hidden — not in nav",
      tone: "bg-amber-500/15 text-amber-300",
      icon: EyeOff,
    };
  }
  if (parent.parent_id !== null) {
    return {
      label: "Under a subcategory — not in nav",
      tone: "bg-amber-500/15 text-amber-300",
      icon: EyeOff,
    };
  }
  return { label: "In parent's dropdown", tone: "bg-emerald-500/15 text-emerald-300", icon: Eye };
}

function hierarchyLabel(row: CategoryRow, byId: ReadonlyMap<string, CategoryRow>): string {
  if (row.parent_id === null) return "Top level";
  return `Under ${byId.get(row.parent_id)?.name ?? "another category"}`;
}

function categoryHref(slug: string): string {
  return `/${slug.trim().replace(/^\/+/, "")}`;
}

function countCascadedBelow(
  roots: readonly string[],
  childIdsByParent: ReadonlyMap<string, string[]>,
): number {
  const seen = new Set(roots);
  const queue = [...roots];
  let cascaded = 0;
  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) break;
    for (const childId of childIdsByParent.get(current) ?? []) {
      if (seen.has(childId)) continue;
      seen.add(childId);
      queue.push(childId);
      cascaded += 1;
    }
  }
  return cascaded;
}

export function CategoriesTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [navFilter, setNavFilter] = useState(ALL);
  const [levelFilter, setLevelFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories-full"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const invalidateCategories = useCallback(() => {
    void invalidateEntity(queryClient, "categories");
  }, [queryClient]);

  const childIdsByParent = useMemo(() => {
    const index = new Map<string, string[]>();
    for (const candidate of categories ?? []) {
      const parentId = candidate.parent_id;
      if (parentId === null) continue;
      const siblings = index.get(parentId);
      if (siblings === undefined) index.set(parentId, [candidate.id]);
      else siblings.push(candidate.id);
    }
    return index;
  }, [categories]);

  const byId = useMemo(() => {
    const index = new Map<string, CategoryRow>();
    for (const candidate of categories ?? []) index.set(candidate.id, candidate);
    return index;
  }, [categories]);

  const childCount = (parentId: string): number => (childIdsByParent.get(parentId) ?? []).length;

  const deletion = useConfirmDelete<CategoryRow>({
    remove: async (category) => {
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onDeleted: (category) => {
      invalidateCategories();
      toast.success(`"${category.name}" deleted`);
    },
    errorFallback: "Could not delete this category",
  });

  const pendingChildren = deletion.pending ? childCount(deletion.pending.id) : 0;

  const pendingBelow = deletion.pending
    ? countCascadedBelow([deletion.pending.id], childIdsByParent)
    : 0;

  const filter = useCallback(
    (category: CategoryRow) => {
      if (navFilter === "shown" && category.show_in_nav !== true) return false;
      if (navFilter === "hidden" && category.show_in_nav === true) return false;
      if (levelFilter === "top" && category.parent_id !== null) return false;
      if (levelFilter === "sub" && category.parent_id === null) return false;
      return true;
    },
    [navFilter, levelFilter],
  );

  const table = useAdminTable<CategoryRow>({
    rows: categories,
    getId: categoryId,
    getSearchText: categorySearchText,
    sorts: CATEGORY_SORTS,

    initialSortKey: "name",
    filter,
    filterKey: `${navFilter}|${levelFilter}`,
    initialPageSize: 10,
  });

  const filtersActive = navFilter !== ALL || levelFilter !== ALL;
  const hasRefinements = filtersActive || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setNavFilter(ALL);
    setLevelFilter(ALL);
    table.clearSearch();
  }, [table]);

  const bulkDeleteWarning = useMemo(() => {
    const stranded = countCascadedBelow(table.selectedIds, childIdsByParent);
    const products = "Every product inside the selected categories is deleted with them.";
    if (stranded === 0) return products;
    const clause =
      stranded === 1
        ? "1 subcategory you did not select sits below the selection and is deleted as well, with its own products"
        : `${stranded} subcategories you did not select sit below the selection and are deleted as well, with their own products`;
    return `${clause}. ${products}`;
  }, [childIdsByParent, table.selectedIds]);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase.from("categories").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidateCategories();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "category" : "categories"} deleted`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected categories"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const bulkNav = useMutation({
    mutationFn: async (input: { ids: string[]; showInNav: boolean }) => {
      const { error } = await supabase
        .from("categories")
        .update({ show_in_nav: input.showInNav })
        .in("id", input.ids);
      if (error) throw error;
      return input;
    },

    onSuccess: (input) => {
      invalidateCategories();
      const noun = input.ids.length === 1 ? "category" : "categories";

      toast.success(
        input.showInNav
          ? `${input.ids.length} ${noun} marked to show in the nav`
          : `${input.ids.length} ${noun} hidden from the nav`,
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not update the selected categories"));
    },
  });

  const bulkBusy = bulkDelete.isPending || bulkNav.isPending;

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-blue-600 px-6 font-bold transition-colors duration-200 hover:bg-blue-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Category
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Manage Categories</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Categories become public pages and drive the site navigation.
          </p>
        </div>
        {addButton}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_unused, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[2rem] border border-white/5 bg-slate-900/50"
            />
          ))}
        </div>
      ) : isError ? (
        <AdminTableError
          entity="categories"
          error={error}
          consequence="The public navigation and category pages keep serving their last good copy until this loads."
          onRetry={() => void refetch()}
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={Layers}
          title="No categories yet"
          description="Add your first category — it becomes a public page straight away and can appear in the site navigation."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search categories by name, slug, or description"
            searchPlaceholder="Search categories..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="categories"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
            <AdminFilterSelect
              ariaLabel="Filter by navigation visibility"
              value={navFilter}
              onChange={setNavFilter}
              options={[
                { value: ALL, label: "Shown & hidden" },
                { value: "shown", label: "Shown in nav" },
                { value: "hidden", label: "Hidden from nav" },
              ]}
            />
            <AdminFilterSelect
              ariaLabel="Filter by hierarchy level"
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: ALL, label: "All levels" },
                { value: "top", label: "Top level only" },
                { value: "sub", label: "Subcategories only" },
              ]}
            />
            <AdminSortSelect
              idPrefix={ID_PREFIX}
              options={SORT_OPTIONS}
              sortKey={table.sortKey}
              direction={table.sortDirection}
              onToggle={table.toggleSort}
            />
          </AdminTableToolbar>

          <AdminBulkActionBar
            selectedCount={table.selectedCount}
            noun="category"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkNav.mutate({ ids: table.selectedIds, showInNav: true })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Show in nav
            </Button>
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkNav.mutate({ ids: table.selectedIds, showInNav: false })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <EyeOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Hide from nav
            </Button>
            <Button
              variant="destructive"
              disabled={bulkBusy}
              onClick={() => setIsBulkDeleteOpen(true)}
              className={ADMIN_ACTION_BUTTON}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Delete
            </Button>
          </AdminBulkActionBar>

          {table.isEmptyBecauseOfFilters ? (
            <AdminTableEmpty
              icon={SearchX}
              title="No categories match your filters"
              description="All your categories are still here — the current search and filters just do not match any of them."
              action={
                <Button
                  variant="outline"
                  onClick={clearRefinements}
                  className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <AdminSelectAllControl
                state={table.pageSelectionState}
                onToggle={table.togglePageSelection}
                pageRowCount={table.pageRows.length}
                noun="categories"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {table.pageRows.map((category) => {
                  const selected = table.isRowSelected(category.id);
                  const badge = navState(category, byId);
                  const NavIcon = badge.icon;
                  const subCount = childCount(category.id);
                  return (
                    <Card
                      key={category.id}
                      className={`rounded-[2rem] border p-6 transition-colors duration-200 ${
                        selected
                          ? "border-blue-500/40 bg-blue-500/10"
                          : "border-white/5 bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => table.toggleRow(category.id)}
                            aria-label={`Select ${category.name}`}
                            className={`${ADMIN_CHECKBOX_CLASS} mt-1.5 shrink-0`}
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black text-white">
                              {category.name}
                            </h3>
                            <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                              {categoryHref(category.slug)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={`${BADGE} bg-white/5 text-slate-300`}>
                                {hierarchyLabel(category, byId)}
                              </span>
                              <span className={`${BADGE} ${badge.tone}`}>
                                <NavIcon className="h-3 w-3" aria-hidden="true" />
                                {badge.label}
                              </span>
                              {category.display_order !== null && (
                                <span className={`${BADGE} bg-white/5 text-slate-300`}>
                                  Order {category.display_order}
                                </span>
                              )}
                              {subCount > 0 && (
                                <span className={`${BADGE} bg-white/5 text-slate-300`}>
                                  {subCount} {subCount === 1 ? "subcategory" : "subcategories"}
                                </span>
                              )}

                              <a
                                href={categoryHref(category.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View page for ${category.name} — opens in a new tab`}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-blue-300 transition-colors duration-200 cursor-pointer hover:bg-white/5 hover:text-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                View page
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => {
                              setEditing(category);
                              setIsModalOpen(true);
                            }}
                            className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON} h-11 w-11`}
                          >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`Delete ${category.name}`}
                            onClick={() => deletion.request(category)}
                            className={`${ADMIN_ACTION_BUTTON} h-11 w-11`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <AdminTablePagination
                idPrefix={ID_PREFIX}
                page={table.page}
                pageCount={table.pageCount}
                pageItems={table.pageItems}
                onPageChange={table.goToPage}
                pageSize={table.pageSize}
                onPageSizeChange={table.setPageSize}
                rangeStart={table.rangeStart}
                rangeEnd={table.rangeEnd}
                matchCount={table.matchCount}
                noun="categories"
              />
            </>
          )}
        </Card>
      )}

      <CategoryModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={editing}
        allCategories={categories ?? []}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="category"
        itemLabel={deletion.pending?.name ?? ""}
        isPending={deletion.isPending}
        extraWarning={
          pendingBelow > pendingChildren
            ? `${pendingBelow} categories below this one — and every product in them — are deleted with it.`
            : pendingChildren > 0
              ? `${pendingChildren} subcategor${pendingChildren === 1 ? "y" : "ies"} and every product below this category are deleted with it.`
              : "Every product assigned to this category is deleted with it."
        }
        onConfirm={deletion.confirm}
      />

      <ConfirmDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
        }}
        itemKind="selection"
        itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "category" : "categories"}`}
        isPending={bulkDelete.isPending}
        extraWarning={bulkDeleteWarning}
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
