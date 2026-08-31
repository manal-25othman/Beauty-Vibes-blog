# تقرير نقل المحتوى من Blogger

نقل مدونة **Beauty Vibes** (`mushattcareforhair.blogspot.com`) إلى هذا المشروع.

المصدر: `scripts/blogger/blogger-export.atom` — تصدير Google Takeout الرسمي.
النقل قابل لإعادة التشغيل بالكامل: `npm run blogger:convert`.

---

## ١. الحصيلة

| البند | العدد |
|---|---|
| مدخلات في التصدير | ٤٤ |
| منشورات (POST) | ٣٩ |
| **منشورات منقولة** | **٣٨** |
| منشور محذوف (SOFT_TRASHED) لم يُنقل | ١ |
| صفحات ثابتة (PAGE) | ٥ — وُجِّهت لصفحات المشروع |
| تعليقات في التصدير | **صفر** |
| صور مقالات | ٣٨ |
| روابط داخلية أُعيدت كتابتها | ٩٨ |
| تحويلات ٣٠١ | ٤٤ |

### ما لم يُنقل ولماذا

| العنصر | السبب |
|---|---|
| «لماذا يجب أن يكون الليمون رفيقك الدائم ؟» | حالته `SOFT_TRASHED` في المصدر — نسخة مكرّرة من مقال منشور. الرابط يُوجَّه إلى الأصل. |
| الصفحات الخمس الثابتة | المشروع يحوي صفحاته الخاصة (من نحن، الخصوصية، الشروط، إخلاء المسؤولية، اتصل بنا). نُقلت روابطها لا نصوصها. |
| التعليقات | لا يوجد أي تعليق في التصدير. |
| تاريخ آخر تعديل | عمود `updatedAt` يديره Prisma آليًا. التاريخ الأصلي محفوظ في بيانات البذور للتوثيق. |
| ملفات الصور | تُنزَّل داخل بناء Vercel (بيئة التطوير هذه محجوبة عن الإنترنت). |

---

## ٢. توزيع التصنيفات

وسوم المصدر ١٧ وسمًا متداخلًا («صحة» و«جمال و صحة» و«الصحة و الجمال» ثلاثة أسماء
لمعنى واحد). جُمعت في سبعة أقسام لكلٍّ منها محتوى فعلي، **والوسوم الأصلية محفوظة
كما هي على كل مقال** فلا يضيع تصنيف الكاتبة.

| التصنيف | الرابط | مقالات |
|---|---|---|
| الجمال الطبيعي | `natural-beauty` | 10 |
| الصحة والتغذية | `health-nutrition` | 8 |
| العناية بالشعر | `hair-care` | 7 |
| العناية بالبشرة | `skin-care` | 5 |
| العناية بالجسم | `body-care` | 3 |
| صحة المرأة | `womens-health` | 3 |
| منتجات التجميل | `beauty-products` | 2 |

المطابقة كاملة في `scripts/blogger/mapping.ts`، وتُعدَّل أي نسبة مقال من لوحة التحكم بنقرة.

---

## ٣. خريطة التحويلات (القديم ← الجديد)

تعمل عبر `redirects()` في `next.config.ts` برمز **301** صريح.

| الرابط القديم | الرابط الجديد | المقال |
|---|---|---|
| `/2026/05/blog-post_870.html` | `/article/sr-mn-asrar-aljmal-altbyay-alsdr-ma-maa-alwrd` | سر من أسرار الجمال الطبيعي : السدر مع ماء الو |
| `/2026/06/blog-post.html` | `/article/awraq-aljwafh-ltqwyh-almnaah` | أوراق الجوافة لتقوية المناعة |
| `/2026/05/blog-post_27.html` | `/article/alshbh-kmzyl-arq-tbyay-w-amn` | الشبة كمزيل عرق طبيعي و آمن |
| `/2026/07/blog-post.html` | `/article/tyn-albhr-almyt-sr-altbyah-lbshrh-shyh-wjsm-akthr-antaasha` | طين البحر الميت: سر الطبيعة لبشرة صحية وجسم أ |
| `/2026/07/blog-post_19.html` | `/article/aktshfy-fwaed-maa-alarz-llshar-wtryqh-thdyrh-wastkhdamh-alsh` | اكتشفي فوائد ماء الأرز للشعر، وطريقة تحضيره و |
| `/2026/04/blog-post.html` | `/article/tjrbh-alzbady-ma-almshat` | تجربة الزبادي مع المشاط |
| `/2026/05/blog-post_12.html` | `/article/krym-shar-shya-mwystshr-alazrq-basl-almanwka-w-alzbady` | كريم شعر شيا مويستشر الازرق بعسل المانوكا و ا |
| `/2026/06/blog-post_18.html` | `/article/lmadha-yjb-an-ykwn-allymwn-rfyqk-aldaem` | لماذا يجب ان يكون الليمون رفيقك الدائم ؟ |
| `/2026/05/blog-post_705.html` | `/article/afdl-mzlq-tbyay-zyt-jwz-alhnd-aladwy-albkr` | أفضل مزلق طبيعي زيت جوز الهند العضوي البكر |
| `/2026/08/blog-post.html` | `/article/tryqh-istkhdam-zyt-alarjan-almghrby` | طريقة إستخدام زيت الأرجان المغربي |
| `/2026/06/blog-post_25.html` | `/article/aktshf-fwaed-jl-alalwfyra-alsbar-llbshrh-walshar-wkyf-ysaad` | 🌿 اكتشف فوائد جل الألوفيرا (الصبار) للبشرة و |
| `/2026/05/blog-post_613.html` | `/article/faedh-alhnaa-llshar` | فائدة الحناء للشعر |
| `/2026/08/blog-post_08.html` | `/article/fwaed-almrh-wastkhdamatha-llbshrh-walshar-walanayh-baljsm` | فوائد المَرّة واستخداماتها للبشرة والشعر والع |
| `/2026/05/why-avocado-is-good-for-hair.html` | `/article/why-avocado-is-good-for-hair` | Why Avocado Is Good for Hair |
| `/2026/08/blog-post_13.html` | `/article/bdhwr-almash-fwaedha-alshyh-wtryqh-astkhdamha-wahm-adrarha` | بذور الماش: فوائدها الصحية وطريقة استخدامها و |
| `/2026/05/blog-post_23.html` | `/article/lban-aldhkr-llshh-w-aljmal` | لبان الذكر للصحة و الجمال |
| `/2026/07/blog-post_23.html` | `/article/almlh-kmthr-aam-ala-hw-faal-hqa-fwaedh-w-astkhdamath-alshyhh` | الملح كمطهر عام: على هو فعال حقا؟ فوائده و اس |
| `/2026/05/blog-post_128.html` | `/article/abrz-fwaed-alqrfh-lmrda-alskry` | أبرز فوائد القرفة لمرضى السكري |
| `/2026/05/blog-post.html` | `/article/kyf-mfawl-krym-kynya-ma-zyt-alwrd-yaml-kalshr-ltbyyd-almnatq` | كيف مفعول كريم كينيا مع زيت الورد يعمل كالسحر |
| `/2026/05/blog-post_26.html` | `/article/alasl-kalaj-tbyay-ljrthwmh-almadh` | العسل كعلاج طبيعي لجرثومة المعدة |
| `/2026/05/fenugreek-natural-secret-for-health-and.html` | `/article/fenugreek-a-natural-secret-for-health-and-beauty` | Fenugreek: A Natural Secret for Health and Be |
| `/2026/05/blog-post_14.html` | `/article/aldlkh-alswdanyh-sr-shbab-bshrh-alswdanyat` | الدلكة السودانية سر شباب بشرة السودانيات🪵 |
| `/2026/05/blog-post_13.html` | `/article/fwaed-awmygha-llnsaa-sr-alshh-w-aljmal-altbyay` | فوائد أوميغا ٣ للنساء: سر الصحة و الجمال الطب |
| `/2026/06/blog-post_13.html` | `/article/wsfat-alarqsws-altbyayh` | وصفات العرقسوس الطبيعية |
| `/2026/07/blog-post_322.html` | `/article/afdl-zyt-lttwyl-alhwajb-w-alrmwsh` | أفضل زيت لتطويل الحواجب و الرموش |
| `/2026/05/blog-post_21.html` | `/article/albabaya-alfakhh-alghnyh-balfytamynat-walanasr-almhmh` | البابايا الفاكهة الغنية بالفيتامينات والعناصر |
| `/2026/05/blog-post_19.html` | `/article/zbdh-alshya-llshar-w-aljsm` | زبدة الشيا للشعر و الجسم |
| `/2026/07/blog-post_21.html` | `/article/afdl-alzywt-lttwyl-alshar-wtkthyfh-dlyl-shaml-llhswl-ala-sha` | 🌿 أفضل الزيوت لتطويل الشعر وتكثيفه — دليل شا |
| `/2026/04/blog-post_24.html` | `/article/dlyl-shaml-lastkhdamat-alfazlyn-fy-alanayh-balbshrh-walshar` | دليل شامل لاستخدامات الفازلين في العناية بالب |
| `/2026/05/henna-in-arab-traditional-beauty.html` | `/article/henna-in-arab-traditional-beauty` | Henna in Arab traditional beauty |
| `/2026/08/blog-post_29.html` | `/article/khl-altfah-fwaedh-wastkhdamath-wadrarh-wafdl-tryqh-lastkhdam` | خل التفاح: فوائده واستخداماته وأضراره وأفضل ط |
| `/2026/05/blog-post_380.html` | `/article/alfrq-byn-alkwlajyn-albqry-w-albhry` | الفرق بين الكولاجين البقري و البحري |
| `/2026/05/blog-post_25.html` | `/article/ashhr-sabwn-tqlydy-wtbyay-ala-alitlaq` | أشهر صابون تقليدي وطبيعي على الإطلاق |
| `/2026/07/blog-post_27.html` | `/article/zyt-alqtran-llshar-alfwaed-w-aladrar-wtryqh-alastkhdam` | زيت القطران للشعر ، الفوائد و الأضرار، وطريقة |
| `/2026/05/blog-post_17.html` | `/article/fwaed-zyt-alwrd-llbshrh-w-alshar` | فوائد زيت الورد للبشرة و الشعر |
| `/2026/05/blog-post_30.html` | `/article/qshwr-alrman-almjffh-tryqh-alastkhdam` | قشور الرمان المجففة طريقة الاستخدام |
| `/2026/07/blog-post_09.html` | `/article/fwaed-zyt-alkhrwa-llrmwsh-alastkhdam-alshyh-wahm-alfwaed-wal` | فوائد زيت الخروع للرموش: الاستخدام الصحيح وأه |
| `/2026/07/blog-post_07.html` | `/article/fwaed-zyt-iklyl-aljbl-llshar-alastkhdam-alshyh-wahm-alfwaed` | فوائد زيت إكليل الجبل للشعر: الاستخدام الصحيح |
| `/p/blog-page.html` | `/about` | صفحة ثابتة |
| `/p/blog-page_25.html` | `/privacy-policy` | صفحة ثابتة |
| `/p/blog-page_21.html` | `/terms` | صفحة ثابتة |
| `/p/blog-page_23.html` | `/disclaimer` | صفحة ثابتة |
| `/p/0508517675-redgalaxy70gmail.html` | `/contact` | صفحة ثابتة |
| `/2026/06/blog-post_346.html` | `/article/lmadha-yjb-an-ykwn-allymwn-rfyqk-aldaem` | نسخة مكرّرة محذوفة |

---

## ٤. تقرير الأصول والروابط

| الفحص | النتيجة |
|---|---|
| روابط داخلية فريدة في المتون | ٣١ |
| **روابط مكسورة** | **صفر** |
| روابط تشير إلى المدونة القديمة بعد النقل | صفر (أُعيدت كتابة ٩٨ رابطًا) |
| مقالات بلا صورة غلاف | صفر |
| مقالات بلا وصف ميتا | صفر |
| صور بانتظار التنزيل | ٣٨ — عند أول بناء على Vercel |

**الصور — مسارها بالكامل:**

كل صورة تشير إلى `‎/images/blog/<slug>-N.<ext>`، وسجلّها في
`scripts/blogger/images.json` (متتبَّع في Git عمدًا، فالبناء يقرأه).

١. **مهمة GitHub** (`.github/workflows/archive-blog-images.yml`) نفّذت ذلك فعلًا:
   **٣٨/٣٨ صورة، ٦٠.٥ ميغابايت، بلا إخفاق** — وأُودعت في المستودع بالالتزام
   `17a8a5a`. الصور الآن ملك المشروع، فإيقاف المدونة الأصلية لا يضرّها.
٢. **بناء Vercel** يشغّل `scripts/fetch-blogger-images.mjs` كشبكة أمان: يتخطّى
   الموجود ويُنزّل الناقص — فلا يفعل شيئًا الآن لأن الأرشيف مكتمل.

حجم الصور في المستودع ٦٠ ميغابايت، لكنّه لا يصل القارئة: Next يحوّلها عند
الطلب. صورة بحجم ٢ ميغابايت تصل الجهاز **٣١ كيلوبايت** بصيغة AVIF — قياسٌ مأخوذ
لا تقدير.

المُنزِّل يعيد المحاولة ثلاث مرات بتباعد متزايد، ويرفض ما ليس صورة (صفحة خطأ
بترويسة ٢٠٠) وما حجمه مريب، وينزّل ستّ صور بالتوازي. فشل صورة يُطبع تحذيرًا
ولا يُفشل النشر.

> اختُبر السكربت على خادم محلي يحاكي: نجاحًا، وفشلًا عابرًا يتعافى بالإعادة،
> وصفحة HTML بترويسة ٢٠٠، وملفًا مبتورًا، و٤٠٤ — وتصرّف في الخمس كما ينبغي.

---

## ٥. السيو

| البند | الحالة |
|---|---|
| أوصاف الميتا | ✅ ٣٨/٣٨ منقولة من `blogger:metaDescription` |
| تواريخ النشر الأصلية | ✅ منقولة |
| تحويلات ٣٠١ | ✅ ٤٤ |
| الروابط الداخلية | ✅ ٩٨ أُعيدت كتابتها إلى مسارات داخلية |
| canonical | ✅ ذاتي على الرابط الجديد — لا يُشار إلى Blogger كي لا يُنسب المحتوى إليه |
| بيانات BlogPosting المنظّمة | ✅ تعمل كما كانت |
| خريطة الموقع | ✅ ٧٥ رابطًا: ٣٨ مقالًا + ٧ تصنيفات + ١٥ وسمًا + كاتبة + الصفحات |
| `focusKeyword` و`seoTitle` | ⚠️ فارغة — لا توجد في مصدر Blogger، ولم تُختلق. تُملأ من المحرّر. |

### خطوة مطلوبة منك على Blogger

التحويلات تعمل على الموقع الجديد. لكن `blogspot.com` سيظلّ يخدم النسخة القديمة
ما لم يُوقَف، فيرى Google محتوى مكرّرًا. بعد ربط النطاق النهائي:
**Blogger ← الإعدادات ← إعادة التوجيه المخصّصة** أو إيقاف نشر المدونة.

---

## ٦. مطابقة النصّ للأصل

`scripts/blogger/verify.py` يجرّد HTML المصدر وMarkdown الناتج إلى كلمات ويقارنهما.

```
مقالات مفحوصة: ٣٨
كلمات ناقصة: ٢     ← أداة الفحص نفسها: رابط في المصدر قسَم كلمة «أوراق»
كلمات زائدة: ١        فأعاد التحويل وصلها. لا فقد في المحتوى.
```

**نصّ الكاتبة منقول حرفيًا.** ما تغيّر هو التمثيل لا المحتوى:

| في المصدر | في المشروع | لماذا |
|---|---|---|
| عنوان قسم بخطّ عريض أو ملوّن | `## عنوان` | بلا وسم عنوان لا فهرس محتويات ولا بنية للزاحف |
| بند مرقّم في فقرة | `### 1. …` | يحفظ التسلسل ويدخل الفهرس |
| فقرات تبدأ بـ `*` | قائمة `-` | القائمة اليدوية تخرج نجومًا مهرّبة في المحرّر |
| أسطر مفصولة بـ `<br>` | فقرات | يطابق ما كان يراه القارئ |
| أول صورة داخل المتن | صورة الغلاف | التصميم يعرضها في الرأس؛ إبقاؤها يكرّرها |
| رموز الكاتبة (🔹 ✅ 🌿) | كما هي | زينة اختارتها، لا تُمسّ |

---

## ٧. المحتوى التجريبي المحذوف

| العنصر | العدد |
|---|---|
| مقالات تجريبية | ١٥ |
| كاتبات وهميات | ٤ |
| تصنيفات بلا محتوى | ٥ |
| وسوم يتيمة | ٥٧ |

الحذف بقوائم صريحة في `prisma/seed.ts` — لا يُحذف شيء بالاستنتاج، فلا يمسّ مقالًا
تكتبه المحرّرة لاحقًا. والتصنيفات والكتّاب لا تُحذف إلا بعد التأكّد من خلوّها من مقال.

---

## ٨. اختبار الانحدار

```
npm run test:e2e   →   ٣٠/٣٠ ناجح
npm run build      →   ٨٤ صفحة ساكنة
npx tsc --noEmit   →   بلا أخطاء
npx eslint         →   بلا أخطاء
```

كل الميزات القائمة تعمل: التجاوب على سبعة عروض · بنية الصفحة والوصولية · فهرس
المحتويات · صناديق التنبيه · القوائم والبحث · النشرة ونموذج التواصل · المصادقة ·
دورة إنشاء المقال وحذفه · فحص السيو الحيّ · الإعدادات والتكاملات.

**لم تُحذف ولم تُبدَّل أي ميزة.**

---

## ٩. تنبيهات على المحتوى — للمراجعة التحريرية

- عنوان طويل (146 حرفًا): «اكتشفي فوائد ماء الأرز للشعر، وطريقة تحضيره واستخدامه ا…»
- عنوان طويل (123 حرفًا): «🌿 اكتشف فوائد جل الألوفيرا (الصبار) للبشرة والشعر، وكي…»
- بلا وسم: «Fenugreek: A Natural Secret for Health and Beauty»
- عنوان طويل (122 حرفًا): «دليل شامل لاستخدامات الفازلين في العناية بالبشرة والشعر…»
- بلا وسم: «Henna in Arab traditional beauty»

**ثلاثة عناوين هي في الحقيقة أوصاف** (١٢٢–١٤٦ حرفًا): مقالات ماء الأرز والألوفيرا
والفازلين. نُقلت كما هي — لا يُعاد صوغ نصّ الكاتبة — لكن عنوانًا بهذا الطول يُقتطع
في نتائج البحث. يُختصر من المحرّر متى شئت.

**ثلاثة مقالات بالإنجليزية** داخل موقع عربي: Why Avocado Is Good for Hair ·
Fenugreek · Henna in Arab traditional beauty.

**محتوى صحّي حسّاس**: مقالات عن السكري وجرثومة المعدة والعلاقة الزوجية. نُقلت
كما هي، وتستحق مراجعة أمام سياسات AdSense وقواعد المحتوى الصحي.

---

## ١٠. ما وجدناه في إعدادات المدونة — قرارات لك

| الإعداد | القيمة في Blogger |
|---|---|
| اسم المدونة | Beauty Vibes |
| Google Analytics | `G-65DQDFBC8W` |
| AdSense | `pub-2306024604582088` — الإعلانات التلقائية مفعّلة |
| المنطقة الزمنية | Asia/Riyadh |

**لم أُدخل أيًّا منها.** إدخال معرّف GA سيدمج بيانات موقعين في خاصية واحدة،
وتفعيل AdSense على نطاق لم يُضَف بعد إلى الحساب قرار تجاري لا تقني. الحقول جاهزة
في **لوحة التحكم ← الإعدادات** متى قرّرتِ.

**واسم الموقع لم يُغيَّر** («Beauty Vibes») — الهوية البصرية خارج نطاق هذه المهمة صراحةً.

---

## ١١. الملفات المتغيّرة

| الملف | التغيير |
|---|---|
| `scripts/blogger/extract.py` | جديد — استخراج التصدير إلى JSON |
| `scripts/blogger/convert.ts` | جديد — التحويل إلى Markdown |
| `scripts/blogger/mapping.ts` | جديد — مطابقة الوسوم بالتصنيفات |
| `scripts/blogger/emit-seed.ts` | جديد — توليد ملفات البذور |
| `scripts/blogger/verify.py` | جديد — فحص مطابقة النصّ |
| `scripts/blogger/blogger-export.atom` | جديد — المصدر الأصلي |
| `scripts/fetch-blogger-images.mjs` | جديد — تنزيل الصور (إعادة محاولة + تحقّق + توازٍ) |
| `scripts/blogger/images.json` | جديد (مُولَّد، متتبَّع) — سجلّ الصور الـ٣٨ |
| `.github/workflows/archive-blog-images.yml` | جديد — أرشفة الصور داخل المستودع |
| `prisma/seed-data/articles-blogger.ts` | جديد (مُولَّد) — ٣٨ مقالًا |
| `src/config/blogger-redirects.ts` | جديد (مُولَّد) — ٤٤ تحويلًا |
| `prisma/seed-data/taxonomy.ts` | أُعيد بناؤه على المحتوى الفعلي |
| `prisma/seed-data/types.ts` | حقول `publishedAt` و`featuredImage` |
| `prisma/seed.ts` | مصدر جديد + تواريخ حقيقية + إزالة المحتوى التجريبي |
| `prisma/seed-data/articles-skin-hair.ts` | **حُذف** — محتوى تجريبي |
| `prisma/seed-data/articles-misc.ts` | **حُذف** — محتوى تجريبي |
| `next.config.ts` | تحويلات ٣٠١ |
| `scripts/generate-placeholders.mjs` | صور نائبة للتصنيفين الجديدين |
| `tests/e2e.mjs` | مسارات تُشتقّ من المحتوى الحيّ + انتظار لا يعتمد سكون الشبكة |
| `scripts/blogger/needs-seed.ts` | جديد — يقرّر إن كانت القاعدة تحتاج تعبئة |
| `scripts/vercel-seed.mjs` | تعبئة تلقائية لمرة واحدة بدل متغيّر يدوي |
| `public/images/authors/` | صورة الكاتبة الجديدة، وحذف صور الكاتبات التجريبيات |
| `package.json` | `blogger:convert` و`blogger:images` وخطوة الصور في البناء |

---

## ١٢. النشر — بلا خطوات يدوية

**لا حاجة إلى `RUN_SEED`.** التعبئة تعمل من نفسها في أول نشر، ثم تتوقّف تلقائيًا.

`scripts/blogger/needs-seed.ts` يفحص القاعدة قبل البناء ويجيب بنعم في حالتين
فقط: قاعدة فارغة، أو قاعدة ما زالت تحمل المحتوى التجريبي. وشرطه يُلغي نفسه
بنجاحه — المحتوى التجريبي يُحذف ضمن التعبئة — فلا يُعاد الشرط ولا تُكتب التعبئة
فوق تعديلات المحرّرة في أي بناء لاحق. وأي عطل في الفحص يعني «لا تعبّئ»: تخطّي
التعبئة أهون من الكتابة فوق محتوى قائم.

`RUN_SEED=true` يبقى متاحًا أمرًا صريحًا يتقدّم على الفحص.

ترتيب البناء: الهجرات ← فحص الحاجة ← التعبئة إن لزمت ← الصور (مؤرشفة، فتُتخطّى)
← بناء الصفحات.
