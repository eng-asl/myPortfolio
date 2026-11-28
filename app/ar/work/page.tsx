import Link from "next/link";
import type { Project } from "@/types/portfolio";
import { profile, projects, publications } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import { createPageMetadata } from "@/lib/seo";

const categoryArabic: Record<string, { title: string; intro: string }> = {
  "embedded-iot": {
    title: "الأنظمة المدمجة وإنترنت الأشياء",
    intro: "فيرموير، تصميم دوائر PCB، وبناء أنظمة متصلة متكاملة من الإشارة حتى الواجهة."
  },
  robotics: {
    title: "الروبوتات والأنظمة المستقلة",
    intro: "أنظمة حركة واستشعار وتحكم مختبرة عمليًا."
  },
  "apps-ui": {
    title: "تطبيقات الموبايل وواجهات التحكم",
    intro: "تطبيقات Flutter وواجهات تشغيل تربط المستخدم بالنظام المدمج."
  },
  "web-development": {
    title: "التحديث التقني لشركات الأعمال (B2B)",
    intro: "إعادة بناء المنصات والكتالوجات الصناعية لتسهيل البحث وتصدير المنتجات."
  },
  "video-media": {
    title: "الإنتاج التقني والمحتوى",
    intro: "مونتاج وموشن جرافيك لتوثيق المشروعات والفعاليات الهندسية."
  }
};

export const metadata = createPageMetadata({
  title: "المشروعات الهندسية والنماذج الأولية",
  description:
    "سجل مشروعات أحمد عسل في الأنظمة المدمجة وتصميم الدوائر والروبوتات وتطبيقات التحكم وتحديث المواقع التقنية للشركات.",
  pathname: "/ar/work/",
  locale: "ar",
  translated: true
});

export default function ArabicWorkPage() {
  const featured = projects.find((project) => project.slug === "topwood-rfid-catalog");
  const groups = groupWork(projects);

  return (
    <div className="asl-page asl-arabic-page">
      <section className="page-intro shell asl-page-intro">
        <p className="eyebrow">سجل العمل / نماذج وأنظمة موثقة</p>
        <h1>مشروعات مختارة</h1>
        <p className="page-lede">
          كل مشروع هنا يوضح المشكلة الهندسية، الدور الفعلي في الهاردوير والفيرموير والسوفتوير،
          والدليل العملي المرتبط به.
        </p>
      </section>

      {featured ? (
        <section className="shell page-section" aria-labelledby="ar-featured-case-title">
          <div className="planned-note-card">
            <div className="planned-note-meta mono">
              <span>دراسة حالة رئيسية / {featured.year}</span>
              <span dir="ltr">ESP8266 · RC522 · KiCad · SolidWorks</span>
            </div>
            <h2 id="ar-featured-case-title">
              <span dir="ltr">{featured.title}</span>
            </h2>
            <p>
              <span dir="ltr">{featured.outcome}</span>
            </p>
            {featured.testimonial ? (
              <p>«{featured.testimonial.quote}» — {featured.testimonial.author}</p>
            ) : null}
            <div style={{ marginTop: "18px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link className="btn-primary" href={`/work/embedded-iot/${featured.slug}/`}>
                افتح دراسة الحالة الكاملة بالإنجليزية ↗
              </Link>
              <Link className="btn-secondary" href="/ar/contact/">
                اطلب تنفيذ مشروع مشابه
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <h2>تصفح حسب التخصص</h2>
            <p className="section-intro">التفاصيل الهندسية والصور الكاملة متاحة في صفحات التخصصات الإنجليزية.</p>
          </div>
        </div>
        <div className="planned-notes-grid">
          {groups.map((group) => {
            const localized = categoryArabic[group.id] || { title: group.title, intro: group.intro };
            return (
              <Link className="planned-note-card" href={`/work/${group.id}/`} key={group.id}>
                <div className="planned-note-meta mono">
                  <span>{group.projects.length} {group.projects.length === 1 ? "مشروع" : "مشروعات"}</span>
                  <span>تخصص ↗</span>
                </div>
                <h3>{localized.title}</h3>
                <p>{localized.intro}</p>
                <p className="mono">
                  <span dir="ltr">{group.projects.slice(0, 3).map((item: Project) => item.title).join(" / ")}</span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <h2>الأبحاث والمنشورات العلمية</h2>
            <p className="section-intro">أوراق بحثية منشورة مع روابط Google Scholar وأداة البحث hybrid-guard.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <a className="btn-secondary" href={profile.scholar} target="_blank" rel="noreferrer">
              Google Scholar ↗
            </a>
            <a className="btn-secondary" href="/hybrid-guard/">
              hybrid-guard ↗
            </a>
          </div>
        </div>
        <div className="planned-notes-grid">
          {publications.map((pub) => (
            <a className="planned-note-card" href={pub.href} target="_blank" rel="noreferrer" key={pub.id}>
              <div className="planned-note-meta mono" dir="ltr">
                <span>{pub.year}</span>
                <span>{pub.ranking || pub.publicationType || "Paper"}</span>
              </div>
              <h3><span dir="ltr">{pub.title}</span></h3>
              <p><span dir="ltr">{pub.venue}</span></p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
