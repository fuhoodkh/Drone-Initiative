// DI Platform (backend API): section guides + upload/download per section.
// Storage: Backend API (files + metadata).

// Immediate logging to verify script loads
console.log('🚀 app.js script started loading');

// Import API
import * as API from './api.js';

console.log('✅ API module imported successfully');

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
  // Phase 01: Strategy & Approval
  {
    code: "01-STR-PROGRAM_CHARTER",
    phase: "01_STRATEGY",
    kickerAr: "الحوكمة",
    titleAr: "ميثاق البرنامج (Program Charter)",
    purposeAr: "تحديد السلطة، النطاق، الأهداف، ومعايير النجاح. وثيقة السلطة الأساسية.",
    audienceAr: "الراعي، اللجنة التوجيهية، إدارة المبادرة.",
    howAr: "رؤية + معايير نجاح + سلطة القرار + مسار التصعيد + أصحاب المصلحة.",
    kickerEn: "Governance",
    titleEn: "Program Charter",
    purposeEn: "Define authority, scope, objectives, and success criteria. The foundational authority document.",
    audienceEn: "Sponsor, steering committee, initiative management.",
    howEn: "Vision + success criteria + decision authority + escalation path + stakeholders.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>نظرة عامة على البرنامج</li>
        <li>الأهداف ومعايير النجاح</li>
        <li>تعريف النطاق (In/Out)</li>
        <li>الحوكمة والسلطة</li>
        <li>أصحاب المصلحة الرئيسيون</li>
        <li>المخاطر والافتراضات</li>
        <li>الموافقة</li>
      </ol>
      <h3>1. نظرة عامة على البرنامج</h3>
      <ul>
        <li>الاسم، الإصدار، الحالة، المالك، الراعي.</li>
        <li>الغرض: تحديد السلطة والنطاق والأهداف.</li>
        <li>المواءمة الاستراتيجية: المهارات الوطنية، بناء قدرات الشباب، الابتكار.</li>
      </ul>
      <h3>2. الأهداف ومعايير النجاح</h3>
      <ul>
        <li>أهداف البرنامج: تقديم تدريب آمن ومتوافق، بناء مهارات UAV، تفعيل الشركاء.</li>
        <li>مؤشرات النجاح: نسبة إكمال المشاركين، صفر حوادث سلامة كبرى، تحقيق التزامات الرعاة.</li>
      </ul>
      <h3>3. تعريف النطاق</h3>
      <ul>
        <li>ضمن النطاق: تقديم التدريب، عمليات الدرون، إدارة السلامة، تنسيق الشركاء.</li>
        <li>خارج النطاق: خدمات درون تجارية، عمليات BVLOS متقدمة.</li>
      </ul>
      <h3>4. الحوكمة والسلطة</h3>
      <ul>
        <li>جدول السلطة: الاستراتيجية → الراعي، الميزانية → المالية + الراعي، السلامة → سلطة الطيران، التشغيل → مدير المبادرة.</li>
        <li>مسار التصعيد: المدرب → قائد التشغيل → مدير المبادرة → الراعي.</li>
      </ul>
      <h3>5. أصحاب المصلحة</h3>
      <ul>
        <li>راعي البرنامج، مدير المبادرة، قائد التشغيل، مسؤول السلامة، الشركاء.</li>
      </ul>
      <h3>6. المخاطر والافتراضات</h3>
      <ul>
        <li>مخاطر رئيسية: تعطيل الطقس، فشل المعدات، إصابة المشارك.</li>
        <li>افتراضات: الموافقات التنظيمية ممنوحة، المدربون المؤهلون متاحون.</li>
      </ul>
      <h3>7. الموافقة</h3>
      <ul>
        <li>أعدها: (الاسم)، راجعها: (الاسم)، وافق عليها: (الاسم).</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Program overview</li>
        <li>Objectives & success criteria</li>
        <li>Scope definition</li>
        <li>Governance & authority</li>
        <li>Key stakeholders</li>
        <li>Risks & assumptions</li>
        <li>Approval</li>
      </ol>
      <h3>1. Program overview</h3>
      <ul>
        <li>Name, version, status, owner, sponsor.</li>
        <li>Purpose: Define authority, scope, objectives.</li>
        <li>Strategic alignment: National skills, youth capacity, innovation.</li>
      </ul>
      <h3>2. Objectives & success criteria</h3>
      <ul>
        <li>Program objectives: Deliver safe, compliant training; build UAV skills; engage partners.</li>
        <li>Success metrics: % completion, zero major safety incidents, sponsor deliverables achieved.</li>
      </ul>
      <h3>3. Scope definition</h3>
      <ul>
        <li>In scope: Training delivery, drone operations, safety management, partner coordination.</li>
        <li>Out of scope: Commercial drone services, advanced BVLOS operations.</li>
      </ul>
      <h3>4. Governance & authority</h3>
      <ul>
        <li>Decision authority table: Strategy → Sponsor, Budget → Finance + Sponsor, Safety → Aviation Authority, Operations → Initiative Manager.</li>
        <li>Escalation path: Trainer → Ops Lead → Initiative Manager → Sponsor.</li>
      </ul>
      <h3>5. Key stakeholders</h3>
      <ul>
        <li>Program Sponsor, Initiative Manager, Operations Lead, Safety Officer, Partners.</li>
      </ul>
      <h3>6. Risks & assumptions</h3>
      <ul>
        <li>Key risks: Weather disruption, equipment failure, participant injury.</li>
        <li>Assumptions: Regulatory approvals granted, qualified trainers available.</li>
      </ul>
      <h3>7. Approval</h3>
      <ul>
        <li>Prepared by: (Name), Reviewed by: (Name), Approved by: (Name).</li>
      </ul>
    `,
  },
  {
    code: "01-STR-PROPOSAL",
    phase: "01_STRATEGY",
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
  // Phase 02: Funding & Partnerships
  {
    code: "02-FUND-SPONSORSHIP",
    phase: "02_FUNDING",
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
  // Phase 03: Compliance & Safety
  {
    code: "03-COMP-REGULATORY",
    phase: "03_COMPLIANCE",
    kickerAr: "الامتثال",
    titleAr: "الملف التنظيمي والامتثال",
    purposeAr: "الموافقات، المواصفات، الشهادات، الحماية القانونية.",
    audienceAr: "الطيران المدني، الجهات التنظيمية، القانونية.",
    howAr: "موافقات الطيران + مواصفات الدرون + أرقام تسلسلية + شهادات طيارين + شهادات تأمين.",
    kickerEn: "Compliance",
    titleEn: "Regulatory & Compliance File",
    purposeEn: "Aviation approvals, drone specs, pilot credentials, insurance certificates. Legal protection.",
    audienceEn: "Civil aviation, regulatory bodies, legal.",
    howEn: "Aviation approvals + drone specs & serials + pilot credentials + insurance certificates.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>موافقات الطيران المدني</li>
        <li>مواصفات الدرون والأرقام التسلسلية</li>
        <li>شهادات الطيارين/المدربين</li>
        <li>شهادات التأمين</li>
        <li>متطلبات الموقع</li>
        <li>التحديثات والمراجعات</li>
      </ol>
      <h3>1. موافقات الطيران المدني</h3>
      <ul>
        <li>رقم الموافقة، تاريخ الإصدار، تاريخ الانتهاء، الشروط.</li>
      </ul>
      <h3>2. مواصفات الدرون والأرقام التسلسلية</h3>
      <ul>
        <li>جدول: نوع الدرون / الرقم التسلسلي / الحالة / تاريخ الصيانة.</li>
      </ul>
      <h3>3. شهادات الطيارين/المدربين</h3>
      <ul>
        <li>أسماء، أرقام الشهادات، تواريخ الإصدار، صلاحية.</li>
      </ul>
      <h3>4. شهادات التأمين</h3>
      <ul>
        <li>نوع التغطية، المبلغ، تاريخ البدء/الانتهاء، رقم البوليصة.</li>
      </ul>
      <h3>5. متطلبات الموقع</h3>
      <ul>
        <li>موافقات الموقع، قيود الاستخدام، متطلبات السلامة.</li>
      </ul>
      <h3>6. التحديثات والمراجعات</h3>
      <ul>
        <li>جدول زمني للمراجعات الدورية.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Civil aviation approvals</li>
        <li>Drone specs & serial numbers</li>
        <li>Pilot/trainer credentials</li>
        <li>Insurance certificates</li>
        <li>Venue requirements</li>
        <li>Updates & reviews</li>
      </ol>
      <h3>1. Civil aviation approvals</h3>
      <ul>
        <li>Approval number, issue date, expiry date, conditions.</li>
      </ul>
      <h3>2. Drone specs & serial numbers</h3>
      <ul>
        <li>Table: Drone type / Serial number / Status / Last maintenance.</li>
      </ul>
      <h3>3. Pilot/trainer credentials</h3>
      <ul>
        <li>Names, certificate numbers, issue dates, validity.</li>
      </ul>
      <h3>4. Insurance certificates</h3>
      <ul>
        <li>Coverage type, amount, start/end dates, policy number.</li>
      </ul>
      <h3>5. Venue requirements</h3>
      <ul>
        <li>Venue approvals, usage restrictions, safety requirements.</li>
      </ul>
      <h3>6. Updates & reviews</h3>
      <ul>
        <li>Schedule for periodic reviews.</li>
      </ul>
    `,
  },
  {
    code: "03-COMP-SAFETY",
    phase: "03_COMPLIANCE",
    kickerAr: "السلامة",
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
    code: "02-FUND-INVEST_DECK",
    phase: "02_FUNDING",
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
  // Phase 04: Operations & Delivery
  {
    code: "04-OPS-OPERATIONS",
    phase: "04_OPERATIONS",
    kickerAr: "التشغيل",
    titleAr: "دليل التشغيل (Operations Runbook)",
    purposeAr: "توفير إرشادات تشغيلية خطوة بخطوة للتسليم الآمن والموثوق.",
    audienceAr: "إدارة البرنامج، قائد التشغيل، المدربون.",
    howAr: "Runbook: فتح/إغلاق يومي + قوائم تحقق + RACI + مسارات تصعيد.",
    kickerEn: "Operations",
    titleEn: "Operations Runbook",
    purposeEn: "Provide step-by-step operational guidance for safe and consistent delivery.",
    audienceEn: "Program management, operations lead, trainers.",
    howEn: "Runbook-style with RACI, checklists, incident handling.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>الغرض</li>
        <li>الأدوار والمسؤوليات (RACI)</li>
        <li>تدفق العمليات اليومية</li>
        <li>إدارة المعدات</li>
        <li>السلامة وإدارة الحوادث</li>
        <li>بروتوكولات No-Fly والطوارئ</li>
      </ol>
      <h3>1. الغرض</h3>
      <ul>
        <li>توفير إرشادات تشغيلية خطوة بخطوة للتسليم الآمن والموثوق.</li>
      </ul>
      <h3>2. الأدوار والمسؤوليات (RACI)</h3>
      <ul>
        <li>جدول: الدور / المسؤولية (مدير المبادرة = المساءلة الكاملة، قائد التشغيل = التنفيذ اليومي، المدرب = التعليم والإشراف، مسؤول السلامة = مراقبة المخاطر).</li>
      </ul>
      <h3>3. تدفق العمليات اليومية</h3>
      <ul>
        <li>قائمة ما قبل اليوم: فحص الطقس، فحص المعدات، تأكيد المجال الجوي، سجل الحضور.</li>
        <li>هيكل يوم التدريب: إحاطة السلامة، جلسة نظرية، جلسة طيران عملية، إحاطة نهائية.</li>
        <li>مهام ما بعد اليوم: سجل الحوادث، تخزين المعدات، التقرير اليومي.</li>
      </ul>
      <h3>4. إدارة المعدات</h3>
      <ul>
        <li>سجل المخزون، بروتوكول شحن البطارية، تقرير الأضرار.</li>
      </ul>
      <h3>5. السلامة وإدارة الحوادث</h3>
      <ul>
        <li>مستويات الحوادث: طفيف، متوسط، حرج.</li>
        <li>إجراء الاستجابة: إيقاف العمليات → تأمين المنطقة → الإبلاغ → التصعيد.</li>
      </ul>
      <h3>6. بروتوكولات No-Fly والطوارئ</h3>
      <ul>
        <li>حدود الطقس، عتبات الحشود، جهات الاتصال في حالات الطوارئ.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Purpose</li>
        <li>Roles & responsibilities (RACI)</li>
        <li>Daily operations flow</li>
        <li>Equipment management</li>
        <li>Safety & incident handling</li>
        <li>No-fly & emergency protocols</li>
      </ol>
      <h3>1. Purpose</h3>
      <ul>
        <li>Provide step-by-step operational guidance for safe and consistent delivery.</li>
      </ul>
      <h3>2. Roles & responsibilities (RACI)</h3>
      <ul>
        <li>Table: Role / Responsibility (Initiative Manager = Overall accountability, Operations Lead = Daily execution, Trainer = Instruction & flight supervision, Safety Officer = Risk monitoring).</li>
      </ul>
      <h3>3. Daily operations flow</h3>
      <ul>
        <li>Pre-day checklist: Weather check, equipment inspection, airspace confirmation, attendance log.</li>
        <li>Training day structure: Safety briefing, theory session, practical flight session, debrief.</li>
        <li>Post-day tasks: Incident log, equipment storage, daily report.</li>
      </ul>
      <h3>4. Equipment management</h3>
      <ul>
        <li>Inventory register, battery charging protocol, damage reporting.</li>
      </ul>
      <h3>5. Safety & incident handling</h3>
      <ul>
        <li>Incident levels: Minor, Moderate, Critical.</li>
        <li>Response procedure: Stop operations → Secure area → Report → Escalate.</li>
      </ul>
      <h3>6. No-fly & emergency protocols</h3>
      <ul>
        <li>Weather limits, crowd thresholds, emergency contacts.</li>
      </ul>
    `,
  },
  {
    code: "04-OPS-CURRICULUM",
    phase: "04_OPERATIONS",
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
    code: "03-COMP-SAFETY",
    phase: "03_COMPLIANCE",
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
    code: "02-FUND-BUDGET",
    phase: "02_FUNDING",
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
    code: "02-FUND-MOU",
    phase: "02_FUNDING",
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
  // Phase 05: Communications
  {
    code: "05-COMM-MEDIAKIT",
    phase: "05_COMMUNICATIONS",
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
  // Phase 06: Data & Privacy
  {
    code: "06-DATA-PRIVACY",
    phase: "06_DATA",
    kickerAr: "البيانات والخصوصية",
    titleAr: "حماية البيانات والموافقات",
    purposeAr: "إدارة بيانات الطلبة، موافقات التصوير، استخدام صور الدرون، فترة الاحتفاظ.",
    audienceAr: "القانونية، إدارة البرنامج، أولياء الأمور.",
    howAr: "معالجة بيانات الطلبة + موافقات التصوير + استخدام صور الدرون + فترة الاحتفاظ + الامتثال.",
    kickerEn: "Data & Privacy",
    titleEn: "Data Protection & Consent",
    purposeEn: "Student data handling, media consent, drone imagery usage, retention period. Especially important with minors.",
    audienceEn: "Legal, program management, guardians.",
    howEn: "Student data handling + media consent + drone imagery usage + retention period + compliance.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>الغرض والنطاق</li>
        <li>معالجة بيانات الطلبة</li>
        <li>موافقات التصوير والإعلام</li>
        <li>استخدام صور الدرون</li>
        <li>فترة الاحتفاظ</li>
        <li>الامتثال والخصوصية</li>
      </ol>
      <h3>1. الغرض والنطاق</h3>
      <ul>
        <li>ضمان الامتثال لقوانين حماية البيانات، خاصة مع القاصرين.</li>
      </ul>
      <h3>2. معالجة بيانات الطلبة</h3>
      <ul>
        <li>ما البيانات التي نجمعها (الاسم، العمر، المدرسة، معلومات طبية أساسية).</li>
        <li>كيف نخزنها (مشفرة، وصول محدود).</li>
        <li>من يصل إليها (فريق البرنامج فقط، لا مشاركة مع أطراف ثالثة دون موافقة).</li>
      </ul>
      <h3>3. موافقات التصوير والإعلام</h3>
      <ul>
        <li>نموذج موافقة ولي الأمر للتصوير والنشر.</li>
        <li>خيارات: موافقة كاملة / موافقة محدودة / رفض.</li>
      </ul>
      <h3>4. استخدام صور الدرون</h3>
      <ul>
        <li>سياسة استخدام الصور/الفيديو من الدرون (تدريبية فقط، لا نشر تجاري).</li>
      </ul>
      <h3>5. فترة الاحتفاظ</h3>
      <ul>
        <li>كم من الوقت نحتفظ بالبيانات (مثال: 2 سنة بعد انتهاء البرنامج).</li>
        <li>إجراءات الحذف الآمن.</li>
      </ul>
      <h3>6. الامتثال والخصوصية</h3>
      <ul>
        <li>الامتثال للقوانين المحلية، حق الوصول، حق الحذف.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Purpose & scope</li>
        <li>Student data handling</li>
        <li>Media consent</li>
        <li>Drone imagery usage</li>
        <li>Retention period</li>
        <li>Compliance & privacy</li>
      </ol>
      <h3>1. Purpose & scope</h3>
      <ul>
        <li>Ensure compliance with data protection laws, especially with minors.</li>
      </ul>
      <h3>2. Student data handling</h3>
      <ul>
        <li>What data we collect (name, age, school, basic medical info).</li>
        <li>How we store it (encrypted, limited access).</li>
        <li>Who accesses it (program team only, no sharing with third parties without consent).</li>
      </ul>
      <h3>3. Media consent</h3>
      <ul>
        <li>Guardian consent form for photography and publication.</li>
        <li>Options: Full consent / Limited consent / Decline.</li>
      </ul>
      <h3>4. Drone imagery usage</h3>
      <ul>
        <li>Policy on using drone photos/videos (training only, no commercial publication).</li>
      </ul>
      <h3>5. Retention period</h3>
      <ul>
        <li>How long we retain data (e.g., 2 years after program end).</li>
        <li>Secure deletion procedures.</li>
      </ul>
      <h3>6. Compliance & privacy</h3>
      <ul>
        <li>Compliance with local laws, right to access, right to deletion.</li>
      </ul>
    `,
  },
  // Phase 07: Monitoring & Reporting
  {
    code: "07-MON-IMPACT",
    phase: "07_MONITORING",
    kickerAr: "المراقبة والتقارير",
    titleAr: "تقرير المراقبة والأثر",
    purposeAr: "KPIs، الحضور، حوادث السلامة، مقاييس ظهور الرعاة، الدروس المستفادة.",
    audienceAr: "الرعاة، الراعي، إدارة المبادرة، الشركاء.",
    howAr: "لوحة KPIs + تقارير أسبوعية + سجل حوادث + مقاييس الرعاة + تحليل الدروس المستفادة.",
    kickerEn: "Monitoring",
    titleEn: "Monitoring & Impact Report",
    purposeEn: "KPIs, attendance, safety incidents, sponsor exposure metrics, lessons learned. Feeds back into sponsors and future funding.",
    audienceEn: "Sponsors, sponsor, initiative management, partners.",
    howEn: "KPI dashboard + weekly reports + incident log + sponsor metrics + lessons learned analysis.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>لوحة KPIs</li>
        <li>التقارير الأسبوعية</li>
        <li>سجل حوادث السلامة</li>
        <li>مقاييس ظهور الرعاة</li>
        <li>الدروس المستفادة</li>
        <li>التوصيات</li>
      </ol>
      <h3>1. لوحة KPIs</h3>
      <ul>
        <li>عدد الطلبة المقبولين والمتخرجين، ساعات التدريب، نسبة الإكمال، عدد طائرات FPV المجمعة.</li>
      </ul>
      <h3>2. التقارير الأسبوعية</h3>
      <ul>
        <li>ملخص أسبوعي: الحضور، الأنشطة، التحديات، الإنجازات.</li>
      </ul>
      <h3>3. سجل حوادث السلامة</h3>
      <ul>
        <li>جدول: التاريخ / النوع / المستوى / الإجراء المتخذ / الحالة.</li>
      </ul>
      <h3>4. مقاييس ظهور الرعاة</h3>
      <ul>
        <li>التغطية الإعلامية (عدد الأخبار/المنشورات/الوصول)، ظهور في الموقع، ظهور في Demo Day.</li>
      </ul>
      <h3>5. الدروس المستفادة</h3>
      <ul>
        <li>ما الذي عمل بشكل جيد، ما الذي يحتاج تحسين، التحديات الرئيسية.</li>
      </ul>
      <h3>6. التوصيات</h3>
      <ul>
        <li>توصيات للدفعة التالية، تحسينات عملية، تغييرات في المنهج.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>KPI dashboard</li>
        <li>Weekly reports</li>
        <li>Safety incident log</li>
        <li>Sponsor exposure metrics</li>
        <li>Lessons learned</li>
        <li>Recommendations</li>
      </ol>
      <h3>1. KPI dashboard</h3>
      <ul>
        <li>Number of students accepted and graduated, training hours, completion rate, number of FPV builds.</li>
      </ul>
      <h3>2. Weekly reports</h3>
      <ul>
        <li>Weekly summary: Attendance, activities, challenges, achievements.</li>
      </ul>
      <h3>3. Safety incident log</h3>
      <ul>
        <li>Table: Date / Type / Level / Action taken / Status.</li>
      </ul>
      <h3>4. Sponsor exposure metrics</h3>
      <ul>
        <li>Media coverage (number of news/posts/reach), on-site visibility, Demo Day visibility.</li>
      </ul>
      <h3>5. Lessons learned</h3>
      <ul>
        <li>What worked well, what needs improvement, key challenges.</li>
      </ul>
      <h3>6. Recommendations</h3>
      <ul>
        <li>Recommendations for next cohort, operational improvements, curriculum changes.</li>
      </ul>
    `,
  },
  // Phase 08: Closure
  {
    code: "08-CLOSE-CLOSURE",
    phase: "08_CLOSURE",
    kickerAr: "الإغلاق",
    titleAr: "حزمة إغلاق البرنامج",
    purposeAr: "التقرير النهائي، التسوية المالية، جرد الأصول، التوصيات للدفعة التالية.",
    audienceAr: "الراعي، إدارة المبادرة، الرعاة، الشركاء.",
    howAr: "تقرير نهائي شامل + تسوية مالية + جرد المعدات/الأصول + توصيات + خطة للدفعة التالية.",
    kickerEn: "Closure",
    titleEn: "Program Closure Pack",
    purposeEn: "Final report, financial reconciliation, asset inventory, recommendations for next cohort. Turns v1 into v2.",
    audienceEn: "Sponsor, initiative management, sponsors, partners.",
    howEn: "Comprehensive final report + financial reconciliation + equipment/asset inventory + recommendations + plan for next cohort.",
    guideAr: `
      <h3>جدول المحتويات</h3>
      <ol>
        <li>التقرير النهائي</li>
        <li>التسوية المالية</li>
        <li>جرد الأصول والمعدات</li>
        <li>التوصيات للدفعة التالية</li>
        <li>خطة التحسين</li>
      </ol>
      <h3>1. التقرير النهائي</h3>
      <ul>
        <li>ملخص تنفيذي، الأهداف المحققة، KPIs النهائية، قصص نجاح، التحديات.</li>
      </ul>
      <h3>2. التسوية المالية</h3>
      <ul>
        <li>الميزانية المخططة مقابل الفعلية، التحليل، التفسيرات للانحرافات.</li>
      </ul>
      <h3>3. جرد الأصول والمعدات</h3>
      <ul>
        <li>جدول: المعدة / الحالة / الموقع / التوصية (إعادة استخدام / صيانة / استبدال).</li>
      </ul>
      <h3>4. التوصيات للدفعة التالية</h3>
      <ul>
        <li>تحسينات في المنهج، تحسينات عملية، تغييرات في الهيكل، شراكات جديدة.</li>
      </ul>
      <h3>5. خطة التحسين</h3>
      <ul>
        <li>خطة عمل محددة للتنفيذ في الدفعة التالية.</li>
      </ul>
    `,
    guideEn: `
      <h3>Table of contents</h3>
      <ol>
        <li>Final report</li>
        <li>Financial reconciliation</li>
        <li>Asset & equipment inventory</li>
        <li>Recommendations for next cohort</li>
        <li>Improvement plan</li>
      </ol>
      <h3>1. Final report</h3>
      <ul>
        <li>Executive summary, objectives achieved, final KPIs, success stories, challenges.</li>
      </ul>
      <h3>2. Financial reconciliation</h3>
      <ul>
        <li>Planned vs actual budget, analysis, explanations for variances.</li>
      </ul>
      <h3>3. Asset & equipment inventory</h3>
      <ul>
        <li>Table: Asset / Condition / Location / Recommendation (reuse / maintenance / replace).</li>
      </ul>
      <h3>4. Recommendations for next cohort</h3>
      <ul>
        <li>Curriculum improvements, operational improvements, structural changes, new partnerships.</li>
      </ul>
      <h3>5. Improvement plan</h3>
      <ul>
        <li>Specific action plan for implementation in next cohort.</li>
      </ul>
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
        "منصة موحدة لإدارة الوثائق والمستندات. جميع البيانات محفوظة على الخادم مع نظام صلاحيات متقدم.",
      footerMuted: "v1.0 • منصة إدارة الوثائق",
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
        "Unified platform for document management. All data is stored on the server with advanced permission system.",
      footerMuted: "v1.0 • Document Management Platform",
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
  
  // Update logout button text (will be set up in initApp, just update text here)
  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.textContent = lang === 'ar' ? 'تسجيل الخروج' : 'Logout';
  }
  
  // Update create user button text
  const createUserBtn = document.getElementById('btnCreateUser');
  if (createUserBtn && createUserBtn.style.display !== 'none') {
    createUserBtn.textContent = lang === 'ar' ? '+ مستخدم' : '+ User';
  }

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
  
  // Update user info in header
  const user = API.getCurrentUser();
  const userInfo = document.getElementById('userInfo');
  if (userInfo && user) {
    userInfo.textContent = `${user.username} (${user.role})`;
  }
  
  // Logout button - set up event listener only once (in initApp)
  // Text is updated in setLang() above
  
  render().then(() => {
    console.log('✅ render() completed');
  }).catch((err) => {
    console.error('❌ render() failed:', err);
  });
}

async function getSectionMeta(code) {
  try {
    return await API.getSectionMeta(code);
  } catch (error) {
    console.error('Error fetching section meta:', error);
    return null;
  }
}

async function setSectionFile(code, file) {
  try {
    await API.uploadSectionFile(code, file);
    // Metadata is updated by backend
    return true;
  } catch (error) {
    console.error('Error uploading file:', error);
    alert(error.message || 'Failed to upload file');
    throw error;
  }
}

async function clearSection(code) {
  try {
    await API.deleteSectionFile(code);
    return true;
  } catch (error) {
    console.error('Error clearing section:', error);
    alert(error.message || 'Failed to delete file');
    throw error;
  }
}

async function downloadSection(code) {
  try {
    await API.downloadSectionFile(code);
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    if (error.message.includes('404') || error.message.includes('not found')) {
      return false;
    }
    alert(error.message || 'Failed to download file');
    return false;
  }
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

// Share modal
async function showShareModal(sectionCode) {
  try {
    console.log('🔗 Opening share modal for section:', sectionCode);
    
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
      alert(currentLang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }
    
    // Get all users and current access list
    let users = [];
    let accessList = [];
    
    try {
      console.log('📡 Calling API.getAllUsers()...');
      users = await API.getAllUsers();
      console.log('✅ Fetched users:', users);
      
      if (!users || !Array.isArray(users)) {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      const errorMsg = error.message || 'Unknown error';
      alert(currentLang === 'ar' 
        ? `فشل تحميل قائمة المستخدمين: ${errorMsg}\n\nيرجى التحقق من:\n1. الخادم يعمل\n2. إعادة تشغيل الخادم إذا لزم الأمر` 
        : `Failed to load user list: ${errorMsg}\n\nPlease check:\n1. Server is running\n2. Restart server if needed`);
      return;
    }
    
    try {
      accessList = await API.getSectionAccess(sectionCode);
      console.log('✅ Fetched access list:', accessList);
    } catch (error) {
      console.warn('⚠️ Error fetching access list (using empty):', error);
      accessList = [];
    }
    
    const accessibleUserIds = new Set(accessList.map(a => a.id));
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'shareModal';
    modal.innerHTML = `
      <div class="shareModal__overlay"></div>
      <div class="shareModal__content">
        <div class="shareModal__header">
          <h3>${currentLang === 'ar' ? 'مشاركة الوصول' : 'Share Access'}</h3>
          <button class="shareModal__close">✕</button>
        </div>
        <div class="shareModal__body">
          <p style="margin-bottom: 16px; color: #64748b; font-size: 14px;">
            ${currentLang === 'ar' ? 'اختر المستخدمين للمشاركة معهم:' : 'Select users to share with:'}
          </p>
          <div class="shareModal__users">
            ${users.filter(u => u.id !== currentUser.id).map(user => `
              <label class="shareModal__user">
                <input type="checkbox" ${accessibleUserIds.has(user.id) ? 'checked' : ''} data-user-id="${user.id}" data-username="${user.username}" />
                <span>${escapeHtml(user.username)}</span>
                <span class="shareModal__role">${user.role}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="shareModal__footer">
          <button class="btn btn--secondary shareModal__cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          <button class="btn btn--primary shareModal__save">${currentLang === 'ar' ? 'حفظ' : 'Save'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close handlers
    const close = () => {
      modal.remove();
    };
    modal.querySelector('.shareModal__overlay').addEventListener('click', close);
    modal.querySelector('.shareModal__close').addEventListener('click', close);
    modal.querySelector('.shareModal__cancel').addEventListener('click', close);
    
    // Save handler
    modal.querySelector('.shareModal__save').addEventListener('click', async () => {
      const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
      const toShare = [];
      const toRevoke = [];
      
      checkboxes.forEach(cb => {
        const userId = parseInt(cb.dataset.userId);
        const username = cb.dataset.username;
        if (cb.checked && !accessibleUserIds.has(userId)) {
          toShare.push({ userId, username });
        } else if (!cb.checked && accessibleUserIds.has(userId)) {
          toRevoke.push({ userId });
        }
      });
      
      try {
        console.log('💾 Saving sharing changes...');
        console.log('  - To share:', toShare);
        console.log('  - To revoke:', toRevoke);
        
        // Share new users
        for (const { username } of toShare) {
          try {
            await API.shareSection(sectionCode, username);
            console.log(`✅ Shared ${sectionCode} with ${username}`);
          } catch (error) {
            console.error(`❌ Error sharing with ${username}:`, error);
            throw error;
          }
        }
        
        // Revoke access
        for (const { userId } of toRevoke) {
          try {
            await API.revokeAccess(sectionCode, userId);
            console.log(`✅ Revoked access for user ${userId}`);
          } catch (error) {
            console.error(`❌ Error revoking access for user ${userId}:`, error);
            throw error;
          }
        }
        
        console.log('✅ Sharing changes saved successfully');
        close();
        await render();
      } catch (error) {
        console.error('❌ Error saving sharing changes:', error);
        const errorMsg = error.message || (currentLang === 'ar' ? 'فشل تحديث المشاركة' : 'Failed to update sharing');
        alert(errorMsg);
      }
    });
  } catch (error) {
    console.error('Error showing share modal:', error);
    alert(error.message || 'Failed to load sharing options');
  }
}

// Metadata editing modal
async function showMetaModal(sectionCode) {
  try {
    const current = (await getSectionMeta(sectionCode)) || {};
    const L = i18n[currentLang].labels;
    
    const statusOptions = [
      { value: 'draft', label: currentLang === 'ar' ? 'مسودة' : 'Draft' },
      { value: 'internal', label: currentLang === 'ar' ? 'داخلي' : 'Internal' },
      { value: 'external', label: currentLang === 'ar' ? 'خارجي' : 'External' },
      { value: 'approved', label: currentLang === 'ar' ? 'معتمد' : 'Approved' },
      { value: 'published', label: currentLang === 'ar' ? 'منشور' : 'Published' },
      { value: 'archived', label: currentLang === 'ar' ? 'مؤرشف' : 'Archived' }
    ];
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'metaModal';
    modal.innerHTML = `
      <div class="metaModal__overlay"></div>
      <div class="metaModal__content">
        <div class="metaModal__header">
          <h3>${currentLang === 'ar' ? 'تحديث البيانات الوصفية' : 'Edit Metadata'}</h3>
          <button class="metaModal__close">✕</button>
        </div>
        <div class="metaModal__body">
          <form class="metaModal__form" id="metaForm">
            <div class="metaModal__field">
              <label class="metaModal__label">${L.metaEditPromptOwner}</label>
              <input type="text" class="metaModal__input" id="metaOwner" value="${escapeHtml(current.owner || '')}" placeholder="${L.metaEditPromptOwner}" />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${L.metaEditPromptReviewer}</label>
              <input type="text" class="metaModal__input" id="metaReviewer" value="${escapeHtml(current.reviewer || '')}" placeholder="${L.metaEditPromptReviewer}" />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${L.metaEditPromptApprover}</label>
              <input type="text" class="metaModal__input" id="metaApprover" value="${escapeHtml(current.approver || '')}" placeholder="${L.metaEditPromptApprover}" />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${L.metaEditPromptVersion}</label>
              <input type="text" class="metaModal__input" id="metaVersion" value="${escapeHtml(current.version || 'v1.0')}" placeholder="v1.0" />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${L.metaEditPromptStatus}</label>
              <select class="metaModal__select" id="metaStatus">
                ${statusOptions.map(opt => `
                  <option value="${opt.value}" ${(current.status || 'draft') === opt.value ? 'selected' : ''}>${opt.label}</option>
                `).join('')}
              </select>
              <div class="metaModal__help">${currentLang === 'ar' ? 'اختر حالة الوثيقة من القائمة' : 'Select document status from dropdown'}</div>
            </div>
          </form>
        </div>
        <div class="metaModal__footer">
          <button class="btn btn--secondary metaModal__cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          <button class="btn btn--primary metaModal__save">${currentLang === 'ar' ? 'حفظ' : 'Save'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close handlers
    const close = () => {
      modal.remove();
    };
    modal.querySelector('.metaModal__overlay').addEventListener('click', close);
    modal.querySelector('.metaModal__close').addEventListener('click', close);
    modal.querySelector('.metaModal__cancel').addEventListener('click', close);
    
    // Save handler
    modal.querySelector('.metaModal__save').addEventListener('click', async () => {
      const owner = document.getElementById('metaOwner').value.trim();
      const reviewer = document.getElementById('metaReviewer').value.trim();
      const approver = document.getElementById('metaApprover').value.trim();
      const version = document.getElementById('metaVersion').value.trim();
      const status = document.getElementById('metaStatus').value;
      
      const updatedMeta = {
        ...current,
        owner: owner || undefined,
        reviewer: reviewer || undefined,
        approver: approver || undefined,
        version: version || 'v1.0',
        status: status || 'draft',
      };
      
      try {
        await API.updateSectionMeta(sectionCode, updatedMeta);
        close();
        await render();
      } catch (error) {
        console.error('Error updating metadata:', error);
        alert(error.message || 'Failed to update metadata');
      }
    });
  } catch (error) {
    console.error('Error showing metadata modal:', error);
    alert(error.message || 'Failed to load metadata');
  }
}

// Add link modal
function showAddLinkModal(sectionCode) {
  try {
    const L = i18n[currentLang].labels;
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'metaModal'; // Reuse metaModal styles
    modal.innerHTML = `
      <div class="metaModal__overlay"></div>
      <div class="metaModal__content">
        <div class="metaModal__header">
          <h3>${currentLang === 'ar' ? 'إضافة رابط مستند على الإنترنت' : 'Add Online Document Link'}</h3>
          <button class="metaModal__close">✕</button>
        </div>
        <div class="metaModal__body">
          <form class="metaModal__form" id="linkForm">
            <div class="metaModal__field">
              <label class="metaModal__label">${L.linkTitlePrompt}</label>
              <input type="text" class="metaModal__input" id="linkTitle" placeholder="${L.linkTitlePrompt}" />
              <div class="metaModal__help">${currentLang === 'ar' ? 'مثال: عرض رعاية، خطة إعلامية' : 'e.g., Sponsorship deck, Media plan'}</div>
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${L.linkUrlPrompt}</label>
              <input type="url" class="metaModal__input" id="linkUrl" placeholder="${L.linkUrlPrompt}" />
              <div class="metaModal__help">${currentLang === 'ar' ? 'ألصق رابط Google Docs أو Drive الكامل' : 'Paste the full Google Docs or Drive URL'}</div>
            </div>
          </form>
        </div>
        <div class="metaModal__footer">
          <button class="btn btn--secondary metaModal__cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          <button class="btn btn--primary metaModal__save">${currentLang === 'ar' ? 'إضافة' : 'Add'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus on title input
    setTimeout(() => {
      const titleInput = document.getElementById('linkTitle');
      if (titleInput) titleInput.focus();
    }, 100);
    
    // Close handlers
    const close = () => {
      modal.remove();
    };
    modal.querySelector('.metaModal__overlay').addEventListener('click', close);
    modal.querySelector('.metaModal__close').addEventListener('click', close);
    modal.querySelector('.metaModal__cancel').addEventListener('click', close);
    
    // Save handler
    modal.querySelector('.metaModal__save').addEventListener('click', async () => {
      const title = document.getElementById('linkTitle').value.trim();
      const url = document.getElementById('linkUrl').value.trim();
      
      if (!title) {
        alert(currentLang === 'ar' ? 'يرجى إدخال عنوان المستند' : 'Please enter a document title');
        return;
      }
      
      if (!url) {
        alert(currentLang === 'ar' ? 'يرجى إدخال رابط المستند' : 'Please enter a document URL');
        return;
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch (e) {
        alert(currentLang === 'ar' ? 'الرابط غير صحيح. يرجى إدخال رابط صحيح (يبدأ بـ http:// أو https://)' : 'Invalid URL. Please enter a valid URL (starting with http:// or https://)');
        return;
      }
      
      try {
        await API.addSectionLink(sectionCode, title, url);
        close();
        await render();
      } catch (error) {
        console.error('Error adding link:', error);
        alert(error.message || (currentLang === 'ar' ? 'فشل إضافة الرابط' : 'Failed to add link'));
      }
    });
    
    // Allow Enter key to submit
    modal.querySelectorAll('.metaModal__input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          modal.querySelector('.metaModal__save').click();
        }
      });
    });
  } catch (error) {
    console.error('Error showing add link modal:', error);
    alert(error.message || 'Failed to show add link form');
  }
}

// Create user modal (admin only)
function showCreateUserModal() {
  try {
    const L = i18n[currentLang].labels;
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'metaModal'; // Reuse metaModal styles
    modal.innerHTML = `
      <div class="metaModal__overlay"></div>
      <div class="metaModal__content">
        <div class="metaModal__header">
          <h3>${currentLang === 'ar' ? 'إنشاء مستخدم جديد' : 'Create New User'}</h3>
          <button class="metaModal__close">✕</button>
        </div>
        <div class="metaModal__body">
          <form class="metaModal__form" id="createUserForm">
            <div class="metaModal__field">
              <label class="metaModal__label">${currentLang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
              <input type="text" class="metaModal__input" id="newUsername" placeholder="${currentLang === 'ar' ? 'اسم المستخدم' : 'Username'}" required />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${currentLang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input type="password" class="metaModal__input" id="newPassword" placeholder="${currentLang === 'ar' ? 'كلمة المرور' : 'Password'}" required />
            </div>
            <div class="metaModal__field">
              <label class="metaModal__label">${currentLang === 'ar' ? 'الدور' : 'Role'}</label>
              <select class="metaModal__select" id="newRole">
                <option value="viewer">${currentLang === 'ar' ? 'عارض' : 'Viewer'} - ${currentLang === 'ar' ? 'عرض فقط' : 'View only'}</option>
                <option value="editor">${currentLang === 'ar' ? 'محرر' : 'Editor'} - ${currentLang === 'ar' ? 'تحرير ومشاركة' : 'Edit and share'}</option>
                <option value="admin">${currentLang === 'ar' ? 'مدير' : 'Admin'} - ${currentLang === 'ar' ? 'صلاحيات كاملة' : 'Full access'}</option>
              </select>
              <div class="metaModal__help">${currentLang === 'ar' ? 'اختر دور المستخدم من القائمة' : 'Select user role from dropdown'}</div>
            </div>
          </form>
        </div>
        <div class="metaModal__footer">
          <button class="btn btn--secondary metaModal__cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          <button class="btn btn--primary metaModal__save">${currentLang === 'ar' ? 'إنشاء' : 'Create'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus on username input
    setTimeout(() => {
      const usernameInput = document.getElementById('newUsername');
      if (usernameInput) usernameInput.focus();
    }, 100);
    
    // Close handlers
    const close = () => {
      modal.remove();
    };
    modal.querySelector('.metaModal__overlay').addEventListener('click', close);
    modal.querySelector('.metaModal__close').addEventListener('click', close);
    modal.querySelector('.metaModal__cancel').addEventListener('click', close);
    
    // Save handler
    modal.querySelector('.metaModal__save').addEventListener('click', async () => {
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value;
      const role = document.getElementById('newRole').value;
      
      if (!username) {
        alert(currentLang === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter a username');
        return;
      }
      
      if (!password || password.length < 4) {
        alert(currentLang === 'ar' ? 'يرجى إدخال كلمة مرور (4 أحرف على الأقل)' : 'Please enter a password (at least 4 characters)');
        return;
      }
      
      try {
        await API.createUser(username, password, role);
        alert(currentLang === 'ar' ? `تم إنشاء المستخدم "${username}" بنجاح` : `User "${username}" created successfully`);
        close();
        // Refresh the page to show new user in share lists
        location.reload();
      } catch (error) {
        console.error('Error creating user:', error);
        alert(error.message || (currentLang === 'ar' ? 'فشل إنشاء المستخدم' : 'Failed to create user'));
      }
    });
    
    // Allow Enter key to submit
    modal.querySelectorAll('.metaModal__input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          modal.querySelector('.metaModal__save').click();
        }
      });
    });
  } catch (error) {
    console.error('Error showing create user modal:', error);
    alert(error.message || 'Failed to show create user form');
  }
}

async function render() {
  try {
    const grid = document.getElementById("sectionsGrid");
    if (!grid) {
      console.warn('Sections grid not found, retrying...');
      setTimeout(render, 100);
      return;
    }
    
    grid.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">Loading sections...</div>';
    
    const tpl = document.getElementById("sectionCardTpl");
    if (!tpl) {
      console.error('Section card template not found');
      grid.innerHTML = '<div style="padding: 2rem; text-align: center; color: #dc2626;">Error: Template not found</div>';
      return;
    }
    
    // Get accessible sections based on user role
    let accessibleSections = [];
    const user = API.getCurrentUser();
    if (!user) {
      console.warn('No user found, redirecting to login');
      window.location.href = '/login.html';
      return;
    }
    
    try {
      const mySections = await API.getMySections();
      console.log('📋 Fetched accessible sections:', mySections);
      
      // Check if user is admin/editor OR if API returned '*' marker
      if (user.role === 'admin' || user.role === 'editor') {
        // Admins and editors see all sections
        accessibleSections = SECTIONS.map(s => s.code);
        console.log('✅ Admin/Editor: Showing all', accessibleSections.length, 'sections');
      } else if (mySections && Array.isArray(mySections) && mySections.length > 0) {
        // Viewers only see shared sections
        accessibleSections = mySections;
        console.log('✅ Viewer: Showing', mySections.length, 'shared sections');
      } else {
        // No sections returned - for admin/editor, show all; for viewer, show none
        if (user.role === 'admin' || user.role === 'editor') {
          accessibleSections = SECTIONS.map(s => s.code);
          console.log('⚠️ API returned empty, but user is admin/editor: Showing all sections');
        } else {
          console.log('⚠️ Viewer with no shared sections');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching accessible sections:', error);
      // Fallback: show all for admin/editor
      if (user.role === 'admin' || user.role === 'editor') {
        accessibleSections = SECTIONS.map(s => s.code);
        console.log('✅ Fallback: Showing all sections for admin/editor');
      } else {
        console.warn('⚠️ Viewer: Cannot fetch sections, showing none');
      }
    }
    
    // Ensure admin/editor always have access to all sections
    if ((user.role === 'admin' || user.role === 'editor') && accessibleSections.length === 0) {
      console.warn('⚠️ Admin/Editor with no accessible sections - forcing all sections');
      accessibleSections = SECTIONS.map(s => s.code);
    }
    
    // Filter sections
    const sectionsToRender = SECTIONS.filter(s => accessibleSections.includes(s.code));
    
    console.log(`📊 Filtered: ${sectionsToRender.length} sections to render from ${SECTIONS.length} total sections`);
    
    if (sectionsToRender.length === 0) {
      const message = currentLang === 'ar' 
        ? '<p style="font-size: 18px; margin-bottom: 8px;">لا توجد أقسام متاحة</p><p style="font-size: 14px;">اتصل بالمسؤول لمنحك الوصول إلى الأقسام.</p>'
        : '<p style="font-size: 18px; margin-bottom: 8px;">No sections available</p><p style="font-size: 14px;">Contact an administrator to grant you access to sections.</p>';
      grid.innerHTML = `<div style="padding: 3rem; text-align: center; color: #64748b;">${message}</div>`;
      return;
    }
    
    console.log(`📋 Rendering ${sectionsToRender.length} of ${SECTIONS.length} sections`);
    
    const L = i18n[currentLang].labels;
    grid.innerHTML = ""; // Clear loading

    for (const s of sectionsToRender) {
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
    const shareBtn = node.querySelector("[data-share]");

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
      let updated = "—";
      if (meta.updatedAt) {
        try {
          const date = new Date(meta.updatedAt);
          if (!isNaN(date.getTime())) {
            updated = date.toLocaleString(currentLang === "ar" ? "ar" : "en");
          }
        } catch (e) {
          console.warn('Invalid date:', meta.updatedAt);
        }
      }
      metaEl.innerHTML =
        `<div><b>${L.name}:</b> ${escapeHtml(meta.filename || "")}</div>` +
        `<div><b>${L.size}:</b> ${fmtBytes(meta.size)}</div>` +
        `<div><b>${L.last}:</b> ${escapeHtml(updated)}</div>`;
      downloadBtn.disabled = false;
      clearBtn.disabled = isViewer;
    }

    uploadInput.disabled = isViewer;
    
    // Sharing button (admin/editor only)
    if (shareBtn && !isViewer) {
      shareBtn.innerHTML = '🔗';
      shareBtn.title = currentLang === 'ar' ? 'مشاركة الوصول' : 'Share access';
      shareBtn.addEventListener("click", async () => {
        await showShareModal(s.code);
      });
    } else if (shareBtn) {
      shareBtn.classList.add("hidden");
    }
    
    if (isViewer) {
      node.querySelector("[data-upload-label]").classList.add("hidden");
      clearBtn.classList.add("hidden");
      if (metaEditBtn) metaEditBtn.classList.add("hidden");
    } else if (metaEditBtn) {
      metaEditBtn.textContent = L.metaEdit;
      metaEditBtn.addEventListener("click", () => {
        showMetaModal(s.code);
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
          try {
            await API.removeSectionLink(s.code, link.id);
            await render();
          } catch (error) {
            console.error('Error removing link:', error);
            alert(error.message || 'Failed to remove link');
          }
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
    linkAddBtn.addEventListener("click", () => {
      if (isViewer) return;
      showAddLinkModal(s.code);
    });

    grid.appendChild(node);
    }
    
    console.log(`✅ Rendered ${sectionsToRender.length} sections`);
  } catch (error) {
    console.error('Render error:', error);
    const grid = document.getElementById("sectionsGrid");
    if (grid) {
      grid.innerHTML = `<div style="padding: 2rem; text-align: center; color: #dc2626;">Error rendering: ${error.message}</div>`;
    }
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

function logout() {
  API.setAuthToken(null, null);
  window.location.href = '/login.html';
}

document.getElementById("btnLang").addEventListener("click", () => {
  setLang(currentLang === "ar" ? "en" : "ar");
});

// Export/Import removed - use backend API directly

document.getElementById("guideOverlay").addEventListener("click", () => closeGuide());
document.getElementById("guideCloseBtn").addEventListener("click", () => closeGuide());

const roleSelectEl = document.getElementById("roleSelect");
function updateRoleUi() {
  const L = i18n[currentLang].labels;
  const isViewer = currentRole === "viewer";

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

// Check authentication on load
async function checkAuth() {
  try {
    const user = API.getCurrentUser();
    if (!user) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) {
    console.warn('Login modal not found - continuing without auth');
    return;
  }
  
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('loginError');
  const title = document.getElementById('loginTitle');
  
  modal.style.display = 'flex';
  if (title) {
    title.textContent = currentLang === 'ar' ? 'تسجيل الدخول' : 'Login';
  }
  
  if (form) {
    // Remove old listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorDiv) errorDiv.textContent = '';
      
      const usernameEl = document.getElementById('loginUsername');
      const passwordEl = document.getElementById('loginPassword');
      const username = usernameEl ? usernameEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      
      if (!username || !password) {
        if (errorDiv) errorDiv.textContent = 'Username and password required';
        return;
      }
      
      try {
        await API.login(username, password);
        modal.style.display = 'none';
        const user = API.getCurrentUser();
        if (user) {
          currentRole = user.role || 'admin';
        }
        updateRoleUi();
        await render();
      } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
          errorDiv.textContent = error.message || 'Login failed. Try: admin / admin123';
        }
      }
    });
  }
}

// Log script execution
console.log('📄 app.js executing, readyState:', document.readyState);

// Initialize on DOM ready
if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired');
    initApp();
  });
} else {
  console.log('✅ DOM already ready, initializing immediately');
  initApp();
}

async function initApp() {
  try {
    console.log('🚀 Starting app initialization...');
    
    // Check authentication first
    const user = API.getCurrentUser();
    if (!user) {
      console.warn('⚠️ No user found, redirecting to login');
      window.location.href = '/login.html';
      return;
    }
    
    console.log('✅ User authenticated:', user.username, 'role:', user.role);
    
    // Wait for DOM elements
    const grid = document.getElementById("sectionsGrid");
    const tpl = document.getElementById("sectionCardTpl");
    
    if (!grid || !tpl) {
      console.warn('⏳ DOM elements not ready, retrying...');
      setTimeout(initApp, 50);
      return;
    }
    
    console.log('✅ DOM elements ready');
    
    // Set user role
    currentRole = user.role || 'admin';
    console.log('✅ Current role set to:', currentRole);
    
    // Initialize UI
    console.log('✅ Initializing UI...');
    setLang("ar");
    updateRoleUi();
    
    // Set up logout button event listener (only once)
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
    
    // Set up create user button (admin only)
    const createUserBtn = document.getElementById('btnCreateUser');
    if (createUserBtn) {
      if (user.role === 'admin') {
        createUserBtn.style.display = 'inline-block';
        createUserBtn.textContent = currentLang === 'ar' ? '+ مستخدم' : '+ User';
        createUserBtn.addEventListener('click', showCreateUserModal);
      } else {
        createUserBtn.style.display = 'none';
      }
    }
    
    console.log('✅ App initialized successfully for user:', user.username, 'role:', currentRole);
    console.log('📊 Total sections defined:', SECTIONS.length);
  } catch (error) {
    console.error('❌ Initialization error:', error);
    console.error('Error stack:', error.stack);
    // Redirect to login on error
    window.location.href = '/login.html';
  }
}

