function splitLastWord(title: string): { lead: string; emphasis: string } {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lead: "", emphasis: title };
  const emphasis = words[words.length - 1] ?? title;
  return { lead: words.slice(0, -1).join(" "), emphasis };
}

export interface PageHeroProps {
  title: string;

  subtitle: string;

  eyebrow?: string;

  uppercase?: boolean;
}

export function PageHero({ title, subtitle, eyebrow, uppercase = false }: PageHeroProps) {
  const { lead, emphasis } = splitLastWord(title);

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-6 pt-56 sm:pt-64 lg:pt-72 pb-12 sm:pb-16 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 text-center">
        {eyebrow ? (
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300 shadow-xs">
              {eyebrow}
            </span>
          </div>
        ) : null}

        <h1
          className={`text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]${
            uppercase ? " uppercase" : ""
          }`}
        >
          {lead ? `${lead} ` : null}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
            {emphasis}
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-slate-700 dark:text-slate-300">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
