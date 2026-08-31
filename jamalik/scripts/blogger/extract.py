"""استخراج تصدير Blogger (Atom 2018) إلى JSON خام — بلا أي تعديل على النص."""

import json
import sys
import xml.etree.ElementTree as ET

A = "{http://www.w3.org/2005/Atom}"
B = "{http://schemas.google.com/blogger/2018}"

root = ET.parse(sys.argv[1]).getroot()
out = {"blogTitle": (root.findtext(A + "title") or "").strip(), "posts": [], "pages": []}

for entry in root.findall(A + "entry"):
    kind = entry.findtext(B + "type")
    if kind not in ("POST", "PAGE"):
        continue
    author = entry.find(A + "author")
    record = {
        "id": entry.findtext(A + "id") or "",
        "status": entry.findtext(B + "status") or "",
        "title": (entry.findtext(A + "title") or "").strip(),
        "html": entry.findtext(A + "content") or "",
        "metaDescription": (entry.findtext(B + "metaDescription") or "").strip(),
        "author": (author.findtext(A + "name") if author is not None else "") or "",
        "published": entry.findtext(A + "published") or "",
        "updated": entry.findtext(A + "updated") or "",
        "filename": entry.findtext(B + "filename") or "",
        "labels": [c.get("term") for c in entry.findall(A + "category") if c.get("term")],
    }
    out["posts" if kind == "POST" else "pages"].append(record)

json.dump(out, open(sys.argv[2], "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(f"منشورات: {len(out['posts'])} | صفحات: {len(out['pages'])}")
