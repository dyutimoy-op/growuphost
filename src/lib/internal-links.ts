import { isExternalUrl } from "@/config/whmcs";

export const INTERNAL_PATHS = [
  "/",
  "/about",
  "/contact",
  "/packages",
  "/shared-hosting",
  "/vps-hosting",
  "/dedicated-servers",
  "/licenses",
  "/legal/privacy",
  "/legal/sla",
  "/legal/terms",
] as const;

export type InternalPath = (typeof INTERNAL_PATHS)[number];

export function asInternalPath(url: string): InternalPath | null {
  const trimmed = url.trim();
  if (!trimmed || isExternalUrl(trimmed)) return null;

  if (/[?#]/.test(trimmed)) return null;

  const normalized = trimmed.replace(/\/+$/, "") || "/";
  return INTERNAL_PATHS.find((path) => path === normalized) ?? null;
}
