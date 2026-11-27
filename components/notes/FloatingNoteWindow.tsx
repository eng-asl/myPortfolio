"use client";

import React, { useEffect, useId } from "react";
import { GripHorizontal, X } from "lucide-react";
import type { DiagramSlot, InspectorEntry } from "@/types/security-notes";
import { PublicImage } from "@/components/PublicImage";
import { useNoteDraggable, type NoteWindowPosition } from "./useNoteDraggable";
import { NoteTerminal } from "./NoteTerminal";
import { DiagramBlueprint } from "./DiagramBlueprint";
import styles from "./SecurityNotes.module.css";

export interface FloatingNoteWindowProps {
  entry: InspectorEntry | null;
  diagramPreview: DiagramSlot | null;
  diagramsById: Record<string, DiagramSlot>;
  inspectors: Record<string, InspectorEntry>;
  onSelectEntry?: (inspectorId: string) => void;
  onClose: () => void;
  initialPosition?: NoteWindowPosition;
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

export function FloatingNoteWindow({
  entry,
  diagramPreview,
  diagramsById,
  onClose,
  initialPosition
}: FloatingNoteWindowProps) {
  const titleId = useId();
  const isOpen = Boolean(entry || diagramPreview);

  const { position, targetRef, handleRef, isDragging, handleProps } = useNoteDraggable({
    initialPosition,
    disabled: !isOpen
  });

  useEffect(() => {
    if (!isOpen) return;
    targetRef.current?.focus({ preventScroll: true });
  }, [isOpen, entry?.id, diagramPreview?.id, targetRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (diagramPreview && !entry) {
    return (
      <aside
        ref={(node) => {
          targetRef.current = node;
        }}
        tabIndex={-1}
        role="region"
        aria-labelledby={titleId}
        data-testid="floating-note-window"
        className={`${styles.floatingWindow} ${styles.floatingWindowWide} ${
          isDragging ? styles.floatingWindowDragging : ""
        }`}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
      >
        <header
          ref={(node) => {
            handleRef.current = node;
          }}
          {...handleProps}
          data-testid="floating-note-drag-handle"
          className={styles.floatingHeader}
        >
          <div className={styles.floatingHeaderLeft}>
            <GripHorizontal size={16} className={styles.floatingGrip} aria-hidden="true" />
            <h2 id={titleId} className={styles.floatingTitle}>
              {diagramPreview.title}
            </h2>
          </div>
          <div className={styles.floatingHeaderRight}>
            <span className={styles.floatingBadge}>{diagramPreview.figLabel}</span>
            <button
              type="button"
              data-no-drag
              onClick={onClose}
              aria-label="Close extended view"
              data-testid="floating-note-close"
              className={styles.floatingCloseBtn}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className={styles.floatingBody}>
          <div
            className={`${styles.diagramCanvas} ${
              diagramPreview.imageSrc
                ? styles.diagramCanvasLightMat
                : styles.diagramCanvasBlueprint
            }`}
          >
            {diagramPreview.imageSrc ? (
              <PublicImage
                src={diagramPreview.imageSrc}
                alt={diagramPreview.alt}
                className={styles.diagramImg}
                sizes="(max-width: 760px) 100vw, 720px"
                loading="eager"
              />
            ) : diagramPreview.placeholderKind ? (
              <DiagramBlueprint
                kind={diagramPreview.placeholderKind}
                alt={diagramPreview.alt}
              />
            ) : null}
          </div>

          <p className={styles.floatingLead}>{renderInlineCode(diagramPreview.summary)}</p>

          {diagramPreview.keyPoints.length > 0 ? (
            <ul className={styles.floatingDetailList}>
              {diagramPreview.keyPoints.map((point, index) => (
                <li key={index}>{renderInlineCode(point)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    );
  }

  if (!entry) return null;

  const linkedDiagram = entry.diagramId ? diagramsById[entry.diagramId] : undefined;
  const terminals = [
    ...(entry.terminal ? [entry.terminal] : []),
    ...(entry.terminals ?? [])
  ];

  return (
    <aside
      ref={(node) => {
        targetRef.current = node;
      }}
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      data-testid="floating-note-window"
      className={`${styles.floatingWindow} ${linkedDiagram || entry.tables?.length ? styles.floatingWindowWide : ""} ${
        isDragging ? styles.floatingWindowDragging : ""
      }`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
    >
      <header
        ref={(node) => {
          handleRef.current = node;
        }}
        {...handleProps}
        data-testid="floating-note-drag-handle"
        className={styles.floatingHeader}
      >
        <div className={styles.floatingHeaderLeft}>
          <GripHorizontal size={16} className={styles.floatingGrip} aria-hidden="true" />
          <h2 id={titleId} className={styles.floatingTitle}>
            {entry.label}
          </h2>
        </div>

        <div className={styles.floatingHeaderRight}>
          <span className={styles.floatingBadge}>{entry.category}</span>
          <button
            type="button"
            data-no-drag
            onClick={onClose}
            aria-label="Close extended view"
            data-testid="floating-note-close"
            className={styles.floatingCloseBtn}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.floatingBody}>
        {entry.sourceLabel ? (
          <p className={styles.floatingSourceLabel}>{entry.sourceLabel}</p>
        ) : null}

        <p className={styles.floatingShortDef}>{renderInlineCode(entry.shortDefinition)}</p>

        {entry.steps?.length ? (
          <ol className={styles.floatingStepList}>
            {entry.steps.map((step, idx) => (
              <li key={idx}>{renderInlineCode(step)}</li>
            ))}
          </ol>
        ) : null}

        {entry.details.length > 0 ? (
          <ul className={styles.floatingDetailList}>
            {entry.details.map((item, idx) => (
              <li key={idx}>{renderInlineCode(item)}</li>
            ))}
          </ul>
        ) : null}

        {entry.tables?.map((tbl, tIdx) => (
          <div key={tIdx} className={styles.floatingTableWrap}>
            {tbl.caption ? <p className={styles.tableCaption}>{tbl.caption}</p> : null}
            <div className={styles.tableScroll}>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    {tbl.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tbl.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>
                          {cIdx === 0 ? (
                            <code className={styles.settingCode}>{cell}</code>
                          ) : (
                            renderInlineCode(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {linkedDiagram ? (
          <div className={styles.floatingDiagramBlock}>
            <div
              className={`${styles.diagramCanvas} ${
                linkedDiagram.imageSrc
                  ? styles.diagramCanvasLightMat
                  : styles.diagramCanvasBlueprint
              }`}
            >
              {linkedDiagram.imageSrc ? (
                <PublicImage
                  src={linkedDiagram.imageSrc}
                  alt={linkedDiagram.alt}
                  className={styles.diagramImg}
                  sizes="(max-width: 760px) 100vw, 680px"
                  loading="eager"
                />
              ) : linkedDiagram.placeholderKind ? (
                <DiagramBlueprint
                  kind={linkedDiagram.placeholderKind}
                  alt={linkedDiagram.alt}
                />
              ) : null}
            </div>
            <p className={styles.floatingLead}>{renderInlineCode(linkedDiagram.summary)}</p>
          </div>
        ) : null}

        {terminals.map((term) => (
          <NoteTerminal key={term.id} terminal={term} compact />
        ))}

        {entry.securityNote ? (
          <div className={styles.floatingSecurityBox}>
            <strong>Security and Verification Note</strong>
            <p>{renderInlineCode(entry.securityNote)}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
