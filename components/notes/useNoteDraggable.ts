"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties
} from "react";

export interface NoteWindowPosition {
  x: number;
  y: number;
}

export interface UseNoteDraggableOptions {
  initialPosition?: NoteWindowPosition;
  boundaryMargin?: number;
  disabled?: boolean;
}

export function useNoteDraggable(options: UseNoteDraggableOptions = {}) {
  const { initialPosition, boundaryMargin = 12, disabled = false } = options;

  const targetRef = useRef<HTMLElement | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);

  const [position, setPosition] = useState<NoteWindowPosition>(() => {
    if (initialPosition) return initialPosition;
    if (typeof window !== "undefined") {
      const defaultWidth = Math.min(540, window.innerWidth - boundaryMargin * 2);
      return {
        x: Math.max(boundaryMargin, window.innerWidth - defaultWidth - 28),
        y: Math.max(boundaryMargin, 88)
      };
    }
    return { x: 24, y: 88 };
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragSnapshot = useRef<{
    activePointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const clampCoordinates = useCallback(
    (candX: number, candY: number): NoteWindowPosition => {
      const el = targetRef.current;
      const width = el?.offsetWidth || 480;
      const height = el?.offsetHeight || 380;

      const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;

      const maxX = Math.max(boundaryMargin, winW - width - boundaryMargin);
      const maxY = Math.max(boundaryMargin, winH - height - boundaryMargin);

      return {
        x: Math.min(Math.max(boundaryMargin, candX), maxX),
        y: Math.min(Math.max(boundaryMargin, candY), maxY)
      };
    },
    [boundaryMargin]
  );

  useEffect(() => {
    if (!initialPosition) return;
    setPosition(clampCoordinates(initialPosition.x, initialPosition.y));
  }, [initialPosition?.x, initialPosition?.y, clampCoordinates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setPosition((prev) => clampCoordinates(prev.x, prev.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampCoordinates]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (event.button !== undefined && event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, input, select, textarea, [data-no-drag]")) {
        return;
      }

      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore pointer capture failures in headless or test environments
        }
      }

      event.preventDefault();
      dragSnapshot.current = {
        activePointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        origX: position.x,
        origY: position.y
      };
      setIsDragging(true);
    },
    [disabled, position.x, position.y]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const snap = dragSnapshot.current;
      if (!snap || snap.activePointerId !== event.pointerId) return;
      const dx = event.clientX - snap.startX;
      const dy = event.clientY - snap.startY;
      setPosition(clampCoordinates(snap.origX + dx, snap.origY + dy));
    },
    [clampCoordinates]
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const snap = dragSnapshot.current;
    if (!snap || snap.activePointerId !== event.pointerId) return;
    if (typeof event.currentTarget.releasePointerCapture === "function") {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore if already released
      }
    }
    dragSnapshot.current = null;
    setIsDragging(false);
  }, []);

  const handleStyle: CSSProperties = {
    touchAction: "none",
    userSelect: "none",
    cursor: isDragging ? "grabbing" : "grab"
  };

  return {
    position,
    targetRef,
    handleRef,
    isDragging,
    handleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      style: handleStyle
    }
  };
}
