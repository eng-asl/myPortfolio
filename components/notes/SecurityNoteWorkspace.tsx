"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Eye,
  FolderOpen,
  Info,
  LayoutGrid,
  ListTree,
  ShieldAlert,
  Sparkles,
  Terminal as TerminalIcon
} from "lucide-react";
import type {
  DiagramSlot,
  InspectorEntry,
  NoteContentBlock,
  NotePart,
  NoteSubSection,
  SecurityNoteEntry
} from "@/types/security-notes";
import type { NoteWindowPosition } from "./useNoteDraggable";
import { NoteTerminal } from "./NoteTerminal";
import { DiagramPlate } from "./DiagramPlate";
import { FloatingNoteWindow } from "./FloatingNoteWindow";
import styles from "./SecurityNotes.module.css";

type LayoutMode = "split" | "stack" | "board";
type RailFilter = "active" | "all";

interface SecurityNoteWorkspaceProps {
  note: SecurityNoteEntry;
}

export function SecurityNoteWorkspace({ note }: SecurityNoteWorkspaceProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [activePartId, setActivePartId] = useState<string>(note.parts[0]?.id ?? "overview");
  const [activeConfigSubId, setActiveConfigSubId] = useState<string>("network");
  const [railFilter, setRailFilter] = useState<RailFilter>("active");
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

  const activePartIndex = useMemo(
    () => Math.max(0, note.parts.findIndex((part) => part.id === activePartId)),
    [note.parts, activePartId]
  );

  const activePart = note.parts[activePartIndex] ?? note.parts[0];

  const openInspector = (
    inspectorId: string,
    event?: React.MouseEvent<HTMLElement>
  ) => {
    if (!note.inspectors[inspectorId]) return;
    if (event && typeof window !== "undefined") {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const estimatedW = Math.min(520, winW - 24);
      const hasPointer = event.clientX > 0 || event.clientY > 0;
      const rect = event.currentTarget?.getBoundingClientRect?.();
      const anchorX = hasPointer ? event.clientX + 18 : rect ? rect.right + 16 : winW - estimatedW - 24;
      const anchorY = hasPointer ? event.clientY - 48 : rect ? rect.top - 24 : 96;
      const x = Math.min(Math.max(12, anchorX), Math.max(12, winW - estimatedW - 16));
      const y = Math.min(Math.max(76, anchorY), Math.max(76, winH - 420));
      setFloatingPos({ x, y });
    }
    setPreviewDiagram(null);
    setActiveInspectorId(inspectorId);
  };

  const openDiagramPreview = (diagram: DiagramSlot) => {
    if (typeof window !== "undefined") {
      const winW = window.innerWidth;
      const width = Math.min(740, winW - 24);
      setFloatingPos({
        x: Math.max(12, Math.round((winW - width) / 2)),
        y: 80
      });
    }
    setActiveInspectorId(null);
    setPreviewDiagram(diagram);
  };

  const openFullOverviewSheet = () => {
    openDiagramPreview({
      id: "ftp-overview-full-sheet",
      figLabel: "FULL SHEET",
      partId: "overview",
      title: "FTP Complete Visual Overview Sheet",
      summary:
        "Complete one-page FTP visual summary combining Two TCP Connections, Active FTP, Passive FTP, and quick facts.",
      keyPoints: [
        "Control Channel on TCP port 21 and separate Data Channel.",
        "Active mode (PORT) initiates data back from server port 20.",
        "Passive mode (PASV) keeps both sockets client-initiated for NAT compatibility."
      ],
      imageSrc: note.overviewSheetImage,
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-overview-full.jpg",
      alt: "Full FTP overview infographic showing Two TCP Connections, Active FTP, Passive FTP, and Quick Facts.",
      relatedInspectorIds: ["ftp-protocol", "active-ftp", "passive-ftp", "ftp-ftps-sftp"]
    });
  };

  const closeFloating = () => {
    setActiveInspectorId(null);
    setPreviewDiagram(null);
  };

  const activeRailDiagrams = useMemo(() => {
    if (railFilter === "all") {
      return note.diagrams;
    }
    if (!activePart) return note.diagrams;

    let ids = [...activePart.diagramIds];
    if (activePart.id === "config") {
      const subBlock = activePart.blocks.find((block) => block.type === "sub-sections");
      if (subBlock && subBlock.type === "sub-sections") {
        const activeSub = subBlock.sections.find((sec) => sec.id === activeConfigSubId);
        if (activeSub?.diagramIds?.length) {
          ids = [...activeSub.diagramIds, ...ids.filter((id) => !activeSub.diagramIds?.includes(id))];
        }
      }
    }

    const mapped = ids.map((id) => diagramsById[id]).filter(Boolean);
    return mapped.length > 0 ? mapped : note.diagrams.slice(0, 2);
  }, [railFilter, note.diagrams, activePart, activeConfigSubId, diagramsById]);

  const groupedInspectorEntries = useMemo(() => {
    const groups: Record<string, InspectorEntry[]> = {};
    for (const entry of Object.values(note.inspectors)) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return Object.entries(groups);
  }, [note.inspectors]);

  const renderSubSection = (sub: NoteSubSection) => (
    <div key={sub.id} className={styles.subSectionCard}>
      <header className={styles.subSectionHeader}>
        <span className={styles.subSectionCode}>{sub.shortLabel}</span>
        <h3>{sub.title}</h3>
        {sub.intro ? <p>{sub.intro}</p> : null}
      </header>
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
            <p>{block.text}</p>
            {block.terms?.length ? (
              <div className={styles.inlineTermBar} aria-label="Related terms in this paragraph">
                {block.terms.map((term) => (
                  <button
                    key={`${key}-${term.inspectorId}`}
                    type="button"
                    className={styles.termChip}
                    data-testid={`term-trigger-${term.inspectorId}`}
                    onClick={(e) => openInspector(term.inspectorId, e)}
                  >
                    <Info size={13} aria-hidden="true" />
                    <span>{term.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );

      case "callout":
        return (
          <div
            key={key}
            className={`${styles.callout} ${
              block.tone === "warn"
                ? styles.calloutWarn
                : block.tone === "ok"
                  ? styles.calloutOk
                  : block.tone === "alert"
                    ? styles.calloutAlert
                    : styles.calloutInfo
            }`}
          >
            <div className={styles.calloutHead}>
              <ShieldAlert size={16} aria-hidden="true" />
              <strong>{block.title}</strong>
            </div>
            {block.body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {block.bullets?.length ? (
              <ul>
                {block.bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : null}
            {block.inspectorIds?.length ? (
              <div className={styles.calloutTriggers}>
                {block.inspectorIds.map((id) => {
                  const item = note.inspectors[id];
                  if (!item) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.termChip}
                      onClick={(e) => openInspector(id, e)}
                    >
                      <Info size={13} aria-hidden="true" />
                      <span>Inspect {item.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );

      case "terminal":
        return <NoteTerminal key={key} terminal={block.terminal} />;

      case "settings-table":
        return (
          <div key={key} className={styles.tableCard}>
            {block.title ? <div className={styles.tableCardHeader}>{block.title}</div> : null}
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Description</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.setting}>
                      <td>
                        <code className={styles.settingCode}>{row.setting}</code>
                      </td>
                      <td>{row.summary}</td>
                      <td>
                        <button
                          type="button"
                          className={`${styles.inspectRowBtn} ${
                            row.riskLevel === "danger"
                              ? styles.inspectRowDanger
                              : row.riskLevel === "safe"
                                ? styles.inspectRowSafe
                                : ""
                          }`}
                          data-testid={`inspect-${row.inspectorId}`}
                          onClick={(e) => openInspector(row.inspectorId, e)}
                        >
                          <Info size={13} aria-hidden="true" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "comparison-table":
        return (
          <div key={key} className={styles.tableCard}>
            {block.title ? <div className={styles.tableCardHeader}>{block.title}</div> : null}
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    {block.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                    <th>Inspect</th>
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
                            cell
                          )}
                        </td>
                      ))}
                      <td>
                        {row.inspectorId ? (
                          <button
                            type="button"
                            className={styles.inspectRowBtn}
                            onClick={(e) => openInspector(row.inspectorId!, e)}
                          >
                            <Info size={13} aria-hidden="true" />
                            <span>Inspect</span>
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "response-codes":
        return (
          <div key={key} className={styles.codesSection}>
            {block.title ? <h3 className={styles.blockSubTitle}>{block.title}</h3> : null}
            <div className={styles.codesGrid}>
              {block.codes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`${styles.codeCard} ${
                    item.tone === "ok"
                      ? styles.codeCardOk
                      : item.tone === "alert"
                        ? styles.codeCardAlert
                        : styles.codeCardInfo
                  }`}
                  data-testid={`code-trigger-${item.code}`}
                  onClick={(e) => openInspector(item.inspectorId, e)}
                >
                  <span className={styles.codeNumber}>{item.code}</span>
                  <span className={styles.codeMeaning}>{item.meaning}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "risk-list":
        return (
          <div key={key} className={`${styles.callout} ${styles.calloutAlert}`}>
            <div className={styles.calloutHead}>
              <ShieldAlert size={16} aria-hidden="true" />
              <strong>{block.title}</strong>
            </div>
            <ul className={styles.riskBullets}>
              {block.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            {block.footnote ? <p className={styles.riskFootnote}>{block.footnote}</p> : null}
          </div>
        );

      case "term-chips":
        return (
          <div key={key} className={styles.termChipsPanel}>
            {block.title ? <p className={styles.termChipsTitle}>{block.title}</p> : null}
            <div className={styles.inlineTermBar}>
              {block.chipIds.map((id) => {
                const entry = note.inspectors[id];
                if (!entry) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className={styles.termChip}
                    data-testid={`term-trigger-${id}`}
                    onClick={(e) => openInspector(id, e)}
                  >
                    <Info size={13} aria-hidden="true" />
                    <span>{entry.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "steps-grid":
        return (
          <div key={key} className={styles.stepsGrid}>
            {block.cards.map((card) => (
              <div key={card.code} className={styles.stepCard}>
                <div className={styles.stepCardTop}>
                  <span className={styles.stepCode}>{card.code}</span>
                  {card.inspectorId ? (
                    <button
                      type="button"
                      className={styles.stepInspectBtn}
                      onClick={(e) => openInspector(card.inspectorId!, e)}
                    >
                      Inspect
                    </button>
                  ) : null}
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        );

      case "sub-sections": {
        if (layoutMode === "stack") {
          return (
            <div key={key} className={styles.subSectionsStack}>
              {block.sections.map((sub) => renderSubSection(sub))}
            </div>
          );
        }
        const activeSub =
          block.sections.find((sec) => sec.id === activeConfigSubId) ?? block.sections[0];
        return (
          <div key={key} className={styles.subSectionsTabbed}>
            <div className={styles.subTabList} role="tablist" aria-label="Configuration groups">
              {block.sections.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSub.id === sub.id}
                  className={`${styles.subTabBtn} ${
                    activeSub.id === sub.id ? styles.subTabActive : ""
                  }`}
                  onClick={() => setActiveConfigSubId(sub.id)}
                >
                  {sub.shortLabel}
                </button>
              ))}
            </div>
            {renderSubSection(activeSub)}
          </div>
        );
      }
    }
  };

  const renderPartBody = (part: NotePart) => (
    <section
      key={part.id}
      id={`part-${part.id}`}
      className={styles.partPanel}
      aria-labelledby={`part-heading-${part.id}`}
    >
      <header className={styles.partHeader}>
        <span className={styles.partIndex}>{part.indexLabel}</span>
        <div>
          <h2 id={`part-heading-${part.id}`}>{part.title}</h2>
          <p className={styles.partIntro}>{part.intro}</p>
        </div>
      </header>

      <div className={styles.blocksStack}>
        {part.blocks.map((block, idx) => renderBlock(block, `${part.id}-${idx}`))}
      </div>
    </section>
  );

  const prevPart = activePartIndex > 0 ? note.parts[activePartIndex - 1] : null;
  const nextPart =
    activePartIndex < note.parts.length - 1 ? note.parts[activePartIndex + 1] : null;

  return (
    <div className={`shell ${styles.workspaceShell}`}>
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

      <header className={styles.heroCard}>
        <div className={styles.heroTopRow}>
          <div className={styles.heroBadges}>
            <span className={styles.badgePrimary}>
              <FolderOpen size={13} aria-hidden="true" />
              <span>Security / {note.folderTitle}</span>
            </span>
            <span className={styles.badgeMono}>{note.ports}</span>
            <span className={styles.badgeMono}>{note.daemon}</span>
          </div>
          <span className={styles.heroMeta}>
            {note.parts.length} SECTIONS / {note.diagrams.length} DIAGRAMS /{" "}
            {Object.keys(note.inspectors).length} POP-UP INSPECTORS
          </span>
        </div>

        <h1 className={styles.heroTitle}>{note.title}</h1>
        <p className={styles.heroSummary}>{note.summary}</p>

        <div className={styles.quickFactsStrip}>
          {note.quickFacts.map((fact) => (
            <div key={fact.label} className={styles.quickFactCell}>
              <div className={styles.quickFactTop}>
                <span>{fact.label}</span>
                {fact.inspectorId ? (
                  <button
                    type="button"
                    className={styles.quickFactInspect}
                    onClick={(e) => openInspector(fact.inspectorId!, e)}
                    aria-label={`Inspect ${fact.label}`}
                  >
                    <Info size={13} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <p>{fact.value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className={styles.toolbar} role="region" aria-label="Note layout controls">
        <div className={styles.layoutSwitcher} role="group" aria-label="Choose reading layout">
          <span className={styles.toolbarLabel}>LAYOUT</span>
          <button
            type="button"
            aria-pressed={layoutMode === "split"}
            className={`${styles.layoutBtn} ${layoutMode === "split" ? styles.layoutBtnActive : ""}`}
            data-testid="layout-mode-split"
            onClick={() => setLayoutMode("split")}
          >
            <Columns2 size={15} aria-hidden="true" />
            <span>Split Visual</span>
          </button>
          <button
            type="button"
            aria-pressed={layoutMode === "stack"}
            className={`${styles.layoutBtn} ${layoutMode === "stack" ? styles.layoutBtnActive : ""}`}
            data-testid="layout-mode-stack"
            onClick={() => setLayoutMode("stack")}
          >
            <ListTree size={15} aria-hidden="true" />
            <span>Vertical Stack</span>
          </button>
          <button
            type="button"
            aria-pressed={layoutMode === "board"}
            className={`${styles.layoutBtn} ${layoutMode === "board" ? styles.layoutBtnActive : ""}`}
            data-testid="layout-mode-board"
            onClick={() => setLayoutMode("board")}
          >
            <LayoutGrid size={15} aria-hidden="true" />
            <span>Visual Board</span>
          </button>
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={openFullOverviewSheet}
            data-testid="open-full-sheet-btn"
          >
            <Eye size={15} aria-hidden="true" />
            <span>Full Overview Sheet</span>
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${showQuickRef ? styles.toolbarBtnActive : ""}`}
            aria-expanded={showQuickRef}
            onClick={() => setShowQuickRef((v) => !v)}
            data-testid="toggle-quick-ref-btn"
          >
            <Sparkles size={15} aria-hidden="true" />
            <span>Quick Inspector ({Object.keys(note.inspectors).length})</span>
          </button>
        </div>
      </div>

      {showQuickRef ? (
        <section className={styles.quickRefDrawer} aria-label="Quick inspector index">
          <div className={styles.quickRefHeader}>
            <div>
              <strong>Quick Pop-Up Inspector Index</strong>
              <span>Click any item to open the draggable floating window without scrolling away.</span>
            </div>
            <button
              type="button"
              className={styles.quickRefClose}
              onClick={() => setShowQuickRef(false)}
            >
              Hide
            </button>
          </div>
          <div className={styles.quickRefGroups}>
            {groupedInspectorEntries.map(([category, items]) => (
              <div key={category} className={styles.quickRefGroup}>
                <h3>{category}</h3>
                <div className={styles.quickRefPills}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.termChip}
                      onClick={(e) => openInspector(item.id, e)}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {layoutMode === "split" ? (
        <div className={styles.splitStage}>
          <div className={styles.splitMainColumn}>
            <nav className={styles.chapterTabs} role="tablist" aria-label="FTP note sections">
              {note.parts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  role="tab"
                  aria-selected={activePart.id === part.id}
                  data-testid={`chapter-tab-${part.id}`}
                  className={`${styles.chapterTabBtn} ${
                    activePart.id === part.id ? styles.chapterTabActive : ""
                  }`}
                  onClick={() => setActivePartId(part.id)}
                >
                  <span className={styles.chapterTabIdx}>{part.indexLabel}</span>
                  <span>{part.shortTitle}</span>
                </button>
              ))}
            </nav>

            {renderPartBody(activePart)}

            <div className={styles.chapterPager}>
              {prevPart ? (
                <button
                  type="button"
                  className={styles.pagerBtn}
                  onClick={() => setActivePartId(prevPart.id)}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span>
                    <small>Previous</small>
                    <strong>
                      {prevPart.indexLabel}. {prevPart.shortTitle}
                    </strong>
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextPart ? (
                <button
                  type="button"
                  className={`${styles.pagerBtn} ${styles.pagerBtnNext}`}
                  onClick={() => setActivePartId(nextPart.id)}
                >
                  <span>
                    <small>Next section</small>
                    <strong>
                      {nextPart.indexLabel}. {nextPart.shortTitle}
                    </strong>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <aside className={styles.diagramRail} aria-label="Separated vertical visual diagrams">
            <div className={styles.railTopBar}>
              <div>
                <span className={styles.railEyebrow}>SEPARATED DIAGRAMS</span>
                <strong>Vertical Visual Summary</strong>
              </div>
              <div className={styles.railFilterGroup} role="group" aria-label="Filter diagrams">
                <button
                  type="button"
                  className={`${styles.railFilterBtn} ${
                    railFilter === "active" ? styles.railFilterActive : ""
                  }`}
                  onClick={() => setRailFilter("active")}
                >
                  Active Part
                </button>
                <button
                  type="button"
                  className={`${styles.railFilterBtn} ${
                    railFilter === "all" ? styles.railFilterActive : ""
                  }`}
                  onClick={() => setRailFilter("all")}
                >
                  All ({note.diagrams.length})
                </button>
              </div>
            </div>

            <div className={styles.railVerticalStack}>
              {activeRailDiagrams.map((diagram) => (
                <DiagramPlate
                  key={diagram.id}
                  diagram={diagram}
                  inspectors={note.inspectors}
                  onInspectTerm={(id) => openInspector(id)}
                  onZoomDiagram={openDiagramPreview}
                />
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {layoutMode === "stack" ? (
        <div className={styles.stackStage}>
          <nav className={styles.stackJumpNav} aria-label="Jump to section">
            {note.parts.map((part) => (
              <a key={part.id} href={`#part-${part.id}`} className={styles.stackJumpLink}>
                <span>{part.indexLabel}</span>
                <span>{part.shortTitle}</span>
              </a>
            ))}
          </nav>

          <div className={styles.stackRows}>
            {note.parts.map((part) => {
              const partDiagrams = part.diagramIds
                .map((id) => diagramsById[id])
                .filter(Boolean);
              return (
                <div key={part.id} className={styles.stackRow}>
                  <div className={styles.stackTextCol}>{renderPartBody(part)}</div>
                  <div className={styles.stackVisualCol}>
                    {partDiagrams.map((diagram) => (
                      <DiagramPlate
                        key={`${part.id}-${diagram.id}`}
                        diagram={diagram}
                        inspectors={note.inspectors}
                        onInspectTerm={(id) => openInspector(id)}
                        onZoomDiagram={openDiagramPreview}
                        compact
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {layoutMode === "board" ? (
        <div className={styles.boardStage}>
          <div className={styles.boardIntroBar}>
            <div>
              <span className={styles.railEyebrow}>VISUAL BOARD MODE</span>
              <h2>Separated Diagrams &amp; Vertical Summary</h2>
              <p>
                Each diagram summarizes one core section. Swap any asset later by replacing its
                file path, or jump directly into its written breakdown.
              </p>
            </div>
            <button
              type="button"
              className={styles.toolbarBtn}
              onClick={() => setLayoutMode("split")}
            >
              <BookOpen size={15} aria-hidden="true" />
              <span>Return to Split Notes</span>
            </button>
          </div>

          <div className={styles.boardVerticalColumn}>
            {note.diagrams.map((diagram) => {
              const parentPart = note.parts.find((p) => p.id === diagram.partId);
              return (
                <div key={diagram.id} className={styles.boardRow}>
                  <div className={styles.boardMetaCol}>
                    <span className={styles.boardPartTag}>
                      {parentPart ? `${parentPart.indexLabel} / ${parentPart.shortTitle}` : "NOTE"}
                    </span>
                    <h3>{diagram.title}</h3>
                    <p>{diagram.summary}</p>
                    <ul className={styles.diagramKeyPoints}>
                      {diagram.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                    {parentPart ? (
                      <button
                        type="button"
                        className={styles.boardJumpBtn}
                        onClick={() => {
                          setActivePartId(parentPart.id);
                          if (diagram.subSectionId) {
                            setActiveConfigSubId(diagram.subSectionId);
                          }
                          setLayoutMode("split");
                        }}
                      >
                        <TerminalIcon size={14} aria-hidden="true" />
                        <span>Open {parentPart.shortTitle} Notes</span>
                      </button>
                    ) : null}
                  </div>
                  <div className={styles.boardPlateCol}>
                    <DiagramPlate
                      diagram={diagram}
                      inspectors={note.inspectors}
                      onInspectTerm={(id) => openInspector(id)}
                      onZoomDiagram={openDiagramPreview}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

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
