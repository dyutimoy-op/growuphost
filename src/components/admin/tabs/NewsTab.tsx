import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Plus, SearchX, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { AlertModal } from "../AlertModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { NewsAlertRow } from "../admin-types";
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

const ID_PREFIX = "admin-news";

const CREATED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function createdEpoch(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function createdLabel(value: string | null): string {
  const epoch = createdEpoch(value);
  return epoch === null ? "Date added unknown" : `Added ${CREATED_FORMAT.format(epoch)}`;
}

const NEWS_SORTS: Readonly<Record<string, (row: NewsAlertRow) => SortValue>> = {
  created: (row) => createdEpoch(row.created_at),
  content: (row) => row.content,

  state: (row) => row.is_active ?? false,
};

const NEWS_SORT_OPTIONS = [
  { key: "created", label: "Date added" },
  { key: "content", label: "Content" },
  { key: "state", label: "State" },
] as const;

function newsAlertId(row: NewsAlertRow): string {
  return row.id;
}

function newsAlertSearchText(row: NewsAlertRow): Array<string | null | undefined> {
  return [row.content, row.badge_text, row.link_url];
}

function outranksForBanner(candidate: NewsAlertRow, current: NewsAlertRow): boolean {
  const candidateEpoch = createdEpoch(candidate.created_at);
  const currentEpoch = createdEpoch(current.created_at);
  if (candidateEpoch === null) return currentEpoch !== null;
  if (currentEpoch === null) return false;
  return candidateEpoch > currentEpoch;
}

function liveAlertIdOf(rows: readonly NewsAlertRow[]): string | null {
  let live: NewsAlertRow | null = null;
  for (const row of rows) {
    if (row.is_active !== true) continue;
    if (live === null || outranksForBanner(row, live)) live = row;
  }
  return live?.id ?? null;
}

function stateLabel(row: NewsAlertRow, isLive: boolean): { text: string; tone: string } {
  if (isLive) return { text: "Live in the banner", tone: "text-emerald-300" };
  if (row.is_active === true)
    return { text: "Active, but not the one shown", tone: "text-amber-300" };
  return { text: "Inactive", tone: "text-slate-400" };
}

export function NewsTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsAlertRow | null>(null);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: alerts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["news-alerts"],
    queryFn: async (): Promise<NewsAlertRow[]> => {
      const { data, error } = await supabase
        .from("news_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateAlerts = useCallback(() => {
    void invalidateEntity(queryClient, "news");
  }, [queryClient]);

  const deletion = useConfirmDelete<NewsAlertRow>({
    remove: async (alert) => {
      const { error } = await supabase.from("news_alerts").delete().eq("id", alert.id);
      if (error) throw error;
    },
    onDeleted: (alert) => {
      invalidateAlerts();
      toast.success(`"${alert.content}" deleted`);
    },
    errorFallback: "Could not delete this alert",
  });

  const liveAlertId = useMemo(() => liveAlertIdOf(alerts ?? []), [alerts]);

  const filter = useCallback(
    (alert: NewsAlertRow) => {
      if (stateFilter === "active") return alert.is_active === true;
      if (stateFilter === "inactive") return alert.is_active !== true;
      return true;
    },
    [stateFilter],
  );

  const table = useAdminTable<NewsAlertRow>({
    rows: alerts,
    getId: newsAlertId,
    getSearchText: newsAlertSearchText,
    sorts: NEWS_SORTS,
    initialSortKey: "created",

    initialSortDirection: "desc",
    filter,
    filterKey: stateFilter,
    initialPageSize: 10,
  });

  const hasRefinements = stateFilter !== ALL || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setStateFilter(ALL);
    table.clearSearch();
  }, [table]);

  const deactivateHidesBanner = useMemo(() => {
    if (liveAlertId === null) return false;
    const selected = new Set(table.selectedIds);
    if (!selected.has(liveAlertId)) return false;
    return !(alerts ?? []).some((alert) => alert.is_active === true && !selected.has(alert.id));
  }, [alerts, liveAlertId, table.selectedIds]);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase.from("news_alerts").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidateAlerts();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "alert" : "alerts"} deleted`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected alerts"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const bulkDeactivate = useMutation({
    mutationFn: async (input: { ids: string[]; hidesBanner: boolean }) => {
      const { error } = await supabase
        .from("news_alerts")
        .update({ is_active: false })
        .in("id", input.ids);
      if (error) throw error;
      return input;
    },
    onSuccess: (input) => {
      invalidateAlerts();
      table.clearSelection();
      const noun = input.ids.length === 1 ? "alert" : "alerts";
      toast.success(
        input.hidesBanner
          ? `${input.ids.length} ${noun} set to inactive — the site banner is now hidden`
          : `${input.ids.length} ${noun} set to inactive`,
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not deactivate the selected alerts"));
    },
  });

  const bulkBusy = bulkDelete.isPending || bulkDeactivate.isPending;

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-blue-600 px-6 font-bold transition-colors duration-200 hover:bg-blue-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Alert
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">News &amp; Alerts</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Only the newest active alert appears in the site-wide banner.
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
          entity="alerts"
          error={error}
          consequence="The public ticker keeps running whichever alert was already live until this loads."
          onRetry={() => void refetch()}
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={Bell}
          title="No alerts yet"
          description="Write one and it runs across the top of every page for as long as it is the newest active alert."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search alerts by message, badge, or link"
            searchPlaceholder="Search alerts..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="alerts"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
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
            noun="alert"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="outline"
              disabled={bulkBusy}
              onClick={() =>
                bulkDeactivate.mutate({
                  ids: table.selectedIds,
                  hidesBanner: deactivateHidesBanner,
                })
              }
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <BellOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Deactivate
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
              title="No alerts match your filters"
              description="Every alert you have written is still here — the current search and state filter just do not match any of them."
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
                  noun="alerts"
                />
                <AdminSortSelect
                  idPrefix={ID_PREFIX}
                  options={NEWS_SORT_OPTIONS}
                  sortKey={table.sortKey}
                  direction={table.sortDirection}
                  onToggle={table.toggleSort}
                />
              </div>

              <div className="grid gap-4">
                {table.pageRows.map((alert) => {
                  const selected = table.isRowSelected(alert.id);
                  const isLive = alert.id === liveAlertId;
                  const state = stateLabel(alert, isLive);
                  return (
                    <Card
                      key={alert.id}
                      data-state={selected ? "selected" : undefined}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 data-[state=selected]:border-blue-500/40 data-[state=selected]:bg-blue-500/10"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => table.toggleRow(alert.id)}
                          aria-label={`Select ${alert.content}`}
                          className={ADMIN_CHECKBOX_CLASS}
                        />

                        <span
                          aria-hidden="true"
                          className={
                            isLive
                              ? "h-2 w-2 shrink-0 rounded-full bg-emerald-500 motion-safe:animate-pulse"
                              : alert.is_active === true
                                ? "h-2 w-2 shrink-0 rounded-full bg-amber-400"
                                : "h-2 w-2 shrink-0 rounded-full bg-slate-500"
                          }
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-black tracking-widest text-blue-300 uppercase">
                              {alert.badge_text || "INFO"}
                            </span>
                            <h3 className="truncate font-black text-white">{alert.content}</h3>
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-slate-300">
                            <span className={state.tone}>{state.text}</span>
                            <span aria-hidden="true" className="text-slate-600">
                              &bull;
                            </span>
                            <span>{createdLabel(alert.created_at)}</span>
                            {alert.link_url ? (
                              <>
                                <span aria-hidden="true" className="text-slate-600">
                                  &bull;
                                </span>
                                <span className="max-w-xs truncate text-slate-400">
                                  {alert.link_url}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit alert: ${alert.content}`}
                          onClick={() => {
                            setEditing(alert);
                            setIsModalOpen(true);
                          }}
                          className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON} h-11 w-11`}
                        >
                          <Settings className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label={`Delete alert: ${alert.content}`}
                          onClick={() => deletion.request(alert)}
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
                noun="alerts"
              />
            </>
          )}
        </Card>
      )}

      <AlertModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        alert={editing}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="alert"
        itemLabel={deletion.pending?.content ?? ""}
        isPending={deletion.isPending}
        onConfirm={deletion.confirm}
      />

      <ConfirmDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
        }}
        itemKind="selection"
        itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "alert" : "alerts"}`}
        isPending={bulkDelete.isPending}
        extraWarning="If the alert currently in the banner is among them, it disappears from every page immediately."
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
