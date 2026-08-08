import { z } from "zod";
import { incrementViewCount } from "@/lib/queries/articles";
import { getClientIp, isSameOrigin, rateLimit } from "@/lib/rate-limit";
import { isValidSlug } from "@/lib/slug";

/** يجب ألا يُخزَّن هذا المسار مؤقتًا — كل استدعاء يمثّل قراءة جديدة. */
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().trim().min(1).max(96).refine(isValidSlug),
});

/**
 * زيادة عدّاد قراءات المقال.
 *
 * العدّاد إرشادي لترتيب «الأكثر قراءة» وليس مقياسًا تحليليًا دقيقًا —
 * القياس الفعلي مهمة GA4. لذلك نكتفي بحماية بسيطة: التحقّق من الأصل،
 * وحدّ أعلى لعدد الزيادات من نفس الاتصال.
 */
export async function POST(request: Request) {
  if (!(await isSameOrigin())) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const ip = await getClientIp();
  const limited = rateLimit(`view:${ip}`, 60, 60 * 1000);
  if (!limited.ok) {
    return Response.json(
      { ok: false },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await incrementViewCount(parsed.data.slug);

  return Response.json({ ok: true });
}
