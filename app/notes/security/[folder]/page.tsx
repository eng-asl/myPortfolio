import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
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
          <h1>{folder.title}</h1>
          <p>{folder.summary}</p>
        </header>

        <ul className={styles.indexArticleList}>
          {folder.notes.map((note) => (
            <li key={note.slug} className={styles.indexArticleItem}>
              <Link
                href={`/notes/security/${folder.slug}/${note.slug}`}
                className={styles.indexArticleLink}
              >
                <div>
                  <strong>{note.title}</strong>
                  <p className={styles.indexArticleSummary}>{note.summary}</p>
                  <span className={styles.indexArticleMeta}>
                    {note.ports} / {note.readingTime} min read
                  </span>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
