import React from "react";
import { notFound } from "next/navigation";
import { getAllSecurityNotes, getSecurityNote } from "@/data/notes/security";
import { SecurityNoteWorkspace } from "@/components/notes/SecurityNoteWorkspace";
import { createPageMetadata } from "@/lib/seo";

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

  return createPageMetadata({
    title: `${note.title} (${note.folderTitle})`,
    description: note.summary,
    pathname: `/notes/security/${note.folderSlug}/${note.slug}/`
  });
}

export default async function SecurityNoteDetailPage({ params }: PageProps) {
  const { folder, slug } = await params;
  const note = getSecurityNote(folder, slug);
  if (!note) notFound();

  return (
    <div className="asl-page">
      <SecurityNoteWorkspace note={note} />
    </div>
  );
}
