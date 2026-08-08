import Image from "next/image";

type Props = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** فقط للصور الظاهرة في الشاشة الأولى — يمنع تأخير LCP. */
  priority?: boolean;
  sizes?: string;
};

const FALLBACK = "/images/covers/default.svg";

/**
 * غلاف حول next/image.
 *
 * الصور المحلية تمرّ عبر مُحسِّن Next، أما الروابط الخارجية التي قد يُدخلها
 * المحرّر فتُعرض كوسم img عادي: تمريرها إلى المُحسِّن يتطلّب السماح بنطاقات
 * عشوائية، وهو ما نتجنّبه عمدًا.
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes,
}: Props) {
  const source = src?.trim() || FALLBACK;
  const isRemote = /^https?:\/\//i.test(source);

  if (isRemote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={source}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      className={className}
    />
  );
}
