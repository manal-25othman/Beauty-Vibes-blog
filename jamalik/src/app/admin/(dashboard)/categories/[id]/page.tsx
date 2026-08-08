import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saveCategory } from "@/app/actions/admin-taxonomy";
import { CategoryForm } from "@/components/admin/category-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/categories" className="hover:text-accent">
            التصنيفات
          </Link>{" "}
          ‹ تحرير
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          {category.name}
        </h1>
      </header>

      <CategoryForm
        action={saveCategory.bind(null, category.id)}
        values={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          image: category.image ?? "",
          imageAlt: category.imageAlt ?? "",
          seoTitle: category.seoTitle ?? "",
          metaDescription: category.metaDescription ?? "",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
