import type { ArticleCardData } from "@/lib/queries/articles";
import { ArticleCard } from "./article-card";

type Props = {
  articles: ArticleCardData[];
  columns?: 2 | 3 | 4;
  headingLevel?: "h2" | "h3";
};

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function ArticleGrid({
  articles,
  columns = 3,
  headingLevel = "h3",
}: Props) {
  if (articles.length === 0) return null;

  return (
    <ul className={`grid grid-cols-1 gap-6 ${COLUMN_CLASSES[columns]}`}>
      {articles.map((article, index) => (
        <li key={article.id} className="h-full">
          <ArticleCard
            article={article}
            index={index}
            headingLevel={headingLevel}
          />
        </li>
      ))}
    </ul>
  );
}
