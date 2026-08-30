#!/usr/bin/env python3
"""Generate the Beauty Vibes logo suite.

Every file is a self-contained SVG: the wordmark is converted to outlines, so the
artwork needs no fonts, no external assets and no rasterised elements.

    python3 generate.py [output-dir]
"""
import os
import sys
import urllib.request

import symbol as sym
from symbol import IVORY, OLIVE, OLIVE_DEEP, ROSE, INK
from textpath import Typesetter

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "assets"))

# Cormorant Garamond and Jost, both SIL Open Font License 1.1, fetched on demand
# and used only to draw the outlines baked into the finished SVGs.
FONTS = {
    "CormorantGaramond-Light.ttf":
        "https://fonts.gstatic.com/s/cormorantgaramond/v21/"
        "co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf",
    "Jost-Light.ttf":
        "https://fonts.gstatic.com/s/jost/v20/92zPtBhPNqw79Ij1E865zBUv7mz9JQVG.ttf",
}

WORD = "Beauty Vibes"
TAG = "BEAUTY & WELLNESS JOURNAL"

CAP = 96.0        # cap height of the wordmark
TAG_CAP = 17.0    # cap height of the tagline
WORD_TRACK = 0.028
TAG_TRACK = 0.30


def fonts():
    os.makedirs(FONT_DIR, exist_ok=True)
    for name, url in FONTS.items():
        path = os.path.join(FONT_DIR, name)
        if not os.path.exists(path):
            print("fetching", name)
            urllib.request.urlretrieve(url, path)
    return (Typesetter(os.path.join(FONT_DIR, "CormorantGaramond-Light.ttf")),
            Typesetter(os.path.join(FONT_DIR, "Jost-Light.ttf")))


serif, sans = fonts()
WORD_SIZE = CAP / serif.metrics(1.0)["capHeight"]
WORD_D, _ = serif.run(WORD, WORD_SIZE, WORD_TRACK)
WX0, WY0, WX1, WY1 = serif.bounds(WORD, WORD_SIZE, WORD_TRACK)
WORD_W = WX1 - WX0            # ink width
WORD_RISE = -WY0              # ink above the baseline
WORD_DROP = WY1               # descender below the baseline

TAG_SIZE = TAG_CAP / sans.metrics(1.0)["capHeight"]
TAG_D, _ = sans.run(TAG, TAG_SIZE, TAG_TRACK)
TX0, _, TX1, _ = sans.bounds(TAG, TAG_SIZE, TAG_TRACK)
TAG_W = TX1 - TX0

RULE_GAP = round(WORD_DROP + 22.0)     # clears the descender of the "y"
TAG_GAP = 26.0
TEXT_H = WORD_RISE + RULE_GAP + TAG_GAP + TAG_CAP   # ink top to tagline baseline

BX, BY, BW, BH = sym.BOUNDS
DESC = "Beauty Vibes — beauty and wellness journal"


def svg(w, h, body, ivory=True, label=DESC):
    ground = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{IVORY}"/>' if ivory else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">\n'
            f'  <title>{label}</title>\n  {ground}\n{body}\n</svg>')


def place_mark(x, y, height, stroke=0.8, **kw):
    """Draw the mark with its ink box at (x, y), scaled to `height`."""
    s = height / BH
    frag = sym.mark(stroke=stroke, **kw)
    return (f'  <g transform="translate({x - BX * s:.2f} {y - BY * s:.2f}) '
            f'scale({s:.4f})">\n    {frag}\n  </g>'), BW * s


def wordmark(x, baseline, ink=INK, olive=OLIVE, accent=ROSE):
    """Wordmark, hairline rule and tagline, aligned on measured ink. `x` is the
    left edge of the ink and `baseline` the wordmark baseline."""
    width = max(WORD_W, TAG_W)
    rule_y = baseline + RULE_GAP
    tag_base = rule_y + TAG_GAP + TAG_CAP
    return "\n".join([
        f'  <g transform="translate({x + (width - WORD_W) / 2 - WX0:.2f} {baseline:.2f})">'
        f'<path d="{WORD_D}" fill="{ink}"/></g>',
        f'  <path d="M {x:.2f} {rule_y:.2f} H {x + width:.2f}" stroke="{accent}" '
        f'stroke-width="1.4" fill="none" opacity="0.6"/>',
        f'  <g transform="translate({x + (width - TAG_W) / 2 - TX0:.2f} {tag_base:.2f})">'
        f'<path d="{TAG_D}" fill="{olive}"/></g>',
    ]), width


def horizontal(ivory=True, mono=None):
    """Primary lockup: mark left, wordmark right, balanced on a single axis."""
    pad, gap = 68.0, 36.0
    mark_h = 228.0
    ink, olive, rose = (mono, mono, mono) if mono else (INK, OLIVE, ROSE)
    h = pad * 2 + max(mark_h, TEXT_H)
    mark_svg, mark_w = place_mark(pad, (h - mark_h) / 2, mark_h,
                                  stroke=0.85, rose=rose, olive=olive)
    baseline = (h - TEXT_H) / 2 + WORD_RISE
    text_svg, text_w = wordmark(pad + mark_w + gap, baseline,
                                ink=ink, olive=olive, accent=rose)
    return svg(pad * 2 + mark_w + gap + text_w, h, mark_svg + "\n" + text_svg, ivory)


def compact(ivory=True, mono=None):
    """Small-size lockup: mark and wordmark only, for headers under ~70px tall."""
    pad, gap = 40.0, 30.0
    ink, olive, rose = (mono, mono, mono) if mono else (INK, OLIVE, ROSE)
    mark_h = WORD_RISE + WORD_DROP + 40.0
    h = pad * 2 + mark_h
    mark_svg, mark_w = place_mark(pad, pad, mark_h, stroke=0.9, rose=rose, olive=olive)
    baseline = pad + (mark_h - (WORD_RISE + WORD_DROP)) / 2 + WORD_RISE
    text = (f'  <g transform="translate({pad + mark_w + gap - WX0:.2f} {baseline:.2f})">'
            f'<path d="{WORD_D}" fill="{ink}"/></g>')
    return svg(pad * 2 + mark_w + gap + WORD_W, h, mark_svg + "\n" + text, ivory)


def stacked(ivory=True):
    """Centred lockup for square spaces: mark above the wordmark."""
    pad, gap = 68.0, 44.0
    mark_h = 212.0
    mark_w = BW / BH * mark_h
    text_w = max(WORD_W, TAG_W)
    w = pad * 2 + max(mark_w, text_w)
    h = pad * 2 + mark_h + gap + TEXT_H
    mark_svg, _ = place_mark((w - mark_w) / 2, pad, mark_h, stroke=0.85)
    text_svg, _ = wordmark((w - text_w) / 2, pad + mark_h + gap + WORD_RISE)
    return svg(w, h, mark_svg + "\n" + text_svg, ivory)


def mark_only(size=256.0, ivory=True, ring=False, simple=False, mono=None,
              padding=0.10):
    inner = size * (1 - 2 * padding)
    mark_h = inner if not ring else inner * BH / (sym.RING[2] * 2 + 4)
    s = mark_h / BH
    kw = dict(rose=mono or ROSE, olive=mono or OLIVE, ring=ring, simple=simple)
    if ring:
        # place by the ring, which is the outermost element
        r = sym.RING[2] * s
        cx = sym.RING[0] * s
        cy = sym.RING[1] * s
        body = (f'  <g transform="translate({size / 2 - cx:.2f} {size / 2 - cy:.2f}) '
                f'scale({s:.4f})">\n    {sym.mark(stroke=0.8, **kw)}\n  </g>')
    else:
        body, mw = place_mark((size - BW * s) / 2, (size - mark_h) / 2, mark_h,
                              stroke=0.8, **kw)
    return svg(size, size, body, ivory)


def write(name, content):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(content + "\n")
    print("  ", os.path.relpath(path, os.path.dirname(OUT)))


os.makedirs(OUT, exist_ok=True)
print("writing to", OUT)
write("beauty-vibes-logo-horizontal.svg", horizontal())
write("beauty-vibes-logo-horizontal-transparent.svg", horizontal(ivory=False))
write("beauty-vibes-logo-horizontal-olive.svg", horizontal(ivory=False, mono=OLIVE_DEEP))
write("beauty-vibes-logo-compact.svg", compact())
write("beauty-vibes-logo-compact-transparent.svg", compact(ivory=False))
write("beauty-vibes-logo-stacked.svg", stacked())
write("beauty-vibes-logo-stacked-transparent.svg", stacked(ivory=False))
write("beauty-vibes-mark.svg", mark_only())
write("beauty-vibes-mark-transparent.svg", mark_only(ivory=False))
write("beauty-vibes-badge.svg", mark_only(ring=True))
write("beauty-vibes-favicon.svg", mark_only(size=64.0, simple=True, padding=0.08))
