// DI Platform (local-first): section guides + upload/download per section.
// Storage: IndexedDB (files + metadata).

const DB_NAME = "di-platform";
const DB_VERSION = 1;
const STORE_FILES = "files";
const STORE_META = "meta";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) db.createObjectStore(STORE_FILES);
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(storeName, key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    tx.objectStore(storeName).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(storeName, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDel(storeName, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function exportBackup() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out = { version: 1, exportedAt: new Date().toISOString(), meta: {}, files: {} };
    const tx = db.transaction([STORE_META, STORE_FILES], "readonly");

    const metaStore = tx.objectStore(STORE_META);
    const filesStore = tx.objectStore(STORE_FILES);

    metaStore.openCursor().onsuccess = async (e) => {
      const cursor = e.target.result;
      if (cursor) {
        out.meta[cursor.key] = cursor.value;
        cursor.continue();
      }
    };

    filesStore.openCursor().onsuccess = async (e) => {
      const cursor = e.target.result;
      if (cursor) {
        // File is stored as Blob; for backup we store as base64 string
        const blob = cursor.value;
        const b64 = await blobToBase64(blob);
        out.files[cursor.key] = { mime: blob.type || "application/octet-stream", base64: b64 };
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
  });
}

async function importBackup(payload) {
  if (!payload || payload.version !== 1) throw new Error("Unsupported backup format.");
  const keys = Object.keys(payload.meta || {});
  for (const k of keys) await idbSet(STORE_META, k, payload.meta[k]);
  const fkeys = Object.keys(payload.files || {});
  for (const k of fkeys) {
    const f = payload.files[k];
    const blob = base64ToBlob(f.base64, f.mime);
    await idbSet(STORE_FILES, k, blob);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const idx = s.indexOf(",");
      resolve(idx >= 0 ? s.slice(idx + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, mime) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime || "application/octet-stream" });
}

function fmtBytes(n) {
  if (!Number.isFinite(n)) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

const SECTIONS = [
  {
    code: "PROPOSAL",
    kickerAr: "مقترح المبادرة",
    titleAr: "مقترح البرنامج (AR)",
    purposeAr: "الحصول على اعتماد الجهات والشركاء وتوحيد الرؤية والخطة.",
    audienceAr: "صنّاع القرار، الشركاء، الجهات الحكومية/التعليمية.",
    howAr: "ابدأ بملخص تنفيذي صفحة واحدة، ثم أهداف قابلة للقياس، ثم التنفيذ والميزانية والمخاطر.",
    kickerEn: "Initiative Proposal",
    titleEn: "Proposal (AR/EN)",
    purposeEn: "Secure alignment and approvals with a clear plan and outcomes.",
    audienceEn: "Decision makers, partners, program owners.",
    howEn: "Lead with a 1-page summary, measurable objectives, execution plan, budget, risks.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>الهدف والأثر</li>
        <li>نطاق البرنامج والبيانات العامة</li>
        <li>الأهداف القابلة للقياس</li>
        <li>المحاور والمحتوى</li>
        <li>آلية التنفيذ والسلامة</li>
        <li>الشركاء والفريق</li>
        <li>الميزانية والمتطلبات</li>
      </ol>
      <h3>1. الهدف والأثر</h3>
      <ul>
        <li>صف في فقرة واحدة المشكلة/الفرصة التي يعالجها البرنامج في عمان.</li>
        <li>صف كيف يربط البرنامج بين التعليم المدرسي والتطبيق العملي في التقنيات المستقبلية.</li>
      </ul>
      <h3>2. نطاق البرنامج والبيانات العامة</h3>
      <ul>
        <li>استخدم جدولاً يلخّص الاسم، الفئة المستهدفة، المدة، الموقع، وآلية التنفيذ.</li>
        <li>وضّح إن كان البرنامج قابلاً للتكرار في محافظات أخرى مستقبلاً.</li>
      </ul>
      <h3>3. الأهداف القابلة للقياس</h3>
      <ul>
        <li>حوّل عبارات “تعريف، تنمية، تأهيل...” إلى مؤشرات (عدد ساعات تدريب، نسبة اجتياز، عدد طائرات FPV...).</li>
        <li>اربط الأهداف بمؤشرات سلوكية/مهارية (عمل جماعي، حل مشكلات).</li>
      </ul>
      <h3>4. المحاور والمحتوى</h3>
      <ul>
        <li>اكتب جدولاً من عمودين: المحور &rarr; أبرز الدروس/الأنشطة.</li>
        <li>بيّن العلاقة بين المحاور الأربعة (نظرية &rarr; عملي &rarr; صيانة &rarr; تصنيع FPV).</li>
      </ul>
      <h3>5. آلية التنفيذ والسلامة</h3>
      <ul>
        <li>لخّص نموذج التشغيل (المجموعات، النسب، التقارير، أدوات المتابعة).</li>
        <li>اربط هذه الفقرة مباشرة بخطة السلامة المفصلة في وثيقة SAFETY.</li>
      </ul>
      <h3>6. الشركاء والفريق</h3>
      <ul>
        <li>استخدم جدول: الجهة الشريكة / دورها / ما تحصل عليه.</li>
        <li>أضف مخططاً بسيطاً للهيكل (قيادة، تشغيل، تدريب، صيانة، تسويق).</li>
      </ul>
      <h3>7. الميزانية والمتطلبات</h3>
      <ul>
        <li>أشر إلى نموذج الميزانية المفصل (BUDGET) واذكر فقط الأرقام الرئيسة.</li>
        <li>اختم بقائمة “ما نحتاجه للموافقة الآن” (قرارات، موافقات، تمويل).</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Purpose & impact</li>
        <li>Scope & high-level data</li>
        <li>Measurable objectives</li>
        <li>Tracks & content</li>
        <li>Delivery model & safety</li>
        <li>Partners & team</li>
        <li>Budget & approvals</li>
      </ol>
      <h3>1. Purpose & impact</h3>
      <ul>
        <li>In one paragraph, describe the problem/opportunity this program tackles in Oman.</li>
        <li>State how it connects school education to practical, future-tech experience.</li>
      </ul>
      <h3>2. Scope & high-level data</h3>
      <ul>
        <li>Use a small table to summarise: name, audience, duration, location, delivery model.</li>
        <li>Clarify whether the model can be replicated in other governorates.</li>
      </ul>
      <h3>3. Measurable objectives</h3>
      <ul>
        <li>Translate narrative goals into KPIs (training hours, safety pass rate, FPV builds, etc.).</li>
        <li>Include behavioural/soft-skill outcomes (teamwork, problem-solving).</li>
      </ul>
      <h3>4. Tracks & content</h3>
      <ul>
        <li>Use a table: Track &rarr; Key modules/activities.</li>
        <li>Show the progression from theory &rarr; flight &rarr; maintenance &rarr; FPV build.</li>
      </ul>
      <h3>5. Delivery model & safety</h3>
      <ul>
        <li>Summarise cohort sizes, trainer ratios, weekly rhythm, and reporting.</li>
        <li>Reference the dedicated Safety Plan document and avoid repeating full details.</li>
      </ul>
      <h3>6. Partners & team</h3>
      <ul>
        <li>Use a table: Partner / Contribution / Visibility.</li>
        <li>Add a simple structure chart (leadership, ops, training, maintenance, marketing).</li>
      </ul>
      <h3>7. Budget & approvals</h3>
      <ul>
        <li>Point to the detailed Budget Model and present only headline figures here.</li>
        <li>End with a clear “Decision needed” list (funding, approvals, dates).</li>
      </ul>
    `,
  },
  {
    code: "SPONSORSHIP",
    kickerAr: "ملف الرعاية",
    titleAr: "حزمة الرعاية (AR)",
    purposeAr: "تحويل الرعاة عبر عرض قيمة واضح: أثر + ظهور + تفعيل + مؤشرات.",
    audienceAr: "CSR، مدراء التسويق، الشركات، الصناديق والجهات الداعمة.",
    howAr: "استخدم جدول باقات واضح + مخزون ظهور + أفكار تفعيل + KPIs.",
    kickerEn: "Sponsorship",
    titleEn: "Sponsorship Pack",
    purposeEn: "Convert sponsors with a crisp value exchange and deliverables.",
    audienceEn: "CSR, marketing leads, business owners, funds.",
    howEn: "Tier table + inventory + activation plan + KPIs.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>صفحة واحدة مكثفة</li>
        <li>ملخص البرنامج</li>
        <li>فرص الظهور</li>
        <li>باقات الرعاية</li>
        <li>خطة التفعيل</li>
        <li>مؤشرات الأداء والتقارير</li>
        <li>الجدول الزمني للرعاية</li>
      </ol>
      <h3>1. صفحة واحدة مكثفة</h3>
      <ul>
        <li>عنوان واضح + جملة قيمة واحدة (Why now / Why drones).</li>
        <li>أرقام سريعة: عدد الطلبة، المدة، الموقع، عدد الساعات التدريبية.</li>
      </ul>
      <h3>2. ملخص البرنامج</h3>
      <ul>
        <li>أعد استخدام وصف المقترح، لكن بلغة موجهة للرعاة (Impact + Brand).</li>
      </ul>
      <h3>3. فرص الظهور</h3>
      <ul>
        <li>جدول: قناة الظهور / التفاصيل / متاحة لأي باقات.</li>
        <li>فرّق بين الظهور في الموقع، المواد المطبوعة، المنصات الرقمية، Demo Day.</li>
      </ul>
      <h3>4. باقات الرعاية</h3>
      <ul>
        <li>استخدم جدولاً واضحاً لباقات (استراتيجي، ذهبي، فضي، داعم) مع القيم.</li>
        <li>تجنّب وعود لا يمكن قياسها أو تنفيذها.</li>
      </ul>
      <h3>5. خطة التفعيل</h3>
      <ul>
        <li>قدّم أمثلة محددة يمكن تخيّلها (تحديات، جوائز، مساحات، محتوى مشترك).</li>
      </ul>
      <h3>6. مؤشرات الأداء والتقارير</h3>
      <ul>
        <li>حدّد ما الذي سيحصل عليه الراعي في تقرير ما بعد البرنامج (أرقام، صور، قصص).</li>
      </ul>
      <h3>7. الجدول الزمني</h3>
      <ul>
        <li>بيّن متى نحتاج التوقيع، متى نبدأ التواصل، ومتى يتلقى الراعي التقارير.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>One-page summary</li>
        <li>Program snapshot</li>
        <li>Visibility inventory</li>
        <li>Sponsorship tiers</li>
        <li>Activation plan</li>
        <li>KPIs & reporting</li>
        <li>Sponsorship timeline</li>
      </ol>
      <h3>1. One-page summary</h3>
      <ul>
        <li>Headline + single value statement (Why now / Why this sponsor fit).</li>
        <li>Key numbers: #students, duration, location, training hours.</li>
      </ul>
      <h3>2. Program snapshot</h3>
      <ul>
        <li>Mirror the proposal but filtered through “what’s in it for the sponsor”.</li>
      </ul>
      <h3>3. Visibility inventory</h3>
      <ul>
        <li>Table of channel / description / tier access.</li>
        <li>Separate on-site, printed, digital, and Demo Day exposures.</li>
      </ul>
      <h3>4. Sponsorship tiers</h3>
      <ul>
        <li>Clean tier table with value, cap on # of sponsors, and 4–6 key benefits per tier.</li>
        <li>Avoid vague or unmeasurable promises.</li>
      </ul>
      <h3>5. Activation plan</h3>
      <ul>
        <li>Concrete, visual ideas: challenges, awards, branded zones, joint content.</li>
      </ul>
      <h3>6. KPIs & reporting</h3>
      <ul>
        <li>Define what the sponsor will see in the post-program report.</li>
      </ul>
      <h3>7. Timeline</h3>
      <ul>
        <li>Show signing deadline, asset delivery dates, campaign window, and Demo Day.</li>
      </ul>
    `,
  },
  {
    code: "REGISTRATION",
    kickerAr: "التسجيل",
    titleAr: "حزمة التسجيل (AR)",
    purposeAr: "توحيد تجربة التقديم والقبول والموافقات وضمان السلامة.",
    audienceAr: "طلبة، أولياء الأمور، المدارس، فريق الإدارة.",
    howAr: "اكتب خطوات واضحة + وثائق مطلوبة + FAQ + سياسة الرسوم/الاسترجاع.",
    kickerEn: "Registration",
    titleEn: "Registration Pack",
    purposeEn: "Standardize intake, selection, consent, and safety readiness.",
    audienceEn: "Students, guardians, schools, admins.",
    howEn: "Clear steps, requirements, dates, and FAQs.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>من يمكنه التقديم؟</li>
        <li>السعة والمعايير</li>
        <li>خطوات التسجيل</li>
        <li>الوثائق المطلوبة</li>
        <li>الرسوم والسياسات</li>
        <li>الأسئلة الشائعة</li>
      </ol>
      <h3>1. من يمكنه التقديم؟</h3>
      <ul>
        <li>وضّح الصفوف، العمر، وأي متطلبات خاصة.</li>
      </ul>
      <h3>2. السعة والمعايير</h3>
      <ul>
        <li>استخدم جدولاً بسيطاً يوضح السعة وعدد المجموعات.</li>
      </ul>
      <h3>3. خطوات التسجيل</h3>
      <ul>
        <li>اكتبها كخطوات مرقمة واضحة، وتتطابق مع ما يظهر في المنصة.</li>
      </ul>
      <h3>4. الوثائق المطلوبة</h3>
      <ul>
        <li>اربط كل وثيقة بنموذجها في مجلد LEGAL مع توضيح هدفها.</li>
      </ul>
      <h3>5. الرسوم والسياسات</h3>
      <ul>
        <li>اكتب السياسة بلغة بسيطة مع أمثلة إن لزم.</li>
      </ul>
      <h3>6. الأسئلة الشائعة</h3>
      <ul>
        <li>أجب باقتضاب وبنفس نبرة العلامة.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Eligibility</li>
        <li>Capacity & criteria</li>
        <li>Registration flow</li>
        <li>Required documents</li>
        <li>Fees & policies</li>
        <li>FAQs</li>
      </ol>
      <h3>1. Eligibility</h3>
      <ul>
        <li>Define grade range, any prerequisites, and attendance expectations.</li>
      </ul>
      <h3>2. Capacity & criteria</h3>
      <ul>
        <li>Summarise intake capacity and selection logic in a small table.</li>
      </ul>
      <h3>3. Registration flow</h3>
      <ul>
        <li>Numbered steps that match exactly what the online form and platform show.</li>
      </ul>
      <h3>4. Required documents</h3>
      <ul>
        <li>Map each document to the relevant legal template (consent, media, safety, etc.).</li>
      </ul>
      <h3>5. Fees & policies</h3>
      <ul>
        <li>Explain in plain language; if unsure, leave placeholders for policy owners.</li>
      </ul>
      <h3>6. FAQs</h3>
      <ul>
        <li>Keep answers short and consistent with other documents.</li>
      </ul>
    `,
  },
  {
    code: "INVEST_DECK",
    kickerAr: "عرض استثماري",
    titleAr: "عرض الاستثمار (Deck)",
    purposeAr: "جذب تمويل/شراكات استراتيجية عبر قصة + نموذج + توسع.",
    audienceAr: "مستثمرون، صناديق ابتكار، شركاء استراتيجيون.",
    howAr: "10–14 شريحة، رسالة واحدة لكل شريحة، رسوم بيانية بدل النصوص الكثيفة.",
    kickerEn: "Investment Deck",
    titleEn: "Investment Pitch Deck",
    purposeEn: "Show scalability, economics, and the ask.",
    audienceEn: "Investors, funds, strategic partners.",
    howEn: "10–14 slides, one message per slide, charts over text.",
    guideAr: `
      <h3>جدول المحتويات المقترح للشرائح</h3>
      <ol>
        <li>العنوان والرؤية</li>
        <li>المشكلة/الفرصة</li>
        <li>الحل (البرنامج)</li>
        <li>السوق/الاحتياج</li>
        <li>النموذج المالي</li>
        <li>خطة التوسع</li>
        <li>الفريق والشركاء</li>
        <li>الطلب (The Ask)</li>
      </ol>
    `,
    guideEn: `
      <h3>Suggested slide flow</h3>
      <ol>
        <li>Title & vision</li>
        <li>Problem / opportunity</li>
        <li>Solution (program model)</li>
        <li>Market / need</li>
        <li>Economics & scenarios</li>
        <li>Scale-up roadmap</li>
        <li>Team & partners</li>
        <li>The ask</li>
      </ol>
    `,
  },
  {
    code: "CURRICULUM",
    kickerAr: "المنهج",
    titleAr: "المنهج والجدول (AR)",
    purposeAr: "تحويل الأهداف إلى خطة تعليمية قابلة للتنفيذ والتقييم.",
    audienceAr: "المدربون، التشغيل، الشركاء التعليميون.",
    howAr: "مخرجات تعلم أسبوعية + جدول يومي + متطلبات معدات + Rubric تقييم.",
    kickerEn: "Curriculum",
    titleEn: "Curriculum & Schedule",
    purposeEn: "Turn goals into a teachable, measurable plan.",
    audienceEn: "Trainers, ops, education partners.",
    howEn: "Weekly outcomes, daily schedule, equipment list, assessment rubric.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>مخرجات التعلم</li>
        <li>هيكلة المحاور</li>
        <li>الخطة الأسبوعية</li>
        <li>الجدول اليومي</li>
        <li>المعدات والمعامل</li>
        <li>أسلوب التقييم</li>
      </ol>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Learning outcomes</li>
        <li>Track structure</li>
        <li>Weekly plan</li>
        <li>Daily schedule template</li>
        <li>Facilities & equipment</li>
        <li>Assessment model</li>
      </ol>
    `,
  },
  {
    code: "OPS",
    kickerAr: "التشغيل",
    titleAr: "خطة التشغيل (OPS)",
    purposeAr: "تنفيذ موثوق: أدوار، لوجستيات، مشتريات، تقارير، تصعيد.",
    audienceAr: "إدارة البرنامج، اللوجستيات، الموردون.",
    howAr: "Runbook: فتح/إغلاق يومي + قوائم تحقق + RACI + مسارات تصعيد.",
    kickerEn: "Operations",
    titleEn: "Operations Plan",
    purposeEn: "Run reliably with clear roles, checklists, escalation.",
    audienceEn: "Program mgmt, logistics, vendors.",
    howEn: "Runbook-style with RACI, checklists, incident handling.",
    guideAr: `
      <h3>عناوين رئيسية مقترحة</h3>
      <ol>
        <li>نموذج التشغيل اليومي</li>
        <li>الأدوار و RACI</li>
        <li>المشتريات والمخزون</li>
        <li>إدارة الموردين</li>
        <li>التواصل والتقارير</li>
        <li>إدارة الحوادث والتصعيد</li>
      </ol>
    `,
    guideEn: `
      <h3>Suggested sections</h3>
      <ol>
        <li>Daily runbook</li>
        <li>Roles & RACI</li>
        <li>Procurement & inventory</li>
        <li>Vendor management</li>
        <li>Communications & reporting</li>
        <li>Incident & escalation flows</li>
      </ol>
    `,
  },
  {
    code: "SAFETY",
    kickerAr: "السلامة",
    titleAr: "خطة السلامة (AR)",
    purposeAr: "حماية الطلبة والطاقم والالتزام بمتطلبات الجهات.",
    audienceAr: "الطيران المدني، الموقع، المدربون، أولياء الأمور.",
    howAr: "مناطق تشغيل + SOPs + سجل مخاطر + نموذج إبلاغ حوادث.",
    kickerEn: "Safety",
    titleEn: "Safety & Risk Plan",
    purposeEn: "Safety-first execution and compliance readiness.",
    audienceEn: "Civil aviation, venue, trainers, guardians.",
    howEn: "Zones + SOPs + risk register + incident reporting.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>الهدف ونطاق السلامة</li>
        <li>الأدوار والمسؤوليات</li>
        <li>مناطق التشغيل</li>
        <li>إجراءات التشغيل القياسية</li>
        <li>سجل المخاطر</li>
        <li>إدارة الحوادث</li>
        <li>الموافقات</li>
      </ol>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Purpose & scope</li>
        <li>Roles & responsibilities</li>
        <li>Operating zones</li>
        <li>SOPs (pre / during / post flight, FPV)</li>
        <li>Risk register</li>
        <li>Incident management</li>
        <li>Approvals & compliance</li>
      </ol>
    `,
  },
  {
    code: "BUDGET",
    kickerAr: "الميزانية",
    titleAr: "نموذج الميزانية",
    purposeAr: "التحكم المالي واتخاذ قرار التمويل.",
    audienceAr: "المالك، المالية، الرعاة، الشركاء.",
    howAr: "أظهر الافتراضات مع الأرقام + سيناريوهات.",
    kickerEn: "Budget",
    titleEn: "Budget Model",
    purposeEn: "Transparent cost structure and scenarios.",
    audienceEn: "Program owner, finance, sponsors.",
    howEn: "Assumptions next to totals; scenarios and notes.",
    guideAr: `
      <h3>عناصر رئيسية</h3>
      <ol>
        <li>ملخص ميزانية صفحة واحدة</li>
        <li>الافتراضات الرئيسة</li>
        <li>السيناريوهات (A/B/C)</li>
        <li>علاقة الميزانية بالرعاة والرسوم</li>
      </ol>
    `,
    guideEn: `
      <h3>Key components</h3>
      <ol>
        <li>One-page budget summary</li>
        <li>Core assumptions</li>
        <li>Scenarios (A/B/C)</li>
        <li>Link to sponsorship & pricing strategy</li>
      </ol>
    `,
  },
  {
    code: "MOU",
    kickerAr: "مذكرات تفاهم",
    titleAr: "MoU / Letters",
    purposeAr: "تثبيت الالتزامات والمسؤوليات مع الشركاء.",
    audienceAr: "إدارات الشركاء/القانونية.",
    howAr: "نطاق واضح + مدة + علامة تجارية + خصوصية + مسؤوليات.",
    kickerEn: "MoU",
    titleEn: "Partner MoU",
    purposeEn: "Formalize commitments and responsibilities.",
    audienceEn: "Partner legal/admin teams.",
    howEn: "Clear scope, term, branding, privacy, safety.",
    guideAr: `
      <h3>عناوين أساسية للمذكرة</h3>
      <ol>
        <li>الأطراف والغاية</li>
        <li>نطاق التعاون</li>
        <li>المدة وإنهاء الاتفاق</li>
        <li>العلامة التجارية والإعلام</li>
        <li>البيانات والخصوصية</li>
        <li>السلامة والمسؤوليات</li>
      </ol>
    `,
    guideEn: `
      <h3>Core MoU sections</h3>
      <ol>
        <li>Parties & purpose</li>
        <li>Scope of collaboration</li>
        <li>Term & termination</li>
        <li>Branding & communications</li>
        <li>Data & privacy</li>
        <li>Safety & liability</li>
      </ol>
    `,
  },
  {
    code: "MEDIAKIT",
    kickerAr: "إعلام",
    titleAr: "الحقيبة الإعلامية (AR)",
    purposeAr: "توحيد الرسائل والمواد البصرية للبرنامج والشركاء.",
    audienceAr: "التسويق، الشركاء، الإعلام.",
    howAr: "رسائل رئيسية + boilerplate + Q&A + قوالب منشورات + إرشادات شعار.",
    kickerEn: "Media Kit",
    titleEn: "Media Kit",
    purposeEn: "Consistent messaging and assets for all comms.",
    audienceEn: "Marketing, partners, press.",
    howEn: "Key messages, boilerplate, Q&A, templates, logo rules.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>الرسائل الرئيسية</li>
        <li>نبذة عامة (Boilerplate)</li>
        <li>أسئلة وأجوبة</li>
        <li>المواد البصرية</li>
        <li>إرشادات الشعار</li>
        <li>قوالب المنشورات</li>
      </ol>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Key messages</li>
        <li>Boilerplate</li>
        <li>Q&A</li>
        <li>Visual assets</li>
        <li>Logo usage</li>
        <li>Sample posts</li>
      </ol>
    `,
  },
];

const i18n = {
  ar: {
    dir: "rtl",
    lang: "ar",
    strings: {
      topSubtitle: "منصة الوثائق — البرنامج الصيفي للطائرات بدون طيار",
      heroTitle: "العمل في منصة واحدة",
      heroDesc:
        'كل قسم هنا يحتوي على <b>دليل كتابة</b> + زر <b>رفع</b> لأحدث نسخة معتمدة + زر <b>تحميل</b>. النسخ النهائية يجب أن تُحفظ أيضاً في <code>docs/90_PUBLISHED/</code> بنفس الاسم القياسي.',
      heroNote:
        "التخزين محلي (على جهازك) عبر IndexedDB. للمشاركة بين عدة أجهزة/أشخاص نضيف لاحقاً تخزين سحابي/خادم.",
      footerMuted: "v1.0 • منصة محلية لإدارة الرفع/التحميل",
    },
    labels: {
      purpose: "الهدف",
      audience: "الجمهور",
      how: "كيف نكتبها؟",
      upload: "رفع الملف",
      download: "تحميل",
      clear: "حذف",
      none: "لا يوجد ملف مرفوع بعد.",
      last: "آخر تحديث",
      size: "الحجم",
      name: "الملف",
      ok: "تم",
      export: "تصدير نسخة احتياطية",
      import: "استيراد نسخة",
      guide: "دليل مفصل",
      close: "إغلاق",
      roleLabel: "الدور",
      roleAdmin: "مدير (صلاحيات كاملة)",
      roleEditor: "محرر",
      roleViewer: "عارض",
      onlineDocs: "روابط عمل مشتركة (Google Docs / Drive)",
      addLink: "إضافة رابط",
      noLinks: "لا توجد روابط مضافة بعد.",
      linkOpen: "فتح",
      linkRemove: "حذف",
      linkTitlePrompt: "عنوان المستند على الإنترنت (مثال: عرض رعاية، خطة إعلامية)",
      linkUrlPrompt: "ألصِق رابط Google Docs/Drive الكامل",
      statusLabel: "الحالة",
      status: {
        draft: "مسودة",
        internal: "مراجعة داخلية",
        external: "مراجعة خارجية",
        approved: "معتمد",
        published: "منشور",
        archived: "مؤرشف",
      },
      owner: "المالك",
      reviewer: "المراجع",
      approver: "المعتمد",
      version: "النسخة",
      metaEdit: "تحديث البيانات",
      metaEditPromptOwner: "اسم مالك الوثيقة (مسؤول المحتوى)",
      metaEditPromptReviewer: "اسم المراجع",
      metaEditPromptApprover: "اسم المعتمد النهائي",
      metaEditPromptVersion: "إصدار الوثيقة (مثال: v1.0)",
      metaEditPromptStatus: "اختر الحالة: draft, internal, external, approved, published, archived",
    }
  },
  en: {
    dir: "ltr",
    lang: "en",
    strings: {
      topSubtitle: "Docs Hub — Summer Drone Program",
      heroTitle: "Work in one platform",
      heroDesc:
        'Each section includes a <b>writing guide</b> + <b>Upload</b> (latest approved) + <b>Download</b>. Final approved files should also be saved in <code>docs/90_PUBLISHED/</code> with the standard filename.',
      heroNote:
        "Storage is local to your browser via IndexedDB. For multi-device/team sharing, we can add cloud/server storage next.",
      footerMuted: "v1.0 • Local-first Upload/Download Hub",
    },
    labels: {
      purpose: "Purpose",
      audience: "Audience",
      how: "How to write",
      upload: "Upload",
      download: "Download",
      clear: "Clear",
      none: "No file uploaded yet.",
      last: "Last updated",
      size: "Size",
      name: "File",
      ok: "Done",
      export: "Export backup",
      import: "Import backup",
      guide: "View guide",
      close: "Close",
      roleLabel: "Role",
      roleAdmin: "Admin (full access)",
      roleEditor: "Editor",
      roleViewer: "Viewer",
      onlineDocs: "Online docs (e.g., Google Docs / Drive)",
      addLink: "Add link",
      noLinks: "No online docs added yet.",
      linkOpen: "Open",
      linkRemove: "Remove",
      linkTitlePrompt: "Title for the online document (e.g., Sponsorship deck, Media plan)",
      linkUrlPrompt: "Paste the full URL (Google Docs / Drive / other)",
      statusLabel: "Status",
      status: {
        draft: "Draft",
        internal: "Internal review",
        external: "External review",
        approved: "Approved",
        published: "Published",
        archived: "Archived",
      },
      owner: "Owner",
      reviewer: "Reviewer",
      approver: "Approver",
      version: "Version",
      metaEdit: "Edit meta",
      metaEditPromptOwner: "Document owner (content responsible)",
      metaEditPromptReviewer: "Reviewer name",
      metaEditPromptApprover: "Final approver name",
      metaEditPromptVersion: "Document version (e.g., v1.0)",
      metaEditPromptStatus: "Choose status: draft, internal, external, approved, published, archived",
    }
  }
};

let currentLang = "ar";
// Initial role can be passed via URL: ?role=viewer|editor|admin (share different links with stakeholders)
const urlRole = new URLSearchParams(window.location.search).get("role");
let currentRole = urlRole === "viewer" || urlRole === "editor" || urlRole === "admin" ? urlRole : "admin"; // admin | editor | viewer

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = i18n[lang].lang;
  document.documentElement.dir = i18n[lang].dir;
  document.getElementById("btnLang").textContent = (lang === "ar") ? "EN" : "AR";

  // Static UI strings (header/hero/footer)
  const S = i18n[lang].strings;
  if (S) {
    const topSubtitle = document.getElementById("topSubtitle");
    const heroTitle = document.getElementById("heroTitle");
    const heroDesc = document.getElementById("heroDesc");
    const heroNote = document.getElementById("heroNote");
    const footerMuted = document.getElementById("footerMuted");
    if (topSubtitle) topSubtitle.textContent = S.topSubtitle || "";
    if (heroTitle) heroTitle.textContent = S.heroTitle || "";
    if (heroDesc) heroDesc.innerHTML = S.heroDesc || "";
    if (heroNote) heroNote.textContent = S.heroNote || "";
    if (footerMuted) footerMuted.textContent = S.footerMuted || "";
  }

  // Top-right actions
  const L = i18n[lang].labels;
  const btnExport = document.getElementById("btnExport");
  const importLabel = document.getElementById("importLabel");
  if (btnExport) btnExport.textContent = L.export;
  if (importLabel) importLabel.textContent = L.import;

  // Role select labels
  const roleSelect = document.getElementById("roleSelect");
  if (roleSelect && roleSelect.options.length === 0) {
    // Initial populate
    roleSelect.innerHTML = "";
    const roles = [
      { value: "admin", label: L.roleAdmin },
      { value: "editor", label: L.roleEditor },
      { value: "viewer", label: L.roleViewer },
    ];
    for (const r of roles) {
      const opt = document.createElement("option");
      opt.value = r.value;
      opt.textContent = r.label;
      roleSelect.appendChild(opt);
    }
    roleSelect.value = currentRole;
  } else if (roleSelect) {
    // Update text only
    const options = roleSelect.options;
    if (options.length >= 3) {
      options[0].textContent = L.roleAdmin;
      options[1].textContent = L.roleEditor;
      options[2].textContent = L.roleViewer;
    }
  }

  updateRoleUi();
  render();
}

async function getSectionMeta(code) {
  return (await idbGet(STORE_META, code)) || null;
}

async function setSectionFile(code, file) {
  const existing = (await getSectionMeta(code)) || {};
  const meta = {
    ...existing,
    filename: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    updatedAt: new Date().toISOString(),
  };
  await idbSet(STORE_FILES, code, file);
  await idbSet(STORE_META, code, meta);
}

async function clearSection(code) {
  await idbDel(STORE_FILES, code);
  await idbDel(STORE_META, code);
}

async function downloadSection(code) {
  const blob = await idbGet(STORE_FILES, code);
  const meta = await getSectionMeta(code);
  if (!blob || !meta) return false;
  downloadBlob(blob, meta.filename || `${code}.bin`);
  return true;
}

function sectionText(s) {
  if (currentLang === "ar") {
    return { kicker: s.kickerAr, title: s.titleAr, purpose: s.purposeAr, audience: s.audienceAr, how: s.howAr, guide: s.guideAr };
  }
  return { kicker: s.kickerEn, title: s.titleEn, purpose: s.purposeEn, audience: s.audienceEn, how: s.howEn, guide: s.guideEn };
}

function openGuide(section) {
  const t = sectionText(section);
  const root = document.getElementById("guideRoot");
  const L = i18n[currentLang].labels;
  document.getElementById("guideKicker").textContent = t.kicker;
  document.getElementById("guideTitle").textContent = t.title;
  document.getElementById("guideCode").textContent = section.code;
  document.getElementById("guideContent").innerHTML = t.guide || "";
  root.classList.add("guide--open");
  root.setAttribute("aria-hidden", "false");
}

function closeGuide() {
  const root = document.getElementById("guideRoot");
  root.classList.remove("guide--open");
  root.setAttribute("aria-hidden", "true");
}

async function render() {
  const grid = document.getElementById("sectionsGrid");
  grid.innerHTML = "";
  const tpl = document.getElementById("sectionCardTpl");
  const L = i18n[currentLang].labels;

  for (const s of SECTIONS) {
    const t = sectionText(s);
    const node = tpl.content.cloneNode(true);

    node.querySelector("[data-kicker]").textContent = t.kicker;
    node.querySelector("[data-title]").textContent = t.title;
    node.querySelector("[data-doccode]").textContent = s.code;

    const guideBtn = node.querySelector("[data-guide]");
    guideBtn.textContent = L.guide;
    guideBtn.addEventListener("click", () => openGuide(s));

    node.querySelector("[data-label-purpose]").textContent = L.purpose;
    node.querySelector("[data-purpose]").textContent = t.purpose;
    node.querySelector("[data-label-audience]").textContent = L.audience;
    node.querySelector("[data-audience]").textContent = t.audience;
    node.querySelector("[data-label-how]").textContent = L.how;
    node.querySelector("[data-how]").textContent = t.how;

    const uploadInput = node.querySelector("[data-upload]");
    const uploadText = node.querySelector("[data-upload-text]");
    const downloadBtn = node.querySelector("[data-download]");
    const clearBtn = node.querySelector("[data-clear]");
    const metaEl = node.querySelector("[data-filemeta]");
    const linksLabel = node.querySelector("[data-links-label]");
    const linksList = node.querySelector("[data-links-list]");
    const linkAddBtn = node.querySelector("[data-link-add]");

    uploadText.textContent = L.upload;
    downloadBtn.textContent = L.download;
    clearBtn.textContent = L.clear;
    linksLabel.textContent = L.onlineDocs;
    linkAddBtn.textContent = L.addLink;

    const isViewer = currentRole === "viewer";

    const meta = await getSectionMeta(s.code);
    const statusKey = (meta && meta.status) || "draft";
    const statusLabel = (L.status && L.status[statusKey]) || statusKey;
    const statusEl = node.querySelector("[data-status]");
    const ownerEl = node.querySelector("[data-owner]");
    const approverEl = node.querySelector("[data-approver]");
    const versionEl = node.querySelector("[data-version]");
    const metaEditBtn = node.querySelector("[data-meta-edit]");

    if (statusEl) {
      statusEl.textContent = statusLabel;
      statusEl.className = `statusBadge statusBadge--${statusKey}`;
    }
    if (ownerEl) {
      ownerEl.innerHTML = `<b>${L.owner}:</b> ${escapeHtml(meta && meta.owner ? meta.owner : "—")}`;
    }
    if (approverEl) {
      approverEl.innerHTML = `<b>${L.approver}:</b> ${escapeHtml(meta && meta.approver ? meta.approver : "—")}`;
    }
    if (versionEl) {
      versionEl.innerHTML = `<b>${L.version}:</b> ${escapeHtml(meta && meta.version ? meta.version : "—")}`;
    }

    if (!meta) {
      metaEl.textContent = L.none;
      downloadBtn.disabled = true;
      clearBtn.disabled = true;
    } else {
      const updated = new Date(meta.updatedAt).toLocaleString(currentLang === "ar" ? "ar" : "en");
      metaEl.innerHTML =
        `<div><b>${L.name}:</b> ${escapeHtml(meta.filename || "")}</div>` +
        `<div><b>${L.size}:</b> ${fmtBytes(meta.size)}</div>` +
        `<div><b>${L.last}:</b> ${escapeHtml(updated)}</div>`;
      downloadBtn.disabled = false;
      clearBtn.disabled = isViewer;
    }

    uploadInput.disabled = isViewer;
    if (isViewer) {
      node.querySelector("[data-upload-label]").classList.add("hidden");
      clearBtn.classList.add("hidden");
      if (metaEditBtn) metaEditBtn.classList.add("hidden");
    } else if (metaEditBtn) {
      metaEditBtn.textContent = L.metaEdit;
      metaEditBtn.addEventListener("click", async () => {
        const current = (await getSectionMeta(s.code)) || {};
        const owner = prompt(L.metaEditPromptOwner, current.owner || "");
        if (owner === null) return;
        const reviewer = prompt(L.metaEditPromptReviewer, current.reviewer || "");
        if (reviewer === null) return;
        const approver = prompt(L.metaEditPromptApprover, current.approver || "");
        if (approver === null) return;
        const version = prompt(L.metaEditPromptVersion, current.version || "v1.0");
        if (version === null) return;
        let status = (current.status || "draft");
        const rawStatus = prompt(L.metaEditPromptStatus, status);
        if (rawStatus === null) return;
        const normalized = String(rawStatus).trim().toLowerCase();
        const allowed = ["draft","internal","external","approved","published","archived"];
        if (allowed.includes(normalized)) status = normalized;
        const updatedMeta = {
          ...current,
          owner,
          reviewer,
          approver,
          version,
          status,
        };
        await idbSet(STORE_META, s.code, updatedMeta);
        await render();
      });
    }

    uploadInput.addEventListener("change", async () => {
      const file = uploadInput.files && uploadInput.files[0];
      if (!file) return;
      await setSectionFile(s.code, file);
      await render();
    });

    downloadBtn.addEventListener("click", async () => {
      const ok = await downloadSection(s.code);
      if (!ok) alert(L.none);
    });

    clearBtn.addEventListener("click", async () => {
      await clearSection(s.code);
      await render();
    });

    // Online docs links
    linksList.innerHTML = "";
    const links = (meta && Array.isArray(meta.links)) ? meta.links : [];
    if (!links.length) {
      const span = document.createElement("span");
      span.textContent = L.noLinks;
      span.style.color = "#94A3B8";
      linksList.appendChild(span);
    } else {
      for (let idx = 0; idx < links.length; idx++) {
        const link = links[idx];
        const row = document.createElement("div");
        row.className = "linkItem";
        const titleSpan = document.createElement("span");
        titleSpan.className = "linkItem__title";
        titleSpan.textContent = link.title || link.url;
        const actions = document.createElement("div");
        actions.className = "linkItem__actions";

        const openBtn = document.createElement("button");
        openBtn.className = "btn btn--secondary btn--sm";
        openBtn.textContent = L.linkOpen;
        openBtn.addEventListener("click", () => {
          if (link.url) window.open(link.url, "_blank", "noopener,noreferrer");
        });

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn--ghost btn--sm";
        removeBtn.textContent = L.linkRemove;
        removeBtn.disabled = isViewer;
        removeBtn.addEventListener("click", async () => {
          const m = (await getSectionMeta(s.code)) || {};
          const arr = Array.isArray(m.links) ? m.links : [];
          arr.splice(idx, 1);
          m.links = arr;
          await idbSet(STORE_META, s.code, m);
          await render();
        });

        actions.appendChild(openBtn);
        actions.appendChild(removeBtn);
        row.appendChild(titleSpan);
        row.appendChild(actions);
        linksList.appendChild(row);
      }
    }

    linkAddBtn.disabled = isViewer;
    if (isViewer) linkAddBtn.classList.add("hidden");
    linkAddBtn.addEventListener("click", async () => {
      if (isViewer) return;
      const title = prompt(L.linkTitlePrompt);
      if (!title) return;
      const url = prompt(L.linkUrlPrompt);
      if (!url) return;
      const m = (await getSectionMeta(s.code)) || {};
      const arr = Array.isArray(m.links) ? m.links : [];
      arr.push({ title, url });
      m.links = arr;
      await idbSet(STORE_META, s.code, m);
      await render();
    });

    grid.appendChild(node);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("btnLang").addEventListener("click", () => {
  setLang(currentLang === "ar" ? "en" : "ar");
});

document.getElementById("btnExport").addEventListener("click", async () => {
  const payload = await exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, `DI_PLATFORM_BACKUP_${new Date().toISOString().slice(0,10)}.json`);
});

document.getElementById("importFile").addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const text = await f.text();
  const payload = JSON.parse(text);
  await importBackup(payload);
  await render();
});

document.getElementById("guideOverlay").addEventListener("click", () => closeGuide());
document.getElementById("guideCloseBtn").addEventListener("click", () => closeGuide());

const roleSelectEl = document.getElementById("roleSelect");
function updateRoleUi() {
  const L = i18n[currentLang].labels;
  const btnExport = document.getElementById("btnExport");
  const importLabel = document.getElementById("importLabel");
  const isViewer = currentRole === "viewer";

  if (btnExport) {
    btnExport.disabled = isViewer;
    btnExport.classList.toggle("hidden", isViewer);
  }
  if (importLabel) {
    importLabel.classList.toggle("hidden", isViewer);
  }
  if (roleSelectEl) {
    // Viewers should come from URL link; hide selector for them
    if (isViewer) {
      roleSelectEl.classList.add("hidden");
    } else {
      roleSelectEl.classList.remove("hidden");
      roleSelectEl.value = currentRole;
    }
  }
}

if (roleSelectEl) {
  roleSelectEl.addEventListener("change", () => {
    currentRole = roleSelectEl.value || "admin";
    updateRoleUi();
    render();
  });
}

// First paint
setLang("ar");

