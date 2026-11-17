import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  ADMIN_TABS,
  DEFAULT_ADMIN_TAB,
  isAdminTab,
  type AdminTab,
} from "@/components/admin/admin-tabs";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { ProductsTab } from "@/components/admin/tabs/ProductsTab";
import { CategoriesTab } from "@/components/admin/tabs/CategoriesTab";
import { MarketingTab } from "@/components/admin/tabs/MarketingTab";
import { NewsTab } from "@/components/admin/tabs/NewsTab";
import { TestimonialsTab } from "@/components/admin/tabs/TestimonialsTab";
import { MediaTab } from "@/components/admin/tabs/MediaTab";
import { NavLinksTab } from "@/components/admin/tabs/NavLinksTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { SeoTab } from "@/components/admin/tabs/SeoTab";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: AdminDashboard,
});

function tabFromHash(): AdminTab {
  if (typeof window === "undefined") return DEFAULT_ADMIN_TAB;
  const raw = window.location.hash.replace(/^#/, "");
  return isAdminTab(raw) ? raw : DEFAULT_ADMIN_TAB;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>(DEFAULT_ADMIN_TAB);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setActiveTab(tabFromHash());

    const onHashChange = (): void => setActiveTab(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const closeMenu = useCallback((): void => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = (): void => {
      if (desktop.matches) setIsMenuOpen(false);
    };
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  const changeTab = useCallback((tab: AdminTab): void => {
    setActiveTab(tab);

    setIsMenuOpen(false);
    if (typeof window !== "undefined" && window.location.hash !== `#${tab}`) {
      window.history.replaceState(null, "", `#${tab}`);
    }
  }, []);

  const activeTabName = ADMIN_TABS.find((tab) => tab.value === activeTab)?.name ?? "Admin";

  return (
    <div
      id="admin-dashboard"
      className="admin-shell flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-200"
    >
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={changeTab}
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-slate-300 dark:border-white/20 bg-white/95 dark:bg-slate-950/95 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-xl shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open admin menu"
              aria-expanded={isMenuOpen}
              aria-controls="admin-sidebar"
              data-neutral-btn="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="truncate text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">
              {activeTabName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="admin" />
          </div>
        </header>

        <main
          id="main-content"
          aria-label={activeTabName}
          className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-200"
        >
          {activeTab === "overview" && <OverviewTab onNavigate={changeTab} />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "marketing" && <MarketingTab />}
          {activeTab === "news" && <NewsTab />}
          {activeTab === "testimonials" && <TestimonialsTab />}
          {activeTab === "media" && <MediaTab />}
          {activeTab === "nav-links" && <NavLinksTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "seo" && <SeoTab />}
        </main>
      </div>
    </div>
  );
}
