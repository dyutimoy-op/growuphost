import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Layers, Users, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);
      return {
        products: products.count || 0,
        categories: categories.count || 0,
        activeUsers: 1, // Mock
        revenue: '₹45,900', // Mock
      };
    },
  });

  const cards = [
    { title: 'Total Products', value: stats?.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Categories', value: stats?.categories, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Active Users', value: stats?.activeUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Monthly Revenue', value: stats?.revenue, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Welcome to your HostPro management panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{card.value}</div>
              <p className="text-xs text-emerald-500 font-bold mt-2">
                +12% <span className="text-slate-400 font-normal">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-2xl p-6">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">List of recently added products will appear here.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl p-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Database Connection</span>
                <span className="text-emerald-500 font-bold">Stable</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">WHMCS Sync</span>
                <span className="text-amber-500 font-bold">Pending</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Storage Usage</span>
                <span className="text-slate-900 font-bold">4.2 GB / 100 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
