import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";

type Author = {
  name: string;
  slug: string;
  photo: string | null;
  photoAlt: string | null;
  bio: string;
  specialization: string | null;
  socialLinks: unknown;
};

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "إكس",
  instagram: "إنستغرام",
  linkedin: "لينكدإن",
  website: "الموقع الشخصي",
};

export function AuthorBox({ author }: { author: Author }) {
  const socials = normalizeSocials(author.socialLinks);

  return (
    <aside
      aria-labelledby="author-box-heading"
      className="rounded-2xl border border-line bg-surface-soft p-6"
    >
      <h2 id="author-box-heading" className="sr-only">
        عن كاتبة المقال
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link href={`/author/${author.slug}`} className="shrink-0">
          <SmartImage
            src={author.photo}
            alt={author.photoAlt || `صورة ${author.name}`}
            width={80}
            height={80}
            sizes="80px"
            className="size-20 rounded-full object-cover"
          />
        </Link>

        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink">
            <Link
              href={`/author/${author.slug}`}
              className="transition-colors hover:text-accent"
            >
              {author.name}
            </Link>
          </p>

          {author.specialization && (
            <p className="mt-0.5 text-sm text-accent">{author.specialization}</p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{author.bio}</p>

          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

/** حقل socialLinks من نوع Json، فيحتاج تحقّقًا قبل الاستخدام. */
function normalizeSocials(value: unknown): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && /^https?:\/\//i.test(entry[1]),
  );
}
