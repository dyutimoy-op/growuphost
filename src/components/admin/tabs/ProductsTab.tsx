import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Package, Plus, SearchX, Star, StarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { resolveProductUrl } from "@/config/whmcs";
import { formatPrice } from "@/components/sections/plan-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ProductModal } from "../ProductModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { ProductWithCategory } from "../admin-types";
import {
  ADMIN_ACTION_BUTTON,
  ADMIN_CHECKBOX_CLASS,
  ADMIN_OUTLINE_BUTTON,
  AdminBulkActionBar,
  AdminFilterSelect,
  AdminSortHeader,
  AdminTableEmpty,
  AdminTableError,
  AdminTablePagination,
  AdminTableToolbar,
} from "../admin-table-parts";
import { useAdminTable, type SortValue } from "../use-admin-table";

const ALL = "all";

const ID_PREFIX = "admin-products";

const NUMERIC_CELL = "px-3 py-3 text-right text-xs font-bold tabular-nums text-slate-200";

const PRODUCT_SORTS: Readonly<Record<string, (row: ProductWithCategory) => SortValue>> = {
  name: (row) => row.name,
  category: (row) => row.categories?.name ?? null,
  price: (row) => row.price,
  annual: (row) => row.annual_price,
  cycle: (row) => row.billing_cycle,
  order: (row) => row.display_order,
  featured: (row) => row.is_featured ?? false,
};

function productId(row: ProductWithCategory): string {
  return row.id;
}

function productSearchText(row: ProductWithCategory): Array<string | null | undefined> {
  return [row.name, row.description, row.categories?.name];
}

function destinationLabel(product: ProductWithCategory): { text: string; tone: string } {
  if (product.whmcs_link) return { text: "Custom URL", tone: "text-amber-300" };

  if (typeof product.whmcs_pid === "number") {
    return { text: `WHMCS pid ${product.whmcs_pid}`, tone: "text-emerald-400" };
  }
  return { text: "Not linked — falls back to the store", tone: "text-orange-400" };
}

export function ProductsTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [featuredFilter, setFeaturedFilter] = useState(ALL);
  const [cycleFilter, setCycleFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products-full"],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const invalidateProducts = useCallback(() => {
    void invalidateEntity(queryClient, "products");
  }, [queryClient]);

  const deletion = useConfirmDelete<ProductWithCategory>({
    remove: async (product) => {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
    },
    onDeleted: (product) => {
      invalidateProducts();
      toast.success(`"${product.name}" deleted`);
    },
    errorFallback: "Could not delete this product",
  });

  const filterOptions = useMemo(() => {
    const categories = new Map<string, string>();
    const cycles = new Set<string>();
    for (const product of products ?? []) {
      categories.set(product.category_id, product.categories?.name ?? "Uncategorised");
      cycles.add(product.billing_cycle);
    }
    return {
      categories: [...categories.entries()].sort((a, b) => a[1].localeCompare(b[1])),
      cycles: [...cycles].sort((a, b) => a.localeCompare(b)),
    };
  }, [products]);

  const filter = useCallback(
    (product: ProductWithCategory) => {
      if (categoryFilter !== ALL && product.category_id !== categoryFilter) return false;
      if (featuredFilter === "featured" && product.is_featured !== true) return false;
      if (featuredFilter === "standard" && product.is_featured === true) return false;
      if (cycleFilter !== ALL && product.billing_cycle !== cycleFilter) return false;
      return true;
    },
    [categoryFilter, featuredFilter, cycleFilter],
  );

  const table = useAdminTable<ProductWithCategory>({
    rows: products,
    getId: productId,
    getSearchText: productSearchText,
    sorts: PRODUCT_SORTS,
    initialSortKey: "order",
    filter,
    filterKey: `${categoryFilter}|${featuredFilter}|${cycleFilter}`,
    initialPageSize: 10,
  });

  const filtersActive = categoryFilter !== ALL || featuredFilter !== ALL || cycleFilter !== ALL;
  const hasRefinements = filtersActive || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setCategoryFilter(ALL);
    setFeaturedFilter(ALL);
    setCycleFilter(ALL);
    table.clearSearch();
  }, [table]);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidateProducts();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "product" : "products"} deleted`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected products"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const bulkFeature = useMutation({
    mutationFn: async (input: { ids: string[]; featured: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: input.featured })
        .in("id", input.ids);
      if (error) throw error;
      return input;
    },
    onSuccess: (input) => {
      invalidateProducts();
      const noun = input.ids.length === 1 ? "product" : "products";
      toast.success(
        input.featured
          ? `${input.ids.length} ${noun} marked as featured`
          : `${input.ids.length} ${noun} removed from featured`,
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not update the selected products"));
    },
  });

  const bulkBusy = bulkDelete.isPending || bulkFeature.isPending;

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-blue-600 px-6 font-bold transition-colors duration-200 hover:bg-blue-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Product
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Manage Products</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Each product links to its WHMCS counterpart by product ID, or to a custom URL.
          </p>
        </div>
        {addButton}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }, (_unused, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50"
            />
          ))}
        </div>
      ) : isError ? (
        <AdminTableError
          entity="products"
          error={error}
          consequence="The public plan grids keep serving their last good copy until this loads."
          onRetry={() => void refetch()}
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={Package}
          title="No products yet"
          description="Add your first hosting plan and it will appear on the site straight away."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search products by name, description, or category"
            searchPlaceholder="Search products..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="products"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
            <AdminFilterSelect
              ariaLabel="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: ALL, label: "All categories" },
                ...filterOptions.categories.map(([id, name]) => ({ value: id, label: name })),
              ]}
            />
            <AdminFilterSelect
              ariaLabel="Filter by featured state"
              value={featuredFilter}
              onChange={setFeaturedFilter}
              options={[
                { value: ALL, label: "Featured & standard" },
                { value: "featured", label: "Featured only" },
                { value: "standard", label: "Standard only" },
              ]}
            />
            <AdminFilterSelect
              ariaLabel="Filter by billing cycle"
              value={cycleFilter}
              onChange={setCycleFilter}
              options={[
                { value: ALL, label: "All cycles" },
                ...filterOptions.cycles.map((cycle) => ({ value: cycle, label: cycle })),
              ]}
            />
          </AdminTableToolbar>

          <AdminBulkActionBar
            selectedCount={table.selectedCount}
            noun="product"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkFeature.mutate({ ids: table.selectedIds, featured: true })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <Star className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Feature
            </Button>
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkFeature.mutate({ ids: table.selectedIds, featured: false })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <StarOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Unfeature
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
              title="No products match your filters"
              description="All your products are still here — the current search and filters just do not match any of them."
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="w-10 px-3">
                        <Checkbox
                          checked={
                            table.pageSelectionState === "all"
                              ? true
                              : table.pageSelectionState === "some"
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={() => table.togglePageSelection()}
                          disabled={table.pageRows.length === 0}
                          aria-label="Select every product on this page"
                          className={ADMIN_CHECKBOX_CLASS}
                        />
                      </TableHead>
                      <AdminSortHeader
                        label="Product"
                        columnKey="name"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                      />
                      <AdminSortHeader
                        label="Category"
                        columnKey="category"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        className="hidden md:table-cell"
                      />
                      <AdminSortHeader
                        label="Price"
                        columnKey="price"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        align="right"
                      />
                      <AdminSortHeader
                        label="Annual"
                        columnKey="annual"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        align="right"
                        className="hidden lg:table-cell"
                      />
                      <AdminSortHeader
                        label="Cycle"
                        columnKey="cycle"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        className="hidden lg:table-cell"
                      />
                      <AdminSortHeader
                        label="Order"
                        columnKey="order"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        align="right"
                        className="hidden xl:table-cell"
                      />
                      <AdminSortHeader
                        label="Featured"
                        columnKey="featured"
                        activeKey={table.sortKey}
                        direction={table.sortDirection}
                        onToggle={table.toggleSort}
                        className="hidden md:table-cell"
                      />
                      <TableHead className="px-3 text-right text-xs font-black tracking-widest text-slate-300 uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.pageRows.map((product) => {
                      const destination = resolveProductUrl(product);
                      const status = destinationLabel(product);
                      const selected = table.isRowSelected(product.id);
                      return (
                        <TableRow
                          key={product.id}
                          data-state={selected ? "selected" : undefined}
                          className="border-white/5 hover:bg-white/[0.03] data-[state=selected]:bg-blue-500/10"
                        >
                          <TableCell className="px-3">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => table.toggleRow(product.id)}
                              aria-label={`Select ${product.name}`}
                              className={ADMIN_CHECKBOX_CLASS}
                            />
                          </TableCell>
                          <TableCell className="max-w-xs px-3 py-3">
                            <p className="truncate font-black text-white">{product.name}</p>
                            <p className={`mt-0.5 text-xs font-bold ${status.tone}`}>
                              {status.text}
                            </p>
                          </TableCell>
                          <TableCell className="hidden px-3 py-3 text-xs font-bold text-slate-200 md:table-cell">
                            {product.categories?.name ?? "Uncategorised"}
                          </TableCell>
                          <TableCell className={NUMERIC_CELL}>
                            {formatPrice(product.price, product.currency)}
                          </TableCell>
                          <TableCell className={`${NUMERIC_CELL} hidden lg:table-cell`}>
                            {typeof product.annual_price === "number" ? (
                              formatPrice(product.annual_price, product.currency)
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden px-3 py-3 text-xs font-bold text-slate-200 lg:table-cell">
                            {product.billing_cycle}
                          </TableCell>
                          <TableCell className={`${NUMERIC_CELL} hidden xl:table-cell`}>
                            {product.display_order ?? <span className="text-slate-500">—</span>}
                          </TableCell>
                          <TableCell className="hidden px-3 py-3 md:table-cell">
                            {product.is_featured === true ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-black text-blue-300">
                                <Star className="h-3 w-3" aria-hidden="true" /> Featured
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500">Standard</span>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={destination}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open the buy destination for ${product.name} in a new tab`}
                                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-300 transition-colors duration-200 cursor-pointer hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="sr-only lg:not-sr-only">Test link</span>
                              </a>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditing(product);
                                  setIsModalOpen(true);
                                }}
                                aria-label={`Edit ${product.name}`}
                                className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                aria-label={`Delete ${product.name}`}
                                onClick={() => deletion.request(product)}
                                className={`${ADMIN_ACTION_BUTTON} min-w-11`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                noun="products"
              />
            </>
          )}
        </Card>
      )}

      <ProductModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={editing}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="product"
        itemLabel={deletion.pending?.name ?? ""}
        isPending={deletion.isPending}
        onConfirm={deletion.confirm}
      />

      <ConfirmDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
        }}
        itemKind="selection"
        itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "product" : "products"}`}
        isPending={bulkDelete.isPending}
        extraWarning="They disappear from every category page and the homepage immediately."
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
