export const dynamic = "force-static";

import { siteConfig } from "@/lib/site";

const disallowedInternalPaths = ["/api/", "/work/ui-preview/", "/concepts/"];

export default function robots() {
  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User"
        ],
        allow: "/",
        disallow: disallowedInternalPaths
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedInternalPaths
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
