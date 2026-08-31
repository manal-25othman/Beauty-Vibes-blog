# Beauty Vibes — مجلة الجمال والصحة العربية

مجلة رقمية عربية (RTL) متخصصة في الجمال الطبيعي والعناية بالبشرة والشعر والصحة،
مبنية بـ Next.js وTypeScript وPostgreSQL، مع لوحة تحكم كاملة وتهيئة حقيقية لمحركات البحث.

المحتوى منقول من مدونة Blogger قائمة — التفاصيل في
[`MIGRATION_REPORT.md`](./MIGRATION_REPORT.md).

للتقرير التفصيلي عن البنية والأمان والأداء والاختبارات، انظري
[`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md).

---

## الحزمة التقنية

- **Next.js 16** (App Router) — توليد ساكن + تصيير على الخادم
- **TypeScript** بوضع صارم
- **Tailwind CSS v4** — خصائص منطقية تدعم RTL أصلًا
- **PostgreSQL 16** + **Prisma 6**
- **Markdown** عبر unified/remark/rehype مع تعقيم صارم
- مصادقة خاصة: bcryptjs + جلسات مخزّنة على الخادم

---

## التشغيل محليًا

### المتطلبات
- Node.js 20 فأحدث
- PostgreSQL 14 فأحدث

### الخطوات

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. تجهيز متغيرات البيئة
cp .env.example .env
#    ثم املئي DATABASE_URL و AUTH_SECRET و SEED_ADMIN_*
#    لتوليد مفتاح التوقيع:
openssl rand -base64 48

# 3. إنشاء جداول قاعدة البيانات
npm run db:migrate

# 4. تعبئة المحتوى (٣٨ مقالًا منقولًا + تصنيفات + الكاتبة + حساب المدير)
npm run db:seed

# 5. التشغيل
npm run dev
```

الموقع على `http://localhost:3000` ولوحة التحكم على `/admin`.

---

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء الإنتاج (يشمل `prisma generate`) |
| `npm run vercel-build` | يستخدمه Vercel تلقائيًا: هجرات + تعبئة مشروطة + بناء |
| `npm start` | تشغيل نسخة الإنتاج |
| `npm run lint` | ESLint |
| `npm run typecheck` | فحص الأنواع دون إخراج |
| `npm run db:migrate` | إنشاء وتطبيق هجرة (تطوير) |
| `npm run db:deploy` | تطبيق الهجرات (إنتاج) |
| `npm run db:seed` | تعبئة البيانات الأولية (idempotent) |
| `npm run db:studio` | واجهة Prisma Studio |
| `npm run placeholders` | إعادة توليد الصور النائبة |
| `npm run blogger:convert` | إعادة توليد المقالات من تصدير Blogger |
| `npm run blogger:images` | تنزيل صور المقالات المنقولة |
| `npm run test:e2e` | اختبارات المتصفّح الشاملة (تتطلّب خادمًا يعمل) |

### الاختبارات

`tests/e2e.mjs` مجموعة اختبارات متصفّح تغطّي التجاوب على سبعة عروض، وبنية الصفحة
والوصولية، والقوائم والبحث، ونماذج الزوار، والمصادقة، ودورة إنشاء المقال وحذفه.

```bash
# 1. شغّلي نسخة الإنتاج في نافذة أخرى
npm run build && npm start

# 2. ثم شغّلي الاختبارات
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
```

بيانات الاعتماد تُقرأ من البيئة فقط. عند غيابها تُتخطّى اختبارات لوحة التحكم
وتعمل بقية الفحوص. متغيّرات اختيارية: `E2E_BASE_URL` و `E2E_CHROMIUM_PATH`.

---

## متغيرات البيئة

الملف الكامل بقيم نائبة في [`.env.example`](./.env.example).

| المتغيّر | مطلوب | الوصف |
|---|---|---|
| `DATABASE_URL` | ✅ | اتصال التطبيق — على Vercel استخدمي مجمّع الاتصالات (pooler) |
| `DIRECT_URL` | ✅ | اتصال مباشر للهجرات والتعبئة — محليًا اجعليه مطابقًا لـ `DATABASE_URL` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | العنوان العام — يؤثّر على canonical و sitemap و OG |
| `AUTH_SECRET` | ✅ | مفتاح توقيع الجلسات (٢٤ حرفًا فأكثر) |
| `NEXT_PUBLIC_GA_ID` | — | معرّف GA4 الافتراضي (تتقدّم عليه قيمة اللوحة) |
| `GOOGLE_SITE_VERIFICATION` | — | قيمة تحقّق Search Console الافتراضية |
| `ADSENSE_PUBLISHER_ID` | — | معرّف ناشر AdSense الافتراضي |
| `EMAIL_PROVIDER` | — | `none` \| `mailchimp` \| `brevo` \| `convertkit` |
| `EMAIL_PROVIDER_API_KEY` | — | مفتاح مزوّد النشرة |
| `EMAIL_PROVIDER_LIST_ID` | — | معرّف القائمة/الجمهور/النموذج |
| `SEED_ADMIN_*` | — | بيانات حساب المدير الأول عند التعبئة |
| `RUN_SEED` | — | `true` لتعبئة القاعدة تلقائيًا في أول نشر، ثم **احذفيه** |

**التكاملات كلها معطّلة افتراضيًا.** لا يُحمَّل أي سكربت طرف ثالث ما لم يُدخَل معرّف صالح.

---

## بنية المشروع

```
prisma/
├── schema.prisma          نماذج البيانات
├── migrations/            هجرات SQL
├── seed.ts                سكربت التعبئة
└── seed-data/             المحتوى التحريري الأولي

src/
├── app/
│   ├── (site)/            الموقع العام
│   ├── admin/             لوحة التحكم
│   ├── actions/           Server Actions
│   ├── api/               Route Handlers
│   └── sitemap.ts robots.ts rss.xml/
├── components/            مكوّنات قابلة لإعادة الاستخدام
├── features/archive/      منطق صفحات الأرشيف
├── lib/                   المنطق المشترك (auth, queries, seo, markdown …)
├── config/                ثوابت الموقع
└── middleware.ts          حاجز /admin
```

---

## كتابة المحتوى

المقالات تُكتب بـ Markdown داخل المحرّر. المدعوم:

- عناوين `##` و `###` (يُولَّد منها فهرس المحتويات تلقائيًا)
- قوائم، جداول، اقتباسات، نصّ عريض ومائل
- روابط داخلية `[نص](/article/slug)` وخارجية (تُضاف لها `rel` آمنة تلقائيًا)
- صور `![وصف](/مسار.jpg)`
- صناديق تنبيه:

```markdown
:::tip[عنوان اختياري]
نصّ النصيحة.
:::

:::note
ملاحظة.
:::

:::warning
تنبيه.
:::
```

**لا تستخدمي `#` داخل المحتوى** — عنوان المقال هو H1 الوحيد في الصفحة، وفحص السيو
داخل المحرّر يرفض ذلك.

---

## النشر على Vercel + Supabase

الهجرات والتعبئة تعمل **تلقائيًا** داخل بناء Vercel عبر سكربت `vercel-build`،
فلا تحتاجين تشغيل أي أمر في الطرفية.

### ١. قاعدة البيانات (Supabase)

1. من [supabase.com](https://supabase.com) ← **New project**
2. اكتبي اسم المشروع، و**كلمة مرور قاعدة البيانات** — احفظيها، ستحتاجينها في الخطوة ٣
3. اختاري المنطقة الأقرب لجمهورك
4. انتظري نحو دقيقة حتى يجهز

ثم اضغطي **Connect** أعلى الصفحة، وانسخي **رابطين مختلفين**:

| المتغيّر | أي رابط تنسخين | المنفذ |
|---|---|---|
| `DATABASE_URL` | **Transaction pooler** | `6543` |
| `DIRECT_URL` | **Session pooler** | `5432` |

وأضيفي إلى نهاية `DATABASE_URL` فقط:

```
?pgbouncer=true&connection_limit=1
```

**لماذا رابطان؟** الدوال بلا خوادم تفتح اتصالًا لكل طلب، فتستنفد حدّ اتصالات
القاعدة بسرعة — لذا التشغيل عبر المجمّع. لكن المجمّع بنمط transaction لا يدعم
عبارات DDL، فتفشل الهجرات عبره — لذا الهجرات عبر اتصال مستقل.

> يفضّل **Session pooler** لـ `DIRECT_URL` على الاتصال المباشر، لأن الأخير قد
> يكون IPv6 فقط وهو ما لا يصله Vercel دائمًا.

### ٢. استيراد المشروع في Vercel

من [vercel.com/new](https://vercel.com/new) اختاري المستودع، ثم:

| الإعداد | القيمة |
|---|---|
| Framework Preset | Next.js (يُكتشف تلقائيًا) |
| **Root Directory** | `jamalik` — إن كان المشروع داخل مجلد فرعي |
| **Production Branch** | `main` |
| Build Command | اتركيه فارغًا — Vercel يستخدم `vercel-build` تلقائيًا |

### ٣. متغيّرات البيئة

أضيفيها قبل الضغط على Deploy:

| المتغيّر | القيمة |
|---|---|
| `DATABASE_URL` | رابط Transaction pooler + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | رابط Session pooler |
| `AUTH_SECRET` | ولّديه: `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | `https://اسم-المشروع.vercel.app` (بلا شرطة في النهاية) |
| `SEED_ADMIN_EMAIL` | بريدك |
| `SEED_ADMIN_PASSWORD` | كلمة مرور قوية (١٢ حرفًا على الأقل، حرف كبير وصغير ورقم) |
| `SEED_ADMIN_NAME` | اسمك |
| `RUN_SEED` | `true` — **لهذا النشر فقط** |

اضغطي **Deploy**. سيُنشئ البناء الجداول ويُعبّئها بالمقالات الثمانية والثلاثين ويُنزّل صورها.

### ٤. بعد نجاح أول نشر

1. **احذفي متغيّر `RUN_SEED`** من إعدادات Vercel.
   التعبئة تعيد كتابة محتوى المقالات، فلو بقيت مفعّلة لأُلغيت تعديلاتك
   التحريرية عند كل إعادة بناء.
2. سجّلي الدخول إلى `/admin` وغيّري كلمة المرور من `/admin/account`.
3. أدخلي معرّف Google Analytics وقيمة تحقّق Search Console من **الإعدادات**.
4. عند إضافة نطاق مخصّص: حدّثي `NEXT_PUBLIC_SITE_URL` وأعيدي النشر —
   القيمة تُخبز في روابط canonical و sitemap، فلا تتحدّث وحدها.

### استكشاف الأخطاء

| العطل | السبب المرجّح |
|---|---|
| فشل الهجرات في البناء | `DIRECT_URL` يشير إلى Transaction pooler بدل Session pooler |
| `Timed out fetching a new connection` أثناء التعبئة | `DIRECT_URL` غير مضبوط، فرجعت التعبئة إلى المجمّع المحدود بـ `connection_limit=1` |
| `Too many connections` وقت التشغيل | `DATABASE_URL` بلا `?pgbouncer=true&connection_limit=1` |
| روابط canonical خاطئة | `NEXT_PUBLIC_SITE_URL` غير مضبوط أو بشرطة في نهايته |
| لا يمكن تسجيل الدخول | التعبئة لم تعمل — راجعي سجلّ البناء وتأكّدي من `SEED_ADMIN_*` |

قائمة ما قبل النشر الكاملة في نهاية [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md).

---

## تنويه

المحتوى المنشور في هذا المشروع تحريري وتثقيفي، ولا يُقصد به تشخيص أو علاج أي حالة.
المشروع **مجهّز تقنيًا** للربط مع Google AdSense، لكن القبول في البرنامج قرار من Google
بعد مراجعة المحتوى والسياسات — ولا يقدّم هذا المشروع أي ادّعاء بالقبول.
