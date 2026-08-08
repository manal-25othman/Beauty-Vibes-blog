import Link from "next/link";
import { saveCategory } from "@/app/actions/admin-taxonomy";
import {
  CategoryForm,
  emptyCategoryValues,
} from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/categories" className="hover:text-accent">
            التصنيفات
          </Link>{" "}
          ‹ تصنيف جديد
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          تصنيف جديد
        </h1>
      </header>

      <CategoryForm
        action={saveCategory.bind(null, null)}
        values={emptyCategoryValues}
        submitLabel="إنشاء التصنيف"
      />
    </div>
  );
}
