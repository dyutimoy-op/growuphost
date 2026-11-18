import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { WHMCS_LINKS } from "@/config/whmcs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  component: AdminLoginPage,
  head: () => ({
    title: "Staff Login | GROWUPHOST Admin",
    meta: [
      {
        name: "description",
        content:
          "Internal staff login for the GROWUPHOST content management panel. Customers should sign in to the client area instead.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.length > 0) return error;
  return fallback;
}

const NOT_AUTHORISED_MESSAGE =
  "Not authorised. This account does not have administrator access to the CMS.";

async function assertAdminOrSignOut(userId: string): Promise<boolean> {
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error || isAdmin !== true) {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const resumeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      const isAdmin = await assertAdminOrSignOut(session.user.id);
      if (cancelled) return;

      if (isAdmin) {
        navigate({ to: "/dashboard" });
        return;
      }

      setNotice(NOT_AUTHORISED_MESSAGE);
      setCheckingSession(false);
    };

    void resumeSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) {
        await supabase.auth.signOut();
        throw new Error("Sign-in did not return a user.");
      }

      const isAdmin = await assertAdminOrSignOut(userId);
      if (!isAdmin) {
        setNotice(NOT_AUTHORISED_MESSAGE);
        setPassword("");
        toast.error(NOT_AUTHORISED_MESSAGE);
        return;
      }

      toast.success("Signed in.");
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      const message = errorMessage(error, "Sign-in failed. Please try again.");
      setNotice(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your staff email address first.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo =
        typeof window === "undefined" ? undefined : `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        trimmed,
        redirectTo ? { redirectTo } : {},
      );
      if (error) throw error;
      toast.success("If that address belongs to a staff account, a reset link is on its way.");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not send the reset email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-blue-500/30 selection:text-blue-400">
      <main
        id="main-content"
        className="flex-grow flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <Card className="w-full border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in motion-safe:duration-500">
            <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                  Staff Access Only
                </span>

                <h1 className="text-2xl sm:text-3xl leading-none font-black tracking-tighter text-white italic lg:text-4xl">
                  ADMIN CONTROL PANEL
                </h1>
                <CardDescription className="text-slate-400 text-xs sm:text-sm font-medium">
                  Internal sign-in for GROWUPHOST content administrators. This is not a customer
                  login.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-8 sm:pb-10 pt-2">
              {notice && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold leading-relaxed text-red-200">{notice}</p>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2.5">
                  <label
                    htmlFor="admin-email"
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block"
                  >
                    Staff Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@growuphost.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 bg-white/5 border-white/5 text-white rounded-2xl h-14 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center ml-1">
                    <label
                      htmlFor="admin-password"
                      className="text-xs font-black uppercase tracking-[0.2em] text-slate-400"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={loading}
                      className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 bg-white/5 border-white/5 text-white rounded-2xl h-14 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || checkingSession}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 group transition-all active:scale-[0.98]"
                >
                  {loading || checkingSession ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white motion-safe:animate-pulse" />
                      {checkingSession ? "CHECKING SESSION..." : "VERIFYING..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      STAFF SIGN IN
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex flex-col gap-3 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Are you a customer?
              </p>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Hosting accounts, invoices, and support tickets live in the client area.
              </p>
              <a
                href={WHMCS_LINKS.clientArea}
                className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                Go to Client Area
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </CardFooter>
          </Card>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to growuphost.com
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
