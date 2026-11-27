import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SecurityFolderEntry } from "@/types/security-notes";
import styles from "./SecurityNotes.module.css";

interface SecurityFolderShelfProps {
  folders: SecurityFolderEntry[];
}

export function SecurityFolderShelf({ folders }: SecurityFolderShelfProps) {
  return (
    <section
      className={`shell ${styles.shelfSection}`}
      aria-labelledby="security-folders-title"
    >
      <div className={styles.shelfHeader}>
        <div>
          <h2 id="security-folders-title">Security Field Notes</h2>
          <p className={styles.shelfIntro}>
            Structured reconnaissance and protocol hardening notes organized by assessment topic.
          </p>
        </div>

        <Link href="/notes/security" className={styles.shelfRootLink}>
          <span>View Security index</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.indexList}>
        {folders.map((folder) => (
          <section key={folder.slug} className={styles.indexFolderBlock}>
            <div className={styles.indexFolderHead}>
              <h3>
                <Link href={`/notes/security/${folder.slug}`}>{folder.title}</Link>
              </h3>
              <span className={styles.indexCount}>
                {folder.notes.length} {folder.notes.length === 1 ? "note" : "notes"}
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
    </section>
  );
}
