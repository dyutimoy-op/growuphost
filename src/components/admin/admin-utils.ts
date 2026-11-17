import { MEDIA_BUCKET } from "@/lib/storage";

const MISSING_TABLE_CODES: ReadonlySet<string> = new Set(["PGRST205", "42P01"]);

const MISSING_COLUMN_CODE = "42703";

function errorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.trim().length > 0) return code;
  }
  return null;
}

function missingTableName(message: string): string | null {
  const quoted = /table '(?:public\.)?([a-z0-9_]+)'/i.exec(message);
  if (quoted?.[1] !== undefined) return quoted[1];

  const relation = /relation "(?:public\.)?([a-z0-9_]+)" does not exist/i.exec(message);
  return relation?.[1] ?? null;
}

function missingColumnName(message: string): string | null {
  const match = /column ([a-z0-9_.]+) does not exist/i.exec(message);
  return match?.[1] ?? null;
}

function rawMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  if (typeof error === "string" && error.trim().length > 0) return error;
  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return null;
}

function explain(error: unknown, raw: string): string {
  const code = errorCode(error);
  const table = missingTableName(raw);

  if (code !== null && MISSING_TABLE_CODES.has(code)) {
    const named = table === null ? "That table" : `The "${table}" table`;
    return (
      `${named} does not exist in this Supabase project yet, so nothing can be saved to it. ` +
      `Its migration in supabase/migrations/ has not been applied — run it in the Supabase ` +
      `SQL editor (or via Lovable), then reload this page.`
    );
  }

  if (code === MISSING_COLUMN_CODE) {
    const column = missingColumnName(raw);
    const named = column === null ? "A column this form saves" : `The "${column}" column`;
    return (
      `${named} does not exist in this Supabase project yet, so this cannot be saved. ` +
      `Its migration in supabase/migrations/ has not been applied — run it in the Supabase ` +
      `SQL editor (or via Lovable), then reload this page.`
    );
  }

  if (/nosuchbucket|bucket not found/i.test(raw)) {
    return (
      `The "${MEDIA_BUCKET}" storage bucket does not exist in this Supabase project yet, so ` +
      `uploads cannot be stored. Create it under Storage — it does not need to be public, ` +
      `because uploads are served through this site's own /media/ route — then try again.`
    );
  }

  return raw;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const raw = rawMessage(error);
  if (raw === null) return fallback;
  return explain(error, raw);
}

export function parseOptionalPositiveInt(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (!/^\d+$/.test(trimmed)) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

export function parseNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export { MEDIA_BUCKET };

export function formatFileSize(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const unit = units[exponent] ?? "B";
  return `${Number.parseFloat((bytes / 1024 ** exponent).toFixed(2))} ${unit}`;
}
