import Link from "next/link";
import type { Project } from "@/types/portfolio";
import { PublicImage } from "@/components/PublicImage";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import styles from "./WorkPages.module.css";

export function WorkHub() {
  const featuredCase = projects.find((project) => project.slug === "topwood-rfid-catalog");
  const groups = groupWork(projects);

  return (
    <>
      {featuredCase ? (
        <section className={styles.featuredSection} aria-labelledby="featured-case-study-title">
          <div className={styles.featuredCard}>
            <div className={styles.featuredCopy}>
              <span className={styles.categoryMeta}>FEATURED CASE STUDY / {featuredCase.year || "VERIFIED"}</span>
              <h2 id="featured-case-study-title">{featuredCase.title}</h2>
              {featuredCase.role ? <p className={styles.featuredRole}>{featuredCase.role}</p> : null}
              <p className={styles.featuredOutcome}>{featuredCase.outcome}</p>
              {featuredCase.testimonial ? (
                <blockquote className={styles.featuredQuote}>
                  <p>“{featuredCase.testimonial.translation || featuredCase.testimonial.quote}”</p>
                  <footer>{featuredCase.testimonial.author} — {featuredCase.testimonial.context}</footer>
                </blockquote>
              ) : null}
              <div className={styles.featuredActions}>
                <Link className="btn-primary" href={`/work/embedded-iot/${featuredCase.slug}/`}>
                  Inspect full case study
                </Link>
              </div>
            </div>
            <Link className={styles.featuredMedia} href={`/work/embedded-iot/${featuredCase.slug}/`}>
              <PublicImage src={featuredCase.image} alt={featuredCase.title} sizesPreset="home-project" />
            </Link>
          </div>
        </section>
      ) : null}

      <div className={styles.hub}>
        {groups.map(group => <Link key={group.id} href={`/work/${group.id}/`} className={`${styles.category} ${styles[group.style]}`}>
          <span className={styles.categoryMeta}>{group.projects.length} {group.projects.length === 1 ? "project" : "projects"} <span aria-hidden="true">↗</span></span>
          <h2>{group.title}</h2><p>{group.intro}</p>
          <span className={styles.names}>{group.projects.slice(0, 3).map((project: Project) => project.title).join(" / ")}</span>
          <span className={styles.enter}>Explore category</span>
        </Link>)}
        <Link href="/work/recognition/" className={`${styles.category} ${styles.awards}`}><span className={styles.categoryMeta}>Competition record <span aria-hidden="true">↗</span></span><h2>Awards &amp; Competitions</h2><p>Team results, certificates, and the builds behind them.</p><span className={styles.enter}>View recognition</span></Link>
      </div>
    </>
  );
}

export function WorkBreadcrumb({ category, project }: { category?: { id: string; title: string }; project?: string }) {
  return <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/work/">Work</Link>{category && <><span aria-hidden="true">/</span>{project ? <Link href={`/work/${category.id}/`}>{category.title}</Link> : <span aria-current="page">{category.title}</span>}</>}{project && <><span aria-hidden="true">/</span><span aria-current="page">{project}</span></>}</nav>;
}
