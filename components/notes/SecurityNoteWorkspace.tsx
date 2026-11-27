"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, FileText, Maximize2, ShieldAlert } from "lucide-react";
import type {
  DiagramSlot,
  InspectorEntry,
  NoteContentBlock,
  NotePart,
  NoteSubSection,
  SecurityNoteEntry
} from "@/types/security-notes";
import { slugifyHeading } from "@/lib/ai-markdown";
import type { NoteWindowPosition } from "./useNoteDraggable";
import { NoteTerminal } from "./NoteTerminal";
import { DiagramPlate } from "./DiagramPlate";
import { FloatingNoteWindow } from "./FloatingNoteWindow";
import styles from "./SecurityNotes.module.css";

interface SecurityNoteWorkspaceProps {
  note: SecurityNoteEntry;
}

function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;
  return parts.map((segment, index) => {
    if (segment.startsWith("`") && segment.endsWith("`") && segment.length > 2) {
      return (
        <code key={index} className={styles.inlineCode}>
          {segment.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={index}>{segment}</React.Fragment>;
  });
}

export function SecurityNoteWorkspace({ note }: SecurityNoteWorkspaceProps) {
  const [showQuickRef, setShowQuickRef] = useState<boolean>(false);
  const [activeInspectorId, setActiveInspectorId] = useState<string | null>(null);
  const [previewDiagram, setPreviewDiagram] = useState<DiagramSlot | null>(null);
  const [floatingPos, setFloatingPos] = useState<NoteWindowPosition | undefined>(undefined);

  const diagramsById = useMemo(() => {
    const map: Record<string, DiagramSlot> = {};
    for (const diagram of note.diagrams) {
      map[diagram.id] = diagram;
    }
    return map;
  }, [note.diagrams]);

  const computePopupPosition = (
    wide: boolean,
    event?: React.MouseEvent<HTMLElement>
  ): NoteWindowPosition | undefined => {
    if (typeof window === "undefined") return undefined;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const width = Math.min(wide ? 720 : 500, winW - 24);

    if (winW <= 720) {
      return { x: 12, y: 76 };
    }

    if (wide) {
      return {
        x: Math.max(12, Math.round((winW - width) / 2)),
        y: 80
      };
    }

    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const pointerY = event && event.clientY > 0 ? event.clientY : rect?.top ?? 120;
    const x = Math.max(12, winW - width - 24);
    const y = Math.min(Math.max(76, pointerY - 36), Math.max(76, winH - 420));
    return { x, y };
  };

  const openInspector = (
    inspectorId: string,
    event?: React.MouseEvent<HTMLElement>
  ) => {
    if (!note.inspectors[inspectorId]) return;
    if (!activeInspectorId && !previewDiagram) {
      const nextPos = computePopupPosition(false, event);
      if (nextPos) setFloatingPos(nextPos);
    }
    setPreviewDiagram(null);
    setActiveInspectorId(inspectorId);
  };

  const openDiagramPreview = (
    diagram: DiagramSlot,
    event?: React.MouseEvent<HTMLElement>
  ) => {
    if (!activeInspectorId && !previewDiagram) {
      const nextPos = computePopupPosition(true, event);
      if (nextPos) setFloatingPos(nextPos);
    }
    setActiveInspectorId(null);
    setPreviewDiagram(diagram);
  };

  const openFullOverviewSheet = (event?: React.MouseEvent<HTMLElement>) => {
    openDiagramPreview(
      {
        id: "ftp-overview-full-sheet",
        figLabel: "Overview Sheet",
        partId: "overview",
        title: "FTP Complete Overview Diagram",
        summary:
          "Complete one-page FTP reference combining Two TCP Connections, Active FTP, Passive FTP, and quick facts.",
        keyPoints: [
          "Control Channel on TCP port 21 and separate Data Channel.",
          "Active mode (PORT) initiates data back from server port 20.",
          "Passive mode (PASV) keeps both sockets client-initiated for NAT compatibility."
        ],
        imageSrc: note.overviewSheetImage,
        swapPath: "public/media/notes/security/footprinting/ftp/ftp-overview-full.jpg",
        alt: "Full FTP overview infographic showing Two TCP Connections, Active FTP, Passive FTP, and Quick Facts.",
        relatedInspectorIds: ["ftp-protocol", "active-ftp", "passive-ftp", "ftp-ftps-sftp"]
      },
      event
    );
  };

  const closeFloating = () => {
    setActiveInspectorId(null);
    setPreviewDiagram(null);
  };

  const groupedInspectorEntries = useMemo(() => {
    const groups: Record<string, InspectorEntry[]> = {};
    for (const entry of Object.values(note.inspectors)) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return Object.entries(groups);
  }, [note.inspectors]);

  const renderSubSection = (sub: NoteSubSection) => (
    <div key={sub.id} className={styles.subSectionBlock}>
      <h3 id={slugifyHeading(sub.title)} className={styles.docSubheading}>
        {sub.title}
      </h3>
      {sub.intro ? <p className={styles.docParagraph}>{renderInlineCode(sub.intro)}</p> : null}
      <div className={styles.blocksStack}>
        {sub.blocks.map((block, idx) => renderBlock(block, `${sub.id}-${idx}`))}
      </div>
    </div>
  );

  const renderBlock = (block: NoteContentBlock, key: string): React.ReactNode => {
    switch (block.type) {
      case "paragraph":
        return (
          <div key={key} className={styles.paragraphBlock}>
            <p className={styles.docParagraph}>{renderInlineCode(block.text)}</p>
            {block.terms?.length ? (
              <div className={styles.contextLinksRow}>
                {block.terms.map((term) => (
                  <button
                    key={`${key}-${term.inspectorId}`}
                    type="button"
                    className={styles.contextBtn}
                    data-testid={`term-trigger-${term.inspectorId}`}
                    onClick={(e) => openInspector(term.inspectorId, e)}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );

      case "subheading": {
        const headingId = block.id || slugifyHeading(block.text);
        return block.level === 4 ? (
          <h4 key={key} id={headingId} className={styles.docSubheading}>
            {block.text}
          </h4>
        ) : (
          <h3 key={key} id={headingId} className={styles.docSubheading}>
            {block.text}
          </h3>
        );
      }

      case "bullets":
        return (
          <div key={key} className={styles.bulletsBlock}>
            {block.lead ? <p className={styles.docParagraph}>{renderInlineCode(block.lead)}</p> : null}
            <ul className={styles.docList}>
              {block.items.map((item, idx) => (
                <li key={idx}>{renderInlineCode(item)}</li>
              ))}
            </ul>
          </div>
        );

      case "code-sample":
        return (
          <figure key={key} className={styles.codeSampleFigure}>
            <pre className={styles.codeSamplePre}>
              <code>{block.lines.join("\n")}</code>
            </pre>
            {block.caption ? (
              <figcaption className={styles.codeSampleCaption}>
                {renderInlineCode(block.caption)}
              </figcaption>
            ) : null}
          </figure>
        );

      case "diagram-embed": {
        const items = block.diagramIds.map((id) => diagramsById[id]).filter(Boolean);
        if (!items.length) return null;
        const isPair = block.layout === "pair" && items.length > 1;
        return (
          <div key={key} className={styles.diagramEmbedWrap}>
            <div className={isPair ? styles.diagramPairGrid : styles.diagramSingleWrap}>
              {items.map((diagram) => (
                <DiagramPlate
                  key={diagram.id}
                  diagram={diagram}
                  inspectors={note.inspectors}
                  onInspectTerm={(id) => openInspector(id)}
                  onZoomDiagram={(item) => openDiagramPreview(item)}
                  compact={isPair}
                  sizes={
                    isPair ? "(max-width: 720px) 100vw, 370px" : "(max-width: 900px) 100vw, 760px"
                  }
                />
              ))}
            </div>
            {block.caption ? <p className={styles.diagramGroupCaption}>{block.caption}</p> : null}
          </div>
        );
      }

      case "context-links":
        return (
          <div key={key} className={styles.contextLinksRow}>
            {block.links.map((link, idx) => {
              if (link.href) {
                return (
                  <a
                    key={`${key}-${idx}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contextExternalLink}
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                );
              }
              if (link.diagramId) {
                const targetDiagram = diagramsById[link.diagramId];
                if (!targetDiagram) return null;
                return (
                  <button
                    key={`${key}-${link.diagramId}`}
                    type="button"
                    className={styles.contextBtn}
                    data-testid={`diagram-trigger-${link.diagramId}`}
                    onClick={(e) => openDiagramPreview(targetDiagram, e)}
                  >
                    <Maximize2 size={12} aria-hidden="true" />
                    <span>{link.label}</span>
                  </button>
                );
              }
              if (link.inspectorId && note.inspectors[link.inspectorId]) {
                return (
                  <button
                    key={`${key}-${link.inspectorId}`}
                    type="button"
                    className={styles.contextBtn}
                    data-testid={`popup-trigger-${link.inspectorId}`}
                    onClick={(e) => openInspector(link.inspectorId!, e)}
                  >
                    <BookOpen size={12} aria-hidden="true" />
                    <span>{link.label}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>
        );

      case "callout":
        return (
          <blockquote key={key} className={styles.docNoteQuote}>
            <p className={styles.docNoteTitle}>{block.title}</p>
            {block.body.map((line, i) => (
              <p key={i}>{renderInlineCode(line)}</p>
            ))}
            {block.bullets?.length ? (
              <ul className={styles.docList}>
                {block.bullets.map((item, i) => (
                  <li key={i}>{renderInlineCode(item)}</li>
                ))}
              </ul>
            ) : null}
            {block.inspectorIds?.length ? (
              <div className={styles.contextLinksRow}>
                {block.inspectorIds.map((id) => {
                  const item = note.inspectors[id];
                  if (!item) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.contextBtn}
                      onClick={(e) => openInspector(id, e)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </blockquote>
        );

      case "terminal":
        return <NoteTerminal key={key} terminal={block.terminal} />;

      case "settings-table":
        return (
          <div key={key} className={styles.tableWrap}>
            {block.title ? <p className={styles.tableCaption}>{block.title}</p> : null}
            <div className={styles.tableScroll}>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Description</th>
                    <th className={styles.tableActionCol}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.setting}>
                      <td>
                        <code className={styles.settingCode}>{row.setting}</code>
                      </td>
                      <td>{renderInlineCode(row.summary)}</td>
                      <td className={styles.tableActionCell}>
                        <button
                          type="button"
                          className={styles.tableDetailBtn}
                          data-testid={`inspect-${row.inspectorId}`}
                          onClick={(e) => openInspector(row.inspectorId, e)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "comparison-table": {
        const hasActions = block.rows.some((row) => Boolean(row.inspectorId));
        return (
          <div key={key} className={styles.tableWrap}>
            {block.title ? <p className={styles.tableCaption}>{block.title}</p> : null}
            <div className={styles.tableScroll}>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    {block.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                    {hasActions ? <th className={styles.tableActionCol}>Reference</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.cells.map((cell, cIdx) => (
                        <td key={cIdx}>
                          {cIdx === 0 ? (
                            <code className={styles.settingCode}>{cell}</code>
                          ) : (
                            renderInlineCode(cell)
                          )}
                        </td>
                      ))}
                      {hasActions ? (
                        <td className={styles.tableActionCell}>
                          {row.inspectorId ? (
                            <button
                              type="button"
                              className={styles.tableDetailBtn}
                              data-testid={`inspect-${row.inspectorId}`}
                              onClick={(e) => openInspector(row.inspectorId!, e)}
                            >
                              Details
                            </button>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "response-codes":
        return (
          <div key={key} className={styles.tableWrap}>
            {block.title ? <p className={styles.tableCaption}>{block.title}</p> : null}
            <div className={styles.tableScroll}>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Meaning</th>
                    <th className={styles.tableActionCol}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {block.codes.map((item) => (
                    <tr key={item.code}>
                      <td>
                        <code className={styles.settingCode}>{item.code}</code>
                      </td>
                      <td>{item.meaning}</td>
                      <td className={styles.tableActionCell}>
                        <button
                          type="button"
                          className={styles.tableDetailBtn}
                          data-testid={`code-trigger-${item.code}`}
                          onClick={(e) => openInspector(item.inspectorId, e)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "risk-list":
        return (
          <div key={key} className={styles.bulletsBlock}>
            <p className={styles.docParagraph}>
              <ShieldAlert size={14} className={styles.inlineIcon} aria-hidden="true" />{" "}
              <strong>{block.title}</strong>
            </p>
            <ul className={styles.docList}>
              {block.items.map((item, idx) => (
                <li key={idx}>{renderInlineCode(item)}</li>
              ))}
            </ul>
            {block.footnote ? (
              <p className={styles.docParagraph}>{renderInlineCode(block.footnote)}</p>
            ) : null}
          </div>
        );

      case "term-chips":
        return (
          <div key={key} className={styles.contextLinksRow}>
            {block.chipIds.map((id) => {
              const entry = note.inspectors[id];
              if (!entry) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.contextBtn}
                  data-testid={`term-trigger-${id}`}
                  onClick={(e) => openInspector(id, e)}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        );

      case "steps-grid":
        return (
          <ul key={key} className={styles.docList}>
            {block.cards.map((card) => (
              <li key={card.code}>
                <strong>{card.title}:</strong> {renderInlineCode(card.body)}
              </li>
            ))}
          </ul>
        );

      case "sub-sections":
        return (
          <div key={key} className={styles.subSectionsFlow}>
            {block.sections.map((sub) => renderSubSection(sub))}
          </div>
        );
    }
  };

  const renderPartBody = (part: NotePart) => (
    <section
      key={part.id}
      id={`part-${part.id}`}
      className={styles.docSection}
      aria-labelledby={`part-heading-${part.id}`}
    >
      <h2 id={`part-heading-${part.id}`}>{part.title}</h2>
      <p className={styles.docSectionIntro}>{renderInlineCode(part.intro)}</p>
      <div className={styles.blocksStack}>
        {part.blocks.map((block, idx) => renderBlock(block, `${part.id}-${idx}`))}
      </div>
    </section>
  );

  return (
    <div className={`shell ${styles.docShell}`}>
      <div className={styles.docContainer}>
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
          <Link href={`/notes/security/${note.folderSlug}`} className={styles.breadcrumbLink}>
            {note.folderTitle}
          </Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">
            /
          </span>
          <span className={styles.breadcrumbCurrent}>{note.slug.toUpperCase()}</span>
        </nav>

        <header className={styles.docHeader}>
          <h1 className={styles.docTitle}>{note.title}</h1>
          <p className={styles.docLead}>{note.summary}</p>
          <div className={styles.docMetaRow}>
            <span>
              By <Link href="/about">Ahmed Ibrahim Asl (ASL)</Link>
            </span>
            <span aria-hidden="true">/</span>
            <span>Published {note.publishedAt}</span>
            {note.updatedAt && note.updatedAt !== note.publishedAt ? (
              <>
                <span aria-hidden="true">/</span>
                <span>Updated {note.updatedAt}</span>
              </>
            ) : null}
            <span aria-hidden="true">/</span>
            <span>{note.ports}</span>
            <span aria-hidden="true">/</span>
            <span>{note.daemon}</span>
            <span aria-hidden="true">/</span>
            <span>{note.readingTime} min read</span>
          </div>

          <div className={styles.docActionRow}>
            <button
              type="button"
              className={styles.contextBtn}
              onClick={openFullOverviewSheet}
              data-testid="open-full-sheet-btn"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>View overview summary diagram</span>
            </button>

            <button
              type="button"
              className={styles.contextBtn}
              aria-expanded={showQuickRef}
              onClick={() => setShowQuickRef((v) => !v)}
              data-testid="toggle-quick-ref-btn"
            >
              <BookOpen size={13} aria-hidden="true" />
              <span>
                {showQuickRef
                  ? "Hide command & directive index"
                  : `Browse command & directive index (${Object.keys(note.inspectors).length})`}
              </span>
            </button>

            <a
              href={`/notes/security/${note.folderSlug}/${note.slug}.md`}
              type="text/markdown"
              className={styles.contextExternalLink}
              data-testid="markdown-source-link"
            >
              <FileText size={13} aria-hidden="true" />
              <span>Markdown version (.md)</span>
            </a>
          </div>
        </header>

        {showQuickRef ? (
          <section className={styles.quickRefDrawer} aria-label="Command and directive index">
            <div className={styles.quickRefHeader}>
              <p>Select any topic or directive to inspect detailed usage in a floating window.</p>
              <button
                type="button"
                className={styles.contextBtn}
                onClick={() => setShowQuickRef(false)}
              >
                Close index
              </button>
            </div>
            <div className={styles.quickRefGroups}>
              {groupedInspectorEntries.map(([category, items]) => (
                <div key={category} className={styles.quickRefGroup}>
                  <h3>{category}</h3>
                  <div className={styles.quickRefLinks}>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={styles.contextBtn}
                        onClick={(e) => openInspector(item.id, e)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.docLayout}>
          <article className={styles.docBody} data-testid="vertical-note-article">
            {note.parts.map((part) => renderPartBody(part))}

            <details
              id="extended-reference"
              className={styles.extendedRefDetails}
              data-testid="extended-reference-details"
            >
              <summary className={styles.extendedRefSummary}>
                Complete extended reference and full command outputs (
                {Object.keys(note.inspectors).length} entries)
              </summary>
              <div className={styles.extendedRefList}>
                {Object.values(note.inspectors).map((entry) => (
                  <section
                    key={entry.id}
                    id={`ref-${entry.id}`}
                    className={styles.extendedRefItem}
                  >
                    <h3>{entry.label}</h3>
                    <p className={styles.docParagraph}>{entry.shortDefinition}</p>
                    {entry.details.length > 0 ? (
                      <ul className={styles.docList}>
                        {entry.details.map((detail, dIdx) => (
                          <li key={dIdx}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                    {entry.securityNote ? (
                      <p className={styles.docParagraph}>
                        <strong>Security note:</strong> {entry.securityNote}
                      </p>
                    ) : null}
                    {entry.terminal ? (
                      <pre className={styles.codeSamplePre}>
                        <code>
                          {entry.terminal.lines
                            .map((line) =>
                              line.kind === "command"
                                ? `${line.prompt || "$"} ${line.text}`
                                : line.kind === "input"
                                  ? `${line.prompt || "Input:"} ${line.text}`
                                  : line.text
                            )
                            .join("\n")}
                        </code>
                      </pre>
                    ) : null}
                  </section>
                ))}
              </div>
            </details>

            <footer className={styles.docAttribution} aria-label="Attribution and references">
              <p className={styles.docParagraph}>
                Written by <Link href="/about">Ahmed Ibrahim Asl (ASL)</Link>. Practical host
                examples use authorized Hack The Box (HTB Academy) lab targets. Additional
                references: RFC 959, Linux <code>man vsftpd.conf</code>, OpenSSL{" "}
                <code>s_client</code>, and{" "}
                <a
                  href="https://nmap.org/book/nse.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nmap Scripting Engine (NSE)
                </a>
                . Plain{" "}
                <a
                  href={`/notes/security/${note.folderSlug}/${note.slug}.md`}
                  type="text/markdown"
                >
                  Markdown version
                </a>
                .
              </p>
            </footer>
          </article>

          <aside
            className={styles.docToc}
            aria-label="On this page"
            data-testid="article-jump-nav"
          >
            <p className={styles.docTocTitle}>On this page</p>
            <ol className={styles.docTocList}>
              {note.parts.map((part) => (
                <li key={part.id}>
                  <a href={`#part-${part.id}`} className={styles.docTocLink}>
                    {part.shortTitle}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      <FloatingNoteWindow
        entry={activeInspectorId ? note.inspectors[activeInspectorId] ?? null : null}
        diagramPreview={previewDiagram}
        diagramsById={diagramsById}
        inspectors={note.inspectors}
        onSelectEntry={(id) => openInspector(id)}
        onClose={closeFloating}
        initialPosition={floatingPos}
      />
    </div>
  );
}
