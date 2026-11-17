import { AlertTriangle, ArrowRight, PackageOpen, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WHMCS_LINKS } from "@/config/whmcs";

export function PlanCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`flex flex-col rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 lg:rounded-[2.5rem] lg:p-10 ${
        tall ? "lg:pt-14" : ""
      }`}
    >
      <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
      <Skeleton className="mt-4 h-8 w-2/3 rounded-lg bg-white/10" />
      <Skeleton className="mt-6 h-12 w-1/2 rounded-lg bg-white/10" />
      <Skeleton className="mt-3 h-3 w-32 rounded-full bg-white/5" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-3 w-full rounded-full bg-white/5" />
        <Skeleton className="h-3 w-5/6 rounded-full bg-white/5" />
      </div>
      <div className="mt-8 space-y-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 shrink-0 rounded-full bg-white/10" />
            <Skeleton className="h-3 flex-1 rounded-full bg-white/5" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-10 h-14 w-full rounded-2xl bg-white/10" />
    </div>
  );
}

export function PlanGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <PlanCardSkeleton key={index} tall={index === 1} />
      ))}
    </div>
  );
}

export function LoadingAnnouncement({ label }: { label: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {label}
    </p>
  );
}

export interface SectionNoticeProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  children?: ReactNode;
}

function SectionNotice({ icon: Icon = PackageOpen, title, message, children }: SectionNoticeProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/30 px-6 py-16 text-center lg:rounded-[2.5rem] lg:px-12">
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
        <Icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
      </span>
      <h3 className="text-xl font-black tracking-tight text-white lg:text-2xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-medium text-slate-400">
        {message}
      </p>
      {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function SectionError({
  title = "We couldn't load this right now",
  message = "Our catalogue is temporarily unreachable. You can retry, or browse everything directly in the GROWUPHOST store.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <SectionNotice icon={AlertTriangle} title={title} message={message}>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-white/5 px-6 py-6 text-xs font-black tracking-widest text-white uppercase hover:bg-white/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Try again
        </Button>
      )}
      <Button
        asChild
        className="rounded-xl bg-blue-600 px-6 py-6 text-xs font-black tracking-widest text-white uppercase hover:bg-blue-700"
      >
        <a href={WHMCS_LINKS.store}>
          Open the store <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </SectionNotice>
  );
}

export function SectionEmpty({
  title = "Plans are being finalised",
  message = "Our team is publishing this line-up right now. In the meantime, every live product is listed in the GROWUPHOST store.",
  children,
}: {
  title?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <SectionNotice title={title} message={message}>
      {children ?? (
        <Button
          asChild
          className="rounded-xl bg-blue-600 px-6 py-6 text-xs font-black tracking-widest text-white uppercase hover:bg-blue-700"
        >
          <a href={WHMCS_LINKS.store}>
            Browse the store <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      )}
    </SectionNotice>
  );
}
