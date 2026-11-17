export const NAV_LINK_PLACEMENTS = ["header", "footer", "both", "topbar"] as const;
export type NavLinkPlacement = (typeof NAV_LINK_PLACEMENTS)[number];

export type NavLinkSurface = "header" | "footer" | "topbar";

export interface NavLinkRecord {
  id: string;
  label: string;
  url: string;
  placement: NavLinkPlacement;
  open_in_new_tab: boolean;
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_NAV_LINKS: readonly NavLinkRecord[] = [];

function isPlacement(value: unknown): value is NavLinkPlacement {
  return typeof value === "string" && (NAV_LINK_PLACEMENTS as readonly string[]).includes(value);
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function asDisplayOrder(value: unknown): number {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  return 0;
}

export function newNavLinkId(): string {
  const cryptoRef = globalThis.crypto;
  if (typeof cryptoRef?.randomUUID === "function") return cryptoRef.randomUUID();
  return `nav-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function toRecord(input: unknown): NavLinkRecord | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;

  const label = typeof raw["label"] === "string" ? raw["label"].trim() : "";
  const url = typeof raw["url"] === "string" ? raw["url"].trim() : "";
  if (label.length === 0 || url.length === 0) return null;

  const id = typeof raw["id"] === "string" && raw["id"].trim().length > 0 ? raw["id"].trim() : null;

  return {
    id: id ?? newNavLinkId(),
    label,
    url,
    placement: isPlacement(raw["placement"]) ? raw["placement"] : "both",
    open_in_new_tab: asBoolean(raw["open_in_new_tab"], false),
    display_order: asDisplayOrder(raw["display_order"]),
    is_active: asBoolean(raw["is_active"], true),
  };
}

export function sortNavLinkRecords(records: readonly NavLinkRecord[]): NavLinkRecord[] {
  return [...records].sort(
    (a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label),
  );
}

export function parseNavLinkRecords(parsed: unknown): NavLinkRecord[] {
  if (!Array.isArray(parsed)) return [];

  const records: NavLinkRecord[] = [];
  const seenIds = new Set<string>();
  for (const entry of parsed) {
    const record = toRecord(entry);
    if (record === null) continue;

    if (seenIds.has(record.id)) record.id = newNavLinkId();
    seenIds.add(record.id);
    records.push(record);
  }
  return sortNavLinkRecords(records);
}

export function parseNavLinksFileContents(rawValue: string | null | undefined): NavLinkRecord[] {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) return [];
  try {
    return parseNavLinkRecords(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

export function serializeNavLinkRecords(records: readonly NavLinkRecord[]): string {
  return `${JSON.stringify(sortNavLinkRecords(records), null, 2)}\n`;
}

export function navLinkShowsOn(record: NavLinkRecord, surface: NavLinkSurface): boolean {
  if (record.placement === "both") return surface === "header" || surface === "footer";
  return record.placement === surface;
}
