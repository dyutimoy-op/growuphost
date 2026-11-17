import { Pause, Play, MessageSquareQuote, Quote, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WHMCS_LINKS } from "@/config/whmcs";
import { useBrokenImage } from "@/hooks/use-broken-image";
import { toMediaSrc } from "@/lib/media-url";
import { cn } from "@/lib/utils";

import { Reveal } from "./sections/Reveal";
import { CTA_SECONDARY } from "./sections/cta-styles";
import { LoadingAnnouncement } from "./sections/states";
import { useTestimonials, type Testimonial } from "./sections/use-testimonials";

function clampRating(rating: number | null): number {
  if (typeof rating !== "number" || !Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "G";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${second}`.toUpperCase();
}

function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="sr-only">{`Rated ${rating} out of 5`}</span>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            step <= rating ? "fill-amber-400 text-amber-400" : "text-slate-500"
          }`}
        />
      ))}
    </div>
  );
}

function Person({ testimonial, large = false }: { testimonial: Testimonial; large?: boolean }) {
  const size = large ? "h-14 w-14" : "h-11 w-11";

  const avatarSrc = toMediaSrc(testimonial.avatar_url);

  const avatar = useBrokenImage(avatarSrc);
  return (
    <div className="flex items-center gap-4">
      {avatarSrc && !avatar.isBroken ? (
        <img
          src={avatarSrc}
          ref={avatar.mediaRef}

          alt=""
          className={`${size} shrink-0 rounded-2xl border border-white/10 object-cover`}
          loading="lazy"
          decoding="async"
          onError={avatar.handleError}
        />
      ) : (
        <span
          className={`${size} flex shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-600/20 text-sm font-black text-blue-200`}
          aria-hidden="true"
        >
          {initials(testimonial.name)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-black tracking-wide text-slate-950 dark:text-white uppercase">
          {testimonial.name}
        </span>
        {testimonial.role && (
          <span className="mt-0.5 block truncate text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
            {testimonial.role}
          </span>
        )}
      </span>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full w-[300px] shrink-0 flex-col justify-between rounded-[2rem] border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-slate-900/60 p-7 sm:w-[360px]">
      <div>
        <Rating rating={clampRating(testimonial.rating)} />
        <blockquote className="mt-5">
          <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
            {testimonial.content}
          </p>
        </blockquote>
      </div>
      <figcaption className="mt-7 border-t border-slate-100 dark:border-white/5 pt-5">
        <Person testimonial={testimonial} />
      </figcaption>
    </figure>
  );
}

function TestimonialSkeleton() {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-7">
      <Skeleton className="h-3.5 w-24 rounded-full bg-white/10" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-3 w-full rounded-full bg-white/5" />
        <Skeleton className="h-3 w-11/12 rounded-full bg-white/5" />
        <Skeleton className="h-3 w-4/5 rounded-full bg-white/5" />
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Skeleton className="h-11 w-11 shrink-0 rounded-2xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-2.5 w-20 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { data, isPending, isError } = useTestimonials();

  const [marqueePaused, setMarqueePaused] = useState(false);
  const testimonials = data ?? [];
  const [featured, ...rest] = testimonials;
  const marqueeItems = rest.length >= 3 ? rest : [];
  const gridItems = rest.length >= 3 ? [] : rest;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-slate-950 py-20 lg:py-28"
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-600/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal preset="fade" className="mb-14 max-w-3xl lg:mb-16">
          <p className="mb-3 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase">
            Client Success
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.05]"
          >
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
              thousands.
            </span>
          </h2>
          <p className="mt-4 text-base font-medium text-slate-700 dark:text-slate-300 lg:text-lg leading-relaxed">
            Agencies, developers, eCommerce and enterprise businesses run their websites on
            GROWUPHOST. Here is what they experience.
          </p>
        </Reveal>

        {isPending && (
          <>
            <LoadingAnnouncement label="Loading customer testimonials" />
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-hidden="true"
            >
              <TestimonialSkeleton />
              <TestimonialSkeleton />
              <TestimonialSkeleton />
            </div>
          </>
        )}

        {!isPending && isError && (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/30 px-8 py-14 text-center">
            <h3 className="text-lg font-black tracking-tight text-white">
              Reviews are taking a moment
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium text-slate-400">
              We couldn't load customer stories just now — it doesn't affect anything else on the
              site. Please try again shortly.
            </p>
          </div>
        )}

        {!isPending && !isError && !featured && (
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/50 px-8 py-16 text-center backdrop-blur-xl lg:px-16">
            <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <MessageSquareQuote className="h-6 w-6 text-blue-400" aria-hidden="true" />
            </span>
            <h3 className="text-2xl font-black tracking-tighter text-white lg:text-3xl">
              Be one of our first published reviews
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed font-medium text-slate-400 lg:text-base">
              We only publish reviews from verified customers, and we are still collecting the first
              batch. In the meantime, judge us on the things you can check: a Tier 4 Mumbai
              facility, a 99.9% uptime SLA and support tickets answered by engineers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className={`rounded-2xl px-7 py-6 text-xs font-black tracking-widest uppercase ${CTA_SECONDARY}`}
              >
                <a href={WHMCS_LINKS.support}>Talk to our team</a>
              </Button>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" /> Verified
              customers only
            </p>
          </div>
        )}

        {!isPending && !isError && featured && (
          <div className="space-y-10">
            <Reveal preset="scale" amount={0.25}>
              <figure className="relative overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-white shadow-xl dark:bg-slate-900/60 p-8 backdrop-blur-xl lg:p-14">
                <Quote
                  className="absolute top-8 right-8 h-16 w-16 text-blue-500/15 lg:h-24 lg:w-24"
                  aria-hidden="true"
                />
                <Rating rating={clampRating(featured.rating)} />
                <blockquote className="mt-6">
                  <p className="max-w-3xl text-xl leading-snug font-black tracking-tight text-slate-950 dark:text-white lg:text-3xl lg:leading-tight">
                    “{featured.content}”
                  </p>
                </blockquote>
                <figcaption className="mt-8 border-t border-slate-100 dark:border-white/5 pt-6">
                  <Person testimonial={featured} large />
                </figcaption>
              </figure>
            </Reveal>

            {gridItems.length > 0 && (
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {gridItems.map((testimonial, index) => (
                  <li key={testimonial.id}>
                    <Reveal preset="pop" delay={index * 0.06} duration={0.4} className="h-full">
                      <div className="h-full [&>figure]:w-full">
                        <TestimonialCard testimonial={testimonial} />
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}

            {marqueeItems.length > 0 && (
              <div
                className="group relative -mx-6 overflow-hidden px-6 lg:-mx-8 lg:px-8"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }}
              >
                <ul
                  id="testimonial-marquee"
                  className={cn(
                    "flex w-max animate-marquee gap-6 [animation-duration:48s] group-hover:[animation-play-state:paused]",
                    "motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center",
                    marqueePaused && "[animation-play-state:paused]",
                  )}
                >
                  {marqueeItems.map((testimonial) => (
                    <li key={testimonial.id} className="flex">
                      <TestimonialCard testimonial={testimonial} />
                    </li>
                  ))}

                  {marqueeItems.map((testimonial) => (
                    <li
                      key={`duplicate-${testimonial.id}`}
                      className="flex motion-reduce:hidden"
                      aria-hidden="true"
                    >
                      <TestimonialCard testimonial={testimonial} />
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex justify-center motion-reduce:hidden">
                  <button
                    type="button"
                    onClick={() => setMarqueePaused((paused) => !paused)}
                    aria-pressed={marqueePaused}
                    aria-controls="testimonial-marquee"
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-black tracking-widest text-slate-300 uppercase transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                  >
                    {marqueePaused ? (
                      <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Pause className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {marqueePaused ? "Resume scrolling" : "Pause scrolling"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
