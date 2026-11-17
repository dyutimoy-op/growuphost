import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BarChart3, CheckCircle2, Info, Loader2, Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { runSEOAudit, type SEOAuditResult } from "@/utils/seo-audit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteSettingInsert } from "../admin-types";
import { getErrorMessage } from "../admin-utils";
import { AdminTableError } from "../admin-table-parts";
import { invalidateEntity } from "../admin-invalidation";

const ANALYTICS_FIELDS = [
  {
    key: "google_analytics_id",
    label: "Google Analytics (GA4 Measurement ID)",
    placeholder: "G-XXXXXXXXXX",
    helper:
      "Found in Google Analytics under Admin → Data Streams. Leave blank to disable tracking.",
  },
  {
    key: "google_search_console_tag",
    label: "Search Console Verification Tag",
    placeholder: "google-site-verification=…",
    helper: "The verification token from Google Search Console's HTML tag method.",
  },
] as const;

function parseAudit(raw: string | undefined): SEOAuditResult | null {
  if (!raw || raw.trim().length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<SEOAuditResult>;
    if (typeof candidate.score !== "number" || typeof candidate.last_run !== "string") return null;
    return {
      score: candidate.score,
      last_run: candidate.last_run,
      issues: Array.isArray(candidate.issues) ? candidate.issues : [],

      scope: typeof candidate.scope === "string" ? candidate.scope : "",
      audited_routes: Array.isArray(candidate.audited_routes) ? candidate.audited_routes : [],
      failed_routes: Array.isArray(candidate.failed_routes) ? candidate.failed_routes : [],
    };
  } catch {
    return null;
  }
}

export function SeoTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, isError, error, refetch } = useSiteSettings();

  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [baseline, setBaseline] = useState<Record<string, string> | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (!settings || values !== null) return;
    const next: Record<string, string> = {};
    for (const field of ANALYTICS_FIELDS) {
      next[field.key] = settings[field.key] ?? "";
    }
    setValues(next);
    setBaseline(next);
  }, [settings, values]);

  const changedKeys = useMemo(() => {
    if (!values || !baseline) return [];
    return ANALYTICS_FIELDS.map((field) => field.key).filter(
      (key) => (values[key] ?? "") !== (baseline[key] ?? ""),
    );
  }, [values, baseline]);

  const saveMutation = useMutation({
    mutationFn: async (rows: SiteSettingInsert[]): Promise<number> => {
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count, rows) => {
      setBaseline((previous) => {
        const next = { ...(previous ?? {}) };
        for (const row of rows) next[row.key] = row.value ?? "";
        return next;
      });
      void invalidateEntity(queryClient, "settings");
      toast.success(count === 1 ? "1 setting saved" : `${count} settings saved`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the analytics settings"));
    },
  });

  const handleSave = (): void => {
    if (!values) return;
    if (changedKeys.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    saveMutation.mutate(changedKeys.map((key) => ({ key, value: (values[key] ?? "").trim() })));
  };

  const handleAudit = async (): Promise<void> => {
    setIsAuditing(true);
    try {
      const result = await runSEOAudit();

      await invalidateEntity(queryClient, "settings");
      toast.success(`Audit complete — score ${result.score}/100`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "The SEO audit could not be completed"));
    } finally {
      setIsAuditing(false);
    }
  };

  const audit = parseAudit(settings?.["seo_audit_results"]);
  const isBusy = saveMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">SEO &amp; Performance</h2>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Tracking tags and an on-page audit of the currently rendered document.
          </p>
        </div>
        <Button
          onClick={() => void handleAudit()}
          disabled={isAuditing}
          className="bg-blue-600 hover:bg-blue-700 px-8 font-black rounded-xl min-h-11 cursor-pointer transition-colors duration-200"
        >
          {isAuditing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> Auditing…
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" /> Run SEO Audit
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-white/5 bg-slate-900/50 p-8 rounded-[2rem] space-y-6">
          <h3 className="text-xl font-black text-white tracking-tighter border-b border-white/5 pb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" aria-hidden="true" /> Analytics &amp; Tracking
          </h3>

          {isError ? (
            <AdminTableError
              entity="analytics settings"
              error={error}
              consequence="Your live tracking IDs are unchanged — this only blocks editing them here."
              onRetry={() => void refetch()}
            />
          ) : isLoading || !values ? (
            <div className="space-y-4">
              {ANALYTICS_FIELDS.map((field) => (
                <div key={field.key} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {ANALYTICS_FIELDS.map((field) => {
                  const inputId = `seo-${field.key}`;
                  const isDirty = (baseline?.[field.key] ?? "") !== (values[field.key] ?? "");
                  return (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={inputId} className="text-slate-200 font-bold">
                          {field.label}
                        </Label>
                        {isDirty && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                            Edited
                          </span>
                        )}
                      </div>
                      <Input
                        id={inputId}
                        value={values[field.key] ?? ""}
                        placeholder={field.placeholder}
                        disabled={isBusy}
                        onChange={(e) =>
                          setValues((previous) => ({
                            ...(previous ?? {}),
                            [field.key]: e.target.value,
                          }))
                        }
                        aria-describedby={`${inputId}-helper`}
                        className="bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500"
                      />
                      <p id={`${inputId}-helper`} className="text-xs font-medium text-slate-300">
                        {field.helper}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={handleSave}
                disabled={isBusy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl py-6 min-h-11 cursor-pointer transition-colors duration-200"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" aria-hidden="true" /> Save Tracking Settings
                  </>
                )}
              </Button>
            </>
          )}
        </Card>

        <Card className="border-white/5 bg-slate-900/50 p-8 rounded-[2rem] space-y-6">
          <h3 className="text-xl font-black text-white tracking-tighter border-b border-white/5 pb-4">
            Latest Audit Results
          </h3>

          {!audit ? (
            <p className="text-slate-300 font-bold">No audit has been run yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Health Score</span>
                <span
                  className={
                    audit.score > 80
                      ? "text-2xl font-black text-emerald-400"
                      : "text-2xl font-black text-orange-400"
                  }
                >
                  {audit.score}/100
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300">
                Last run {new Date(audit.last_run).toLocaleString()}
              </p>

              {audit.scope.length > 0 && (
                <p className="text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="font-black uppercase tracking-widest text-slate-200">
                    Scope:{" "}
                  </span>
                  {audit.scope}
                </p>
              )}

              {audit.failed_routes.length > 0 && (
                <p
                  role="alert"
                  className="text-xs font-bold text-orange-300 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3"
                >
                  Could not fetch: {audit.failed_routes.join(", ")}
                </p>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {audit.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> No SEO issues detected
                  </div>
                ) : (
                  audit.issues.map((issue, index) => (
                    <div
                      key={`${issue.route}-${issue.message}-${index}`}
                      className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      {issue.type === "error" ? (
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
                      ) : issue.type === "warning" ? (
                        <AlertCircle
                          className="w-5 h-5 text-orange-400 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Info className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
                      )}
                      <div className="text-xs">
                        <div className="text-white font-bold">{issue.message}</div>
                        <div className="text-slate-300 font-medium">Route: {issue.route}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
