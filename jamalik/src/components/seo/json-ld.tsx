type Props = {
  /** كائن JSON-LD واحد أو أكثر — تُدمج في @graph واحد. */
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

/**
 * يحقن البيانات المنظّمة في الصفحة.
 *
 * `<` يُهرَّب لأن المتصفّح ينهي وسم <script> عند أول `</script>` نصيًا،
 * حتى لو ورد داخل سلسلة JSON.
 */
export function JsonLd({ data, id }: Props) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  const json = JSON.stringify(payload).replace(/</g, "\\u003c");

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
