import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Layers, Image as ImageIcon, Settings, LogOut, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: '/auth' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="p-6 border-b border-slate-200">
            <Link to="/" className="text-xl font-bold tracking-tight">
              HOST<span className="text-primary">PRO</span> <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1 uppercase">Admin</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-4">Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <Layers className="w-5 h-5" /> Categories
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <Package className="w-5 h-5" /> Products
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <ImageIcon className="w-5 h-5" /> Media Assets
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-4">System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <Settings className="w-5 h-5" /> Site Settings
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/" className="flex items-center gap-3 font-medium text-slate-600 hover:text-primary transition-colors py-2">
                        <Globe className="w-5 h-5" /> View Website
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 font-medium text-red-500 hover:bg-red-50 transition-colors py-2 mt-4 w-full">
                      <LogOut className="w-5 h-5" /> Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
