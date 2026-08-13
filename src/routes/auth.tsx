import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Route = createFileRoute('/auth' as any)({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for confirmation!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#5831f7] text-white p-8">
            <CardTitle className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription className="text-slate-300">
              {mode === 'login' ? 'Enter your credentials to access your hosting dashboard.' : 'Join us today and start your hosting journey.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200 focus:ring-primary h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-slate-200 focus:ring-primary h-12"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-[#5831f7] hover:bg-[#4828d9] font-bold">
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6 text-center justify-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-bold text-primary hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
