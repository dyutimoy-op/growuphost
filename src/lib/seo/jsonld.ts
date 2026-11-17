import { SITE_NAME, SITE_ORIGIN, absoluteUrl } from "./canonical";

export type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

export function serializeJsonLd(node: JsonLdObject): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    description:
      "GROWUPHOST provides NVMe shared hosting, VPS, and dedicated servers from Tier 3 data centres in Mumbai, India.",
    slogan: "High-performance hosting infrastructure.",
  };
}

export function organizationRef(): JsonLdObject {
  return { "@id": ORGANIZATION_ID, "@type": "Organization", name: SITE_NAME };
}

export interface BreadcrumbItem {
  name: string;

  path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLdObject {
  const trail: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ServiceJsonLdOptions {
  name: string;
  description: string;

  path: string;

  serviceType: string;
}

export function serviceJsonLd(options: ServiceJsonLdOptions): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: options.name,
    serviceType: options.serviceType,
    description: options.description,
    url: absoluteUrl(options.path),
    provider: organizationRef(),
    areaServed: { "@type": "Place", name: "Worldwide" },
  };
}

export interface WebPageJsonLdOptions {
  name: string;
  description: string;
  path: string;

  dateModified?: string;
}

export function webPageJsonLd(options: WebPageJsonLdOptions): JsonLdObject {
  const node: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    publisher: organizationRef(),
    inLanguage: "en",
  };
  if (options.dateModified) node["dateModified"] = options.dateModified;
  return node;
}

export interface CollectionPageJsonLdOptions {
  name: string;
  description: string;
  path: string;
}

export function collectionPageJsonLd(options: CollectionPageJsonLdOptions): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    publisher: organizationRef(),
    inLanguage: "en",
  };
}
