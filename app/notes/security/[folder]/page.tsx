import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FolderOpen } from "lucide-react";
import { getAllSecurityFolders, getSecurityFolder } from "@/data/notes/security";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/notes/SecurityNotes.module.css";

interface PageProps {
  params: Promise<{ folder: string }>;
}

export function generateStaticParams() {
  return getAllSecurityFolders().map((folder) => ({ folder: folder.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps) {
  const { folder: folderSlug } = await params;
  const folder = getSecurityFolder(folderSlug);
  if (!folder) return {};

  return createPageMetadata({
    title: `${folder.title} Security Notes`,
    description: folder.summary,
    pathname: `/notes/security/${folder.slug}/`
  });
}

export default async function SecurityFolderPage({ params }: PageProps) {
  const { folder: folderSlug } = await params;
  const folder = getSecurityFolder(folderSlug);
  if (!folder) notFound();

  return (
    <div className="asl-page">
      <div className={`shell ${styles.indexShell}`}>
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link href="/notes" className={styles.breadcrumbLink}>
            Notes
          </Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">
            /
          </span>
          <Link href="/notes/security" className={styles.breadcrumbLink}>
            Security
          </Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">
            /
          </span>
          <span className={styles.breadcrumbCurrent}>{folder.title}</span>
        </nav>

        <header className={styles.indexHero}>
          <p className={styles.shelfEyebrow}>
            <FolderOpen size={14} aria-hidden="true" />
            <span>SECURITY / {folder.phaseCode}</span>
          </p>
          <h1>{folder.title}</h1>
          <p>{folder.summary}</p>
        </header>

        <div className={styles.noteGrid}>
          {folder.notes.map((note) => (
            <article key={note.slug} className={styles.noteCard}>
              <div className={styles.noteCardMeta}>
                <span>{note.ports}</span>
                <span>{note.parts.length} SECTIONS / {note.diagrams.length} DIAGRAMS</span>
              </div>

              <h2>
                <Link href={`/notes/security/${folder.slug}/${note.slug}`}>
                  {note.title}
                </Link>
              </h2>

              <p>{note.summary}</p>

              <div className={styles.noteCardFooter}>
                <div className={styles.noteCardTags}>
                  {note.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className={styles.noteCardTag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/notes/security/${folder.slug}/${note.slug}`}
                  className={styles.noteCardCta}
                >
                  <span>Open Notes</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
