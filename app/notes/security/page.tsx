import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllSecurityFolders } from "@/data/notes/security";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/notes/SecurityNotes.module.css";

export const metadata = createPageMetadata({
  title: "Security Field Notes",
  description:
    "Structured cybersecurity notes organized by phase and protocol, starting with Footprinting and FTP (vsFTPd).",
  pathname: "/notes/security/"
});

export default function SecurityNotesIndexPage() {
  const folders = getAllSecurityFolders();

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
          <span className={styles.breadcrumbCurrent}>Security</span>
        </nav>

        <header className={styles.indexHero}>
          <h1>Security Field Notes</h1>
          <p>
            Technical notes organized by assessment phase, covering protocol architecture, server
            configuration, enumeration commands, and verification techniques.
          </p>
        </header>

        <div className={styles.indexList}>
          {folders.map((folder) => (
            <section key={folder.slug} className={styles.indexFolderBlock}>
              <div className={styles.indexFolderHead}>
                <h2>
                  <Link href={`/notes/security/${folder.slug}`}>{folder.title}</Link>
                </h2>
                <span className={styles.indexCount}>
                  {folder.notes.length} {folder.notes.length === 1 ? "article" : "articles"}
                </span>
              </div>
              <p className={styles.indexFolderSummary}>{folder.summary}</p>

              <ul className={styles.indexArticleList}>
                {folder.notes.map((note) => (
                  <li key={note.slug} className={styles.indexArticleItem}>
                    <Link
                      href={`/notes/security/${folder.slug}/${note.slug}`}
                      className={styles.indexArticleLink}
                    >
                      <div>
                        <strong>{note.title}</strong>
                        <span className={styles.indexArticleMeta}>
                          {note.ports} / {note.readingTime} min read
                        </span>
                      </div>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
