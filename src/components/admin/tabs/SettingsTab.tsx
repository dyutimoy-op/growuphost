import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";
import { WHMCS_BASE_URL, WHMCS_LINKS } from "@/config/whmcs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/media-optimization";
import {
  BRAND_LOGO_SIZE_KEY,
  BRAND_LOGO_URL_KEY,
  BRAND_SHOW_TEXT_KEY,
  DEFAULT_BRAND_LOGO_SIZE,
  DEFAULT_BRAND_SHOW_TEXT_MODE,
} from "@/lib/brand";
import { MediaField } from "../MediaField";
import type { SiteSettingInsert } from "../admin-types";
import { getErrorMessage } from "../admin-utils";
import { invalidateEntity } from "../admin-invalidation";

type FieldKind = "text" | "email" | "tel" | "url" | "textarea" | "media" | "choice";

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  kind?: FieldKind | undefined;
  helper?: string | undefined;

  warning?: string | undefined;

  options?: readonly { value: string; label: string }[] | undefined;

  defaultValue?: string | undefined;
}

interface SettingGroup {
  title: string;
  description: string;
  fields: readonly SettingField[];
}

const WHMCS_URL_KEYS = new Set(["whmcs_url", "login_url", "register_url"]);

const SETTING_GROUPS: readonly SettingGroup[] = [
  {
    title: "Brand & Identity",
    description: "Used in the navbar, footer, admin panel and page titles.",
    fields: [
      { key: "company_name", label: "Company Name", placeholder: "GROWUPHOST" },
      {
        key: "tagline",
        label: "Tagline",
        placeholder: "UNMATCHED PERFORMANCE",
        helper: "Short strapline shown beside the company name.",
      },
      {
        key: BRAND_LOGO_URL_KEY,
        label: "Brand Logo",
        placeholder: "",
        kind: "media",
        helper:
          "Replaces the letter badge beside your company name in the navbar, footer and this panel. Leave it empty to keep the letter. PNG or WebP with a transparent background works best — SVG is not accepted for security reasons, so export at roughly 3× the size you want and it will be scaled down. Anything over 1200px is resized; the format and filename are kept exactly.",
      },
      {
        key: BRAND_LOGO_SIZE_KEY,
        label: "Logo Size",
        placeholder: "",
        kind: "choice",
        defaultValue: DEFAULT_BRAND_LOGO_SIZE,
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
        helper:
          "Scales the logo — or the letter badge — on every surface at once. Medium is the original size.",
      },
      {
        key: BRAND_SHOW_TEXT_KEY,
        label: "Brand Name Text Beside Logo",
        placeholder: "",
        kind: "choice",
        defaultValue: DEFAULT_BRAND_SHOW_TEXT_MODE,
        options: [
          {
            value: "auto",
            label: "Auto (Hide text when logo image is used, show for letter badge)",
          },
          { value: "hide", label: "Hide text (Logo image only)" },
          { value: "show", label: "Always show text beside logo" },
        ],
        helper:
          "Controls whether the company name text is rendered beside the logo. In Auto mode, it automatically hides text when an image logo is set to prevent duplicate name display.",
      },
    ],
  },
  {
    title: "Homepage Banner",
    description: "The hero copy at the top of the homepage.",
    fields: [
      { key: "banner_headline", label: "Banner Headline", placeholder: "UNMATCHED PERFORMANCE" },
      {
        key: "banner_subheadline",
        label: "Banner Subheadline",
        placeholder: "Enterprise-grade infrastructure engineered for speed, uptime, and scale.",
        kind: "textarea",
      },
    ],
  },
  {
    title: "Support & Contact",
    description: "Shown in the footer and on the contact page.",
    fields: [
      {
        key: "support_phone",
        label: "Support Phone",
        placeholder: "+91 72 52 89 0016",
        kind: "tel",
      },
      {
        key: "support_email",
        label: "Support Email",
        placeholder: "support@growuphost.com",
        kind: "email",
      },
      {
        key: "support_address",
        label: "Support Address",
        placeholder: "Mumbai, Maharashtra, India",
        kind: "textarea",
      },
    ],
  },
  {
    title: "WHMCS Destinations",
    description:
      "This site owns no accounts, carts, or invoices — WHMCS does. These are the external destinations customers are sent to.",
    fields: [
      {
        key: "whmcs_url",
        label: "WHMCS Base URL",
        placeholder: WHMCS_BASE_URL,
        kind: "url",
        helper: "The root of the billing install. Leave blank to use the built-in default.",
      },
      {
        key: "login_url",
        label: "Client Area URL",
        placeholder: WHMCS_LINKS.clientArea,
        kind: "url",
        helper: "Where the navbar's Login button sends existing customers, in WHMCS.",
        warning:
          "Must be a full URL on the WHMCS host. An in-app path such as /auth is the staff-only admin login and will be ignored by the public site.",
      },
      {
        key: "register_url",
        label: "Registration URL",
        placeholder: WHMCS_LINKS.register,
        kind: "url",
        helper: "Where new customers sign up, in WHMCS.",
        warning:
          "Must be a full URL on the WHMCS host. An in-app path such as /auth will be ignored by the public site.",
      },
    ],
  },
  {
    title: "SEO Defaults",
    description: "Fallback metadata for pages without their own.",
    fields: [
      {
        key: "meta_title",
        label: "Default Meta Title",
        placeholder: "GROWUPHOST | High-Performance Hosting, VPS & Dedicated Servers",
        helper: "Aim for under 60 characters so it is not truncated in search results.",
      },
      {
        key: "meta_description",
        label: "Default Meta Description",
        placeholder: "Enterprise-grade shared hosting, reseller plans, VPS and dedicated servers…",
        kind: "textarea",
        helper: "Aim for 120–160 characters.",
      },
    ],
  },
  {
    title: "Social Profiles",
    description: "Leave a field blank to hide that icon on the public site.",
    fields: [
      {
        key: "social_twitter",
        label: "X / Twitter URL",
        placeholder: "https://x.com/growuphost",
        kind: "url",
      },
      {
        key: "social_facebook",
        label: "Facebook URL",
        placeholder: "https://facebook.com/growuphost",
        kind: "url",
      },
      {
        key: "social_linkedin",
        label: "LinkedIn URL",
        placeholder: "https://linkedin.com/company/growuphost",
        kind: "url",
      },
    ],
  },
];

const ALL_FIELDS: readonly SettingField[] = SETTING_GROUPS.flatMap((group) => group.fields);

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of ALL_FIELDS) {
    const raw = (values[field.key] ?? "").trim();
    if (raw.length === 0) continue;

    if (WHMCS_URL_KEYS.has(field.key) && !isAbsoluteHttpUrl(raw)) {
      errors[field.key] =
        "Enter a full URL starting with http:// or https://. WHMCS is on a different host, so a relative path can never reach it and the public site will discard this value.";
      continue;
    }

    if (field.kind === "url" && !isAbsoluteHttpUrl(raw)) {
      errors[field.key] = "Enter a full URL starting with http:// or https://.";
      continue;
    }

    if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      errors[field.key] = "Enter a valid email address.";
    }
  }

  return errors;
}

export function SettingsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, isError, error, refetch } = useSiteSettings();

  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [baseline, setBaseline] = useState<Record<string, string> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings || values !== null) return;
    const next: Record<string, string> = {};
    for (const field of ALL_FIELDS) {
      const saved = settings[field.key];

      next[field.key] =
        saved !== undefined && saved.length > 0 ? saved : (field.defaultValue ?? "");
    }
    setValues(next);
    setBaseline(next);
  }, [settings, values]);

  const changedKeys = useMemo(() => {
    if (!values || !baseline) return [];
    return ALL_FIELDS.map((field) => field.key).filter(
      (key) => (values[key] ?? "") !== (baseline[key] ?? ""),
    );
  }, [values, baseline]);

  const saveMutation = useMutation({
    mutationFn: async (rows: SiteSettingInsert[]): Promise<number> => {
      const { error: upsertError } = await supabase
        .from("site_settings")
        .upsert(rows, { onConflict: "key" });
      if (upsertError) throw upsertError;
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
    onError: (saveError: unknown) => {
      toast.error(getErrorMessage(saveError, "Could not save settings"));
    },
  });

  const handleSave = (): void => {
    if (!values) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    if (changedKeys.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    saveMutation.mutate(changedKeys.map((key) => ({ key, value: (values[key] ?? "").trim() })));
  };

  const handleReset = (): void => {
    if (baseline) setValues({ ...baseline });
    setErrors({});
  };

  if (isError) {
    return (
      <Card className="border-red-500/20 bg-red-500/5 rounded-[2rem] p-8 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
          <h2 className="text-xl font-black text-white tracking-tighter">
            Could not load settings
          </h2>
        </div>
        <p className="text-sm font-medium text-slate-300">
          {getErrorMessage(error, "The settings table could not be read.")}
        </p>
        <Button
          onClick={() => void refetch()}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold min-h-11 cursor-pointer transition-colors duration-200"
        >
          Try again
        </Button>
      </Card>
    );
  }

  const isBusy = saveMutation.isPending;
  const dirtyCount = changedKeys.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Global Settings</h2>
          <p className="text-sm font-medium text-slate-300 mt-1" aria-live="polite">
            {isLoading || !values
              ? "Loading saved values…"
              : dirtyCount === 0
                ? "All changes saved."
                : dirtyCount === 1
                  ? "1 unsaved change."
                  : `${dirtyCount} unsaved changes.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isBusy || dirtyCount === 0}
            className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-bold min-h-11 px-6 cursor-pointer transition-colors duration-200"
          >
            Discard changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={isBusy || !values}
            className="bg-blue-600 hover:bg-blue-700 px-8 font-black rounded-xl min-h-11 cursor-pointer transition-colors duration-200"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" aria-hidden="true" /> Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {!values ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-64 rounded-[2rem] border border-white/5 bg-slate-900/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {SETTING_GROUPS.map((group) => (
            <Card
              key={group.title}
              className="border-white/5 bg-slate-900/50 p-8 rounded-[2rem] space-y-6"
            >
              <div className="border-b border-white/5 pb-4 space-y-1">
                <h3 className="text-xl font-black text-white tracking-tighter">{group.title}</h3>
                <p className="text-xs font-medium text-slate-300">{group.description}</p>
              </div>

              <div className="space-y-5">
                {group.fields.map((field) => {
                  const inputId = `setting-${field.key}`;
                  const helperId = `${inputId}-helper`;
                  const errorId = `${inputId}-error`;
                  const value = values[field.key] ?? "";
                  const fieldError = errors[field.key];
                  const isDirty = (baseline?.[field.key] ?? "") !== value;
                  const describedBy = fieldError ? errorId : field.helper ? helperId : undefined;
                  const setValue = (next: string): void =>
                    setValues((previous) => ({ ...(previous ?? {}), [field.key]: next }));

                  const ownsItsLabel = field.kind === "media";

                  let control: ReactNode;
                  if (field.kind === "media") {
                    control = (
                      <MediaField
                        label={field.label}
                        currentUrl={value}
                        path="brand"
                        pickerTitle="Choose your brand logo"

                        accept={ACCEPTED_IMAGE_TYPES}
                        onChange={setValue}
                      />
                    );
                  } else if (field.kind === "choice") {
                    control = (
                      <RadioGroup
                        value={value}
                        onValueChange={setValue}
                        disabled={isBusy}

                        aria-labelledby={`${inputId}-label`}
                        {...(describedBy === undefined ? {} : { "aria-describedby": describedBy })}
                        className="flex flex-wrap gap-2"
                      >
                        {(field.options ?? []).map((option) => (
                          <Label
                            key={option.value}
                            htmlFor={`${inputId}-${option.value}`}
                            className={cn(
                              "flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 font-bold transition-colors duration-200",
                              value === option.value
                                ? "border-blue-500 bg-blue-500/10 text-white"
                                : "border-white/10 bg-slate-950 text-slate-300 hover:bg-white/5",
                            )}
                          >
                            <RadioGroupItem
                              id={`${inputId}-${option.value}`}
                              value={option.value}
                              className="border-white/30 text-blue-400"
                            />
                            {option.label}
                          </Label>
                        ))}
                      </RadioGroup>
                    );
                  } else if (field.kind === "textarea") {
                    control = (
                      <Textarea
                        id={inputId}
                        value={value}
                        placeholder={field.placeholder}
                        disabled={isBusy}
                        onChange={(e) => setValue(e.target.value)}
                        aria-invalid={fieldError !== undefined}
                        aria-describedby={describedBy}
                        className="bg-slate-950 border-white/10 text-white rounded-xl h-24 transition-colors duration-200 focus-visible:border-blue-500"
                      />
                    );
                  } else {
                    control = (
                      <Input
                        id={inputId}
                        type={field.kind ?? "text"}
                        value={value}
                        placeholder={field.placeholder}
                        disabled={isBusy}
                        onChange={(e) => setValue(e.target.value)}
                        aria-invalid={fieldError !== undefined}
                        aria-describedby={describedBy}
                        className="bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500"
                      />
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-2">
                      {ownsItsLabel ? (
                        isDirty && (
                          <div className="flex justify-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                              Edited
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <Label
                            id={`${inputId}-label`}
                            {...(field.kind === "choice" ? {} : { htmlFor: inputId })}
                            className="text-slate-200 font-bold"
                          >
                            {field.label}
                          </Label>
                          {isDirty && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                              Edited
                            </span>
                          )}
                        </div>
                      )}

                      {control}

                      {field.helper && (
                        <p id={helperId} className="text-xs font-medium text-slate-300">
                          {field.helper}
                        </p>
                      )}

                      {field.warning && (
                        <p className="text-xs font-medium text-amber-300/90 flex gap-1.5">
                          <AlertTriangle
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{field.warning}</span>
                        </p>
                      )}

                      {fieldError && (
                        <p id={errorId} role="alert" className="text-xs font-bold text-red-400">
                          {fieldError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
