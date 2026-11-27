"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, List, Search, X } from "lucide-react";
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

export type NoteSearchKind = "SEC" | "CONF" | "CMD" | "CODE" | "POPUP";

export interface NoteSearchItem {
  id: string;
  kind: NoteSearchKind;
  title: string;
  sectionTitle: string;
  snippet: string;
  searchText: string;
  targetDomId: string;
  inspectorId?: string;
}

interface NoteTableOfContentsProps {
  items: TocItem[];
  searchItems?: NoteSearchItem[];
  onSelectSearchHit?: (item: NoteSearchItem) => void;
}

function rankSearchHits(items: NoteSearchItem[], rawQuery: string): NoteSearchItem[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const tokens = query.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const scored: Array<{ item: NoteSearchItem; score: number }> = [];
  for (const item of items) {
    const titleLower = item.title.toLowerCase();
    const snippetLower = item.snippet.toLowerCase();
    const haystack = item.searchText;
    if (!tokens.every((token) => haystack.includes(token))) continue;

    let score = 0;
    if (titleLower === query) score += 120;
    else if (titleLower.startsWith(query)) score += 85;
    else if (titleLower.includes(query)) score += 60;
    else if (tokens.every((token) => titleLower.includes(token))) score += 45;

    if (item.kind === "CONF" || item.kind === "CMD" || item.kind === "CODE") score += 20;
    else if (item.kind === "POPUP") score += 12;
    else score += 8;

    if (snippetLower.includes(query)) score += 15;
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 14).map((entry) => entry.item);
}

export function NoteTableOfContents({
  items,
  searchItems = [],
  onSelectSearchHit
}: NoteTableOfContentsProps) {
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
  const [query, setQuery] = useState<string>("");

  const asideRef = useRef<HTMLElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const mobileBarRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchRef = useRef<HTMLInputElement | null>(null);

  const searchHits = useMemo(
    () => rankSearchHits(searchItems, query),
    [searchItems, query]
  );
  const hasQuery = query.trim().length > 0;

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

  useEffect(() => {
    if (!searchItems.length || typeof window === "undefined") return;
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const asideVisible =
          asideRef.current && window.getComputedStyle(asideRef.current).display !== "none";
        if (asideVisible) {
          desktopSearchRef.current?.focus();
          desktopSearchRef.current?.select();
        } else {
          setMobileOpen(true);
          requestAnimationFrame(() => {
            mobileSearchRef.current?.focus();
            mobileSearchRef.current?.select();
          });
        }
        return;
      }

      if (!isEditable && event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const asideVisible =
          asideRef.current && window.getComputedStyle(asideRef.current).display !== "none";
        if (asideVisible) {
          desktopSearchRef.current?.focus();
        } else {
          setMobileOpen(true);
          requestAnimationFrame(() => {
            mobileSearchRef.current?.focus();
          });
        }
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [searchItems.length]);

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

  const handleHitClick = (hit: NoteSearchItem) => {
    setMobileOpen(false);
    onSelectSearchHit?.(hit);
  };

  const activeTitle =
    flatIds.find((entry) => entry.id === activeId)?.title ?? items[0]?.title ?? "On this page";

  const renderSearchBox = (inputRef: React.RefObject<HTMLInputElement | null>, scopeId: string) =>
    searchItems.length > 0 ? (
      <div className={styles.tocSearchBox}>
        <Search size={13} className={styles.tocSearchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          id={`note-search-${scopeId}`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.stopPropagation();
              setQuery("");
            } else if (event.key === "Enter" && searchHits.length > 0) {
              event.preventDefault();
              handleHitClick(searchHits[0]);
            }
          }}
          placeholder="Find command, setting, code..."
          aria-label="Find inside article"
          data-testid={`note-search-input-${scopeId}`}
          className={styles.tocSearchInput}
        />
        {hasQuery ? (
          <button
            type="button"
            className={styles.tocSearchClear}
            aria-label="Clear article search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X size={12} aria-hidden="true" />
          </button>
        ) : (
          <kbd className={styles.tocSearchKbd} aria-hidden="true">
            Ctrl K
          </kbd>
        )}
      </div>
    ) : null;

  const renderSearchResults = () => (
    <div className={styles.tocSearchResults} aria-live="polite">
      <p className={styles.tocSearchCount}>
        {searchHits.length === 0
          ? "No matches in article or pop-ups."
          : `${searchHits.length} ${searchHits.length === 1 ? "match" : "matches"}`}
      </p>
      {searchHits.length > 0 ? (
        <ul className={styles.tocSearchResultList}>
          {searchHits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className={styles.tocSearchHitBtn}
                data-testid={`search-hit-${hit.id}`}
                onClick={() => handleHitClick(hit)}
              >
                <span className={styles.tocSearchHitTop}>
                  <span className={styles.tocSearchHitBadge}>{hit.kind}</span>
                  <span className={styles.tocSearchHitTitle}>{hit.title}</span>
                </span>
                <span className={styles.tocSearchHitMeta}>
                  {hit.sectionTitle}
                  {hit.inspectorId ? " (Pop-up)" : ""}
                </span>
                {hit.snippet ? (
                  <span className={styles.tocSearchHitSnippet}>{hit.snippet}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

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
          {renderSearchBox(mobileSearchRef, "mobile")}
          {hasQuery ? renderSearchResults() : renderList(true)}
        </nav>
      </div>

      <aside
        ref={asideRef}
        className={styles.docToc}
        aria-label="On this page"
        data-testid="article-jump-nav"
      >
        <p className={styles.docTocTitle}>On this page</p>
        {renderSearchBox(desktopSearchRef, "desktop")}
        {hasQuery ? renderSearchResults() : renderList(false)}
      </aside>
    </>
  );
}
