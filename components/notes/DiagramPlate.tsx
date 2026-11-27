"use client";

import React from "react";
import { Maximize2, Layers } from "lucide-react";
import type { DiagramSlot, InspectorEntry } from "@/types/security-notes";
import { PublicImage } from "@/components/PublicImage";
import { DiagramBlueprint } from "./DiagramBlueprint";
import styles from "./SecurityNotes.module.css";

interface DiagramPlateProps {
  diagram: DiagramSlot;
  inspectors: Record<string, InspectorEntry>;
  onInspectTerm?: (inspectorId: string) => void;
  onZoomDiagram?: (diagram: DiagramSlot) => void;
  compact?: boolean;
}

export function DiagramPlate({
  diagram,
  inspectors,
  onInspectTerm,
  onZoomDiagram,
  compact = false
}: DiagramPlateProps) {
  const isBlueprint = !diagram.imageSrc && Boolean(diagram.placeholderKind);

  return (
    <figure
      className={`${styles.diagramPlate} ${compact ? styles.diagramPlateCompact : ""}`}
      data-diagram-id={diagram.id}
    >
      <header className={styles.diagramHeader}>
        <div className={styles.diagramMeta}>
          <span className={styles.diagramFig}>{diagram.figLabel}</span>
          <span className={styles.diagramSlotType}>
            {isBlueprint ? "BLUEPRINT SLOT" : "DIAGRAM"}
          </span>
        </div>
        {onZoomDiagram ? (
          <button
            type="button"
            className={styles.diagramZoomBtn}
            onClick={() => onZoomDiagram(diagram)}
            aria-label={`Open floating preview for ${diagram.title}`}
          >
            <Maximize2 size={14} aria-hidden="true" />
            <span>Pop out</span>
          </button>
        ) : null}
      </header>

      <div
        className={`${styles.diagramCanvas} ${
          diagram.imageSrc ? styles.diagramCanvasLightMat : styles.diagramCanvasBlueprint
        }`}
      >
        {diagram.imageSrc ? (
          <PublicImage
            src={diagram.imageSrc}
            alt={diagram.alt}
            className={styles.diagramImg}
            sizes="(max-width: 1100px) 100vw, 520px"
            loading="lazy"
          />
        ) : diagram.placeholderKind ? (
          <DiagramBlueprint kind={diagram.placeholderKind} alt={diagram.alt} />
        ) : null}
      </div>

      <figcaption className={styles.diagramCaption}>
        <h3 className={styles.diagramTitle}>{diagram.title}</h3>
        <p className={styles.diagramSummary}>{diagram.summary}</p>

        {!compact && diagram.keyPoints.length > 0 ? (
          <ul className={styles.diagramKeyPoints}>
            {diagram.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        ) : null}

        <div className={styles.diagramFooter}>
          {diagram.relatedInspectorIds && onInspectTerm ? (
            <div className={styles.diagramChipGroup}>
              {diagram.relatedInspectorIds.map((id) => {
                const entry = inspectors[id];
                if (!entry) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className={styles.diagramChip}
                    onClick={() => onInspectTerm(id)}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className={styles.diagramSwapPath} title="Swappable asset path">
            <Layers size={12} aria-hidden="true" />
            <span>{diagram.swapPath}</span>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
