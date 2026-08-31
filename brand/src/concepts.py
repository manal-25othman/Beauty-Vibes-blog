"""Three alternative logo directions for Beauty Vibes."""
import math, os
from textpath import Typesetter
from fit import fit
from symbol import spline, leaf, IVORY, OLIVE, OLIVE_DEEP, ROSE, INK

import sys
OUT = sys.argv[1] if len(sys.argv) > 1 else "../out/concepts"
os.makedirs(OUT, exist_ok=True)
serif = Typesetter("fonts/CormorantGaramond-Light.ttf")
sans = Typesetter("fonts/Jost-Light.ttf")

CAP = 96.0
WSIZE = CAP / serif.metrics(1.0)["capHeight"]
WORD_D, _ = serif.run("Beauty Vibes", WSIZE, 0.028)
WX0, WY0, WX1, WY1 = serif.bounds("Beauty Vibes", WSIZE, 0.028)
WORD_W, RISE, DROP = WX1 - WX0, -WY0, WY1

TAG = "BEAUTY & WELLNESS JOURNAL"
TSIZE = 17.0 / sans.metrics(1.0)["capHeight"]
TAG_D, _ = sans.run(TAG, TSIZE, 0.30)
TX0, _, TX1, _ = sans.bounds(TAG, TSIZE, 0.30)
TAG_W = TX1 - TX0


def svg(w, h, body, bg=IVORY):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="Beauty Vibes">'
            f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>{body}</svg>')


def word(x, baseline, ink=INK):
    return (f'<g transform="translate({x - WX0:.2f} {baseline:.2f})">'
            f'<path d="{WORD_D}" fill="{ink}"/></g>')


def tagline(x, baseline, fill=OLIVE):
    return (f'<g transform="translate({x - TX0:.2f} {baseline:.2f})">'
            f'<path d="{TAG_D}" fill="{fill}"/></g>')


# ---------------------------------------------------------------- concept 1
# A single leaf whose inner edge is a face in profile: beauty growing from nature.
LEAF_SPINE_L = [(112, 22), (70, 58), (46, 110), (56, 162), (96, 198)]
LEAF_FACE_R = [
    (112, 22),      # tip of the leaf, which is also the crown
    (146, 60),
    (156, 92),      # forehead
    (152, 110),     # brow
    (146, 117),     # bridge of the nose
    (168, 138),     # nose
    (153, 146),     # base of the nose
    (150, 151),     # philtrum
    (155, 157),     # upper lip
    (151.5, 162),   # mouth
    (154.5, 167),   # lower lip
    (146, 174),     # chin crease
    (156, 183),     # chin
    (130, 195),
    (96, 198),      # base of the leaf
]
# veins: (start on the midrib, control, end near the edge)
LEAF_VEINS = [((107, 74), (90, 60), (72, 58)),
              ((104, 108), (82, 94), (58, 92)),
              ((100, 142), (78, 132), (56, 130)),
              ((97, 172), (80, 164), (64, 161))]


def mark_leafface(sw=1.0):
    o = ['<g fill="none" stroke-linecap="round" stroke-linejoin="round">']
    o.append(f'<path d="{spline(LEAF_SPINE_L)}" stroke="{OLIVE}" stroke-width="{3.2*sw:.2f}"/>')
    o.append(f'<path d="{spline(LEAF_FACE_R)}" stroke="{ROSE}" stroke-width="{3.8*sw:.2f}"/>')
    o.append(f'<path d="M 92 194 C 96 150 100 92 108 32" stroke="{OLIVE}" '
             f'stroke-width="{2.0*sw:.2f}" opacity="0.8"/>')
    for (a, c, b) in LEAF_VEINS:
        o.append(f'<path d="M {a[0]} {a[1]} Q {c[0]} {c[1]} {b[0]} {b[1]}" '
                 f'stroke="{OLIVE}" stroke-width="{1.6*sw:.2f}" opacity="0.6"/>')
    o.append('</g>')
    return "".join(o), (44.0, 20.0, 126.0, 180.0)   # ink box


# ---------------------------------------------------------------- concept 2
# An editorial seal: profile inside a hairline ring, laurel closing the base.
SEAL_FACE = [
    (92, 30), (114, 27), (131, 40), (137, 63), (133, 79), (128, 86),
    (137, 98), (147, 110), (136, 118), (133, 123), (137, 129), (134, 134),
    (137, 139), (129, 147), (138, 156), (126, 160), (109, 163),
]
SEAL_HAIR = [(92, 30), (73, 46), (64, 72), (66, 102), (76, 127), (92, 151), (109, 163)]
SEAL_STEM_L = [(44, 128), (49, 156), (66, 177), (94, 187)]
SEAL_STEM_R = [(166, 128), (161, 156), (144, 177), (116, 187)]
SEAL_LAUREL = [(47, 141, 232, 26, 8), (54, 165, 200, 28, 8.5), (74, 182, 172, 26, 8),
               (163, 141, 308, 26, 8), (156, 165, 340, 28, 8.5), (136, 182, 8, 26, 8)]


def mark_seal(sw=1.0):
    o = ['<g fill="none" stroke-linecap="round" stroke-linejoin="round">']
    o.append(f'<circle cx="105" cy="105" r="98" stroke="{OLIVE}" stroke-width="{2.0*sw:.2f}" opacity="0.55"/>')
    o.append(f'<circle cx="105" cy="105" r="90" stroke="{ROSE}" stroke-width="{1.1*sw:.2f}" opacity="0.45"/>')
    for st in (SEAL_STEM_L, SEAL_STEM_R):
        o.append(f'<path d="{spline(st)}" stroke="{OLIVE}" stroke-width="{2.2*sw:.2f}"/>')
    for lf in SEAL_LAUREL:
        d = leaf(*lf)
        o.append(f'<path d="{d[0]}" stroke="{OLIVE}" stroke-width="{2.0*sw:.2f}"/>')
    o.append(f'<path d="{spline(SEAL_HAIR)}" stroke="{OLIVE}" stroke-width="{2.8*sw:.2f}"/>')
    o.append(f'<path d="{spline(SEAL_FACE)}" stroke="{ROSE}" stroke-width="{3.6*sw:.2f}"/>')
    o.append('</g>')
    return "".join(o), (5.0, 5.0, 200.0, 200.0)


# ---------------------------------------------------------------- concept 3
# Type-led: the descender of the "y" keeps growing, into a leafed stem.
def sprig(x, y, sw=1.0, flip=False):
    """A stem sweeping left from (x, y) with three small leaves."""
    k = -1 if flip else 1
    pts = [(x, y), (x - 40 * k, y + 26), (x - 96 * k, y + 34), (x - 168 * k, y + 22)]
    o = [f'<path d="{spline(pts)}" stroke="{OLIVE}" stroke-width="{2.6*sw:.2f}" fill="none" '
         f'stroke-linecap="round"/>']
    for (lx, ly, ang, ln, wd) in [(x - 60 * k, y + 32, 200, 30, 9),
                                  (x - 108 * k, y + 33, 196, 34, 10),
                                  (x - 155 * k, y + 25, 186, 28, 8.5)]:
        d = leaf(lx, ly, ang, ln, wd)
        o.append(f'<path d="{d[0]}" stroke="{OLIVE}" stroke-width="{2.2*sw:.2f}" fill="none" '
                 f'stroke-linejoin="round"/>')
    return "".join(o)


# The face at the left, whose back of the head is the far end of the vine.
VINE_FACE = [
    (52, 24),       # crown
    (72, 17),
    (86, 27),
    (92, 46),       # forehead
    (93, 60),
    (89, 69),       # brow
    (85, 74),
    (92, 84),
    (100, 93),      # nose
    (92, 99),
    (90, 103),
    (93, 107),      # upper lip
    (91, 111),
    (93, 115),      # lower lip
    (88, 120),
    (95, 127),      # chin
    (88, 134),
]


def vine_face(face_h=176.0, sw=1.0, tail=(0.0, 0.0)):
    """The face at the left, plus the vine linking it to the "y" descender.

    Local coordinates: the crown of the head is the origin, and `tail` is where the
    vine leaves the descender, relative to that crown. The vine is one path — it
    sweeps under the wordmark, rises at the far left and becomes the back of the head.
    """
    s = face_h / 118.0
    P = lambda x, y: (x * s, y * s)
    face = spline([P(x - 52, y - 24) for x, y in VINE_FACE])
    span = tail[0] - P(30, 150)[0]
    stem = [tail,
            (tail[0] - span * 0.28, tail[1] + 46),
            (tail[0] - span * 0.62, tail[1] + 58),
            P(64, 152),
            P(14, 142),
            P(-22, 114),
            P(-33, 66),
            P(-22, 24),
            P(0, 0)]
    o = [f'<path d="{spline(stem)}" stroke="{OLIVE}" stroke-width="{2.8 * sw:.2f}" '
         f'fill="none" stroke-linecap="round"/>']
    for lf in [(tail[0] - span * 0.40, tail[1] + 56, 196, 42, 12.5),
               (tail[0] - span * 0.56, tail[1] + 60, 186, 37, 11),
               (P(-27, 40)[0], P(-27, 40)[1], 244, 46 * s, 13.5 * s),
               (P(-33, 82)[0], P(-33, 82)[1], 200, 52 * s, 15 * s)]:
        d = leaf(*lf)
        o.append(f'<path d="{d[0]}" stroke="{OLIVE}" stroke-width="{2.3 * sw:.2f}" '
                 f'fill="none" stroke-linejoin="round"/>')
    o.append(f'<path d="{face}" stroke="{ROSE}" stroke-width="{3.6 * sw:.2f}" fill="none" '
             f'stroke-linecap="round" stroke-linejoin="round"/>')
    return "".join(o)


# ------------------------------------------------------------------ lockups
def lockup(mark_fn, name, mark_h=210.0, gap=48.0, pad=68.0, rule=True):
    frag_fn = mark_fn
    frag, (bx, by, bw, bh) = frag_fn(1.0)
    s = mark_h / bh
    frag, _ = frag_fn(1 / s * 0.82)          # keep stroke weight optically even
    mark_w = bw * s
    rule_gap = round(DROP + 22)
    text_h = RISE + rule_gap + 26 + 17
    h = pad * 2 + max(mark_h, text_h)
    mx, my = pad, (h - mark_h) / 2
    tx = pad + mark_w + gap
    baseline = (h - text_h) / 2 + RISE
    tw = max(WORD_W, TAG_W)
    body = (f'<g transform="translate({mx - bx*s:.2f} {my - by*s:.2f}) scale({s:.4f})">{frag}</g>'
            + word(tx + (tw - WORD_W) / 2, baseline))
    if rule:
        ry = baseline + rule_gap
        body += (f'<path d="M {tx:.2f} {ry:.2f} H {tx+tw:.2f}" stroke="{ROSE}" '
                 f'stroke-width="1.4" opacity="0.6" fill="none"/>')
        body += tagline(tx + (tw - TAG_W) / 2, ry + 26 + 17)
    open(f"{OUT}/{name}.svg", "w").write(svg(pad * 2 + mark_w + gap + tw, h, body))
    print(name)


def typeled(name, bg=IVORY):
    """One continuous line: the wordmark, the vine it grows, and the face it becomes.

    The wordmark sits with its baseline at y = 0; the face hangs to its left.
    """
    face_h = 176.0
    gap = 76.0
    nose = 48.0 / 118.0 * face_h        # the nose is the rightmost point of the face
    runs = serif.glyph_runs("Beauty Vibes", WSIZE, 0.028)
    y_x = next(x for ch, x, adv in runs if ch == "y")
    y_adv = next(adv for ch, x, adv in runs if ch == "y")
    tail_abs = (-WX0 + y_x + y_adv * 0.32, DROP - 6)
    crown = (-(nose + gap), -(RISE + DROP) / 2 - 26)
    frag = (word(0, 0)
            + f'<g transform="translate({crown[0]:.2f} {crown[1]:.2f})">'
            + vine_face(face_h, 1.0,
                        tail=(tail_abs[0] - crown[0], tail_abs[1] - crown[1]))
            + '</g>')
    open(f"{OUT}/{name}.svg", "w").write(fit(frag, 66.0, bg=bg))
    print(name)


lockup(mark_leafface, "c1-leaf-face")
lockup(mark_seal, "c2-seal", mark_h=224.0, gap=44.0)
typeled("c3-type-led")
