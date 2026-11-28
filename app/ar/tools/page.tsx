import Link from "next/link";
import { toolCategories, getToolCategoryItems } from "@/data/tool-categories";
import { createPageMetadata } from "@/lib/seo";

const localizedCategories: Record<string, { title: string; intro: string }> = {
  workbenches: {
    title: "منصات العمل الهندسي",
    intro: "أدوات تفاعلية لحساب عمر بطارية ESP32، وتوليد كود الحساسات، ومحاكاة PID وبناء نماذج الذكاء الاصطناعي."
  },
  "circuit-design": {
    title: "تصميم الدوائر الإلكترونية",
    intro: "حاسبات لمجزئ الجهد، المقاومات، الثوابت الزمنية RC، دوائر التوقيت، والتحكم ومصادر القدرة."
  },
  "text-encoding": {
    title: "النصوص والترميز",
    intro: "التحويل بين النصوص، ASCII، والنظام الست عشري واختبار التشفير الكلاسيكي."
  },
  conversions: {
    title: "تحويل الوحدات والقيم",
    intro: "قراءة أكواد المكثفات وتحويل وحدات السعة ودرجات الحرارة بدقة بدون تخمين."
  },
  "number-systems": {
    title: "أنظمة الأعداد",
    intro: "التحويل والحساب والـ Bit Shifting والمتمم الثنائي بين الثنائي والست عشري والعشري."
  },
  "physics-math": {
    title: "الفيزياء والرياضيات",
    intro: "حاسبات الحركة، القوى، التردد والطول الموجي والعلاقات الرياضية."
  },
  satellite: {
    title: "أنظمة الأقمار الصناعية",
    intro: "حساب هندسة المدارات، ميزانية الوصلة Link Budget، وقدرة المركبة الفضائية (متاحة بالعربية بالكامل)."
  },
  "rf-engineering": {
    title: "هندسة الترددات اللاسلكية (RF)",
    intro: "تحليل المسار اللاسلكي، الكسب، التشويش في المستقبل وسعة النفاذ المتعدد (متاحة بالعربية بالكامل)."
  }
};

export const metadata = createPageMetadata({
  title: "أدوات وحاسبات هندسية",
  description:
    "أدوات عملية للأنظمة المدمجة والدوائر والأقمار الصناعية وهندسة RF وتقدير عمر بطارية ESP32.",
  pathname: "/ar/tools/",
  locale: "ar",
  translated: true
});

export default function ArabicToolsPage() {
  return (
    <div className="asl-page asl-tools-register asl-arabic-page">
      <header className="section shell asl-tools-header">
        <p className="eyebrow">مكتبة هندسية / أدوات تعمل في المتصفح</p>
        <div className="asl-tools-heading-grid">
          <h1>اختار الأداة الهندسية المناسبة للمسألة.</h1>
          <p className="section-intro">
            ابدأ من المجال التقني للوصول السريع لحاسبات الدوائر، تقدير طاقة ESP32، أو هندسة RF والأقمار الصناعية.
          </p>
        </div>
      </header>
      <section className="section shell">
        <div className="planned-notes-grid">
          {toolCategories.map((category) => {
            const localized = localizedCategories[category.slug] || {
              title: category.title,
              intro: category.intro
            };
            return (
              <Link
                className="planned-note-card"
                href={`/ar/tools/category/${category.slug}/`}
                key={category.slug}
              >
                <p className="mono">{getToolCategoryItems(category.slug).length} أدوات</p>
                <h2>{localized.title}</h2>
                <p>{localized.intro}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
