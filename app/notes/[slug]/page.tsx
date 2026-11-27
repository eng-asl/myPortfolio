import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEnhancer } from "@/components/ArticleEnhancer";
import { JsonLd } from "@/components/JsonLd";
import {
  getAllPosts,
  getPost,
  renderPost
} from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { createArticleJsonLd, createPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const metadata = createPageMetadata({
    title: post.title,
    description: post.summary,
    pathname: `/notes/${post.slug}/`
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      tags: post.tags
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.draft) notFound();

  const { html, headings } = renderPost(post.content);
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const previous = posts[currentIndex + 1];
  const next = posts[currentIndex - 1];
  const wasUpdated = post.updatedAt && post.updatedAt !== post.publishedAt;

  return (
    <article className="asl-page article-page asl-article">
      <JsonLd data={createArticleJsonLd(post)} />

      <header className="article-header shell">
        <div className="article-header-inner">
          <Link className="article-back" href="/notes">
            <span aria-hidden="true">&larr;</span> All engineering notes
          </Link>
          <h1>{post.title}</h1>
          <p className="article-summary">{post.summary}</p>
          <div className="article-meta-line mono">
            <span>
              By <Link href="/about">Ahmed Asl</Link>
            </span>
            <span>Published {formatDate(post.publishedAt)}</span>
            {wasUpdated ? <span>Updated {formatDate(post.updatedAt)}</span> : null}
            <span>{post.readingTime} min read</span>
            {post.difficulty ? <span>{post.difficulty}</span> : null}
            {post.part ? <span>Part {post.part}</span> : null}
          </div>
          {post.tags.length ? (
            <div className="tag-row article-tags">
              {post.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className="article-layout shell">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {headings.length ? (
          <aside className="article-rail article-toc" aria-label="On this page">
            <p className="toc-title">On this page</p>
            <ol>
              {headings.map((heading) => (
                <li className={`depth-${heading.depth}`} key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

      <footer id="article-end" className="article-footer shell">
        <div className="article-footer-inner">
          <h2>Continue reading</h2>
          <div className="article-pagination">
            {previous ? (
              <Link href={`/notes/${previous.slug}`}>
                <span>Previous</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : null}
            {next ? (
              <Link href={`/notes/${next.slug}`}>
                <span>Next</span>
                <strong>{next.title}</strong>
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
      <ArticleEnhancer />
    </article>
  );
}
