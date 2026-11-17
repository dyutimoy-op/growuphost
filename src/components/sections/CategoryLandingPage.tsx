import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/sections/PageHero";

export interface CategoryLandingPageProps {
  categorySlug: string;

  eyebrow: string;
  title: string;
  subtitle: string;

  gridTitle: string;
  gridSubtitle: string;
}

export function CategoryLandingPage({
  categorySlug,
  eyebrow,
  title,
  subtitle,
  gridTitle,
  gridSubtitle,
}: CategoryLandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />
      <main id="main-content" className="flex-grow">
        <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <CategoryProductGrid
          categorySlug={categorySlug}
          title={gridTitle}
          subtitle={gridSubtitle}
        />
      </main>
      <Footer />
    </div>
  );
}
