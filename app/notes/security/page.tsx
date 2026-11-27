import React from "react";
import Link from "next/link";
import { ArrowUpRight, FolderTree, Shield } from "lucide-react";
import { getAllSecurityFolders } from "@/data/notes/security";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/notes/SecurityNotes.module.css";

export const metadata = createPageMetadata({
  title: "Security Field Notes",
  description:
    "Hierarchical cybersecurity notes organized by phase and protocol, starting with Footprinting and FTP (vsFTPd).",
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
          <p className={styles.shelfEyebrow}>
            <Shield size={14} aria-hidden="true" />
            <span>SECURITY / DIRECTORY INDEX</span>
          </p>
          <h1>Security Field Notes</h1>
          <p>
            Structured notes grouped by assessment phase. Open a folder to browse protocol
            architecture, server hardening, commands, and visual diagrams.
          </p>
        </header>

        <div className={styles.shelfGrid}>
          {folders.map((folder) => (
            <article key={folder.slug} className={styles.shelfCard}>
              <div className={styles.shelfCardTop}>
                <span className={styles.shelfPhase}>{folder.phaseCode}</span>
                <span className={styles.shelfCount}>
                  {String(folder.notes.length).padStart(2, "0")}{" "}
                  {folder.notes.length === 1 ? "PROTOCOL" : "PROTOCOLS"}
                </span>
              </div>

              <div className={styles.shelfCardTitleRow}>
                <FolderTree size={18} aria-hidden="true" className={styles.shelfIcon} />
                <h2>
                  <Link href={`/notes/security/${folder.slug}`}>{folder.title}</Link>
                </h2>
              </div>

              <p className={styles.shelfCardSummary}>{folder.summary}</p>

              <ul className={styles.shelfNoteList}>
                {folder.notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      href={`/notes/security/${folder.slug}/${note.slug}`}
                      className={styles.shelfNoteLink}
                    >
                      <span className={styles.shelfNoteBadge}>{note.slug.toUpperCase()}</span>
                      <span className={styles.shelfNoteTitle}>{note.title}</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
