/**
 * تعبئة قاعدة البيانات بالبيانات الأولية.
 *
 * السكربت idempotent: يمكن تشغيله أكثر من مرة دون تكرار السجلات،
 * لأن كل شيء يعتمد على upsert بالـ slug.
 *
 * التشغيل: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authors, categories } from "./seed-data/taxonomy";
import { skinAndHairArticles } from "./seed-data/articles-skin-hair";
import { otherArticles } from "./seed-data/articles-misc";
import type { SeedArticle } from "./seed-data/types";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

const allArticles: SeedArticle[] = [...skinAndHairArticles, ...otherArticles];

/** نسخة مستقلة عن src/ حتى يبقى السكربت قابلًا للتشغيل بمعزل عن التطبيق. */
function estimateReadingTime(content: string): number {
  const words = content.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function slugifyTag(name: string): string {
  return slugify(name);
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "مدير الموقع";

  if (!email || !password) {
    console.warn(
      "⚠️  تخطّي إنشاء حساب المدير: عيّني SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD في .env",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD يجب ألا تقل عن ١٢ حرفًا.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // كلمة المرور تُحدَّث فقط عند الإنشاء — حتى لا يُعيد تشغيل السكربت
  // تعيين كلمة مرور المدير بعد أن يكون قد غيّرها.
  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name, role: "ADMIN" },
    update: { name, role: "ADMIN", isActive: true },
  });

  console.log(`✓ حساب المدير جاهز: ${email}`);
}

async function seedSettings() {
  const defaults: Record<string, string> = {
    siteName: "جمالِك",
    siteDescription:
      "مجلة رقمية عربية متخصصة في العناية بالبشرة والشعر والمكياج والعطور.",
    contactEmail: "",
    gaMeasurementId: "",
    googleSiteVerification: "",
    adsensePublisherId: "",
    adsenseEnabled: "true",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: {}, // لا نلمس قيمة موجودة — قد يكون المحرّر عدّلها.
    });
  }

  console.log(`✓ الإعدادات الافتراضية جاهزة (${Object.keys(defaults).length} مفتاح)`);
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: `/images/covers/${category.slug}.svg`,
        imageAlt: `صورة تصنيف ${category.name}`,
        color: category.color,
        seoTitle: category.seoTitle,
        metaDescription: category.metaDescription,
        sortOrder: category.sortOrder,
      },
      update: {
        name: category.name,
        description: category.description,
        seoTitle: category.seoTitle,
        metaDescription: category.metaDescription,
        sortOrder: category.sortOrder,
        color: category.color,
      },
    });
  }
  console.log(`✓ التصنيفات: ${categories.length}`);
}

async function seedAuthors() {
  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      create: {
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        specialization: author.specialization,
        photo: `/images/authors/${author.slug}.svg`,
        photoAlt: `صورة ${author.name}`,
        socialLinks: author.socialLinks,
        seoTitle: `${author.name} — ${author.specialization}`,
        metaDescription: author.bio.slice(0, 155),
      },
      update: {
        name: author.name,
        bio: author.bio,
        specialization: author.specialization,
        socialLinks: author.socialLinks,
      },
    });
  }
  console.log(`✓ الكتّاب: ${authors.length}`);
}

async function seedTags() {
  const names = new Set(allArticles.flatMap((article) => article.tags));

  for (const name of names) {
    await prisma.tag.upsert({
      where: { slug: slugifyTag(name) },
      create: { name, slug: slugifyTag(name) },
      update: { name },
    });
  }

  console.log(`✓ الوسوم: ${names.size}`);
}

async function seedArticles() {
  const categoryMap = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [
      c.slug,
      c.id,
    ]),
  );
  const authorMap = new Map(
    (await prisma.author.findMany({ select: { id: true, slug: true } })).map((a) => [
      a.slug,
      a.id,
    ]),
  );

  for (const article of allArticles) {
    const categoryId = categoryMap.get(article.categorySlug);
    const authorId = authorMap.get(article.authorSlug);

    if (!categoryId || !authorId) {
      throw new Error(
        `المقال "${article.slug}" يشير إلى تصنيف أو كاتب غير موجود.`,
      );
    }

    const publishedAt = new Date(Date.now() - article.daysAgo * 24 * 60 * 60 * 1000);

    const data = {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      featuredImage: `/images/covers/${article.categorySlug}.svg`,
      featuredImageAlt: article.featuredImageAlt,
      categoryId,
      authorId,
      status: "PUBLISHED" as const,
      publishedAt,
      seoTitle: article.seoTitle,
      metaDescription: article.metaDescription,
      focusKeyword: article.focusKeyword,
      secondaryKeywords: article.secondaryKeywords,
      readingTime: estimateReadingTime(article.content),
      viewCount: article.viewCount,
      isFeatured: article.isFeatured ?? false,
      isEditorPick: article.isEditorPick ?? false,
    };

    const tagConnections = article.tags.map((name) => ({ slug: slugifyTag(name) }));

    const saved = await prisma.article.upsert({
      where: { slug: article.slug },
      create: {
        ...data,
        slug: article.slug,
        tags: { connect: tagConnections },
      },
      // `set` يستبدل قائمة الوسوم كاملة، فلا تتراكم عند إعادة التشغيل.
      update: { ...data, tags: { set: tagConnections } },
    });

    // الأسئلة الشائعة تُستبدل بالكامل لتفادي التكرار عند إعادة التشغيل.
    await prisma.faqItem.deleteMany({ where: { articleId: saved.id } });
    if (article.faqs?.length) {
      await prisma.faqItem.createMany({
        data: article.faqs.map((faq, index) => ({
          articleId: saved.id,
          question: faq.question,
          answer: faq.answer,
          sortOrder: index,
        })),
      });
    }
  }

  console.log(`✓ المقالات: ${allArticles.length}`);
}

async function main() {
  console.log("بدء تعبئة قاعدة بيانات «جمالِك»…\n");

  await seedAdminUser();
  await seedSettings();
  await seedCategories();
  await seedAuthors();
  await seedTags();
  await seedArticles();

  const counts = {
    مقالات: await prisma.article.count(),
    تصنيفات: await prisma.category.count(),
    كتّاب: await prisma.author.count(),
    وسوم: await prisma.tag.count(),
    "أسئلة شائعة": await prisma.faqItem.count(),
  };

  console.log("\nالحصيلة:", counts);
  console.log("اكتملت التعبئة بنجاح.");
}

main()
  .catch((error) => {
    console.error("\n✗ فشلت التعبئة:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
