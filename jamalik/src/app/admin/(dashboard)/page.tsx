import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { publishedWhere } from "@/lib/queries/articles";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getSettings, isAdsEnabled, isAnalyticsEnabled } from "@/lib/settings";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboardPage() {
  const [
    settings,
    totalArticles,
    publishedCount,
    draftCount,
    scheduledCount,
    categoryCount,
    authorCount,
    subscriberCount,
    unreadMessages,
    mostViewed,
    recent,
    missingMeta,
    missingAlt,
    missingKeyword,
    noIndexed,
  ] = await Promise.all([
    getSettings(),
    prisma.article.count(),
    prisma.article.count({ where: publishedWhere() }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({
      where: { status: "SCHEDULED", publishedAt: { gt: new Date() } },
    }),
    prisma.category.count(),
    prisma.author.count(),
    prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.article.findMany({
      where: publishedWhere(),
      select: { id: true, title: true, slug: true, viewCount: true },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.article.count({
      where: { OR: [{ metaDescription: null }, { metaDescription: "" }] },
    }),
    prisma.article.count({
      where: { OR: [{ featuredImageAlt: null }, { featuredImageAlt: "" }] },
    }),
    prisma.article.count({
      where: { OR: [{ focusKeyword: null }, { focusKeyword: "" }] },
    }),
    prisma.article.count({ where: { noIndex: true } }),
  ]);

  const stats = [
    { label: "إجمالي المقالات", value: totalArticles, href: "/admin/articles" },
    {
      label: "منشورة",
      value: publishedCount,
      href: "/admin/articles?status=PUBLISHED",
    },
    { label: "مسودّات", value: draftCount, href: "/admin/articles?status=DRAFT" },
    {
      label: "مجدولة",
      value: scheduledCount,
      href: "/admin/articles?status=SCHEDULED",
    },
    { label: "التصنيفات", value: categoryCount, href: "/admin/categories" },
    { label: "الكتّاب", value: authorCount, href: "/admin/authors" },
    { label: "المشتركون", value: subscriberCount, href: "/admin/subscribers" },
    { label: "رسائل جديدة", value: unreadMessages, href: "/admin/messages" },
  ];

  const seoIssues = [
    { label: "مقالات بلا وصف ميتا", value: missingMeta },
    { label: "مقالات بلا نص بديل للصورة", value: missingAlt },
    { label: "مقالات بلا كلمة مفتاحية", value: missingKeyword },
    { label: "مقالات ممنوعة من الفهرسة", value: noIndexed, neutral: true },
  ];

  const integrations = [
    {
      label: "Google Analytics 4",
      active: isAnalyticsEnabled(settings),
      detail: isAnalyticsEnabled(settings)
        ? settings.gaMeasurementId
        : "غير مضبوط — لا يُحمَّل أي سكربت قياس",
    },
    {
      label: "Google Search Console",
      active: Boolean(settings.googleSiteVerification),
      detail: settings.googleSiteVerification
        ? "وسم التحقق مضاف في <head>"
        : "لم تُدخَل قيمة التحقق",
    },
    {
      label: "Google AdSense",
      active: isAdsEnabled(settings),
      detail: isAdsEnabled(settings)
        ? settings.adsensePublisherId
        : "غير مضبوط — لا تُعرض إعلانات ولا تُحمَّل سكربتاتها",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            لوحة المعلومات
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            نظرة سريعة على حالة المحتوى والتكاملات.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + مقال جديد
        </Link>
      </header>

      {/* الأرقام */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          إحصاءات عامة
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent"
              >
                <p className="text-xs text-ink-faint">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {formatNumber(stat.value)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* الأكثر قراءة */}
        <section
          aria-labelledby="most-viewed-heading"
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <h2
            id="most-viewed-heading"
            className="font-display text-base font-bold text-ink"
          >
            الأكثر قراءة
          </h2>

          {mostViewed.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">لا توجد بيانات بعد.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {mostViewed.map((article, index) => (
                <li key={article.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-bold text-line-strong"
                  >
                    {formatNumber(index + 1)}
                  </span>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="min-w-0 flex-1 text-sm text-ink transition-colors hover:text-accent"
                  >
                    {article.title}
                  </Link>
                  <span className="shrink-0 text-xs tabular-nums text-ink-faint">
                    {formatNumber(article.viewCount)}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-4 border-t border-line pt-3 text-[0.7rem] text-ink-faint">
            عدّاد داخلي إرشادي. القياس الدقيق للزيارات من تقارير Google Analytics.
          </p>
        </section>

        {/* آخر التعديلات */}
        <section
          aria-labelledby="recent-heading"
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <h2 id="recent-heading" className="font-display text-base font-bold text-ink">
            آخر ما عُدِّل
          </h2>

          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">لا توجد مقالات بعد.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recent.map((article) => (
                <li key={article.id} className="flex items-start gap-3">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="min-w-0 flex-1 text-sm text-ink transition-colors hover:text-accent"
                  >
                    {article.title}
                    <span className="block text-xs text-ink-faint">
                      {formatDateTime(article.updatedAt)}
                    </span>
                  </Link>
                  <StatusBadge
                    status={article.status}
                    publishedAt={article.publishedAt}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* حالة السيو */}
        <section
          aria-labelledby="seo-status-heading"
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <h2
            id="seo-status-heading"
            className="font-display text-base font-bold text-ink"
          >
            حالة السيو
          </h2>

          <ul className="mt-4 space-y-2.5">
            {seoIssues.map((issue) => (
              <li
                key={issue.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-ink-soft">{issue.label}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    issue.value === 0 || issue.neutral
                      ? "bg-surface-soft text-ink-muted"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {formatNumber(issue.value)}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/admin/articles"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
          >
            مراجعة المقالات ←
          </Link>
        </section>

        {/* التكاملات */}
        <section
          aria-labelledby="integrations-heading"
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <h2
            id="integrations-heading"
            className="font-display text-base font-bold text-ink"
          >
            التكاملات
          </h2>

          <ul className="mt-4 space-y-3">
            {integrations.map((integration) => (
              <li key={integration.label} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1 size-2 shrink-0 rounded-full ${
                    integration.active ? "bg-success" : "bg-line-strong"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {integration.label}
                    <span className="sr-only">
                      {integration.active ? " — مفعّل" : " — غير مفعّل"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-ink-faint" dir="auto">
                    {integration.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/admin/settings"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
          >
            ضبط التكاملات ←
          </Link>
        </section>
      </div>
    </div>
  );
}
