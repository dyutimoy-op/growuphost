import {
  LayoutDashboard,
  Package,
  Layers,
  Megaphone,
  Bell,
  Star,
  Settings,
  Globe,
  Link2,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_TABS = [
  { value: "overview", name: "Overview", icon: LayoutDashboard },
  { value: "products", name: "Products", icon: Package },
  { value: "categories", name: "Categories", icon: Layers },
  { value: "marketing", name: "Marketing", icon: Megaphone },
  { value: "news", name: "News & Alerts", icon: Bell },
  { value: "testimonials", name: "Testimonials", icon: Star },
  { value: "media", name: "Media Library", icon: ImageIcon },
  { value: "nav-links", name: "Header & Footer", icon: Link2 },
  { value: "settings", name: "Global Settings", icon: Settings },
  { value: "seo", name: "SEO & Performance", icon: Globe },
] as const satisfies readonly { value: string; name: string; icon: LucideIcon }[];

export type AdminTab = (typeof ADMIN_TABS)[number]["value"];

export const DEFAULT_ADMIN_TAB: AdminTab = "overview";

export function isAdminTab(value: string): value is AdminTab {
  return ADMIN_TABS.some((tab) => tab.value === value);
}
