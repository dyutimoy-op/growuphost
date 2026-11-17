import type { QueryClient } from "@tanstack/react-query";

type QueryKeySet = readonly (readonly string[])[];

const DASHBOARD_KEYS: QueryKeySet = [["admin-stats"], ["admin-overview-catalogue"]];

const CATALOGUE_PRODUCT_KEYS: QueryKeySet = [
  ["products-full"], // tabs/ProductsTab.tsx — the admin grid
  ["products"], // sections/use-category-products.ts — ["products", slug]
  ["products-all"], // routes/packages.tsx — the full catalogue
  ["products-featured"], // sections/use-plans.ts — the homepage plan grid
];

const KEYS_BY_ENTITY = {
  categories: [
    ["categories-full"], // tabs/CategoriesTab.tsx — the admin grid
    ["categories"], // sections/use-nav-chrome.ts — the header nav
    ["categories-all"], // routes/packages.tsx — the category filter
    ["category"], // sections/use-category-products.ts — ["category", slug]
    ...CATALOGUE_PRODUCT_KEYS, // the embedded join + the ON DELETE CASCADE
    ...DASHBOARD_KEYS,
  ],
  products: [...CATALOGUE_PRODUCT_KEYS, ...DASHBOARD_KEYS],
  testimonials: [
    ["testimonials-full"], // tabs/TestimonialsTab.tsx — the admin grid
    ["testimonials-public"], // sections/use-testimonials.ts — the homepage section
    ["admin-stats"],
  ],
  popups: [
    ["promo-popups"], // tabs/MarketingTab.tsx — the admin grid
    ["active-promo-popup"], // components/PromoPopup.tsx — the live popup
    ["admin-stats"],
  ],
  navLinks: [
    ["nav-links-admin"], // tabs/NavLinksTab.tsx — every row, active or not
    ["nav-links"], // hooks/use-nav-links.ts — the public header/footer
  ],
  news: [
    ["news-alerts"], // tabs/NewsTab.tsx — the admin grid
    ["news-alert"], // sections/use-nav-chrome.ts — the ticker's single row
  ],
  settings: [
    ["site-settings"], // hooks/use-site-settings.ts — read site-wide
  ],
  media: [
    ["media-library"], // MediaGallery.tsx — the asset grid
    ["media-usage"], // UsagePreview.tsx — ["media-usage", url]
  ],
} as const satisfies Record<string, QueryKeySet>;

export type AdminEntity = keyof typeof KEYS_BY_ENTITY;

export async function invalidateEntity(
  queryClient: QueryClient,
  entity: AdminEntity,
): Promise<void> {
  await Promise.allSettled(
    KEYS_BY_ENTITY[entity].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
