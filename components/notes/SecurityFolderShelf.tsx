import React from "react";
import Link from "next/link";
import { ArrowUpRight, FolderTree, Shield } from "lucide-react";
import type { SecurityFolderEntry } from "@/types/security-notes";
import styles from "./SecurityNotes.module.css";

interface SecurityFolderShelfProps {
  folders: SecurityFolderEntry[];
}

export function SecurityFolderShelf({ folders }: SecurityFolderShelfProps) {
  const totalNotes = folders.reduce((acc, folder) => acc + folder.notes.length, 0);

  return (
    <section
      className={`shell ${styles.shelfSection}`}
      aria-labelledby="security-folders-title"
    >
      <div className={styles.shelfHeader}>
        <div>
          <p className={styles.shelfEyebrow}>
            <Shield size={14} aria-hidden="true" />
            <span>SECURITY / STRUCTURED FOLDERS</span>
          </p>
          <h2 id="security-folders-title">Security Field Notes</h2>
          <p className={styles.shelfIntro}>
            Organized by offensive and defensive phase. Each folder groups protocol summaries,
            separated diagrams, and interactive configuration notes.
          </p>
        </div>

        <Link href="/notes/security" className={styles.shelfRootLink}>
          <span>Open Security Index ({totalNotes})</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.shelfGrid}>
        {folders.map((folder) => (
          <article key={folder.slug} className={styles.shelfCard}>
            <div className={styles.shelfCardTop}>
              <span className={styles.shelfPhase}>{folder.phaseCode}</span>
              <span className={styles.shelfCount}>
                {String(folder.notes.length).padStart(2, "0")}{" "}
                {folder.notes.length === 1 ? "NOTE" : "NOTES"}
              </span>
            </div>

            <div className={styles.shelfCardTitleRow}>
              <FolderTree size={18} aria-hidden="true" className={styles.shelfIcon} />
              <h3>
                <Link href={`/notes/security/${folder.slug}`}>{folder.title}</Link>
              </h3>
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
    </section>
  );
}
