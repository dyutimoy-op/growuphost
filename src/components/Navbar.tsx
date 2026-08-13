import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, User, Bell, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <header className="w-full border-b bg-background sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#5831f7] text-white py-2 px-4 md:px-8 flex justify-end items-center gap-6 text-sm">
        <Link to="/" className="hover:opacity-80 transition-opacity">Login</Link>
        <span className="opacity-40">|</span>
        <Link to="/" className="hover:opacity-80 transition-opacity">Register</Link>
        <span className="opacity-40">|</span>
        <Link to="/" className="hover:opacity-80 transition-opacity">Offers</Link>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span className="opacity-40">|</span>
        <Bell className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity" />
      </div>

      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-foreground tracking-tight">
            HOST<span className="text-primary">PRO</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {categories?.map((category) => (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                  {category.name} <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>
                    <Link to="/" search={{ category: category.slug }} className="w-full">
                      View All {category.name}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Blog</Link>
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Support</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 rounded-full px-4">
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-semibold">₹ INR</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
