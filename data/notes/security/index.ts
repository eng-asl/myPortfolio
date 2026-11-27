import type { Post } from "@/types/content";
import type { SecurityFolderEntry, SecurityNoteEntry } from "@/types/security-notes";
import { ftpNote } from "./footprinting/ftp";

export const securityFolders: SecurityFolderEntry[] = [
  {
    slug: "footprinting",
    title: "Footprinting",
    phaseCode: "PHASE 01",
    summary:
      "Service and protocol reconnaissance notes covering banners, default ports, configuration hardening, anonymous access, and enumeration techniques.",
    notes: [ftpNote]
  }
];

export function getAllSecurityFolders(): SecurityFolderEntry[] {
  return securityFolders;
}

export function getSecurityFolder(folderSlug: string): SecurityFolderEntry | null {
  return securityFolders.find((folder) => folder.slug === folderSlug) ?? null;
}

export function getAllSecurityNotes(): SecurityNoteEntry[] {
  return securityFolders.flatMap((folder) => folder.notes);
}

export function getSecurityNote(folderSlug: string, noteSlug: string): SecurityNoteEntry | null {
  const folder = getSecurityFolder(folderSlug);
  if (!folder) return null;
  return folder.notes.find((note) => note.slug === noteSlug) ?? null;
}

export function getSecurityNotesAsPostSummaries(): Post[] {
  return getAllSecurityNotes().map((note) => ({
    slug: `security-${note.folderSlug}-${note.slug}`,
    href: `/notes/security/${note.folderSlug}/${note.slug}`,
    title: `${note.folderTitle} / ${note.title}`,
    summary: note.summary,
    category: "Cybersecurity",
    tags: note.tags,
    publishedAt: note.publishedAt,
    updatedAt: note.updatedAt,
    readingTime: note.readingTime,
    draft: false,
    series: "Security Field Notes",
    difficulty: note.difficulty,
    content: "",
    html: ""
  }));
}
