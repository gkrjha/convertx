import type { MetadataRoute } from "next";
import { converters } from "@/lib/converters";

const BASE = "https://convertx.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/#converters`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/#features`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/#faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const converterRoutes: MetadataRoute.Sitemap = converters.map((c) => ({
    url: `${BASE}/convert/${c.from.toLowerCase().replace(/\s+/g, "-")}/${c.to.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: c.popular ? 0.9 : 0.8,
  }));

  return [...staticRoutes, ...converterRoutes];
}
