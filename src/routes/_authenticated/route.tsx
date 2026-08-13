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
      <div className="flex min-h-screen w-full bg-slate-950 text-white">
        <Sidebar className="border-r border-white/10 bg-slate-900">
          <SidebarHeader className="p-6 border-b border-white/10">
            <Link to="/" className="text-xl font-black tracking-tighter uppercase italic">
              GROWUP<span className="text-primary tracking-normal text-indigo-400">HOST</span> <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full ml-1 uppercase not-italic">Admin</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4 bg-slate-900">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 font-bold text-[10px] tracking-widest uppercase mb-4">Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 font-medium text-slate-300 hover:text-white transition-colors py-2">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Future management routes can be added here */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-slate-500 font-bold text-[10px] tracking-widest uppercase mb-4">System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 font-medium text-slate-300 hover:text-white transition-colors py-2">
                        <Settings className="w-5 h-5" /> Site Settings
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3 font-medium text-slate-300 hover:text-white transition-colors py-2">
                        <Globe className="w-5 h-5" /> View Website
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 font-medium text-red-400 hover:bg-red-500/10 transition-colors py-2 mt-4 w-full text-left px-3">
                      <LogOut className="w-5 h-5" /> Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}