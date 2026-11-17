import type { JSX } from "react";

import { canonicalLink, SITE_NAME, absoluteUrl } from "./canonical";
import type { JsonLdObject } from "./jsonld";

export type MetaEntry = JSX.IntrinsicElements["meta"];

export type LinkEntry = JSX.IntrinsicElements["link"];

function jsonLdMeta(node: JsonLdObject): MetaEntry {
  return { "script:ld+json": node } as unknown as MetaEntry;
}

const DEFAULT_OG_IMAGE = "/og-cover.svg";
const DEFAULT_OG_IMAGE_ALT =
  "GROWUPHOST — enterprise NVMe hosting, VPS and dedicated servers in Mumbai";

function resolveImageUrl(image: string): string {
  return /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
}

export interface PageHeadOptions {
  title: string;

  description: string;

  path: string;

  ogTitle?: string;

  ogDescription?: string;

  ogType?: "website" | "article";

  twitterCard?: "summary" | "summary_large_image";

  ogImage?: string;

  ogImageAlt?: string;

  robots?: string;

  jsonLd?: readonly JsonLdObject[];
}

export interface PageHead {
  meta: MetaEntry[];
  links: LinkEntry[];
}

export function buildPageHead(options: PageHeadOptions): PageHead {
  const url = absoluteUrl(options.path);
  const ogTitle = options.ogTitle ?? options.title;
  const ogDescription = options.ogDescription ?? options.description;
  const ogImage = resolveImageUrl(options.ogImage ?? DEFAULT_OG_IMAGE);
  const ogImageAlt = options.ogImageAlt ?? DEFAULT_OG_IMAGE_ALT;

  const meta: MetaEntry[] = [
    { title: options.title },
    { name: "description", content: options.description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:type", content: options.ogType ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: ogImageAlt },
    { name: "twitter:card", content: options.twitterCard ?? "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: ogImageAlt },
  ];

  if (options.robots) meta.push({ name: "robots", content: options.robots });

  for (const node of options.jsonLd ?? []) {
    meta.push(jsonLdMeta(node));
  }

  return {
    meta,
    links: [canonicalLink(options.path)],
  };
}
