"""Line-art mark for Beauty Vibes: a feminine profile crowned by a botanical branch.

Both contours are described by landmark points and interpolated with a Catmull-Rom
spline, so the drawing stays smooth and stays easy to tune. Everything is drawn in a
220 x 220 coordinate space; BOUNDS is the measured ink box of that drawing.
"""
import math

# --- palette ----------------------------------------------------------------
IVORY = "#FBF6EE"       # warm ivory ground
OLIVE = "#7C8752"       # muted olive green
OLIVE_DEEP = "#5E6740"  # olive, one-colour use
ROSE = "#C08B84"        # dusty rose
INK = "#494B3C"         # deep olive-grey, for type

BOX = 220.0
BOUNDS = (9.5, 26.0, 130.5, 157.0)   # x, y, w, h of the ink
RING = (76.0, 104.5, 97.0)         # badge ring: cx, cy, r


def spline(points, tension=1.0):
    """Catmull-Rom through `points`, emitted as cubic beziers."""
    p = [tuple(map(float, q)) for q in points]
    p = [p[0]] + p + [p[-1]]
    d = [f"M {p[1][0]:.2f} {p[1][1]:.2f}"]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension)
        d.append(f"C {c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}")
    return " ".join(d)


# --- the face, in profile, facing the wordmark ------------------------------
FACE_POINTS = [
    (82, 56),       # crown, where the branch takes over
    (104, 48),
    (121, 58),
    (129, 76),      # forehead
    (130, 92),
    (126, 101),     # brow
    (121.5, 107),   # bridge of the nose
    (130, 118),
    (140, 130),     # tip of the nose
    (130, 137.5),   # base of the nose
    (128, 142.5),   # philtrum
    (130.8, 147.5), # upper lip
    (128.6, 152),   # mouth
    (130.6, 156),   # lower lip
    (124.8, 163),   # chin crease
    (132.5, 171.5), # chin
    (124, 179),     # under the chin
]

# --- back of the head, drawn as a growing branch ----------------------------
STEM_POINTS = [
    (82, 56),
    (61, 64),
    (48, 85),
    (44, 112),
    (49, 142),
    (62, 165),
    (78, 176),
]

LEAVES = [
    # (x, y, angle_deg (y down, 0 = +x), length, width)
    (90, 51, 267, 25, 7.5),
    (73, 57, 241, 30, 9.0),
    (59, 71, 219, 33, 10.0),
    (48, 92, 198, 35, 10.5),
    (44.5, 119, 180, 35, 10.5),
    (50, 147, 161, 31, 9.5),
    (63, 168, 143, 25, 7.5),
]

# fewer, sturdier leaves for favicon sizes
LEAVES_SIMPLE = [
    (70, 60, 236, 33, 11.0),
    (49, 88, 200, 37, 12.5),
    (48, 128, 168, 36, 12.0),
    (62, 161, 145, 29, 9.5),
]


def leaf(x, y, angle, length, width, vein=True):
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)

    def p(u, v):
        return (x + u * ca - v * sa, y + u * sa + v * ca)

    f = lambda t: f"{t[0]:.2f} {t[1]:.2f}"
    q = [p(0, 0),
         p(length * 0.24, -width), p(length * 0.68, -width * 0.76), p(length, 0),
         p(length * 0.68, width * 0.76), p(length * 0.24, width), p(0, 0)]
    blade = (f"M {f(q[0])} C {f(q[1])} {f(q[2])} {f(q[3])} "
             f"C {f(q[4])} {f(q[5])} {f(q[6])} Z")
    if not vein:
        return [blade]
    return [blade, f"M {f(p(length * 0.14, 0))} L {f(p(length * 0.76, 0))}"]


def mark(stroke=0.8, rose=ROSE, olive=OLIVE, ring=False, ring_color=None, simple=False):
    """SVG fragment for the mark, in its own 220 x 220 coordinate space."""
    k = 1.65 if simple else 1.0
    o = ['<g fill="none" stroke-linecap="round" stroke-linejoin="round">']
    if ring:
        o.append(f'<circle cx="{RING[0]}" cy="{RING[1]}" r="{RING[2]}" '
                 f'stroke="{ring_color or olive}" stroke-width="{2.0 * stroke:.2f}" '
                 f'opacity="0.4"/>')
    stem = STEM_POINTS if not simple else STEM_POINTS[:-1] + [(74, 172)]
    o.append(f'<path d="{spline(stem)}" stroke="{olive}" '
             f'stroke-width="{3.1 * stroke * k:.2f}"/>')
    for lf in (LEAVES_SIMPLE if simple else LEAVES):
        d = leaf(*lf, vein=not simple)
        o.append(f'<path d="{d[0]}" stroke="{olive}" stroke-width="{2.4 * stroke * k:.2f}"/>')
        if len(d) > 1:
            o.append(f'<path d="{d[1]}" stroke="{olive}" '
                     f'stroke-width="{1.3 * stroke:.2f}" opacity="0.7"/>')
    o.append(f'<path d="{spline(FACE_POINTS)}" stroke="{rose}" '
             f'stroke-width="{4.0 * stroke * k:.2f}"/>')
    o.append('</g>')
    return "\n    ".join(o)
