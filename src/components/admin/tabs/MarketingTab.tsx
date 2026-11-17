import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  EyeOff,
  Megaphone,
  Plus,
  Radio,
  SearchX,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { sanitizeUrl } from "@/config/whmcs";
import { toMediaSrc } from "@/lib/media-url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { MarketingModal } from "../MarketingModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { PromoPopupRow } from "../admin-types";
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

const ID_PREFIX = "admin-marketing";

function couponCode(row: PromoPopupRow): string | null {
  const trimmed = (row.coupon_code ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createdAtMs(row: PromoPopupRow): number | null {
  if (row.created_at === null) return null;
  const parsed = Date.parse(row.created_at);
  return Number.isNaN(parsed) ? null : parsed;
}

const POPUP_SORTS: Readonly<Record<string, (row: PromoPopupRow) => SortValue>> = {
  created: createdAtMs,
  title: (row) => row.title,

  state: (row) => row.is_active === true,
};

const SORT_OPTIONS = [
  { key: "created", label: "Date created" },
  { key: "title", label: "Title" },
  { key: "state", label: "Active state" },
] as const;

function popupId(row: PromoPopupRow): string {
  return row.id;
}

function popupSearchText(row: PromoPopupRow): Array<string | null | undefined> {
  return [row.title, couponCode(row), row.description];
}

function outranks(candidate: PromoPopupRow, current: PromoPopupRow): boolean {
  const candidateMs = createdAtMs(candidate);
  const currentMs = createdAtMs(current);
  if (candidateMs === null) return currentMs !== null;
  if (currentMs === null) return false;
  return candidateMs > currentMs;
}

interface StateBadge {
  text: string;
  tone: string;
  icon: LucideIcon;
}

function stateBadge(row: PromoPopupRow, livePopupId: string | null): StateBadge {
  if (row.is_active !== true) {
    return { text: "Inactive", tone: "bg-slate-500/15 text-slate-300", icon: EyeOff };
  }
  if (row.id === livePopupId) {
    return { text: "Live now", tone: "bg-emerald-500/15 text-emerald-300", icon: Radio };
  }
  return {
    text: "Queued — a newer active popup wins",
    tone: "bg-amber-500/15 text-amber-300",
    icon: Clock,
  };
}

function ctaSummary(row: PromoPopupRow): string {
  const label = (row.cta_text ?? "").trim();
  const url = sanitizeUrl(row.cta_url, "");
  if (url.length === 0) {
    return `"${label.length > 0 ? label : "Got it"}" only closes the popup`;
  }
  return `"${label.length > 0 ? label : "Claim Offer"}" opens ${url}`;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatCreated(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMAT.format(parsed);
}

export function MarketingTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoPopupRow | null>(null);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [couponFilter, setCouponFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: popups,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["promo-popups"],
    queryFn: async (): Promise<PromoPopupRow[]> => {
      const { data, error } = await supabase
        .from("promo_popups")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidatePopups = useCallback(() => {
    void invalidateEntity(queryClient, "popups");
  }, [queryClient]);

  const deletion = useConfirmDelete<PromoPopupRow>({
    remove: async (popup) => {
      const { error } = await supabase.from("promo_popups").delete().eq("id", popup.id);
      if (error) throw error;
    },
    onDeleted: (popup) => {
      invalidatePopups();
      toast.success(`"${popup.title}" deleted`);
    },
    errorFallback: "Could not delete this popup",
  });

  const livePopupId = useMemo(() => {
    let live: PromoPopupRow | null = null;
    for (const popup of popups ?? []) {
      if (popup.is_active !== true) continue;
      if (live === null || outranks(popup, live)) live = popup;
    }
    return live?.id ?? null;
  }, [popups]);

  const filter = useCallback(
    (popup: PromoPopupRow) => {
      const active = popup.is_active === true;
      if (stateFilter === "active" && !active) return false;
      if (stateFilter === "inactive" && active) return false;
      const coupon = couponCode(popup) !== null;
      if (couponFilter === "with" && !coupon) return false;
      if (couponFilter === "without" && coupon) return false;
      return true;
    },
    [stateFilter, couponFilter],
  );

  const table = useAdminTable<PromoPopupRow>({
    rows: popups,
    getId: popupId,
    getSearchText: popupSearchText,
    sorts: POPUP_SORTS,
    initialSortKey: "created",

    initialSortDirection: "desc",
    filter,
    filterKey: `${stateFilter}|${couponFilter}`,
    initialPageSize: 10,
  });

  const hasRefinements =
    stateFilter !== ALL || couponFilter !== ALL || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setStateFilter(ALL);
    setCouponFilter(ALL);
    table.clearSearch();
  }, [table]);

  const activeSelectedIds = useMemo(
    () => table.selectedRows.filter((popup) => popup.is_active === true).map(popupId),
    [table.selectedRows],
  );

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase.from("promo_popups").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidatePopups();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "popup" : "popups"} deleted`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected popups"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const bulkDeactivate = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase
        .from("promo_popups")
        .update({ is_active: false })
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidatePopups();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "popup" : "popups"} deactivated`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not deactivate the selected popups"));
    },
  });

  const bulkBusy = bulkDelete.isPending || bulkDeactivate.isPending;

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-orange-600 px-6 font-bold transition-colors duration-200 hover:bg-orange-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create Popup
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Marketing Popups</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Visitors see one popup — the newest active one — a couple of seconds after the page
            loads. The other active ones stay hidden until it is switched off or deleted.
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
          entity="popups"
          error={error}
          consequence="Whichever promotion was already live keeps showing to visitors until this loads."
          onRetry={() => void refetch()}
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={Megaphone}
          title="No popups yet"
          description="Create your first promotion, switch it on, and it greets visitors shortly after the homepage loads."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search popups by title, coupon code, or description"
            searchPlaceholder="Search popups..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="popups"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
            <AdminFilterSelect
              ariaLabel="Filter by active state"
              value={stateFilter}
              onChange={setStateFilter}
              options={[
                { value: ALL, label: "Active & inactive" },
                { value: "active", label: "Active only" },
                { value: "inactive", label: "Inactive only" },
              ]}
            />
            <AdminFilterSelect
              ariaLabel="Filter by coupon code"
              value={couponFilter}
              onChange={setCouponFilter}
              options={[
                { value: ALL, label: "With & without coupon" },
                { value: "with", label: "Has a coupon" },
                { value: "without", label: "No coupon" },
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
            noun="popup"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="outline"
              disabled={bulkBusy || activeSelectedIds.length === 0}
              onClick={() => bulkDeactivate.mutate(activeSelectedIds)}
              className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON}`}
            >
              <EyeOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {activeSelectedIds.length === 0
                ? "None active"
                : `Deactivate ${activeSelectedIds.length}`}
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
              title="No popups match your filters"
              description="Every popup is still here — the current search, state, and coupon filters just do not match any of them."
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
                noun="popups"
              />

              <ul className="grid gap-4">
                {table.pageRows.map((popup) => {
                  const selected = table.isRowSelected(popup.id);
                  const badge = stateBadge(popup, livePopupId);
                  const BadgeIcon = badge.icon;
                  const coupon = couponCode(popup);
                  const created = popup.created_at;
                  return (
                    <li key={popup.id}>
                      <Card
                        className={`flex flex-wrap items-start justify-between gap-4 rounded-[2rem] border p-6 transition-colors duration-200 ${
                          selected
                            ? "border-blue-500/40 bg-blue-500/10"
                            : "border-white/5 bg-slate-900/50"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => table.toggleRow(popup.id)}
                            aria-label={`Select ${popup.title}`}
                            className={`${ADMIN_CHECKBOX_CLASS} mt-1`}
                          />
                          {popup.image_url ? (
                            <img
                              src={toMediaSrc(popup.image_url)}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-xl border border-white/5 object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/15"
                            >
                              <Megaphone className="h-5 w-5 text-orange-300" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-black text-white">{popup.title}</h3>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${badge.tone}`}
                              >
                                <BadgeIcon className="h-3 w-3" aria-hidden="true" />
                                {badge.text}
                              </span>
                              {coupon === null ? null : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-black text-blue-300">
                                  <Tag className="h-3 w-3" aria-hidden="true" />
                                  {coupon}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {created === null ? (
                                "Created date unknown"
                              ) : (
                                <>
                                  Created <time dateTime={created}>{formatCreated(created)}</time>
                                </>
                              )}
                              {coupon === null ? " • No coupon" : ""} • {ctaSummary(popup)}
                            </p>
                            {popup.description ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed font-medium text-slate-300">
                                {popup.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${popup.title}`}
                            onClick={() => {
                              setEditing(popup);
                              setIsModalOpen(true);
                            }}
                            className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON} min-w-11`}
                          >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`Delete ${popup.title}`}
                            onClick={() => deletion.request(popup)}
                            className={`${ADMIN_ACTION_BUTTON} min-w-11`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>

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
                noun="popups"
              />
            </>
          )}
        </Card>
      )}

      <MarketingModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        popup={editing}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="popup"
        itemLabel={deletion.pending?.title ?? ""}
        isPending={deletion.isPending}
        onConfirm={deletion.confirm}
      />

      <ConfirmDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
        }}
        itemKind="selection"
        itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "popup" : "popups"}`}
        isPending={bulkDelete.isPending}
        extraWarning="If the live popup is in the selection, the next-newest active one takes its place on the site immediately."
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
