import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArticlesArchive,
  articlesArchiveMetadata,
  articlesArchivePageNumbers,
} from "@/features/archive/articles-archive";

export const revalidate = 300;
/** صفحات ترقيم جديدة تظهر بعد البناء تُولَّد عند أول طلب. */
export const dynamicParams = true;

type PageProps = { params: Promise<{ number: string }> };

export function generateStaticParams() {
  return articlesArchivePageNumbers();
}

/** يرفض أي شيء غير عدد صحيح ≥ ٢ — "/page/1" تكرار لـ "/articles". */
function parsePage(value: string): number {
  if (!/^\d+$/.test(value)) notFound();
  const page = Number(value);
  if (page < 2 || page > 5000) notFound();
  return page;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number } = await params;
  return articlesArchiveMetadata(parsePage(number));
}

export default async function ArticlesPaginatedPage({ params }: PageProps) {
  const { number } = await params;
  return <ArticlesArchive page={parsePage(number)} />;
}
