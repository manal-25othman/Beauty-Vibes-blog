import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TagArchive,
  tagArchiveMetadata,
  tagArchivePageParams,
} from "@/features/archive/tag-archive";

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string; number: string }> };

export function generateStaticParams() {
  return tagArchivePageParams();
}

function parsePage(value: string): number {
  if (!/^\d+$/.test(value)) notFound();
  const page = Number(value);
  if (page < 2 || page > 5000) notFound();
  return page;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, number } = await params;
  return tagArchiveMetadata(slug, parsePage(number));
}

export default async function TagPaginatedPage({ params }: PageProps) {
  const { slug, number } = await params;
  return <TagArchive slug={slug} page={parsePage(number)} />;
}
