import { profile } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "تواصل مع أحمد عسل",
  description:
    "ابعت تفاصيل مشروع أنظمة مدمجة، تصميم PCB، فيرموير، أو نموذج أولي متكامل لأحمد إبراهيم عسل.",
  pathname: "/ar/contact/",
  locale: "ar",
  translated: true
});

export default function ArabicContactPage() {
  return (
    <section className="contact-page shell asl-page asl-brief asl-arabic-page">
      <div className="contact-lead">
        <p className="eyebrow">ملخص المشروع / رد خلال يومي عمل</p>
        <h1>احكي لي عن المشكلة حتى لو المواصفات لسه مش مكتملة.</h1>
        <p>
          وضح ما تحاول بناءه أو إصلاحه، إيه الموجود حاليًا، وفين نقطة التوقف. هراجع المتطلبات
          وأحدد لك إمكانية التنفيذ وأنسب خطوة هندسية للبدء.
        </p>
      </div>
      <div className="contact-grid">
        <form
          className="contact-form"
          action={`https://formsubmit.co/${profile.email}`}
          method="POST"
        >
          <input type="hidden" name="_subject" value="Arabic portfolio inquiry" />
          <input type="hidden" name="_captcha" value="false" />
          <label>
            <span>الاسم أو الشركة</span>
            <input name="name" required placeholder="اسمك أو اسم الشركة" />
          </label>
          <label>
            <span>البريد الإلكتروني</span>
            <input name="email" type="email" dir="ltr" required placeholder="you@company.com" />
          </label>
          <div className="contact-field-grid">
            <label>
              <span>نوع العمل المطلوب</span>
              <select name="workType" defaultValue="بناء نموذج أولي متكامل">
                <option>بناء نموذج أولي متكامل (Hardware + Firmware + App)</option>
                <option>إصلاح وتطوير فيرموير أو PCB قائم</option>
                <option>مراجعة معمارية وتحليل BOM والجدوى</option>
                <option>تطوير نظام إنترنت أشياء أو تحكم</option>
              </select>
            </label>
            <label>
              <span>المجال الهندسي</span>
              <select name="domain" defaultValue="الأنظمة المدمجة وإنترنت الأشياء">
                <option>الأنظمة المدمجة وإنترنت الأشياء</option>
                <option>تصميم الدوائر والـ PCB</option>
                <option>الروبوتات والتحكم</option>
                <option>أمن الأجهزة والبرمجيات</option>
                <option>تحديث منصات الأعمال التقنية (B2B)</option>
              </select>
            </label>
          </div>
          <label>
            <span>الجدول الزمني</span>
            <select name="timeline" defaultValue="خلال هذا الشهر">
              <option>تشخيص أو إصلاح عاجل</option>
              <option>خلال هذا الشهر</option>
              <option>الربع القادم</option>
              <option>مرحلة استكشاف النطاق</option>
            </select>
          </label>
          <label>
            <span>تفاصيل المشروع</span>
            <textarea
              name="details"
              rows={7}
              required
              placeholder="وصف المشكلة، المكونات أو المعالجات المستخدمة حاليًا، والنتيجة المطلوبة"
            />
          </label>
          <button className="button primary" type="submit">
            ابعت تفاصيل المشروع
          </button>
        </form>
        <aside className="contact-aside">
          <h2>تواصل مباشر</h2>
          <p>للاستفسارات السريعة أو مشاريع الشركات، تقدر تتواصل مباشرة عبر البريد أو واتساب.</p>
          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            <a className="btn-secondary" dir="ltr" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a
              className="btn-secondary"
              href={profile.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              تواصل عبر واتساب ↗
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
