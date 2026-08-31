"""Convert a shaped text run into a single SVG path (outlines, no font needed)."""
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform


class Typesetter:
    def __init__(self, path):
        with open(path, "rb") as f:
            self.data = f.read()
        self.face = hb.Face(self.data)
        self.font = hb.Font(self.face)
        self.tt = TTFont(path)
        self.upem = self.face.upem
        self.glyphset = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()

    def run(self, text, size, tracking=0.0, features=None):
        """tracking in em units (e.g. 0.08 = 8% of size between glyphs)."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, features or {})
        scale = size / self.upem
        x = 0.0
        parts = []
        infos = buf.glyph_infos
        positions = buf.glyph_positions
        for i, (info, pos) in enumerate(zip(infos, positions)):
            name = self.order[info.codepoint]
            pen = SVGPathPen(self.glyphset, ntos=lambda v: f"{v:.2f}")
            tpen = TransformPen(pen, Transform(scale, 0, 0, -scale,
                                               x + pos.x_offset * scale,
                                               -pos.y_offset * scale))
            self.glyphset[name].draw(tpen)
            d = pen.getCommands()
            if d:
                parts.append(d)
            x += pos.x_advance * scale
            if i < len(infos) - 1:
                x += tracking * size
        return " ".join(parts), x

    def glyph_runs(self, text, size, tracking=0.0):
        """[(char, x_start, advance)] for each shaped glyph, at `size`."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, {})
        scale = size / self.upem
        x, out = 0.0, []
        infos, positions = buf.glyph_infos, buf.glyph_positions
        for i, (info, pos) in enumerate(zip(infos, positions)):
            adv = pos.x_advance * scale
            out.append((text[info.cluster], x, adv))
            x += adv
            if i < len(infos) - 1:
                x += tracking * size
        return out

    def bounds(self, text, size, tracking=0.0):
        """Ink box of a run, relative to the baseline origin: (x0, y0, x1, y1)."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, {})
        scale = size / self.upem
        x = 0.0
        bp = BoundsPen(self.glyphset)
        infos, positions = buf.glyph_infos, buf.glyph_positions
        for i, (info, pos) in enumerate(zip(infos, positions)):
            name = self.order[info.codepoint]
            tpen = TransformPen(bp, Transform(scale, 0, 0, -scale,
                                              x + pos.x_offset * scale,
                                              -pos.y_offset * scale))
            self.glyphset[name].draw(tpen)
            x += pos.x_advance * scale
            if i < len(infos) - 1:
                x += tracking * size
        return bp.bounds

    def metrics(self, size):
        hhea = self.tt["hhea"]
        os2 = self.tt["OS/2"]
        s = size / self.upem
        return {
            "ascender": hhea.ascender * s,
            "descender": hhea.descender * s,
            "capHeight": getattr(os2, "sCapHeight", 700) * s,
            "xHeight": getattr(os2, "sxHeight", 500) * s,
        }
