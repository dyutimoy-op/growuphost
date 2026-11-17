import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type ProductRow = Tables["products"]["Row"];
export type ProductInsert = Tables["products"]["Insert"];
export type CategoryRow = Tables["categories"]["Row"];
export type CategoryInsert = Tables["categories"]["Insert"];
export type TestimonialRow = Tables["testimonials"]["Row"];
export type TestimonialInsert = Tables["testimonials"]["Insert"];
export type NewsAlertRow = Tables["news_alerts"]["Row"];
export type NewsAlertInsert = Tables["news_alerts"]["Insert"];

export type { NavLinkRecord as NavLinkRow } from "@/config/nav-links";
export type PromoPopupRow = Tables["promo_popups"]["Row"];
export type PromoPopupInsert = Tables["promo_popups"]["Insert"];
export type MediaLibraryRow = Tables["media_library"]["Row"];
export type SiteSettingInsert = Tables["site_settings"]["Insert"];

export type ProductWithCategory = ProductRow & {
  categories: { name: string } | null;
};
