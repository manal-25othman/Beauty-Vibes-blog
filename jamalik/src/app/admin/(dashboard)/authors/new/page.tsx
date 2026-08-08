import Link from "next/link";
import { saveAuthor } from "@/app/actions/admin-taxonomy";
import { AuthorForm, emptyAuthorValues } from "@/components/admin/author-form";

export default function NewAuthorPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/authors" className="hover:text-accent">الكتّاب</Link> ‹ كاتبة جديدة
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          كاتبة جديدة
        </h1>
      </header>

      <AuthorForm
        action={saveAuthor.bind(null, null)}
        values={emptyAuthorValues}
        submitLabel="إنشاء الملف"
      />
    </div>
  );
}
