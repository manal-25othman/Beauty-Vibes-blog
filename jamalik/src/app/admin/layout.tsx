import type { Metadata } from "next";

/** لوحة التحكم لا تُفهرَس مطلقًا — تأكيد على مستوى الميتا فوق ترويسات HTTP. */
export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s | لوحة تحكم جمالِك" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-canvas">{children}</div>;
}
