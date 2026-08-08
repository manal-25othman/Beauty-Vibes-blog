import type { Metadata } from "next";
import {
  CategoryArchive,
  categoryArchiveMetadata,
} from "@/features/archive/category-archive";
import { getActiveCategories } from "@/lib/queries/taxonomy";

export const revalidate = 300;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getActiveCategories().catch(() => []);
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return categoryArchiveMetadata(slug, 1);
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryArchive slug={slug} page={1} />;
}
