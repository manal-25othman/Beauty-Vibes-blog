import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "jamalik_session";

/**
 * حاجز مبكّر أمام لوحة التحكم.
 *
 * الـ middleware يعمل على حافة الشبكة ولا يستطيع الوصول إلى قاعدة البيانات،
 * لذلك يتحقّق من **وجود** الكوكي فقط. التحقّق الحقيقي من صلاحية الجلسة يتم
 * في كل صفحة وكل Server Action عبر requireUser — وهذه هي الحماية المعتمَدة.
 * فائدة هذه الطبقة: منع تحميل صفحات اللوحة أصلًا لمن ليس لديه جلسة.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    // من يملك جلسة لا يحتاج صفحة الدخول.
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    // نحتفظ بالوجهة الأصلية لإعادة التوجيه إليها بعد الدخول.
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  // طبقة إضافية فوق ترويسة next.config — لا تُفهرَس لوحة التحكم أبدًا.
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
