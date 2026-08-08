import type { Metadata } from "next";
import { TagArchive, tagArchiveMetadata } from "@/features/archive/tag-archive";
import { getUsedTags } from "@/lib/queries/taxonomy";

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tags = await getUsedTags(200).catch(() => []);
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return tagArchiveMetadata(slug, 1);
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  return <TagArchive slug={slug} page={1} />;
}
