import type { Metadata } from "next";
import {
  ArticlesArchive,
  articlesArchiveMetadata,
} from "@/features/archive/articles-archive";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return articlesArchiveMetadata(1);
}

export default function ArticlesPage() {
  return <ArticlesArchive page={1} />;
}
