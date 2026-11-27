import type { Metadata } from "next";
import { profile } from "@/data/portfolio";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { Post } from "@/types/content";
import type { Project, Publication } from "@/types/portfolio";
import type { SecurityNoteEntry } from "@/types/security-notes";
import { PageMetadataOptions, JsonLdData } from "@/types/seo";

export const personId: string = `${absoluteUrl("/")}#ahmed-asl`;
export const personAliases = Object.freeze([
  "Ahmed Ibrahim Asl",
  "Ahmed Asl",
  "Ahmed Ibrahim Assal",
  "Ahmed Assal",
  "Ahmed Ibrahim Assl",
  "Ahmed Assl",
  "أحمد إبراهيم عسل",
  "أحمد عسل"
]);
export const websiteId: string = `${absoluteUrl("/")}#website`;
export const socialImage: string = absoluteUrl("/opengraph-image.png");
export const twitterImage: string = absoluteUrl("/twitter-image.png");

export function createHomePageJsonLd(locale: "en" | "ar" = "en"): JsonLdData {
  const arabic = locale === "ar";
  const url = absoluteUrl(arabic ? "/ar/" : "/");
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: arabic ? "أحمد إبراهيم عسل | مهندس أنظمة مدمجة وإنترنت الأشياء" : siteConfig.title,
    description: arabic ? "الموقع الشخصي لأحمد إبراهيم عسل: مشروعات أنظمة مدمجة وروبوتات وأدوات هندسية عملية." : siteConfig.description,
    inLanguage: locale,
    isPartOf: { "@id": websiteId },
    about: { "@id": personId }
  };
}

export function createPageMetadata({ title, description, pathname = "", image, locale = "en", translated = false }: PageMetadataOptions): Metadata {
  const url = absoluteUrl(pathname);
  const shareImage = image ? absoluteUrl(image) : undefined;
  const englishPath = pathname.startsWith("/ar/") ? pathname.slice(3) || "/" : pathname;
  const arabicPath = englishPath === "/" ? "/ar/" : `/ar${englishPath.startsWith("/") ? englishPath : `/${englishPath}`}`;
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords: [...personAliases, "embedded systems engineer", "IoT R&D engineer", "engineering calculators"],
    alternates: {
      canonical: url,
      ...(translated ? { languages: { en: absoluteUrl(englishPath), ar: absoluteUrl(arabicPath), "x-default": absoluteUrl(englishPath) } } : {})
    },
    authors: [
      {
        name: profile.name,
        url: absoluteUrl("/about/")
      }
    ],
    creator: profile.name,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      url,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [
        {
          url: shareImage ?? socialImage,
          width: 1200,
          height: 630,
          alt: shareImage ? title : `${profile.name}, ${profile.role}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [shareImage ?? twitterImage]
    }
  };
}

export function createSiteJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        alternateName: personAliases,
        url: absoluteUrl("/about/"),
        mainEntityOfPage: absoluteUrl("/about/"),
        image: absoluteUrl("/media/optimized/profile-ahmed.webp"),
        jobTitle: profile.role,
        description: siteConfig.description,
        email: `mailto:${profile.email}`,
        sameAs: profile.socials.map((social) => social.href),
        knowsAbout: [
          "Hardware prototypes",
          "IoT products",
          "Embedded systems",
          "Electronics design",
          "Embedded firmware",
          "Robotics",
          "Connected products",
          "Mechatronics",
          "Image processing",
          "Machine learning",
          "Cybersecurity",
          "Information security",
          "ESP32",
          "Flutter",
          "Linux",
          "Engineering education"
        ]
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: {
          "@id": personId
        }
      }
    ]
  };
}

export function createProfilePageJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteUrl("/about/")}#profile-page`,
    url: absoluteUrl("/about/"),
    name: `About ${profile.name}`,
    dateModified: "2026-09-17",
    mainEntity: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      alternateName: personAliases,
      jobTitle: profile.role,
      url: absoluteUrl("/about/"),
      image: absoluteUrl("/media/optimized/profile-ahmed.webp"),
      description: siteConfig.description,
      sameAs: profile.socials.map((social) => social.href)
    }
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; pathname: string }>
): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.pathname.startsWith("http") ? item.pathname : absoluteUrl(item.pathname)
    }))
  };
}

export function createArticleJsonLd(post: Post): JsonLdData {
  const url = absoluteUrl(`/notes/${post.slug}/`);
  const markdownUrl = absoluteUrl(`/notes/${post.slug}.md`);

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.summary,
    image: socialImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: "en",
    articleSection: post.category,
    keywords: post.tags.join(", "),
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "text/markdown",
      contentUrl: markdownUrl
    },
    author: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: absoluteUrl("/about/")
    },
    publisher: {
      "@id": personId
    },
    isPartOf: {
      "@id": websiteId
    }
  };
}

export function createTechArticleJsonLd(note: SecurityNoteEntry): JsonLdData {
  const url = absoluteUrl(`/notes/security/${note.folderSlug}/${note.slug}/`);
  const markdownUrl = absoluteUrl(`/notes/security/${note.folderSlug}/${note.slug}.md`);

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: note.title,
    description: note.summary,
    image: note.overviewSheetImage ? absoluteUrl(note.overviewSheetImage) : socialImage,
    datePublished: note.publishedAt,
    dateModified: note.updatedAt || note.publishedAt,
    inLanguage: "en",
    articleSection: `Security / ${note.folderTitle}`,
    proficiencyLevel: note.difficulty,
    keywords: note.tags.join(", "),
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "text/markdown",
      contentUrl: markdownUrl
    },
    author: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: absoluteUrl("/about/")
    },
    publisher: {
      "@id": personId
    },
    isPartOf: {
      "@id": websiteId
    }
  };
}

export function createProjectCreativeWorkJsonLd(
  project: Project,
  categorySlug: string
): JsonLdData {
  const url = absoluteUrl(`/work/${categorySlug}/${project.slug}/`);
  const image =
    project.image && !project.image.startsWith("http")
      ? absoluteUrl(project.image)
      : socialImage;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    url,
    mainEntityOfPage: url,
    name: project.title,
    description: project.description,
    image,
    inLanguage: "en",
    genre: project.category,
    keywords: project.tags.join(", "),
    author: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: absoluteUrl("/about/")
    },
    creator: {
      "@id": personId
    },
    isPartOf: {
      "@id": websiteId
    }
  };
}

export function createPublicationsJsonLd(publications: Publication[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl("/work/")}#publications`,
    name: "Research publications by Ahmed Ibrahim Asl",
    itemListElement: publications.map((pub, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "ScholarlyArticle",
        name: pub.title,
        url: pub.href,
        datePublished: pub.year,
        author: {
          "@id": personId,
          "@type": "Person",
          name: profile.name,
          url: absoluteUrl("/about/")
        },
        isPartOf: {
          "@type": "PublicationIssue",
          name: pub.venue
        }
      }
    }))
  };
}
