import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saveAuthor } from "@/app/actions/admin-taxonomy";
import { AuthorForm } from "@/components/admin/author-form";

type PageProps = { params: Promise<{ id: string }> };

/** socialLinks حقل Json، فنقرأ منه المفاتيح المعروفة فقط. */
function socialValue(links: unknown, key: string): string {
  if (!links || typeof links !== "object" || Array.isArray(links)) return "";
  const value = (links as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export default async function EditAuthorPage({ params }: PageProps) {
  const { id } = await params;
  const author = await prisma.author.findUnique({ where: { id } });

  if (!author) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/authors" className="hover:text-accent">الكتّاب</Link> ‹ تحرير
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          {author.name}
        </h1>
      </header>

      <AuthorForm
        action={saveAuthor.bind(null, author.id)}
        values={{
          name: author.name,
          slug: author.slug,
          photo: author.photo ?? "",
          photoAlt: author.photoAlt ?? "",
          bio: author.bio,
          specialization: author.specialization ?? "",
          email: author.email ?? "",
          twitter: socialValue(author.socialLinks, "twitter"),
          instagram: socialValue(author.socialLinks, "instagram"),
          linkedin: socialValue(author.socialLinks, "linkedin"),
          website: socialValue(author.socialLinks, "website"),
          isActive: author.isActive,
        }}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
