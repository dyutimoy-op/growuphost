export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface PublicRoute {
  path: string;

  changefreq: ChangeFreq;

  priority: number;
}

export const STATIC_PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/packages", changefreq: "weekly", priority: 0.9 },
  { path: "/shared-hosting", changefreq: "weekly", priority: 0.9 },
  { path: "/vps-hosting", changefreq: "weekly", priority: 0.9 },
  { path: "/dedicated-servers", changefreq: "weekly", priority: 0.9 },
  { path: "/licenses", changefreq: "weekly", priority: 0.8 },
  { path: "/contact", changefreq: "monthly", priority: 0.6 },
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/legal/terms", changefreq: "yearly", priority: 0.2 },
  { path: "/legal/privacy", changefreq: "yearly", priority: 0.2 },
  { path: "/legal/sla", changefreq: "yearly", priority: 0.2 },
] as const;

export const PRIVATE_PATH_PREFIXES: readonly string[] = ["/auth", "/dashboard"] as const;

export function isPrivatePath(path: string): boolean {
  const lower = path.toLowerCase();
  return PRIVATE_PATH_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}/`));
}

const STATIC_PATH_SET: ReadonlySet<string> = new Set(STATIC_PUBLIC_ROUTES.map((r) => r.path));

export function isCoveredByStaticRoute(path: string): boolean {
  return STATIC_PATH_SET.has(path);
}
