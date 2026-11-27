import React from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getAllSecurityNotes, getSecurityNote } from "@/data/notes/security";
import { SecurityNoteWorkspace } from "@/components/notes/SecurityNoteWorkspace";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createTechArticleJsonLd
} from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ folder: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllSecurityNotes().map((note) => ({
    folder: note.folderSlug,
    slug: note.slug
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps) {
  const { folder, slug } = await params;
  const note = getSecurityNote(folder, slug);
  if (!note) return {};

  const pathname = `/notes/security/${note.folderSlug}/${note.slug}/`;
  const markdownUrl = absoluteUrl(`/notes/security/${note.folderSlug}/${note.slug}.md`);
  const metadata = createPageMetadata({
    title: `${note.title} (${note.folderTitle})`,
    description: note.summary,
    pathname,
    image: note.overviewSheetImage
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: {
        "text/markdown": markdownUrl
      }
    },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: note.publishedAt,
      modifiedTime: note.updatedAt || note.publishedAt,
      authors: [absoluteUrl("/about/")],
      tags: note.tags
    }
  };
}

export default async function SecurityNoteDetailPage({ params }: PageProps) {
  const { folder, slug } = await params;
  const note = getSecurityNote(folder, slug);
  if (!note) notFound();

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Notes", pathname: "/notes/" },
    { name: "Security", pathname: "/notes/security/" },
    { name: note.folderTitle, pathname: `/notes/security/${note.folderSlug}/` },
    { name: note.title, pathname: `/notes/security/${note.folderSlug}/${note.slug}/` }
  ]);

  return (
    <div className="asl-page">
      <JsonLd data={createTechArticleJsonLd(note)} />
      <JsonLd data={breadcrumb} />
      <SecurityNoteWorkspace note={note} />
    </div>
  );
}
