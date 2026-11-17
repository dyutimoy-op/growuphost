import { supabase } from "@/integrations/supabase/client";

import { MEDIA_BUCKET, MEDIA_PROXY_PREFIX, encodeObjectPath } from "@/lib/media-url";

export { MEDIA_BUCKET };

const EXTENSIONS_BY_MIME: Readonly<Record<string, readonly string[]>> = {
  "image/webp": ["webp"],
  "image/jpeg": ["jpg", "jpeg", "jpe", "jfif"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "video/mp4": ["mp4", "m4v"],
  "video/webm": ["webm"],
  "video/ogg": ["ogv", "ogg"],
};

function extensionFor(file: File): string {
  const allowed = EXTENSIONS_BY_MIME[file.type.toLowerCase()];
  const fromName = /\.([a-z0-9]{1,8})$/i.exec(file.name)?.[1]?.toLowerCase();

  if (allowed === undefined) return fromName ?? "bin";

  if (fromName !== undefined && allowed.includes(fromName)) return fromName;

  return allowed[0] ?? "bin";
}

const VIDEO_EXTENSIONS: readonly string[] = ["mp4", "m4v", "webm", "ogv", "ogg"];

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const extension = /\.([a-z0-9]{1,8})(?:[?#]|$)/i.exec(url)?.[1]?.toLowerCase();
  return extension !== undefined && VIDEO_EXTENSIONS.includes(extension);
}

export function mediaKindFromUrl(url: string | null | undefined): "video" | "image" {
  return isVideoUrl(url) ? "video" : "image";
}

function slugifyBaseName(filename: string): string {
  const slug = filename
    .replace(/\.[^/.]+$/, "")
    // Decompose accents so "Café" degrades to "cafe" rather than to "caf".
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug.length > 0 ? slug : "asset";
}

function normalizeFolder(path: string): string {
  const segments = path
    .split("/")
    .map((segment) =>
      segment
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^[-.]+|[-.]+$/g, ""),
    )
    .filter((segment) => segment.length > 0);
  return segments.length > 0 ? segments.join("/") : "uploads";
}

function uniqueSuffix(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export const uploadMedia = async (file: File, path: string): Promise<string> => {
  const objectPath = `${normalizeFolder(path)}/${slugifyBaseName(file.name)}-${uniqueSuffix()}.${extensionFor(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type.length > 0 ? file.type : "application/octet-stream",

      cacheControl: "31536000",

      upsert: false,
    });

  if (uploadError) throw uploadError;

  const url = `${MEDIA_PROXY_PREFIX}${encodeObjectPath(objectPath)}`;

  const { error: insertError } = await supabase.from("media_library").insert({
    url,
    filename: file.name,
    file_type: file.type,
    file_size: file.size,
  });

  if (insertError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([objectPath]);
    throw insertError;
  }

  return url;
};
