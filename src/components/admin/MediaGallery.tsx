import { useCallback, useId, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, Film, Image as ImageIcon, SearchX, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MediaUpload } from "./MediaUpload";
import { UsagePreview } from "./UsagePreview";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import type { MediaLibraryRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { MEDIA_BUCKET, formatFileSize, getErrorMessage } from "./admin-utils";
import { mediaObjectPath, toMediaSrc } from "@/lib/media-url";
import {
  ADMIN_ACTION_BUTTON,
  ADMIN_CHECKBOX_CLASS,
  ADMIN_OUTLINE_BUTTON,
  AdminBulkActionBar,
  AdminFilterSelect,
  AdminSelectAllControl,
  AdminSortSelect,
  AdminTableEmpty,
  AdminTablePagination,
  AdminTableToolbar,
} from "./admin-table-parts";
import { useAdminTable, type SortValue } from "./use-admin-table";

interface MediaGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

type DeleteOutcome = "file-and-row" | "row-only" | "file-already-gone";

interface BulkDeleteResult {
  deleted: number;
  failed: string[];

  reason: string;
}

const ALL = "all";

const ID_PREFIX = "admin-media";

const MEDIA_SORTS: Readonly<Record<string, (row: MediaLibraryRow) => SortValue>> = {
  created: (row) => row.created_at,
  filename: (row) => row.filename,
  size: (row) => row.file_size,
};

const MEDIA_SORT_OPTIONS = [
  { key: "created", label: "Date added" },
  { key: "filename", label: "Filename" },
  { key: "size", label: "File size" },
] as const;

function mediaId(row: MediaLibraryRow): string {
  return row.id;
}

function mediaSearchText(row: MediaLibraryRow): Array<string | null | undefined> {
  return [row.filename, row.file_type];
}

type AssetKind = "image" | "video" | "other";

const ASSET_KINDS = ["image", "video", "other"] as const;

const KIND_FILTER_LABELS: Readonly<Record<AssetKind, string>> = {
  image: "Images only",
  video: "Video only",
  other: "Other files only",
};

function assetKind(row: MediaLibraryRow): AssetKind {
  const fileType = row.file_type ?? "";
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  return "other";
}

function formatAddedDate(value: string | null): string {
  if (value === null) return "Date unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unknown";
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatAssetSize(bytes: number | null): string {
  return typeof bytes === "number" && bytes > 0 ? formatFileSize(bytes) : "Size unknown";
}

async function removeAsset(item: MediaLibraryRow): Promise<DeleteOutcome> {
  const objectPath = mediaObjectPath(item.url);

  if (objectPath === null) {
    const { error } = await supabase.from("media_library").delete().eq("id", item.id);
    if (error) throw error;
    return "row-only";
  }

  const { data: removed, error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([objectPath]);

  if (storageError) {
    throw new Error(
      `The file could not be deleted from storage, so the library entry was kept: ${storageError.message}`,
    );
  }

  const fileWasAlreadyGone = (removed ?? []).length === 0;

  const { error: rowError } = await supabase.from("media_library").delete().eq("id", item.id);
  if (rowError) {
    throw new Error(
      `The file was deleted from storage but the library entry could not be removed: ${rowError.message}. Reload and try again.`,
    );
  }

  return fileWasAlreadyGone ? "file-already-gone" : "file-and-row";
}

const DELETE_WARNING =
  "The file is deleted from storage as well, so anywhere it is still used will show a broken image. Check Usage first.";

const BULK_DELETE_WARNING =
  "Every file is deleted from storage as well, so any page still using one will show a broken image. Check Usage on anything you are unsure about first.";

export function MediaGallery({
  open,
  onOpenChange,
  onSelect,
  title = "Media Gallery",
}: MediaGalleryProps) {
  const [selectedForUsage, setSelectedForUsage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaLibraryRow | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState(ALL);
  const queryClient = useQueryClient();

  const idPrefix = `${ID_PREFIX}-${useId()}`;

  const {
    data: mediaItems,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["media-library"],
    queryFn: async (): Promise<MediaLibraryRow[]> => {
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const invalidateMedia = useCallback(() => {
    void invalidateEntity(queryClient, "media");
  }, [queryClient]);

  const deleteMedia = useMutation({
    mutationFn: removeAsset,
    onSuccess: (outcome, item) => {
      invalidateMedia();
      if (outcome === "file-and-row") {
        toast.success(`"${item.filename}" deleted from storage and the library`);
      } else if (outcome === "file-already-gone") {
        toast.success(`"${item.filename}" removed — the file was already missing from storage`);
      } else {
        toast.success(
          `"${item.filename}" removed from the library (externally hosted file left alone)`,
        );
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete this media item"));
    },
    onSettled: () => {
      setPendingDelete(null);
    },
  });

  const availableKinds = useMemo(() => {
    const present = new Set<AssetKind>();
    for (const item of mediaItems ?? []) present.add(assetKind(item));
    return ASSET_KINDS.filter((kind) => present.has(kind));
  }, [mediaItems]);

  const filter = useCallback(
    (item: MediaLibraryRow) => kindFilter === ALL || assetKind(item) === kindFilter,
    [kindFilter],
  );

  const table = useAdminTable<MediaLibraryRow>({
    rows: mediaItems,
    getId: mediaId,
    getSearchText: mediaSearchText,
    sorts: MEDIA_SORTS,
    initialSortKey: "created",

    initialSortDirection: "desc",
    filter,
    filterKey: kindFilter,
    initialPageSize: 25,
  });

  const hasRefinements = kindFilter !== ALL || table.search.trim().length > 0;

  const clearRefinements = useCallback(() => {
    setKindFilter(ALL);
    table.clearSearch();
  }, [table]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) table.clearSelection();
      onOpenChange(nextOpen);
    },
    [onOpenChange, table],
  );

  const bulkDelete = useMutation({
    mutationFn: async (items: MediaLibraryRow[]): Promise<BulkDeleteResult> => {
      let deleted = 0;
      const failed: string[] = [];
      let reason = "";
      for (const item of items) {
        try {
          await removeAsset(item);
          deleted += 1;
        } catch (error: unknown) {
          failed.push(item.filename);

          if (reason.length === 0) reason = getErrorMessage(error, "");
        }
      }

      if (deleted === 0 && failed.length > 0) {
        throw new Error(
          `None of the ${failed.length} selected assets could be deleted. They are all still in the library.` +
            (reason.length > 0 ? ` ${reason}` : ""),
        );
      }
      return { deleted, failed, reason };
    },
    onSuccess: (result) => {
      invalidateMedia();
      table.clearSelection();
      if (result.deleted > 0) {
        toast.success(
          `${result.deleted} ${result.deleted === 1 ? "asset" : "assets"} deleted from storage and the library`,
        );
      }
      if (result.failed.length > 0) {
        const shown = result.failed.slice(0, 3).join(", ");
        const remaining = Math.max(0, result.failed.length - 3);
        toast.error(
          `${result.failed.length} could not be deleted and are still in the library: ${shown}${
            remaining > 0 ? ` and ${remaining} more` : ""
          }.${result.reason.length > 0 ? ` ${result.reason}` : ""}`,
        );
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not delete the selected assets"));
    },
    onSettled: () => setIsBulkDeleteOpen(false),
  });

  const hasAssets = !isLoading && !isError && table.totalCount > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl flex flex-col p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tighter text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Upload new media or select from your existing library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 p-6 pb-4">
            <MediaUpload path="gallery" label="New Media" onUploadComplete={invalidateMedia} />

            {hasAssets && (
              <>
                <AdminTableToolbar
                  idPrefix={idPrefix}
                  searchValue={table.search}
                  onSearchChange={table.setSearch}
                  onClearSearch={table.clearSearch}
                  searchLabel="Search the library by filename or file type"
                  searchPlaceholder="Search assets..."
                  matchCount={table.matchCount}
                  totalCount={table.totalCount}
                  noun="assets"
                  hasRefinements={hasRefinements}
                  onClearRefinements={clearRefinements}
                >
                  <AdminFilterSelect
                    ariaLabel="Filter by asset kind"
                    value={kindFilter}
                    onChange={setKindFilter}
                    options={[
                      { value: ALL, label: "All asset kinds" },
                      ...availableKinds.map((kind) => ({
                        value: kind,
                        label: KIND_FILTER_LABELS[kind],
                      })),
                    ]}
                  />
                  <AdminSortSelect
                    idPrefix={idPrefix}
                    options={MEDIA_SORT_OPTIONS}
                    sortKey={table.sortKey}
                    direction={table.sortDirection}
                    onToggle={table.toggleSort}
                  />
                </AdminTableToolbar>

                {!table.isEmptyBecauseOfFilters && (
                  <AdminSelectAllControl
                    state={table.pageSelectionState}
                    onToggle={table.togglePageSelection}
                    pageRowCount={table.pageRows.length}
                    noun="assets"
                  />
                )}

                <AdminBulkActionBar
                  selectedCount={table.selectedCount}
                  noun="asset"
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
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }, (_unused, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-white/5 animate-pulse rounded-xl border border-white/5"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" aria-hidden="true" />

                <p role="alert" className="text-slate-300 font-bold">
                  Could not load the media library
                </p>
                <p className="text-slate-400 text-sm font-medium mt-1 mb-5">
                  Something went wrong fetching your uploads.
                </p>
                <Button
                  onClick={() => void refetch()}
                  className="h-11 px-5 text-xs font-black bg-blue-500 text-white hover:bg-blue-400 rounded-lg"
                >
                  Try again
                </Button>
              </div>
            ) : table.totalCount === 0 ? (
              <AdminTableEmpty
                icon={ImageIcon}
                title="No assets yet"
                description="Drop an image, GIF, or video onto the uploader above and it lands here, ready to use anywhere on the site."
              />
            ) : table.isEmptyBecauseOfFilters ? (
              <AdminTableEmpty
                icon={SearchX}
                title="No assets match your filters"
                description="Every upload is still here — the current search and kind filter just do not match any of them."
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {table.pageRows.map((item) => {
                  const selected = table.isRowSelected(item.id);
                  return (
                    <div key={item.id} className="space-y-2">
                      <div
                        className={`group relative aspect-square overflow-hidden rounded-xl bg-slate-950 border transition-colors duration-200 ${
                          selected
                            ? "border-blue-500 ring-2 ring-blue-500/60"
                            : "border-white/5 hover:border-blue-500"
                        }`}
                      >
                        {item.file_type?.startsWith("image/") ? (
                          <img
                            src={toMediaSrc(item.url)}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : item.file_type?.startsWith("video/") ? (
                          <div className="w-full h-full flex items-center justify-center bg-blue-500/10">
                            <Film className="w-8 h-8 text-blue-400" aria-hidden="true" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                            <FileText className="w-8 h-8 text-slate-400" aria-hidden="true" />
                          </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-blue-600/90 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:top-auto [@media(hover:none)]:flex-row [@media(hover:none)]:gap-1.5 [@media(hover:none)]:bg-slate-950/85 [@media(hover:none)]:p-1.5 [@media(hover:none)]:opacity-100">
                          <Button
                            aria-label={`Use ${item.filename}`}
                            onClick={() => {
                              onSelect(item.url);
                              handleOpenChange(false);
                            }}
                            className="min-h-11 w-full max-w-32 cursor-pointer rounded-lg bg-white px-3 text-xs font-black text-blue-700 transition-colors duration-200 hover:bg-slate-100 [@media(hover:none)]:max-w-none [@media(hover:none)]:flex-1 [@media(hover:none)]:px-2"
                          >
                            SELECT
                          </Button>
                          <Button
                            aria-label={`Check where ${item.filename} is used`}
                            onClick={() => setSelectedForUsage(item.url)}
                            className="min-h-11 w-full max-w-32 cursor-pointer rounded-lg bg-blue-500 px-3 text-xs font-black text-white transition-colors duration-200 hover:bg-blue-400 [@media(hover:none)]:max-w-none [@media(hover:none)]:flex-1 [@media(hover:none)]:px-2"
                          >
                            <Eye
                              className="w-3.5 h-3.5 mr-1 [@media(hover:none)]:hidden"
                              aria-hidden="true"
                            />
                            USAGE
                          </Button>
                        </div>

                        <label className="absolute top-1 left-1 grid w-11 h-11 place-items-center cursor-pointer">
                          <span className="grid w-7 h-7 place-items-center rounded-md bg-slate-950/80">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => table.toggleRow(item.id)}
                              aria-label={`Select ${item.filename}`}
                              className={ADMIN_CHECKBOX_CLASS}
                            />
                          </span>
                        </label>

                        <button
                          type="button"
                          aria-label={`Delete ${item.filename}`}
                          onClick={() => setPendingDelete(item)}
                          className="absolute top-1 right-1 grid place-items-center w-11 h-11 rounded-md text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer [@media(hover:none)]:opacity-100"
                        >
                          <span className="grid place-items-center w-7 h-7 rounded-md bg-red-600 hover:bg-red-500 transition-colors duration-200">
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </button>
                      </div>

                      <div className="space-y-0.5 px-0.5">
                        <p className="truncate text-xs font-bold text-white" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-400">
                          {formatAssetSize(item.file_size)} · {formatAddedDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {hasAssets && !table.isEmptyBecauseOfFilters && (
            <div className="px-6 pb-6">
              <AdminTablePagination
                idPrefix={idPrefix}
                page={table.page}
                pageCount={table.pageCount}
                pageItems={table.pageItems}
                onPageChange={table.goToPage}
                pageSize={table.pageSize}
                onPageSizeChange={table.setPageSize}
                rangeStart={table.rangeStart}
                rangeEnd={table.rangeEnd}
                matchCount={table.matchCount}
                noun="assets"
              />
            </div>
          )}
        </div>

        {selectedForUsage !== null && (
          <UsagePreview
            open={selectedForUsage !== null}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setSelectedForUsage(null);
            }}
            mediaUrl={selectedForUsage}
          />
        )}

        <ConfirmDeleteDialog
          open={pendingDelete !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !deleteMedia.isPending) setPendingDelete(null);
          }}
          itemKind="file"
          itemLabel={pendingDelete?.filename ?? ""}
          isPending={deleteMedia.isPending}
          extraWarning={DELETE_WARNING}
          onConfirm={() => {
            if (pendingDelete) deleteMedia.mutate(pendingDelete);
          }}
        />

        <ConfirmDeleteDialog
          open={isBulkDeleteOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !bulkDelete.isPending) setIsBulkDeleteOpen(false);
          }}
          itemKind="selection"
          itemLabel={`${table.selectedCount} ${table.selectedCount === 1 ? "asset" : "assets"}`}
          isPending={bulkDelete.isPending}
          extraWarning={BULK_DELETE_WARNING}
          onConfirm={() => bulkDelete.mutate(table.selectedRows)}
        />
      </DialogContent>
    </Dialog>
  );
}
