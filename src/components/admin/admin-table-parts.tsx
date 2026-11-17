import { ArrowDown, ArrowUp, ArrowUpDown, Search, TriangleAlert, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableHead } from "@/components/ui/table";

import {
  ADMIN_TABLE_PAGE_SIZES,
  type PageItem,
  type PageSelectionState,
  type SortDirection,
} from "./use-admin-table";
import { getErrorMessage } from "./admin-utils";

const CONTROL_SURFACE =
  "bg-white dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/20 text-slate-950 dark:text-white rounded-xl min-h-11 cursor-pointer " +
  "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-950 shadow-xs";

const GHOST_BUTTON =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 min-h-11 min-w-11 text-xs " +
  "font-bold text-slate-700 dark:text-slate-300 transition-colors duration-200 cursor-pointer " +
  "hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-950 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export const ADMIN_CHECKBOX_CLASS =
  "h-4 w-4 border-2 border-slate-400 dark:border-white/40 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 " +
  "data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:bg-blue-600 " +
  "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-950";

export const ADMIN_ACTION_BUTTON =
  "min-h-11 cursor-pointer rounded-xl text-xs font-bold transition-colors duration-200";

export const ADMIN_OUTLINE_BUTTON =
  "border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white shadow-xs";

export const ADMIN_CONTROL_SURFACE = CONTROL_SURFACE;

export interface AdminTableToolbarProps {
  idPrefix: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;

  searchLabel: string;
  searchPlaceholder: string;

  children?: ReactNode | undefined;
  matchCount: number;
  totalCount: number;

  noun: string;

  hasRefinements: boolean;
  onClearRefinements: () => void;
}

export function AdminTableToolbar({
  idPrefix,
  searchValue,
  onSearchChange,
  onClearSearch,
  searchLabel,
  searchPlaceholder,
  children,
  matchCount,
  totalCount,
  noun,
  hasRefinements,
  onClearRefinements,
}: AdminTableToolbarProps) {
  const searchId = `${idPrefix}-search`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <label className="sr-only" htmlFor={searchId}>
            {searchLabel}
          </label>
          <Input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className={`${CONTROL_SURFACE} pr-10 pl-10 text-sm font-medium placeholder:text-slate-400`}
          />
          {searchValue.length > 0 && (
            <button
              type="button"
              data-neutral-btn="true"
              onClick={onClearSearch}
              aria-label="Clear the search box"
              className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {children}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p aria-live="polite" className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {hasRefinements ? (
            <>
              <span className="font-extrabold text-slate-950 dark:text-white">{matchCount}</span> of{" "}
              {totalCount} {noun} match
            </>
          ) : (
            <>
              <span className="font-extrabold text-slate-950 dark:text-white">{totalCount}</span>{" "}
              {noun}
            </>
          )}
        </p>
        {hasRefinements && (
          <button
            type="button"
            data-neutral-btn="true"
            onClick={onClearRefinements}
            className={GHOST_BUTTON}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterSelectProps {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly AdminFilterOption[];
}

export function AdminFilterSelect({ ariaLabel, value, onChange, options }: AdminFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`${CONTROL_SURFACE} w-auto min-w-36 text-xs font-bold`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs font-bold cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface AdminSortHeaderProps {
  label: string;

  columnKey: string;
  activeKey: string;
  direction: SortDirection;
  onToggle: (key: string) => void;
  align?: "left" | "right" | undefined;
  className?: string | undefined;
}

export function AdminSortHeader({
  label,
  columnKey,
  activeKey,
  direction,
  onToggle,
  align = "left",
  className = "",
}: AdminSortHeaderProps) {
  const isActive = columnKey === activeKey;
  const Icon = isActive ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={`h-auto px-3 py-2 text-slate-700 dark:text-slate-300 ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <button
        type="button"
        data-neutral-btn="true"
        onClick={() => onToggle(columnKey)}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-black tracking-widest uppercase transition-colors duration-200 cursor-pointer hover:text-slate-950 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isActive
            ? "text-slate-950 dark:text-white font-black"
            : "text-slate-600 dark:text-slate-400"
        } ${align === "right" ? "ml-auto" : ""}`}
      >
        {label}
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  );
}

export interface AdminSortOption {
  key: string;
  label: string;
}

export interface AdminSortSelectProps {
  idPrefix: string;
  options: readonly AdminSortOption[];
  sortKey: string;
  direction: SortDirection;

  onToggle: (key: string) => void;
}

export function AdminSortSelect({
  idPrefix,
  options,
  sortKey,
  direction,
  onToggle,
}: AdminSortSelectProps) {
  const sortId = `${idPrefix}-sort`;
  const activeLabel = options.find((option) => option.key === sortKey)?.label ?? "";
  const DirectionIcon = direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={sortId}>
        Sort by
      </label>
      <Select value={sortKey} onValueChange={onToggle}>
        <SelectTrigger
          id={sortId}
          className={`${CONTROL_SURFACE} w-auto min-w-36 text-xs font-bold`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xl">
          {options.map((option) => (
            <SelectItem
              key={option.key}
              value={option.key}
              className="text-xs font-bold cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        data-neutral-btn="true"
        onClick={() => onToggle(sortKey)}
        aria-label={
          direction === "asc"
            ? `Sort ${activeLabel} descending — currently ascending`
            : `Sort ${activeLabel} ascending — currently descending`
        }
        className={GHOST_BUTTON}
      >
        <DirectionIcon
          className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <span className="sr-only sm:not-sr-only">{direction === "asc" ? "Asc" : "Desc"}</span>
      </button>
    </div>
  );
}

export interface AdminSelectAllControlProps {
  state: PageSelectionState;
  onToggle: () => void;

  pageRowCount: number;

  noun: string;
}

export function AdminSelectAllControl({
  state,
  onToggle,
  pageRowCount,
  noun,
}: AdminSelectAllControlProps) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors duration-200 hover:text-slate-950 dark:hover:text-white">
      <Checkbox
        checked={state === "all" ? true : state === "some" ? "indeterminate" : false}
        onCheckedChange={onToggle}
        disabled={pageRowCount === 0}
        className={ADMIN_CHECKBOX_CLASS}
      />
      Select all {pageRowCount} {noun} on this page
    </label>
  );
}

export interface AdminBulkActionBarProps {
  selectedCount: number;

  noun: string;
  onClearSelection: () => void;

  children: ReactNode;
}

export function AdminBulkActionBar({
  selectedCount,
  noun,
  onClearSelection,
  children,
}: AdminBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 px-4 py-3">
      <p
        role="status"
        className="text-xs font-black tracking-widest text-blue-950 dark:text-white uppercase"
      >
        {selectedCount} {selectedCount === 1 ? noun : `${noun}s`} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          type="button"
          data-neutral-btn="true"
          onClick={onClearSelection}
          className={GHOST_BUTTON}
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}

export interface AdminTablePaginationProps {
  idPrefix: string;
  page: number;
  pageCount: number;
  pageItems: PageItem[];
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  rangeStart: number;
  rangeEnd: number;
  matchCount: number;

  noun: string;
}

export function AdminTablePagination({
  idPrefix,
  page,
  pageCount,
  pageItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  rangeStart,
  rangeEnd,
  matchCount,
  noun,
}: AdminTablePaginationProps) {
  const pageSizeId = `${idPrefix}-page-size`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-300 dark:border-white/20 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Showing{" "}
          <span className="text-slate-950 dark:text-white font-extrabold">
            {rangeStart}-{rangeEnd}
          </span>{" "}
          of {matchCount} {noun}
        </p>
        <div className="flex items-center gap-2">
          <label
            className="text-xs font-bold text-slate-600 dark:text-slate-400"
            htmlFor={pageSizeId}
          >
            Per page
          </label>
          <Select value={String(pageSize)} onValueChange={(next) => onPageSizeChange(Number(next))}>
            <SelectTrigger id={pageSizeId} className={`${CONTROL_SURFACE} w-20 text-xs font-bold`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xl">
              {ADMIN_TABLE_PAGE_SIZES.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="text-xs font-bold cursor-pointer"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageCount > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <button
                type="button"
                data-neutral-btn="true"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className={GHOST_BUTTON}
              >
                Previous
              </button>
            </PaginationItem>
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`gap-${index}`}>
                  <PaginationEllipsis className="text-slate-400 dark:text-slate-500" />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <button
                    type="button"
                    data-neutral-btn={item !== page ? "true" : undefined}
                    onClick={() => onPageChange(item)}
                    aria-label={`Go to page ${item}`}
                    aria-current={item === page ? "page" : undefined}
                    className={
                      item === page
                        ? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-black text-white cursor-pointer shadow-md shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        : GHOST_BUTTON
                    }
                  >
                    {item}
                  </button>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <button
                type="button"
                data-neutral-btn="true"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pageCount}
                className={GHOST_BUTTON}
              >
                Next
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export interface AdminTableEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;

  action?: ReactNode | undefined;
}

export function AdminTableEmpty({ icon: Icon, title, description, action }: AdminTableEmptyProps) {
  return (
    <Card className="rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/50 p-12 text-center shadow-xs">
      <Icon
        className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-600"
        aria-hidden="true"
      />
      <p className="font-black text-slate-950 dark:text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export interface AdminTableErrorProps {
  entity: string;

  error: unknown;

  consequence?: string | undefined;

  onRetry?: (() => void) | undefined;
}

export function AdminTableError({ entity, error, consequence, onRetry }: AdminTableErrorProps) {
  const cause = getErrorMessage(error, `The ${entity} could not be loaded.`);

  return (
    <Card
      role="alert"
      className="rounded-[2rem] border border-amber-400/30 bg-amber-950/20 p-12 text-center"
    >
      <TriangleAlert className="mx-auto mb-4 h-12 w-12 text-amber-400" aria-hidden="true" />
      <p className="font-black text-white">Could not load the {entity}</p>
      <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-300">
        {cause}
        {consequence === undefined ? null : ` ${consequence}`}
      </p>
      {onRetry === undefined ? null : (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={onRetry} className={GHOST_BUTTON}>
            Try again
          </button>
        </div>
      )}
    </Card>
  );
}
