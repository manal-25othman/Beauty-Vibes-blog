"""مقارنة نصّ كل مقال محوَّل بنصّه في تصدير Blogger.

تُجرَّد الصيغتان إلى كلمات ثم تُقارَنان. الهدف إثبات أن التحويل لم يُسقط كلمة
ولم يضف كلمة — التغيير في التمثيل لا في المحتوى.
"""

import html
import json
import re
import unicodedata
from collections import Counter

raw = {p["title"]: p for p in json.load(open("scripts/blogger/raw.json"))["posts"]}
converted = json.load(open("scripts/blogger/out/articles.json"))

# نطاق ؀-ۿ يشمل علامات الترقيم العربية (، ؛ ؟) — استبعادها يمنع التصاقها بالكلمة.
PUNCT = re.compile(r"[،؛؟٪٫٬۔]")
WORD = re.compile(r"[^\W\d_]+", re.UNICODE)
TASHKEEL = re.compile(r"[ً-ْـ]")


def words(text: str) -> Counter:
    text = PUNCT.sub(" ", TASHKEEL.sub("", unicodedata.normalize("NFKC", text)))
    return Counter(WORD.findall(text))


def from_html(source: str) -> Counter:
    source = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", source, flags=re.S | re.I)
    source = re.sub(r"<img[^>]*>", " ", source, flags=re.I)          # الصور لا نصّ لها
    source = re.sub(r'<a[^>]*href="[^"]*"[^>]*>', " ", source, flags=re.I)  # عناوين الروابط
    source = re.sub(r"<[^>]+>", " ", source)
    return words(html.unescape(source))


def from_markdown(source: str) -> Counter:
    source = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", source)   # الصور
    source = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", source)  # نصّ الرابط دون عنوانه
    source = re.sub(r"^#{1,6}\s+", "", source, flags=re.M)
    source = re.sub(r"[*_`>]", " ", source)
    source = re.sub(r"^\s*[-+]\s+", "", source, flags=re.M)
    # الأرقام مستبعدة من المقارنة أصلًا: ترقيم القوائم سمةُ وسمٍ في HTML ونصٌّ في
    # Markdown، فاحتسابه يُظهر فروقًا وهمية.

    return words(source)

total_missing = total_added = 0
report = []

for article in converted:
    source = raw[article["title"]]
    before = from_html(source["html"])
    after = from_markdown(article["content"])

    missing = before - after
    added = after - before

    # الصور تُنقل إلى الغلاف، ونصّها البديل يُحفظ في حقل مستقل.
    alt = words(article["featuredImageAlt"])
    missing = missing - alt

    if missing or added:
        report.append({
            "title": article["title"][:55],
            "missing": dict(list(missing.items())[:8]),
            "added": dict(list(added.items())[:8]),
        })
    total_missing += sum(missing.values())
    total_added += sum(added.values())

print(f"مقالات مفحوصة: {len(converted)}")
print(f"كلمات ناقصة إجمالًا: {total_missing}")
print(f"كلمات زائدة إجمالًا: {total_added}")
print(f"مقالات فيها فرق: {len(report)}")
for item in report[:6]:
    print(f"\n— {item['title']}")
    if item["missing"]:
        print(f"   ناقص: {item['missing']}")
    if item["added"]:
        print(f"   زائد: {item['added']}")
