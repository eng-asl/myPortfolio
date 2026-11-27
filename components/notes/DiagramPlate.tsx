"use client";

import React from "react";
import { Maximize2 } from "lucide-react";
import type { DiagramSlot, InspectorEntry } from "@/types/security-notes";
import { PublicImage } from "@/components/PublicImage";
import { DiagramBlueprint } from "./DiagramBlueprint";
import styles from "./SecurityNotes.module.css";

interface DiagramPlateProps {
  diagram: DiagramSlot;
  inspectors?: Record<string, InspectorEntry>;
  onInspectTerm?: (inspectorId: string) => void;
  onZoomDiagram?: (diagram: DiagramSlot, event?: React.MouseEvent<HTMLElement>) => void;
  compact?: boolean;
  hideSummary?: boolean;
  sizes?: string;
}

export function DiagramPlate({
  diagram,
  onZoomDiagram,
  compact = false,
  hideSummary = false,
  sizes = "(max-width: 900px) 100vw, 760px"
}: DiagramPlateProps) {
  return (
    <figure
      className={`${styles.docFigure} ${compact ? styles.docFigureCompact : ""}`}
      data-diagram-id={diagram.id}
    >
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
            sizes={sizes}
            loading="lazy"
          />
        ) : diagram.placeholderKind ? (
          <DiagramBlueprint kind={diagram.placeholderKind} alt={diagram.alt} />
        ) : null}
      </div>

      <figcaption className={styles.docFigcaption}>
        <div className={styles.docFigcaptionCopy}>
          <strong className={styles.docFigureTitle}>{diagram.title}</strong>
          {!hideSummary ? (
            <p className={styles.docFigureSummary}>{diagram.summary}</p>
          ) : null}
        </div>

        {onZoomDiagram ? (
          <button
            type="button"
            className={styles.contextBtn}
            onClick={(event) => onZoomDiagram(diagram, event)}
            aria-label={`View Large: ${diagram.title}`}
          >
            <Maximize2 size={13} aria-hidden="true" />
            <span>View Large</span>
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
