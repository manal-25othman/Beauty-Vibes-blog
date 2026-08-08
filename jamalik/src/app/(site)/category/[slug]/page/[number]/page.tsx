import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryArchive,
  categoryArchiveMetadata,
  categoryArchivePageParams,
} from "@/features/archive/category-archive";

export const revalidate = 300;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string; number: string }> };

export function generateStaticParams() {
  return categoryArchivePageParams();
}

function parsePage(value: string): number {
  if (!/^\d+$/.test(value)) notFound();
  const page = Number(value);
  if (page < 2 || page > 5000) notFound();
  return page;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, number } = await params;
  return categoryArchiveMetadata(slug, parsePage(number));
}

export default async function CategoryPaginatedPage({ params }: PageProps) {
  const { slug, number } = await params;
  return <CategoryArchive slug={slug} page={parsePage(number)} />;
}
