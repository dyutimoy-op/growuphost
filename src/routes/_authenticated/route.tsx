import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AdminLayout,

  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
});

type GateStatus = "checking" | "allowed" | "denied";

function AdminLayout() {
  const [status, setStatus] = useState<GateStatus>("checking");
  const navigate = useNavigate();

  const evaluateAccess = useCallback(async (): Promise<GateStatus> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return "denied";

    const { data: isAdmin, error } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });

    if (error || isAdmin !== true) return "denied";

    return "allowed";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async (): Promise<void> => {
      const next = await evaluateAccess();
      if (!cancelled) setStatus(next);
    };

    void run();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !cancelled) setStatus("denied");
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [evaluateAccess]);

  useEffect(() => {
    if (status === "denied") void navigate({ to: "/auth", replace: true });
  }, [status, navigate]);

  if (status === "checking") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" aria-hidden="true" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">
            Verifying admin access…
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <ShieldAlert className="w-8 h-8 text-red-400" aria-hidden="true" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">
            Redirecting to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <Outlet />
    </div>
  );
}
