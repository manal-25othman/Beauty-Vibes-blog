import type { Metadata } from "next";
import {
  AuthorArchive,
  authorArchiveMetadata,
} from "@/features/archive/author-archive";
import { getActiveAuthors } from "@/lib/queries/taxonomy";

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const authors = await getActiveAuthors().catch(() => []);
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return authorArchiveMetadata(slug, 1);
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  return <AuthorArchive slug={slug} page={1} />;
}
