# جمالِك — مجلة الجمال والعناية العربية

مجلة رقمية عربية (RTL) متخصصة في العناية بالبشرة والشعر والمكياج والعطور، مبنية
بـ Next.js وTypeScript وPostgreSQL، مع لوحة تحكم كاملة وتهيئة حقيقية لمحركات البحث.

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

# 4. تعبئة المحتوى الأولي (١٥ مقالًا + تصنيفات + كتّاب + حساب المدير)
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
| `npm start` | تشغيل نسخة الإنتاج |
| `npm run lint` | ESLint |
| `npm run typecheck` | فحص الأنواع دون إخراج |
| `npm run db:migrate` | إنشاء وتطبيق هجرة (تطوير) |
| `npm run db:deploy` | تطبيق الهجرات (إنتاج) |
| `npm run db:seed` | تعبئة البيانات الأولية (idempotent) |
| `npm run db:studio` | واجهة Prisma Studio |
| `npm run placeholders` | إعادة توليد الصور النائبة |
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
| `DATABASE_URL` | ✅ | رابط اتصال PostgreSQL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | العنوان العام — يؤثّر على canonical و sitemap و OG |
| `AUTH_SECRET` | ✅ | مفتاح توقيع الجلسات (٢٤ حرفًا فأكثر) |
| `NEXT_PUBLIC_GA_ID` | — | معرّف GA4 الافتراضي (تتقدّم عليه قيمة اللوحة) |
| `GOOGLE_SITE_VERIFICATION` | — | قيمة تحقّق Search Console الافتراضية |
| `ADSENSE_PUBLISHER_ID` | — | معرّف ناشر AdSense الافتراضي |
| `EMAIL_PROVIDER` | — | `none` \| `mailchimp` \| `brevo` \| `convertkit` |
| `EMAIL_PROVIDER_API_KEY` | — | مفتاح مزوّد النشرة |
| `EMAIL_PROVIDER_LIST_ID` | — | معرّف القائمة/الجمهور/النموذج |
| `SEED_ADMIN_*` | — | بيانات حساب المدير الأول عند التعبئة |

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

## النشر

1. جهّزي قاعدة PostgreSQL وضعي `DATABASE_URL`.
2. اضبطي `NEXT_PUBLIC_SITE_URL` و `AUTH_SECRET`.
3. `npm run db:deploy` ثم `npm run db:seed` (مرة واحدة).
4. `npm run build && npm start`.
5. غيّري كلمة مرور المدير من `/admin/account`.

قائمة ما قبل النشر الكاملة في نهاية [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md).

---

## تنويه

المحتوى المنشور في هذا المشروع تحريري وتثقيفي، ولا يُقصد به تشخيص أو علاج أي حالة.
المشروع **مجهّز تقنيًا** للربط مع Google AdSense، لكن القبول في البرنامج قرار من Google
بعد مراجعة المحتوى والسياسات — ولا يقدّم هذا المشروع أي ادّعاء بالقبول.
