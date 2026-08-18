import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";
import React from "react";

export const Route = createFileRoute("/$categorySlug")({
  component: DynamicCategoryPage,
  loader: async ({ params }) => {
    // We could prefetch here if we wanted to, but useQuery handles it fine in component
    return { categorySlug: params.categorySlug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { title: 'GROWUPHOST' };
    
    return {
      title: `${loaderData.categorySlug.replace(/-/g, ' ').toUpperCase()} | GROWUPHOST`,
      meta: [
        { name: "description", content: `Best ${loaderData.categorySlug.replace(/-/g, ' ')} solutions at GROWUPHOST.` },
      ],
    };
  }

});

function DynamicCategoryPage() {
  const { categorySlug } = Route.useLoaderData();
  
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", categorySlug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    throw notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8 relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-600/5 blur-[120px] rounded-full" />
          
          <div className="max-w-7xl mx-auto py-20 text-center space-y-6 relative z-10">
             <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
               {category.name.split(' ').slice(0, -1).join(' ')} <span className="text-indigo-500">{category.name.split(' ').slice(-1)}</span>
             </h1>
             <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
               {category.description || `High-performance ${category.name} solutions with zero latency and enterprise-grade security.`}
             </p>
          </div>
        </div>
        
        <CategoryProductGrid 
          categorySlug={categorySlug} 
          title="AVAILABLE PACKAGES" 
          subtitle="Enterprise infrastructure starting at unbeatable prices."
        />
      </main>
      <Footer />
    </div>
  );
}
