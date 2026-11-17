import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareQuote, Plus, SearchX, Settings, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { toMediaSrc } from "@/lib/media-url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { TestimonialModal } from "../TestimonialModal";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useConfirmDelete } from "../use-confirm-delete";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";
import type { TestimonialRow } from "../admin-types";
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

const ID_PREFIX = "admin-testimonials";

const TESTIMONIAL_SORTS: Readonly<Record<string, (row: TestimonialRow) => SortValue>> = {
  created: (row) => row.created_at,
  name: (row) => row.name,
  rating: (row) => row.rating,
};

const SORT_OPTIONS = [
  { key: "created", label: "Date added" },
  { key: "name", label: "Name" },
  { key: "rating", label: "Rating" },
] as const;

function testimonialId(row: TestimonialRow): string {
  return row.id;
}

function testimonialSearchText(row: TestimonialRow): Array<string | null | undefined> {
  return [row.name, row.role, row.content];
}

type RatingBucket = "five" | "four" | "low" | "none";

function ratingBucket(row: TestimonialRow): RatingBucket {
  const rating = row.rating;
  if (typeof rating !== "number" || !Number.isFinite(rating)) return "none";
  if (rating >= 5) return "five";
  if (rating >= 4) return "four";
  return "low";
}

const RATING_BUCKETS: ReadonlyArray<{ value: RatingBucket; label: string }> = [
  { value: "five", label: "5 star" },
  { value: "four", label: "4 star" },
  { value: "low", label: "3 star and below" },
  { value: "none", label: "No rating set" },
];

function ratingBadge(rating: number | null): { text: string; tone: string; filled: boolean } {
  if (typeof rating !== "number" || !Number.isFinite(rating)) {
    return {
      text: "No rating — publishes as 5",
      tone: "bg-amber-500/15 text-amber-300",
      filled: false,
    };
  }
  return { text: `${rating} of 5`, tone: "bg-emerald-500/15 text-emerald-300", filled: true };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatAdded(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMAT.format(parsed);
}

export function TestimonialsTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [ratingFilter, setRatingFilter] = useState(ALL);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const {
    data: testimonials,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["testimonials-full"],
    queryFn: async (): Promise<TestimonialRow[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateTestimonials = useCallback(() => {
    void invalidateEntity(queryClient, "testimonials");
  }, [queryClient]);

  const deletion = useConfirmDelete<TestimonialRow>({
    remove: async (testimonial) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", testimonial.id);
      if (error) throw error;
    },
    onDeleted: (testimonial) => {
      invalidateTestimonials();
      toast.success(`"${testimonial.name}" deleted`);
    },
    errorFallback: "Could not delete this testimonial",
  });

  const ratingOptions = useMemo(() => {
    const present = new Set<RatingBucket>();
    for (const testimonial of testimonials ?? []) present.add(ratingBucket(testimonial));
    return [
      { value: ALL, label: "All ratings" },
      ...RATING_BUCKETS.filter(
        (bucket) => present.has(bucket.value) || bucket.value === ratingFilter,
      ),
    ];
  }, [testimonials, ratingFilter]);

  const filter = useCallback(
    (testimonial: TestimonialRow) =>
      ratingFilter === ALL || ratingBucket(testimonial) === ratingFilter,
    [ratingFilter],
  );

  const table = useAdminTable<TestimonialRow>({
    rows: testimonials,
    getId: testimonialId,
    getSearchText: testimonialSearchText,
    sorts: TESTIMONIAL_SORTS,
    initialSortKey: "created",

    initialSortDirection: "desc",
    filter,
    filterKey: ratingFilter,
    initialPageSize: 10,
  });

  const hasRefinements = ratingFilter !== ALL || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setRatingFilter(ALL);
    table.clearSearch();
  }, [table]);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]): Promise<number> => {
      const { error } = await supabase.from("testimonials").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      invalidateTestimonials();
      table.clearSelection();
      toast.success(`${count} ${count === 1 ? "testimonial" : "testimonials"} deleted`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected testimonials"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setIsModalOpen(true);
      }}
      className="min-h-11 cursor-pointer rounded-xl bg-emerald-600 px-6 font-bold transition-colors duration-200 hover:bg-emerald-700"
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Review
    </Button>
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Testimonials</h2>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Customer reviews shown on the homepage, newest first. A review stored without a rating
            publishes as five stars.
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
          entity="testimonials"
          error={error}
          consequence="The homepage customer stories section keeps serving its last good copy until this loads."
          onRetry={() => void refetch()}
        />
      ) : table.totalCount === 0 ? (
        <AdminTableEmpty
          icon={MessageSquareQuote}
          title="No testimonials yet"
          description="Add your first customer review and it will headline the homepage's customer stories section straight away."
          action={addButton}
        />
      ) : (
        <Card className="space-y-4 rounded-[2rem] border border-white/5 bg-slate-900/50 p-4 lg:p-6">
          <AdminTableToolbar
            idPrefix={ID_PREFIX}
            searchValue={table.search}
            onSearchChange={table.setSearch}
            onClearSearch={table.clearSearch}
            searchLabel="Search testimonials by name, role, or review text"
            searchPlaceholder="Search testimonials..."
            matchCount={table.matchCount}
            totalCount={table.totalCount}
            noun="testimonials"
            hasRefinements={hasRefinements}
            onClearRefinements={clearRefinements}
          >
            <AdminFilterSelect
              ariaLabel="Filter by rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={ratingOptions}
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
            noun="testimonial"
            onClearSelection={table.clearSelection}
          >
            <Button
              variant="destructive"
              disabled={bulkDelete.isPending}
              onClick={() => setIsBulkDeleteOpen(true)}
              className={ADMIN_ACTION_BUTTON}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Delete
            </Button>
          </AdminBulkActionBar>

          {table.isEmptyBecauseOfFilters ? (
            <AdminTableEmpty
              icon={SearchX}
              title="No testimonials match your filters"
              description="Every review is still here — the current search and rating filter just do not match any of them."
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
                noun="testimonials"
              />

              <ul className="grid gap-4">
                {table.pageRows.map((testimonial) => {
                  const selected = table.isRowSelected(testimonial.id);
                  const badge = ratingBadge(testimonial.rating);
                  const added = testimonial.created_at;
                  return (
                    <li key={testimonial.id}>
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
                            onCheckedChange={() => table.toggleRow(testimonial.id)}
                            aria-label={`Select ${testimonial.name}`}
                            className={`${ADMIN_CHECKBOX_CLASS} mt-1`}
                          />
                          {testimonial.avatar_url ? (
                            <img
                              src={toMediaSrc(testimonial.avatar_url)}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-black text-emerald-400"
                            >
                              {testimonial.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-black text-white">{testimonial.name}</h3>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${badge.tone}`}
                              >
                                <Star
                                  className={`h-3 w-3 ${badge.filled ? "fill-current" : ""}`}
                                  aria-hidden="true"
                                />
                                {badge.text}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {testimonial.role || "Customer"} • Added{" "}
                              {added === null ? (
                                "date unknown"
                              ) : (
                                <time dateTime={added}>{formatAdded(added)}</time>
                              )}
                            </p>

                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed font-medium text-slate-300">
                              {testimonial.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit the testimonial from ${testimonial.name}`}
                            onClick={() => {
                              setEditing(testimonial);
                              setIsModalOpen(true);
                            }}
                            className={`${ADMIN_ACTION_BUTTON} ${ADMIN_OUTLINE_BUTTON} min-w-11`}
                          >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`Delete the testimonial from ${testimonial.name}`}
                            onClick={() => deletion.request(testimonial)}
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
                noun="testimonials"
              />
            </>
          )}
        </Card>
      )}

      <TestimonialModal
        key={editing?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        testimonial={editing}
      />

      <ConfirmDeleteDialog
        open={deletion.pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) deletion.cancel();
        }}
        itemKind="testimonial"
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
        itemLabel={`${table.selectedCount} ${
          table.selectedCount === 1 ? "testimonial" : "testimonials"
        }`}
        isPending={bulkDelete.isPending}
        extraWarning="They also disappear from the homepage's customer stories section."
        onConfirm={() => bulkDelete.mutate(table.selectedIds)}
      />
    </div>
  );
}
