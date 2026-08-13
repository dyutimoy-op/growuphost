import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: '/dashboard' });
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Successfully logged in!');
        navigate({ to: '/dashboard' });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Registration successful! Please check your email for confirmation.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden pt-32 pb-20">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
        
        <Card className="w-full max-w-md border border-white/10 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
          <CardHeader className="p-10 pb-6 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">
                {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE NETWORK'}
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                {mode === 'login' 
                  ? 'Access your enterprise infrastructure dashboard.' 
                  : 'Start your high-performance hosting journey today.'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-10 pb-10 pt-2">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="name@enterprise.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Password</label>
                  {mode === 'login' && (
                    <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 group transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    PROCESSING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex justify-center items-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
            >
              {mode === 'login' ? "New here? Sign Up" : "Back to login"}
            </button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}