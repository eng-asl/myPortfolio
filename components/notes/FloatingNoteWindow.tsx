"use client";

import React, { useEffect, useId, useState } from "react";
import { GripHorizontal, X, Layers } from "lucide-react";
import type { DiagramSlot, InspectorEntry } from "@/types/security-notes";
import { PublicImage } from "@/components/PublicImage";
import { useNoteDraggable, type NoteWindowPosition } from "./useNoteDraggable";
import { NoteTerminal } from "./NoteTerminal";
import { DiagramBlueprint } from "./DiagramBlueprint";
import styles from "./SecurityNotes.module.css";

export type FloatingInspectorTab = "overview" | "security" | "terminal" | "diagram";

export interface FloatingNoteWindowProps {
  entry: InspectorEntry | null;
  diagramPreview: DiagramSlot | null;
  diagramsById: Record<string, DiagramSlot>;
  inspectors: Record<string, InspectorEntry>;
  onSelectEntry: (inspectorId: string) => void;
  onClose: () => void;
  initialPosition?: NoteWindowPosition;
}

export function FloatingNoteWindow({
  entry,
  diagramPreview,
  diagramsById,
  inspectors,
  onSelectEntry,
  onClose,
  initialPosition
}: FloatingNoteWindowProps) {
  const titleId = useId();
  const isOpen = Boolean(entry || diagramPreview);
  const [activeTab, setActiveTab] = useState<FloatingInspectorTab>(
    entry?.defaultTab ?? "overview"
  );

  const { position, targetRef, handleRef, isDragging, handleProps } = useNoteDraggable({
    initialPosition,
    disabled: !isOpen
  });

  useEffect(() => {
    setActiveTab(entry?.defaultTab ?? "overview");
  }, [entry?.id, entry?.defaultTab, diagramPreview?.id]);

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
              aria-label="Close floating window"
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

          <p className={styles.floatingLead}>{diagramPreview.summary}</p>

          {diagramPreview.keyPoints.length > 0 ? (
            <ul className={styles.floatingDetailList}>
              {diagramPreview.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.diagramSwapPath}>
            <Layers size={12} aria-hidden="true" />
            <span>{diagramPreview.swapPath}</span>
          </div>

          {diagramPreview.relatedInspectorIds?.length ? (
            <div className={styles.floatingRelated}>
              <p className={styles.floatingRelatedTitle}>Inspect related directives &amp; concepts</p>
              <div className={styles.floatingRelatedRow}>
                {diagramPreview.relatedInspectorIds.map((id) => {
                  const target = inspectors[id];
                  if (!target) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.floatingRelatedBtn}
                      onClick={() => onSelectEntry(id)}
                    >
                      {target.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  if (!entry) return null;

  const linkedDiagram = entry.diagramId ? diagramsById[entry.diagramId] : undefined;
  const hasSecurityNote = Boolean(entry.securityNote);
  const hasTerminal = Boolean(entry.terminal);
  const hasDiagram = Boolean(linkedDiagram);

  return (
    <aside
      ref={(node) => {
        targetRef.current = node;
      }}
      role="region"
      aria-labelledby={titleId}
      data-testid="floating-note-window"
      className={`${styles.floatingWindow} ${isDragging ? styles.floatingWindowDragging : ""}`}
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
            aria-label="Close floating window"
            data-testid="floating-note-close"
            className={styles.floatingCloseBtn}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <nav className={styles.floatingTabs} role="tablist" aria-label="Inspector sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`${styles.floatingTabBtn} ${
            activeTab === "overview" ? styles.floatingTabActive : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        {hasSecurityNote ? (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "security"}
            className={`${styles.floatingTabBtn} ${
              activeTab === "security" ? styles.floatingTabActive : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            Security Note
          </button>
        ) : null}

        {hasTerminal ? (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "terminal"}
            className={`${styles.floatingTabBtn} ${
              activeTab === "terminal" ? styles.floatingTabActive : ""
            }`}
            onClick={() => setActiveTab("terminal")}
          >
            Terminal
          </button>
        ) : null}

        {hasDiagram ? (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "diagram"}
            className={`${styles.floatingTabBtn} ${
              activeTab === "diagram" ? styles.floatingTabActive : ""
            }`}
            onClick={() => setActiveTab("diagram")}
          >
            Diagram
          </button>
        ) : null}
      </nav>

      <div className={styles.floatingBody}>
        {activeTab === "overview" ? (
          <div className={styles.floatingPanel} role="tabpanel">
            <p className={styles.floatingShortDef}>{entry.shortDefinition}</p>
            {entry.details.length > 0 ? (
              <ul className={styles.floatingDetailList}>
                {entry.details.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : null}

            {entry.relatedIds?.length ? (
              <div className={styles.floatingRelated}>
                <p className={styles.floatingRelatedTitle}>Related items</p>
                <div className={styles.floatingRelatedRow}>
                  {entry.relatedIds.map((relId) => {
                    const rel = inspectors[relId];
                    if (!rel) return null;
                    return (
                      <button
                        key={relId}
                        type="button"
                        className={styles.floatingRelatedBtn}
                        onClick={() => onSelectEntry(relId)}
                      >
                        {rel.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "security" && entry.securityNote ? (
          <div className={styles.floatingPanel} role="tabpanel">
            <div className={styles.floatingSecurityBox}>
              <strong>Footprinting &amp; Hardening Takeaway</strong>
              <p>{entry.securityNote}</p>
            </div>
          </div>
        ) : null}

        {activeTab === "terminal" && entry.terminal ? (
          <div className={styles.floatingPanel} role="tabpanel">
            <p className={styles.floatingLead}>{entry.shortDefinition}</p>
            <NoteTerminal terminal={entry.terminal} compact />
          </div>
        ) : null}

        {activeTab === "diagram" && linkedDiagram ? (
          <div className={styles.floatingPanel} role="tabpanel">
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
                  sizes="(max-width: 760px) 100vw, 480px"
                  loading="eager"
                />
              ) : linkedDiagram.placeholderKind ? (
                <DiagramBlueprint
                  kind={linkedDiagram.placeholderKind}
                  alt={linkedDiagram.alt}
                />
              ) : null}
            </div>
            <p className={styles.floatingLead}>{linkedDiagram.summary}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
