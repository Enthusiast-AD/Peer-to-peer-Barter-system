import { useEffect } from "react";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
  SITE_TWITTER_HANDLE,
  SITE_DEFAULT_IMAGE,
  SITE_DEFAULT_TITLE,
  siteTitle,
  absoluteUrl,
} from "../utils/seo";

interface SEOProps {
  title: string;
  description: string;
  /** Route path (e.g. "/help"). Defaults to "/". */
  path?: string;
  image?: string;
  type?: string;
  /** Optional structured data payload(s) injected as JSON-LD. */
  jsonLd?: object | object[];
  noindex?: boolean;
}

const PAGE_MARKER_ATTR = "data-seo-page";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(PAGE_MARKER_ATTR, "true");
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.setAttribute(PAGE_MARKER_ATTR, "true");
  el.setAttribute("href", href);
}

function upsertJsonLd(payloads: object[]) {
  document.head
    .querySelectorAll<HTMLScriptElement>(`script[type="application/ld+json"][${PAGE_MARKER_ATTR}]`)
    .forEach((el) => el.remove());
  payloads.forEach((payload) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(PAGE_MARKER_ATTR, "true");
    script.textContent = JSON.stringify(payload);
    document.head.appendChild(script);
  });
}

function cleanupPageSeo() {
  document.head
    .querySelectorAll(`[${PAGE_MARKER_ATTR}]`)
    .forEach((el) => el.remove());
  document.title = SITE_DEFAULT_TITLE;
}

/**
 * Declarative, dependency-free per-page SEO manager.
 *
 * Sets the document title, meta description, canonical URL, Open Graph and
 * Twitter tags, and optional JSON-LD structured data. All tags are cleaned up
 * when the page unmounts so SPA navigation never leaks stale metadata.
 */
export function SEO({
  title,
  description,
  path = "/",
  image = SITE_DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const url = absoluteUrl(path);
    const fullTitle = siteTitle(title);

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("name", "author", SITE_NAME);

    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", absoluteUrl(image));
    upsertMeta("property", "og:image:alt", description);
    upsertMeta("property", "og:locale", SITE_LOCALE);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:site", SITE_TWITTER_HANDLE);
    upsertMeta("name", "twitter:creator", SITE_TWITTER_HANDLE);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absoluteUrl(image));

    upsertCanonical(url);

    if (jsonLd) {
      upsertJsonLd(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
    } else {
      upsertJsonLd([]);
    }

    return cleanupPageSeo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, JSON.stringify(jsonLd ?? null), noindex]);

  return null;
}

export { SITE_URL };
