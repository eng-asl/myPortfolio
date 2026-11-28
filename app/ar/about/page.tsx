import Link from "next/link";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { education, experience, profile } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "عن أحمد إبراهيم عسل",
  description:
    "مهندس بحث وتطوير في الأنظمة المدمجة وإنترنت الأشياء وبناء النماذج الأولية المتكاملة من الدوائر الإلكترونية إلى التطبيقات.",
  pathname: "/ar/about/",
  locale: "ar",
  translated: true
});

export default function ArabicAboutPage() {
  return (
    <div className="asl-page asl-about-trace asl-arabic-page">
      <section className="page-intro shell about-intro about-story-intro">
        <div className="about-intro-copy">
          <span className="eyebrow">الأنظمة المدمجة وإنترنت الأشياء / بحث وتطوير</span>
          <h1>أحمد إبراهيم عسل</h1>
          <p className="page-lede">
            أنا مهندس بحث وتطوير في الأنظمة المدمجة وإنترنت الأشياء. بحوّل متطلبات المنتجات المعقدة
            إلى دوائر إلكترونية، PCB، فيرموير محكم، وتطبيقات موبايل أو ويب متصلة ومختبرة عمليًا ضمن
            مسار مسؤول واحد.
          </p>
          <p className="about-name-note">
            اسم العائلة «عسل» يظهر في السجلات الإنجليزية بصيغ Asl أو Assal أو Assl، والصيغة المعتمدة هنا هي Asl.
          </p>
          <nav className="portfolio-jump-links" aria-label="أقسام الصفحة">
            <a className="text-link" href={profile.cv} target="_blank" rel="noreferrer">
              افتح السيرة الذاتية (PDF) ↗
            </a>
            <a className="text-link" href="#ar-experience">الخبرة العملية</a>
            <a className="text-link" href="#ar-education">التعليم</a>
            <Link className="text-link" href="/work/#publications">الأبحاث والمنشورات ↗</Link>
            <Link className="text-link" href="/ar/contact/">تواصل لمشروع</Link>
          </nav>
        </div>
        <ProfilePortrait context="about" />
      </section>

      <section className="shell about-statement about-statement-focused">
        <div className="about-story-grid">
          <article>
            <span className="mono">01 / ONE ACCOUNTABLE WORKFLOW</span>
            <h2>مسار هندسي متكامل بدون تشتيت.</h2>
            <p>
              من اختيار المكونات وتصميم الدائرة والـ PCB في KiCad إلى الفيرموير على STM32/ESP32 وربطها بتطبيق Flutter أو بوابة تحكم.
            </p>
          </article>
          <article>
            <span className="mono">02 / PROVE THE BUILD</span>
            <h2>نموذج أولي قابل للقياس.</h2>
            <p>
              توثيق الافتراضات واختبار أعطال التشغيل الحقيقية عشان يطلع نظام جاهز للتقييم أو الإنتاج المبدئي.
            </p>
          </article>
          <article>
            <span className="mono">03 / DOCUMENT &amp; HAND OFF</span>
            <h2>تسليم واضح وقابل للتوسع.</h2>
            <p>
              الخبرة السابقة في التدريس التقني رسّخت مبدأ واضح: أي نظام ناجح لازم يكون موثّق ومفهوم للفريق اللي هيستلمه ويطوّره.
            </p>
          </article>
        </div>
        <aside className="profile-credential-card">
          <div>
            <h2>السيرة الذاتية والسجل الأكاديمي والبحثي</h2>
            <p>افتح ملف السيرة الذاتية للاطلاع على المشاريع التفصيلية، الشهادات، والخبرة العملية.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <a className="button primary" href={profile.cv} target="_blank" rel="noreferrer">
              افتح السيرة الذاتية
            </a>
            <a className="btn-secondary" href={profile.scholar} target="_blank" rel="noreferrer">
              Google Scholar ↗
            </a>
          </div>
        </aside>
      </section>

      <section id="ar-experience" className="section section-ink">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>الخبرة العملية</h2>
            </div>
          </div>
          <div className="timeline">
            {experience.map((item, index) => (
              <article className="timeline-item" key={`${item.role}-${item.period}`}>
                <span className="timeline-index mono">{String(index + 1).padStart(2, "0")}</span>
                <div dir="auto">
                  <h3>{item.role}</h3>
                  <p className="timeline-org">{item.organization}</p>
                  <p className="timeline-type mono">{item.type}</p>
                </div>
                <div dir="auto">
                  <p>{item.description}</p>
                  <div className="tag-row dark">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="timeline-meta mono" dir="ltr">
                  <span>{item.period}</span>
                  <span>{item.location}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ar-education" className="section shell">
        <div className="section-heading">
          <h2>التعليم والمسار البحثي</h2>
        </div>
        <div className="timeline">
          {education.map((item, index) => (
            <article className="timeline-item" key={`edu-ar-${index}`}>
              <span className="timeline-index mono">{String(index + 1).padStart(2, "0")}</span>
              <div dir="auto">
                <h3>{item.credential}</h3>
                {item.institution ? <p className="timeline-org">{item.institution}</p> : null}
              </div>
              <div className="timeline-meta mono" dir="ltr">
                <span>{item.period}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
