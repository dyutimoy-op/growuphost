export const MEDIA_BUCKET = "media";

export const MEDIA_PROXY_PREFIX = "/media/";

const STORAGE_MARKERS: readonly string[] = [
  `/storage/v1/object/public/${MEDIA_BUCKET}/`,
  `/storage/v1/object/authenticated/${MEDIA_BUCKET}/`,
  `/storage/v1/object/${MEDIA_BUCKET}/`,
];

const MAX_OBJECT_PATH_LENGTH = 1024;

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function isSafeObjectPath(path: string): boolean {
  if (path.length === 0 || path.length > MAX_OBJECT_PATH_LENGTH) return false;
  if (path.startsWith("/") || path.includes("\\")) return false;
  if (hasControlCharacter(path)) return false;
  return !path.split("/").some((segment) => segment.length === 0 || /^\.{1,2}$/.test(segment));
}

function extractEncodedPath(withoutQuery: string): string | null {
  if (withoutQuery.startsWith(MEDIA_PROXY_PREFIX)) {
    return withoutQuery.slice(MEDIA_PROXY_PREFIX.length);
  }
  for (const marker of STORAGE_MARKERS) {
    const index = withoutQuery.indexOf(marker);
    if (index !== -1) return withoutQuery.slice(index + marker.length);
  }
  return null;
}

export function mediaObjectPath(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? trimmed;

  const encoded = extractEncodedPath(withoutQuery);
  if (encoded === null) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    decoded = encoded;
  }

  return isSafeObjectPath(decoded) ? decoded : null;
}

export function encodeObjectPath(objectPath: string): string {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

export function toMediaSrc(url: string | null | undefined): string {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.length === 0) return "";

  const objectPath = mediaObjectPath(trimmed);
  if (objectPath === null) return trimmed;

  return `${MEDIA_PROXY_PREFIX}${encodeObjectPath(objectPath)}`;
}
