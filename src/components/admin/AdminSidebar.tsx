import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, LogOut, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { BrandMark } from "@/components/BrandMark";
import { resolveBrand, WORDMARK_INK_PADDING } from "@/lib/brand";
import { ADMIN_TABS, type AdminTab } from "./admin-tabs";
import { getErrorMessage } from "./admin-utils";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (value: AdminTab) => void;

  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();

  const { data: settings } = useSiteSettings();
  const brand = resolveBrand(settings);

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(getErrorMessage(error, "Could not sign out"));
      return;
    }
    toast.success("Signed out successfully");
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r-2 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900 shadow-md lg:shadow-none transition-[transform,visibility] duration-300 ease-out",
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full",

          "lg:visible lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 dark:border-white/20">
          <Link to="/" className="flex min-w-0 items-center gap-3 group cursor-pointer">
            <BrandMark
              brand={brand}
              surface="sidebar"
              className="group-hover:scale-110 transition-transform duration-200"
            />
            {brand.showText && (
              <span
                className={`truncate text-xl font-black text-slate-950 dark:text-white tracking-tighter italic ${WORDMARK_INK_PADDING}`}
              >
                {brand.name}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            data-neutral-btn="true"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Admin sections" className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-4 mb-4">
            Management
          </div>
          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <a
                key={tab.value}
                href={`#${tab.value}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-white" : "text-slate-500 dark:text-slate-400",
                  )}
                  aria-hidden="true"
                />
                {tab.name}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-slate-300 dark:border-white/20 space-y-2">
          <Link
            to="/"
            data-neutral-btn="true"
            className="w-full flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer"
          >
            <Globe className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            View Site
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            data-neutral-btn="true"
            className="w-full flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
