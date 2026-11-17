import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Eye, EyeOff, Link2, Plus, SearchX, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getNavLinks, mutateNavLinks } from "@/lib/nav-links.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { NavLinkModal } from "../NavLinkModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { NavLinkRow } from "../admin-types";
import { navLinkShowsOn } from "@/config/nav-links";
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

const ID_PREFIX = "admin-nav-links";

const NAV_LINK_SORTS: Readonly<Record<string, (row: NavLinkRow) => SortValue>> = {
  order: (row) => row.display_order,
  label: (row) => row.label,
  placement: (row) => row.placement,
  state: (row) => row.is_active,
};

const NAV_LINK_SORT_OPTIONS = [
  { key: "order", label: "Order" },
  { key: "label", label: "Link text" },
  { key: "placement", label: "Placement" },
  { key: "state", label: "State" },
] as const;

function navLinkId(row: NavLinkRow): string {
  return row.id;
}

function navLinkSearchText(row: NavLinkRow): Array<string | null | undefined> {
  return [row.label, row.url, row.placement];
}

function placementLabel(placement: string): string {
  if (placement === "header") return "Header";
  if (placement === "footer") return "Footer";
  if (placement === "both") return "Header + footer";
  if (placement === "topbar") return "Top bar";

  return placement;
}

const showsOn = navLinkShowsOn;

export function NavLinksTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<NavLinkRow | null>(null);
  const [placementFilter, setPlacementFilter] = useState(ALL);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: links,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["nav-links-admin"],

    queryFn: (): Promise<NavLinkRow[]> => getNavLinks(),
  });

  const applyWrite = useCallback(
    (next: NavLinkRow[]) => {
      queryClient.setQueryData<NavLinkRow[]>(["nav-links-admin"], next);
      queryClient.setQueryData<NavLinkRow[]>(
        ["nav-links"],
        next.filter((link) => link.is_active),
      );
      void invalidateEntity(queryClient, "navLinks");
    },
    [queryClient],
  );

  const deletion = useConfirmDelete<NavLinkRow>({
    remove: async (link) => {
      applyWrite(await mutateNavLinks({ data: { kind: "delete", ids: [link.id] } }));
    },
    onDeleted: (link) => {
      toast.success(`"${link.label}" deleted`);
    },
    errorFallback: "Could not delete this link",
  });

  const filter = useCallback(
    (link: NavLinkRow) => {
      if (placementFilter === "header" && !showsOn(link, "header")) return false;
      if (placementFilter === "footer" && !showsOn(link, "footer")) return false;
      if (placementFilter === "topbar" && !showsOn(link, "topbar")) return false;
      if (stateFilter === "active" && !link.is_active) return false;
      if (stateFilter === "inactive" && link.is_active) return false;
      return true;
    },
    [placementFilter, stateFilter],
  );

  const table = useAdminTable<NavLinkRow>({
    rows: links,
    getId: navLinkId,
    getSearchText: navLinkSearchText,
    sorts: NAV_LINK_SORTS,
    initialSortKey: "order",
    filter,

    filterKey: `${placementFilter}|${stateFilter}`,
    initialPageSize: 10,
  });

  const hasRefinements =
    placementFilter !== ALL || stateFilter !== ALL || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setPlacementFilter(ALL);
    setStateFilter(ALL);
    table.clearSearch();
  }, [table]);

  const activeCount = useMemo(() => (links ?? []).filter((link) => link.is_active).length, [links]);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      applyWrite(await mutateNavLinks({ data: { kind: "delete", ids } }));
      return ids.length;
    },
    onSuccess: (count) => {
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "link" : "links"} deleted`);
    },
    onError: (bulkError: unknown) => {
      toast.error(getErrorMessage(bulkError, "Could not delete the selected links"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const bulkSetActive = useMutation({
    mutationFn: async (input: { ids: string[]; isActive: boolean }) => {
      applyWrite(
        await mutateNavLinks({
          data: { kind: "setActive", ids: input.ids, isActive: input.isActive },
        }),
      );
      return input;
    },
    onSuccess: (input) => {
      table.clearSelection();
      const noun = input.ids.length === 1 ? "link" : "links";
      toast.success(
        input.isActive
          ? `${input.ids.length} ${noun} published`
          : `${input.ids.length} ${noun} hidden from the site`,
      );
    },
    onError: (bulkError: unknown) => {
      toast.error(getErrorMessage(bulkError, "Could not update the selected links"));
    },
  });

  const bulkBusy = bulkDelete.isPending || bulkSetActive.isPending;

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-blue-600 px-6 font-bold transition-colors duration-200 hover:bg-blue-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Link
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Header &amp; Footer</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Extra text links beside Packages and Contact, and in the footer&apos;s Company column.
            {activeCount > 0 ? ` ${activeCount} live right now.` : ""}
          </p>
        </div>
        {addButton}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }, (_unused, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-[2rem] border border-white/5 bg-slate-900/50"
            />
          ))}
        </div>
      ) : isError ? (
        <AdminTableError
          entity="links"
          error={error}
          consequence="The header and footer keep showing their built-in links until this screen can load."
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={Link2}
          title="No extra links yet"
          description="The header shows Packages and Contact, and the footer its standard columns. Anything you add here appears alongside them, in the same text style."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search links by text or destination"
            searchPlaceholder="Search links..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="links"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
            <AdminFilterSelect
              ariaLabel="Filter by placement"
              value={placementFilter}
              onChange={setPlacementFilter}
              options={[
                { value: ALL, label: "Anywhere" },
                { value: "header", label: "Shows in header" },
                { value: "footer", label: "Shows in footer" },
                { value: "topbar", label: "Shows in top bar" },
              ]}
            />
            <AdminFilterSelect
              ariaLabel="Filter by state"
              value={stateFilter}
              onChange={setStateFilter}
              options={[
                { value: ALL, label: "Active & inactive" },
                { value: "active", label: "Active only" },
                { value: "inactive", label: "Inactive only" },
              ]}
            />
          </AdminTableToolbar>

          <AdminBulkActionBar
            selectedCount={table.selectedCount}
            noun="link"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkSetActive.mutate({ ids: table.selectedIds, isActive: true })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Publish
            </Button>
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkSetActive.mutate({ ids: table.selectedIds, isActive: false })}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <EyeOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Hide
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
              title="No links match your filters"
              description="Every link you have added is still here — the current search, placement and state filters just do not match any of them."
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <AdminSelectAllControl
                  state={table.pageSelectionState}
                  onToggle={table.togglePageSelection}
                  pageRowCount={table.pageRows.length}
                  noun="links"
                />
                <AdminSortSelect
                  idPrefix={ID_PREFIX}
                  options={NAV_LINK_SORT_OPTIONS}
                  sortKey={table.sortKey}
                  direction={table.sortDirection}
                  onToggle={table.toggleSort}
                />
              </div>

              <div className="grid gap-4">
                {table.pageRows.map((link) => {
                  const selected = table.isRowSelected(link.id);
                  return (
                    <Card
                      key={link.id}
                      data-state={selected ? "selected" : undefined}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 data-[state=selected]:border-blue-500/40 data-[state=selected]:bg-blue-500/10"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => table.toggleRow(link.id)}
                          aria-label={`Select ${link.label}`}
                          className={ADMIN_CHECKBOX_CLASS}
                        />

                        <span
                          aria-hidden="true"
                          className={
                            link.is_active
                              ? "h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                              : "h-2 w-2 shrink-0 rounded-full bg-slate-500"
                          }
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-black tracking-widest text-blue-300 uppercase">
                              {placementLabel(link.placement)}
                            </span>
                            <h3 className="truncate font-black text-white">{link.label}</h3>
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-slate-300">
                            <span
                              className={link.is_active ? "text-emerald-300" : "text-slate-400"}
                            >
                              {link.is_active ? "Live on the site" : "Hidden"}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              &bull;
                            </span>
                            <span>Order {link.display_order}</span>
                            <span aria-hidden="true" className="text-slate-600">
                              &bull;
                            </span>
                            <span className="max-w-xs truncate text-slate-400">{link.url}</span>
                            {link.open_in_new_tab ? (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                New tab
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit link: ${link.label}`}
                          onClick={() => {
                            setEditing(link);
                            setIsModalOpen(true);
                          }}
                          className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON} h-11 w-11`}
                        >
                          <Settings className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label={`Delete link: ${link.label}`}
                          onClick={() => deletion.request(link)}
                          className={`${ADMIN_ACTION_BUTTON} h-11 w-11`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
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
                noun="links"
              />
            </>
          )}
        </Card>
      )}

      <NavLinkModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        navLink={editing}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="link"
        itemLabel={deletion.pending?.label ?? ""}
        isPending={deletion.isPending}
        onConfirm={deletion.confirm}
      />

      <ConfirmDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
        }}
        itemKind="selection"
        itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "link" : "links"}`}
        isPending={bulkDelete.isPending}
        extraWarning="Any of them that are active disappear from the header and footer immediately."
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
