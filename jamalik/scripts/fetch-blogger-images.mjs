/**
 * تنزيل صور المقالات المنقولة من Blogger إلى public/ قبل البناء.
 *
 * لماذا وقت البناء؟ لأن الموقع يجب ألّا يعتمد على خوادم Blogger في تقديم صوره
 * للزائرات: الاعتماد الخارجي يعني بطئًا لا نتحكّم به، وانكسارًا صامتًا لو حُذفت
 * المدونة الأصلية. بعد هذه الخطوة تُقدَّم الصور من نطاق الموقع نفسه.
 *
 * البناء لا يفشل إذا تعذّر تنزيل صورة: يُطبع تحذير، وتظهر الصورة النائبة
 * الخاصة بالتصنيف بدلًا منها. صورة ناقصة أهون من نشر معطّل.
 */

import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const MANIFEST = "scripts/blogger/out/images.json";
const PUBLIC = join(process.cwd(), "public");
const TIMEOUT_MS = 20_000;

if (!existsSync(MANIFEST)) {
  console.log("↷ لا سجلّ صور — تخطّي التنزيل.");
  process.exit(0);
}

const jobs = JSON.parse(readFileSync(MANIFEST, "utf8"));
let downloaded = 0;
let skipped = 0;
const failed = [];

for (const { remote, local } of jobs) {
  const target = join(PUBLIC, local);

  if (existsSync(target)) {
    skipped += 1;
    continue;
  }

  try {
    const response = await fetch(remote, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "jamalik-migration/1.0" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    mkdirSync(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
  } catch (error) {
    failed.push({ local, reason: error instanceof Error ? error.message : String(error) });
  }
}

console.log(`✓ صور المقالات: ${downloaded} نُزّلت، ${skipped} موجودة مسبقًا`);

if (failed.length) {
  console.warn(`⚠️  تعذّر تنزيل ${failed.length} صورة — ستظهر الصورة النائبة بدلًا منها:`);
  for (const item of failed) console.warn(`   ${item.local} — ${item.reason}`);
}
