import { PrismaClient } from "@prisma/client";

/**
 * في وضع التطوير يعيد Next تحميل الوحدات عند كل تعديل، وإنشاء عميل Prisma
 * جديد في كل مرة يستنزف اتصالات قاعدة البيانات — لذلك نحتفظ به على globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
