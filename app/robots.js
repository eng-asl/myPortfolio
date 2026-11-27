export const dynamic = "force-static";

import { siteConfig } from "@/lib/site";

const disallowedInternalPaths = ["/api/", "/work/ui-preview/", "/concepts/"];

export default function robots() {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "Yandex"],
        allow: "/",
        disallow: disallowedInternalPaths
      },
      {
        userAgent: [
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
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "Meta-ExternalAgent"
        ],
        disallow: "/"
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
