"""
توليد شعار Beauty Vibes كمسارات vector.

الحروف تُحوَّل إلى مسارات لا نصّ: ملفّ SVG يعتمد على خطّ مثبّت في جهاز
القارئ يظهر بخطّ آخر عند من لا يملكه — وهذا غير مقبول في شعار.
"""
import os

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

# الخطّ نفسه الذي يستخدمه الموقع، فالشعار والنصّ من عائلة واحدة.
FONT = os.environ.get("BV_LOGO_FONT", "jamalik/.next/static/media/5d6231e6818a3930-s.2vs72h_x6qrve.woff2")
INK   = "#211E1C"
CREAM = "#F7F2EC"
ROSE  = "#9B5C6B"
TRACK = 0.015          # تباعد الحرفين في الرمز

f = TTFont(FONT)
upem = f["head"].unitsPerEm
cmap = f.getBestCmap()
gs = f.getGlyphSet()
hmtx = f["hmtx"]


def run(text, tracking=0.0):
    """مسارات نصّ في وحدات الخطّ، مع عرضه الكلّي (بلا تباعد زائد في آخره)."""
    parts, x = [], 0.0
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(pen)
        d = pen.getCommands()
        if d:
            parts.append(f'<path transform="translate({x:.1f} 0)" d="{d}"/>')
        x += hmtx[g][0]
        if i < len(text) - 1:
            x += tracking * upem
    return "".join(parts), x


def group(text, size, x, baseline, fill, tracking=0.0, anchor="start"):
    paths, adv = run(text, tracking)
    k = size / upem
    w = adv * k
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    g = (f'<g fill="{fill}" transform="translate({x:.2f} {baseline:.2f}) '
         f'scale({k:.6f} {-k:.6f})">{paths}</g>')
    return g, w, x


def v_apex(size, tracking=TRACK):
    """
    إزاحة رأس الـ V السفلي عن يسار كلمة BV، بالبكسل.

    تُقرأ من حدود الحرف في الخطّ لا بالتقدير: رأس الـ V هو منتصف حبره أفقيًا،
    فأي تقريب هنا يزيح النقطة عن الرأس ويكشف نفسه فورًا عند التكبير.
    """
    gb, gv = cmap[ord("B")], cmap[ord("V")]
    bp = BoundsPen(gs); gs[gv].draw(bp)
    vmin, _, vmax, _ = bp.bounds
    offset = hmtx[gb][0] + tracking * upem + (vmin + vmax) / 2
    return offset * size / upem


def svg(w, h, body, bg=None):
    back = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" '
            f'width="{w:g}" height="{h:g}" role="img" aria-label="Beauty Vibes">'
            f'{back}{body}</svg>\n')


def wordmark(size, x, baseline, ink):
    """«Beauty ● Vibes» — يعيد (svg, العرض الكلّي)."""
    dot_r, gap = size * 0.115, size * 0.20
    g1, w1, _ = group("Beauty", size, x, baseline, ink)
    cx = x + w1 + gap + dot_r
    g2, w2, _ = group("Vibes", size, cx + dot_r + gap, baseline, ink)
    dot = f'<circle cx="{cx:.2f}" cy="{baseline - size*0.135:.2f}" r="{dot_r:.2f}" fill="{ROSE}"/>'
    return g1 + dot + g2, (w1 + gap + 2 * dot_r + gap + w2)


def monogram(size, cx_center, baseline, ink):
    """«BV» والنقطة تُكمل رأس الـ V — يعيد (svg, العرض)."""
    g, w, x0 = group("BV", size, cx_center, baseline, ink, tracking=TRACK, anchor="middle")
    r = size * 0.128
    dot = (f'<circle cx="{x0 + v_apex(size):.2f}" cy="{baseline - r*0.30:.2f}" '
           f'r="{r:.2f}" fill="{ROSE}"/>')
    return g + dot, w


# ----------------------------------------------------------------- المخرجات
def horizontal(ink, name):
    """الترويسة: الاسم وحده — عند ٣٦ بكسل لا مكان للحرفين فوقه."""
    H, S, PAD, BASE = 200.0, 132.0, 14.0, 148.0
    body, w = wordmark(S, PAD, BASE, ink)
    open(name, "w").write(svg(round(w + 2 * PAD, 1), H, body))


def stacked(ink, name):
    """التذييل وصور المشاركة والطباعة."""
    W, MS, WS = 1000.0, 300.0, 132.0
    m, _ = monogram(MS, W / 2, 300.0, ink)
    _, ww = wordmark(WS, 0, 0, ink)
    w, _ = wordmark(WS, W / 2 - ww / 2, 500.0, ink)
    open(name, "w").write(svg(W, 560.0, m + w))


def mark(ink, name, bg=None, size=512.0):
    body, _ = monogram(size * 0.46, size / 2, size * 0.60, ink)
    open(name, "w").write(svg(size, size, body, bg))


if __name__ == "__main__":
    import sys
    out = sys.argv[1].rstrip("/")
    horizontal(INK, f"{out}/logo.svg")
    horizontal(CREAM, f"{out}/logo-inverse.svg")
    stacked(INK, f"{out}/logo-full.svg")
    mark(INK, f"{out}/mark.svg")
    mark(CREAM, f"{out}/badge.svg", bg=INK)
    print("done")
