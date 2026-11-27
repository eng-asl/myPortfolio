"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import styles from "./SecurityNotes.module.css";

export interface TocSubheading {
  id: string;
  title: string;
}

export interface TocItem {
  id: string;
  title: string;
  subheadings?: TocSubheading[];
}

interface NoteTableOfContentsProps {
  items: TocItem[];
}

export function NoteTableOfContents({ items }: NoteTableOfContentsProps) {
  const flatIds = useMemo(() => {
    const ids: Array<{ id: string; title: string }> = [];
    for (const item of items) {
      ids.push({ id: item.id, title: item.title });
      if (item.subheadings?.length) {
        for (const sub of item.subheadings) {
          ids.push({ id: sub.id, title: sub.title });
        }
      }
    }
    return ids;
  }, [items]);

  const [activeId, setActiveId] = useState<string>(flatIds[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const asideRef = useRef<HTMLElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const mobileBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!flatIds.length || typeof window === "undefined") return;

    const elements = flatIds
      .map((entry) => ({
        id: entry.id,
        el: document.getElementById(entry.id)
      }))
      .filter((entry): entry is { id: string; el: HTMLElement } => Boolean(entry.el));

    if (!elements.length) return;

    const pickActive = () => {
      const headerOffset = 128;
      let current = elements[0].id;
      for (const item of elements) {
        if (item.el.getBoundingClientRect().top <= headerOffset) {
          current = item.id;
        }
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 40
      ) {
        current = elements[elements.length - 1].id;
      }
      setActiveId(current);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => {
          pickActive();
        },
        {
          rootMargin: "-92px 0px -65% 0px",
          threshold: [0, 1]
        }
      );
      for (const item of elements) {
        observer.observe(item.el);
      }
    }

    pickActive();
    window.addEventListener("scroll", pickActive, { passive: true });
    window.addEventListener("resize", pickActive, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", pickActive);
      window.removeEventListener("resize", pickActive);
    };
  }, [flatIds]);

  useEffect(() => {
    const asideEl = asideRef.current;
    if (!asideEl || !activeId) return;
    if (asideEl.scrollHeight <= asideEl.clientHeight + 2) return;

    const activeLink = asideEl.querySelector<HTMLElement>(
      `a[href="#${CSS?.escape ? CSS.escape(activeId) : activeId}"]`
    );
    if (!activeLink) return;

    const linkTop = activeLink.offsetTop;
    const linkBottom = linkTop + activeLink.offsetHeight;
    const viewTop = asideEl.scrollTop;
    const viewBottom = viewTop + asideEl.clientHeight;

    if (linkTop < viewTop + 16) {
      asideEl.scrollTop = Math.max(0, linkTop - 24);
    } else if (linkBottom > viewBottom - 16) {
      asideEl.scrollTop = linkBottom - asideEl.clientHeight + 24;
    }
  }, [activeId]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    const onOutsideClick = (event: MouseEvent) => {
      if (mobileBarRef.current && !mobileBarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onOutsideClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onOutsideClick);
    };
  }, [mobileOpen]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
    setActiveId(id);
    setMobileOpen(false);
  };

  const activeTitle =
    flatIds.find((entry) => entry.id === activeId)?.title ?? items[0]?.title ?? "On this page";

  const renderList = (isMobile: boolean) => (
    <ol className={styles.docTocList}>
      {items.map((item) => {
        const isMainActive = activeId === item.id;
        return (
          <li key={item.id} className={styles.docTocGroup}>
            <a
              href={`#${item.id}`}
              className={`${styles.docTocLink} ${isMainActive ? styles.docTocLinkActive : ""}`}
              aria-current={isMainActive ? "location" : undefined}
              onClick={(e) => handleLinkClick(e, item.id)}
            >
              {item.title}
            </a>
            {item.subheadings?.length ? (
              <ol className={styles.docTocSubList}>
                {item.subheadings.map((sub) => {
                  const isSubActive = activeId === sub.id;
                  return (
                    <li key={`${isMobile ? "m" : "d"}-${sub.id}`}>
                      <a
                        href={`#${sub.id}`}
                        className={`${styles.docTocSubLink} ${
                          isSubActive ? styles.docTocSubLinkActive : ""
                        }`}
                        aria-current={isSubActive ? "location" : undefined}
                        onClick={(e) => handleLinkClick(e, sub.id)}
                      >
                        {sub.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <div
        ref={mobileBarRef}
        className={styles.mobileTocBar}
        data-testid="mobile-toc-bar"
      >
        <button
          ref={mobileToggleRef}
          type="button"
          className={styles.mobileTocToggle}
          aria-expanded={mobileOpen}
          aria-controls="mobile-toc-panel"
          data-testid="mobile-toc-toggle"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={styles.mobileTocToggleLeft}>
            <List size={14} aria-hidden="true" />
            <span className={styles.mobileTocLabel}>On this page</span>
            <span className={styles.mobileTocCurrent}>{activeTitle}</span>
          </span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`${styles.mobileTocChevron} ${
              mobileOpen ? styles.mobileTocChevronOpen : ""
            }`}
          />
        </button>

        <nav
          id="mobile-toc-panel"
          className={styles.mobileTocPanel}
          hidden={!mobileOpen}
          aria-label="On this page sections"
        >
          {renderList(true)}
        </nav>
      </div>

      <aside
        ref={asideRef}
        className={styles.docToc}
        aria-label="On this page"
        data-testid="article-jump-nav"
      >
        <p className={styles.docTocTitle}>On this page</p>
        {renderList(false)}
      </aside>
    </>
  );
}
