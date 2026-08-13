import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}
