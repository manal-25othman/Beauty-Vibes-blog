"""Wrap an SVG fragment in a canvas sized to its own ink, measured in a browser."""
import json, os, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def measure(fragment):
    tmp = tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False, dir=HERE)
    tmp.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2000 -2000 4000 4000" '
              f'width="4000" height="4000"><g id="m">{fragment}</g></svg>')
    tmp.close()
    out = subprocess.run(["node", os.path.join(HERE, "measure.js"), tmp.name],
                         capture_output=True, text=True, check=True).stdout
    os.unlink(tmp.name)
    return json.loads(out)


def fit(fragment, pad, bg="#FBF6EE", label="Beauty Vibes", pad_y=None):
    b = measure(fragment)
    py = pad if pad_y is None else pad_y
    w, h = b["w"] + pad * 2, b["h"] + py * 2
    tx, ty = pad - b["x"], py - b["y"]
    ground = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">'
            f'<title>{label}</title>{ground}'
            f'<g transform="translate({tx:.2f} {ty:.2f})">{fragment}</g></svg>')
