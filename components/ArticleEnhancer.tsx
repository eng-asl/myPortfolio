"use client";

import { useEffect } from "react";

export function ArticleEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".article-body pre");
    const handlers: Array<[HTMLButtonElement, () => Promise<void>]> = [];

    blocks.forEach((block) => {
      if (block.querySelector(".copy-code")) return;
      const button = document.createElement("button");
      button.className = "copy-code";
      button.type = "button";
      button.textContent = "Copy";

      const handler = async () => {
        const code = block.querySelector("code")?.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1500);
        } catch {
          button.textContent = "Error";
        }
      };

      button.addEventListener("click", handler);
      block.appendChild(button);
      handlers.push([button, handler]);
    });

    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.article-toc a[href^="#"]')
    );
    const headings = tocLinks
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1);
        const el = id ? document.getElementById(id) : null;
        return el ? { id, el, link } : null;
      })
      .filter((item): item is { id: string; el: HTMLElement; link: HTMLAnchorElement } =>
        Boolean(item)
      );

    const setActiveHeading = (activeId: string | null) => {
      for (const item of headings) {
        if (item.id === activeId) {
          item.link.setAttribute("aria-current", "location");
        } else {
          item.link.removeAttribute("aria-current");
        }
      }
    };

    const pickByScroll = () => {
      if (!headings.length) return;
      const threshold = 132;
      let current = headings[0].id;
      for (const item of headings) {
        if (item.el.getBoundingClientRect().top <= threshold) {
          current = item.id;
        }
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 40
      ) {
        current = headings[headings.length - 1].id;
      }
      setActiveHeading(current);
    };

    let observer: IntersectionObserver | null = null;
    if (headings.length > 0 && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => {
          pickByScroll();
        },
        { rootMargin: "-92px 0px -65% 0px", threshold: [0, 1] }
      );
      headings.forEach((item) => observer?.observe(item.el));
      pickByScroll();
    }

    const onScroll = () => pickByScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      handlers.forEach(([button, handler]) =>
        button.removeEventListener("click", handler)
      );
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
