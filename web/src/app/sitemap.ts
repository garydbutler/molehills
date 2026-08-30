import type { MetadataRoute } from "next";
import { SITE_URL as siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/support`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
