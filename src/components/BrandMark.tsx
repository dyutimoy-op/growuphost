import { cn } from "@/lib/utils";
import { BRAND_LOGO_SIZE_CLASSES, type Brand, type BrandSurface } from "@/lib/brand";

interface BrandMarkProps {
  brand: Brand;
  surface: BrandSurface;

  className?: string;
}

export function BrandMark({ brand, surface, className }: BrandMarkProps) {
  const sizing = BRAND_LOGO_SIZE_CLASSES[brand.size][surface];

  if (brand.logoUrl !== null) {
    if (surface === "footer") {
      const footerLogo = brand.darkLogoUrl || brand.logoUrl;
      return (
        <img
          src={footerLogo}
          alt={brand.name}
          className={cn(
            "w-auto max-w-[8rem] shrink-0 object-contain not-italic sm:max-w-[12rem]",
            sizing.image,
            className,
          )}
          decoding="async"
          fetchPriority="high"
        />
      );
    }

    if (brand.darkLogoUrl && brand.darkLogoUrl !== brand.logoUrl) {
      return (
        <span className="inline-flex shrink-0 items-center">
          <img
            src={brand.darkLogoUrl}
            alt={brand.name}
            className={cn(
              "hidden dark:block w-auto max-w-[8rem] shrink-0 object-contain not-italic sm:max-w-[12rem]",
              sizing.image,
              className,
            )}
            decoding="async"
            fetchPriority="high"
          />
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className={cn(
              "block dark:hidden w-auto max-w-[8rem] shrink-0 object-contain not-italic sm:max-w-[12rem]",
              sizing.image,
              className,
            )}
            decoding="async"
            fetchPriority="high"
          />
        </span>
      );
    }

    return (
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className={cn(
          "w-auto max-w-[8rem] shrink-0 object-contain not-italic sm:max-w-[12rem]",
          sizing.image,
          className,
        )}
        decoding="async"
        fetchPriority="high"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black not-italic text-white shadow-lg shadow-blue-600/20",
        sizing.badge,
        className,
      )}
    >
      {brand.initial}
    </div>
  );
}
