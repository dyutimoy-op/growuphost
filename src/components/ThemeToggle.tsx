import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "navbar" | "admin" | "minimal";
}

export function ThemeToggle({ className, variant = "navbar" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-icon-btn="true"
      aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      title={
        isDark ? "Night Mode Active (Click for Day Mode)" : "Day Mode Active (Click for Night Mode)"
      }
      className={cn(
        "theme-toggle-btn relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isDark
          ? "border border-blue-500/40 bg-slate-900/90 text-blue-400 hover:bg-slate-800 hover:border-blue-400 shadow-sm"
          : "border border-slate-300 bg-white text-amber-500 hover:bg-slate-50 hover:border-amber-400 shadow-sm",
        className,
      )}
    >
      {isDark ? (
        <Moon
          className="h-5 w-5 text-blue-400 fill-blue-400/20 transition-transform duration-300 hover:-rotate-12"
          aria-hidden="true"
        />
      ) : (
        <Sun
          className="h-5 w-5 text-amber-500 fill-amber-500/30 transition-transform duration-300 hover:rotate-45"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
