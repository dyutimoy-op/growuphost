import { toMediaSrc } from "@/lib/media-url";

export const BRAND_NAME_KEY = "company_name";
export const BRAND_LOGO_URL_KEY = "brand_logo_url";
export const BRAND_LOGO_SIZE_KEY = "brand_logo_size";
export const BRAND_SHOW_TEXT_KEY = "brand_show_text";

export const DEFAULT_BRAND_NAME = "GROWUPHOST";
export const DEFAULT_BRAND_LOGO_URL = "/growuphost/logo.png";
export const DEFAULT_BRAND_DARK_LOGO_URL = "/growuphost/logo-light.png";

export const BRAND_SHOW_TEXT_MODES = ["auto", "show", "hide"] as const;
export type BrandShowTextMode = (typeof BRAND_SHOW_TEXT_MODES)[number];
export const DEFAULT_BRAND_SHOW_TEXT_MODE: BrandShowTextMode = "auto";

export const BRAND_LOGO_SIZES = ["small", "medium", "large"] as const;
export type BrandLogoSize = (typeof BRAND_LOGO_SIZES)[number];

export const DEFAULT_BRAND_LOGO_SIZE: BrandLogoSize = "large";

export type BrandSurface = "navbar" | "footer" | "sidebar";

interface SurfaceSizing {
  readonly badge: string;

  readonly image: string;
}

export const BRAND_LOGO_SIZE_CLASSES: Record<BrandLogoSize, Record<BrandSurface, SurfaceSizing>> = {
  small: {
    navbar: { badge: "w-7 h-7 sm:w-10 sm:h-10 text-lg sm:text-2xl", image: "h-7 sm:h-10" },
    footer: { badge: "w-9 h-9 text-sm", image: "h-9" },
    sidebar: { badge: "w-9 h-9 text-lg", image: "h-9" },
  },
  medium: {
    navbar: { badge: "w-8 h-8 sm:w-12 sm:h-12 text-xl sm:text-3xl", image: "h-8 sm:h-12" },
    footer: { badge: "w-10 h-10 text-base", image: "h-10" },
    sidebar: { badge: "w-10 h-10 text-xl", image: "h-10" },
  },
  large: {
    navbar: { badge: "w-10 h-10 sm:w-14 sm:h-14 text-2xl sm:text-4xl", image: "h-10 sm:h-14" },
    footer: { badge: "w-12 h-12 text-lg", image: "h-12" },
    sidebar: { badge: "w-12 h-12 text-2xl", image: "h-12" },
  },
};

export const WORDMARK_INK_PADDING = "pr-[0.2em]";

function trimmedOr(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : fallback;
}

function asBrandLogoSize(value: string | undefined): BrandLogoSize {
  const trimmed = value?.trim().toLowerCase();
  return BRAND_LOGO_SIZES.find((size) => size === trimmed) ?? DEFAULT_BRAND_LOGO_SIZE;
}

function brandInitial(name: string): string {
  return ([...name][0] ?? "").toUpperCase();
}

export interface Brand {
  readonly name: string;

  readonly logoUrl: string | null;
  readonly darkLogoUrl: string | null;
  readonly size: BrandLogoSize;
  readonly initial: string;

  readonly showText: boolean;
  readonly showTextMode: BrandShowTextMode;
}

export function resolveBrand(settings: Record<string, string> | undefined): Brand {
  const name = trimmedOr(settings?.[BRAND_NAME_KEY], DEFAULT_BRAND_NAME);
  const storedLogo = settings?.[BRAND_LOGO_URL_KEY]?.trim();

  const logoUrl =
    storedLogo !== undefined && storedLogo.length > 0
      ? toMediaSrc(storedLogo)
      : DEFAULT_BRAND_LOGO_URL;

  const darkLogoUrl =
    storedLogo !== undefined && storedLogo.length > 0 ? logoUrl : DEFAULT_BRAND_DARK_LOGO_URL;

  const rawShowText = settings?.[BRAND_SHOW_TEXT_KEY]?.trim().toLowerCase();
  const showTextMode: BrandShowTextMode =
    rawShowText === "show" || rawShowText === "true" || rawShowText === "always"
      ? "show"
      : rawShowText === "hide" || rawShowText === "false" || rawShowText === "never"
        ? "hide"
        : "auto";

  const hasLogoImage = logoUrl !== null && logoUrl.length > 0;
  const showText = showTextMode === "show" ? true : showTextMode === "hide" ? false : !hasLogoImage;

  return {
    name,
    logoUrl,
    darkLogoUrl,
    size: asBrandLogoSize(settings?.[BRAND_LOGO_SIZE_KEY]),
    initial: brandInitial(name),
    showText,
    showTextMode,
  };
}
