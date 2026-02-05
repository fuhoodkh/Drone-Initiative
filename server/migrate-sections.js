// Migration script to populate sections table with original hardcoded sections
// This preserves all existing metadata, links, and permissions

import { dbGet, dbAll, dbRun } from './db.js';

// Import the FALLBACK_SECTIONS from the frontend file
// Since we can't directly import from frontend, we'll define it here
const FALLBACK_SECTIONS = [
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>نظرة عامة على البرنامج</li><li>الأهداف ومعايير النجاح</li><li>تعريف النطاق (In/Out)</li><li>الحوكمة والسلطة</li><li>أصحاب المصلحة الرئيسيون</li><li>المخاطر والافتراضات</li><li>الموافقة</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Program overview</li><li>Objectives & success criteria</li><li>Scope definition</li><li>Governance & authority</li><li>Key stakeholders</li><li>Risks & assumptions</li><li>Approval</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>الهدف والأثر</li><li>نطاق البرنامج والبيانات العامة</li><li>الأهداف القابلة للقياس</li><li>المحاور والمحتوى</li><li>آلية التنفيذ والسلامة</li><li>الشركاء والفريق</li><li>الميزانية والمتطلبات</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Purpose & impact</li><li>Scope & high-level data</li><li>Measurable objectives</li><li>Tracks & content</li><li>Delivery model & safety</li><li>Partners & team</li><li>Budget & approvals</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>صفحة واحدة مكثفة</li><li>ملخص البرنامج</li><li>فرص الظهور</li><li>باقات الرعاية</li><li>خطة التفعيل</li><li>مؤشرات الأداء والتقارير</li><li>الجدول الزمني للرعاية</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>One-page summary</li><li>Program snapshot</li><li>Visibility inventory</li><li>Sponsorship tiers</li><li>Activation plan</li><li>KPIs & reporting</li><li>Sponsorship timeline</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات المقترح للشرائح</h3><ol><li>العنوان والرؤية</li><li>المشكلة/الفرصة</li><li>الحل (البرنامج)</li><li>السوق/الاحتياج</li><li>النموذج المالي</li><li>خطة التوسع</li><li>الفريق والشركاء</li><li>الطلب (The Ask)</li></ol>`,
    guideEn: `<h3>Suggested slide flow</h3><ol><li>Title & vision</li><li>Problem / opportunity</li><li>Solution (program model)</li><li>Market / need</li><li>Economics & scenarios</li><li>Scale-up roadmap</li><li>Team & partners</li><li>The ask</li></ol>`,
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
    guideAr: `<h3>عناصر رئيسية</h3><ol><li>ملخص ميزانية صفحة واحدة</li><li>الافتراضات الرئيسة</li><li>السيناريوهات (A/B/C)</li><li>علاقة الميزانية بالرعاة والرسوم</li></ol>`,
    guideEn: `<h3>Key components</h3><ol><li>One-page budget summary</li><li>Core assumptions</li><li>Scenarios (A/B/C)</li><li>Link to sponsorship & pricing strategy</li></ol>`,
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
    guideAr: `<h3>عناوين أساسية للمذكرة</h3><ol><li>الأطراف والغاية</li><li>نطاق التعاون</li><li>المدة وإنهاء الاتفاق</li><li>العلامة التجارية والإعلام</li><li>البيانات والخصوصية</li><li>السلامة والمسؤوليات</li></ol>`,
    guideEn: `<h3>Core MoU sections</h3><ol><li>Parties & purpose</li><li>Scope of collaboration</li><li>Term & termination</li><li>Branding & communications</li><li>Data & privacy</li><li>Safety & liability</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>موافقات الطيران المدني</li><li>مواصفات الدرون والأرقام التسلسلية</li><li>شهادات الطيارين/المدربين</li><li>شهادات التأمين</li><li>متطلبات الموقع</li><li>التحديثات والمراجعات</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Civil aviation approvals</li><li>Drone specs & serial numbers</li><li>Pilot/trainer credentials</li><li>Insurance certificates</li><li>Venue requirements</li><li>Updates & reviews</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>الهدف ونطاق السلامة</li><li>الأدوار والمسؤوليات</li><li>مناطق التشغيل</li><li>إجراءات التشغيل القياسية</li><li>سجل المخاطر</li><li>إدارة الحوادث</li><li>الموافقات</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Purpose & scope</li><li>Roles & responsibilities</li><li>Operating zones</li><li>SOPs (pre / during / post flight, FPV)</li><li>Risk register</li><li>Incident management</li><li>Approvals & compliance</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>الغرض</li><li>الأدوار والمسؤوليات (RACI)</li><li>تدفق العمليات اليومية</li><li>إدارة المعدات</li><li>السلامة وإدارة الحوادث</li><li>بروتوكولات No-Fly والطوارئ</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Purpose</li><li>Roles & responsibilities (RACI)</li><li>Daily operations flow</li><li>Equipment management</li><li>Safety & incident handling</li><li>No-fly & emergency protocols</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>مخرجات التعلم</li><li>هيكلة المحاور</li><li>الخطة الأسبوعية</li><li>الجدول اليومي</li><li>المعدات والمعامل</li><li>أسلوب التقييم</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Learning outcomes</li><li>Track structure</li><li>Weekly plan</li><li>Daily schedule template</li><li>Facilities & equipment</li><li>Assessment model</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>الرسائل الرئيسية</li><li>نبذة عامة (Boilerplate)</li><li>أسئلة وأجوبة</li><li>المواد البصرية</li><li>إرشادات الشعار</li><li>قوالب المنشورات</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Key messages</li><li>Boilerplate</li><li>Q&A</li><li>Visual assets</li><li>Logo usage</li><li>Sample posts</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>الغرض والنطاق</li><li>معالجة بيانات الطلبة</li><li>موافقات التصوير والإعلام</li><li>استخدام صور الدرون</li><li>فترة الاحتفاظ</li><li>الامتثال والخصوصية</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Purpose & scope</li><li>Student data handling</li><li>Media consent</li><li>Drone imagery usage</li><li>Retention period</li><li>Compliance & privacy</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>لوحة KPIs</li><li>التقارير الأسبوعية</li><li>سجل حوادث السلامة</li><li>مقاييس ظهور الرعاة</li><li>الدروس المستفادة</li><li>التوصيات</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>KPI dashboard</li><li>Weekly reports</li><li>Safety incident log</li><li>Sponsor exposure metrics</li><li>Lessons learned</li><li>Recommendations</li></ol>`,
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
    guideAr: `<h3>جدول المحتويات</h3><ol><li>التقرير النهائي</li><li>التسوية المالية</li><li>جرد الأصول والمعدات</li><li>التوصيات للدفعة التالية</li><li>خطة التحسين</li></ol>`,
    guideEn: `<h3>Table of contents</h3><ol><li>Final report</li><li>Financial reconciliation</li><li>Asset & equipment inventory</li><li>Recommendations for next cohort</li><li>Improvement plan</li></ol>`,
  },
];

export async function migrateSections() {
  try {
    console.log('🔄 Starting sections migration...');
    
    // Check if sections table has any data
    const existingSections = await dbAll('SELECT section_code FROM sections');
    
    if (existingSections.length > 0) {
      console.log(`✅ Sections table already has ${existingSections.length} sections. Skipping migration.`);
      return { migrated: 0, skipped: existingSections.length };
    }
    
    console.log('📦 No sections found. Migrating from FALLBACK_SECTIONS...');
    
    let migrated = 0;
    let skipped = 0;
    
    for (const section of FALLBACK_SECTIONS) {
      try {
        // Check if section already exists (shouldn't, but just in case)
        const existing = await dbGet('SELECT section_code FROM sections WHERE section_code = ?', [section.code]);
        
        if (existing) {
          console.log(`⏭️  Section ${section.code} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Insert section
        await dbRun(
          `INSERT INTO sections (
            section_code, phase, kicker_ar, title_ar, purpose_ar, audience_ar, how_ar,
            kicker_en, title_en, purpose_en, audience_en, how_en, guide_ar, guide_en,
            created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            section.code,
            section.phase,
            section.kickerAr || null,
            section.titleAr,
            section.purposeAr || null,
            section.audienceAr || null,
            section.howAr || null,
            section.kickerEn || null,
            section.titleEn,
            section.purposeEn || null,
            section.audienceEn || null,
            section.howEn || null,
            section.guideAr || null,
            section.guideEn || null,
            'system', // Migration user
            'system'
          ]
        );
        
        migrated++;
        console.log(`✅ Migrated section: ${section.code} - ${section.titleEn}`);
      } catch (error) {
        console.error(`❌ Error migrating section ${section.code}:`, error.message);
        // Continue with other sections
      }
    }
    
    console.log(`✅ Migration complete: ${migrated} sections migrated, ${skipped} skipped`);
    
    // Log to audit
    await dbRun(
      'INSERT INTO audit_log (section_code, action, user, details) VALUES (?, ?, ?, ?)',
      ['SYSTEM', 'sections_migration', 'system', JSON.stringify({ migrated, skipped, total: FALLBACK_SECTIONS.length })]
    );
    
    return { migrated, skipped, total: FALLBACK_SECTIONS.length };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
