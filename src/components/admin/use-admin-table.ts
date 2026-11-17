import { useCallback, useEffect, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type SortValue = string | number | boolean | null | undefined;

export type PageItem = number | "ellipsis";

export type PageSelectionState = "none" | "some" | "all";

export interface AdminTableOptions<T> {
  rows: T[] | undefined;

  getId: (row: T) => string;

  getSearchText: (row: T) => Array<string | null | undefined>;

  sorts: Readonly<Record<string, (row: T) => SortValue>>;
  initialSortKey: string;
  initialSortDirection?: SortDirection;

  filter?: ((row: T) => boolean) | undefined;

  filterKey?: string;
  initialPageSize?: number;
}

export interface AdminTable<T> {
  search: string;
  setSearch: (value: string) => void;

  isSearchPending: boolean;
  clearSearch: () => void;

  sortKey: string;
  sortDirection: SortDirection;

  toggleSort: (key: string) => void;

  ariaSort: (key: string) => "ascending" | "descending" | "none";

  page: number;
  pageCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  pageItems: PageItem[];

  rangeStart: number;
  rangeEnd: number;

  pageRows: T[];

  matchCount: number;

  totalCount: number;

  isEmptyBecauseOfFilters: boolean;

  selectedIds: string[];
  selectedRows: T[];
  selectedCount: number;
  isRowSelected: (id: string) => boolean;
  toggleRow: (id: string) => void;
  pageSelectionState: PageSelectionState;

  togglePageSelection: () => void;
  clearSelection: () => void;
}

function missingRank(value: SortValue): number {
  return value === null || value === undefined || value === "" ? 1 : 0;
}

function comparePresent(a: SortValue, b: SortValue): number {
  if (typeof a === "number" && typeof b === "number") return a - b;

  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? -1 : 1;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function buildPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_unused, index) => index + 1);
  }
  const items: PageItem[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) items.push("ellipsis");
  for (let candidate = from; candidate <= to; candidate += 1) items.push(candidate);
  if (to < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);
  return items;
}

export const ADMIN_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;

export function useAdminTable<T>(options: AdminTableOptions<T>): AdminTable<T> {
  const {
    rows,
    getId,
    getSearchText,
    sorts,
    initialSortKey,
    initialSortDirection = "asc",
    filter,
    filterKey = "",
    initialPageSize = 10,
  } = options;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set<string>());

  useEffect(() => {
    if (search === debouncedSearch) return undefined;
    const timer = setTimeout(() => setDebouncedSearch(search), 180);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const source = useMemo(() => rows ?? [], [rows]);
  const totalCount = source.length;

  const matching = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return source.filter((row) => {
      if (filter && !filter(row)) return false;
      if (needle.length === 0) return true;
      return getSearchText(row).some(
        (field) => typeof field === "string" && field.toLowerCase().includes(needle),
      );
    });
  }, [source, filter, getSearchText, debouncedSearch]);

  const sorted = useMemo(() => {
    const compare = sorts[sortKey];
    if (!compare) return matching;
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...matching].sort((rowA, rowB) => {
      const a = compare(rowA);
      const b = compare(rowB);
      const missing = missingRank(a) - missingRank(b);
      if (missing !== 0) return missing;
      const primary = comparePresent(a, b) * factor;
      if (primary !== 0) return primary;
      return getId(rowA).localeCompare(getId(rowB));
    });
  }, [matching, sorts, sortKey, sortDirection, getId]);

  const scope = JSON.stringify([debouncedSearch, filterKey, pageSize]);
  const [pageState, setPageState] = useState<{ scope: string; page: number }>({ scope, page: 1 });
  const requestedPage = pageState.scope === scope ? pageState.page : 1;

  const matchCount = sorted.length;
  const pageCount = Math.max(1, Math.ceil(matchCount / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;
  const pageRows = useMemo(() => sorted.slice(start, start + pageSize), [sorted, start, pageSize]);

  const goToPage = useCallback(
    (next: number) => {
      setPageState({ scope, page: next });
    },
    [scope],
  );

  const toggleSort = useCallback((key: string) => {
    setSortKey((currentKey) => {
      setSortDirection((currentDirection) =>
        currentKey === key ? (currentDirection === "asc" ? "desc" : "asc") : "asc",
      );
      return key;
    });
  }, []);

  const ariaSort = useCallback(
    (key: string): "ascending" | "descending" | "none" => {
      if (key !== sortKey) return "none";
      return sortDirection === "asc" ? "ascending" : "descending";
    },
    [sortKey, sortDirection],
  );

  const selectedRows = useMemo(
    () => source.filter((row) => selection.has(getId(row))),
    [source, selection, getId],
  );
  const selectedIds = useMemo(() => selectedRows.map(getId), [selectedRows, getId]);

  const toggleRow = useCallback((id: string) => {
    setSelection((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(new Set<string>());
  }, []);

  const pageIds = useMemo(() => pageRows.map(getId), [pageRows, getId]);
  const selectedOnPage = pageIds.filter((id) => selection.has(id)).length;
  const pageSelectionState: PageSelectionState =
    pageIds.length === 0 || selectedOnPage === 0
      ? "none"
      : selectedOnPage === pageIds.length
        ? "all"
        : "some";

  const togglePageSelection = useCallback(() => {
    setSelection((current) => {
      const next = new Set(current);
      const everySelected = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      for (const id of pageIds) {
        if (everySelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [pageIds]);

  return {
    search,
    setSearch,
    isSearchPending: search !== debouncedSearch,
    clearSearch: useCallback(() => setSearch(""), []),

    sortKey,
    sortDirection,
    toggleSort,
    ariaSort,

    page,
    pageCount,
    pageSize,
    setPageSize,
    goToPage,
    pageItems: buildPageItems(page, pageCount),
    rangeStart: matchCount === 0 ? 0 : start + 1,
    rangeEnd: matchCount === 0 ? 0 : start + pageRows.length,

    pageRows,
    matchCount,
    totalCount,
    isEmptyBecauseOfFilters: totalCount > 0 && matchCount === 0,

    selectedIds,
    selectedRows,
    selectedCount: selectedIds.length,
    isRowSelected: useCallback((id: string) => selection.has(id), [selection]),
    toggleRow,
    pageSelectionState,
    togglePageSelection,
    clearSelection,
  };
}
